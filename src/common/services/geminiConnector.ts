/**
 * Google Gemini AI Connector (Fallback - Future)
 * 
 * Connects to local or cloud Gemini backend for AI conversation processing.
 * Used as fallback or alternative AI backend for beneficiary data extraction.
 * 
 * **Backend Integration**: All code commented out until backend integration phase.
 * Uncomment when VITE_GEMINI_API_KEY or local Gemini backend is available.
 */

/* TODO: Backend Integration - Uncomment when Gemini backend is ready

interface GeminiConfig {
  apiKey?: string;
  backendUrl?: string;
  model?: string;
}

interface GeminiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GeminiResponse {
  text: string;
  extractedFields?: Record<string, any>;
  confidence?: number;
}

class GeminiConnector {
  private apiKey?: string;
  private backendUrl?: string;
  private model: string;
  private conversationHistory: GeminiMessage[] = [];

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.backendUrl = config.backendUrl || import.meta.env.VITE_GEMINI_BACKEND_URL;
    this.model = config.model || 'gemini-pro';
  }

  **
   * Send message to Gemini and get response
   * @param message - User message
   * @param systemPrompt - Optional system prompt for context
   *
  async sendMessage(
    message: string,
    systemPrompt?: string
  ): Promise<GeminiResponse> {
    try {
      // Add message to history
      this.conversationHistory.push({
        role: 'user',
        content: message,
      });

      // Prepare request
      const requestBody = {
        model: this.model,
        messages: systemPrompt
          ? [{ role: 'system', content: systemPrompt }, ...this.conversationHistory]
          : this.conversationHistory,
        temperature: 0.7,
        max_tokens: 1024,
      };

      // Send to backend or direct API
      const endpoint = this.backendUrl
        ? `${this.backendUrl}/chat`
        : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Parse response (format varies by backend)
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || data.text || '';
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: responseText,
      });

      return {
        text: responseText,
        extractedFields: data.extractedFields,
        confidence: data.confidence,
      };

    } catch (error) {
      console.error('Failed to send message to Gemini:', error);
      throw error;
    }
  }

  **
   * Extract structured data from conversation
   * @param transcript - Conversation transcript
   * @param schema - Expected data schema
   *
  async extractData(
    transcript: string,
    schema: Record<string, string>
  ): Promise<Record<string, any>> {
    try {
      const systemPrompt = `Extract the following fields from the conversation:
${Object.entries(schema).map(([key, desc]) => `- ${key}: ${desc}`).join('\n')}

Return the extracted data as JSON.`;

      const response = await this.sendMessage(transcript, systemPrompt);
      
      // Parse JSON from response
      try {
        const extracted = JSON.parse(response.text);
        return extracted;
      } catch {
        // If response is not JSON, try to extract fields manually
        return response.extractedFields || {};
      }

    } catch (error) {
      console.error('Failed to extract data:', error);
      throw error;
    }
  }

  **
   * Stream response from Gemini (for real-time conversation)
   * @param message - User message
   * @param onChunk - Callback for each text chunk
   *
  async streamMessage(
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      this.conversationHistory.push({
        role: 'user',
        content: message,
      });

      const endpoint = this.backendUrl
        ? `${this.backendUrl}/chat/stream`
        : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.model,
          messages: this.conversationHistory,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        onChunk(chunk);
      }

      // Add full response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse,
      });

    } catch (error) {
      console.error('Failed to stream message from Gemini:', error);
      throw error;
    }
  }

  **
   * Clear conversation history
   *
  clearHistory(): void {
    this.conversationHistory = [];
  }

  **
   * Get conversation history
   *
  getHistory(): GeminiMessage[] {
    return [...this.conversationHistory];
  }
}

**
 * Create Gemini connector instance
 * Uses environment variables for configuration
 *
export const createGeminiConnector = (): GeminiConnector => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const backendUrl = import.meta.env.VITE_GEMINI_BACKEND_URL;

  if (!apiKey && !backendUrl) {
    throw new Error(
      'Gemini API key or backend URL must be set in environment variables'
    );
  }

  return new GeminiConnector({
    apiKey,
    backendUrl,
  });
};

export default GeminiConnector;

*/

// Placeholder export for development
export const geminiConnector = {
  sendMessage: async (_message: string, _systemPrompt?: string): Promise<any> => {
    console.log('🤖 Gemini connector not initialized (code commented out)');
    return { text: '', extractedFields: {}, confidence: 0 };
  },
  extractData: async (
    _transcript: string,
    _schema: Record<string, string>
  ): Promise<Record<string, any>> => {
    console.log('🤖 Gemini data extraction not initialized (code commented out)');
    return {};
  },
  streamMessage: async (
    _message: string,
    _onChunk: (chunk: string) => void
  ): Promise<void> => {
    console.log('🤖 Gemini streaming not initialized (code commented out)');
  },
  clearHistory: (): void => {
    console.log('🤖 Gemini history not initialized (code commented out)');
  },
  getHistory: (): any[] => {
    console.log('🤖 Gemini history not initialized (code commented out)');
    return [];
  },
};
