import React, { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { Circle, Play, RefreshCw, ChevronDown, ChevronUp, Edit2, Save, X, Check, Settings } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '~/lib/utils';
import { useStore } from '~/store/zustand/store';
import { Logger } from '~/lib/logger';
import { DeleteButton } from './DeleteButton';

interface LoopNodeData {
  label: string;
  items?: any[];
  iterationCount?: number;
  currentIndex?: number;
  result?: any;
  isSuccess?: boolean;
  isError?: boolean;
  isRunning?: boolean;
  isLocked?: boolean;
  delay?: number; // Delay between iterations in ms
}

interface LoopNodeProps {
  data: LoopNodeData;
  id: string;
}

export function LoopNode({ data, id }: LoopNodeProps) {
  const { selectedWorkflow, updateWorkflow } = useStore();
  const logger = useMemo(() => Logger.getInstance(), []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [localItems, setLocalItems] = useState<string>(
    data.items ? JSON.stringify(data.items, null, 2) : '[]'
  );
  const [localIterationCount, setLocalIterationCount] = useState<number>(
    data.iterationCount || 5
  );
  const [localDelay, setLocalDelay] = useState<number>(
    data.delay || 500
  );
  const [useItems, setUseItems] = useState<boolean>(!!data.items);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleExecuteLoop = useCallback(async () => {
    if ((!useItems && !localIterationCount) || (useItems && !localItems)) {
      logger.warn('Cannot execute loop: no items or iteration count specified', { nodeId: id });
      return;
    }

    if (!selectedWorkflow) {
      logger.warn('Cannot execute loop: no workflow selected', { nodeId: id });
      return;
    }

    setIsExecuting(true);
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      let items: any[];
      
      if (useItems) {
        try {
          items = JSON.parse(localItems);
          if (!Array.isArray(items)) {
            throw new Error('Items must be an array');
          }
        } catch (error) {
          logger.error('Error parsing items', error as Error);
          throw new Error('Invalid items format');
        }
      } else {
        items = Array.from({ length: localIterationCount }, (_, i) => i);
      }
      
      logger.debug('Executing loop', { nodeId: id, itemCount: items.length });

      // Update node with initial state
      updateWorkflow({
        id: selectedWorkflow,
        nodes: (prev) => {
          return prev.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data,
                    items: useItems ? JSON.parse(localItems) : undefined,
                    iterationCount: useItems ? undefined : localIterationCount,
                    delay: localDelay,
                    currentIndex: 0,
                    isRunning: true,
                    isSuccess: false,
                    isError: false,
                    result: [],
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });

      // Simulate loop execution with delay
      let currentIndex = 0;
      const results: any[] = [];
      
      const processNextItem = () => {
        if (currentIndex >= items.length) {
          // Loop complete
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          // Update node with final results
          updateWorkflow({
            id: selectedWorkflow,
            nodes: (prev) => {
              return prev.map(node => 
                node.id === id 
                  ? { 
                      ...node, 
                      data: { 
                        ...node.data,
                        currentIndex: null,
                        isRunning: false,
                        isSuccess: true,
                        result: results,
                        isLocked: node.data.isLocked // Preserve locked status
                      } 
                    }
                  : node
              );
            }
          });
          
          setIsExecuting(false);
          logger.info('Loop execution completed', { nodeId: id, iterations: items.length });
          return;
        }
        
        // Process current item
        const item = items[currentIndex];
        results.push({ index: currentIndex, value: item });
        
        // Update node with current progress
        updateWorkflow({
          id: selectedWorkflow,
          nodes: (prev) => {
            return prev.map(node => 
              node.id === id 
                ? { 
                    ...node, 
                    data: { 
                      ...node.data,
                      currentIndex,
                      result: [...results],
                      isLocked: node.data.isLocked // Preserve locked status
                    } 
                  }
                : node
            );
          }
        });
        
        currentIndex++;
      };
      
      // Start the interval
      intervalRef.current = setInterval(processNextItem, localDelay);
      
      // Process first item immediately
      processNextItem();
      
      // Scroll to result if expanded
      if (isExpanded) {
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    } catch (error) {
      logger.error('Error executing loop', error as Error);
      
      // Update node with error state
      updateWorkflow({
        id: selectedWorkflow,
        nodes: (prev) => {
          return prev.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    isRunning: false,
                    isSuccess: false,
                    isError: true,
                    currentIndex: null,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      setIsExecuting(false);
    }
  }, [
    useItems, 
    localItems, 
    localIterationCount, 
    localDelay, 
    id, 
    selectedWorkflow, 
    updateWorkflow, 
    logger, 
    isExpanded
  ]);

  const saveConfiguration = useCallback(() => {
    if (!selectedWorkflow) return;
    
    try {
      // Parse items if using items
      let parsedItems;
      if (useItems) {
        try {
          parsedItems = JSON.parse(localItems);
          if (!Array.isArray(parsedItems)) {
            throw new Error('Items must be an array');
          }
        } catch (error) {
          logger.error('Error parsing items', error as Error);
          return;
        }
      }
      
      // Update node configuration
      updateWorkflow({
        id: selectedWorkflow,
        nodes: (prev) => {
          return prev.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data,
                    items: useItems ? parsedItems : undefined,
                    iterationCount: useItems ? undefined : localIterationCount,
                    delay: localDelay,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      setIsConfiguring(false);
      logger.info('Loop node configuration saved', { nodeId: id });
    } catch (error) {
      logger.error('Error saving loop node configuration', error as Error);
    }
  }, [selectedWorkflow, id, useItems, localItems, localIterationCount, localDelay, updateWorkflow, logger]);

  // Render the configuration panel
  const renderConfigPanel = () => (
    <div className="p-3 bg-gray-900/80 border-t border-green-500/20 rounded-b-lg">
      <h4 className="text-xs font-medium text-gray-300 mb-2">Loop Configuration</h4>
      
      <div className="space-y-3">
        {/* Loop type selection */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">Loop Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => setUseItems(false)}
              className={cn(
                "flex-1 px-2 py-1.5 text-xs rounded-md transition-colors",
                !useItems 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              Iteration Count
            </button>
            <button
              onClick={() => setUseItems(true)}
              className={cn(
                "flex-1 px-2 py-1.5 text-xs rounded-md transition-colors",
                useItems 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              Array Items
            </button>
          </div>
        </div>
        
        {/* Iteration count or items */}
        {!useItems ? (
          <div>
            <label className="text-xs font-medium text-gray-300 mb-1 block">
              Iteration Count
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={localIterationCount}
              onChange={(e) => setLocalIterationCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-300 focus:outline-hidden focus:ring-1 focus:ring-green-500/30"
            />
          </div>
        ) : (
          <div>
            <label className="text-xs font-medium text-gray-300 mb-1 block">
              Items Array (JSON)
            </label>
            <textarea
              value={localItems}
              onChange={(e) => setLocalItems(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-300 focus:outline-hidden focus:ring-1 focus:ring-green-500/30 font-mono h-20 resize-none"
              placeholder="[1, 2, 3, 4, 5]"
            />
          </div>
        )}
        
        {/* Delay */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            Delay Between Iterations (ms)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={localDelay}
              onChange={(e) => setLocalDelay(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-gray-300 w-12 text-right">
              {localDelay}ms
            </span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => setIsConfiguring(false)}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveConfiguration}
            className="px-2 py-1 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-md transition-colors flex items-center"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn(
      'rounded-lg shadow-lg overflow-hidden relative',
      'border border-green-500/30',
      'bg-linear-to-b from-green-500/5 to-green-500/10',
      'min-w-[240px]',
      isExpanded && 'min-h-[280px]',
      data.isError && 'border-red-500/40 from-red-500/5 to-red-500/10',
      data.isSuccess && 'border-green-500/40 from-green-500/10 to-green-500/15'
    )}>
      {/* Delete button */}
      <DeleteButton nodeId={id} isLocked={data.isLocked} />
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-green-400 border-2 border-green-500/30"
      />
      
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-3 py-2 flex justify-between items-center border-b border-green-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-green-500/10">
              <Circle className="h-3.5 w-3.5 text-green-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-green-400">{data.label}</span>
              <span className="text-xs text-gray-400">Loop Action</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded-md hover:bg-gray-800/50 text-gray-400 transition-colors"
              onClick={() => setIsConfiguring(!isConfiguring)}
              title="Configure loop"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
            
            <button 
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isExecuting 
                  ? "bg-blue-500/20 text-blue-400 animate-pulse" 
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
              )}
              onClick={handleExecuteLoop}
              disabled={isExecuting || (useItems ? !localItems : !localIterationCount)}
              title="Execute loop"
            >
              {isExecuting ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </button>
            
            <button 
              className="p-1.5 rounded-md hover:bg-gray-800/50 text-gray-400 transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
        
        {/* Loop info */}
        <div className="px-3 py-1.5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              {useItems ? (
                <>Array: {data.items ? `${data.items.length} items` : 'Not set'}</>
              ) : (
                <>Count: {data.iterationCount || 0} iterations</>
              )}
            </div>
            
            {data.delay && (
              <div className="text-xs text-gray-400">
                Delay: {data.delay}ms
              </div>
            )}
          </div>
          
          {data.currentIndex !== undefined && (
            <div className="mt-1.5">
              <div className="text-xs text-gray-300 mb-1">
                Progress: {data.currentIndex + 1}/{useItems ? data.items?.length : data.iterationCount}
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-200"
                  style={{ 
                    width: `${((data.currentIndex + 1) / (useItems ? data.items?.length || 1 : data.iterationCount || 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center gap-2 px-3 py-1 text-xs">
          {data.isRunning && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 animate-pulse flex items-center">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Running
            </span>
          )}
          {data.isSuccess && (
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 flex items-center">
              <Check className="h-3 w-3 mr-1" />
              Complete
            </span>
          )}
          {data.isError && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 flex items-center">
              <X className="h-3 w-3 mr-1" />
              Error
            </span>
          )}
        </div>
        
        {/* Configuration panel */}
        {isConfiguring && renderConfigPanel()}
        
        {/* Result section */}
        {isExpanded && data.result && data.result.length > 0 && (
          <div 
            ref={resultRef}
            className="mt-1 p-3 border-t border-green-500/20 bg-gray-900/80 flex-1 overflow-auto"
          >
            <div className="text-xs font-medium text-gray-300 mb-2">
              Loop Results
            </div>
            
            <div className="space-y-1 max-h-[200px] overflow-auto pr-1">
              {data.result.map((item: any, index: number) => (
                <div 
                  key={index}
                  className={cn(
                    "p-2 rounded border border-gray-700/50 bg-gray-900/50 flex items-center justify-between",
                    index === data.currentIndex && "border-green-500/30 bg-green-500/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-gray-800 rounded-md text-xs text-gray-400 font-mono">
                      {index}
                    </span>
                    <span className="text-xs text-gray-300 font-mono">
                      {typeof item.value === 'object' 
                        ? JSON.stringify(item.value) 
                        : String(item.value)
                      }
                    </span>
                  </div>
                  
                  {index === data.currentIndex && (
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right}
        className="w-3 h-3 bg-green-400 border-2 border-green-500/30"
      />
    </div>
  );
}