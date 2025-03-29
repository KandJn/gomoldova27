import React, { useState, useEffect } from 'react';
import { GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { useGoogleMaps, defaultMapCenter, defaultMapOptions } from '../lib/maps.tsx';

interface MapPreviewProps {
  departureLocation?: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  arrivalLocation?: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  stopovers?: Array<{
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  }>;
  directions?: google.maps.DirectionsResult;
  onLoad?: (map: google.maps.Map) => void;
  className?: string;
  mapContainerStyle?: React.CSSProperties;
  showMarkers?: boolean;
  showDirections?: boolean;
  zoom?: number;
  center?: google.maps.LatLngLiteral;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onMarkerDragEnd?: (e: google.maps.MapMouseEvent) => void;
  draggableMarker?: boolean;
}

export function MapPreview({
  departureLocation,
  arrivalLocation,
  stopovers = [],
  directions,
  onLoad,
  className = '',
  mapContainerStyle = { width: '100%', height: '100%' },
  showMarkers = true,
  showDirections = true,
  zoom = 8,
  center,
  onClick,
  onMarkerDragEnd,
  draggableMarker = false,
}: MapPreviewProps) {
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (map && directions?.routes[0]?.bounds) {
      map.fitBounds(directions.routes[0].bounds);
    }
  }, [map, directions]);

  const handleLoad = (map: google.maps.Map) => {
    setMap(map);
    if (onLoad) {
      onLoad(map);
    }
  };

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={mapContainerStyle}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center || defaultMapCenter}
        zoom={zoom}
        onLoad={handleLoad}
        options={defaultMapOptions}
        onClick={onClick}
      >
        {showDirections && directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#3B82F6',
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}

        {showMarkers && (
          <>
            {departureLocation?.coordinates && (
              <Marker
                position={departureLocation.coordinates}
                draggable={draggableMarker}
                onDragEnd={onMarkerDragEnd}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new google.maps.Size(40, 40)
                }}
              />
            )}

            {stopovers.map((stopover, index) => (
              <Marker
                key={index}
                position={stopover.coordinates}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                  scaledSize: new google.maps.Size(32, 32)
                }}
              />
            ))}

            {arrivalLocation?.coordinates && (
              <Marker
                position={arrivalLocation.coordinates}
                draggable={draggableMarker}
                onDragEnd={onMarkerDragEnd}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  scaledSize: new google.maps.Size(40, 40)
                }}
              />
            )}
          </>
        )}
      </GoogleMap>
    </div>
  );
} 