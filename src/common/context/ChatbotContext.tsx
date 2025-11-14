import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { sendChatMessage } from '../utils/openai';
import type { UserContext } from '../utils/openai';
import { findBestFAQMatch } from '../utils/faqMatcher';
import { useUser } from './UserContext';
import faqData from '../data/faqData.json';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source?: 'faq' | 'ai';
  confidence?: number;
}

interface ChatbotContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

// Load real FAQ data from faqData.json
const FAQ_DATA = faqData.faqs.map((faq: any) => ({
  question: faq.question,
  answer: faq.answer,
  category: faq.category
}));

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your CFS virtual assistant. I can help answer questions about superannuation, investments, and your account. How can I assist you today?",
      timestamp: new Date(),
      source: 'ai'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Step 1: Check FAQ for matches
      const faqMatch = findBestFAQMatch(messageContent, FAQ_DATA);

      let responseContent: string;
      let source: 'faq' | 'ai' = 'ai';
      let confidence: number | undefined;

      if (faqMatch && faqMatch.confidence >= 75) {
        // High confidence FAQ match
        responseContent = faqMatch.answer;
        source = 'faq';
        confidence = faqMatch.confidence;
      } else {
        // No good FAQ match, use OpenAI
        // Handle both mock user data and real DB user
        const userName = 'full_name' in user ? user.full_name : `${user.firstName} ${user.lastName}`;
        const userProducts = 'products' in user ? user.products.map((p: any) => p.name) : [];
        const portfolioVal = 'portfolio' in user ? user.portfolio.totalValue : 0;
        
        const context: UserContext = {
          name: userName || 'User',
          products: userProducts,
          portfolioValue: portfolioVal
        };

        const conversationHistory = messages
          .slice(-6) // Last 3 exchanges
          .map(msg => ({ role: msg.role, content: msg.content }));

        responseContent = await sendChatMessage(messageContent, context, conversationHistory);
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        source,
        confidence
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
        source: 'ai'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm your CFS virtual assistant. How can I assist you today?",
        timestamp: new Date(),
        source: 'ai'
      }
    ]);
  };

  const toggleChat = () => setIsOpen(!isOpen);
  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  return (
    <ChatbotContext.Provider
      value={{
        messages,
        isLoading,
        isOpen,
        sendMessage,
        clearMessages,
        toggleChat,
        openChat,
        closeChat
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};
