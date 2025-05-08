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
      const res = await apiRequest('/api/config/mapbox');
      return res.token as string;
    },
  });
  
  return {
    token: data,
    isLoading,
    isError,
    error
  };
}