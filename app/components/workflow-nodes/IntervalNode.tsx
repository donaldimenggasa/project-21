import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { Clock, Play, Pause, RefreshCw, ChevronDown, ChevronUp, Settings, Save, X, Check, BarChart } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '~/lib/utils';
import { useStore } from '~/store/zustand/store';
import { Logger } from '~/lib/logger';
import { DeleteButton } from './DeleteButton';

interface IntervalNodeData {
  label: string;
  interval?: number; // in milliseconds
  maxExecutions?: number;
  executionCount?: number;
  isRunning?: boolean;
  result?: any;
  isSuccess?: boolean;
  isError?: boolean;
  isLocked?: boolean;
  executionHistory?: { timestamp: number; success: boolean }[];
}

interface IntervalNodeProps {
  data: IntervalNodeData;
  id: string;
}

export function IntervalNode({ data, id }: IntervalNodeProps) {
  const { selectedWorkflow, updateWorkflow } = useStore();
  const logger = useMemo(() => Logger.getInstance(), []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isRunning, setIsRunning] = useState(!!data.isRunning);
  const [localInterval, setLocalInterval] = useState(data.interval || 1000);
  const [localMaxExecutions, setLocalMaxExecutions] = useState(data.maxExecutions || 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const executionCountRef = useRef(data.executionCount || 0);
  const executionHistoryRef = useRef<{ timestamp: number; success: boolean }[]>(
    data.executionHistory || []
  );
  
  const resultRef = useRef<HTMLDivElement>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update local state when node data changes
  useEffect(() => {
    setIsRunning(!!data.isRunning);
    executionCountRef.current = data.executionCount || 0;
    executionHistoryRef.current = data.executionHistory || [];
  }, [data.isRunning, data.executionCount, data.executionHistory]);

  const handleIntervalExecution = useCallback(() => {
    if (!selectedWorkflow) return;
    
    executionCountRef.current += 1;
    const currentCount = executionCountRef.current;
    
    // Add to execution history
    const success = Math.random() > 0.2; // 80% success rate for demo
    const newHistoryEntry = { timestamp: Date.now(), success };
    executionHistoryRef.current = [
      newHistoryEntry,
      ...executionHistoryRef.current.slice(0, 19) // Keep last 20 entries
    ];
    
    logger.debug('Interval executed', { 
      nodeId: id, 
      executionCount: currentCount,
      maxExecutions: localMaxExecutions,
      success
    });
    
    // Update node with new execution count and history
    updateWorkflow({
      id: selectedWorkflow,
      nodes: (prev) => {
        return prev.map(node => 
          node.id === id 
            ? { 
                ...node, 
                data: { 
                  ...node.data, 
                  executionCount: currentCount,
                  executionHistory: executionHistoryRef.current,
                  result: { 
                    timestamp: Date.now(), 
                    count: currentCount,
                    success
                  },
                  isSuccess: success,
                  isError: !success,
                  isLocked: node.data.isLocked // Preserve locked status
                } 
              }
            : node
        );
      }
    });
    
    // Stop if we've reached max executions
    if (localMaxExecutions > 0 && currentCount >= localMaxExecutions) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setIsRunning(false);
      
      // Update node to show stopped state
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
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      logger.info('Interval stopped after reaching max executions', { 
        nodeId: id, 
        maxExecutions: localMaxExecutions 
      });
    }
    
    // Scroll to result if expanded
    if (isExpanded) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [selectedWorkflow, id, localMaxExecutions, updateWorkflow, logger, isExpanded]);

  const toggleInterval = useCallback(() => {
    if (!selectedWorkflow) return;
    
    if (isRunning) {
      // Stop the interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setIsRunning(false);
      
      // Update node state
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
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      logger.debug('Interval stopped', { nodeId: id });
    } else {
      // Start the interval
      const interval = localInterval || 1000; // Default to 1 second
      
      // Reset execution count if needed
      if (localMaxExecutions > 0) {
        executionCountRef.current = 0;
        executionHistoryRef.current = [];
        
        updateWorkflow({
          id: selectedWorkflow,
          nodes: (prev) => {
            return prev.map(node => 
              node.id === id 
                ? { 
                    ...node, 
                    data: { 
                      ...node.data, 
                      executionCount: 0,
                      executionHistory: [],
                      isLocked: node.data.isLocked // Preserve locked status
                    } 
                  }
                : node
            );
          }
        });
      }
      
      intervalRef.current = setInterval(handleIntervalExecution, interval);
      setIsRunning(true);
      
      // Update node state
      updateWorkflow({
        id: selectedWorkflow,
        nodes: (prev) => {
          return prev.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    isRunning: true,
                    isError: false,
                    interval,
                    maxExecutions: localMaxExecutions,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      logger.debug('Interval started', { 
        nodeId: id, 
        interval, 
        maxExecutions: localMaxExecutions 
      });
    }
  }, [isRunning, selectedWorkflow, id, localInterval, localMaxExecutions, updateWorkflow, handleIntervalExecution, logger]);

  const saveConfiguration = useCallback(() => {
    if (!selectedWorkflow) return;
    
    try {
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
                    interval: localInterval,
                    maxExecutions: localMaxExecutions,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      setIsConfiguring(false);
      logger.info('Interval node configuration saved', { 
        nodeId: id, 
        interval: localInterval, 
        maxExecutions: localMaxExecutions 
      });
    } catch (error) {
      logger.error('Error saving interval node configuration', error as Error);
    }
  }, [selectedWorkflow, id, localInterval, localMaxExecutions, updateWorkflow, logger]);

  // Format time for display
  const formatInterval = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Render the configuration panel
  const renderConfigPanel = () => (
    <div className="p-3 bg-gray-900/80 border-t border-orange-500/20 rounded-b-lg">
      <h4 className="text-xs font-medium text-gray-300 mb-2">Interval Configuration</h4>
      
      <div className="space-y-3">
        {/* Interval */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            Interval
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={localInterval}
              onChange={(e) => setLocalInterval(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-gray-300 w-16 text-right">
              {formatInterval(localInterval)}
            </span>
          </div>
        </div>
        
        {/* Max executions */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            Max Executions (0 = unlimited)
          </label>
          <input
            type="number"
            min="0"
            max="1000"
            value={localMaxExecutions}
            onChange={(e) => setLocalMaxExecutions(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-300 focus:outline-hidden focus:ring-1 focus:ring-orange-500/30"
          />
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
            className="px-2 py-1 text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-md transition-colors flex items-center"
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
      'border border-orange-500/30',
      'bg-linear-to-b from-orange-500/5 to-orange-500/10',
      'min-w-[240px]',
      isExpanded && 'min-h-[280px]',
      data.isError && 'border-red-500/40 from-red-500/5 to-red-500/10',
      data.isSuccess && 'border-green-500/30 from-green-500/5 to-green-500/10'
    )}>
      {/* Delete button */}
      <DeleteButton nodeId={id} isLocked={data.isLocked} />
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-orange-400 border-2 border-orange-500/30"
      />
      
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-3 py-2 flex justify-between items-center border-b border-orange-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-500/10">
              <Clock className="h-3.5 w-3.5 text-orange-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-orange-400">{data.label}</span>
              <span className="text-xs text-gray-400">Interval</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded-md hover:bg-gray-800/50 text-gray-400 transition-colors"
              onClick={() => setIsConfiguring(!isConfiguring)}
              title="Configure interval"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
            
            <button 
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isRunning 
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-400" 
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
              )}
              onClick={toggleInterval}
              title={isRunning ? "Stop interval" : "Start interval"}
            >
              {isRunning ? (
                <Pause className="h-3.5 w-3.5" />
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
        
        {/* Interval info */}
        <div className="px-3 py-1.5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Interval: {formatInterval(data.interval || 1000)}
            </div>
            
            {data.maxExecutions > 0 && (
              <div className="text-xs text-gray-400">
                Max: {data.maxExecutions}
              </div>
            )}
          </div>
          
          {data.executionCount !== undefined && (
            <div className="mt-1.5">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-gray-300">
                  Executions: {data.executionCount}
                  {data.maxExecutions > 0 && `/${data.maxExecutions}`}
                </div>
                
                {isRunning && (
                  <div className="flex items-center text-blue-400 text-xs">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Running
                  </div>
                )}
              </div>
              
              {data.maxExecutions > 0 && (
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-200"
                    style={{ 
                      width: `${(data.executionCount / data.maxExecutions) * 100}%` 
                    }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center gap-2 px-3 py-1 text-xs">
          {data.isRunning && !isRunning && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 animate-pulse flex items-center">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Running
            </span>
          )}
          {data.isSuccess && (
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 flex items-center">
              <Check className="h-3 w-3 mr-1" />
              Success
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
        {isExpanded && data.executionHistory && data.executionHistory.length > 0 && (
          <div 
            ref={resultRef}
            className="mt-1 p-3 border-t border-orange-500/20 bg-gray-900/80 flex-1 overflow-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-300">
                Execution History
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-gray-400">Success</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <span className="text-xs text-gray-400">Error</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-1 max-h-[200px] overflow-auto pr-1">
              {data.executionHistory.map((execution, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-2 rounded border bg-gray-900/50 flex items-center justify-between",
                    execution.success 
                      ? "border-green-500/20" 
                      : "border-red-500/20"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      execution.success ? "bg-green-400" : "bg-red-400"
                    )}></div>
                    <span className="text-xs text-gray-300">
                      {formatTimestamp(execution.timestamp)}
                    </span>
                  </div>
                  
                  <span className="text-xs text-gray-400">
                    #{data.executionHistory.length - index}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Simple chart visualization */}
            {data.executionHistory.length >= 5 && (
              <div className="mt-3 border-t border-gray-700/50 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-300">Success Rate</span>
                </div>
                
                <div className="h-8 flex items-end gap-0.5">
                  {data.executionHistory.slice(0, 10).reverse().map((execution, index) => (
                    <div 
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div 
                        className={cn(
                          "w-full transition-all duration-200",
                          execution.success ? "bg-green-500/50" : "bg-red-500/50"
                        )}
                        style={{ 
                          height: '100%',
                          maxHeight: '24px'
                        }}
                      ></div>
                      <div className="text-[8px] text-gray-500 mt-0.5">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right}
        className="w-3 h-3 bg-orange-400 border-2 border-orange-500/30"
      />
    </div>
  );
}