import { apiRequest } from "./queryClient";

// Since we're doing a desktop test environment, API calls are handled server-side
// This is a client-side wrapper for the AI-related endpoints

/**
 * Analyzes a photo using AI to identify the plumbing/electrical fixture and its condition
 */
export async function analyzePhoto(photoId: number): Promise<any> {
  try {
    const response = await apiRequest('POST', `/api/photos/${photoId}/analyze`, {});
    return await response.json();
  } catch (error) {
    console.error("Error analyzing photo:", error);
    throw error;
  }
}

/**
 * Enhances a technician's note to make it more professional
 */
export async function enhanceNote(noteId: number): Promise<any> {
  try {
    const response = await apiRequest('POST', `/api/notes/${noteId}/enhance`, {});
    return await response.json();
  } catch (error) {
    console.error("Error enhancing note:", error);
    throw error;
  }
}

/**
 * Searches for parts in local hardware stores based on a query
 */
export async function searchParts(query: string): Promise<any> {
  try {
    const params = new URLSearchParams({ query });
    const response = await fetch(`/api/stores/search?${params}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error searching for parts:", error);
    throw error;
  }
}
