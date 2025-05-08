import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobHeader from "@/components/layout/job-header";
import NavigationBar from "@/components/layout/navigation-bar";
import DetailsTab from "@/components/tabs/details-tab";
import PhotosTab from "@/components/tabs/photos-tab";
import NotesTab from "@/components/tabs/notes-tab";
import EstimatesTab from "@/components/tabs/estimates-tab";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function JobDetails() {
  const [match, params] = useRoute("/jobs/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  
  // Get job details
  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: [`/api/jobs/${params?.id}`],
    retry: false,
  });
  
  // Get customer details
  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: [`/api/customers/${job?.customerId}`],
    enabled: !!job?.customerId,
    retry: false,
  });
  
  // If job not found, redirect back
  useEffect(() => {
    if (!isLoadingJob && !job) {
      toast({
        title: "Job not found",
        description: "The requested job could not be found.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isLoadingJob, job, setLocation, toast]);
  
  if (isLoadingJob || isLoadingCustomer) {
    return (
      <div className="page-container">
        <div className="job-header">
          <Skeleton className="h-6 w-36 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="content-area p-4">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="navigation-bar">
          {["details", "photos", "notes", "estimates"].map((tab) => (
            <div key={tab} className="tab-button">
              <Skeleton className="w-5 h-5 mb-1 rounded-full" />
              <Skeleton className="w-12 h-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!job || !customer) return null;

  return (
    <div className="page-container">
      <JobHeader job={job} customer={customer} />
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsContent value="details" className="flex-1 overflow-y-auto p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <DetailsTab job={job} customer={customer} />
        </TabsContent>
        
        <TabsContent value="photos" className="flex-1 overflow-y-auto p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <PhotosTab jobId={job.id} />
        </TabsContent>
        
        <TabsContent value="notes" className="flex-1 overflow-y-auto p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <NotesTab jobId={job.id} technicianId={job.technicianId} />
        </TabsContent>
        
        <TabsContent value="estimates" className="flex-1 overflow-y-auto p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <EstimatesTab jobId={job.id} />
        </TabsContent>
        
        <NavigationBar activeTab={activeTab} onChange={setActiveTab} />
      </Tabs>
    </div>
  );
}
