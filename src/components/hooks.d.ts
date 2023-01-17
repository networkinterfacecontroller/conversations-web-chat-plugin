import { Conversation } from "@twilio/conversations";
export declare const useConversations: () => Conversation | undefined;
export declare const useMessages: (conversation: Conversation) => import("@twilio-paste/chat-log").Chat[];
