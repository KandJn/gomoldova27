import React from 'react';
import { useLoadScript, LoadScriptProps } from '@react-google-maps/api';

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places'];

export const GOOGLE_MAPS_API_KEY = 'AIzaSyA2uebsm6mBu7q3b4gDbr_gYkd-U2kzL1o';

let scriptLoadPromise: Promise<void> | null = null;

export function useGoogleMaps() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
    version: "weekly",
    language: "ro",
    region: "MD",
    preventGoogleFontsLoading: true, // Prevent loading Google Fonts
  });

  React.useEffect(() => {
    // Cleanup function to remove any leftover elements
    return () => {
      const elements = document.querySelectorAll('[id^="gmp-"]');
      elements.forEach(element => element.remove());
    };
  }, []);

  return { isLoaded, loadError };
}

export const defaultMapCenter = {
  lat: 47.0105,
  lng: 28.8638, // Center of Moldova
};

export const defaultMapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

// Helper function to create marker options
export const createMarkerOptions = (color: string = 'blue') => ({
  icon: {
    url: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
    scaledSize: { width: 40, height: 40 }
  }
});

// Helper function to geocode an address
export const geocodeAddress = async (address: string): Promise<{lat: number; lng: number}> => {
  try {
    const geocoder = new google.maps.Geocoder();
    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode(
        { address: address + ', Moldova', region: 'MD' },
        (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(status);
          }
        }
      );
    });

    if (result[0]?.geometry?.location) {
      return {
        lat: result[0].geometry.location.lat(),
        lng: result[0].geometry.location.lng()
      };
    }
    throw new Error('No results found');
  } catch (error) {
    throw new Error('Failed to geocode address');
  }
}; 