import React, { useState, useEffect, useRef, useCallback } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

export interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onCoordinatesChange?: (coordinates: { lat: number; lng: number }) => void;
}

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  className,
  onCoordinatesChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  
  const {
    ready,
    suggestions: { status, data },
    setValue: setGoogleValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['locality', 'sublocality', 'postal_code', 'neighborhood'],
      componentRestrictions: { country: 'MD' },
    },
    debounce: 0,
    cache: 86400,
    defaultValue: value,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
      setGoogleValue(value, false);
    }
  }, [value]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = e.target.value;
    setInternalValue(newValue);
    setGoogleValue(newValue);
  }, [setGoogleValue]);

  const handleSelect = useCallback(async (e: React.MouseEvent, description: string, placeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const results = await getGeocode({ placeId });
      const { lat, lng } = await getLatLng(results[0]);
      
      const addressComponents = results[0].address_components;
      const cityComponent = addressComponents.find(
        component => component.types.includes('locality')
      );
      
      const cityName = cityComponent ? cityComponent.long_name : description;
      
      setInternalValue(cityName);
      setGoogleValue(cityName, false);
      clearSuggestions();
      setIsFocused(false);
      
      // Use requestAnimationFrame to ensure state updates are complete
      requestAnimationFrame(() => {
        if (onCoordinatesChange) {
          onCoordinatesChange({ lat, lng });
        }
        onChange(cityName);
      });
    } catch (error) {
      console.error("Error getting geocode: ", error);
    }
  }, [onChange, onCoordinatesChange, setGoogleValue]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requestAnimationFrame(() => {
      setIsFocused(false);
      if (internalValue !== value) {
        onChange(internalValue);
      }
    });
  }, [internalValue, value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return (
    <div 
      className="relative w-full" 
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleInputChange}
        onFocus={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsFocused(true);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        autoComplete="off"
        disabled={!ready}
        role="combobox"
        aria-expanded={status === 'OK'}
        aria-autocomplete="list"
        aria-controls="suggestions-list"
      />
      {status === 'OK' && isFocused && data.length > 0 && (
        <ul
          id="suggestions-list"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {data.map(({ place_id, description, structured_formatting }) => (
            <li
              key={place_id}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(e, description, place_id);
              }}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-200 text-gray-700"
              role="option"
            >
              {structured_formatting?.main_text || description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};