import { supabase } from '../config/supabase';

export interface FinancialProduct {
  id: string;
  user_id: string;
  product_type: 'shares' | 'managed_fund' | 'term_deposit' | 'bonds' | 'property' | 'other';
  product_name: string;
  provider?: string;
  account_number?: string;
  current_value: number;
  purchase_value?: number;
  units?: number;
  acquisition_date?: string;
  maturity_date?: string;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all financial products for a user
 */
export async function getProductsByUser(userId: string): Promise<FinancialProduct[]> {
  try {
    const { data, error } = await supabase
      .from('financial_products')
      .select('*')
      .eq('user_id', userId)
      .order('is_active', { ascending: false })
      .order('current_value', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return (data || []) as FinancialProduct[];
  } catch (error) {
    console.error('Error in getProductsByUser:', error);
    return [];
  }
}

/**
 * Get a single financial product by ID
 */
export async function getProductById(productId: string): Promise<FinancialProduct | null> {
  try {
    const { data, error } = await supabase
      .from('financial_products')
      .select('*')
      .eq('id', productId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 rows gracefully

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data as FinancialProduct | null;
  } catch (error) {
    console.error('Error in getProductById:', error);
    return null;
  }
}

/**
 * Get total value of all financial products for a user
 */
export async function getTotalProductsValue(userId: string): Promise<number> {
  try {
    const products = await getProductsByUser(userId);
    const total = products.reduce((sum, product) => sum + Number(product.current_value), 0);
    return total;
  } catch (error) {
    console.error('Error in getTotalProductsValue:', error);
    return 0;
  }
}

/**
 * Get total portfolio value (super + products)
 */
export async function getTotalPortfolioValue(userId: string): Promise<{
  superTotal: number;
  productsTotal: number;
  grandTotal: number;
}> {
  try {
    // Import here to avoid circular dependency
    const { getTotalSuperBalance } = await import('./superService');
    
    const [superTotal, productsTotal] = await Promise.all([
      getTotalSuperBalance(userId),
      getTotalProductsValue(userId),
    ]);

    return {
      superTotal,
      productsTotal,
      grandTotal: superTotal + productsTotal,
    };
  } catch (error) {
    console.error('Error in getTotalPortfolioValue:', error);
    return { superTotal: 0, productsTotal: 0, grandTotal: 0 };
  }
}

/**
 * Get client's superannuation accounts (for advisor view)
 */
export async function getClientSuperAccounts(clientId: string) {
  try {
    const { data, error } = await supabase
      .from('superannuation_accounts')
      .select('*')
      .eq('user_id', clientId)
      .order('current_balance', { ascending: false });

    if (error) {
      console.error('Error fetching super accounts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getClientSuperAccounts:', error);
    return [];
  }
}

/**
 * Get client's financial products (for advisor view)
 */
export async function getClientFinancialProducts(clientId: string) {
  try {
    const { data, error } = await supabase
      .from('financial_products')
      .select('*')
      .eq('user_id', clientId)
      .order('current_value', { ascending: false });

    if (error) {
      console.error('Error fetching financial products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getClientFinancialProducts:', error);
    return [];
  }
}
