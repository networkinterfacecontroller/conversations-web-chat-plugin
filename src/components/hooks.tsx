import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { Client, Conversation, Message } from "@twilio/conversations";
import { ChatBookend, ChatBookendItem, ChatBubble, ChatMessage, MessageVariants, PartialIDChat, useChatLogger } from "@twilio-paste/chat-log";
import { format } from "date-fns";
import { CHAT_START_DATE_FORMAT, CHAT_START_TEXT } from "../config";
import React from "react";

export const useConversations = () => {
    const [conversation, setConversation] = useState<Conversation>()
    const [client, setClient] = useState<Client>()
    const tokenUrl = process.env.REACT_APP_TOKEN_SERVICE_URL
    let connected = false

    useEffect(() => {
        const initialize = async () => {
            try {
                
                // Get or create and set the user's uuid
                const uid = localStorage.getItem('webchat-uuid') || uuid();
                localStorage.setItem('webchat-uuid', uid)

                // Use the uuid as the user's identity for the token
                const response = await axios.get(`${tokenUrl}?identity=${uid}`)
                const token = response.data
                const newClient = new Client(token)
                setClient(newClient)
            } catch (error) {
                console.error('Error initializing client:', error);
            }
        }

        initialize();
    }, [])


    useEffect(() => {
        if (!client) return;

        const handleConnectionStateChanged = async (state: string) => {
            try {
	            if (state == 'connected' && !connected) {
	                let sid = localStorage.getItem('webchat-sid')
	                let conversation
	                if (!(sid)) {
	                    conversation = await client.createConversation()
	                    await conversation.join()
	                    localStorage.setItem('webchat-sid', conversation.sid)
	                } else {
	                    conversation = await client.getConversationBySid(sid)
	                }
	                setConversation(conversation)
	            }
	            connected = true;
            } catch (error) {
                console.error('Error handling connection state change:', error);
            }
        }

        client.on('connectionStateChanged', handleConnectionStateChanged);

        return () => {
           client.off('connectionStateChanged', handleConnectionStateChanged); 
        }
    }, [client]);

    return conversation;
}

const chatBuilder = (message: Message): PartialIDChat => {
    const uid = localStorage.getItem('webchat-uuid')
    let variant: MessageVariants
    if (uid == message.author) {
        variant = 'outbound'
    } else { variant = 'inbound' }
    return {
        variant,
        content: (
            <ChatMessage variant={variant}>
                <ChatBubble>{message.body}</ChatBubble>
            </ChatMessage>
        )
    }
}

export const useMessages = (conversation: Conversation | undefined) => {       
    const { chats, push } = useChatLogger();

    const getDateTime = () => {
        let storedDate = localStorage.getItem('chatStartDate');
        if (!storedDate) {
          storedDate = new Date().toString();
          localStorage.setItem('chatStartDate', storedDate);
        }
        return format(new Date(storedDate), CHAT_START_DATE_FORMAT);
      };
    
    const dateTime = useMemo(() => getDateTime(), []);

    useEffect(() => {
        if (!conversation) return;

        push({
            content: (
            <ChatBookend>
                <ChatBookendItem>
                <strong>{CHAT_START_TEXT}{dateTime}</strong>
                </ChatBookendItem>
            </ChatBookend>
            )
        });
        
        const getHistory = async () => {
            try {
	            let paginator = await conversation.getMessages(undefined, undefined, 'forward')
	            let history: Message[] = []
	            do {
	                history = [ ...history, ...paginator.items]
	                
	                if (paginator.hasNextPage) { 
	                    paginator = await paginator.nextPage() 
	                }
	            } while (paginator.hasNextPage)
	            
	            history.forEach(message => {
	                push(chatBuilder(message))
	            })
            } catch (error) {
                console.error("Error fetching message history:", error);
            }
        }
        getHistory();

        const messageAddedHandler = (message: Message) => {
            push(chatBuilder(message))
        }

        conversation.on('messageAdded', messageAddedHandler);

        return () => {
            conversation.off('messageAdded', messageAddedHandler)
        }

    }, [conversation])

    return chats
}

