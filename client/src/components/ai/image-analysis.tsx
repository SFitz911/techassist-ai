import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, PackagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import DetailedAnalysis from "./detailed-analysis";

interface Photo {
  id: number;
  jobId: number;
  dataUrl: string;
  aiAnalysis: any;
}

export default function ImageAnalysis({ photo }: { photo: Photo }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(!!photo.aiAnalysis);
  
  // AI analysis mutation - using direct API endpoint instead of the openai.ts helper
  const analysisMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/photos/${photo.id}/analyze`, { method: 'POST' });
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis complete",
        description: "AI has analyzed the photo and identified needed parts.",
      });
      setShowDetailedAnalysis(true);
      
      // Invalidate any queries that might need refreshing
      queryClient.invalidateQueries({ queryKey: [`/api/photos/${photo.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${photo.jobId}/photos`] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${photo.jobId}/estimate-items`] });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Could not analyze the photo. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle analyze button click
  const handleAnalyze = () => {
    analysisMutation.mutate();
  };
  
  // If no analysis has been performed yet
  if (!photo.aiAnalysis && !analysisMutation.data?.aiAnalysis) {
    return (
      <div className="mt-4">
        <Button 
          onClick={handleAnalyze}
          className="w-full"
          disabled={analysisMutation.isPending}
        >
          {analysisMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze with AI
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          AI will identify the problem, suggest repair steps, and find replacement parts
        </p>
      </div>
    );
  }
  
  // Get the analysis data either from the photo or from the mutation result
  const updatedPhoto = {
    ...photo,
    aiAnalysis: photo.aiAnalysis || analysisMutation.data?.aiAnalysis
  };

  return (
    <div className="mt-4 space-y-4">
      {showDetailedAnalysis ? (
        <DetailedAnalysis photo={updatedPhoto} />
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-base">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              AI Analysis Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowDetailedAnalysis(true)}
              className="w-full"
            >
              <PackagePlus className="mr-2 h-4 w-4" />
              View Detailed Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
