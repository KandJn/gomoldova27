import { createAdminUser } from './lib/supabase';

export const initializeAdmin = async () => {
  try {
    await createAdminUser();
    console.log('Admin initialization completed');
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}; 