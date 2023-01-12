import { Box } from "@twilio-paste/box";
import { Theme } from "@twilio-paste/theme";
import React from "react";

import { ChatDialog } from "./components/ChatDialog";
import { CustomerChatLog } from "./components/CustomerChatLog";

export const App = () => {
  return (
    <Box position="absolute" bottom="space70" right="space70">
      <ChatDialog>
        <CustomerChatLog />
      </ChatDialog>
    </Box>
  );
};