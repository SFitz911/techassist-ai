import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

/**
 * Hook to fetch the Mapbox access token from the server
 * This avoids having to expose the token directly in client code
 */
export function useMapboxToken() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['/api/config/mapbox'],
    queryFn: async () => {
      console.log('Fetching Mapbox token from API...');
      const res = await apiRequest('/api/config/mapbox');
      console.log('Mapbox token API response:', res);
      return res.token as string;
    },
  });
  
  // Debug log the token availability
  console.log('Mapbox token state:', { token: data, isLoading, isError, error });
  
  return {
    token: data,
    isLoading,
    isError,
    error
  };
}