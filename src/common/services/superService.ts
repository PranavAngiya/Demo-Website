import { supabase } from '../config/supabase';

export interface SuperannuationAccount {
  id: string;
  user_id: string;
  account_number: string;
  member_number: string;
  fund_name: string;
  fund_abn?: string;
  account_type?: 'accumulation' | 'pension' | 'transition_to_retirement';
  current_balance: number;
  employer_contributions?: number;
  personal_contributions?: number;
  government_contributions?: number;
  investment_strategy?: string;
  growth_allocation?: number;
  balanced_allocation?: number;
  conservative_allocation?: number;
  annual_return_rate?: number;
  fees_annual?: number;
  insurance_premium?: number;
  has_life_insurance?: boolean;
  life_insurance_cover?: number;
  has_tpd_insurance?: boolean;
  tpd_insurance_cover?: number;
  has_income_protection?: boolean;
  income_protection_cover?: number;
  employer_name?: string;
  employer_abn?: string;
  account_opened_date: string;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SuperTransaction {
  id: string;
  account_id: string;
  transaction_type: string;
  amount: number;
  transaction_date: string;
  description?: string;
  reference_number?: string;
  created_at: string;
}

/**
 * Get all superannuation accounts for a user
 */
export async function getSuperAccountsByUser(userId: string): Promise<SuperannuationAccount[]> {
  try {
    const { data, error } = await supabase
      .from('superannuation_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('is_active', { ascending: false })
      .order('current_balance', { ascending: false });

    if (error) {
      console.error('Error fetching super accounts:', error);
      return [];
    }

    return (data || []) as SuperannuationAccount[];
  } catch (error) {
    console.error('Error in getSuperAccountsByUser:', error);
    return [];
  }
}

/**
 * Get a single superannuation account by ID
 */
export async function getSuperAccountById(accountId: string): Promise<SuperannuationAccount | null> {
  try {
    const { data, error } = await supabase
      .from('superannuation_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) {
      console.error('Error fetching super account:', error);
      return null;
    }

    return data as SuperannuationAccount;
  } catch (error) {
    console.error('Error in getSuperAccountById:', error);
    return null;
  }
}

/**
 * Get transactions for a superannuation account
 */
export async function getTransactionsByAccount(
  accountId: string,
  limit: number = 50
): Promise<SuperTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('superannuation_transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return (data || []) as SuperTransaction[];
  } catch (error) {
    console.error('Error in getTransactionsByAccount:', error);
    return [];
  }
}

/**
 * Get total superannuation balance for a user
 */
export async function getTotalSuperBalance(userId: string): Promise<number> {
  try {
    const accounts = await getSuperAccountsByUser(userId);
    const total = accounts.reduce((sum, account) => sum + Number(account.current_balance), 0);
    return total;
  } catch (error) {
    console.error('Error in getTotalSuperBalance:', error);
    return 0;
  }
}

/**
 * Get recent transactions across all user's super accounts
 */
export async function getRecentTransactions(
  userId: string,
  limit: number = 10
): Promise<SuperTransaction[]> {
  try {
    // First get user's account IDs
    const accounts = await getSuperAccountsByUser(userId);
    const accountIds = accounts.map(a => a.id);

    if (accountIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('superannuation_transactions')
      .select('*')
      .in('account_id', accountIds)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }

    return (data || []) as SuperTransaction[];
  } catch (error) {
    console.error('Error in getRecentTransactions:', error);
    return [];
  }
}
