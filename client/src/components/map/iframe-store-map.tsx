import { useEffect, useState } from 'react';
import { MockStore } from '@/lib/mock-stores';
import { useMapboxToken } from '@/hooks/use-mapbox-token';

interface IframeStoreMapProps {
  stores: MockStore[];
  selectedPartName?: string;
  height?: string;
}

export default function IframeStoreMap({ 
  stores, 
  selectedPartName,
  height = '300px' 
}: IframeStoreMapProps) {
  const { token: mapboxToken, isLoading: isTokenLoading } = useMapboxToken();
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  
  // Generate the map URL when the token is loaded
  useEffect(() => {
    if (!mapboxToken || !stores.length) return;
    
    // Initialize map parameters
    let centerLat = 29.7604;
    let centerLng = -95.3698;
    let zoom = 10;
    
    // Build the markers string for the stores
    const markers = stores.map(store => {
      if (!store.latitude || !store.longitude) return '';
      
      // Use color orange for all stores
      const color = 'f97316'; // orange-500
      
      // Create a marker URL parameter
      return `pin-l+${color}(${store.longitude},${store.latitude})`;
    }).filter(Boolean).join(',');
    
    // If we have stores, use the first one as center
    if (stores.length > 0 && stores[0].latitude && stores[0].longitude) {
      centerLat = stores[0].latitude;
      centerLng = stores[0].longitude;
      zoom = 12;
    }
    
    // Create the static map URL
    const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${markers}/${centerLng},${centerLat},${zoom},0/800x600?access_token=${mapboxToken}`;
    
    setMapUrl(staticMapUrl);
  }, [mapboxToken, stores]);
  
  return (
    <div className="w-full rounded-md overflow-hidden relative bg-slate-900" style={{ height }}>
      {/* Header with store count and part name */}
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
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      ) : mapUrl ? (
        <div className="pt-10 h-full">
          <img 
            src={mapUrl} 
            alt="Store locations map"
            className="w-full h-full object-cover"
            style={{ maxHeight: 'calc(100% - 10px)' }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <p className="text-sm text-muted-foreground">Map not available</p>
        </div>
      )}
      
      {/* Store list below map for mobile accessibility */}
      {stores.length > 0 && (
        <div className="bg-slate-800 border-t border-slate-700 mt-4 p-4 text-sm">
          <h3 className="font-medium mb-2">Store Details:</h3>
          <ul className="space-y-3">
            {stores.map(store => (
              <li key={store.id} className="border-b border-slate-700 pb-2">
                <div className="font-medium text-white">{store.name}</div>
                <div className="text-slate-300">{store.distance || '2.3 miles away'}</div>
                <div className="text-slate-400 text-xs mt-1">
                  {store.address}, {store.city}, {store.state} {store.zipCode}
                </div>
                <div className="flex gap-2 mt-2">
                  <a
                    href={`tel:${store.phone}`}
                    className="text-xs bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Call
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${store.address}, ${store.city}, ${store.state} ${store.zipCode}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Directions
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}