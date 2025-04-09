import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Search, MoreVertical, Trash2, Settings, LayoutGrid, Type, Navigation, Link, CreditCard, FilterIcon as FooterIcon, Heater as Header, Heading1, Image, Donut as Button, FormInput as Form, Table, List, FileInput as Input } from 'lucide-react';
import { useStore } from '~/store/zustand/store';
import { cn } from '~/lib/utils';
import { useHeTree, sortFlatData, Id } from "he-tree-react";
import clsx from "clsx";
import { Logger } from '~/lib/logger';

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
  chart: { icon: CreditCard, color: 'rose' }
};

export function ComponentsTab() {
  const { 
    component, 
    selectedPage, 
    selectedComponent, 
    hoveredComponent, 
    changeComponentPosition, 
    setSelectedComponent, 
    setHoveredComponent 
  } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const keys = { idKey: 'id', parentIdKey: 'parentId' };
  const [openIds, setOpenIds] = useState<Id[] | undefined>([]);
  const logger = useMemo(() => Logger.getInstance(), []);

  // Filter components by selected page
  const listComponents = useMemo(() => {
    if (!component || !selectedPage) return [];
    return Object.keys(component)
      .filter(id => component[id]?.pageId === selectedPage)
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
      logger.error('Error building component array', error as Error);
      return [];
    }
  }, [logger]);

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
      return;
    }

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
    
    // Set openIds to include all parents
    setOpenIds([...new Set([...selectedChain, ...hoveredChain])]);
  }, [selectedComponent, hoveredComponent, component]);

  const handleTreeChange = (changes: any[]) => {
    try {
      const componentChanges = changes.map(node => ({
        id: node.id,
        parentId: node.parentId
      }));

      changeComponentPosition({
        components: componentChanges
      });
    } catch (error) {
      logger.error('Error updating component positions', error as Error);
    }
  };

  const handleOpen = (id: Id, open: boolean) => {
    if (open) {
      setOpenIds([...(openIds || []), id]);
    } else {
      setOpenIds((openIds || []).filter((i) => i !== id));
    }
  }

  const { renderTree, allIds } = useHeTree({
    ...keys,
    data: sortedComponents,
    onChange: handleTreeChange,
    dataType: 'flat',
    openIds,
    renderNode: ({id, node, open, checked, draggable}) => {
      const config = componentConfig[node.type as keyof typeof componentConfig] || {
        icon: LayoutGrid,
        color: 'gray'
      };
      const Icon = config.icon;

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
          <button onClick={() => handleOpen(id, !open)}>
            {open ? 
              (<ChevronDown className="h-4 w-4 mr-3" />) : 
              (<ChevronRight className="h-4 w-4 mr-3"/>)}
          </button>
      
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
           
            <button 
              className="p-1 hover:bg-gray-700 rounded"
              onClick={(e) => {
                e.stopPropagation();
                // Handle add click
              }}
            >
              <Plus className="h-3 w-3 text-gray-400" />
            </button>
            <button 
              className="p-1 hover:bg-gray-700 rounded"
              onClick={(e) => {
                e.stopPropagation();
                // Handle delete click
              }}
            >
              <Trash2 className="h-3 w-3 text-red-400" />
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
          <button 
            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
            onClick={() => {
              // Handle add component
            }}
          >
            <Plus className="h-4 w-4" />
          </button>
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
    </div>
  );
}