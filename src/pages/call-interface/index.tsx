import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Volume2, Loader2, PlayCircle, TestTube } from 'lucide-react';
import { getCallSessionById, updateCallSessionStatus } from '../../common/services/callSessionService';
import { websocketService } from '../../common/services/websocketService';
import { getUserById } from '../../common/services/userService';
import { useTwoFANotifications } from '../../common/context/TwoFANotificationContext';
import { supabase } from '../../common/config/supabase';
import type { BackendMessage, StatusChangeMessage, AudioStreamMessage } from '../../common/types/callMessages';

/**
 * Call Interface Page
 * 
 * Full-screen interface for AI voice call sessions.
 * Handles audio capture, playback, WebSocket communication, and call controls.
 */

interface CallInterfaceProps {}

const CallInterface = (_props: CallInterfaceProps) => {
  const { callSessionId } = useParams<{ callSessionId: string }>();
  const navigate = useNavigate();
  const { hasPendingRequests } = useTwoFANotifications();
  
  // State
  const [advisorName, setAdvisorName] = useState<string>('Your Advisor');
  const [status, setStatus] = useState<string>('Connecting...');
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [browserCompatible, setBrowserCompatible] = useState(true);
  
  // Audio refs
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioSequenceRef = useRef(0);
  const durationIntervalRef = useRef<number | null>(null);
  const audioPlaybackQueueRef = useRef<AudioBuffer[]>([]);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<Int16Array[]>([]);
  const silenceTimerRef = useRef<number | null>(null);
  const isEndingCallRef = useRef(false);

  /**
   * Check browser compatibility
   */
  useEffect(() => {
    const checkCompatibility = () => {
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasAudioContext = !!(window.AudioContext || (window as any).webkitAudioContext);
      const hasWebSocket = !!window.WebSocket;
      
      const compatible = hasGetUserMedia && hasAudioContext && hasWebSocket;
      setBrowserCompatible(compatible);
      
      if (!compatible) {
        setError('Your browser does not support required features for voice calls. Please use a modern browser like Chrome, Firefox, or Edge.');
      }
    };
    
    checkCompatibility();
  }, []);

  /**
   * Confirm before navigating away during active call
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (callSessionId && !error) {
        e.preventDefault();
        e.returnValue = 'You are currently in a call. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [callSessionId, error]);

  /**
   * Initialize call session and WebSocket connection
   */
  useEffect(() => {
    if (!callSessionId || !browserCompatible) {
      if (!callSessionId) {
        setError('No call session ID provided');
      }
      return;
    }

    // Prevent re-initialization if already connected (React Strict Mode protection)
    if (websocketService.isActive()) {
      console.log('⚠️ WebSocket already connected, skipping re-initialization');
      return;
    }

    let isCleanedUp = false;

    const initializeCall = async () => {
      try {
        // Fetch call session details
        const session = await getCallSessionById(callSessionId);
        if (!session || isCleanedUp) {
          if (!isCleanedUp && !session) {
            setError('Call session not found');
          }
          return;
        }

        // Fetch advisor name
        const advisor = await getUserById(session.advisor_id);
        if (advisor && !isCleanedUp) {
          setAdvisorName(advisor.full_name);
        }

        // Connect to WebSocket
        if (!isCleanedUp) {
          await websocketService.connect(callSessionId);
        }
        
        // Request microphone permission and start audio
        if (!isCleanedUp) {
          await startAudioCapture();
        }
        
        // Set up WebSocket message listeners
        if (!isCleanedUp) {
          websocketService.on('message', handleBackendMessage);
          websocketService.on('disconnected', handleWebSocketDisconnect);
          websocketService.on('error', handleWebSocketError);
        }

        // Update call status to in_progress in database
        if (!isCleanedUp) {
          await updateCallSessionStatus(callSessionId, 'in_progress');
        }
        
        // Send call accepted message
        if (!isCleanedUp) {
          websocketService.sendMessage({
            type: 'call_accepted',
            call_session_id: callSessionId,
            timestamp: Date.now(),
          });

          setStatus('Connected');
          setIsLoading(false);
          
          // Start duration timer
          startDurationTimer();
        }

      } catch (err) {
        if (!isCleanedUp) {
          console.error('Failed to initialize call:', err);
          setError('Failed to initialize call');
          setIsLoading(false);
        }
      }
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      isCleanedUp = true;
      stopAudioCapture();
      stopDurationTimer();
      websocketService.disconnect();
    };
  }, [callSessionId, browserCompatible]);

  /**
   * Subscribe to call session status changes via Supabase realtime
   */
  useEffect(() => {
    if (!callSessionId) return;

    console.log('🔔 Setting up realtime subscription for call status');

    const channel = supabase
      .channel(`call-status-${callSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_sessions',
          filter: `id=eq.${callSessionId}`,
        },
        (payload) => {
          console.log('📡 Call status updated:', payload);
          const updatedSession = payload.new as any;
          
          // If advisor ended the call, end it on client side too
          if (updatedSession.status === 'completed' || updatedSession.status === 'cancelled') {
            console.log('⚠️ Call ended by advisor, cleaning up...');
            setStatus(updatedSession.status === 'completed' 
              ? 'Call ended - Thank you' 
              : 'Call was ended');
            
            // Stop audio immediately
            stopAudioCapture().catch(console.error);
            stopDurationTimer();
            
            // Give user a moment to see the message, then navigate
            setTimeout(() => {
              navigate('/client/dashboard');
            }, 2000);
          }
        }
      )
      .subscribe((status) => {
        console.log('📊 Call status subscription:', status);
      });

    return () => {
      console.log('🔌 Unsubscribing from call status');
      supabase.removeChannel(channel);
    };
  }, [callSessionId]);

  /**
   * Prevent navigation away from call interface
   */
  useEffect(() => {
    // Warn before closing/refreshing page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You are currently in a call. Are you sure you want to leave?';
      return e.returnValue;
    };

    // Warn before using browser back button
    const handlePopState = () => {
      const confirmed = window.confirm(
        'You are currently in a call. Leaving will end the call. Are you sure?'
      );
      
      if (!confirmed) {
        // Push current state back to prevent navigation
        window.history.pushState(null, '', window.location.pathname);
      } else {
        // User confirmed, end call
        endCall();
      }
    };

    // Push initial state to detect back button
    window.history.pushState(null, '', window.location.pathname);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  /**
   * Start capturing audio from microphone
   */
  const startAudioCapture = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      audioStreamRef.current = stream;

      // Create audio context for processing
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      audioSourceNodeRef.current = source;
      
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      audioProcessorRef.current = processor;

      // Process audio chunks
      processor.onaudioprocess = (event) => {
        // Stop audio during mute OR during 2FA pending
        if (isMuted || hasPendingRequests) return;

        const inputData = event.inputBuffer.getChannelData(0);
        const audioData = convertFloat32ToInt16(inputData);

        // Calculate audio level (RMS) to detect speech vs silence
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const isSpeaking = rms > 0.01; // Silence threshold (adjust as needed)

        // Always buffer the audio
        audioBufferRef.current.push(audioData);

        if (isSpeaking) {
          // User is speaking - clear any pending silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else {
          // Silence detected - start timer if not already running
          if (!silenceTimerRef.current && audioBufferRef.current.length > 0) {
            silenceTimerRef.current = window.setTimeout(() => {
              // User stopped speaking for 400ms - send accumulated audio
              if (audioBufferRef.current.length > 0) {
                // Combine all buffered chunks
                const totalLength = audioBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
                const combinedBuffer = new Int16Array(totalLength);
                let offset = 0;
                
                for (const chunk of audioBufferRef.current) {
                  combinedBuffer.set(chunk, offset);
                  offset += chunk.length;
                }

                // Send combined buffer
                websocketService.sendAudioChunk(combinedBuffer.buffer as ArrayBuffer, audioSequenceRef.current++);
                
                // Clear buffer
                audioBufferRef.current = [];
              }
              
              silenceTimerRef.current = null;
            }, 1500); // Send after 1.5 seconds of silence (natural pause between sentences)
          }
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      console.log('✅ Audio capture started');
    } catch (err) {
      console.error('❌ Failed to access microphone:', err);
      setError('Microphone access denied. Please allow microphone permissions.');
      throw err;
    }
  };

  /**
   * Stop audio capture
   */
  const stopAudioCapture = async () => {
    console.log('🛑 Stopping audio capture...');
    
    // Disconnect source node FIRST to release microphone
    if (audioSourceNodeRef.current) {
      try {
        audioSourceNodeRef.current.disconnect();
        audioSourceNodeRef.current = null;
        console.log('✓ Source node disconnected');
      } catch (e) {
        console.error('Error disconnecting source node:', e);
      }
    }

    // Clear silence timer and flush any remaining audio
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    audioBufferRef.current = [];

    // Disconnect processor
    if (audioProcessorRef.current) {
      try {
        audioProcessorRef.current.disconnect();
        audioProcessorRef.current.onaudioprocess = null;
        audioProcessorRef.current = null;
        console.log('✓ Processor disconnected');
      } catch (e) {
        console.error('Error disconnecting processor:', e);
      }
    }

    // Stop all media tracks (this releases the microphone)
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => {
        console.log(`Stopping track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
        track.stop();
      });
      audioStreamRef.current = null;
      console.log('✓ Media tracks stopped');
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        await audioContextRef.current.close();
        audioContextRef.current = null;
        console.log('✓ Audio context closed');
      } catch (e) {
        console.error('Error closing audio context:', e);
      }
    }

    console.log('🔇 Audio capture stopped completely');
  };

  /**
   * Convert Float32Array to Int16Array
   */
  const convertFloat32ToInt16 = (float32Array: Float32Array): Int16Array => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  };

  /**
   * Handle incoming backend messages
   */
  const handleBackendMessage = (message: BackendMessage) => {
    switch (message.type) {
      case 'status_change':
        handleStatusChange(message);
        break;
      case 'audio_stream':
        handleAudioStream(message);
        break;
      case 'transcript_update':
        // Handle transcript updates (could display in UI)
        console.log('Transcript:', message.speaker, message.message);
        break;
      case 'error':
        setError(message.error_message);
        break;
    }
  };

  /**
   * Handle status change messages
   */
  const handleStatusChange = (message: StatusChangeMessage) => {
    setStatus(message.message || message.new_status);
    if ((message.new_status === 'completed' || message.new_status === 'cancelled') && !isEndingCallRef.current) {
      isEndingCallRef.current = true;
      endCall();
    }
  };

  /**
   * Handle audio stream from backend (AI voice)
   */
  const handleAudioStream = async (message: AudioStreamMessage) => {
    try {
      if (!message.audio_data) {
        console.error('❌ No audio_data in message');
        return;
      }
      
      // Decode base64 audio data
      const binaryString = window.atob(message.audio_data);
      const bytes = new Int16Array(binaryString.length / 2);
      
      // Convert binary string to Int16 PCM samples
      for (let i = 0; i < bytes.length; i++) {
        const byte1 = binaryString.charCodeAt(i * 2);
        const byte2 = binaryString.charCodeAt(i * 2 + 1);
        bytes[i] = (byte2 << 8) | byte1; // Little-endian Int16
      }

      // Create audio context if not exists (16kHz for 11Labs)
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }

      // Create audio buffer from raw PCM Int16 data
      const audioBuffer = audioContextRef.current.createBuffer(
        1, // mono
        bytes.length,
        16000 // 16kHz sample rate
      );
      
      // Convert Int16 to Float32 for Web Audio API
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < bytes.length; i++) {
        channelData[i] = bytes[i] / 32768.0; // Normalize to -1.0 to 1.0
      }
      
      // Add to playback queue
      audioPlaybackQueueRef.current.push(audioBuffer);
      
      // Start playback if not already playing
      if (!audioSourceRef.current) {
        playNextAudioChunk();
      }

    } catch (err) {
      console.error('❌ Failed to play audio:', err);
    }
  };

  /**
   * Play next audio chunk from queue
   */
  const playNextAudioChunk = () => {
    if (audioPlaybackQueueRef.current.length === 0) {
      audioSourceRef.current = null;
      return;
    }

    const audioBuffer = audioPlaybackQueueRef.current.shift()!;
    
    const source = audioContextRef.current!.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current!.destination);
    
    source.onended = () => {
      playNextAudioChunk();
    };
    
    source.start();
    audioSourceRef.current = source;
  };

  /**
   * Handle WebSocket disconnect
   */
  const handleWebSocketDisconnect = () => {
    setError('Connection lost. Attempting to reconnect...');
  };

  /**
   * Handle WebSocket error
   */
  const handleWebSocketError = (data: any) => {
    setError(data.error || 'Connection error');
  };

  /**
   * Toggle mute
   */
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };


  /**
   * Test Audio - Loopback test to verify microphone and speakers work
   */
  const testAudio = async () => {
    if (isTestingAudio) return;
    
    setIsTestingAudio(true);
    setStatus('Testing audio... Speak now!');
    
    try {
      // Record 2 seconds of audio
      const recordedChunks: Float32Array[] = [];
      let recordedSamples = 0;
      const targetSamples = 16000 * 2; // 2 seconds at 16kHz
      
      const tempProcessor = audioContextRef.current?.createScriptProcessor(2048, 1, 1);
      if (!tempProcessor || !audioContextRef.current) {
        throw new Error('Audio context not available');
      }
      
      const source = audioContextRef.current.createMediaStreamSource(audioStreamRef.current!);
      
      tempProcessor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        recordedChunks.push(new Float32Array(inputData));
        recordedSamples += inputData.length;
        
        if (recordedSamples >= targetSamples) {
          // Stop recording
          tempProcessor.disconnect();
          source.disconnect();
          
          // Combine all chunks
          const combinedAudio = new Float32Array(recordedSamples);
          let offset = 0;
          for (const chunk of recordedChunks) {
            combinedAudio.set(chunk, offset);
            offset += chunk.length;
          }
          
          // Play back the recorded audio
          setStatus('Playing back recorded audio...');
          const audioBuffer = audioContextRef.current!.createBuffer(1, combinedAudio.length, 16000);
          audioBuffer.getChannelData(0).set(combinedAudio);
          
          const playbackSource = audioContextRef.current!.createBufferSource();
          playbackSource.buffer = audioBuffer;
          playbackSource.connect(audioContextRef.current!.destination);
          
          playbackSource.onended = () => {
            setStatus('Audio test complete! ✅');
            setTimeout(() => {
              setStatus('Connected');
              setIsTestingAudio(false);
            }, 2000);
          };
          
          playbackSource.start();
        }
      };
      
      source.connect(tempProcessor);
      tempProcessor.connect(audioContextRef.current.destination);
      
    } catch (err) {
      console.error('Audio test failed:', err);
      setStatus('Audio test failed ❌');
      setTimeout(() => {
        setStatus('Connected');
        setIsTestingAudio(false);
      }, 2000);
    }
  };

  /**
   * Simulate AI Response - Mock backend response for testing
   * Only available in dev mode
   */
  const simulateAIResponse = () => {
    if (import.meta.env.VITE_DEV_MODE !== 'true') return;
    
    setStatus('AI is speaking...');
    
    // Simulate transcript update
    setTimeout(() => {
      console.log('📥 Simulated transcript: Hello! I\'m here to help you with your beneficiary information.');
    }, 500);
    
    // Simulate field extraction
    setTimeout(() => {
      console.log('📥 Simulated field extraction: Full Name - John Smith');
    }, 1500);
    
    // Simulate status change
    setTimeout(() => {
      setStatus('AI finished speaking');
      setTimeout(() => setStatus('Connected'), 2000);
    }, 3000);
    
    // Note: Audio playback would require actual audio file or TTS
    // For now, just simulate the messages
  };

  /**
   * End call
   */
  const endCall = async () => {
    // Prevent multiple calls
    if (isEndingCallRef.current) {
      console.log('⚠️ endCall already in progress, skipping');
      return;
    }
    isEndingCallRef.current = true;

    try {
      console.log('📞 Ending call...');
      
      // Remove WebSocket listeners FIRST to prevent more messages
      websocketService.off('message', handleBackendMessage);
      websocketService.off('disconnected', handleWebSocketDisconnect);
      websocketService.off('error', handleWebSocketError);

      // Stop duration timer
      stopDurationTimer();

      // Stop audio capture and wait for it
      await stopAudioCapture();

      // Send end call message and update database
      if (callSessionId) {
        websocketService.sendMessage({
          type: 'call_ended',
          call_session_id: callSessionId,
          reason: 'client_ended',
          timestamp: Date.now(),
        });

        // Update database - use 'cancelled' status since client ended the call
        await updateCallSessionStatus(callSessionId, 'cancelled').catch(console.error);
      }

      // Disconnect WebSocket
      websocketService.disconnect();

      console.log('✅ Call ended successfully');
      
      // Wait a brief moment to ensure all cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Navigate
      navigate('/client/dashboard');

    } catch (err) {
      console.error('Error ending call:', err);
      // Force cleanup and navigate
      await stopAudioCapture().catch(console.error);
      navigate('/client/dashboard');
    }
  };

  /**
   * Start duration timer
   */
  const startDurationTimer = () => {
    durationIntervalRef.current = window.setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  /**
   * Stop duration timer
   */
  const stopDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  /**
   * Format duration as MM:SS
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Connecting to call...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-pink-900 flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Call Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/client/dashboard')}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Main call interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex flex-col">
      {/* Header */}
      <motion.div
        className="p-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-blue-200 text-sm mb-2">Connected with</p>
        <h1 className="text-3xl font-bold text-white mb-1">{advisorName}</h1>
        <p className="text-blue-300 text-sm">{status}</p>
      </motion.div>

      {/* Middle - AI Avatar/Visual */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="relative"
          animate={{
            scale: isMuted ? 1 : [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Pulsing rings */}
          <AnimatePresence>
            {!isMuted && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-500/30"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-500/30"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Avatar Circle */}
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-2xl relative z-10">
            <Volume2 className="w-24 h-24 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Bottom - Controls */}
      <motion.div
        className="p-8 pb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Duration */}
        <div className="text-center mb-8">
          <p className="text-white text-2xl font-mono">{formatDuration(duration)}</p>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-6">
          {/* Mute Button */}
          <motion.button
            onClick={toggleMute}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMuted ? (
              <MicOff className="w-7 h-7 text-white" />
            ) : (
              <Mic className="w-7 h-7 text-white" />
            )}
          </motion.button>

          {/* End Call Button */}
          <motion.button
            onClick={endCall}
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-2xl transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </motion.button>

        </div>

        {/* Labels */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <p className="text-white/70 text-sm w-16 text-center">
            {isMuted ? 'Unmute' : 'Mute'}
          </p>
          <p className="text-white/70 text-sm w-20 text-center">End Call</p>
        </div>

        {/* Dev Mode Test Buttons */}
        <div className="mt-8 flex flex-col gap-3 max-w-md mx-auto">
          {/* Test Audio Button */}
          <motion.button
            onClick={testAudio}
            disabled={isTestingAudio}
            className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
            whileHover={{ scale: isTestingAudio ? 1 : 1.02 }}
            whileTap={{ scale: isTestingAudio ? 1 : 0.98 }}
          >
            <TestTube className="w-5 h-5" />
            {isTestingAudio ? 'Testing Audio...' : 'Test Audio (Loopback)'}
          </motion.button>

          {/* Simulate AI Response Button - Dev Mode Only */}
          {import.meta.env.VITE_DEV_MODE === 'true' && (
            <motion.button
              onClick={simulateAIResponse}
              className="w-full px-6 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-200 rounded-lg flex items-center justify-center gap-2 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlayCircle className="w-5 h-5" />
              Simulate AI Response (Dev)
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CallInterface;
