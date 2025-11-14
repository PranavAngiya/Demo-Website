import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';

// Session storage key
const SESSION_KEY = 'cfs_user_session';

export interface UserSession {
  id: string;
  username: string;
  email: string;
  role: 'client' | 'advisor';
  full_name: string;
}

/**
 * Login user with username and password
 */
export async function login(username: string, password: string): Promise<{ success: boolean; user?: UserSession; error?: string }> {
  try {
    // Query user from database
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      return { success: false, error: 'Database error occurred' };
    }

    if (!users || users.length === 0) {
      return { success: false, error: 'Invalid username or password' };
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Update last login timestamp
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Create session object
    const userSession: UserSession = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    };

    // Save session to localStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));

    return { success: true, user: userSession };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Logout user and clear session
 */
export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  // Redirect to login page
  window.location.href = '/login';
}

/**
 * Get current user session
 */
export function getCurrentUser(): UserSession | null {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return null;
    }
    return JSON.parse(sessionData) as UserSession;
  } catch (error) {
    console.error('Error reading session:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Check if current user has specific role
 */
export function hasRole(role: 'client' | 'advisor'): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export function requireAuth(): UserSession | null {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  return user;
}
