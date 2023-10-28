import React from "react";

import { Box } from "@twilio-paste/box";
import { SkeletonLoader } from "@twilio-paste/skeleton-loader";
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