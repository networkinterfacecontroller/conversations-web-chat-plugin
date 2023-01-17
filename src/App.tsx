import React from "react";

import { Box } from "@twilio-paste/box";
import { SkeletonLoader } from "@twilio-paste/skeleton-loader";
import { ChatDialog } from "./components/ChatDialog";
import { CustomerChatLog } from "./components/CustomerChatLog";

import { useConversations } from './components/hooks';



export const App = () => {
  const conversation = useConversations()
  return (
    <Box position="absolute" bottom="space70" right="space70">
      <ChatDialog>
        {conversation ? (
          <CustomerChatLog conversation={conversation} />
        ) : (
          <Box padding={"space30"}>
            <SkeletonLoader borderRadius={"borderRadius0"} />
          </Box>
        )}
      </ChatDialog>
    </Box>
  );
};