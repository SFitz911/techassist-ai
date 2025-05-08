import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  MapPin, FileText, ChevronRight, 
  Wrench, Clock, Briefcase, PackageSearch,
  PanelBottom, Cpu, Workflow 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import TopNavigation from '@/components/layout/top-navigation';
import BottomNavigation from '@/components/layout/bottom-navigation';

export default function Home() {
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  const jumpToSection = (section: string) => {
    switch(section) {
      case 'jobs': setLocation('/'); break;
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
    <div className="page-container pb-20">
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
            </CardContent>
          </Card>
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