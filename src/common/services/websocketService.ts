import type { 
  ClientMessage, 
  BackendMessage,
  AudioChunkMessage
} from '../types/callMessages';

/**
 * WebSocket Service for AI Call System
 * 
 * Manages WebSocket connection to backend for real-time audio streaming
 * and message passing during call sessions.
 * 
 * FEATURE FLAG PATTERN:
 * - When VITE_DEV_MODE='true' or no WebSocket URL, returns mock connection
 * - Mock connection simulates responses without actual network calls
 * - Real WebSocket code is ready to uncomment when backend is available
 */

type EventType = 'message' | 'connected' | 'disconnected' | 'error';
type EventHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<EventType, EventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private heartbeatInterval: number | null = null;
  private callSessionId: string | null = null;
  private isManualDisconnect = false;
  private isConnected = false;

  /**
   * Connect to WebSocket backend or return mock connection
   */
  async connect(callSessionId: string): Promise<void> {
    this.callSessionId = callSessionId;
    
    // Check if dev mode or no WebSocket URL configured
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    const devMode = import.meta.env.VITE_DEV_MODE === 'true';
    
    if (devMode || !wsUrl) {
      console.log('🔧 DEV MODE: Using mock WebSocket connection');
      return this.createMockConnection(callSessionId);
    }

    // Real WebSocket connection (commented out for now)
    return this.connectRealWebSocket(wsUrl, callSessionId);
  }

  /**
   * Create a mock WebSocket connection for development
   */
  private createMockConnection(callSessionId: string): Promise<void> {
    console.log(`📞 Mock WebSocket: Connected to call session ${callSessionId}`);
    
    // Simulate connection delay
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.emit('connected', { callSessionId });
        
        // Simulate backend messages for testing
        if (import.meta.env.VITE_ENABLE_AUDIO_LOOPBACK === 'true') {
          console.log('🔊 Mock: Audio loopback enabled');
        }
        
        resolve();
      }, 500);
    });
  }

  /**
   * Real WebSocket connection implementation
   * TODO: Backend Integration - Uncomment when backend URL is available
   */
  private connectRealWebSocket(wsUrl: string, callSessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Construct WebSocket URL with session ID
        const url = `${wsUrl}?session_id=${callSessionId}`;
        console.log(`🔌 Connecting to WebSocket: ${url}`);
        
        this.ws = new WebSocket(url);
        
        // Connection opened
        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.startHeartbeat();
          this.emit('connected', { callSessionId });
          resolve();
        };
        
        // Listen for messages
        this.ws.onmessage = (event) => {
          try {
            // Handle binary data (audio)
            if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
              this.handleBinaryMessage(event.data);
            } else {
              // Handle JSON messages
              const message = JSON.parse(event.data) as BackendMessage;
              this.handleBackendMessage(message);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        // Connection closed
        this.ws.onclose = (event) => {
          console.log('❌ WebSocket disconnected', event.code, event.reason);
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });
          
          // Attempt reconnection if not manual disconnect
          if (!this.isManualDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };
        
        // Connection error
        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.emit('error', { error: 'WebSocket connection error' });
          reject(error);
        };
        
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isManualDisconnect = true;
    this.isConnected = false;
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Client disconnected');
    }
    
    this.stopHeartbeat();
    this.ws = null;
    this.callSessionId = null;
    
    // Clear all listeners to prevent further events
    this.listeners.clear();
    
    console.log('🔌 WebSocket disconnected');
  }

  /**
   * Send audio chunk to backend
   */
  sendAudioChunk(audioData: ArrayBuffer, sequence: number): void {
    // In dev mode, don't actually send
    if (import.meta.env.VITE_DEV_MODE === 'true' || !this.ws) {
      // Enable audio loopback for testing if configured
      if (import.meta.env.VITE_ENABLE_AUDIO_LOOPBACK === 'true') {
        // Simulate receiving the same audio back
        setTimeout(() => {
          this.emit('message', {
            type: 'audio_stream',
            call_session_id: this.callSessionId!,
            audio_data: this.arrayBufferToBase64(audioData),
            timestamp: Date.now(),
            sequence,
          });
        }, 100);
      }
      return;
    }

    // Real WebSocket: Send binary audio data
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Create audio chunk message
      const message: AudioChunkMessage = {
        type: 'audio_chunk',
        call_session_id: this.callSessionId!,
        audio_data: this.arrayBufferToBase64(audioData),
        timestamp: Date.now(),
        sequence,
      };
      
      // Send as binary with metadata header
      const metadata = JSON.stringify({
        type: message.type,
        call_session_id: message.call_session_id,
        timestamp: message.timestamp,
        sequence: message.sequence,
      });
      
      const metadataBytes = new TextEncoder().encode(metadata);
      const metadataLength = new Uint32Array([metadataBytes.length]);
      
      // Combine: [metadata_length][metadata][audio_data]
      const combined = new Uint8Array(
        metadataLength.byteLength + metadataBytes.length + audioData.byteLength
      );
      combined.set(new Uint8Array(metadataLength.buffer), 0);
      combined.set(metadataBytes, metadataLength.byteLength);
      combined.set(new Uint8Array(audioData), metadataLength.byteLength + metadataBytes.length);
      
      this.ws.send(combined.buffer);
    }
  }

  /**
   * Send control or status message to backend
   */
  sendMessage(message: ClientMessage): void {
    // In dev mode, just log
    if (import.meta.env.VITE_DEV_MODE === 'true' || !this.ws) {
      console.log('📤 Mock: Sending message', message.type);
      
      // Simulate backend responses for testing
      this.simulateMockResponse(message);
      return;
    }

    // Real WebSocket: Send JSON message
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Register event listener
   */
  on(eventType: EventType, handler: EventHandler): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(handler);
  }

  /**
   * Remove event listener
   */
  off(eventType: EventType, handler: EventHandler): void {
    if (this.listeners.has(eventType)) {
      const handlers = this.listeners.get(eventType)!;
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all registered listeners
   */
  private emit(eventType: EventType, data?: any): void {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)!.forEach(handler => handler(data));
    }
  }

  /**
   * Handle binary message (audio from backend)
   */
  private handleBinaryMessage(data: ArrayBuffer | Blob): void {
    if (data instanceof Blob) {
      data.arrayBuffer().then(buffer => {
        this.emit('message', {
          type: 'audio_chunk',
          audio_data: buffer,
        });
      });
    } else {
      this.emit('message', {
        type: 'audio_chunk',
        audio_data: data,
      });
    }
  }

  /**
   * Handle JSON message from backend
   */
  private handleBackendMessage(message: BackendMessage): void {
    console.log('📥 Backend message:', message.type);
    this.emit('message', message);
  }

  /**
   * Simulate mock responses for testing
   */
  private simulateMockResponse(message: ClientMessage): void {
    // Don't send mock responses if disconnected
    if (!this.isConnected) {
      console.log('⚠️ Mock: Skipping response - service is disconnected');
      return;
    }

    // Simulate different backend responses based on message type
    setTimeout(() => {
      // Double-check we're still connected after timeout
      if (!this.isConnected) {
        console.log('⚠️ Mock: Skipping delayed response - service disconnected during timeout');
        return;
      }

      switch (message.type) {
        case 'call_accepted':
          this.emit('message', {
            type: 'status_change',
            call_session_id: message.call_session_id,
            new_status: 'in_progress',
            message: 'AI is listening...',
            timestamp: Date.now(),
          });
          break;
          
        case 'call_ended':
          this.emit('message', {
            type: 'status_change',
            call_session_id: message.call_session_id,
            new_status: 'completed',
            message: 'Call ended',
            timestamp: Date.now(),
          });
          break;
      }
    }, 300);
  }

  /**
   * Convert ArrayBuffer to Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      if (this.callSessionId) {
        this.connect(this.callSessionId).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, this.reconnectDelay);
    
    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
  }

  /**
   * Check if service is active
   */
  isActive(): boolean {
    if (import.meta.env.VITE_DEV_MODE === 'true') {
      return this.isConnected && this.callSessionId !== null;
    }
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
