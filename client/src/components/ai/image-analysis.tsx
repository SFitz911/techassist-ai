import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Tag, Wrench, AlertTriangle, PackagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzePhoto } from "@/lib/openai";
import { searchParts } from "@/lib/openai";
import PriceComparison from "@/components/invoicing/price-comparison";

interface Photo {
  id: number;
  aiAnalysis: any;
}

export default function ImageAnalysis({ photo }: { photo: Photo }) {
  const { toast } = useToast();
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [storeResults, setStoreResults] = useState<any>(null);
  
  // AI analysis mutation
  const analysisMutation = useMutation({
    mutationFn: () => analyzePhoto(photo.id),
    onSuccess: (data) => {
      toast({
        title: "Analysis complete",
        description: "AI has analyzed your photo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Search store parts mutation
  const searchPartsMutation = useMutation({
    mutationFn: (query: string) => searchParts(query),
    onSuccess: (data) => {
      setStoreResults(data);
      setShowPriceComparison(true);
    },
    onError: (error) => {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle analyze button click
  const handleAnalyze = () => {
    analysisMutation.mutate();
  };
  
  // Handle find parts button click
  const handleFindParts = () => {
    if (photo.aiAnalysis && photo.aiAnalysis.identified) {
      searchPartsMutation.mutate(photo.aiAnalysis.identified);
    }
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
      </div>
    );
  }
  
  // Get the analysis data either from the photo or from the mutation result
  const analysis = photo.aiAnalysis || analysisMutation.data?.aiAnalysis;
  
  if (showPriceComparison && storeResults) {
    return (
      <PriceComparison 
        stores={storeResults} 
        onBack={() => setShowPriceComparison(false)}
        jobId={photo.id} // Using photo ID instead of job ID for demo
      />
    );
  }

  return (
    <div className="mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-base">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start">
            <Tag className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Identified</p>
              <p className="text-sm">{analysis.identified || "Unknown item"}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Condition</p>
              <p className="text-sm">{analysis.condition || "Condition unknown"}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Wrench className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Recommendations</p>
              <p className="text-sm">{analysis.recommendations || "No recommendations available"}</p>
            </div>
          </div>
          
          {analysis.parts && analysis.parts.length > 0 && (
            <div className="flex items-start">
              <PackagePlus className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Suggested Parts</p>
                <ul className="text-sm list-disc pl-4">
                  {analysis.parts.map((part: string, index: number) => (
                    <li key={index}>{part}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Button 
        className="w-full mt-3"
        onClick={handleFindParts}
        disabled={searchPartsMutation.isPending}
      >
        {searchPartsMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <PackagePlus className="mr-2 h-4 w-4" />
            Find Parts at Local Stores
          </>
        )}
      </Button>
    </div>
  );
}
