import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyA2uebsm6mBu7q3b4gDbr_gYkd-U2kzL1o';

export function GoogleMapsLoader({ children }: GoogleMapsLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if the API is already loaded
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    // Create the script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Define the callback
    window.initMap = () => {
      setIsLoaded(true);
    };

    // Add the script to the document
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
      delete window.initMap;
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
} 