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
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { token: mapboxToken, isLoading: isTokenLoading } = useMapboxToken();
  
  // Initialize map when component mounts
  useEffect(() => {
    // Don't initialize if already initialized or missing dependencies
    if (isTokenLoading || !mapboxToken || !mapContainer.current || map.current) return;
    
    // Set access token
    mapboxgl.accessToken = mapboxToken;
    
    // Create the map instance
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-95.3698, 29.7604], // Default center (Houston)
        zoom: 10,
        attributionControl: false
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl({
        showCompass: false
      }), 'top-right');
      
      console.log('Map initialized successfully');
    } catch (err) {
      console.error('Error initializing map:', err);
    }
    
    // Clean up on unmount
    return () => {
      // Clean up any markers
      if (markersRef.current.length) {
        markersRef.current.forEach(marker => {
          if (marker) marker.remove();
        });
        markersRef.current = [];
      }
      
      // Remove the map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, isTokenLoading]);
  
  // Add markers when stores or map changes
  useEffect(() => {
    if (!map.current || !stores.length) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker) marker.remove();
    });
    markersRef.current = [];
    
    try {
      // Wait for map to be ready
      if (!map.current.loaded()) {
        map.current.on('load', () => addStoreMarkers());
        return;
      }
      
      addStoreMarkers();
    } catch (err) {
      console.error('Error adding markers:', err);
    }
    
    function addStoreMarkers() {
      if (!map.current) return;
      
      // Calculate bounds for stores
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidCoordinates = false;
      
      // Add markers for each store
      stores.forEach(store => {
        if (!store.longitude || !store.latitude) return;
        
        hasValidCoordinates = true;
        
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
        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: true,
          closeOnClick: true,
          maxWidth: '300px'
        }).setHTML(`
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
                rel="noopener noreferrer"
                style="background: #16a34a; color: white; border: none; border-radius: 4px; padding: 6px 12px; font-size: 14px; text-decoration: none; display: inline-block; text-align: center; width: 100%;"
              >
                Get Directions
              </a>
            </div>
          </div>
        `);
        
        // Add marker with popup
        try {
          const marker = new mapboxgl.Marker(markerEl)
            .setLngLat([store.longitude, store.latitude])
            .setPopup(popup)
            .addTo(map.current!);
          
          // Store marker reference for cleanup
          markersRef.current.push(marker);
        } catch (err) {
          console.error('Error adding marker:', err);
        }
      });
      
      // Fit bounds if we have stores with valid coordinates
      if (hasValidCoordinates && !bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 14
        });
      }
    }
  }, [stores]);
  
  return (
    <div className="w-full rounded-md overflow-hidden relative bg-slate-900" style={{ height }}>
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
        <div className="flex items-center justify-center h-full bg-slate-900">
          <div className="text-center">
            <div className="inline-block animate-spin h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      ) : mapboxToken ? (
        <div 
          ref={mapContainer} 
          className="w-full h-full" 
          style={{ paddingTop: '40px' }} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full bg-slate-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <p className="text-sm text-muted-foreground">Map not available - API token missing</p>
        </div>
      )}
    </div>
  );
}