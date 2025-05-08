import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Wrench, AlertTriangle, Search } from 'lucide-react';
import PartSearch from './part-search';

interface Photo {
  id: number;
  jobId: number;
  dataUrl: string;
  aiAnalysis: {
    identified: string;
    condition: string;
    recommendations: string;
    parts: string[];
    repair_steps?: string[];
    estimated_repair_time?: string;
    skill_level?: string;
  } | null;
}

export default function DetailedAnalysis({ photo }: { photo: Photo }) {
  const [showPartSearch, setShowPartSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!photo.aiAnalysis) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analysis Pending</CardTitle>
          <CardDescription>Image analysis has not been completed yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { 
    identified, 
    condition, 
    recommendations, 
    parts, 
    repair_steps = [], 
    estimated_repair_time = 'Unknown', 
    skill_level = 'Professional' 
  } = photo.aiAnalysis;

  const searchForPart = (part: string) => {
    setSearchQuery(part);
    setShowPartSearch(true);
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{identified}</CardTitle>
              <CardDescription>Condition: {condition}</CardDescription>
            </div>
            <Badge 
              variant={
                condition.toLowerCase().includes('broken') || 
                condition.toLowerCase().includes('damaged') ? 
                'destructive' : 'outline'
              }
              className="uppercase text-xs font-bold"
            >
              {condition}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Recommendations</h4>
            <p className="text-sm text-muted-foreground">{recommendations}</p>
          </div>

          <Separator />
          
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              Estimated Repair Time
            </h4>
            <p className="text-sm text-muted-foreground">{estimated_repair_time}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Wrench className="h-4 w-4 mr-1.5" />
              Required Skill Level
            </h4>
            <p className="text-sm text-muted-foreground">{skill_level}</p>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Required Parts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {parts.map((part, index) => (
                <div key={index} className="flex">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-1.5 flex-1"
                    onClick={() => searchForPart(part)}
                  >
                    <Search className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{part}</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Repair Steps</h4>
            {repair_steps.length === 0 ? (
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 mr-1.5 text-yellow-500" />
                No specific repair steps available
              </div>
            ) : (
              <ol className="list-decimal list-inside space-y-1.5">
                {repair_steps.map((step, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{step}</li>
                ))}
              </ol>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => setShowPartSearch(!showPartSearch)}
            variant="outline"
            className="w-full"
          >
            {showPartSearch ? 'Hide Part Search' : 'Search for Parts'}
          </Button>
        </CardFooter>
      </Card>

      {showPartSearch && (
        <Card>
          <CardHeader>
            <CardTitle>Find Replacement Parts</CardTitle>
            <CardDescription>
              Search local hardware stores for the recommended parts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PartSearch 
              initialQuery={searchQuery} 
              jobId={photo.jobId}
              onPartSelect={() => {}} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}