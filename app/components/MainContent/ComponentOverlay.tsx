import  { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '~/store/zustand/store';
import { Plus, LayoutGrid, Box, Search } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '~/lib/utils';
import { widgetConfigs } from '~/components/widgets';
import { useThrottle } from '~/lib/performance';


interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Custom hooks untuk memisahkan selectors
const useComponentOverlayState = () => {
  const selectedPage = useStore(state => state.selectedPage);
  const showLeftPanel = useStore(state => state.showLeftPanel);
  const showRightPanel = useStore(state => state.showRightPanel);
  const showBottomPanel = useStore(state => state.showBottomPanel);
  
  const component = useStore(state => state.component);
  const setComponent = useStore(state => state.setComponent);
  const setSelectedComponent = useStore(state => state.setSelectedComponent);
  const setHoveredComponent = useStore(state => state.setHoveredComponent);
  const hoveredComponent = useStore(state => state.hoveredComponent);
  const selectedComponent = useStore(state => state.selectedComponent);

  // Compute derived state
  const selectedComponentType = useMemo(() => {
    if (!selectedComponent) return null;
    return component[selectedComponent]?.type;
  }, [selectedComponent, component]);
  
  return {
    hoveredComponent,
    selectedComponent,
    selectedPage,
    component,
    showLeftPanel,
    showRightPanel,
    showBottomPanel,
    selectedComponentType,
    setComponent,
    setSelectedComponent,
    setHoveredComponent
  };
};



export const ComponentOverlay = memo(() => {
  const {
    hoveredComponent,
    selectedComponent,
    selectedPage,
    component,
    setComponent,
    setSelectedComponent,
    setHoveredComponent,
    selectedComponentType
  } = useComponentOverlayState();

  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);
  const [selectPosition, setSelectPosition] = useState<Position | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  

  // Determine if we should show the plus button
  const shouldShowPlusButton = useMemo(() => {
    return selectedComponentType === 'div' || selectedComponentType === 'span';
  }, [selectedComponentType]);

  // Filter available components based on parent type
  const getAvailableComponents = useCallback(() => {
    if (selectedComponentType === 'div') {
      // For div parent, show all components
      return Object.entries(widgetConfigs);
    } else if (selectedComponentType === 'span') {
      // For span parent, show all except div
      return Object.entries(widgetConfigs).filter(([type]) => type !== 'div');
    }
    return [];
  }, [selectedComponentType]);

  // Filter components based on search query and parent type
  const filteredComponents = useMemo(() => {
    const availableComponents = getAvailableComponents();
    if (!searchQuery) return availableComponents;
    
    return availableComponents.filter(([type]) =>
      type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [getAvailableComponents, searchQuery]);

  // Throttle position updates for better performance
  const updatePosition = useThrottle(useCallback((componentId: string | null, setPosition: (pos: Position | null) => void) => {
    if (!componentId) {
      setPosition(null);
      return;
    }

    // Find the DOM element and main content container
    const element = document.querySelector(`[data-component-id="${componentId}"]`);
    const mainContent = document.getElementById('main-content-container');
    
    if (!element || !mainContent) {
      setPosition(null);
      return;
    }

    // Use requestAnimationFrame to ensure smooth updates
    requestAnimationFrame(() => {
      // Get element and container positions
      const elementRect = element.getBoundingClientRect();
      const containerRect = mainContent.getBoundingClientRect();

      // Calculate position relative to the container
      setPosition({
        top: elementRect.top - containerRect.top + mainContent.scrollTop,
        left: elementRect.left - containerRect.left,
        width: elementRect.width,
        height: elementRect.height
      });
    });
  }, []), 50); // 50ms throttle

  // Handle adding new component
  const handleAddComponent = useCallback((type: string, config: any) => {
    //if (!selectedPage || !selectedComponent) {
    //  return;
    //}
    
    const siblings = Object.values(component).filter(c => c.parentId === selectedComponent /*&& c.pageId === selectedPage*/);
    const maxOrder = siblings.reduce((max, c) => Math.max(max, c.order || 0), -1);
    const newComponentId = `${type}-${Date.now()}`;
    const newComponent = {
      id: newComponentId,
      type,
     // pageId: selectedPage,
      parentId: selectedComponent,
      props: config.props,
      order: maxOrder + 1
    };
    
    setComponent(newComponent);
    setSelectedComponent(newComponentId);
    setHoveredComponent(null);
    setIsPopoverOpen(false);
    
  }, [selectedComponent,/* selectedPage,*/ component, setComponent, setSelectedComponent, setHoveredComponent]);





  // Update positions on scroll and resize
  useEffect(() => {
    const mainContent = document.getElementById('main-content-container');
    if (!mainContent) return;
    const handleScroll = () => {
      if (hoveredComponent || selectedComponent) {
        updatePosition(hoveredComponent, setHoverPosition);
        updatePosition(selectedComponent, setSelectPosition);
      }
    };
    const handleResize = () => {
      if (hoveredComponent || selectedComponent) {
        updatePosition(hoveredComponent, setHoverPosition);
        updatePosition(selectedComponent, setSelectPosition);
      }
    };
    // Create ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (hoveredComponent || selectedComponent) {
        updatePosition(hoveredComponent, setHoverPosition);
        updatePosition(selectedComponent, setSelectPosition);
      }
    });
    // Add event listeners
    mainContent.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    resizeObserver.observe(mainContent);
    return () => {
      mainContent.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [hoveredComponent, selectedComponent, updatePosition]);



  // Find the main content container for the portal
  const mainContent = document.getElementById('main-content-container');
  if (!mainContent) return null;



  const shouldShowHover = hoveredComponent && hoveredComponent !== selectedComponent;

  return createPortal(
    <>
      {/* Selection Overlay */}
      {selectPosition && (
        <div
          className="absolute z-[40] transition-all duration-150 ease-out pointer-events-none"
          style={{
            top: selectPosition.top,
            left: selectPosition.left,
            width: selectPosition.width,
            height: selectPosition.height
          }}
        >
         
          <div className="absolute inset-0 border-2 border-blue-500/50 pointer-events-none" />
          <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
          
          {/* Center Plus Button with Popover - make it clickable */}
          {shouldShowPlusButton && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <Popover.Trigger asChild>
                  <button 
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-colors transform hover:scale-105 pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </Popover.Trigger>

                <Popover.Portal>
                  <Popover.Content
                    className="z-50 w-[320px] bg-gray-900 rounded-lg shadow-lg border border-gray-800 animate-in fade-in-0 zoom-in-95"
                    sideOffset={5}
                    align="center"
                  >
                    <Tabs.Root defaultValue="components" className="w-full">
                      {/* Tabs List */}
                      <Tabs.List className="flex border-b border-gray-800">
                        <Tabs.Trigger
                          value="components"
                          className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                            "data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400",
                            "data-[state=inactive]:text-gray-400 hover:text-gray-300"
                          )}
                        >
                          <LayoutGrid className="h-4 w-4" />
                          Components
                        </Tabs.Trigger>
                        <Tabs.Trigger
                          value="modules"
                          className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                            "data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-400",
                            "data-[state=inactive]:text-gray-400 hover:text-gray-300"
                          )}
                        >
                          <Box className="h-4 w-4" />
                          Modules
                        </Tabs.Trigger>
                      </Tabs.List>

                      {/* Search Bar */}
                      <div className="p-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search components..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Components Tab */}
                      <Tabs.Content value="components" className="p-4 pt-2">
                        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                          {filteredComponents.map(([type, config]) => (
                            <div 
                              key={type}
                              className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer group"
                              onClick={() => handleAddComponent(type, config)}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-300">{type}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {config.props && typeof config.props === 'object' 
                                  ? Object.keys(config.props).length 
                                  : 0} props
                              </div>
                            </div>
                          ))}
                        </div>
                      </Tabs.Content>

                      {/* Modules Tab */}
                      <Tabs.Content value="modules" className="p-4 pt-2">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer">
                            <div className="text-sm font-medium text-gray-300">Authentication</div>
                            <div className="text-xs text-gray-500">User authentication module</div>
                          </div>
                          <div className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer">
                            <div className="text-sm font-medium text-gray-300">Payment</div>
                            <div className="text-xs text-gray-500">Payment processing module</div>
                          </div>
                        </div>
                      </Tabs.Content>
                    </Tabs.Root>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          )}
        </div>
      )}

      {/* Hover Overlay - Only show if component is not selected */}
      {shouldShowHover && hoverPosition && (
        <div
          className="absolute z-[40] transition-all duration-150 ease-out pointer-events-none"
          style={{
            top: hoverPosition.top,
            left: hoverPosition.left,
            width: hoverPosition.width,
            height: hoverPosition.height
          }}
        >
          {/* Border overlay - pointer-events-none */}
          <div className="absolute inset-0 border-2 border-orange-500/50 pointer-events-none" />
          <div className="absolute inset-0 bg-orange-500/10 pointer-events-none" />
        </div>
      )}
    </>,
    mainContent
  );
});

ComponentOverlay.displayName = 'ComponentOverlay';
export default ComponentOverlay;