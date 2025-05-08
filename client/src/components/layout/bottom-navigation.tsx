import { Link, useLocation } from "wouter";
import { Home, Map, Camera, FileText, Receipt } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/map", icon: Map, label: "Map" },
    { path: "/photos", icon: Camera, label: "Photos" },
    { path: "/notes", icon: FileText, label: "Notes" },
    { path: "/invoice", icon: Receipt, label: "Invoice" },
  ];
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background px-4 md:hidden">
      <div className="flex h-full items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <button
                className="flex flex-col items-center justify-center gap-1"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isActive(item.path)
                      ? "bg-green-500 text-white"
                      : "bg-background text-yellow-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs ${
                    isActive(item.path) ? "font-medium text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}