import { supabase } from '../config/supabase';

/**
 * Get all clients assigned to a specific advisor
 */
export async function getAdvisorClients(advisorId: string) {
  try {
    const { data, error } = await supabase
      .from('advisor_client_assignments')
      .select(`
        id,
        assigned_at,
        notes,
        users!advisor_client_assignments_client_id_fkey (
          id,
          username,
          email,
          full_name,
          phone,
          occupation,
          risk_profile,
          created_at
        )
      `)
      .eq('advisor_id', advisorId)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching advisor clients:', error);
      return [];
    }

    // @ts-ignore - Supabase join typing
    return (data || []).map(item => ({
      assignment_id: item.id,
      assigned_at: item.assigned_at,
      notes: item.notes,
      ...item.users
    }));
  } catch (error) {
    console.error('Error in getAdvisorClients:', error);
    return [];
  }
}

/**
 * Assign a client to an advisor
 */
export async function assignClientToAdvisor(
  clientId: string,
  advisorId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if client is already assigned
    const { data: existing } = await supabase
      .from('advisor_client_assignments')
      .select('id')
      .eq('client_id', clientId)
      .single();

    if (existing) {
      return { success: false, error: 'Client is already assigned to an advisor' };
    }

    // Create assignment
    const { error } = await supabase
      .from('advisor_client_assignments')
      .insert([{
        advisor_id: advisorId,
        client_id: clientId,
        notes: notes || 'Client assigned',
      }]);

    if (error) {
      console.error('Error assigning client:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in assignClientToAdvisor:', error);
    return { success: false, error: 'Failed to assign client' };
  }
}

/**
 * Unassign a client from their advisor
 */
export async function unassignClient(clientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('advisor_client_assignments')
      .delete()
      .eq('client_id', clientId);

    if (error) {
      console.error('Error unassigning client:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in unassignClient:', error);
    return { success: false, error: 'Failed to unassign client' };
  }
}

/**
 * Get advisor statistics
 */
export async function getAdvisorStats(advisorId: string) {
  try {
    // Get assigned clients count
    const { data: assignments } = await supabase
      .from('advisor_client_assignments')
      .select('client_id')
      .eq('advisor_id', advisorId);

    const assignedCount = assignments?.length || 0;

    // Get total clients count
    const { data: allClients } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'client');

    const totalClients = allClients?.length || 0;
    const unassignedCount = totalClients - assignedCount;

    return {
      assignedClients: assignedCount,
      unassignedClients: unassignedCount,
      totalClients: totalClients,
    };
  } catch (error) {
    console.error('Error in getAdvisorStats:', error);
    return {
      assignedClients: 0,
      unassignedClients: 0,
      totalClients: 0,
    };
  }
}
