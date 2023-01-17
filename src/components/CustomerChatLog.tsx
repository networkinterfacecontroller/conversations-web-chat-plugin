import React from "react";
import { ChatLogger } from "@twilio-paste/chat-log";
import { ChatComposer } from "@twilio-paste/chat-composer";
import { Box } from "@twilio-paste/box";
import { AutoScrollPlugin, $getRoot } from "@twilio-paste/lexical-library";

import { SendButtonPlugin } from "./SendButtonPlugin";
import { Conversation} from "@twilio/conversations";
import { useMessages } from "./hooks";

export const CustomerChatLog: React.FC<{ conversation: Conversation }> = ({ conversation }) => {
  const scrollRef = React.createRef<HTMLDivElement>();
  const [message, setMessage] = React.useState("");
  const chats = useMessages(conversation);

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
              onClick={async () => {
                await conversation.sendMessage(message)
              }}
            />
          </>
        </ChatComposer>
      </Box>
    </Box>
  );
};
