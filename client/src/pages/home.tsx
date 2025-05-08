import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  MapPin, FileText, ChevronRight, 
  Wrench, Clock, Briefcase, PackageSearch,
  PanelBottom, Cpu, Workflow, Loader2,
  File, Camera, Calculator, Receipt
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import TopNavigation from '@/components/layout/top-navigation';
import BottomNavigation from '@/components/layout/bottom-navigation';
import { Customer, Job } from '@shared/schema';

export default function Home() {
  const [_, setLocation] = useLocation();

  // Fetch jobs data
  const { data: jobs, isLoading: isLoadingJobs } = useQuery<Job[]>({
    queryKey: ['/api/technicians/1/jobs'],
    retry: false
  });

  // Fetch customers data
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    retry: false
  });

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  const jumpToSection = (section: string) => {
    switch(section) {
      case 'jobs': setLocation('/dashboard'); break;
      case 'map': setLocation('/map'); break;
      default: setLocation('/');
    }
  };

  const quickActions = [
    { 
      title: 'My Jobs', 
      icon: Briefcase, 
      color: 'bg-blue-500',
      description: 'View your assigned jobs',
      action: () => jumpToSection('jobs')
    },
    { 
      title: 'Job Map', 
      icon: MapPin, 
      color: 'bg-yellow-500',
      description: 'See all jobs on map',
      action: () => jumpToSection('map') 
    },
    { 
      title: 'Parts Search', 
      icon: PackageSearch, 
      color: 'bg-purple-500',
      description: 'Find nearby parts',
      action: () => setLocation('/parts-search')
    },
    { 
      title: 'New Invoice', 
      icon: FileText, 
      color: 'bg-green-500',
      description: 'Create customer invoice',
      action: () => setLocation('/invoice')
    },
  ];

  const features = [
    {
      title: 'Smart Diagnostics',
      icon: Cpu,
      description: 'Use AI to identify parts and issues from photos',
      color: 'bg-indigo-500'
    },
    {
      title: 'Repair Workflows',
      icon: Workflow,
      description: 'Step-by-step guides for common repairs',
      color: 'bg-amber-500'
    },
    {
      title: 'Parts Locator',
      icon: MapPin,
      description: 'Find parts at local hardware stores',
      color: 'bg-rose-500'
    },
    {
      title: 'Job Timer',
      icon: Clock,
      description: 'Track time spent on repairs automatically',
      color: 'bg-cyan-500'
    },
    {
      title: 'Invoicing',
      icon: FileText,
      description: 'Create and send professional invoices',
      color: 'bg-emerald-500'
    },
    {
      title: 'Live Dashboard',
      icon: PanelBottom,
      description: 'Monitor all your jobs in real-time',
      color: 'bg-orange-500'
    },
  ];

  return (
    <div className="page-container pb-20 overflow-y-auto">
      <TopNavigation />
      
      <div className="px-4 py-6 md:py-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground">Professional technician tools</p>
            </div>
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-yellow-500 text-primary-foreground">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <Card key={i} className="border border-border/40 hover:border-border/80 hover:shadow transition-all">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className={`${action.color} w-10 h-10 rounded-full flex items-center justify-center text-white mb-3`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium">{action.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{action.description}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-auto flex items-center justify-between border border-border/50 hover:bg-secondary"
                    onClick={action.action}
                  >
                    <span>View</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Latest Job */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Latest Job</h2>
          <Card className="border-yellow-500/50 hover:border-yellow-500 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Work Order #<span className="text-yellow-500 font-bold">252578</span></div>
                  <h3 className="font-semibold text-base mb-1">Grande Deluxe</h3>
                  <p className="text-sm mb-2">123 Business St, Houston, TX 77001</p>
                  <div className="flex items-center">
                    <div className="text-xs py-0.5 px-2 rounded-full bg-blue-500/20 text-blue-500 font-medium">
                      In Progress
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="icon" className="rounded-full" asChild>
                  <Link href="/jobs/1">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {/* Job Card Navigation Buttons */}
              <div className="mt-4 grid grid-cols-5 gap-1 border-t pt-4 w-full">
                <Link href="/jobs/1?tab=details" className="block">
                  <button className="flex flex-col items-center w-full text-xs py-2 border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded transition-colors">
                    <File className="h-5 w-5 mb-1 text-yellow-500" />
                    <span className="font-medium text-[10px] whitespace-nowrap">Details</span>
                  </button>
                </Link>
                <Link href="/jobs/1?tab=photos" className="block">
                  <button className="flex flex-col items-center w-full text-xs py-2 border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded transition-colors">
                    <Camera className="h-5 w-5 mb-1 text-yellow-500" />
                    <span className="font-medium text-[10px] whitespace-nowrap">Photos</span>
                  </button>
                </Link>
                <Link href="/jobs/1?tab=notes" className="block">
                  <button className="flex flex-col items-center w-full text-xs py-2 border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded transition-colors">
                    <FileText className="h-5 w-5 mb-1 text-yellow-500" />
                    <span className="font-medium text-[10px] whitespace-nowrap">Notes</span>
                  </button>
                </Link>
                <Link href="/jobs/1?tab=estimates" className="block">
                  <button className="flex flex-col items-center w-full text-xs py-2 border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded transition-colors">
                    <Calculator className="h-5 w-5 mb-1 text-yellow-500" />
                    <span className="font-medium text-[10px] whitespace-nowrap">Estimates</span>
                  </button>
                </Link>
                <Link href="/jobs/1?tab=invoice" className="block">
                  <button className="flex flex-col items-center w-full text-xs py-2 border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded transition-colors">
                    <Receipt className="h-5 w-5 mb-1 text-yellow-500" />
                    <span className="font-medium text-[10px] whitespace-nowrap">Invoice</span>
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* All Jobs List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">All Jobs</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="border-yellow-500/50 hover:border-yellow-500 hover:bg-yellow-500/10"
              onClick={() => setLocation('/dashboard')}
            >
              <Briefcase className="w-4 h-4 mr-2 text-yellow-500" />
              <span>View All</span>
            </Button>
          </div>
          
          {isLoadingJobs || isLoadingCustomers ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 pb-1">
              {jobs.map((job) => {
                const customer = customers?.find(c => c.id === job.customerId);
                
                // Get status color
                let statusColor = '';
                switch(job.status.toLowerCase()) {
                  case 'scheduled':
                    statusColor = 'bg-yellow-500/20 text-yellow-500';
                    break;
                  case 'in_progress':
                  case 'in progress':
                    statusColor = 'bg-blue-500/20 text-blue-500';
                    break;
                  case 'completed':
                    statusColor = 'bg-green-500/20 text-green-500';
                    break;
                  default:
                    statusColor = 'bg-slate-500/20 text-slate-500';
                }
                
                return (
                  <Card key={job.id} className="border border-border/40 hover:border-border/80 hover:shadow transition-all">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Work Order #<span className="text-yellow-500 font-bold">{job.workOrderNumber}</span>
                          </div>
                          <h3 className="font-semibold text-base mb-1">{customer?.name}</h3>
                          <p className="text-sm mb-2">
                            {customer?.address}, {customer?.city}, {customer?.state}
                          </p>
                          <div className="flex items-center">
                            <div className={`text-xs py-0.5 px-2 rounded-full ${statusColor} font-medium`}>
                              {job.status.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                          <Link href={`/jobs/${job.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                      
                      {/* Job Card Navigation Buttons */}
                      <div className="mt-4 grid grid-cols-5 gap-1 border-t pt-4 w-full">
                        <Link href={`/jobs/${job.id}?tab=details`} className="block">
                          <button className="flex flex-col items-center w-full text-xs py-2 border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded transition-colors">
                            <File className="h-5 w-5 mb-1 text-yellow-500" />
                            <span className="font-medium text-[10px] whitespace-nowrap">Details</span>
                          </button>
                        </Link>
                        <Link href={`/jobs/${job.id}?tab=photos`} className="block">
                          <button className="flex flex-col items-center w-full text-xs py-2 border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded transition-colors">
                            <Camera className="h-5 w-5 mb-1 text-yellow-500" />
                            <span className="font-medium text-[10px] whitespace-nowrap">Photos</span>
                          </button>
                        </Link>
                        <Link href={`/jobs/${job.id}?tab=notes`} className="block">
                          <button className="flex flex-col items-center w-full text-xs py-2 border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded transition-colors">
                            <FileText className="h-5 w-5 mb-1 text-yellow-500" />
                            <span className="font-medium text-[10px] whitespace-nowrap">Notes</span>
                          </button>
                        </Link>
                        <Link href={`/jobs/${job.id}?tab=estimates`} className="block">
                          <button className="flex flex-col items-center w-full text-xs py-2 border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded transition-colors">
                            <Calculator className="h-5 w-5 mb-1 text-yellow-500" />
                            <span className="font-medium text-[10px] whitespace-nowrap">Estimates</span>
                          </button>
                        </Link>
                        <Link href={`/jobs/${job.id}?tab=invoice`} className="block">
                          <button className="flex flex-col items-center w-full text-xs py-2 border border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded transition-colors">
                            <Receipt className="h-5 w-5 mb-1 text-yellow-500" />
                            <span className="font-medium text-[10px] whitespace-nowrap">Invoice</span>
                          </button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No jobs found</h3>
              <p className="text-muted-foreground mt-1">
                You don't have any jobs assigned to you
              </p>
            </div>
          )}
        </div>
        
        {/* App Features */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-3 gap-3">
            {features.map((feature, i) => (
              <Card key={i} className="bg-secondary/50 border-transparent">
                <CardContent className="p-3 flex flex-col items-center text-center">
                  <div className={`${feature.color} w-8 h-8 rounded-full flex items-center justify-center text-white mb-2`}>
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-medium text-xs mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-tight">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}