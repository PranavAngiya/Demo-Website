import { supabase } from '../config/supabase';
import type { Speaker } from '../types/callMessages';

/**
 * Conversation Message Interface
 * 
 * Represents a single message in a call transcript
 */
export interface ConversationMessage {
  id: string;
  call_session_id: string;
  speaker: Speaker;
  message_text: string;
  timestamp: string;
  sequence_number: number;
  metadata?: any;
  created_at: string;
}

/**
 * Input for adding a new transcript message
 */
export interface AddTranscriptMessageInput {
  call_session_id: string;
  speaker: Speaker;
  message_text: string;
  sequence_number: number;
  metadata?: any;
}

/**
 * Add a new message to the conversation transcript
 * 
 * @param input - Message data
 * @returns Created message or error
 * 
 * @example
 * ```typescript
 * const result = await addTranscriptMessage({
 *   call_session_id: 'session-uuid',
 *   speaker: 'ai_bot',
 *   message_text: 'Hello! I understand you need to set up a beneficiary.',
 *   sequence_number: 1
 * });
 * ```
 */
export async function addTranscriptMessage(
  input: AddTranscriptMessageInput
): Promise<{ success: boolean; message?: ConversationMessage; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('conversation_transcripts')
      .insert([
        {
          ...input,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding transcript message:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: data as ConversationMessage };
  } catch (error) {
    console.error('Error in addTranscriptMessage:', error);
    return { success: false, error: 'Failed to add transcript message' };
  }
}

/**
 * Get all transcript messages for a call session
 * 
 * @param callSessionId - UUID of the call session
 * @returns Array of messages in chronological order
 */
export async function getCallTranscript(
  callSessionId: string
): Promise<ConversationMessage[]> {
  try {
    const { data, error } = await supabase
      .from('conversation_transcripts')
      .select('*')
      .eq('call_session_id', callSessionId)
      .order('sequence_number', { ascending: true });

    if (error) {
      console.error('Error fetching call transcript:', error);
      return [];
    }

    return (data || []) as ConversationMessage[];
  } catch (error) {
    console.error('Error in getCallTranscript:', error);
    return [];
  }
}

/**
 * Get the latest N messages from a call transcript
 * 
 * @param callSessionId - UUID of the call session
 * @param limit - Number of latest messages to fetch (default: 10)
 * @returns Array of latest messages
 */
export async function getLatestTranscriptMessages(
  callSessionId: string,
  limit: number = 10
): Promise<ConversationMessage[]> {
  try {
    const { data, error } = await supabase
      .from('conversation_transcripts')
      .select('*')
      .eq('call_session_id', callSessionId)
      .order('sequence_number', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching latest transcript messages:', error);
      return [];
    }

    // Reverse to get chronological order
    return ((data || []) as ConversationMessage[]).reverse();
  } catch (error) {
    console.error('Error in getLatestTranscriptMessages:', error);
    return [];
  }
}

/**
 * Get the next sequence number for a call session
 * 
 * @param callSessionId - UUID of the call session
 * @returns Next sequence number
 */
export async function getNextSequenceNumber(
  callSessionId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('conversation_transcripts')
      .select('sequence_number')
      .eq('call_session_id', callSessionId)
      .order('sequence_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error getting next sequence number:', error);
      return 0;
    }

    return data ? data.sequence_number + 1 : 0;
  } catch (error) {
    console.error('Error in getNextSequenceNumber:', error);
    return 0;
  }
}

/**
 * Get transcript message count for a call session
 * 
 * @param callSessionId - UUID of the call session
 * @returns Number of messages in transcript
 */
export async function getTranscriptMessageCount(
  callSessionId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('conversation_transcripts')
      .select('*', { count: 'exact', head: true })
      .eq('call_session_id', callSessionId);

    if (error) {
      console.error('Error getting transcript count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getTranscriptMessageCount:', error);
    return 0;
  }
}

/**
 * Delete all transcript messages for a call session
 * 
 * Note: This should rarely be used. Transcripts are usually kept for audit purposes.
 * 
 * @param callSessionId - UUID of the call session
 * @returns Success boolean
 */
export async function deleteCallTranscript(
  callSessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('conversation_transcripts')
      .delete()
      .eq('call_session_id', callSessionId);

    if (error) {
      console.error('Error deleting call transcript:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteCallTranscript:', error);
    return { success: false, error: 'Failed to delete transcript' };
  }
}

/**
 * Search transcript messages by text
 * 
 * @param callSessionId - UUID of the call session
 * @param searchTerm - Term to search for
 * @returns Array of matching messages
 */
export async function searchTranscript(
  callSessionId: string,
  searchTerm: string
): Promise<ConversationMessage[]> {
  try {
    const { data, error } = await supabase
      .from('conversation_transcripts')
      .select('*')
      .eq('call_session_id', callSessionId)
      .ilike('message_text', `%${searchTerm}%`)
      .order('sequence_number', { ascending: true });

    if (error) {
      console.error('Error searching transcript:', error);
      return [];
    }

    return (data || []) as ConversationMessage[];
  } catch (error) {
    console.error('Error in searchTranscript:', error);
    return [];
  }
}
