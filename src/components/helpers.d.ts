import type { Chat } from "@twilio-paste/chat-log";
export declare const createNewMessage: (message: string) => Omit<Chat, "id">;
