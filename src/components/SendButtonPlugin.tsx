import React from "react";
import { Box } from "@twilio-paste/box";
import { Button } from "@twilio-paste/button";
import { SendIcon } from "@twilio-paste/icons/esm/SendIcon";
import {
  useLexicalComposerContext,
  $getRoot
} from "@twilio-paste/lexical-library";
import { CLEAR_EDITOR_COMMAND } from "lexical";

export const SendButtonPlugin = ({ onClick }: any): JSX.Element => {
  const [editor] = useLexicalComposerContext();

  const handleSend = (): void => {
    onClick();

    // editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);

    editor.update(() => {
      $getRoot().clear();
    });
  };

  return (
    <Box position="absolute" top="space30" right="space30">
      <Button variant="primary_icon" size="reset" onClick={handleSend}>
        <SendIcon decorative={false} title="Send message" />
      </Button>
    </Box>
  );
};
