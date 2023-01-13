import { useEffect, useState } from "react";
import { Box } from "@twilio-paste/box";
import { Spinner } from "@twilio-paste/spinner"
import { Theme } from "@twilio-paste/theme";
import React from "react";
import axios from "axios";


import { getConversationParticipants, getToken } from "./api";

import {
  Message,
  Conversation,
  Participant,
  Client,
  ConnectionState,
  Paginator,
} from "@twilio/conversations";

import { ChatDialog } from "./components/ChatDialog";
import { CustomerChatLog } from "./components/CustomerChatLog";


export const App = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const username  = "";
  const password = "";
  const [connectionState, setConnectionState] = useState<ConnectionState>();
  const [client, setClient] = useState<Client>();
  const [conversation, setConversation] = useState<Conversation>()
  const [participants, setParticipants ] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [clientIteration, setClientIteration] = useState(0);


  useEffect(() => {

    const getToken = async () => {
      const requestAddress = "";
      const response = await axios.get(requestAddress, {
        params: { identity: username, password: password },
      });
      setToken(response.data);
    }
   
    getToken().catch(console.error)

    const client = new Client(token);
    setClient(client);

    client.on('initialized', () => {
      console.log("Client On")
      
      
      // Fetches existing conversations or creates a new one.
      const setUpConversation = async (friendlyName: string) => {
          const conversationSID = localStorage.getItem("conversationSID");
          if (conversationSID) {
            const ourConversation = await client.getConversationBySid(conversationSID);
            setConversation(ourConversation);
          } else {
            const newConversation = await client.createConversation({
              friendlyName: friendlyName
            });
            localStorage.setItem("conversationSID", newConversation.sid);
            setConversation(newConversation);
          }
      } 
      
      // Gets all messages for the conversation
      const getMessages = async () => {
        const allMessages = await conversation?.getMessages()
        setMessages(allMessages?.items || []);
      }

      setUpConversation("Widget Conversation").catch(console.error);
      getMessages();
    })

    client.on("messageAdded", (message: Message) => {
      setMessages(allMessages => [...allMessages, message]);
      
      // if (message.author === localStorage.getItem("username")) {
      //   clearAttachments(message.conversation.sid, "-1");
      //   Maybe mark inbound / outbound variant here? 
      // } 
    });

    client.on("connectionStateChanged", (state) => {
      setConnectionState(state);
    });

    setLoading(false);

    return () => {
      client?.removeAllListeners();
    };
  }, []); /// add client iterration

  if (loading) {
    return (
    <Box position="absolute" bottom="space70" right="space70">
      <ChatDialog>
        <Spinner size="sizeIcon110" decorative={false} title="Loading" />
      </ChatDialog>
    </Box>
    );
  }

  return (
    <Box position="absolute" bottom="space70" right="space70">
      <ChatDialog>
        <CustomerChatLog messages={messages}/>
      </ChatDialog>
    </Box>
  );
};