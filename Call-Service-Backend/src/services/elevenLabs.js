const WebSocket = require('ws');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

/**
 * Manages connection to 11Labs Conversational AI Agent
 * Handles bidirectional audio streaming and message passing
 */
class ElevenLabsAgent {
  constructor(callSessionId, onMessage, onError, onClose) {
    this.callSessionId = callSessionId;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onClose = onClose;
    this.ws = null;
    this.isConnected = false;
    this.isClosed = false;
  }

  /**
   * Connect to 11Labs Conversational AI WebSocket
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // 11Labs Conversational AI WebSocket endpoint
        const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${ELEVENLABS_AGENT_ID}`;

        console.log(`🔌 Connecting to 11Labs agent for call: ${this.callSessionId}`);

        this.ws = new WebSocket(wsUrl, {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY
          }
        });

        this.ws.on('open', () => {
          this.isConnected = true;
          console.log(`✅ Connected to 11Labs agent: ${this.callSessionId}`);
          console.log(`🔑 Using Agent ID: ${ELEVENLABS_AGENT_ID}`);
          console.log(`🎙️ Ready to send audio (no init message needed for Conversational AI)`);
          
          // No initialization message needed - Conversational AI is ready immediately
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            // Try to parse as JSON (control messages)
            const message = JSON.parse(data.toString());
            console.log(`📥 11Labs message: ${message.type}`);
            
            // Handle audio in the correct 11Labs format
            if (message.type === 'audio' && message.audio_event?.audio_base_64) {
              // 11Labs sends audio as base64 in audio_event.audio_base_64
              const audioBuffer = Buffer.from(message.audio_event.audio_base_64, 'base64');
              console.log(`🔊 Decoded audio: ${audioBuffer.length} bytes (event_id: ${message.audio_event.event_id})`);
              this.onMessage({ 
                type: 'audio', 
                audio_data: audioBuffer
              });
            } else {
              this.onMessage(message);
            }
          } catch {
            // Binary audio data (raw PCM) - wrap Buffer in proper structure
            console.log(`📥 11Labs message: audio (binary, ${data.length} bytes)`);
            this.onMessage({ 
              type: 'audio', 
              audio_data: data  // data is a Buffer
            });
          }
        });

        this.ws.on('error', (error) => {
          console.error(`❌ 11Labs WebSocket error:`, error.message);
          if (this.onError) this.onError(error);
        });

        this.ws.on('close', (code, reason) => {
          this.isConnected = false;
          console.log(`🔌 11Labs disconnected [${code}]: ${reason}`);
          if (this.onClose) this.onClose();
        });

      } catch (error) {
        console.error('Failed to create 11Labs connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Send audio to 11Labs agent
   * Conversational AI expects JSON messages with Base64-encoded PCM audio
   */
  sendAudio(audioBuffer) {
    if (this.isClosed) {
      return; // Silent return if already closed
    }
    
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      // Convert Buffer to Base64 and send as JSON
      const base64Audio = audioBuffer.toString('base64');
      this.ws.send(JSON.stringify({
        user_audio_chunk: base64Audio
      }));
    } else {
      console.warn(`⚠️ Cannot send audio - 11Labs not connected (ws: ${!!this.ws}, connected: ${this.isConnected}, readyState: ${this.ws?.readyState})`);
    }
  }

  /**
   * Send control message to agent
   */
  sendMessage(message) {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Close connection gracefully
   */
  close() {
    if (this.ws && !this.isClosed) {
      this.isClosed = true;
      this.isConnected = false;
      
      console.log(`🔌 Closing 11Labs connection: ${this.callSessionId}`);
      
      // Set a timeout to force terminate if close doesn't complete
      const forceCloseTimeout = setTimeout(() => {
        if (this.ws) {
          console.log(`⚠️ Force terminating 11Labs connection: ${this.callSessionId}`);
          this.ws.terminate();
          this.ws = null;
        }
      }, 2000); // 2 second timeout
      
      // Remove all listeners to prevent memory leaks
      this.ws.removeAllListeners();
      
      // Add a close listener just for cleanup
      this.ws.once('close', () => {
        clearTimeout(forceCloseTimeout);
        console.log(`✅ 11Labs connection closed successfully: ${this.callSessionId}`);
        this.ws = null;
      });
      
      // Close WebSocket connection
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Call ended');
      } else {
        // Already closed or closing
        clearTimeout(forceCloseTimeout);
        this.ws = null;
      }
    }
  }
}

module.exports = ElevenLabsAgent;
