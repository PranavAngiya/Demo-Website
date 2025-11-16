import { supabase } from '../config/supabase';
import type { ExtractionStatus, FieldExtractionMetadata } from '../types/callMessages';
import { addBeneficiary } from './beneficiaryService';
import type { BeneficiaryInput } from './beneficiaryService';

/**
 * Draft Beneficiary Interface
 * 
 * Represents a beneficiary record being collected during a call session.
 * Fields are progressively populated as the AI extracts information.
 */
export interface DraftBeneficiary {
  id: string;
  call_session_id: string;
  product_type: 'superannuation' | 'financial_product';
  product_id: string;
  full_name?: string;
  relationship?: string;
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
  allocation_percentage?: number;
  beneficiary_type?: 'binding' | 'non_binding';
  priority?: 'primary' | 'contingent';
  extraction_status: ExtractionStatus;
  field_extraction_metadata?: FieldExtractionMetadata;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
}

/**
 * Input for creating a draft beneficiary
 */
export interface CreateDraftBeneficiaryInput {
  call_session_id: string;
  product_type: 'superannuation' | 'financial_product';
  product_id: string;
}

/**
 * Create a new draft beneficiary record
 * 
 * @param input - Draft beneficiary creation data
 * @returns Created draft beneficiary or error
 * 
 * @example
 * ```typescript
 * const result = await createDraftBeneficiary({
 *   call_session_id: 'session-uuid',
 *   product_type: 'superannuation',
 *   product_id: 'product-uuid'
 * });
 * ```
 */
