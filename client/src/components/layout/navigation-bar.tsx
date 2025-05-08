import { File, Camera, FileText, Calculator } from "lucide-react";

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
            <Icon className="tab-button-icon" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
