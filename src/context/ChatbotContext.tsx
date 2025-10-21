import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { sendChatMessage } from '../utils/openai';
import type { UserContext } from '../utils/openai';
import { findBestFAQMatch } from '../utils/faqMatcher';
import { useUser } from './UserContext';

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

// Sample FAQ data (in a real app, this would come from FAQ.json or API)
const FAQ_DATA = [
  {
    question: "What is superannuation?",
    answer: "Superannuation (or 'super') is a long-term savings plan designed to help you save for retirement. Your employer contributes a percentage of your salary into your super account, and you can make additional voluntary contributions. Super is taxed at a concessional rate of 15%, making it one of the most tax-effective ways to save for retirement.",
    category: "Superannuation Basics"
  },
  {
    question: "How do I check my super balance?",
    answer: "You can check your super balance by logging into your CFS account online or through our mobile app. Navigate to the Dashboard to see your current balance, recent transactions, and investment performance. You can also request a statement by contacting our support team.",
    category: "Account Management"
  },
  {
    question: "Can I make extra contributions to my super?",
    answer: "Yes! You can make voluntary contributions to boost your retirement savings. There are two types: concessional (before-tax) and non-concessional (after-tax) contributions. For 2024-25, you can contribute up to $30,000 in concessional contributions and $120,000 in non-concessional contributions annually. Additional contributions may also provide tax benefits.",
    category: "Contributions"
  },
  {
    question: "How do I change my investment options?",
    answer: "To change your investment options, log into your account and navigate to the 'Investment Options' section. You can switch between different investment strategies (Conservative, Balanced, Growth, etc.) based on your risk tolerance and retirement timeline. Changes typically take 3-5 business days to process.",
    category: "Investments"
  },
  {
    question: "When can I access my super?",
    answer: "You can generally access your super when you reach your preservation age (between 55-60 depending on your birth year) and retire. Early access is only available in limited circumstances such as severe financial hardship, compassionate grounds, terminal illness, or permanent incapacity. Contact us for specific eligibility requirements.",
    category: "Retirement"
  }
];

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
        const context: UserContext = {
          name: `${user.firstName} ${user.lastName}`,
          products: user.products.map(p => p.name),
          portfolioValue: user.portfolio.totalValue
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
