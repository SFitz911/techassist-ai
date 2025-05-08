import React from 'react';
import { useState } from 'react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
  CheckCheck
} from "lucide-react";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface StatusBadgeProps {
  jobId: number;
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onStatusChange?: (newStatus: string) => void;
}

export function StatusBadge({ 
  jobId, 
  status, 
  size = 'md', 
  className = '',
  onStatusChange
}: StatusBadgeProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const getStatusDetails = (status: string) => {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'scheduled':
        return {
          icon: <Calendar className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} mr-1`} />,
          className: 'bg-yellow-900/30 text-yellow-500 border-yellow-500/50 hover:bg-yellow-900/40',
          label: 'Scheduled'
        };
      case 'in progress':
        return {
          icon: <MapPin className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} mr-1`} />,
          className: 'bg-blue-900/30 text-blue-500 border-blue-500/50 hover:bg-blue-900/40',
          label: 'In Progress'
        };
      case 'completed':
        return {
          icon: <CheckCheck className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} mr-1`} />,
          className: 'bg-green-900/30 text-green-500 border-green-500/50 hover:bg-green-900/40',
          label: 'Completed'
        };
      case 'canceled':
        return {
          icon: <AlertCircle className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} mr-1`} />,
          className: 'bg-red-900/30 text-red-500 border-red-500/50 hover:bg-red-900/40',
          label: 'Canceled'
        };
      default:
        return {
          icon: <Clock className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} mr-1`} />,
          className: 'bg-slate-900/30 text-slate-500 border-slate-500/50 hover:bg-slate-900/40',
          label: status
        };
    }
  };
  
  const statusDetails = getStatusDetails(status);
  
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status || !jobId) return;
    
    setIsUpdating(true);
    
    try {
      await apiRequest(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Invalidate cached data
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs', jobId] });
      queryClient.invalidateQueries({ queryKey: ['/api/technicians/1/jobs'] });
      
      toast({
        title: 'Status updated',
        description: `Job status changed to ${newStatus}`,
        variant: 'default',
      });
      
      // Callback if provided
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update job status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', icon: <Calendar className="h-4 w-4 mr-2" /> },
    { value: 'in progress', label: 'In Progress', icon: <MapPin className="h-4 w-4 mr-2" /> },
    { value: 'completed', label: 'Completed', icon: <CheckCheck className="h-4 w-4 mr-2" /> }
  ];
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div 
          className={`cursor-pointer inline-flex items-center rounded-full ${sizeClasses[size]} font-medium border transition-colors ${statusDetails.className} ${className}`}
        >
          {statusDetails.icon}
          {statusDetails.label}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <div className="p-2 border-b">
          <p className="text-sm font-medium">Change Status</p>
          <p className="text-xs text-muted-foreground">Select a new status for this job</p>
        </div>
        <div className="p-2">
          {isUpdating ? (
            <div className="flex items-center justify-center p-2">
              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <div className="space-y-1">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  className={`w-full flex items-center text-sm px-2 py-1.5 rounded-md hover:bg-secondary ${status.toLowerCase() === option.value ? 'bg-primary/10 font-medium' : ''}`}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={status.toLowerCase() === option.value}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}