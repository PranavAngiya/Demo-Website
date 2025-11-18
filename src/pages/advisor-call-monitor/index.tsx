import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Phone, PhoneOff, User, Package, Clock,
  CheckCircle, Circle, AlertCircle, Loader2, ExternalLink,
  MessageSquare, FileText, Shield, Database, Check, X, Wand2, Trash2
} from 'lucide-react';
import {
  getCallSessionById,
  updateCallSessionStatus,
  type CallSession
} from '../../common/services/callSessionService';
import { getUserById } from '../../common/services/userService';
import { getProductById } from '../../common/services/productService';
import { addTranscriptMessage } from '../../common/services/transcriptService';
import { updateDraftBeneficiary, createDraftBeneficiary } from '../../common/services/draftBeneficiaryService';
import { supabase } from '../../common/config/supabase';
import { useToast } from '../../common/context/ToastContext';

/**
 * Advisor Call Monitoring Dashboard
 * 
 * Real-time monitoring interface for AI voice call sessions.
 * Shows progress, transcript, field extraction, and call controls.
 */

const AdvisorCallMonitor = () => {
  const { callSessionId } = useParams<{ callSessionId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // State
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [clientName, setClientName] = useState<string>('Client');
  const [productName, setProductName] = useState<string>('Product');
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [draftFields, setDraftFields] = useState<Record<string, any>>({});
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  // Refs
  const durationIntervalRef = useRef<number | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  
  /**
   * Load call session and related data
   */
  useEffect(() => {
    if (!callSessionId) {
      showToast('No call session ID provided', 'error');
      navigate('/advisor/clients');
      return;
    }

    const loadCallData = async () => {
      try {
        setIsLoading(true);

        // Fetch call session
        const session = await getCallSessionById(callSessionId);
        if (!session) {
          showToast('Call session not found', 'error');
          navigate('/advisor/clients');
          return;
        }
        setCallSession(session);

        // Fetch client info
        const client = await getUserById(session.client_id);
        if (client) {
          setClientName(client.full_name);
        }

        // Fetch product info (if product_id exists)
        if (session.product_id) {
          if (session.product_type === 'superannuation') {
            // Fetch from superannuation_accounts
            const { data, error } = await supabase
              .from('superannuation_accounts')
              .select('fund_name, account_number')
              .eq('id', session.product_id)
              .maybeSingle();
            
            if (data) {
              setProductName(data.fund_name || 'Superannuation Account');
            } else {
              setProductName('Unknown Super Account');
              if (error) console.error('Error fetching super account:', error);
            }
          } else {
            // Fetch from financial_products
            const product = await getProductById(session.product_id);
            if (product) {
              setProductName(product.product_name || 'Product');
            } else {
              setProductName('Unknown Product');
            }
          }
        } else {
          setProductName('No Product Linked');
        }

        setIsLoading(false);
        
        // Start duration timer if call is in progress
        if (session && (session.status === 'in_progress' || session.status === 'initiated')) {
          startDurationTimer();
        }

      } catch (error) {
        console.error('Error loading call data:', error);
        showToast('Failed to load call session', 'error');
        setIsLoading(false);
      }
    };

    loadCallData();

    return () => {
      stopDurationTimer();
    };
  }, [callSessionId]);

  /**
   * Load existing transcripts
   */
  useEffect(() => {
    if (!callSessionId) return;

    const loadTranscripts = async () => {
      try {
        const { data, error } = await supabase
          .from('conversation_transcripts')
          .select('*')
          .eq('call_session_id', callSessionId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading transcripts:', error);
        } else if (data) {
          console.log('📝 Loaded', data.length, 'existing transcript messages');
          setTranscripts(data);
        }
      } catch (error) {
        console.error('Error fetching transcripts:', error);
      }
    };

    loadTranscripts();
  }, [callSessionId]);

  /**
   * Load existing draft beneficiary data
   */
  useEffect(() => {
    if (!callSessionId) return;

    const loadDraftData = async () => {
      try {
        const { data, error } = await supabase
          .from('draft_beneficiaries')
          .select('*')
          .eq('call_session_id', callSessionId)
          .maybeSingle();

        if (error) {
          console.error('Error loading draft beneficiary:', error);
        } else if (data) {
          console.log('✍️ Loaded existing draft beneficiary data');
          setDraftFields(data);
          calculateCompletion(data);
        } else {
          console.log('ℹ️ No draft beneficiary found for this call');
        }
      } catch (error) {
        console.error('Error fetching draft beneficiary:', error);
      }
    };

    loadDraftData();
  }, [callSessionId]);

  /**
   * Real-time subscriptions to call_sessions and conversation_transcripts
   */
  useEffect(() => {
    if (!callSessionId) return;

    console.log('🔌 Setting up real-time subscriptions for call:', callSessionId);

    // Subscribe to call session updates
    const callChannel = supabase
      .channel(`call-session-${callSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_sessions',
          filter: `id=eq.${callSessionId}`,
        },
        (payload) => {
          console.log('📡 Call session updated:', payload);
          if (payload.new) {
            const updatedSession = payload.new as CallSession;
            setCallSession(updatedSession);
            
            // Stop timer if call ended
            if (updatedSession.status === 'completed' || updatedSession.status === 'cancelled') {
              stopDurationTimer();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📊 Call channel subscription status:', status);
      });

    // Subscribe to transcript updates
    const transcriptChannel = supabase
      .channel(`transcripts-${callSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_transcripts',
          filter: `call_session_id=eq.${callSessionId}`,
        },
        (payload) => {
          console.log('📝 New transcript message:', payload);
          if (payload.new) {
            setTranscripts((prev) => [...prev, payload.new]);
            
            // Auto-scroll to bottom
            setTimeout(() => {
              transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }
      )
      .subscribe((status) => {
        console.log('📊 Transcript channel subscription status:', status);
      });

    // Subscribe to draft beneficiary updates
    const draftChannel = supabase
      .channel(`draft-${callSessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'draft_beneficiaries',
          filter: `call_session_id=eq.${callSessionId}`,
        },
        (payload) => {
          console.log('✍️ Draft beneficiary updated:', payload);
          if (payload.new) {
            // Update draft fields
            const draft = payload.new as any;
            setDraftFields(draft);
            
            // Calculate completion
            calculateCompletion(draft);
          }
        }
      )
      .subscribe((status) => {
        console.log('📊 Draft channel subscription status:', status);
      });

    return () => {
      console.log('🔌 Unsubscribing from real-time channels');
      supabase.removeChannel(callChannel);
      supabase.removeChannel(transcriptChannel);
      supabase.removeChannel(draftChannel);
    };
  }, [callSessionId]);

  /**
   * Calculate completion percentage
   */
  const calculateCompletion = (draft: any) => {
    // All beneficiary fields that can be collected
    const allFields = [
      'full_name', 'relationship', 'date_of_birth', 'email', 'phone',
      'tfn', 'address_line1', 'address_line2', 'city', 'state', 
      'postcode', 'country', 'allocation_percentage', 'beneficiary_type', 'priority'
    ];
    const filledFields = allFields.filter((field) => draft[field] !== null && draft[field] !== undefined && draft[field] !== '');
    const percentage = Math.round((filledFields.length / allFields.length) * 100);
    setCompletionPercentage(percentage);
  };

  /**
   * Start duration timer
   */
  const startDurationTimer = () => {
    durationIntervalRef.current = window.setInterval(() => {
      setDuration((prev) => prev + 1);
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

  /**
   * End call
   */
  const handleEndCall = async () => {
    if (!callSessionId) return;

    const confirmed = window.confirm(
      'Are you sure you want to end this call? The client will be disconnected.'
    );

    if (!confirmed) return;

    try {
      await updateCallSessionStatus(callSessionId, 'completed');
      showToast('Call ended successfully', 'success');
      
      stopDurationTimer();
      
      // Navigate back to client detail after 2 seconds
      setTimeout(() => {
        if (callSession) {
          navigate(`/advisor/clients/${callSession.client_id}`);
        }
      }, 2000);

    } catch (error) {
      console.error('Error ending call:', error);
      showToast('Failed to end call', 'error');
    }
  };

  /**
   * Simulator: Trigger 2FA notification
   */
  const trigger2FA = async () => {
    if (!callSessionId) return;

    try {
      const { error } = await supabase
        .from('call_sessions')
        .update({ twofa_status: 'pending' })
        .eq('id', callSessionId);

      if (error) throw error;

      showToast('2FA notification sent to client', 'success');
    } catch (error) {
      console.error('Error triggering 2FA:', error);
      showToast('Failed to trigger 2FA', 'error');
    }
  };

  /**
   * Simulator: Add AI message to transcript
   */
  const simulateAIMessage = async () => {
    if (!callSessionId) return;
    
    const aiMessages = [
      "Hello! I'm calling to help you assign beneficiaries for your superannuation account.",
      "Could you please tell me the full name of your first beneficiary?",
      "Great! And what is their relationship to you?",
      "Thank you. What is their date of birth?",
      "Perfect. What percentage would you like to allocate to them?",
    ];
    
    const randomMessage = aiMessages[Math.floor(Math.random() * aiMessages.length)];
    
    try {
      await addTranscriptMessage({
        call_session_id: callSessionId,
        speaker: 'ai_bot',
        message_text: randomMessage,
        sequence_number: transcripts.length + 1,
      });
      showToast('AI message added', 'success');
    } catch (error) {
      console.error('Error adding AI message:', error);
      showToast('Failed to add AI message', 'error');
    }
  };

  /**
   * Simulator: Add client message to transcript
   */
  const simulateClientMessage = async () => {
    if (!callSessionId) return;
    
    const clientMessages = [
      "Yes, I'd like to add my spouse.",
      "Their name is Sarah Johnson.",
      "She's my wife.",
      "Her birthday is March 15, 1985.",
      "I'd like to allocate 100% to her.",
    ];
    
    const randomMessage = clientMessages[Math.floor(Math.random() * clientMessages.length)];
    
    try {
      await addTranscriptMessage({
        call_session_id: callSessionId,
        speaker: 'client',
        message_text: randomMessage,
        sequence_number: transcripts.length + 1,
      });
      showToast('Client message added', 'success');
    } catch (error) {
      console.error('Error adding client message:', error);
      showToast('Failed to add client message', 'error');
    }
  };

  /**
   * Simulator: Auto-play full conversation
   */
  const simulateFullConversation = async () => {
    if (!callSessionId) return;

    const conversation = [
      { speaker: 'ai', message: "Hello! I'm calling to help you assign beneficiaries for your superannuation account." },
      { speaker: 'client', message: "Hi, yes I'd like to set that up." },
      { speaker: 'ai', message: "Great! Could you please tell me the full name of your beneficiary?" },
      { speaker: 'client', message: "Sarah Johnson." },
      { speaker: 'ai', message: "Thank you. What is their relationship to you?" },
      { speaker: 'client', message: "She's my wife." },
      { speaker: 'ai', message: "Perfect. What is their date of birth?" },
      { speaker: 'client', message: "March 15, 1985." },
      { speaker: 'ai', message: "Excellent. What percentage would you like to allocate to Sarah?" },
      { speaker: 'client', message: "100 percent." },
    ];

    for (let i = 0; i < conversation.length; i++) {
      const msg = conversation[i];
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        await addTranscriptMessage({
          call_session_id: callSessionId,
          speaker: msg.speaker === 'ai' ? 'ai_bot' : 'client',
          message_text: msg.message,
          sequence_number: transcripts.length + i + 1,
        });
      } catch (error) {
        console.error('Error in conversation:', error);
        break;
      }
    }
    
    showToast('Conversation simulation complete', 'success');
  };

  /**
   * Simulator: Fill specific field
   */
  const fillField = async (fieldName: string, value: any) => {
    if (!callSessionId || !callSession) return;

    try {
      // Check if draft exists
      const { data: existingDraft } = await supabase
        .from('draft_beneficiaries')
        .select('*')
        .eq('call_session_id', callSessionId)
        .maybeSingle();

      if (existingDraft) {
        // Update existing draft
        await updateDraftBeneficiary(existingDraft.id, { [fieldName]: value });
      } else {
        // Create new draft
        await createDraftBeneficiary({
          call_session_id: callSessionId,
          product_type: callSession.product_type,
          product_id: callSession.product_id,
          [fieldName]: value,
        });
      }
      
      showToast(`${fieldName} filled`, 'success');
    } catch (error) {
      console.error('Error filling field:', error);
      showToast('Failed to fill field', 'error');
    }
  };

  /**
   * Simulator: Fill all fields
   */
  const fillAllFields = async () => {
    const fields = {
      full_name: 'Sarah Johnson',
      relationship: 'spouse',
      date_of_birth: '1985-03-15',
      email: 'sarah.johnson@email.com',
      phone: '0412345678',
      tfn: '123456789',
      address_line1: '123 Main Street',
      address_line2: 'Apt 4B',
      city: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      country: 'Australia',
      allocation_percentage: 100,
      beneficiary_type: 'binding',
      priority: 'primary',
    };

    for (const [field, value] of Object.entries(fields)) {
      await fillField(field, value);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  /**
   * Simulator: Clear all fields
   */
  const clearAllFields = async () => {
    if (!callSessionId) return;

    try {
      const { data: draft } = await supabase
        .from('draft_beneficiaries')
        .select('id')
        .eq('call_session_id', callSessionId)
        .maybeSingle();

      if (draft) {
        await supabase
          .from('draft_beneficiaries')
          .delete()
          .eq('id', draft.id);
        
        setDraftFields({});
        setCompletionPercentage(0);
        showToast('All fields cleared', 'success');
      }
    } catch (error) {
      console.error('Error clearing fields:', error);
      showToast('Failed to clear fields', 'error');
    }
  };

  /**
   * Get progress step status
   */
  const getProgressSteps = () => {
    if (!callSession) return [];

    // Determine if data has been collected (any field populated in draft)
    const hasData = Object.values(draftFields).some(val => val !== null && val !== undefined && val !== '');
    const hasConfirmation = callSession.data_collection_status === 'completed';
    const isCallCompleted = callSession.status === 'completed' || callSession.status === 'cancelled';

    const steps = [
      {
        label: 'Waiting for Client',
        status: callSession.status === 'initiated' ? 'current' : 'completed',
        icon: Phone,
      },
      {
        label: '2FA Verification',
        status:
          callSession.twofa_status === 'not_sent' ? 'pending' :
          callSession.twofa_status === 'pending' ? 'current' :
          callSession.twofa_status === 'confirmed' ? 'completed' :
          'error',
        icon: Shield,
      },
      {
        label: 'Gathering Information',
        status:
          callSession.twofa_status !== 'confirmed' ? 'pending' :
          !hasData && !isCallCompleted ? 'current' :
          hasData ? 'completed' :
          'pending',
        icon: MessageSquare,
      },
      {
        label: 'Client Confirming',
        status: 
          !hasData ? 'pending' :
          hasConfirmation || (isCallCompleted && hasData) ? 'completed' : 
          'current',
        icon: Check,
      },
      {
        label: 'Storage Success',
        status: hasData ? 'completed' : 'pending',
        icon: Database,
      },
      {
        label: callSession.status === 'cancelled' ? 'Call Ended' : 'Success',
        status: 
          callSession.status === 'completed' && hasData ? 'completed' :
          callSession.status === 'cancelled' ? 'error' :
          'pending',
        icon: callSession.status === 'cancelled' ? X : CheckCircle,
      },
    ];

    // If call is cancelled, mark all steps after current as error
    if (callSession.status === 'cancelled') {
      return steps.map(step => {
        if (step.status === 'pending') {
          return { ...step, status: 'error' as const };
        }
        return step;
      });
    }

    return steps;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading call session...</p>
        </div>
      </div>
    );
  }

  if (!callSession) return null;

  const progressSteps = getProgressSteps();
  const isCallActive = callSession.status === 'in_progress' || callSession.status === 'initiated';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(`/advisor/clients/${callSession.client_id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Client</span>
          </button>

          <div className="flex items-center gap-4">
            {/* Duration */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-mono text-lg font-semibold">{formatDuration(duration)}</span>
            </div>

            {/* Status Badge */}
            <div
              className={`px-4 py-2 rounded-lg font-medium ${
                callSession.status === 'in_progress'
                  ? 'bg-green-100 text-green-700'
                  : callSession.status === 'completed'
                  ? 'bg-blue-100 text-blue-700'
                  : callSession.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {callSession.status.replace('_', ' ').toUpperCase()}
            </div>

            {/* End Call Button */}
            {isCallActive && (
              <button
                onClick={handleEndCall}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>
            )}
          </div>
        </div>

        {/* Call Metadata */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{clientName}</h1>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Package className="w-4 h-4" />
                  {productName}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/advisor/clients/${callSession.client_id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Client Profile</span>
            </button>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Progress & Fields */}
          <div className="space-y-6">
            {/* Progress Tracker */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Call Progress</h2>
              
              <div className="space-y-4">
                {progressSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : step.status === 'current'
                          ? 'bg-blue-100 text-blue-600 animate-pulse'
                          : step.status === 'error'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : step.status === 'error' ? (
                        <X className="w-5 h-5" />
                      ) : step.status === 'current' ? (
                        <step.icon className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          step.status === 'completed'
                            ? 'text-gray-900'
                            : step.status === 'current'
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>

                    {/* Connector Line */}
                    {index < progressSteps.length - 1 && (
                      <div className="absolute left-11 mt-14 w-0.5 h-8 bg-gray-200" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 2FA Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">2FA Status</h3>
              
              <div
                className={`flex items-center gap-3 p-4 rounded-lg ${
                  callSession.twofa_status === 'confirmed'
                    ? 'bg-green-50 border border-green-200'
                    : callSession.twofa_status === 'rejected'
                    ? 'bg-red-50 border border-red-200'
                    : callSession.twofa_status === 'pending'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {callSession.twofa_status === 'confirmed' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : callSession.twofa_status === 'rejected' ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : callSession.twofa_status === 'pending' ? (
                  <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
                
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {callSession.twofa_status.replace('_', ' ')}
                  </p>
                  {callSession.twofa_status === 'pending' && (
                    <p className="text-sm text-gray-600 mt-1">
                      Waiting for client consent...
                    </p>
                  )}
                </div>
              </div>

              {/* Dev Mode: Trigger 2FA Button */}
              {import.meta.env.VITE_DEV_MODE === 'true' && callSession.twofa_status === 'not_sent' && (
                <button
                  onClick={trigger2FA}
                  className="w-full mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Trigger 2FA Request (Dev)
                </button>
              )}
            </div>

            {/* Field Extraction Display */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Beneficiary Fields</h3>
                <div className="text-sm font-medium text-blue-600">
                  {completionPercentage}% Complete
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Full Name', key: 'full_name' },
                  { label: 'Relationship', key: 'relationship' },
                  { label: 'Date of Birth', key: 'date_of_birth' },
                  { label: 'Email', key: 'email' },
                  { label: 'Phone', key: 'phone' },
                  { label: 'TFN', key: 'tfn' },
                  { label: 'Address Line 1', key: 'address_line1' },
                  { label: 'Address Line 2', key: 'address_line2' },
                  { label: 'City', key: 'city' },
                  { label: 'State', key: 'state' },
                  { label: 'Postcode', key: 'postcode' },
                  { label: 'Country', key: 'country' },
                  { label: 'Allocation %', key: 'allocation_percentage' },
                  { label: 'Beneficiary Type', key: 'beneficiary_type' },
                  { label: 'Priority', key: 'priority' },
                ].map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        draftFields[field.key]
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {draftFields[field.key] ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{field.label}</p>
                      {draftFields[field.key] && (
                        <p className="text-sm text-gray-600 mt-0.5">
                          {draftFields[field.key]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dev Mode: Field Simulator */}
            {import.meta.env.VITE_DEV_MODE === 'true' && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-300 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-purple-900">Field Simulator (Dev)</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => fillField('full_name', 'Sarah Johnson')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill Name
                    </button>
                    <button
                      onClick={() => fillField('relationship', 'spouse')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill Relationship
                    </button>
                    <button
                      onClick={() => fillField('date_of_birth', '1985-03-15')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill DOB
                    </button>
                    <button
                      onClick={() => fillField('email', 'sarah@email.com')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill Email
                    </button>
                    <button
                      onClick={() => fillField('phone', '0412345678')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill Phone
                    </button>
                    <button
                      onClick={() => fillField('tfn', '123456789')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill TFN
                    </button>
                    <button
                      onClick={() => fillField('address_line1', '123 Main Street')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill Address 1
                    </button>
                    <button
                      onClick={() => fillField('city', 'Sydney')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill City
                    </button>
                    <button
                      onClick={() => fillField('state', 'NSW')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill State
                    </button>
                    <button
                      onClick={() => fillField('postcode', '2000')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill Postcode
                    </button>
                    <button
                      onClick={() => fillField('allocation_percentage', 100)}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill Allocation
                    </button>
                    <button
                      onClick={() => fillField('beneficiary_type', 'binding')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill Type
                    </button>
                    <button
                      onClick={() => fillField('priority', 'primary')}
                      className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                    >
                      Fill Priority
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={fillAllFields}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Fill All
                    </button>
                    <button
                      onClick={clearAllFields}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Transcript */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col" style={{ height: 'calc(100vh - 300px)' }}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Live Transcript</h2>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {transcripts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Waiting for conversation to start...</p>
                </div>
              ) : (
                transcripts.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`flex ${message.speaker === 'client' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.speaker === 'client'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1 opacity-75 capitalize">
                        {message.speaker === 'ai_bot' ? 'AI Assistant' : 'Client'}
                      </p>
                      <p>{message.message_text}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Dev Mode: Transcript Simulator */}
            {import.meta.env.VITE_DEV_MODE === 'true' && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-dashed border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <h4 className="font-bold text-green-900 text-sm">Transcript Simulator (Dev)</h4>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={simulateAIMessage}
                    className="flex-1 px-3 py-2 bg-white hover:bg-green-50 text-green-700 rounded-lg text-sm font-medium transition-colors border border-green-200"
                  >
                    Add AI Message
                  </button>
                  <button
                    onClick={simulateClientMessage}
                    className="flex-1 px-3 py-2 bg-white hover:bg-green-50 text-green-700 rounded-lg text-sm font-medium transition-colors border border-green-200"
                  >
                    Add Client Message
                  </button>
                </div>
                
                <button
                  onClick={simulateFullConversation}
                  className="w-full mt-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Auto-Play Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorCallMonitor;
