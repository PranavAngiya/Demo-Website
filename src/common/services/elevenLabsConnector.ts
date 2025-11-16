/**
 * ElevenLabs Text-to-Speech Connector
 * 
 * Converts text to natural-sounding speech using ElevenLabs API.
 * Used for AI voice responses during call sessions.
 * 
 * **Backend Integration**: All code commented out until backend integration phase.
 * Uncomment when VITE_ELEVEN_LABS_API_KEY is available.
 */

/* TODO: Backend Integration - Uncomment when ElevenLabs API key is available

interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
}

class ElevenLabsConnector {
  private apiKey: string;
  private voiceId: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private config: Partial<ElevenLabsConfig>;

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
    this.voiceId = config.voiceId;
    this.config = {
      model: config.model || 'eleven_monolingual_v1',
      stability: config.stability || 0.5,
      similarityBoost: config.similarityBoost || 0.75,
    };
  }

  **
   * Convert text to speech
   * @param text - Text to convert to speech
   * @returns Audio data as ArrayBuffer
   *
  async textToSpeech(text: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${this.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: this.config.model,
            voice_settings: {
              stability: this.config.stability,
              similarity_boost: this.config.similarityBoost,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioData = await response.arrayBuffer();
      return audioData;

    } catch (error) {
      console.error('Failed to convert text to speech:', error);
      throw error;
    }
  }

  **
   * Stream text to speech (for real-time responses)
   * @param text - Text to convert
   * @param onChunk - Callback for each audio chunk
   *
  async streamTextToSpeech(
    text: string,
    onChunk: (chunk: Uint8Array) => void
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${this.voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: this.config.model,
            voice_settings: {
              stability: this.config.stability,
              similarity_boost: this.config.similarityBoost,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        onChunk(value);
      }

    } catch (error) {
      console.error('Failed to stream text to speech:', error);
      throw error;
    }
  }

  **
   * Get available voices
   *
  async getVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices;

    } catch (error) {
      console.error('Failed to get voices:', error);
      throw error;
    }
  }

  **
   * Get voice settings
   *
  async getVoiceSettings(voiceId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/voices/${voiceId}/settings`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Failed to get voice settings:', error);
      throw error;
    }
  }
}

**
 * Create ElevenLabs connector instance
 * Uses environment variables for configuration
 *
export const createElevenLabsConnector = (): ElevenLabsConnector => {
  const apiKey = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
  const voiceId = import.meta.env.VITE_ELEVEN_LABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    throw new Error(
      'ElevenLabs API key and voice ID must be set in environment variables'
    );
  }

  return new ElevenLabsConnector({
    apiKey,
    voiceId,
  });
};

export default ElevenLabsConnector;

*/

// Placeholder export for development
export const elevenLabsConnector = {
  textToSpeech: async (_text: string): Promise<ArrayBuffer> => {
    console.log('📢 ElevenLabs connector not initialized (code commented out)');
    return new ArrayBuffer(0);
  },
  streamTextToSpeech: async (
    _text: string,
    _onChunk: (chunk: Uint8Array) => void
  ): Promise<void> => {
    console.log('📢 ElevenLabs streaming not initialized (code commented out)');
  },
  getVoices: async (): Promise<any[]> => {
    console.log('📢 ElevenLabs voices not initialized (code commented out)');
    return [];
  },
};
