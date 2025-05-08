import { useState } from 'react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { Search, Filter, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { Job, Customer } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface JobListProps {
  jobs: Job[];
  customers: Customer[];
}

export default function JobList({ jobs, customers }: JobListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Generate lookup map for customers
  const customerMap = new Map(customers.map(customer => [customer.id, customer]));

  // Filter jobs based on search term and status
  const filteredJobs = jobs.filter(job => {
    const customer = customerMap.get(job.customerId);
    const matchesSearch = 
      job.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (customer?.address?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
    const matchesStatus = statusFilter === 'all' || job.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort jobs - most recent first, then by status priority
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    // First by creation date, newest first
    const dateA = new Date(a.created).getTime();
    const dateB = new Date(b.created).getTime();
    return dateB - dateA;
  });
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'secondary';
      case 'in progress':
        return 'default';
      case 'completed':
        return 'outline';
      case 'canceled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const formatDate = (date: string | null) => {
    if (!date) return 'Not scheduled';
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {sortedJobs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No jobs found matching your filters.
            </CardContent>
          </Card>
        ) : (
          sortedJobs.map(job => {
            const customer = customerMap.get(job.customerId);
            return (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{customer?.name}</CardTitle>
                        <CardDescription>Work Order #{job.workOrderNumber}</CardDescription>
                      </div>
                      <Badge variant={getStatusBadgeVariant(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-2">{job.description}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {customer?.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{customer.address}, {customer.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(job.scheduled)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardFooter>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}