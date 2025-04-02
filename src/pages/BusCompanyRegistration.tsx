import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button, TextInput, Textarea, Alert, Card, Label, Select, Dropdown } from 'flowbite-react';
import { HiPaperAirplane, HiIdentification, HiOfficeBuilding, HiPhone, HiMail, HiInformationCircle, HiDocumentText, HiGlobe, HiLocationMarker } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuthStore } from '../lib/store';
import { useJsApiLoader } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

// Common addresses in Moldova
const commonAddresses = [
  { address: 'Strada Ștefan cel Mare 1', city: 'Chișinău', country: 'Moldova' },
  { address: 'Strada Mihai Eminescu 20', city: 'Chișinău', country: 'Moldova' },
  { address: 'Strada Alexandru cel Bun 12', city: 'Chișinău', country: 'Moldova' },
  { address: 'Bulevardul Dacia 23', city: 'Chișinău', country: 'Moldova' },
  { address: 'Strada Kiev 14', city: 'Chișinău', country: 'Moldova' },
  { address: 'Strada Pushkin 32', city: 'Chișinău', country: 'Moldova' },
  { address: 'Bulevardul Moscova 5', city: 'Chișinău', country: 'Moldova' },
  { address: 'Strada Ismail 88', city: 'Chișinău', country: 'Moldova' },
  { address: 'Strada Armenească 44', city: 'Chișinău', country: 'Moldova' },
  { address: 'Strada Columna 72', city: 'Chișinău', country: 'Moldova' },
  { address: 'Strada Alecu Russo 15', city: 'Chișinău', country: 'Moldova' },
  { address: 'Bulevardul Ștefan cel Mare și Sfânt 124', city: 'Chișinău', country: 'Moldova' },
  { address: 'Strada Calea Ieșilor 10', city: 'Chișinău', country: 'Moldova' },
  { address: 'Strada Mitropolit Varlaam 65', city: 'Chișinău', country: 'Moldova' },
  { address: 'Strada Vasile Alecsandri 107', city: 'Chișinău', country: 'Moldova' },
  { address: 'Strada Decebal 10', city: 'Bălți', country: 'Moldova' },
  { address: 'Strada Independenței 8', city: 'Bălți', country: 'Moldova' },
  { address: 'Strada Ștefan cel Mare 5', city: 'Bălți', country: 'Moldova' },
  { address: 'Strada Pușkin 19', city: 'Bălți', country: 'Moldova' },
  { address: 'Strada Mihai Eminescu 33', city: 'Bălți', country: 'Moldova' },
  { address: 'Strada Kiev 7', city: 'Bălți', country: 'Moldova' },
  { address: 'Strada 31 August 16', city: 'Bălți', country: 'Moldova' },
  { address: 'Bulevardul Traian 8', city: 'Orhei', country: 'Moldova' },
  { address: 'Strada Vasile Lupu 3', city: 'Orhei', country: 'Moldova' },
  { address: 'Strada Mihai Eminescu 9', city: 'Orhei', country: 'Moldova' },
  { address: 'Strada Piatra Neamț 14', city: 'Orhei', country: 'Moldova' },
  { address: 'Strada 31 August 12', city: 'Cahul', country: 'Moldova' },
  { address: 'Strada Independenței 7', city: 'Cahul', country: 'Moldova' },
  { address: 'Strada Mihai Eminescu 24', city: 'Cahul', country: 'Moldova' },
  { address: 'Strada Ștefan cel Mare 3', city: 'Cahul', country: 'Moldova' },
  { address: 'Strada Bogdan Petriceicu Hașdeu 10', city: 'Cahul', country: 'Moldova' },
  { address: 'Strada Ștefan cel Mare 10', city: 'Ungheni', country: 'Moldova' },
  { address: 'Strada Națională 15', city: 'Ungheni', country: 'Moldova' },
  { address: 'Strada Alexandru cel Bun 8', city: 'Ungheni', country: 'Moldova' },
  { address: 'Strada Decebal 4', city: 'Ungheni', country: 'Moldova' },
  { address: 'Strada Mihai Eminescu 8', city: 'Soroca', country: 'Moldova' },
  { address: 'Strada Independenței 12', city: 'Soroca', country: 'Moldova' },
  { address: 'Strada Ștefan cel Mare 22', city: 'Soroca', country: 'Moldova' },
  { address: 'Strada Petru Rareș 6', city: 'Soroca', country: 'Moldova' },
  { address: 'Strada Dimitrie Cantemir 9', city: 'Comrat', country: 'Moldova' },
  { address: 'Strada Lenin 11', city: 'Comrat', country: 'Moldova' },
  { address: 'Strada Pobeda 15', city: 'Comrat', country: 'Moldova' },
  { address: 'Strada Biruința 7', city: 'Comrat', country: 'Moldova' },
  { address: 'Strada Ștefan cel Mare 5', city: 'Hîncești', country: 'Moldova' },
  { address: 'Strada 31 August 18', city: 'Hîncești', country: 'Moldova' },
  { address: 'Strada Chișinăului 9', city: 'Hîncești', country: 'Moldova' },
  { address: 'Strada Mihai Eminescu 7', city: 'Edineț', country: 'Moldova' },
  { address: 'Strada Independenței 14', city: 'Edineț', country: 'Moldova' },
  { address: 'Strada Ștefan cel Mare 6', city: 'Edineț', country: 'Moldova' },
  { address: 'Strada Independenței 9', city: 'Drochia', country: 'Moldova' },
  { address: 'Strada 31 August 8', city: 'Drochia', country: 'Moldova' },
  { address: 'Strada Ștefan cel Mare 12', city: 'Strășeni', country: 'Moldova' },
  { address: 'Strada Mihai Eminescu 23', city: 'Strășeni', country: 'Moldova' },
  { address: 'Strada Ștefan cel Mare 7', city: 'Ialoveni', country: 'Moldova' },
  { address: 'Strada Alexandru cel Bun 5', city: 'Ialoveni', country: 'Moldova' },
  { address: 'Strada Tighina 11', city: 'Căușeni', country: 'Moldova' },
  { address: 'Strada Mihai Eminescu 18', city: 'Căușeni', country: 'Moldova' },
  { address: 'Strada Ștefan cel Mare 9', city: 'Florești', country: 'Moldova' },
  { address: 'Strada 31 August 17', city: 'Florești', country: 'Moldova' },
];

