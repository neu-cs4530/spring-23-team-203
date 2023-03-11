import React, { createContext, useEffect, useRef, useState } from 'react';
import TextConversation from '../../../../../classes/TextConversation';
import useTownController from '../../../../../hooks/useTownController';
import { ChatMessage } from '../../../../../types/CoveyTownSocket';

type ServiceContextType = {
  isChatWindowOpen: boolean;
  setIsChatWindowOpen: (isChatWindowOpen: boolean) => void;
  isPollsWindowOpen: boolean;
  setIsPollsWindowOpen: (isPollsWindowOpen: boolean) => void;
  hasUnreadMessages: boolean;
  messages: ChatMessage[];
  conversation: TextConversation | null;
};

export const ServiceContext = createContext<ServiceContextType>(null!);

export const ServiceProvider: React.FC = ({ children }) => {
  const coveyTownController = useTownController();
  const isChatWindowOpenRef = useRef(false);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const isPollsWindowOpenRef = useRef(false);
  const [isPollsWindowOpen, setIsPollsWindowOpen] = useState(false);
  const [conversation, setConversation] = useState<TextConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    if (conversation) {
      const handleMessageAdded = (message: ChatMessage) =>
        setMessages(oldMessages => [...oldMessages, message]);
      //TODO - store entire message queue on server?
      // conversation.getMessages().then(newMessages => setMessages(newMessages.items));
      conversation.onMessageAdded(handleMessageAdded);
      return () => {
        conversation.offMessageAdded(handleMessageAdded);
      };
    }
  }, [conversation]);

  useEffect(() => {
    // If the chat window is closed and there are new messages, set hasUnreadMessages to true
    if (!isChatWindowOpenRef.current && messages.length) {
      setHasUnreadMessages(true);
    }
  }, [messages]);

  useEffect(() => {
    isChatWindowOpenRef.current = isChatWindowOpen;
    if (isChatWindowOpen) setHasUnreadMessages(false);
  }, [isChatWindowOpen]);

  useEffect(() => {
    isPollsWindowOpenRef.current = isPollsWindowOpen;
  }, [isPollsWindowOpen]);

  useEffect(() => {
    const conv = new TextConversation(coveyTownController);
    setConversation(conv);
    return () => {
      conv.close();
    };
  }, [coveyTownController, setConversation]);

  return (
    <ServiceContext.Provider
      value={{
        isChatWindowOpen,
        setIsChatWindowOpen,
        isPollsWindowOpen,
        setIsPollsWindowOpen,
        hasUnreadMessages,
        messages,
        conversation,
      }}>
      {children}
    </ServiceContext.Provider>
  );
};
