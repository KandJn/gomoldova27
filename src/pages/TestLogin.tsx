import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { testSupabaseConnection, testSupabaseAuth } from '../lib/testSupabase';

export function TestLogin() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [supabaseInfo, setSupabaseInfo] = useState<string>('');
  const [directLoginAttempted, setDirectLoginAttempted] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check Supabase configuration on component mount
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    setSupabaseInfo(`URL: ${url ? url.substring(0, 15) + '...' : 'undefined'}\nKey: ${key ? key.substring(0, 10) + '...' : 'undefined'}`);
  }, []);

  const handleTestLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setDebugInfo('');

    try {
      // Log debug info
      setDebugInfo(prev => prev + `Attempting to sign in with ${email}...\n`);
      
      // Try to log in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setDebugInfo(prev => prev + `Login error: ${error.message}\n`);
        
        // If login fails, try to sign up
        setDebugInfo(prev => prev + `Attempting to sign up...\n`);
        
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password
        });

        if (signUpError) {
          setDebugInfo(prev => prev + `Sign up error: ${signUpError.message}\n`);
          throw signUpError;
        }
        
        setDebugInfo(prev => prev + `Sign up successful, trying to login again...\n`);
        
        // Try to login again after signup
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (loginError) {
          setDebugInfo(prev => prev + `Second login attempt error: ${loginError.message}\n`);
          throw loginError;
        }
        
        setDebugInfo(prev => prev + `Second login attempt successful!\n`);
        setSuccess('Account created and login successful! Redirecting...');
      } else {
        setDebugInfo(prev => prev + `Login successful!\n`);
        setSuccess('Login successful! Redirecting...');
      }
      
      // Redirect after successful login
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setDebugInfo('Direct login attempt started...\n');
    setDirectLoginAttempted(true);
    
    try {
      // Create a new Supabase client directly in this function
      const { createClient } = await import('@supabase/supabase-js');
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        throw new Error(`Missing environment variables: URL=${!!url}, KEY=${!!key}`);
      }
      
      setDebugInfo(prev => prev + `Creating new Supabase client with URL: ${url.substring(0, 15)}...\n`);
      const directClient = createClient(url, key);
      
      // Try to sign in
      setDebugInfo(prev => prev + `Attempting direct sign in with ${email}...\n`);
      const { data, error } = await directClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setDebugInfo(prev => prev + `Direct login error: ${error.message}\n`);
        throw error;
      }
      
      setDebugInfo(prev => prev + `Direct login successful! User ID: ${data.user?.id}\n`);
      setSuccess('Direct login successful! Redirecting...');
      
      // Redirect after successful login
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      console.error('Direct login error:', err);
      setError(err.message || 'An error occurred during direct login');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo('Testing Supabase connection...\n');
    
    try {
      const result = await testSupabaseConnection();
      setConnectionTestResult(result);
      
      if (result.success) {
        setDebugInfo(prev => prev + `Connection test successful!\n${JSON.stringify(result, null, 2)}\n`);
      } else {
        setDebugInfo(prev => prev + `Connection test failed: ${result.error}\n${JSON.stringify(result.details, null, 2)}\n`);
        setError(`Connection test failed: ${result.error}`);
      }
    } catch (err: any) {
      console.error('Connection test error:', err);
      setError(err.message || 'An error occurred during connection test');
      setDebugInfo(prev => prev + `Connection test error: ${err.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAuth = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(`Testing Supabase authentication with ${email}...\n`);
    
    try {
      const result = await testSupabaseAuth(email, password);
      
      if (result.success) {
        setDebugInfo(prev => prev + `Authentication test successful!\nUser ID: ${result.user?.id}\n`);
        setSuccess('Authentication test successful!');
      } else {
        setDebugInfo(prev => prev + `Authentication test failed: ${result.error}\n${JSON.stringify(result.details, null, 2)}\n`);
        setError(`Authentication test failed: ${result.error}`);
      }
    } catch (err: any) {
      console.error('Authentication test error:', err);
      setError(err.message || 'An error occurred during authentication test');
      setDebugInfo(prev => prev + `Authentication test error: ${err.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Test Login</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleTestLogin}
            disabled={loading}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Login / Create'}
          </button>
          
          <button
            onClick={handleDirectLogin}
            disabled={loading}
            className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            Direct Login
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleTestConnection}
            disabled={loading}
            className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            Test Connection
          </button>
          
          <button
            onClick={handleTestAuth}
            disabled={loading}
            className="py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            Test Auth
          </button>
        </div>
        
        {supabaseInfo && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-700 mb-2">Supabase Configuration:</h3>
            <pre className="text-xs text-blue-600 whitespace-pre-wrap">{supabaseInfo}</pre>
          </div>
        )}
        
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information:</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 