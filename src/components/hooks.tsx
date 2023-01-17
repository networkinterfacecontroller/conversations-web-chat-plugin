import { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { Client, ConnectionState, Conversation, Message } from "@twilio/conversations";
import { ChatBookend, ChatBookendItem, ChatBubble, ChatMessage, MessageVariants, PartialIDChat, useChatLogger } from "@twilio-paste/chat-log";
import React from "react";

export const useConversations = () => {
    const [conversation, setConversation] = useState<Conversation>()
    const [client, setClient] = useState<Client>()
    let connected = false

    useEffect(() => {
        const initialize = async () => {
            //use uuid as identity for the token
            let token = (await axios.get('https://webchat-tester-8074.twil.io/token?identity=' + uid, {})).data
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
    const { chats, push } = useChatLogger(
        {
            content: (
                <ChatBookend>
                    <ChatBookendItem>
                        <strong>Chat Started</strong>・
                    </ChatBookendItem>
                </ChatBookend>
            )
        }
    );
    useEffect(() => {
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

