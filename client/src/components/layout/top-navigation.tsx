import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Menu, X, Home, Map, Camera, FileText, 
  Receipt, Settings, User, HardHat, Search
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function TopNavigation() {
  const [location, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const closeMenu = () => setIsMenuOpen(false);
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/map', icon: Map, label: 'Job Map' },
    { path: '/photos', icon: Camera, label: 'Photos' },
    { path: '/notes', icon: FileText, label: 'Notes' },
    { path: '/invoice', icon: Receipt, label: 'Invoices' },
    { path: '/parts-search', icon: Search, label: 'Parts Search' },
  ];
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <div className="top-navigation">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="md:hidden border-yellow-500/50 hover:border-yellow-500 hover:bg-yellow-500/10"
            >
              <Menu className="h-5 w-5 text-yellow-500" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs flex flex-col">
            <SheetHeader className="px-1">
              <SheetTitle className="flex items-center">
                <HardHat className="w-5 h-5 mr-2 text-yellow-500" />
                TechPro App
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 py-4">
              {menuItems.map((item) => (
                <Link key={item.path} href={item.path} onClick={closeMenu}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive(item.path) 
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
            <div className="mt-auto">
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/">
          <div className="flex items-center gap-2">
            <HardHat className="h-6 w-6 text-yellow-500" />
            <span className="font-semibold hidden md:inline-flex">
              TechPro App
            </span>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/map">
            <Button 
              variant="outline" 
              size="icon" 
              className="border-yellow-500/50 hover:border-yellow-500 hover:bg-yellow-500/10"
            >
              <Map className="h-5 w-5 text-yellow-500" />
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="border-yellow-500/50 hover:border-yellow-500 hover:bg-yellow-500/10"
              >
                <Menu className="h-5 w-5 text-yellow-500" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-xs flex flex-col">
              <SheetHeader className="px-1">
                <SheetTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-yellow-500" />
                  Technician Menu
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 py-4">
                {menuItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActive(item.path) 
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 border-t pt-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">John Doe</p>
                    <p className="text-xs text-muted-foreground">Technician</p>
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                <div className="pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
}