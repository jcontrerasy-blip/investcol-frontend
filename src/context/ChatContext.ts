import { createContext } from "react";
import type { UseChatResult } from "../hooks/useChat";

export type ChatContextValue = UseChatResult;

export const ChatContext = createContext<ChatContextValue | null>(null);