export async function createDraftBeneficiary(
  input: CreateDraftBeneficiaryInput
): Promise<{ success: boolean; draftBeneficiary?: DraftBeneficiary; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('draft_beneficiaries')
      .insert([
        {
          ...input,
          extraction_status: 'empty',
          field_extraction_metadata: {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating draft beneficiary:', error);
      return { success: false, error: error.message };
    }

    return { success: true, draftBeneficiary: data as DraftBeneficiary };
  } catch (error) {
    console.error('Error in createDraftBeneficiary:', error);
    return { success: false, error: 'Failed to create draft beneficiary' };
  }
}

/**
 * Get draft beneficiary by ID
 * 
 * @param draftBeneficiaryId - UUID of the draft beneficiary
 * @returns Draft beneficiary or null if not found
 */
export async function getDraftBeneficiaryById(
  draftBeneficiaryId: string
): Promise<DraftBeneficiary | null> {
  try {
    const { data, error } = await supabase
      .from('draft_beneficiaries')
      .select('*')
      .eq('id', draftBeneficiaryId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching draft beneficiary:', error);
      return null;
    }

    return data as DraftBeneficiary | null;
  } catch (error) {
    console.error('Error in getDraftBeneficiaryById:', error);
    return null;
  }
}

/**
 * Get draft beneficiary for a specific call session
 * 
 * @param callSessionId - UUID of the call session
 * @returns Draft beneficiary or null if not found
 */
export async function getDraftBeneficiaryByCallSession(
  callSessionId: string
): Promise<DraftBeneficiary | null> {
  try {
    const { data, error } = await supabase
      .from('draft_beneficiaries')
      .select('*')
      .eq('call_session_id', callSessionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching draft beneficiary by call session:', error);
      return null;
    }

    return data as DraftBeneficiary | null;
  } catch (error) {
    console.error('Error in getDraftBeneficiaryByCallSession:', error);
    return null;
  }
}

/**
 * Get all draft beneficiaries for a specific product
 * 
 * @param productType - Type of product
 * @param productId - UUID of the product
 * @returns Array of draft beneficiaries
 */
export async function getDraftBeneficiariesByProduct(
  productType: 'superannuation' | 'financial_product',
  productId: string
): Promise<DraftBeneficiary[]> {
  try {
    const { data, error } = await supabase
      .from('draft_beneficiaries')
      .select('*')
      .eq('product_type', productType)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching draft beneficiaries by product:', error);
      return [];
    }

    return (data || []) as DraftBeneficiary[];
  } catch (error) {
    console.error('Error in getDraftBeneficiariesByProduct:', error);
    return [];
  }
}

/**
 * Update a single field in draft beneficiary
 * 
 * @param draftBeneficiaryId - UUID of the draft beneficiary
 * @param fieldName - Name of the field to update
 * @param fieldValue - New value for the field
 * @param confidence - Confidence score (0-1) from backend extraction
 * @returns Success boolean
 * 
 * @example
 * ```typescript
 * await updateDraftField('draft-uuid', 'full_name', 'John Smith', 0.95);
 * ```
 */
export async function updateDraftField(
  draftBeneficiaryId: string,
  fieldName: string,
  fieldValue: any,
  confidence?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current draft
    const draft = await getDraftBeneficiaryById(draftBeneficiaryId);
    if (!draft) {
      return { success: false, error: 'Draft beneficiary not found' };
    }

    // Update field value
    const updates: any = {
      [fieldName]: fieldValue,
    };

    // Update field extraction metadata
    const metadata = draft.field_extraction_metadata || {};
    metadata[fieldName] = {
      extracted: true,
      confidence,
      extracted_at: new Date().toISOString(),
      value: fieldValue,
    };
    updates.field_extraction_metadata = metadata;

    // Calculate extraction status
    updates.extraction_status = calculateExtractionStatus(metadata);

    const { error } = await supabase
      .from('draft_beneficiaries')
      .update(updates)
      .eq('id', draftBeneficiaryId);

    if (error) {
      console.error('Error updating draft field:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateDraftField:', error);
    return { success: false, error: 'Failed to update draft field' };
  }
}

/**
 * Update multiple fields in draft beneficiary at once
 * 
 * @param draftBeneficiaryId - UUID of the draft beneficiary
 * @param fields - Object with field names and values
 * @returns Success boolean
 */
export async function updateDraftBeneficiary(
  draftBeneficiaryId: string,
  fields: Partial<DraftBeneficiary>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Remove non-updatable fields
    const { id, call_session_id, created_at, ...updates } = fields as any;

    const { error } = await supabase
      .from('draft_beneficiaries')
      .update(updates)
      .eq('id', draftBeneficiaryId);

    if (error) {
      console.error('Error updating draft beneficiary:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateDraftBeneficiary:', error);
    return { success: false, error: 'Failed to update draft beneficiary' };
  }
}

/**
 * Confirm a draft beneficiary and move it to the main beneficiaries table
 * 
 * @param draftBeneficiaryId - UUID of the draft beneficiary
 * @param changedBy - User ID of person confirming
 * @returns Success with confirmed beneficiary ID or error
 * 
 * @example
 * ```typescript
 * const result = await confirmDraftBeneficiary('draft-uuid', 'user-uuid');
 * if (result.success) {
 *   console.log('Confirmed beneficiary ID:', result.confirmedBeneficiaryId);
 * }
 * ```
 */
export async function confirmDraftBeneficiary(
  draftBeneficiaryId: string,
  changedBy: string
): Promise<{ success: boolean; confirmedBeneficiaryId?: string; error?: string }> {
  try {
    // Get draft beneficiary
    const draft = await getDraftBeneficiaryById(draftBeneficiaryId);
    if (!draft) {
      return { success: false, error: 'Draft beneficiary not found' };
    }

    // Validate required fields
    if (!draft.full_name || !draft.relationship || draft.allocation_percentage === undefined) {
      return {
        success: false,
        error: 'Missing required fields: full_name, relationship, and allocation_percentage are required',
      };
    }

    // Create beneficiary input
    const beneficiaryInput: BeneficiaryInput = {
      product_type: draft.product_type,
      product_id: draft.product_id,
      full_name: draft.full_name,
      relationship: draft.relationship,
      allocation_percentage: draft.allocation_percentage,
      beneficiary_type: draft.beneficiary_type || 'non_binding',
      priority: draft.priority || 'primary',
      date_of_birth: draft.date_of_birth,
      email: draft.email,
      phone: draft.phone,
      address_line1: draft.address_line1,
      address_line2: draft.address_line2,
      city: draft.city,
      state: draft.state,
      postcode: draft.postcode,
      country: draft.country,
      tfn: draft.tfn,
    };

    // Add to beneficiaries table using existing service
    const result = await addBeneficiary(beneficiaryInput, changedBy);

    if (!result.success || !result.beneficiary) {
      return { success: false, error: result.error };
    }

    // Update draft with confirmation timestamp
    await supabase
      .from('draft_beneficiaries')
      .update({ confirmed_at: new Date().toISOString() })
      .eq('id', draftBeneficiaryId);

    return { success: true, confirmedBeneficiaryId: result.beneficiary.id };
  } catch (error) {
    console.error('Error in confirmDraftBeneficiary:', error);
    return { success: false, error: 'Failed to confirm draft beneficiary' };
  }
}

/**
 * Delete a draft beneficiary
 * 
 * @param draftBeneficiaryId - UUID of the draft beneficiary
 * @returns Success boolean
 */
export async function deleteDraftBeneficiary(
  draftBeneficiaryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('draft_beneficiaries')
      .delete()
      .eq('id', draftBeneficiaryId);

    if (error) {
      console.error('Error deleting draft beneficiary:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteDraftBeneficiary:', error);
    return { success: false, error: 'Failed to delete draft beneficiary' };
  }
}

/**
 * Calculate extraction status based on field extraction metadata
 * 
 * Helper function to determine if draft is empty, partial, or complete
 * 
 * @param metadata - Field extraction metadata
 * @returns Extraction status
 */
function calculateExtractionStatus(metadata: FieldExtractionMetadata): ExtractionStatus {
  const requiredFields = ['full_name', 'relationship', 'allocation_percentage'];
  const optionalFields = [
    'date_of_birth',
    'email',
    'phone',
    'address_line1',
    'city',
    'state',
    'postcode',
    'beneficiary_type',
    'priority',
  ];

  const extractedFields = Object.keys(metadata).filter((key) => metadata[key].extracted);

  if (extractedFields.length === 0) {
    return 'empty';
  }

  // Check if all required fields are extracted
  const hasAllRequired = requiredFields.every((field) =>
    extractedFields.includes(field)
  );

  // Check if majority of optional fields are extracted
  const extractedOptional = optionalFields.filter((field) =>
    extractedFields.includes(field)
  );
  const optionalPercentage = extractedOptional.length / optionalFields.length;

  if (hasAllRequired && optionalPercentage >= 0.7) {
    return 'complete';
  }

  return 'partial';
}

/**
 * Get completion percentage for a draft beneficiary
 * 
 * @param draftBeneficiaryId - UUID of the draft beneficiary
 * @returns Percentage (0-100) of fields populated
 */
export async function getDraftCompletionPercentage(
  draftBeneficiaryId: string
): Promise<number> {
  try {
    const draft = await getDraftBeneficiaryById(draftBeneficiaryId);
    if (!draft) return 0;

    const allFields = [
      'full_name',
      'relationship',
      'allocation_percentage',
      'date_of_birth',
      'email',
      'phone',
      'address_line1',
      'city',
      'state',
      'postcode',
      'beneficiary_type',
      'priority',
    ];

    const populatedFields = allFields.filter((field) => {
      const value = (draft as any)[field];
      return value !== null && value !== undefined && value !== '';
    });

    return Math.round((populatedFields.length / allFields.length) * 100);
  } catch (error) {
    console.error('Error in getDraftCompletionPercentage:', error);
    return 0;
  }
}
