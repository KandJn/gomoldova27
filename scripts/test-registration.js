import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqekgptnsqfkafjjwdon.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxZWtncHRuc3Fma2Fmamp3ZG9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTM5OTU3NywiZXhwIjoyMDU0OTc1NTc3fQ.Rl6I6EvDJcQXwgm0n9BQ2r_MOw_v9e4e_1pqXyVPtpY';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createTestCompany() {
  const { data, error } = await supabase
    .from('bus_companies')
    .insert([
      {
        company_name: 'Test Bus Company',
        email: 'gomoldova.contact@gmail.com',
        phone: '+37312345678',
        status: 'pending'
      }
    ])
    .select();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Test company created:', data);
  }
}

createTestCompany(); 