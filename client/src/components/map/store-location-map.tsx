import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/use-mapbox-token';
import { MockStore } from '@/lib/mock-stores';

interface StoreLocationMapProps {
  stores: MockStore[];
  selectedStoreId?: number;
  selectedPartName?: string;
  onStoreSelect?: (storeId: number) => void;
  height?: string;
}

export default function StoreLocationMap({
  stores,
  selectedStoreId,
  selectedPartName,
  onStoreSelect,
  height = '400px'
}: StoreLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { token: mapboxToken, isLoading: isTokenLoading } = useMapboxToken();
  
  // Store popup state so we can close the currently open one when selecting a new store
  const [activePopup, setActivePopup] = useState<mapboxgl.Popup | null>(null);
  
  // Initialize map when token is loaded
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
        markersRef.current.forEach(marker => marker.remove());
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, isTokenLoading]);
  
  // Update markers when stores or map changes
  useEffect(() => {
    if (!map.current || !stores.length) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Calculate bounds for all stores
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add markers for each store
    stores.forEach(store => {
      if (!store.longitude || !store.latitude) return;
      
      // Add store to bounds
      bounds.extend([store.longitude, store.latitude]);
      
      // Create store marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'store-marker';
      markerEl.style.width = selectedStoreId === store.id ? '44px' : '36px';
      markerEl.style.height = selectedStoreId === store.id ? '44px' : '36px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.background = selectedStoreId === store.id ? 'rgb(249, 115, 22)' : 'rgb(234, 88, 12)';
      markerEl.style.border = selectedStoreId === store.id 
        ? '3px solid rgb(253, 186, 116)' 
        : '2px solid rgb(252, 165, 88)';
      markerEl.style.display = 'flex';
      markerEl.style.justifyContent = 'center';
      markerEl.style.alignItems = 'center';
      markerEl.style.color = 'white';
      markerEl.style.cursor = 'pointer';
      markerEl.style.zIndex = selectedStoreId === store.id ? '10' : '1';
      markerEl.style.transition = 'all 0.3s ease';
      markerEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${selectedStoreId === store.id ? '24' : '20'}" height="${selectedStoreId === store.id ? '24' : '20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
      
      // Create popup with store info
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="font-family: system-ui, sans-serif; min-width: 220px; max-width: 300px;">
          <div style="display: flex; gap: 8px; margin-bottom: 12px; align-items: center;">
            <img 
              src="${store.logo}" 
              alt="${store.name} logo" 
              style="width: 40px; height: 40px; border-radius: 4px; object-fit: contain; background: white; padding: 4px;"
            />
            <div style="flex: 1;">
              <div style="font-weight: 500; margin-bottom: 2px; font-size: 16px;">
                ${store.name}
              </div>
              <div style="color: #888; font-size: 14px;">
                ${store.distance || '2.3 miles away'}
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 8px; font-size: 14px; display: flex; align-items: top;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; margin-top: 2px; flex-shrink: 0;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <div>
              ${store.address}<br />
              ${store.city}, ${store.state} ${store.zipCode}
            </div>
          </div>
          
          <div style="margin-bottom: 8px; font-size: 14px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; flex-shrink: 0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <a href="tel:${store.phone}" style="color: #22c55e; text-decoration: none;">
              ${store.phone}
            </a>
          </div>
          
          <div style="margin-bottom: 8px; font-size: 14px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; flex-shrink: 0;"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
            ${store.hours}
          </div>
          
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button 
              style="
                flex: 1; 
                background: linear-gradient(to right, #f97316, #ea580c); 
                color: white; 
                border: none; 
                border-radius: 4px; 
                padding: 8px 12px; 
                font-size: 14px; 
                cursor: pointer;
                font-weight: 500;
              "
              onclick="document.dispatchEvent(new CustomEvent('select-store', {detail: {storeId: ${store.id}}}))"
            >
              Select Store
            </button>
            
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${store.name} ${store.address}, ${store.city}, ${store.state} ${store.zipCode}`)}" 
              target="_blank" 
              style="
                flex: 1; 
                background: linear-gradient(to right, #16a34a, #15803d); 
                color: white; 
                border: none; 
                border-radius: 4px; 
                padding: 8px 12px; 
                font-size: 14px; 
                text-decoration: none; 
                display: inline-block; 
                text-align: center;
                font-weight: 500;
              "
            >
              Directions
            </a>
          </div>
        </div>
      `);
      
      // Create marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([store.longitude, store.latitude])
        .setPopup(popup)
        .addTo(map.current!);
      
      // Store the marker reference for cleanup
      markersRef.current.push(marker);
      
      // Add click handler for the marker
      markerEl.addEventListener('click', () => {
        // Close any currently open popup
        if (activePopup) {
          activePopup.remove();
        }
        
        // Set this popup as active
        setActivePopup(popup);
        
        // If we have an onStoreSelect handler, call it
        if (onStoreSelect) {
          onStoreSelect(store.id);
        }
        
        // Fly to the marker's location for a smooth transition
        map.current?.flyTo({
          center: [store.longitude, store.latitude],
          zoom: 14,
          speed: 1.5
        });
      });
      
      // Automatically open the popup for the selected store
      if (selectedStoreId === store.id) {
        marker.togglePopup();
        setActivePopup(popup);
        
        // Ensure the map is centered on the selected store
        map.current?.flyTo({
          center: [store.longitude, store.latitude],
          zoom: 14,
          speed: 1.5
        });
      }
    });
    
    // Set up custom event listener for the "Select Store" button in popup
    document.addEventListener('select-store', ((e: CustomEvent) => {
      const { storeId } = e.detail;
      if (onStoreSelect) {
        onStoreSelect(storeId);
      }
    }) as EventListener);
    
    // Fit map to show all stores if no store is selected
    if (!selectedStoreId && !bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12
      });
    }
    
    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('select-store', (() => {}) as EventListener);
    };
  }, [stores, selectedStoreId, map.current, onStoreSelect]);
  
  return (
    <div className="w-full h-full relative rounded-md overflow-hidden bg-slate-900">
      {/* Header displaying store count and possibly the selected part */}
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
        <div className="flex items-center justify-center h-full" style={{ height }}>
          <div className="text-center">
            <div className="inline-block animate-spin h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      ) : mapboxToken ? (
        <div 
          ref={mapContainer} 
          className="w-full h-full" 
          style={{ height, paddingTop: '40px' }} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full" style={{ height }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <p className="text-sm text-muted-foreground">Map not available - API token missing</p>
        </div>
      )}
    </div>
  );
}