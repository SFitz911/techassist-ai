import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/use-mapbox-token';
import { MockStore } from '@/lib/mock-stores';

interface SimpleStoreMapProps {
  stores: MockStore[];
  selectedPartName?: string;
  height?: string;
}

export default function SimpleStoreMap({ 
  stores, 
  selectedPartName,
  height = '300px' 
}: SimpleStoreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { token: mapboxToken, isLoading: isTokenLoading } = useMapboxToken();
  
  useEffect(() => {
    if (isTokenLoading || !mapboxToken || !mapContainer.current || map.current) return;
    
    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-95.3698, 29.7604], // Default center (Houston)
      zoom: 10
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.FullscreenControl());
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, isTokenLoading]);
  
  // Add markers when stores or map changes
  useEffect(() => {
    if (!map.current || !stores.length) return;
    
    // Clear existing markers (the DOM elements persist otherwise)
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());
    
    // Calculate bounds for stores
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add markers for each store
    stores.forEach(store => {
      if (!store.longitude || !store.latitude) return;
      
      // Add store to bounds
      bounds.extend([store.longitude, store.latitude]);
      
      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'store-marker';
      markerEl.style.width = '40px';
      markerEl.style.height = '40px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.background = 'rgb(249, 115, 22)';
      markerEl.style.border = '2px solid rgb(253, 186, 116)';
      markerEl.style.display = 'flex';
      markerEl.style.justifyContent = 'center';
      markerEl.style.alignItems = 'center';
      markerEl.style.color = 'white';
      markerEl.style.cursor = 'pointer';
      markerEl.style.zIndex = '10';
      markerEl.style.overflow = 'hidden';
      markerEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
      
      // Create popup with store info
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family: system-ui, sans-serif; min-width: 200px; max-width: 300px;">
          <div style="font-weight: 500; margin-bottom: 4px; font-size: 16px;">${store.name}</div>
          <div style="color: #888; margin-bottom: 8px; font-size: 14px;">${store.distance || '2.3 miles away'}</div>
          <div style="margin-bottom: 4px; font-size: 14px;">
            ${store.address}, ${store.city}, ${store.state} ${store.zipCode}
          </div>
          <div style="margin-bottom: 4px;">
            <a href="tel:${store.phone}" style="color: #22c55e; text-decoration: none; font-size: 14px;">
              ${store.phone}
            </a>
          </div>
          <div style="margin-top: 8px;">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${store.address}, ${store.city}, ${store.state} ${store.zipCode}`)}" 
              target="_blank" 
              style="background: #16a34a; color: white; border: none; border-radius: 4px; padding: 6px 12px; font-size: 14px; text-decoration: none; display: inline-block; text-align: center; width: 100%;"
            >
              Get Directions
            </a>
          </div>
        </div>
      `);
      
      // Add marker with popup
      new mapboxgl.Marker(markerEl)
        .setLngLat([store.longitude, store.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
    
    // Fit bounds if we have stores
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14
      });
    }
  }, [stores, map.current]);
  
  return (
    <div className="w-full rounded-md overflow-hidden relative">
      <div className="px-4 py-2 border-b bg-gradient-to-r from-slate-900 to-slate-800 absolute top-0 left-0 right-0 z-10">
        <p className="text-sm font-medium">
          <span className="text-amber-500">
            {stores.length} store{stores.length !== 1 ? 's' : ''} near you
          </span>
          {selectedPartName && (
            <span className="ml-1 text-white">with <span className="font-bold text-amber-500">{selectedPartName}</span></span>
          )}
        </p>
      </div>
      
      {isTokenLoading ? (
        <div style={{ height }} className="flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      ) : mapboxToken ? (
        <div ref={mapContainer} style={{ height }} />
      ) : (
        <div style={{ height }} className="flex flex-col items-center justify-center bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <p className="text-sm text-muted-foreground">Map not available - API token missing</p>
        </div>
      )}
    </div>
  );
}