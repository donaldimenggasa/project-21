import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Plus, Search, MoreVertical, Trash2, Settings, LayoutGrid, Type, Navigation, Link, CreditCard, FilterIcon as FooterIcon, Heater as Header, Heading1, Image, Donut as Button, FormInput as Form, Table, List, FileInput as Input } from 'lucide-react';
import { useStore } from '~/store/zustand/store';
import { cn } from '~/lib/utils';
import { useHeTree, sortFlatData, Id } from "he-tree-react";
import clsx from "clsx";
import { COMPONENT_CATEGORIES, getComponentsByCategory, widgetConfigs } from '~/components/widgets';
import { Logger } from '~/lib/logger';
import { useThrottle } from '~/lib/performance';
import { useErrorHandler } from '~/lib/error-boundary';
import * as Popover from '@radix-ui/react-popover';

interface TreeNode {
  id: string;
  parentId: string | null;
  order: number;
  type: string;
  props: Record<string, any>;
  children?: TreeNode[];
}

// Icon and color mapping for component types
const componentConfig = {
  div: { icon: LayoutGrid, color: 'blue' },
  main: { icon: LayoutGrid, color: 'blue' },
  section: { icon: LayoutGrid, color: 'blue' },
  article: { icon: LayoutGrid, color: 'blue' },
  aside: { icon: LayoutGrid, color: 'blue' },
  header: { icon: Header, color: 'purple' },
  footer: { icon: FooterIcon, color: 'green' },
  nav: { icon: Navigation, color: 'yellow' },
  form: { icon: Form, color: 'pink' },
  p: { icon: Type, color: 'emerald' },
  h1: { icon: Heading1, color: 'pink' },
  h2: { icon: Heading1, color: 'pink' },
  h3: { icon: Heading1, color: 'pink' },
  h4: { icon: Heading1, color: 'pink' },
  h5: { icon: Heading1, color: 'pink' },
  h6: { icon: Heading1, color: 'pink' },
  ul: { icon: List, color: 'orange' },
  ol: { icon: List, color: 'orange' },
  li: { icon: List, color: 'orange' },
  span: { icon: Type, color: 'emerald' },
  input: { icon: Input, color: 'violet' },
  button: { icon: Button, color: 'red' },
  table: { icon: Table, color: 'cyan' },
  thead: { icon: Table, color: 'cyan' },
  tbody: { icon: Table, color: 'cyan' },
  tr: { icon: Table, color: 'cyan' },
  th: { icon: Table, color: 'cyan' },
  td: { icon: Table, color: 'cyan' },
  img: { icon: Image, color: 'amber' },
  label: { icon: Type, color: 'emerald' },
  a: { icon: Link, color: 'indigo' },
  chart: { icon: CreditCard, color: 'rose' },
  barchart: { icon: LayoutGrid, color: 'blue' },
  linechart: { icon: LayoutGrid, color: 'green' },
  piechart: { icon: LayoutGrid, color: 'orange' },
  radarchart: { icon: LayoutGrid, color: 'purple' },
  textinput: { icon: Input, color: 'indigo' }
};

