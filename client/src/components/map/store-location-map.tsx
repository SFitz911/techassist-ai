import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, ExternalLink } from 'lucide-react';
import { useMapboxToken } from '@/hooks/use-mapbox-token';

interface StoreLocationMapProps {
  storeName: string;
  latitude: number;
  longitude: number;
  className?: string;
  mapboxToken?: string;
}

export default function StoreLocationMap({ 
  storeName, 
  latitude, 
  longitude, 
  className = "h-48 w-full rounded-md overflow-hidden",
  mapboxToken
}: StoreLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<boolean>(false);
  const { token: apiToken, isLoading: isLoadingToken } = useMapboxToken();

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Don't proceed if we're still loading the token
    if (isLoadingToken) return;
    
    // Set Mapbox token from props (highest priority)
    if (mapboxToken) {
      mapboxgl.accessToken = mapboxToken;
    } 
    // Use token from API (second priority)
    else if (apiToken) {
      mapboxgl.accessToken = apiToken;
    } 
    // No token available
    else {
      console.error("Mapbox token is missing");
      setMapError(true);
      return;
    }
    
    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [longitude, latitude],
        zoom: 14,
        interactive: true,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add marker for the store
      const marker = new mapboxgl.Marker({ color: '#F59E0B' })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${storeName}</strong>`))
        .addTo(map.current);
        
      // Open popup by default
      marker.togglePopup();
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(true);
    }
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [storeName, latitude, longitude, mapboxToken]);

  if (mapError) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-muted border border-border`}>
        <MapPin className="h-8 w-8 mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Map not available</p>
        <a 
          href={`https://maps.google.com/?q=${latitude},${longitude}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center mt-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View on Google Maps
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="h-full w-full" ref={mapContainer} />
      <div className="absolute bottom-1 right-1 z-10">
        <a 
          href={`https://maps.google.com/?q=${latitude},${longitude}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm hover:bg-green-600 transition-colors"
        >
          Get Directions
        </a>
      </div>
    </div>
  );
}