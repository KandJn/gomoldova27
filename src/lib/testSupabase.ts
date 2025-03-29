import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    // Try to fetch a small amount of data to test the connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    return {
      success: true,
      data,
      details: {
        timestamp: new Date().toISOString()
      }
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      details: err
    };
  }
}

export async function testSupabaseAuth(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    return {
      success: true,
      user: data.user,
      details: {
        timestamp: new Date().toISOString(),
        session: data.session
      }
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      details: err
    };
  }
} 