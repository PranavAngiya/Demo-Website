import { supabase } from '../config/supabase';
import type {
  CallSessionStatus,
  TwoFAStatus,
  DataCollectionStatus,
  FinalAction,
  CallMetadata,
} from '../types/callMessages';

/**
 * Call Session Interface
 * 
 * Represents a single call session between an advisor and client
 * for collecting beneficiary information.
 */
export interface CallSession {
  id: string;
  advisor_id: string;
  client_id: string;
  product_type: 'superannuation' | 'financial_product';
  product_id: string;
  status: CallSessionStatus;
  initiated_at: string;
  connected_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  twofa_requested_at?: string;
  twofa_confirmed_at?: string;
  twofa_status: TwoFAStatus;
  data_collection_status: DataCollectionStatus;
  final_action?: FinalAction;
  draft_beneficiary_id?: string;
  confirmed_beneficiary_id?: string;
  call_metadata?: CallMetadata;
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating a new call session
 */
export interface CreateCallSessionInput {
  advisor_id: string;
  client_id: string;
  product_type: 'superannuation' | 'financial_product';
  product_id: string;
}

/**
 * Create a new call session
 * 
 * @param input - Call session creation data
 * @returns Created call session or error
 * 
 * @example
 * ```typescript
 * const result = await createCallSession({
 *   advisor_id: 'advisor-uuid',
 *   client_id: 'client-uuid',
 *   product_type: 'superannuation',
 *   product_id: 'product-uuid'
 * });
 * ```
 */
export async function createCallSession(
  input: CreateCallSessionInput
): Promise<{ success: boolean; callSession?: CallSession; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('call_sessions')
      .insert([
        {
          ...input,
          status: 'initiated',
          twofa_status: 'not_sent',
          data_collection_status: 'not_started',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating call session:', error);
      return { success: false, error: error.message };
    }

    return { success: true, callSession: data as CallSession };
  } catch (error) {
    console.error('Error in createCallSession:', error);
    return { success: false, error: 'Failed to create call session' };
  }
}

/**
 * Get call session by ID
 * 
 * @param callSessionId - UUID of the call session
 * @returns Call session or null if not found
 */
export async function getCallSessionById(
  callSessionId: string
): Promise<CallSession | null> {
  try {
    const { data, error } = await supabase
      .from('call_sessions')
      .select('*')
      .eq('id', callSessionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching call session:', error);
      return null;
    }

    return data as CallSession | null;
  } catch (error) {
    console.error('Error in getCallSessionById:', error);
    return null;
  }
}

/**
 * Update call session status
 * 
 * @param callSessionId - UUID of the call session
 * @param status - New status
 * @returns Success boolean
 */
export async function updateCallSessionStatus(
  callSessionId: string,
  status: CallSessionStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: any = { status };

    // Set timestamps based on status
    if (status === 'in_progress' && !(await getCallSessionById(callSessionId))?.connected_at) {
      updates.connected_at = new Date().toISOString();
    }
    if (status === 'completed' || status === 'cancelled' || status === 'failed') {
      updates.ended_at = new Date().toISOString();
      
      // Calculate duration if connected_at exists
      const session = await getCallSessionById(callSessionId);
      if (session?.connected_at) {
        const connectedTime = new Date(session.connected_at).getTime();
        const endedTime = new Date(updates.ended_at).getTime();
        updates.duration_seconds = Math.floor((endedTime - connectedTime) / 1000);
      }
    }

    const { error } = await supabase
      .from('call_sessions')
      .update(updates)
      .eq('id', callSessionId);

    if (error) {
      console.error('Error updating call session status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateCallSessionStatus:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

/**
 * Update 2FA status
 * 
 * @param callSessionId - UUID of the call session
 * @param twoFAStatus - New 2FA status
 * @returns Success boolean
 */
export async function updateTwoFAStatus(
  callSessionId: string,
  twoFAStatus: TwoFAStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: any = { twofa_status: twoFAStatus };

    if (twoFAStatus === 'pending') {
      updates.twofa_requested_at = new Date().toISOString();
    }
    if (twoFAStatus === 'confirmed') {
      updates.twofa_confirmed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('call_sessions')
      .update(updates)
      .eq('id', callSessionId);

    if (error) {
      console.error('Error updating 2FA status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateTwoFAStatus:', error);
    return { success: false, error: 'Failed to update 2FA status' };
  }
}

/**
 * Update data collection status
 * 
 * @param callSessionId - UUID of the call session
 * @param dataCollectionStatus - New data collection status
 * @returns Success boolean
 */
export async function updateDataCollectionStatus(
  callSessionId: string,
  dataCollectionStatus: DataCollectionStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('call_sessions')
      .update({ data_collection_status: dataCollectionStatus })
      .eq('id', callSessionId);

    if (error) {
      console.error('Error updating data collection status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateDataCollectionStatus:', error);
    return { success: false, error: 'Failed to update data collection status' };
  }
}

/**
 * Set final action and reference IDs
 * 
 * @param callSessionId - UUID of the call session
 * @param finalAction - Final action taken
 * @param draftBeneficiaryId - Draft beneficiary ID (if saved as draft)
 * @param confirmedBeneficiaryId - Confirmed beneficiary ID (if directly confirmed)
 * @returns Success boolean
 */
export async function setFinalAction(
  callSessionId: string,
  finalAction: FinalAction,
  draftBeneficiaryId?: string,
  confirmedBeneficiaryId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: any = { final_action: finalAction };

    if (draftBeneficiaryId) {
      updates.draft_beneficiary_id = draftBeneficiaryId;
    }
    if (confirmedBeneficiaryId) {
      updates.confirmed_beneficiary_id = confirmedBeneficiaryId;
    }

    const { error } = await supabase
      .from('call_sessions')
      .update(updates)
      .eq('id', callSessionId);

    if (error) {
      console.error('Error setting final action:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in setFinalAction:', error);
    return { success: false, error: 'Failed to set final action' };
  }
}

/**
 * Update call metadata
 * 
 * @param callSessionId - UUID of the call session
 * @param metadata - Metadata to merge with existing
 * @returns Success boolean
 */
export async function updateCallMetadata(
  callSessionId: string,
  metadata: Partial<CallMetadata>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current metadata
    const session = await getCallSessionById(callSessionId);
    const currentMetadata = session?.call_metadata || {};

    // Merge with new metadata
    const updatedMetadata = { ...currentMetadata, ...metadata };

    const { error } = await supabase
      .from('call_sessions')
      .update({ call_metadata: updatedMetadata })
      .eq('id', callSessionId);

    if (error) {
      console.error('Error updating call metadata:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateCallMetadata:', error);
    return { success: false, error: 'Failed to update metadata' };
  }
}

/**
 * Get all call sessions for an advisor
 * 
 * @param advisorId - UUID of the advisor
 * @param limit - Maximum number of results (default: 50)
 * @returns Array of call sessions
 */
export async function getAdvisorCallSessions(
  advisorId: string,
  limit: number = 50
): Promise<CallSession[]> {
  try {
    const { data, error } = await supabase
      .from('call_sessions')
      .select('*')
      .eq('advisor_id', advisorId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching advisor call sessions:', error);
      return [];
    }

    return (data || []) as CallSession[];
  } catch (error) {
    console.error('Error in getAdvisorCallSessions:', error);
    return [];
  }
}

/**
 * Get all call sessions for a client
 * 
 * @param clientId - UUID of the client
 * @param limit - Maximum number of results (default: 50)
 * @returns Array of call sessions
 */
export async function getClientCallSessions(
  clientId: string,
  limit: number = 50
): Promise<CallSession[]> {
  try {
    const { data, error } = await supabase
      .from('call_sessions')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching client call sessions:', error);
      return [];
    }

    return (data || []) as CallSession[];
  } catch (error) {
    console.error('Error in getClientCallSessions:', error);
    return [];
  }
}

/**
 * Get active call sessions for a client (ringing or in progress)
 * 
 * @param clientId - UUID of the client
 * @returns Array of active call sessions
 */
export async function getActiveCallSessionsForClient(
  clientId: string
): Promise<CallSession[]> {
  try {
    const { data, error } = await supabase
      .from('call_sessions')
      .select('*')
      .eq('client_id', clientId)
      .in('status', ['ringing', 'in_progress', 'awaiting_2fa', 'collecting_data', 'confirming'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active call sessions:', error);
      return [];
    }

    return (data || []) as CallSession[];
  } catch (error) {
    console.error('Error in getActiveCallSessionsForClient:', error);
    return [];
  }
}

/**
 * Get call sessions for a specific product
 * 
 * @param productType - Type of product
 * @param productId - UUID of the product
 * @returns Array of call sessions
 */
export async function getCallSessionsForProduct(
  productType: 'superannuation' | 'financial_product',
  productId: string
): Promise<CallSession[]> {
  try {
    const { data, error } = await supabase
      .from('call_sessions')
      .select('*')
      .eq('product_type', productType)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching product call sessions:', error);
      return [];
    }

    return (data || []) as CallSession[];
  } catch (error) {
    console.error('Error in getCallSessionsForProduct:', error);
    return [];
  }
}
