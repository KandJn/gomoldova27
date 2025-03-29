import { supabase } from './supabase';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    console.log('Attempting to send email to:', to);
    console.log('Email subject:', subject);
    
    // Use Supabase's built-in email service
    const { error } = await supabase.auth.admin.sendRawEmail({
      to,
      subject,
      html
    });

    if (error) {
      console.error('Email sending error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      throw new Error(error.message || 'Failed to send email');
    }

    console.log('Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in sendEmail:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    console.log('Sending reset password email to:', email);
    console.log('Redirect URL:', `${window.location.origin}/update-password`);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
      options: {
        emailRedirectTo: `${window.location.origin}/update-password`,
        data: {
          email: email
        }
      }
    });

    if (error) {
      console.error('Error sending reset email:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      throw new Error(error.message || 'Failed to send reset email');
    }

    console.log('Password reset email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    throw error;
  }
}

export async function verifyResetToken(token: string) {
  try {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('email')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      throw new Error('Invalid or expired token');
    }

    return data.email;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
}

export async function updatePassword(newPassword: string) {
  try {
    console.log('Starting password update process...');
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw new Error('Failed to get session');
    }
    
    if (!session) {
      console.error('No active session found');
      throw new Error('No active session found');
    }

    console.log('Session found, updating password...');

    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Error updating password:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      throw error;
    }

    console.log('Password updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in updatePassword:', error);
    throw error;
  }
} 