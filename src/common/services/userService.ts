import { supabase } from '../config/supabase';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'client' | 'advisor';
  full_name: string;
  phone?: string;
  date_of_birth: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  tfn?: string;
  medicare_number?: string;
  income_bracket?: string;
  employment_status?: string;
  occupation?: string;
  risk_profile?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_login?: string;
}

export interface UserWithAdvisor extends User {
  advisor_id: string | null;
  advisor_name: string | null;
  assigned_at: string | null;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 rows gracefully

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    // If no user found in users table, return null (not an error)
    if (!data) {
      console.warn(`User with ID ${userId} not found in users table`);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Remove fields that shouldn't be updated
    const { id, username, password_hash, role, created_at, ...allowedUpdates } = updates as any;

    // Add updated_at timestamp
    const dataToUpdate = {
      ...allowedUpdates,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('users')
      .update(dataToUpdate)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all clients with their advisor information
 */
export async function getAllClients(): Promise<UserWithAdvisor[]> {
  try {
    // Step 1: Get all clients
    const { data: clients, error: clientsError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .order('full_name');

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return [];
    }

    // Step 2: Get all assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('advisor_client_assignments')
      .select('client_id, advisor_id, assigned_at');

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      return [];
    }

    // Step 3: Get all advisors (for names)
    const { data: advisors, error: advisorsError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'advisor');

    if (advisorsError) {
      console.error('Error fetching advisors:', advisorsError);
      return [];
    }

    // Step 4: Combine the data
    const result = (clients || []).map((client: any) => {
      // Find assignment for this client
      const assignment = assignments?.find(a => a.client_id === client.id);
      
      if (assignment) {
        // Find advisor name
        const advisor = advisors?.find(a => a.id === assignment.advisor_id);
        
        return {
          ...client,
          advisor_id: assignment.advisor_id,
          advisor_name: advisor?.full_name || null,
          assigned_at: assignment.assigned_at,
        };
      }
      
      // No assignment found
      return {
        ...client,
        advisor_id: null,
        advisor_name: null,
        assigned_at: null,
      };
    });

    return result as UserWithAdvisor[];
  } catch (error) {
    console.error('Error in getAllClients:', error);
    return [];
  }
}

/**
 * Get unassigned clients (clients without an advisor)
 */
export async function getUnassignedClients(): Promise<User[]> {
  try {
    // Get all clients
    const { data: allClients, error: clientsError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'client')
      .order('full_name');

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return [];
    }

    // Get all assigned client IDs
    const { data: assignments, error: assignmentsError } = await supabase
      .from('advisor_client_assignments')
      .select('client_id');

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      return [];
    }

    const assignedClientIds = new Set(assignments?.map(a => a.client_id) || []);

    // Filter out assigned clients
    const unassignedClients = allClients?.filter(
      client => !assignedClientIds.has(client.id)
    ) || [];

    return unassignedClients as User[];
  } catch (error) {
    console.error('Error in getUnassignedClients:', error);
    return [];
  }
}

/**
 * Get clients assigned to a specific advisor
 */
export async function getAdvisorClients(advisorId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('advisor_client_assignments')
      .select(`
        client_id,
        users!advisor_client_assignments_client_id_fkey (*)
      `)
      .eq('advisor_id', advisorId);

    if (error) {
      console.error('Error fetching advisor clients:', error);
      return [];
    }

    // @ts-ignore - Supabase join typing
    return (data || []).map(item => item.users).filter(Boolean) as User[];
  } catch (error) {
    console.error('Error in getAdvisorClients:', error);
    return [];
  }
}