// Confirmation dialog for component deletion
interface DeleteConfirmationProps {
  componentId: string;
  componentType: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ 
  componentId, 
  componentType, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border border-gray-800">
        <div className="flex items-center space-x-4 text-red-400 mb-4">
          <Trash2 className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Delete Component</h3>
        </div>
        <p className="text-gray-300 mb-2">
          Are you sure you want to delete this <span className="font-semibold">{componentType}</span> component?
        </p>
        <p className="text-gray-400 text-sm mb-6">
          This will also delete all child components. This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Delete Component
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for the add component popover
interface AddComponentPopoverProps {
  parentId: string;
  parentType: string;
  onAddComponent: (type: string) => void;
}

const AddComponentPopover: React.FC<AddComponentPopoverProps> = ({
  parentId,
  parentType,
  onAddComponent
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(COMPONENT_CATEGORIES.BASIC);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get all available categories
  const categories = useMemo(() => {
    return Object.values(COMPONENT_CATEGORIES);
  }, []);

  // Get components for the active category
  const categoryComponents = useMemo(() => {
    return getComponentsByCategory(activeCategory);
  }, [activeCategory]);

  // Filter components based on search
  const filteredComponents = useMemo(() => {
    if (!searchQuery) return categoryComponents;
    
    return categoryComponents.filter(comp => 
      comp.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoryComponents, searchQuery]);

  return (
    <div className="w-[320px] bg-gray-900 rounded-lg border border-gray-800 shadow-lg overflow-hidden">
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Add Component</h3>
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
      
      <div className="p-3 border-b border-gray-800">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-3 py-1 text-xs rounded-full transition-colors",
                activeCategory === category
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="max-h-[300px] overflow-y-auto p-3">
        {filteredComponents.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {filteredComponents.map(comp => (
              <div
                key={comp.type}
                className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer"
                onClick={() => onAddComponent(comp.type)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <comp.icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">{comp.type}</span>
                </div>
                <p className="text-xs text-gray-500">{comp.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No components found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export function ComponentsTab() {
  const { 
    component, 
    selectedPage, 
    selectedComponent, 
    hoveredComponent, 
    setSelectedComponent, 
    setHoveredComponent, 
    changeComponentPosition, 
    deleteComponent,
    setComponent
  } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const keys = { idKey: 'id', parentIdKey: 'parentId' };
  const logger = useMemo(() => Logger.getInstance(), []);
  const handleError = useErrorHandler();
  
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    componentId: string;
    componentType: string;
  } | null>(null);
  
  // State for add component popover
  const [addComponentParent, setAddComponentParent] = useState<{
    id: string;
    type: string;
  } | null>(null);

  // State for open nodes
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // Filter components by selected page
  const listComponents = useMemo(() => {
    if (!component || !selectedPage) return [];
    return Object.keys(component)
      .filter(id => component[id].pageId === selectedPage)
      .map((id) => ({
        ...component[id],
        name: id,
      }));
  }, [component, selectedPage]);

  const jsonToArrayBuilder = useCallback((components: any[], parentKey: string | null) => {
    try {
      // 1. Count children for each parent
      const childCountMap = components.reduce((acc, item) => {
        if (parentKey && item[parentKey] !== null) {
          acc[item[parentKey]] = (acc[item[parentKey]] || 0) + 1;
        }
        return acc;
      }, {});

      // 2. Sort array by parentComponentId and order
      const sortedComponents = [...components].sort((a, b) => {
        if (parentKey && a[parentKey] === b[parentKey]) {
          return a.order - b.order;
        }
        return (parentKey && (a[parentKey] || "") < (b[parentKey] || "")) ? -1 : 1;
      });

      // 3. Add totalChild to each item
      return sortedComponents.map((item) => ({
        ...item,
        totalChild: childCountMap[item.id] || 0,
      }));
    } catch (error) {
      handleError(error);
      logger.error('Error building component tree', error as Error);
      return [];
    }
  }, [handleError, logger]);

  // Filter components based on search query
  const filteredComponents = useMemo(() => {
    if (!searchQuery) return listComponents;

    return listComponents.filter(comp => {
      const searchLower = searchQuery.toLowerCase();
      return (
        comp.type.toLowerCase().includes(searchLower) ||
        comp.id.toLowerCase().includes(searchLower) ||
        (comp.props?.children && typeof comp.props.children === 'string' && 
         comp.props.children.toLowerCase().includes(searchLower))
      );
    });
  }, [listComponents, searchQuery]);

  const sortedComponents = useMemo(() => 
    sortFlatData(
      jsonToArrayBuilder(filteredComponents, "parentId"),
      keys
    ),
    [filteredComponents, jsonToArrayBuilder]
  );

  // Update openIds when selectedComponent or hoveredComponent changes
  useEffect(() => {
    if (!selectedComponent && !hoveredComponent) {
      // If nothing is selected or hovered, keep current state
      return;
    }

    // Create a new set for open IDs
    const newOpenIds = new Set<string>();
    
    // Function to find parent chain for a component
    const findParentChain = (componentId: string | null): string[] => {
      if (!componentId) return [];
      
      const chain: string[] = [];
      let currentId = componentId;
      
      while (currentId) {
        chain.push(currentId);
        const parentId = component[currentId]?.parentId;
        currentId = parentId;
      }
      
      return chain;
    };
    
    // Get parent chains for selected and hovered components
    const selectedChain = findParentChain(selectedComponent);
    const hoveredChain = findParentChain(hoveredComponent);
    
    // Add all parents to openIds
    [...selectedChain, ...hoveredChain].forEach(id => {
      newOpenIds.add(id);
    });
    
    // Update openIds
    setOpenIds(newOpenIds);
  }, [selectedComponent, hoveredComponent, component]);

  // Throttle tree changes for better performance
  const handleTreeChange = useThrottle((changes: any[]) => {
    try {
      const componentChanges = changes.map(node => ({
        id: node.id,
        parentId: node.parentId
      }));

      changeComponentPosition({
        components: componentChanges
      });
      
      logger.debug('Component positions updated', { count: componentChanges.length });
    } catch (error) {
      handleError(error);
      logger.error('Error updating component positions', error as Error);
    }
  }, 100);

  const handleDeleteComponent = useCallback((id: string, type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmation({ componentId: id, componentType: type });
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirmation) {
      try {
        deleteComponent(deleteConfirmation.componentId);
        logger.info('Component deleted', { 
          componentId: deleteConfirmation.componentId, 
          type: deleteConfirmation.componentType 
        });
      } catch (error) {
        handleError(error);
        logger.error('Error deleting component', error as Error);
      } finally {
        setDeleteConfirmation(null);
      }
    }
  }, [deleteConfirmation, deleteComponent, logger, handleError]);

  // Initialize component props based on its type
  const initializeComponentProps = useCallback((type: string) => {
    // Get the component config for this type
    const config = widgetConfigs[type];
    if (!config) {
      logger.warn(`No config found for component type: ${type}`);
      return {};
    }

    // Create props object with proper structure for each property
    const props = {};
    
    // Initialize each property from the config
    Object.entries(config.props).forEach(([key, propConfig]) => {
      props[key] = {
        value: null,
        bindValue: "",
        bindable: propConfig.bindable || false,
        defaultValue: propConfig.defaultValue
      };
    });
    
    return props;
  }, [logger]);

  // Handle adding a component
  const handleAddComponent = useCallback((type: string) => {
    try {
      if (!selectedPage || !addComponentParent) {
        logger.warn('Cannot add component: no page or parent selected');
        return;
      }
      
      // Create a new component
      const newComponentId = `${type}-${Date.now()}`;
      const parentComponent = component[addComponentParent.id];
      
      if (!parentComponent) {
        logger.warn('Parent component not found', { parentId: addComponentParent.id });
        return;
      }
      
      // Find max order among siblings
      const siblings = Object.values(component)
        .filter(c => c.parentId === addComponentParent.id && c.pageId === selectedPage);
      
      const maxOrder = siblings.reduce((max, c) => Math.max(max, c.order || 0), -1);
      
      // Initialize props based on component type
      const componentProps = initializeComponentProps(type);
      
      // Create the component
      const newComponent = {
        id: newComponentId,
        type,
        pageId: selectedPage,
        parentId: addComponentParent.id,
        props: componentProps,
        order: maxOrder + 1
      };
      
      // Add the component
      setComponent(newComponent);
      setSelectedComponent(newComponentId);
      setAddComponentParent(null); // Close the popover
      
      logger.info('Component added', { type, id: newComponentId, parentId: addComponentParent.id });
    } catch (error) {
      handleError(error);
      logger.error('Error adding component', error as Error);
    }
  }, [addComponentParent, selectedPage, component, setComponent, setSelectedComponent, logger, handleError, initializeComponentProps]);

  // Toggle node open/closed state
  const handleToggleNode = useCallback((id: string) => {
    setOpenIds(prev => {
      const newOpenIds = new Set(prev);
      if (newOpenIds.has(id)) {
        newOpenIds.delete(id);
      } else {
        newOpenIds.add(id);
      }
      return newOpenIds;
    });
  }, []);

  const { renderTree } = useHeTree({
    ...keys,
    data: sortedComponents,
    onChange: handleTreeChange,
    dataType: 'flat',
    openIds: Array.from(openIds),
    renderNode: ({id, node, open, checked, draggable}) => {
      const config = componentConfig[node.type as keyof typeof componentConfig] || {
        icon: LayoutGrid,
        color: 'gray'
      };
      const Icon = config.icon;
      
      // Check if this component type can have children added (only div and span)
      const canAddChildren = node.type === 'div' || node.type === 'span';
      
      // Check if this node is in the parent chain of selected or hovered component
      const isOpen = openIds.has(node.id);
      
      // Check if this node has children
      const hasChildren = node.totalChild > 0;

      return (
        <div 
          className={clsx(
            'min-h-4 flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors group cursor-pointer',
            'hover:bg-gray-800/50',
            selectedComponent === node.id && 'bg-blue-900/50',
            hoveredComponent === node.id && 'bg-orange-900/50'
          )}
          onClick={() => setSelectedComponent(node.id)}
          onMouseEnter={() => setHoveredComponent(node.id)}
          onMouseLeave={() => setHoveredComponent(null)}
        >
          {/* Toggle button - only show if has children */}
          {hasChildren ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleToggleNode(node.id);
              }}
              className="p-1 hover:bg-gray-700/50 rounded"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-6"></div> // Spacer for alignment
          )}
          
          <div className={cn(
            "p-1 rounded",
            `bg-${config.color}-500/10`
          )}>
            <Icon className={cn(
              "h-3 w-3",
              `text-${config.color}-400`
            )} />
          </div>

          <span className="text-sm text-gray-300">{node.type}</span>
          

          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Only show add button for div and span components */}
            {canAddChildren && (
              <Popover.Root open={addComponentParent?.id === node.id} onOpenChange={(open) => {
                if (open) {
                  setAddComponentParent({ id: node.id, type: node.type });
                } else if (addComponentParent?.id === node.id) {
                  setAddComponentParent(null);
                }
              }}>
                <Popover.Trigger asChild>
                  <button 
                    className="p-1 hover:bg-gray-700 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Plus className="h-3 w-3 text-gray-400" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content 
                    side="right" 
                    sideOffset={10} 
                    align="start"
                    className="z-50"
                  >
                    <AddComponentPopover 
                      parentId={node.id} 
                      parentType={node.type} 
                      onAddComponent={handleAddComponent} 
                    />
                    <Popover.Arrow className="fill-gray-800" />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            )}
            
            <button 
              className="p-1 hover:bg-gray-700 rounded"
              onClick={(e) => handleDeleteComponent(node.id, node.type, e)}
              disabled={node.parentId === null} // Disable for root components
              title={node.parentId === null ? "Root components cannot be deleted" : "Delete component"}
            >
              <Trash2 className={cn(
                "h-3 w-3",
                node.parentId === null ? "text-gray-600 cursor-not-allowed" : "text-red-400"
              )} />
            </button>
          </div>
        </div>
      );
    },
  });

  return (
    <div className="h-full flex flex-col text-gray-300">
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
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
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sortedComponents.length > 0 ? (
          renderTree({ className: 'w-full h-full text-xs p-2' })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {searchQuery ? 'No components found' : 'No components available'}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirmation && (
        <DeleteConfirmation
          componentId={deleteConfirmation.componentId}
          componentType={deleteConfirmation.componentType}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}
    </div>
  );
}