export const BusCompanyRegistration = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [placesResults, setPlacesResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [filteredAddresses, setFilteredAddresses] = useState(commonAddresses);
  const addressWrapperRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [formData, setFormData] = useState({
    company_name: '',
    registration_number: '',
    tax_id: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Moldova',
    website: '',
    company_size: '',
    year_founded: new Date().getFullYear(),
    description: '',
    contact_person_name: '',
    contact_person_position: ''
  });

  const countriesList = ['Moldova', 'Romania', 'Ukraine', 'Russia', 'Bulgaria'];
  const companySizes = ['1-10', '11-50', '51-100', '101-500', '500+'];
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 101 }, (_, i) => currentYear - i);

  // Filter addresses from local data when Google Maps API fails or is loading
  useEffect(() => {
    if (formData.address) {
      const filtered = commonAddresses.filter(item => 
        item.address.toLowerCase().includes(formData.address.toLowerCase())
      );
      setFilteredAddresses(filtered);
    } else {
      setFilteredAddresses(commonAddresses);
    }
  }, [formData.address]);

  // Initialize Google Maps services after the API is loaded
  useEffect(() => {
    if (isLoaded && !loadError) {
      try {
        autocompleteService.current = new google.maps.places.AutocompleteService();
        
        // Create a hidden map div for PlacesService (required by the API)
        if (!mapRef.current) {
          const mapDiv = document.createElement('div');
          mapDiv.style.display = 'none';
          document.body.appendChild(mapDiv);
          mapRef.current = mapDiv;
          const map = new google.maps.Map(mapRef.current);
          placesService.current = new google.maps.places.PlacesService(map);
        }
      } catch (error) {
        console.error("Error initializing Google Maps services:", error);
      }
    }
  }, [isLoaded, loadError]);

  // Handle click outside of address dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addressWrapperRef.current && !addressWrapperRef.current.contains(event.target as Node)) {
        setShowAddressSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get address predictions from Google Places API
  useEffect(() => {
    if (!isLoaded || loadError || !formData.address || formData.address.length < 3 || !autocompleteService.current) {
      setPlacesResults([]);
      return;
    }

    try {
      const request = {
        input: formData.address,
        componentRestrictions: { country: formData.country.toLowerCase() },
        types: ['address']
      };

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            console.log("Autocomplete prediction error:", status);
            setPlacesResults([]);
            return;
          }
          setPlacesResults(predictions);
        }
      );
    } catch (error) {
      console.error("Error getting place predictions:", error);
      setPlacesResults([]);
    }
  }, [formData.address, formData.country, isLoaded, loadError]);

  const handleSelectAddress = (placeId: string | null, description: string, fallbackAddress?: any) => {
    if (!placeId && fallbackAddress) {
      // Use fallback local address data
      setFormData(prev => ({
        ...prev,
        address: fallbackAddress.address,
        city: fallbackAddress.city,
        country: fallbackAddress.country
      }));
      setShowAddressSuggestions(false);
      return;
    }
    
    if (!placesService.current || !placeId) return;
    
    try {
      placesService.current.getDetails(
        { placeId: placeId, fields: ['address_components', 'formatted_address'] },
        (place, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
            console.error("Place details error:", status);
            return;
          }
          
          let city = '';
          let country = '';
          
          place.address_components?.forEach(component => {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('country')) {
              country = component.long_name;
            }
          });
          
          setFormData(prev => ({
            ...prev,
            address: place.formatted_address || description,
            city: city,
            country: country || 'Moldova'
          }));
          
          setShowAddressSuggestions(false);
        }
      );
    } catch (error) {
      console.error("Error getting place details:", error);
    }
  };

  const validateStep1 = () => {
    if (!formData.company_name) {
      setError(t('bus_company_registration.required_fields'));
      return false;
    }
    if (!formData.registration_number) {
      setError(t('bus_company_registration.required_fields'));
      return false;
    }
    if (!formData.email) {
      setError(t('bus_company_registration.required_fields'));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(t('bus_company_registration.email_validation'));
      return false;
    }
    if (!formData.phone) {
      setError(t('bus_company_registration.required_fields'));
      return false;
    }
    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      const requiredFields = ['company_name', 'registration_number', 'email', 'phone', 'contact_person_name'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        throw new Error(t('bus_company_registration.required_fields'));
      }

      // Insert into bus_companies table using public client
      const { data, error: insertError } = await supabase
        .from('bus_companies')
        .insert([
          {
            company_name: formData.company_name,
            registration_number: formData.registration_number,
            tax_id: formData.tax_id || null,
            email: formData.email,
            phone: formData.phone,
            address: formData.address || null,
            city: formData.city || null,
            country: formData.country || 'Moldova',
            website: formData.website || null,
            company_size: formData.company_size || null,
            year_founded: formData.year_founded || null,
            description: formData.description || null,
            contact_person_name: formData.contact_person_name,
            contact_person_position: formData.contact_person_position || null,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw new Error(`Failed to submit registration: ${insertError.message}`);
      }

      // Create a notification for admin
      await supabase.from('notifications').insert([
        {
          type: 'bus_company_registration',
          title: 'New Bus Company Registration',
          content: `${formData.company_name} has submitted a registration request`,
          metadata: { company_id: data?.[0]?.id },
          read_at: null,
          created_at: new Date().toISOString()
        }
      ]);

      setSuccess(true);
      toast.success(t('bus_company_registration.registration_submitted'));

      // Clear form
      setFormData({
        company_name: '',
        registration_number: '',
        tax_id: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'Moldova',
        website: '',
        company_size: '',
        year_founded: new Date().getFullYear(),
        description: '',
        contact_person_name: '',
        contact_person_position: ''
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 h-screen flex items-center justify-center">
        <Card className="border-green-500 w-full">
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
              <HiPaperAirplane className="h-10 w-10 text-green-600" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900">{t('bus_company_registration.registration_submitted')}</h4>
            <p className="text-gray-600 px-4">
              {t('bus_company_registration.registration_success_message')}
            </p>
            <div className="mt-6 flex justify-center">
            <Button
              color="gray"
              onClick={() => navigate('/')}
                className="px-5 py-2.5"
            >
                {t('bus_company_registration.return_to_home')}
            </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-blue-100">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-blue-800">{t('bus_company_registration.title')}</h1>
          <p className="text-gray-600 mb-6">
            {t('bus_company_registration.subtitle')}
          </p>
          
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-300'} text-white font-bold`}>1</div>
              <div className={`h-1 w-full mx-2 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'} text-white font-bold`}>2</div>
            </div>
            <div className="flex mt-2">
              <div className="w-1/2 text-center text-sm font-medium">{t('bus_company_registration.company_information')}</div>
              <div className="w-1/2 text-center text-sm font-medium">{t('bus_company_registration.additional_details')}</div>
            </div>
          </div>
      
      {error && (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
                    <div className="mb-4">
                      <Label htmlFor="company_name" value={t('bus_company_registration.fields.company_name')} className="flex items-center">
                        <HiOfficeBuilding className="mr-2 h-5 w-5 text-blue-500" />
                        {t('bus_company_registration.fields.company_name')} *
                      </Label>
          <TextInput
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
                        placeholder={t('bus_company_registration.fields.company_name_placeholder')}
                        required
                        className="w-full mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="registration_number" value={t('bus_company_registration.fields.registration_number')} className="flex items-center">
                        <HiIdentification className="mr-2 h-5 w-5 text-blue-500" />
                        {t('bus_company_registration.fields.registration_number')} *
                      </Label>
                      <TextInput
                        id="registration_number"
                        name="registration_number"
                        value={formData.registration_number}
                        onChange={handleChange}
                        placeholder={t('bus_company_registration.fields.registration_number_placeholder')}
            required
                        className="w-full mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="tax_id" value={t('bus_company_registration.fields.tax_id')} className="flex items-center">
                        <HiDocumentText className="mr-2 h-5 w-5 text-blue-500" />
                        {t('bus_company_registration.fields.tax_id')}
                      </Label>
                      <TextInput
                        id="tax_id"
                        name="tax_id"
                        value={formData.tax_id}
                        onChange={handleChange}
                        placeholder={t('bus_company_registration.fields.tax_id_placeholder')}
                        className="w-full mt-1"
                      />
                    </div>
        </div>

        <div>
                    <div className="mb-4">
                      <Label htmlFor="email" value={t('bus_company_registration.fields.email')} className="flex items-center">
                        <HiMail className="mr-2 h-5 w-5 text-blue-500" />
                        {t('bus_company_registration.fields.email')} *
                      </Label>
          <TextInput
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
                        placeholder={t('bus_company_registration.fields.email_placeholder')}
            required
                        className="w-full mt-1"
          />
        </div>

                    <div className="mb-4">
                      <Label htmlFor="phone" value={t('bus_company_registration.fields.phone')} className="flex items-center">
                        <HiPhone className="mr-2 h-5 w-5 text-blue-500" />
                        {t('bus_company_registration.fields.phone')} *
                      </Label>
          <TextInput
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
                        placeholder={t('bus_company_registration.fields.phone_placeholder')}
                        required
                        className="w-full mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="website" value={t('bus_company_registration.fields.website')} className="flex items-center">
                        <HiGlobe className="mr-2 h-5 w-5 text-blue-500" />
                        {t('bus_company_registration.fields.website')}
                      </Label>
                      <TextInput
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder={t('bus_company_registration.fields.website_placeholder')}
                        className="w-full mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    color="blue"
                    size="sm"
                    className="px-3 py-1 text-sm font-medium bg-blue-600 hover:bg-blue-700"
                  >
                    {t('bus_company_registration.next')} →
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4 relative">
                      <Label htmlFor="address" value={t('bus_company_registration.fields.address')} className="flex items-center">
                        <HiLocationMarker className="mr-2 h-5 w-5 text-blue-500" />
                        {t('bus_company_registration.fields.address')}
                      </Label>
                      <div className="relative" ref={addressWrapperRef}>
                        <TextInput
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={(e) => {
                            handleChange(e);
                            setShowAddressSuggestions(true);
                          }}
                          onFocus={() => setShowAddressSuggestions(true)}
                          placeholder={t('bus_company_registration.fields.address_placeholder')}
                          className="w-full mt-1"
                          icon={HiLocationMarker}
                        />
                        {isLoaded && !loadError && showAddressSuggestions && placesResults.length > 0 ? (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {placesResults.map((place) => (
                              <div 
                                key={place.place_id} 
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSelectAddress(place.place_id, place.description)}
                              >
                                <div className="font-medium">{place.structured_formatting?.main_text || place.description}</div>
                                <div className="text-sm text-gray-500">{place.structured_formatting?.secondary_text}</div>
                              </div>
                            ))}
                          </div>
                        ) : showAddressSuggestions && filteredAddresses.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredAddresses.map((item, index) => (
                              <div 
                                key={index} 
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSelectAddress(null, '', item)}
                              >
                                <div className="font-medium">{item.address}</div>
                                <div className="text-sm text-gray-500">{item.city}, {item.country}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {t('bus_company_registration.fields.address_hint')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="city" value={t('bus_company_registration.fields.city')} className="block mb-1">
                          {t('bus_company_registration.fields.city')}
                        </Label>
                        <TextInput
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder={t('bus_company_registration.fields.city_placeholder')}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" value={t('bus_company_registration.fields.country')} className="block mb-1">
                          {t('bus_company_registration.fields.country')}
                        </Label>
                        <Select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full"
                        >
                          {countriesList.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="company_size" value={t('bus_company_registration.fields.company_size')} className="block mb-1">
                          {t('bus_company_registration.fields.company_size')}
                        </Label>
                        <Select
                          id="company_size"
                          name="company_size"
                          value={formData.company_size}
                          onChange={handleChange}
                          className="w-full"
                        >
                          <option value="">{t('bus_company_registration.fields.select_size')}</option>
                          {companySizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="year_founded" value={t('bus_company_registration.fields.year_founded')} className="block mb-1">
                          {t('bus_company_registration.fields.year_founded')}
                        </Label>
                        <Select
                          id="year_founded"
                          name="year_founded"
                          value={formData.year_founded}
                          onChange={handleChange}
                          className="w-full"
                        >
                          {yearsList.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <Label htmlFor="contact_person_name" value={t('bus_company_registration.fields.contact_person_name')} className="flex items-center">
                        <HiIdentification className="mr-2 h-5 w-5 text-blue-500" />
                        {t('bus_company_registration.fields.contact_person_name')} *
                      </Label>
                      <TextInput
                        id="contact_person_name"
                        name="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={handleChange}
                        placeholder={t('bus_company_registration.fields.contact_person_name_placeholder')}
            required
                        className="w-full mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="contact_person_position" value={t('bus_company_registration.fields.contact_person_position')} className="block mb-1">
                        {t('bus_company_registration.fields.contact_person_position')}
                      </Label>
                      <TextInput
                        id="contact_person_position"
                        name="contact_person_position"
                        value={formData.contact_person_position}
                        onChange={handleChange}
                        placeholder={t('bus_company_registration.fields.contact_person_position_placeholder')}
            className="w-full"
          />
        </div>

        <div>
                      <Label htmlFor="description" value={t('bus_company_registration.fields.description')} className="flex items-center">
                        <HiInformationCircle className="mr-2 h-5 w-5 text-blue-500" />
                        {t('bus_company_registration.fields.description')}
                      </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
                        placeholder={t('bus_company_registration.fields.description_placeholder')}
            rows={4}
                        className="w-full mt-1"
          />
                    </div>
                  </div>
        </div>

                <div className="pt-4 flex items-center justify-between">
                  <Button
                    type="button"
                    onClick={handlePrevStep}
                    color="light"
                    size="sm"
                    className="px-2 py-1 text-sm"
                  >
                    ← {t('bus_company_registration.back')}
                  </Button>
          <Button
            type="submit"
            disabled={loading}
            isProcessing={loading}
                    color="blue"
                    size="sm"
                    className="px-3 py-1 text-sm font-medium bg-blue-600 hover:bg-blue-700"
                  >
                    <HiPaperAirplane className="mr-1 h-3 w-3" />
                    {t('bus_company_registration.submit_registration')}
          </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </Card>
    </div>
  );
};