import * as React from "react";
import { cn } from "@/lib/utils";

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  activeValue: string;
}

/**
 * Tab Panel component that shows/hides content based on the active tab
 * You can use this in combination with the Tabs component
 */
const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  ({ className, value, activeValue, children, ...props }, ref) => {
    // Only render content if this tab is active
    const isActive = value === activeValue;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabpanel-${value}`}
        aria-labelledby={`tab-${value}`}
        hidden={!isActive}
        className={cn(
          "mt-2",
          isActive ? "block" : "hidden",
          className
        )}
        tabIndex={isActive ? 0 : -1}
        {...props}
      >
        {isActive && children}
      </div>
    );
  }
);

TabPanel.displayName = "TabPanel";

export { TabPanel };
