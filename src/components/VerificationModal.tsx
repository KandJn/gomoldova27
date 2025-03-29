import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Check, AlertTriangle, Phone, Mail, FileText, Search, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'id' | 'email' | 'phone';
  onVerificationComplete?: () => void;
}

interface Country {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

// Common phone country codes, focusing on Moldova and nearby countries
const countries: Country[] = [
  { name: 'Moldova', code: 'MD', dial_code: '373', flag: '🇲🇩' },
  { name: 'România', code: 'RO', dial_code: '40', flag: '🇷🇴' },
  { name: 'Ucraina', code: 'UA', dial_code: '380', flag: '🇺🇦' },
  { name: 'Bulgaria', code: 'BG', dial_code: '359', flag: '🇧🇬' },
  { name: 'Rusia', code: 'RU', dial_code: '7', flag: '🇷🇺' },
  { name: 'Germania', code: 'DE', dial_code: '49', flag: '🇩🇪' },
  { name: 'Italia', code: 'IT', dial_code: '39', flag: '🇮🇹' },
  { name: 'Franța', code: 'FR', dial_code: '33', flag: '🇫🇷' },
  { name: 'Spania', code: 'ES', dial_code: '34', flag: '🇪🇸' },
  { name: 'Portugalia', code: 'PT', dial_code: '351', flag: '🇵🇹' },
  { name: 'Marea Britanie', code: 'GB', dial_code: '44', flag: '🇬🇧' },
  { name: 'Irlanda', code: 'IE', dial_code: '353', flag: '🇮🇪' },
];

export function VerificationModal({ isOpen, onClose, type, onVerificationComplete }: VerificationModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && type === 'email') {
      setEmail(user.email || '');
    }
  }, [user, type]);

  useEffect(() => {
    // Close country dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredCountries = countrySearch
    ? countries.filter(country =>
        country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        country.dial_code.includes(countrySearch)
      )
    : countries;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.match('application/pdf|image/*')) {
        toast.error('Vă rugăm să încărcați un fișier PDF sau o imagine');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Fișierul trebuie să fie mai mic de 5MB');
        return;
      }
      
      setFile(file);
    }
  };

  const handleIdVerification = async () => {
    if (!file || !user) {
      toast.error('Vă rugăm să selectați un fișier');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create folder path with user ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('id-verifications')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('id-verifications')
        .getPublicUrl(fileName);

      // Create verification record
      const { error: verificationError } = await supabase
        .from('verifications')
        .insert([
          {
            user_id: user.id,
            type: 'id',
            status: 'pending',
            data: {
              file_path: fileName,
              file_url: publicUrl,
              original_name: file.name,
              mime_type: file.type
            }
          }
        ]);

      if (verificationError) throw verificationError;

      toast.success('Documentul a fost trimis spre verificare');
      if (onVerificationComplete) onVerificationComplete();
      onClose();
    } catch (error: any) {
      console.error('Error uploading ID:', error);
      toast.error(error.message || 'Eroare la încărcarea documentului');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailVerification = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) throw error;
      setStep(2);
      toast.success('Email de verificare trimis!');
    } catch (error) {
      toast.error('Eroare la trimiterea emailului de verificare');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneVerification = async () => {
    if (step === 1) {
      setIsSubmitting(true);
      try {
        // Create verification record
        const { error } = await supabase
          .from('verifications')
          .insert([
            {
              user_id: user?.id,
              type: 'phone',
              data: { 
                phone,
                country_code: selectedCountry.dial_code
              }
            }
          ]);

        if (error) throw error;

        // In a real app, you would integrate with an SMS service here
        // For demo purposes, we'll simulate sending a code
        setTimeout(() => {
          setStep(2);
          toast.success('Cod de verificare trimis prin SMS');
        }, 1000);
      } catch (error) {
        toast.error('Eroare la trimiterea codului de verificare');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        // In a real app, you would verify the code with your SMS service
        // For demo purposes, we'll accept any 6-digit code
        if (!/^\d{6}$/.test(verificationCode)) {
          throw new Error('Codul trebuie să conțină 6 cifre');
        }

        // Update profile with verified phone
        const { error } = await supabase
          .from('profiles')
          .update({ 
            phone,
            phone_verified: true,
            country_code: selectedCountry.dial_code
          })
          .eq('id', user?.id);

        if (error) throw error;

        toast.success('Număr de telefon verificat cu succes!');
        if (onVerificationComplete) onVerificationComplete();
        onClose();
      } catch (error: any) {
        toast.error(error.message || 'Eroare la verificarea codului');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderPhoneVerification = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 flex items-center mb-2">
              <Phone className="h-5 w-5 mr-2" />
              Verificare număr de telefon
            </h3>
            <p className="text-blue-800 text-sm">
              Vom trimite un cod de verificare prin SMS la numărul dvs. de telefon.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Număr de telefon
            </label>
            <div className="relative" ref={countryDropdownRef}>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
                >
                  <span className="mr-1">{selectedCountry.flag}</span>
                  <span>+{selectedCountry.dial_code}</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPhone(value);
                  }}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Introduceți numărul"
                  required
                />
              </div>

              {showCountryDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg">
                  <div className="p-2">
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md pl-8"
                        placeholder="Căutați țara..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                      />
                      <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-auto">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country);
                          setShowCountryDropdown(false);
                          setCountrySearch('');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="text-gray-500">+{country.dial_code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Exemplu: pentru {selectedCountry.name}, introduceți numărul fără prefixul +{selectedCountry.dial_code}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 flex items-center mb-2">
            <Phone className="h-5 w-5 mr-2" />
            Introduceți codul
          </h3>
          <p className="text-blue-800 text-sm">
            Am trimis un cod de 6 cifre la numărul +{selectedCountry.dial_code} {phone}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cod de verificare
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setVerificationCode(value);
            }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center text-2xl tracking-wider"
            placeholder="000000"
            maxLength={6}
            required
          />
          <p className="mt-2 text-sm text-gray-500 text-center">
            Nu ați primit codul?{' '}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setVerificationCode('');
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Reîncercați
            </button>
          </p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'id':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 flex items-center mb-2">
                <FileText className="h-5 w-5 mr-2" />
                Verificare act de identitate
              </h3>
              <p className="text-blue-800 text-sm">
                Pentru a verifica identitatea dvs., vă rugăm să încărcați o fotografie clară sau un scan al buletinului sau pașaportului.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Încărcați documentul (PDF sau imagine)
              </label>
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${
                  file ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <div className="space-y-1 text-center">
                  {file ? (
                    <div className="flex flex-col items-center">
                      <Check className="h-12 w-12 text-blue-500" />
                      <p className="text-sm text-blue-600 mt-2">{file.name}</p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-sm text-red-600 mt-2 hover:text-red-800"
                      >
                        Șterge
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Încarcă un fișier</span>
                          <input
                            ref={fileInputRef}
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="application/pdf,image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">sau trage și plasează</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF sau imagine până la 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                <div className="text-sm text-yellow-700">
                  <h4 className="font-medium">Important</h4>
                  <ul className="mt-1 list-disc list-inside">
                    <li>Documentul trebuie să fie valid și neexpirat</li>
                    <li>Toate informațiile trebuie să fie clar vizibile</li>
                    <li>Nu sunt acceptate fotografii ale documentelor deteriorate</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'email':
        return step === 1 ? (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 flex items-center mb-2">
                <Mail className="h-5 w-5 mr-2" />
                Verificare email
              </h3>
              <p className="text-blue-800 text-sm">
                Vom trimite un email de verificare la adresa dvs. de email.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresa de email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="nume@exemplu.com"
                required
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Verificați-vă emailul
              </h3>
              <p className="text-blue-800">
                Am trimis un email de verificare la adresa {email}. Vă rugăm să urmați instrucțiunile din email pentru a finaliza verificarea.
              </p>
            </div>
          </div>
        );

      case 'phone':
        return renderPhoneVerification();
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switch (type) {
      case 'id':
        handleIdVerification();
        break;
      case 'email':
        handleEmailVerification();
        break;
      case 'phone':
        handlePhoneVerification();
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderContent()}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (type === 'id' && !file)}
              className={`flex items-center px-4 py-2 border border-transparent rounded-md text-white ${
                isSubmitting || (type === 'id' && !file)
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : step === 2 ? (
                'Verifică'
              ) : (
                'Continuă'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}