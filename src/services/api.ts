import { supabase } from '../lib/supabase';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const authApi = {
  checkEmail: async (email: string): Promise<ApiResponse<{ exists: boolean }>> => {
    try {
      const { data, error } = await supabase
        .rpc('check_email_exists', { check_email: email })
        .single();

      if (error) {
        console.error('Error checking email:', error);
        return {
          success: false,
          error: 'An error occurred while checking email'
        };
      }

      return {
        success: true,
        data: { exists: !!data?.email_exists }
      };
    } catch (error) {
      console.error('Unexpected error checking email:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while checking email'
      };
    }
  }
}; 