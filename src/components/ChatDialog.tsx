import React from "react";
import {
  MinimizableDialog,
  MinimizableDialogButton,
  MinimizableDialogContainer,
  MinimizableDialogHeader,
  MinimizableDialogContent,
  useMinimizableDialogState
} from "@twilio-paste/minimizable-dialog";
import { HEADER_TEXT } from "../config";
import { ChatIcon } from "@twilio-paste/icons/esm/ChatIcon";

export const ChatDialog: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const dialog = useMinimizableDialogState({ visible: true });
  return (
    <MinimizableDialogContainer state={dialog}>
      {dialog.visible ? null : (
        <MinimizableDialogButton variant="primary" size="circle">
          <ChatIcon decorative={false} title="Chat" />
        </MinimizableDialogButton>
      )}
      <MinimizableDialog aria-label={HEADER_TEXT}>
        <MinimizableDialogHeader>{HEADER_TEXT}</MinimizableDialogHeader>
        <MinimizableDialogContent>{children}</MinimizableDialogContent>
      </MinimizableDialog>
    </MinimizableDialogContainer>
  );
};
