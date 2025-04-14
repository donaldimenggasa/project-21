import React, { useState, useMemo } from 'react';
import { useStore } from '~/store/zustand/store';
import { componentConfigs } from '~/components/widgets';
import { cn } from '~/lib/utils';
import { Settings, Palette, Code, Link2, Database } from 'lucide-react';

export const RightSidebar: React.FC = React.memo(() => {
  const [activeSection, setActiveSection] = useState(0);
  const { component, selectedComponent } = useStore();
  const selectedComponentData = selectedComponent ? component[selectedComponent] : null;

  const { config, builder } = useMemo(() => {
    if (!selectedComponentData) return { config: null, builder: null };
    return componentConfigs[selectedComponentData.type as keyof typeof componentConfigs];
  }, [selectedComponentData?.type]);

  if (!config || !builder) {
    return (
      <div className="w-80 h-screen bg-gray-900 text-gray-100 border-l border-gray-800 flex flex-col overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-center h-full text-secondary">
          <div className="text-center p-6">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Component Selected</h3>
            <p className="text-sm">
              Select a component from the canvas to view and edit its properties.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const PropertyView = builder.propertyViews[activeSection]?.view;

  if (!PropertyView) {
    return (
      <div className="w-80 h-screen bg-gray-900 text-gray-100 border-l border-gray-800 flex flex-col overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-center h-full text-secondary">
          <div className="text-center p-6">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Properties Available</h3>
            <p className="text-sm">
              This component doesn't have any editable properties in this section.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get sorted sections
  const sortedSections = 'sections' in config && config.sections
    ? Object.entries(config.sections as Record<string, { order: number, name: string }>)
        .sort((a, b) => a[1].order - b[1].order)
    : [];

  const sectionProperties = Object.entries(config.props)
    .filter(([_, prop]) => prop.section === sortedSections[activeSection][0]);

  const sectionIcons = {
    basic: Settings,
    style: Palette,
    binding: Link2,
    data: Database,
    appearance: Palette,
    advanced: Code,
  };

  return (
    <div className="w-80 h-screen bg-gray-900 text-gray-100 border-l border-gray-800 flex flex-col overflow-y-auto scrollbar-hide ">
      {/* Component Type Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            {selectedComponentData.type}
          </span>
          <span className="ml-2 px-2 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full">
            {selectedComponentData.id}
          </span>
        </div>
      </div>
      
      {/* Section Tabs */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
        {sortedSections.map(([key, section], index) => {
          const SectionIcon = sectionIcons[key as keyof typeof sectionIcons] || Settings;
          return (
            <button
              key={key}
              onClick={() => setActiveSection(index)}
              className={cn(
                "py-2.5 px-3 text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
                activeSection === index
                  ? "border-b-2 border-primary text-primary"
                  : "text-secondary hover:text-foreground"
              )}
            >
              <SectionIcon className="h-3.5 w-3.5" />
              {section.name}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <PropertyView 
          component={selectedComponentData} 
          config={config} 
          sectionProperties={sectionProperties}
        />
      </div>
    </div>
  );
});

RightSidebar.displayName = 'PropertiesTab';