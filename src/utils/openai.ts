import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Only for demo purposes
});

export interface UserContext {
  name: string;
  products: string[];
  portfolioValue: number;
}

export async function sendChatMessage(
  message: string,
  context: UserContext,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  try {
    // Build system prompt with user context
    const systemPrompt = `You are a helpful financial assistant for Colonial First State (CFS), a leading Australian financial services provider.

User Context:
- Name: ${context.name}
- Portfolio Value: $${context.portfolioValue.toLocaleString()}
- Products: ${context.products.join(', ')}

Guidelines:
- Be professional, friendly, and concise
- Focus on superannuation, investments, and financial planning
- Provide accurate information about CFS products and services
- If you don't know something, admit it and suggest contacting CFS support
- Keep responses under 150 words
- Use Australian spelling and terminology

Important: You cannot access real account data or perform transactions. For account-specific queries, direct users to log in or contact CFS directly.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 400,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    });

    return response.choices[0].message.content || 'I apologize, but I could not generate a response. Please try again.';
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    if (error?.status === 401) {
      return 'OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.';
    }
    
    if (error?.status === 429) {
      return 'API rate limit exceeded. Please wait a moment and try again.';
    }
    
    return 'I encountered an error processing your request. Please try again later.';
  }
}
