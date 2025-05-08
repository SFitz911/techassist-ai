import { useEffect, useState } from 'react';
import { MockStore } from '@/lib/mock-stores';
import { ExternalLink, Map, Navigation } from 'lucide-react';

interface FallbackStoreMapProps {
  stores: MockStore[];
  selectedPartName?: string;
  height?: string;
}

export default function FallbackStoreMap({ 
  stores, 
  selectedPartName,
  height = '300px' 
}: FallbackStoreMapProps) {
  
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
      
      <div className="mt-10 p-4 h-full overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map(store => (
            <div 
              key={store.id}
              className="bg-slate-800 rounded-md p-4 border border-slate-700 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                  {store.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-white">{store.name}</h3>
                  <p className="text-xs text-slate-400">{store.distance || '2.3 miles away'}</p>
                </div>
              </div>
              
              <div className="text-xs text-slate-300 mb-1 flex items-start gap-2">
                <Map className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span>{store.address}, {store.city}, {store.state} {store.zipCode}</span>
              </div>
              
              <div className="flex gap-3 mt-3">
                <a 
                  href={`tel:${store.phone}`}
                  className="flex items-center gap-1 bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium"
                >
                  Call
                </a>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${store.address}, ${store.city}, ${store.state} ${store.zipCode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Directions
                </a>
              </div>
              
              {store.latitude && store.longitude && (
                <div className="mt-4 -mx-4 -mb-4 border-t border-slate-700 p-3 flex items-center justify-center bg-slate-900/50">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 flex items-center gap-1.5 hover:text-blue-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View on Google Maps
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}