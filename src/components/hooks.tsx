import { useEffect, useState } from "react";
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
    let connected = false
    const tokenUrl = ''

    useEffect(() => {
        const initialize = async () => {
            //use uuid as identity for the token
            let token = (await axios.get(tokenUrl + '?identity=' + uid, {})).data
            let client = new Client(token)
            setClient(client)

        }
        //retrieving unique id per browser
        //this functions as a pseudoanonymous identifier for the human on the other end of the webchat
        //create if it doesn't exist
        let uid = localStorage.getItem('webchat-uuid')
        if (!(uid)) {
            uid = uuid()
            localStorage.setItem('webchat-uuid', uid)
        }

        initialize();
    }, [])

    // Set the conversations if there is one, otherwise creates a new conversation.
    client?.on('connectionStateChanged', (state) => {
        if (state == 'connected' && (!(connected))) {
            const getConversation = async () => {
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
            connected = true
            getConversation()
        }
    });

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

export const useMessages = (conversation: Conversation) => {   
    const { chats, push } = useChatLogger();

    const getDateTime = () => {
        const storedDate = localStorage.getItem('chatStartDate');
        if (storedDate) {
            return format(new Date(storedDate), CHAT_START_DATE_FORMAT);
        } else {
            const now = new Date();
            localStorage.setItem('chatStartDate', now.toString());
            return format(now, CHAT_START_DATE_FORMAT);
        }
    };
    
    const dateTime = getDateTime();

    useEffect(() => {
        
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
            let paginator = await conversation.getMessages(undefined, undefined, 'forward')
            let more: boolean
            let history: Message[] = []
            do {
                paginator.items.forEach(message => {
                    history.push(message)
                })
                more = paginator.hasNextPage
                if (more) { paginator.nextPage() }
            } while (more)
            history.forEach(message => {
                push(chatBuilder(message))
            })
        }
        getHistory();
        conversation.on('messageAdded', message => {
            push(chatBuilder(message))
        })
    }, [])

    return chats
}

