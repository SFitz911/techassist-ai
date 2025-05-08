import { apiRequest } from "./queryClient";

// Since we're doing a desktop test environment, API calls are handled server-side
// This is a client-side wrapper for the AI-related endpoints

/**
 * Analyzes a photo using AI to identify the plumbing/electrical fixture and its condition
 */
export async function analyzePhoto(photoId: number): Promise<any> {
  try {
    const response = await apiRequest(`/api/photos/${photoId}/analyze`, {
      method: 'POST'
    });
    return response;
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
    const response = await apiRequest(`/api/notes/${noteId}/enhance`, {
      method: 'POST'
    });
    return response;
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

/**
 * Identifies parts from a job's photos using AI and suggests replacement options
 * @param jobId The ID of the job to analyze photos from
 * @returns Object containing identified parts and suggestions
 */
export async function identifyPartsFromJobImages(jobId: number): Promise<any> {
  try {
    const response = await apiRequest(`/api/jobs/${jobId}/identify-parts`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error("Error identifying parts from job images:", error);
    throw error;
  }
}

/**
 * Searches for specific parts in local hardware stores based on an image
 * @param imageData Base64 encoded image data
 * @returns Array of parts with store information and prices
 */
export async function searchPartsByImage(imageData: string): Promise<any> {
  try {
    const response = await apiRequest('/api/stores/search-by-image', {
      method: 'POST',
      body: JSON.stringify({ imageData })
    });
    return response;
  } catch (error) {
    console.error("Error searching for parts by image:", error);
    throw error;
  }
}
