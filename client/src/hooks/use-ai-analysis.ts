import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { analyzePhoto, enhanceNote, searchParts } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";

interface UsePhotoAnalysisParams {
  photoId: number;
  enabled?: boolean;
}

interface UseNoteEnhancementParams {
  noteId: number;
  enabled?: boolean;
}

interface UsePartSearchParams {
  query: string;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
}

// Hook for analyzing a photo
export function usePhotoAnalysis({ photoId, enabled = false }: UsePhotoAnalysisParams) {
  const { toast } = useToast();
  
  const analysisQuery = useQuery({
    queryKey: [`/api/photos/${photoId}/analysis`],
    queryFn: () => analyzePhoto(photoId),
    enabled,
    retry: 1,
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze the photo",
        variant: "destructive",
      });
    }
  });
  
  const analysisMutation = useMutation({
    mutationFn: () => analyzePhoto(photoId),
    onSuccess: (data) => {
      toast({
        title: "Analysis complete",
        description: "AI has analyzed your photo."
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze the photo",
        variant: "destructive",
      });
    }
  });
  
  return {
    analysis: analysisQuery.data?.aiAnalysis,
    isLoading: analysisQuery.isLoading || analysisMutation.isPending,
    isError: analysisQuery.isError || analysisMutation.isError,
    error: analysisQuery.error || analysisMutation.error,
    refetch: analysisQuery.refetch,
    analyze: analysisMutation.mutate
  };
}

// Hook for enhancing a note
export function useNoteEnhancement({ noteId, enabled = false }: UseNoteEnhancementParams) {
  const { toast } = useToast();
  
  const enhancementQuery = useQuery({
    queryKey: [`/api/notes/${noteId}/enhancement`],
    queryFn: () => enhanceNote(noteId),
    enabled,
    retry: 1,
    onError: (error) => {
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Could not enhance the note",
        variant: "destructive",
      });
    }
  });
  
  const enhancementMutation = useMutation({
    mutationFn: () => enhanceNote(noteId),
    onSuccess: (data) => {
      toast({
        title: "Note enhanced",
        description: "Your note has been professionally enhanced by AI."
      });
    },
    onError: (error) => {
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Could not enhance the note",
        variant: "destructive",
      });
    }
  });
  
  return {
    enhancedNote: enhancementQuery.data,
    isLoading: enhancementQuery.isLoading || enhancementMutation.isPending,
    isError: enhancementQuery.isError || enhancementMutation.isError,
    error: enhancementQuery.error || enhancementMutation.error,
    refetch: enhancementQuery.refetch,
    enhance: enhancementMutation.mutate
  };
}

// Hook for searching parts
export function usePartSearch({ query, enabled = false, onSuccess }: UsePartSearchParams) {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  
  const searchMutation = useMutation({
    mutationFn: () => searchParts(query),
    onMutate: () => {
      setIsSearching(true);
    },
    onSuccess: (data) => {
      setIsSearching(false);
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      setIsSearching(false);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Could not search for parts",
        variant: "destructive",
      });
    }
  });
  
  const search = () => {
    if (query.trim()) {
      searchMutation.mutate();
    }
  };
  
  return {
    results: searchMutation.data,
    isSearching,
    isError: searchMutation.isError,
    error: searchMutation.error,
    search
  };
}
