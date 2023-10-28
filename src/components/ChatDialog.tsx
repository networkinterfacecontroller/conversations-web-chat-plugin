import React from "react";
import {
  MinimizableDialog,
  MinimizableDialogButton,
  MinimizableDialogContainer,
  MinimizableDialogHeader,
  MinimizableDialogContent,
  useMinimizableDialogState
} from "@twilio-paste/minimizable-dialog";
import { HEADER_TEXT, DEFAULT_OPEN } from "../config";
import { ChatIcon } from "@twilio-paste/icons/esm/ChatIcon";

export const ChatDialog: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const dialog = useMinimizableDialogState({ visible: DEFAULT_OPEN });
  return (
    <MinimizableDialogContainer state={dialog}>
      {dialog.visible ? <MinimizableDialog aria-label={HEADER_TEXT}>
        <MinimizableDialogHeader>{HEADER_TEXT}</MinimizableDialogHeader>
        <MinimizableDialogContent>{children}</MinimizableDialogContent>
      </MinimizableDialog> : (
        <MinimizableDialogButton variant="primary" size="circle">
          <ChatIcon decorative={false} title="Chat" />
        </MinimizableDialogButton>
      )}
    </MinimizableDialogContainer>
  );
};
