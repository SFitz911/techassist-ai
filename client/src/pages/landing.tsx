import { useLocation } from 'wouter';
import { Wrench, Cpu, MapPin, Camera, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleEnter = () => {
    setLocation('/home');
  };

  const features = [
    {
      icon: Cpu,
      title: 'AI-Powered Diagnostics',
      description: 'Identify parts and issues from photos'
    },
    {
      icon: MapPin,
      title: 'Smart Location Services',
      description: 'Find nearby hardware stores and parts'
    },
    {
      icon: Camera,
      title: 'Photo Analysis',
      description: 'Capture and analyze equipment photos'
    },
    {
      icon: Wrench,
      title: 'Job Management',
      description: 'Complete workflow from scheduling to invoicing'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
              TechAssist AI
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered technical assistance for job management, parts identification, and service workflow optimization
          </p>

          <div className="pt-4">
            <Button 
              onClick={handleEnter}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              Enter Application
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="border-border/40 bg-card/50 hover:border-primary/50 hover:bg-card transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center pt-8">
          <p className="text-sm text-muted-foreground">
            Professional tools for field technicians and service professionals
          </p>
        </div>
      </div>
    </div>
  );
}

