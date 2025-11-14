import { supabase } from '../config/supabase';

export interface Beneficiary {
  id: string;
  product_type: 'superannuation' | 'financial_product';
  product_id: string;
  full_name: string;
  relationship: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  tfn?: string;
  allocation_percentage: number;
  beneficiary_type: 'binding' | 'non_binding';
  priority: 'primary' | 'contingent';
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface BeneficiaryInput {
  product_type: 'superannuation' | 'financial_product';
  product_id: string;
  full_name: string;
  relationship: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  tfn?: string;
  allocation_percentage: number;
  beneficiary_type: 'binding' | 'non_binding';
  priority?: 'primary' | 'contingent';
}

/**
 * Get all beneficiaries for a specific product
 */
export async function getBeneficiariesByProduct(
  productType: 'superannuation' | 'financial_product',
  productId: string
): Promise<Beneficiary[]> {
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('product_type', productType)
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .order('allocation_percentage', { ascending: false });

    if (error) {
      console.error('Error fetching beneficiaries:', error);
      return [];
    }

    return (data || []) as Beneficiary[];
  } catch (error) {
    console.error('Error in getBeneficiariesByProduct:', error);
    return [];
  }
}

/**
 * Validate that total allocation equals 100%
 */
export async function validateAllocationTotal(
  productType: 'superannuation' | 'financial_product',
  productId: string,
  excludeBeneficiaryId?: string
): Promise<{ valid: boolean; currentTotal: number; error?: string }> {
  try {
    let query = supabase
      .from('beneficiaries')
      .select('allocation_percentage')
      .eq('product_type', productType)
      .eq('product_id', productId)
      .eq('is_active', true);

    // Exclude a specific beneficiary (for updates)
    if (excludeBeneficiaryId) {
      query = query.neq('id', excludeBeneficiaryId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error validating allocation:', error);
      return { valid: false, currentTotal: 0, error: error.message };
    }

    const currentTotal = (data || []).reduce(
      (sum, b) => sum + Number(b.allocation_percentage),
      0
    );

    return { valid: true, currentTotal };
  } catch (error) {
    console.error('Error in validateAllocationTotal:', error);
    return { valid: false, currentTotal: 0, error: 'Validation failed' };
  }
}

/**
 * Add a new beneficiary
 */
export async function addBeneficiary(
  beneficiaryData: BeneficiaryInput,
  changedBy: string
): Promise<{ success: boolean; beneficiary?: Beneficiary; error?: string }> {
  try {
    // Validate allocation won't exceed 100%
    const validation = await validateAllocationTotal(
      beneficiaryData.product_type,
      beneficiaryData.product_id
    );

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const newTotal = validation.currentTotal + beneficiaryData.allocation_percentage;
    if (newTotal > 100) {
      return {
        success: false,
        error: `Allocation would exceed 100%. Current total: ${validation.currentTotal}%, trying to add: ${beneficiaryData.allocation_percentage}%`,
      };
    }

    // Insert beneficiary
    const { data, error } = await supabase
      .from('beneficiaries')
      .insert([beneficiaryData])
      .select()
      .single();

    if (error) {
      console.error('Error adding beneficiary:', error);
      return { success: false, error: error.message };
    }

    const beneficiary = data as Beneficiary;

    // Log to history
    await logBeneficiaryChange(beneficiary.id, 'created', changedBy, beneficiary);

    return { success: true, beneficiary };
  } catch (error) {
    console.error('Error in addBeneficiary:', error);
    return { success: false, error: 'Failed to add beneficiary' };
  }
}

/**
 * Update an existing beneficiary
 */
export async function updateBeneficiary(
  beneficiaryId: string,
  updates: Partial<BeneficiaryInput>,
  changedBy: string
): Promise<{ success: boolean; beneficiary?: Beneficiary; error?: string }> {
  try {
    // Get current beneficiary
    const { data: current } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('id', beneficiaryId)
      .single();

    if (!current) {
      return { success: false, error: 'Beneficiary not found' };
    }

    // If allocation is being updated, validate
    if (updates.allocation_percentage !== undefined) {
      const validation = await validateAllocationTotal(
        current.product_type,
        current.product_id,
        beneficiaryId
      );

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const newTotal = validation.currentTotal + updates.allocation_percentage;
      if (newTotal > 100) {
        return {
          success: false,
          error: `Allocation would exceed 100%. Current total (excluding this): ${validation.currentTotal}%, trying to set: ${updates.allocation_percentage}%`,
        };
      }
    }

    // Update beneficiary
    const { data, error } = await supabase
      .from('beneficiaries')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', beneficiaryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating beneficiary:', error);
      return { success: false, error: error.message };
    }

    const beneficiary = data as Beneficiary;

    // Log to history
    await logBeneficiaryChange(beneficiaryId, 'updated', changedBy, beneficiary);

    return { success: true, beneficiary };
  } catch (error) {
    console.error('Error in updateBeneficiary:', error);
    return { success: false, error: 'Failed to update beneficiary' };
  }
}

/**
 * Delete a beneficiary (soft delete)
 */
export async function deleteBeneficiary(
  beneficiaryId: string,
  changedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current beneficiary data for history
    const { data: current } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('id', beneficiaryId)
      .single();

    if (!current) {
      return { success: false, error: 'Beneficiary not found' };
    }

    // Soft delete (mark as inactive)
    const { error } = await supabase
      .from('beneficiaries')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', beneficiaryId);

    if (error) {
      console.error('Error deleting beneficiary:', error);
      return { success: false, error: error.message };
    }

    // Log to history
    await logBeneficiaryChange(beneficiaryId, 'deleted', changedBy, current);

    return { success: true };
  } catch (error) {
    console.error('Error in deleteBeneficiary:', error);
    return { success: false, error: 'Failed to delete beneficiary' };
  }
}

/**
 * Log beneficiary changes to history
 */
async function logBeneficiaryChange(
  beneficiaryId: string,
  action: 'created' | 'updated' | 'deleted',
  changedBy: string,
  beneficiarySnapshot: any
): Promise<void> {
  try {
    await supabase.from('beneficiary_history').insert([
      {
        beneficiary_id: beneficiaryId,
        product_type: beneficiarySnapshot.product_type,
        product_id: beneficiarySnapshot.product_id,
        action,
        changed_by: changedBy,
        beneficiary_snapshot: beneficiarySnapshot,
      },
    ]);
  } catch (error) {
    console.error('Error logging beneficiary change:', error);
    // Don't throw - logging failure shouldn't break the main operation
  }
}

/**
 * Get beneficiary change history for a product
 */
export async function getBeneficiaryHistory(
  productType: 'superannuation' | 'financial_product',
  productId: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('beneficiary_history')
      .select('*')
      .eq('product_type', productType)
      .eq('product_id', productId)
      .order('changed_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching beneficiary history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBeneficiaryHistory:', error);
    return [];
  }
}

/**
 * Get all beneficiaries for a client (for advisor view)
 */
export async function getClientBeneficiaries(clientId: string): Promise<Beneficiary[]> {
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('is_active', true)
      .or(`superannuation_account_id.in.(select id from superannuation_accounts where user_id = '${clientId}'),financial_product_id.in.(select id from financial_products where user_id = '${clientId}')`)
      .order('allocation_percentage', { ascending: false });

    if (error) {
      console.error('Error fetching client beneficiaries:', error);
      return [];
    }

    return (data || []) as Beneficiary[];
  } catch (error) {
    console.error('Error in getClientBeneficiaries:', error);
    return [];
  }
}
