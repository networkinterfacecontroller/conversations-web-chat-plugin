import React from "react";
import { useEffect } from "react";
import { ChatLogger } from "@twilio-paste/chat-log";
import { ChatComposer } from "@twilio-paste/chat-composer";
import { Box } from "@twilio-paste/box";
import { SkeletonLoader } from "@twilio-paste/skeleton-loader";
import {  
    $getRoot,
    ClearEditorPlugin,
    useLexicalComposerContext,
    CLEAR_EDITOR_COMMAND,
    COMMAND_PRIORITY_HIGH,
    KEY_ENTER_COMMAND, 
  } from "@twilio-paste/lexical-library";

import { SendButtonPlugin } from "./SendButtonPlugin";
import { useMessages, useConversations } from "./hooks";

const EnterKeySubmitPlugin = ({ onKeyDown }: { onKeyDown: () => void }): null => {
  const [editor] = useLexicalComposerContext();

  const handleEnterKey = React.useCallback(
    (event: KeyboardEvent) => {
      const { shiftKey, ctrlKey } = event;
      if (shiftKey || ctrlKey) return false;
      event.preventDefault();
      event.stopPropagation();
      onKeyDown();
      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
      return true;
    },
    [editor, onKeyDown],
  );

  useEffect(() => {
    return editor.registerCommand(KEY_ENTER_COMMAND, handleEnterKey, COMMAND_PRIORITY_HIGH);
  }, [editor, handleEnterKey]);
  return null;
};


export const CustomerChatLog: React.FC = () => {
  const [message, setMessage] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const loggerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const conversation = useConversations();
  const chats = useMessages(conversation);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !loggerRef.current) return;
    scrollerRef.current?.scrollTo({ top: loggerRef.current.scrollHeight, behavior: "smooth" });
  }, [chats, mounted]);


  const handleComposerChange = (editorState: any): void => {
    editorState.read(() => {
      const text = $getRoot().getTextContent();
      setMessage(text);
    });
  };

  if (!conversation) {
    return (
      <Box padding={"space30"}>
        <SkeletonLoader borderRadius={"borderRadius0"} />
      </Box>
      );}

  return (
    <Box minHeight="size50" display="grid" gridTemplateRows="1fr auto">
      <Box ref={scrollerRef} overflowX="hidden" overflowY="scroll" maxHeight="size50" tabIndex={0}>
          <ChatLogger ref={loggerRef} chats={chats} />
      </Box>
      <Box
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
          <ClearEditorPlugin />
          <EnterKeySubmitPlugin
            onKeyDown={async () => {
              await conversation.sendMessage(message)
            }}
          />
          <SendButtonPlugin
            onClick={async () => {
              await conversation.sendMessage(message)
            }}
          />
        </ChatComposer>
      </Box>
    </Box>
  );
};
