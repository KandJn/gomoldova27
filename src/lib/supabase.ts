import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iqekgptnsqfkafjjwdon.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase client initialized with URL:', supabaseUrl);
console.log('Using anon key starting with:', supabaseAnonKey?.substring(0, 10) + '...');

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Export a function to get the admin client when needed
let adminClient: ReturnType<typeof createClient> | null = null;

export const getAdminClient = () => {
  if (!adminClient) {
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
    }
    
    adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return adminClient;
};

// Test client (for testing purposes)
export const createTestClient = (url: string = supabaseUrl, key: string = supabaseAnonKey) => {
  return createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: 'supabase.auth.test.token',
    },
  });
};

export const createAdminUser = async () => {
  try {
    const adminEmail = 'admin@gomoldova.md';
    const adminPassword = 'AdminPassword123!';

    // Try to sign in as admin first to check if exists
    const { data: signInData, error: signInError } = await getAdminClient().auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (!signInError && signInData.user) {
      console.log('Admin user already exists');
      return signInData.user;
    }

    // Create admin user if doesn't exist
    const { data, error } = await getAdminClient().auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return null;
    }

    console.log('Admin user created successfully');
    return data.user;
  } catch (error) {
    console.error('Error in createAdminUser:', error);
    return null;
  }
};

// Log auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user?.id);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});