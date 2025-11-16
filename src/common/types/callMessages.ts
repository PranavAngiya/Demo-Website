/**
 * Call Message Types
 * 
 * Defines all message types exchanged between client, advisor, and backend
 * during AI call sessions for beneficiary data collection.
 */

// ============================================================================
// Call Session Status Types
// ============================================================================

export type CallSessionStatus =
  | 'initiated'
  | 'connecting'
  | 'ringing'
  | 'in_progress'
  | 'awaiting_2fa'
  | 'collecting_data'
  | 'confirming'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type TwoFAStatus = 'not_sent' | 'pending' | 'confirmed' | 'rejected';
export type DataCollectionStatus = 'not_started' | 'in_progress' | 'completed';
export type FinalAction = 'draft_saved' | 'directly_confirmed' | 'cancelled' | 'none';
export type Speaker = 'ai_bot' | 'client' | 'system';
export type ExtractionStatus = 'empty' | 'partial' | 'complete';

// ============================================================================
// Client → Backend Messages
// ============================================================================

/**
 * Audio chunk sent from client microphone to backend for processing
 */
export interface AudioChunkMessage {
  type: 'audio_chunk';
  call_session_id: string;
  audio_data: string; // Base64 encoded audio data
  timestamp: number;
  sequence: number;
}

/**
 * Notification that client has accepted the call
 */
export interface CallAcceptedMessage {
  type: 'call_accepted';
  call_session_id: string;
  timestamp: number;
}

/**
 * Notification that call has ended (by client or advisor)
 */
export interface CallEndedMessage {
  type: 'call_ended';
  call_session_id: string;
  reason: 'client_ended' | 'advisor_ended' | 'timeout' | 'error';
  timestamp: number;
}

/**
 * Client confirms 2FA consent notification
 */
export interface TwoFAConfirmedMessage {
  type: '2fa_confirmed';
  call_session_id: string;
  timestamp: number;
}

/**
 * Client rejects 2FA consent notification
 */
export interface TwoFARejectedMessage {
  type: '2fa_rejected';
  call_session_id: string;
  timestamp: number;
}

/**
 * Client confirms collected beneficiary data
 */
export interface DataConfirmedMessage {
  type: 'data_confirmed';
  call_session_id: string;
  confirmation_type: 'draft' | 'direct';
  timestamp: number;
}

// Union type for all client → backend messages
export type ClientToBackendMessage =
  | AudioChunkMessage
  | CallAcceptedMessage
  | CallEndedMessage
  | TwoFAConfirmedMessage
  | TwoFARejectedMessage
  | DataConfirmedMessage;

// ============================================================================
// Backend → Client/Advisor Messages
// ============================================================================

/**
 * Transcript update - new message in conversation
 */
export interface TranscriptUpdateMessage {
  type: 'transcript_update';
  call_session_id: string;
  speaker: Speaker;
  message: string;
  timestamp: number;
  sequence_number: number;
}

/**
 * Field extracted from speech - beneficiary data collected
 */
export interface FieldExtractedMessage {
  type: 'field_extracted';
  call_session_id: string;
  field_name: string;
  field_value: any;
  confidence?: number; // 0-1 confidence score
  timestamp: number;
}

/**
 * Call status change notification
 */
export interface StatusChangeMessage {
  type: 'status_change';
  call_session_id: string;
  new_status: CallSessionStatus;
  message?: string;
  timestamp: number;
}

/**
 * 2FA consent request from backend
 */
export interface TwoFARequestMessage {
  type: '2fa_request';
  call_session_id: string;
  message: string;
  timestamp: number;
}

/**
 * Audio stream from backend (AI voice)
 */
export interface AudioStreamMessage {
  type: 'audio_stream';
  call_session_id: string;
  audio_data: string; // Base64 encoded audio
  timestamp: number;
  sequence: number;
}

/**
 * Call ended notification from backend
 */
export interface CallEndedNotificationMessage {
  type: 'call_ended_notification';
  call_session_id: string;
  reason: string;
  final_action: FinalAction;
  timestamp: number;
}

/**
 * Error notification
 */
export interface ErrorMessage {
  type: 'error';
  call_session_id: string;
  error_code: string;
  error_message: string;
  timestamp: number;
}

// Union type for all backend → client/advisor messages
export type BackendToClientMessage =
  | TranscriptUpdateMessage
  | FieldExtractedMessage
  | StatusChangeMessage
  | TwoFARequestMessage
  | AudioStreamMessage
  | CallEndedNotificationMessage
  | ErrorMessage;

// Aliases for easier imports
export type ClientMessage = ClientToBackendMessage;
export type BackendMessage = BackendToClientMessage;

// All message types combined
export type CallMessage = ClientToBackendMessage | BackendToClientMessage;

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Field extraction metadata stored in JSONB
 */
export interface FieldExtractionMetadata {
  [fieldName: string]: {
    extracted: boolean;
    confidence?: number;
    extracted_at?: string;
    value?: any;
  };
}

/**
 * Call metadata stored in JSONB
 */
export interface CallMetadata {
  backend_session_id?: string;
  ai_model?: string;
  audio_quality?: 'low' | 'medium' | 'high';
  connection_issues?: Array<{
    timestamp: string;
    issue: string;
  }>;
  [key: string]: any;
}
