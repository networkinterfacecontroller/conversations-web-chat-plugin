import React from 'react';
import {
    ChatMessage,
    ChatBubble,
    ChatMessageMeta,
    ChatMessageMetaItem
  } from "@twilio-paste/chat-log";
  import type { Chat } from "@twilio-paste/chat-log";
  
  export const createNewMessage = (message: string): Omit<Chat, "id"> => {
    const time = new Date().toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });
  
    return {
      variant: "outbound",
      content: (
        <ChatMessage variant="outbound">
          <ChatBubble>{message}</ChatBubble>
          <ChatMessageMeta aria-label={`said by you at ${time}`}>
            <ChatMessageMetaItem>{time}</ChatMessageMetaItem>
          </ChatMessageMeta>
        </ChatMessage>
      )
    };
  };
  