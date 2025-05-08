import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Use environment variable for the Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface StoreLocationMapProps {
  storeName: string;
  latitude: number;
  longitude: number;
  className?: string;
}

export default function StoreLocationMap({ 
  storeName, 
  latitude, 
  longitude, 
  className = "h-48 w-full rounded-md overflow-hidden" 
}: StoreLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
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
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [storeName, latitude, longitude]);

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