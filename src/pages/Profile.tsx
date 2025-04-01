import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Camera, Loader2, MapPin, Phone, Mail, Globe, Shield, Clock, Car, CreditCard, Bell, User, Wrench, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAvatar } from '../contexts/AvatarContext';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { DeleteAccountModal } from '../components/DeleteAccountModal';

interface Profile {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
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

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  preferred_language: string;
}

interface Stats {
  totalTrips: number;
  completedTrips: number;
  totalSpent: number;
}

interface Preferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  language: string;
  currency: string;
}

interface BookingData {
  id: string;
  status: string;
  amount_paid: number;
}

interface CarInfo {
  brand: string;
  model: string;
  year: string;
  color: string;
  plate_number: string;
  seats: number;
}

interface PreferencesData {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  language: string;
  currency: string;
  user_id: string;
}

// Add car data constants
const CAR_BRANDS = [
  'Audi', 'BMW', 'Chevrolet', 'Dacia', 'Ford', 'Honda', 'Hyundai', 'Kia',
  'Mazda', 'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Skoda',
  'Toyota', 'Volkswagen', 'Volvo'
];

const CAR_MODELS: { [key: string]: string[] } = {
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', 'X1', 'X3', 'X5', 'X6'],
  'Chevrolet': ['Aveo', 'Cruze', 'Malibu', 'Spark', 'Captiva', 'Orlando'],
  'Dacia': ['Logan', 'Sandero', 'Duster', 'Lodgy', 'Dokker'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Puma', 'Transit'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz'],
  'Hyundai': ['i20', 'i30', 'i40', 'Tucson', 'Santa Fe', 'Kona'],
  'Kia': ['Rio', 'Ceed', 'Sportage', 'Sorento', 'Stonic'],
  'Mazda': ['2', '3', '6', 'CX-3', 'CX-5', 'CX-30'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf'],
  'Opel': ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Grandland X'],
  'Peugeot': ['208', '308', '508', '2008', '3008', '5008'],
  'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Trafic'],
  'Skoda': ['Fabia', 'Octavia', 'Superb', 'Karoq', 'Kodiaq'],
  'Toyota': ['Yaris', 'Corolla', 'Camry', 'RAV4', 'C-HR', 'Land Cruiser'],
  'Volkswagen': ['Polo', 'Golf', 'Passat', 'Tiguan', 'T-Roc', 'Transporter'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90']
};

const COLORS = [
  'Alb', 'Negru', 'Gri', 'Argintiu', 'Albastru', 'Roșu', 'Verde',
  'Galben', 'Portocaliu', 'Maro', 'Bej', 'Auriu', 'Violet'
];

const YEARS = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

export function Profile() {
  const { profile, setProfile } = useAuthStore();
  const { updateAvatarTimestamp } = useAvatar();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalTrips: 0,
    completedTrips: 0,
    totalSpent: 0
  });
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    language: 'ro',
    currency: 'RON'
  });
  const [formData, setFormData] = useState<FormData>({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    address: profile?.address || '',
    city: profile?.city || '',
    country: profile?.country || 'Moldova',
    preferred_language: profile?.preferred_language || 'ro'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [carInfo, setCarInfo] = useState<CarInfo>({
    brand: '',
    model: '',
    year: '',
    color: '',
    plate_number: '',
    seats: 0
  });
  const [isEditingCar, setIsEditingCar] = useState(false);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([]);
  const [colorSuggestions, setColorSuggestions] = useState<string[]>([]);
  const [yearSuggestions, setYearSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState({
    brand: false,
    model: false,
    color: false,
    year: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Add useEffect for initial profile fetch
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Nu există utilizator autentificat');
        }
        
        // Get registration name from storage
        const registrationName = localStorage.getItem('registration_name') || sessionStorage.getItem('registration_name') || '';
        const registrationFirstName = localStorage.getItem('registration_first_name') || sessionStorage.getItem('registration_first_name') || '';
        const registrationLastName = localStorage.getItem('registration_last_name') || sessionStorage.getItem('registration_last_name') || '';
        
        // Check if we need to add first_name and last_name columns
        try {
          // Check if first_name column exists
          const { error: columnCheckError } = await supabase.rpc('check_column_exists', {
            table_name: 'profiles',
            column_name: 'first_name'
          });
          
          // If the column doesn't exist, add it
          if (columnCheckError) {
            console.log('Adding first_name and last_name columns to profiles table');
            // Try to add columns
            await supabase.rpc('add_name_columns_to_profiles');
          }
        } catch (columnError) {
          console.error('Error checking or adding columns:', columnError);
          // Continue anyway - we'll just use full_name
        }
        
        // Get profile data with explicit select statement
        const { data: dbData, error } = await supabase
          .from('profiles')
          .select('id, full_name, phone, avatar_url, address, city, country, created_at, updated_at')
          .eq('id', user.id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist yet, create one
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: registrationName,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
              
            if (insertError) throw insertError;
            
            // Set profile with the new data
            setProfile({
              ...newProfile,
              first_name: registrationFirstName,
              last_name: registrationLastName,
              email: user.email || null,
              preferred_language: 'ro'
            });
          } else {
            throw error;
          }
        } else if (dbData) {
          // Check if we have a full name but need to split it
          let firstName = registrationFirstName;
          let lastName = registrationLastName;
          
          if (!firstName && !lastName && dbData.full_name) {
            // Split full name into first and last name
            const nameParts = dbData.full_name.trim().split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }
          
          // Create profile data object
          const profileData = {
            id: dbData.id,
            full_name: dbData.full_name || registrationName,
            first_name: firstName,
            last_name: lastName,
            email: user.email || null,
            phone: dbData.phone,
            avatar_url: dbData.avatar_url,
            address: dbData.address,
            city: dbData.city,
            country: dbData.country,
            created_at: dbData.created_at,
            updated_at: dbData.updated_at,
            preferred_language: 'ro' // Set default language
          };
          
          // Update profile in database if name fields were empty but we have registration name
          if ((!firstName || !lastName) && registrationName) {
            await supabase
              .from('profiles')
              .update({ 
                full_name: registrationName
              })
              .eq('id', user.id);
          }
          
          setProfile(profileData);
        }
      } catch (err) {
        console.error('Error in profile fetch:', err);
        setError('Eroare la încărcarea profilului');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setProfile]);

  useEffect(() => {
    fetchUserStats();
    fetchCarInfo();
    fetchPreferences();
  }, [profile?.id]);

  const fetchUserStats = async () => {
    if (!profile?.id) return;

    try {
      const { data: tripsData, error: tripsError } = await supabase
        .from('bookings')
        .select('id, status, amount_paid')
        .eq('user_id', profile.id);

      if (tripsError) throw tripsError;

      const completedTrips = (tripsData as BookingData[] || []).filter(t => t.status === 'completed');
      const totalSpent = completedTrips.reduce((sum, t) => sum + (t.amount_paid || 0), 0);

      setStats({
        totalTrips: tripsData?.length || 0,
        completedTrips: completedTrips.length,
        totalSpent
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchCarInfo = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCarInfo({
          brand: (data.brand as string) || '',
          model: (data.model as string) || '',
          year: (data.year as string) || '',
          color: (data.color as string) || '',
          plate_number: (data.plate_number as string) || '',
          seats: (data.seats as number) || 0
        });
      }
    } catch (error) {
      console.error('Error fetching car info:', error);
    }
  };

  const fetchPreferences = async () => {
    if (!profile?.id) return;

    try {
      // Try to fetch existing preferences
      const { data: existingPrefs, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      // If no preferences exist, create default ones
      if (!existingPrefs) {
        const defaultPrefs = {
          user_id: profile.id,
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          language: 'ro',
          currency: 'MDL'
        };

        const { data: newPrefs, error: insertError } = await supabase
          .from('preferences')
          .insert([defaultPrefs])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating preferences:', insertError);
          return;
        }

        setPreferences({
          emailNotifications: defaultPrefs.email_notifications,
          pushNotifications: defaultPrefs.push_notifications,
          smsNotifications: defaultPrefs.sms_notifications,
          language: defaultPrefs.language,
          currency: defaultPrefs.currency
        });
      } else {
        // Use existing preferences
        setPreferences({
          emailNotifications: existingPrefs.email_notifications,
          pushNotifications: existingPrefs.push_notifications,
          smsNotifications: existingPrefs.sms_notifications,
          language: existingPrefs.language,
          currency: existingPrefs.currency
        });
      }
    } catch (error) {
      console.error('Error in preferences handling:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        full_name: fullName,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        updated_at: new Date().toISOString()
      });

      setIsEditing(false);
      toast.success('Profilul a fost actualizat cu succes');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Eroare la actualizarea profilului');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !profile?.id) {
        console.log('No file selected or profile ID missing');
        return;
      }

      setIsUploading(true);
      console.log('Starting avatar upload process for file:', file.name);

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imaginea trebuie să fie mai mică de 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vă rugăm să încărcați doar imagini');
        return;
      }

      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log('Uploading to bucket: profile-picture, path:', filePath);

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-picture')
        .upload(filePath, file, {
          cacheControl: '0',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-picture')
        .getPublicUrl(filePath);
        
      console.log('Public URL generated:', publicUrl);

      // Update profile with new avatar URL
      const { data: profileData, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select();

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }
      
      console.log('Profile updated with new avatar:', profileData);

      // Update local state
      setProfile({
        ...profile,
        avatar_url: publicUrl
      });

      // Update the timestamp to force avatar refresh
      updateAvatarTimestamp();
      toast.success('Imaginea de profil a fost actualizată');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      if (error.message) {
        toast.error(`Eroare: ${error.message}`);
      } else {
        toast.error('Eroare la încărcarea imaginii de profil');
      }
    } finally {
      setIsUploading(false);
      // Reset the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePreferenceChange = async (key: keyof Preferences, value: boolean | string) => {
    if (!profile?.id) return;

    try {
      setPreferences(prev => ({
        ...prev,
        [key]: value
      }));

      const updateData: any = {};
      switch (key) {
        case 'emailNotifications':
          updateData.email_notifications = value;
          break;
        case 'pushNotifications':
          updateData.push_notifications = value;
          break;
        case 'smsNotifications':
          updateData.sms_notifications = value;
          break;
        case 'language':
          updateData.language = value;
          break;
        case 'currency':
          updateData.currency = value;
          break;
      }

      const { error } = await supabase
        .from('preferences')
        .update(updateData)
        .eq('user_id', profile.id);

      if (error) throw error;

      toast.success('Preferințele au fost actualizate');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Eroare la actualizarea preferințelor');
      // Revert the state on error
      fetchPreferences();
    }
  };

  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated and has a profile
    if (!profile?.id) {
      toast.error('Trebuie să fiți autentificat pentru a salva informațiile');
      return;
    }

    // Validate required fields
    if (!carInfo.brand || !carInfo.model || !carInfo.year || !carInfo.color || !carInfo.plate_number || !carInfo.seats) {
      toast.error('Vă rugăm să completați toate câmpurile obligatorii');
      return;
    }

    setIsSubmitting(true);
    try {
      // First check if a car already exists for this user
      const { data: existingCar, error: fetchError } = await supabase
        .from('cars')
        .select('id, user_id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let error;
      if (existingCar?.id) {
        // Update existing car
        const { error: updateError } = await supabase
          .from('cars')
          .update({
            brand: carInfo.brand,
            model: carInfo.model,
            year: carInfo.year,
            color: carInfo.color,
            plate_number: carInfo.plate_number,
            seats: carInfo.seats,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCar.id)
          .eq('user_id', profile.id);
        error = updateError;
      } else {
        // Insert new car
        const { error: insertError } = await supabase
          .from('cars')
          .insert({
            user_id: profile.id,
            brand: carInfo.brand,
            model: carInfo.model,
            year: carInfo.year,
            color: carInfo.color,
            plate_number: carInfo.plate_number,
            seats: carInfo.seats,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        error = insertError;
      }

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Refresh car data
      await fetchCarInfo();
      setIsEditingCar(false);
      toast.success('Informațiile despre mașină au fost actualizate cu succes');
    } catch (error) {
      console.error('Error updating car info:', error);
      toast.error('Eroare la actualizarea informațiilor despre mașină');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add suggestion filtering functions
  const filterSuggestions = (input: string, list: string[]) => {
    const inputLower = input.toLowerCase();
    return list.filter(item => item.toLowerCase().includes(inputLower));
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCarInfo(prev => ({ ...prev, brand: value, model: '' })); // Reset model when brand changes
    setBrandSuggestions(filterSuggestions(value, CAR_BRANDS));
    setShowSuggestions(prev => ({ ...prev, brand: true }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCarInfo(prev => ({ ...prev, model: value }));
    if (carInfo.brand && CAR_MODELS[carInfo.brand]) {
      setModelSuggestions(filterSuggestions(value, CAR_MODELS[carInfo.brand]));
      setShowSuggestions(prev => ({ ...prev, model: true }));
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCarInfo(prev => ({ ...prev, color: value }));
    setColorSuggestions(filterSuggestions(value, COLORS));
    setShowSuggestions(prev => ({ ...prev, color: true }));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCarInfo(prev => ({ ...prev, year: value }));
    setYearSuggestions(filterSuggestions(value, YEARS));
    setShowSuggestions(prev => ({ ...prev, year: true }));
  };

  const handleSuggestionClick = (field: keyof typeof showSuggestions, value: string) => {
    setCarInfo(prev => ({ ...prev, [field]: value }));
    setShowSuggestions(prev => ({ ...prev, [field]: false }));
  };

  // Add loading state display
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Se încarcă profilul...</span>
        </div>
      </div>
    );
  }

  // Add error state display
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Add authentication check
  if (!profile?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-center">
          <p className="text-yellow-600">Trebuie să fiți autentificat pentru a accesa această pagină</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profil</h1>
      
      {/* Main Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-6">
              <div className="relative group">
                <div 
                  className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 cursor-pointer relative"
                  onClick={handleAvatarClick}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500 text-xl">
                        {profile?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                          Prenume
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                          Nume de familie
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          disabled
                          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Adresă
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                          Oraș
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                          Țară
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Anulare
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Salvare
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h2 className="text-lg font-semibold flex items-center">
                          <User className="h-5 w-5 mr-2 text-gray-500" />
                          Nume complet
                        </h2>
                        <p className="text-gray-600">
                          {profile?.first_name || ''} {profile?.last_name || ''}
                          {!profile?.first_name && !profile?.last_name && 'Nesetat'}
                        </p>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold flex items-center">
                          <Mail className="h-5 w-5 mr-2 text-gray-500" />
                          Email
                        </h2>
                        <p className="text-gray-600">{profile?.email || 'Nesetat'}</p>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold flex items-center">
                          <Phone className="h-5 w-5 mr-2 text-gray-500" />
                          Telefon
                        </h2>
                        <p className="text-gray-600">{profile?.phone || 'Nesetat'}</p>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                          Adresă
                        </h2>
                        <p className="text-gray-600">{profile?.address || 'Nesetat'}</p>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold flex items-center">
                          <Globe className="h-5 w-5 mr-2 text-gray-500" />
                          Oraș
                        </h2>
                        <p className="text-gray-600">{profile?.city || 'Nesetat'}</p>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold flex items-center">
                          <Globe className="h-5 w-5 mr-2 text-gray-500" />
                          Țară
                        </h2>
                        <p className="text-gray-600">{profile?.country || 'Nesetat'}</p>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setFormData({
                            ...formData,
                            first_name: profile?.first_name || '',
                            last_name: profile?.last_name || '',
                            phone: profile?.phone || '',
                            email: profile?.email || '',
                            address: profile?.address || '',
                            city: profile?.city || '',
                            country: profile?.country || 'Moldova'
                          });
                        }}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Editare profil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Statistici</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Car className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Total călătorii</p>
                      <p className="text-xl font-bold text-gray-900">{stats.totalTrips}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Călătorii finalizate</p>
                      <p className="text-xl font-bold text-gray-900">{stats.completedTrips}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Total cheltuit</p>
                      <p className="text-xl font-bold text-gray-900">{stats.totalSpent} MDL</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Car Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Informații mașină</h2>
              {!isEditingCar && (
                <button
                  onClick={() => setIsEditingCar(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {carInfo.brand ? 'Editare mașină' : 'Adaugă mașină'}
                </button>
              )}
            </div>

            {isEditingCar ? (
              <form onSubmit={handleCarSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                      Marca
                    </label>
                    <input
                      type="text"
                      id="brand"
                      value={carInfo.brand}
                      onChange={handleBrandChange}
                      onFocus={() => setShowSuggestions(prev => ({ ...prev, brand: true }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                    {showSuggestions.brand && brandSuggestions.length > 0 && (
                      <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {brandSuggestions.map((brand) => (
                          <li
                            key={brand}
                            onClick={() => handleSuggestionClick('brand', brand)}
                            className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-50"
                          >
                            {brand}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="relative">
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <input
                      type="text"
                      id="model"
                      value={carInfo.model}
                      onChange={handleModelChange}
                      onFocus={() => setShowSuggestions(prev => ({ ...prev, model: true }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                    {showSuggestions.model && modelSuggestions.length > 0 && (
                      <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {modelSuggestions.map((model) => (
                          <li
                            key={model}
                            onClick={() => handleSuggestionClick('model', model)}
                            className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-50"
                          >
                            {model}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="relative">
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                      An fabricație
                    </label>
                    <input
                      type="text"
                      id="year"
                      value={carInfo.year}
                      onChange={handleYearChange}
                      onFocus={() => setShowSuggestions(prev => ({ ...prev, year: true }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                    {showSuggestions.year && yearSuggestions.length > 0 && (
                      <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {yearSuggestions.map((year) => (
                          <li
                            key={year}
                            onClick={() => handleSuggestionClick('year', year)}
                            className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-50"
                          >
                            {year}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="relative">
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                      Culoare
                    </label>
                    <input
                      type="text"
                      id="color"
                      value={carInfo.color}
                      onChange={handleColorChange}
                      onFocus={() => setShowSuggestions(prev => ({ ...prev, color: true }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                    {showSuggestions.color && colorSuggestions.length > 0 && (
                      <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {colorSuggestions.map((color) => (
                          <li
                            key={color}
                            onClick={() => handleSuggestionClick('color', color)}
                            className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-50"
                          >
                            {color}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label htmlFor="plate_number" className="block text-sm font-medium text-gray-700">
                      Număr înmatriculare
                    </label>
                    <input
                      type="text"
                      id="plate_number"
                      value={carInfo.plate_number}
                      onChange={(e) => setCarInfo(prev => ({ ...prev, plate_number: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="seats" className="block text-sm font-medium text-gray-700">
                      Număr locuri
                    </label>
                    <input
                      type="number"
                      id="seats"
                      value={carInfo.seats}
                      onChange={(e) => setCarInfo(prev => ({ ...prev, seats: parseInt(e.target.value) || 0 }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                      min="1"
                      max="60"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingCar(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Anulare
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Se salvează...
                      </div>
                    ) : (
                      'Salvare'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {carInfo.brand ? (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center">
                        <Car className="h-4 w-4 mr-2" />
                        Marca și model
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">{carInfo.brand} {carInfo.model}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        An fabricație
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">{carInfo.year}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center">
                        <Wrench className="h-4 w-4 mr-2" />
                        Culoare
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">{carInfo.color}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Număr înmatriculare
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">{carInfo.plate_number}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Număr locuri
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">{carInfo.seats}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 col-span-2">Nu ați adăugat încă informații despre mașină.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Preferences & Settings */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Informații cont</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Membru din</p>
                <p className="text-gray-900">
                  {profile?.created_at ? format(new Date(profile.created_at), 'dd MMMM yyyy', { locale: ro }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ultima actualizare</p>
                <p className="text-gray-900">
                  {profile?.updated_at ? format(new Date(profile.updated_at), 'dd MMMM yyyy', { locale: ro }) : 'N/A'}
                </p>
              </div>
              <div className="pt-4 border-t">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Șterge cont
                </button>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Notificări</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm text-gray-700">Email</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm text-gray-700">Push</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-sm text-gray-700">SMS</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.smsNotifications}
                    onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Language & Region */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Limbă și regiune</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Limbă
                </label>
                <select
                  id="language"
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="ro">Română</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Monedă
                </label>
                <select
                  id="currency"
                  value={preferences.currency}
                  onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="MDL">MDL</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}