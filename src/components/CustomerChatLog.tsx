import React from "react";
import {
  useChatLogger,
  ChatLogger,
  ChatBookend,
  ChatBookendItem,
  ChatMessage,
  ChatBubble,
  ChatMessageMeta,
  ChatMessageMetaItem
} from "@twilio-paste/chat-log";
import { ChatComposer } from "@twilio-paste/chat-composer";
import { Box } from "@twilio-paste/box";
import { AutoScrollPlugin, $getRoot } from "@twilio-paste/lexical-library";

import { SendButtonPlugin } from "./SendButtonPlugin";
import { createNewMessage } from "./helpers";

export const CustomerChatLog: React.FC = () => {
  const scrollRef = React.createRef<HTMLDivElement>();
  const { chats, push } = useChatLogger(
    {
      content: (
        <ChatBookend>
          <ChatBookendItem>Yesterday</ChatBookendItem>
          <ChatBookendItem>
            <strong>Chat Started</strong>・3:34 PM
          </ChatBookendItem>
        </ChatBookend>
      )
    },
    {
      variant: "inbound",
      content: (
        <ChatMessage variant="inbound">
          <ChatBubble>Howdy!</ChatBubble>
          <ChatMessageMeta aria-label="said by Gibby Radki at 3:45 PM">
            <ChatMessageMetaItem>Gibby Radki・3:45 PM</ChatMessageMetaItem>
          </ChatMessageMeta>
        </ChatMessage>
      )
    }
  );
  const [message, setMessage] = React.useState("");

  const handleComposerChange = (editorState: any): void => {
    editorState.read(() => {
      const text = $getRoot().getTextContent();
      setMessage(text);
    });
  };

  return (
    <Box minHeight="size50" display="grid" gridTemplateRows="1fr auto">
      <Box overflowY="scroll" maxHeight="size50" tabIndex={0}>
        <ChatLogger chats={chats} />
      </Box>
      <Box
        ref={scrollRef}
        borderStyle="solid"
        borderWidth="borderWidth0"
        borderTopWidth="borderWidth10"
        borderColor="colorBorderWeak"
        display="flex"
        flexDirection="row"
        columnGap="space30"
        paddingX="space70"
        paddingY="space50"
      >
        <ChatComposer
          maxHeight="size10"
          config={{
            namespace: "foo",
            onError: (error: Error) => {
              throw error;
            }
          }}
          ariaLabel="Message"
          placeholder="Type here..."
          onChange={handleComposerChange}
        >
          <>
            <AutoScrollPlugin scrollRef={scrollRef} />
            <SendButtonPlugin
              onClick={() => {
                push(createNewMessage(message));
              }}
            />
          </>
        </ChatComposer>
      </Box>
    </Box>
  );
};
