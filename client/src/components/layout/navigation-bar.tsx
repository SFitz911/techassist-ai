import { File, Camera, FileText, Calculator, Receipt } from "lucide-react";

interface NavigationBarProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function NavigationBar({ activeTab, onChange }: NavigationBarProps) {
  const tabs = [
    { id: "details", label: "Details", icon: File },
    { id: "photos", label: "Photos", icon: Camera },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "estimates", label: "Estimates", icon: Calculator },
    { id: "invoice", label: "Invoice", icon: Receipt },
  ];

  return (
    <div className="navigation-bar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onChange(tab.id)}
          >
            <Icon 
              className={`tab-button-icon ${
                activeTab === tab.id 
                  ? "text-green-500" 
                  : "text-yellow-500"
              }`} 
            />
            <span className={activeTab === tab.id ? "text-green-500 font-medium" : ""}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
