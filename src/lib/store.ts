import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  created_at: string | null;
  updated_at: string | null;
  preferred_language?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
}));

interface SearchState {
  from: string;
  to: string;
  date: string;
  filters: {
    minPrice: string;
    maxPrice: string;
    minSeats: string;
    sortBy: string;
  };
  setSearch: (search: Partial<Omit<SearchState, 'setSearch' | 'setFilters' | 'filters'>>) => void;
  setFilters: (filters: SearchState['filters']) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  from: '',
  to: '',
  date: '',
  filters: {
    minPrice: '',
    maxPrice: '',
    minSeats: '',
    sortBy: 'date_asc',
  },
  setSearch: (search) => set((state) => ({ ...state, ...search })),
  setFilters: (filters) => set((state) => ({ ...state, filters })),
}));

type Language = 'ro' | 'en' | 'ru';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'ro',
  setLanguage: (language) => {
    set({ language });
    localStorage.setItem('preferredLanguage', language);
  },
}));

// Initialize language from localStorage if available
const savedLanguage = localStorage.getItem('preferredLanguage') as Language;
if (savedLanguage && ['ro', 'en', 'ru'].includes(savedLanguage)) {
  useLanguageStore.getState().setLanguage(savedLanguage);
}