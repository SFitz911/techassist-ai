import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Map, User, Settings, Menu, X, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface TopNavigationProps {
  userName?: string;
  userAvatar?: string;
}

export default function TopNavigation({ userName = "Technician", userAvatar }: TopNavigationProps) {
  const [location, setLocation] = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/map", label: "Job Map", icon: Map },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    return location === path;
  };
  
  const renderNavItems = () => {
    return navItems.map((item) => {
      const Icon = item.icon;
      
      // Give each nav item a unique color
      const getIconColor = (path: string) => {
        switch(path) {
          case "/":
            return "text-amber-500";
          case "/map":
            return "text-emerald-500";
          case "/profile":
            return "text-blue-500";
          case "/settings":
            return "text-purple-500";
          default:
            return "text-muted-foreground";
        }
      };
      
      return (
        <Link key={item.path} href={item.path}>
          <Button
            variant={isActive(item.path) ? "default" : "ghost"}
            size="sm"
            className={cn(
              "flex items-center gap-2",
              isActive(item.path) 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent hover:text-primary"
            )}
            onClick={() => setIsOpen(false)}
          >
            <Icon className={cn("h-4 w-4", getIconColor(item.path))} />
            <span>{item.label}</span>
          </Button>
        </Link>
      );
    });
  };

  return (
    <div className="border-b bg-background sticky top-0 z-10">
      <div className="flex h-14 items-center px-4 md:px-6">
        <div className="flex mr-4">
          <Link href="/">
            <span className="font-bold text-xl cursor-pointer">TechPro</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {renderNavItems()}
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Mobile Menu Trigger */}
          {isMobile && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="max-w-[280px] sm:max-w-[320px]">
                <div className="px-2 py-6">
                  <div className="mb-4 flex items-center justify-between">
                    <Link href="/">
                      <span className="font-bold text-xl cursor-pointer">TechPro</span>
                    </Link>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {renderNavItems()}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback>
                    {userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <div className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Profile</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <div className="flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4 text-purple-500" />
                    <span>Settings</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4 text-rose-500" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}