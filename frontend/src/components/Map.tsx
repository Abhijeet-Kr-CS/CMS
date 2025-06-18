'use client';

import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface MapProps {
  pickup?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  onPickupChange?: (location: { lat: number; lng: number }) => void;
  onDestinationChange?: (location: { lat: number; lng: number }) => void;
  isInteractive?: boolean;
}

const defaultCenter = { lat: 51.5074, lng: -0.1278 }; // London as default center
const mapContainerStyle = { width: '100%', height: '400px' };

export default function Map({
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
  isInteractive = true,
}: MapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (map && pickup && destination) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(pickup);
      bounds.extend(destination);
      map.fitBounds(bounds);
    }
  }, [map, pickup, destination]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!isInteractive || !event.latLng) return;

    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    if (!pickup && onPickupChange) {
      onPickupChange(location);
    } else if (!destination && onDestinationChange) {
      onDestinationChange(location);
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={pickup || defaultCenter}
        zoom={13}
        onClick={handleMapClick}
        onLoad={setMap}
      >
        {pickup && (
          <Marker
            position={pickup}
            label="P"
            title="Pickup Location"
          />
        )}
        {destination && (
          <Marker
            position={destination}
            label="D"
            title="Destination Location"
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
} 