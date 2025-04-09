import React, { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { FileOutput, Play, RefreshCw, ChevronDown, ChevronUp, Settings, Save, X, Check, Clock, BarChart, AlertTriangle } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '~/lib/utils';
import { useStore } from '~/store/zustand/store';
import { Logger } from '~/lib/logger';
import { DeleteButton } from './DeleteButton';
import { WorkflowExecutor } from '~/lib/workflow-executor';

interface ExecuteWorkflowNodeData {
  label: string;
  targetWorkflowId?: string;
  result?: any;
  isSuccess?: boolean;
  isError?: boolean;
  isRunning?: boolean;
  isLocked?: boolean;
  executionHistory?: { timestamp: number; duration: number; success: boolean; workflowName: string }[];
  errorMessage?: string;
}

interface ExecuteWorkflowNodeProps {
  data: ExecuteWorkflowNodeData;
  id: string;
}

export function ExecuteWorkflowNode({ data, id }: ExecuteWorkflowNodeProps) {
  const { selectedWorkflow, workflow, updateWorkflow } = useStore();
  const logger = useMemo(() => Logger.getInstance(), []);
  const workflowExecutor = useMemo(() => WorkflowExecutor.getInstance(), []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [localTargetWorkflowId, setLocalTargetWorkflowId] = useState(data.targetWorkflowId || '');
  
  const resultRef = useRef<HTMLDivElement>(null);

  // Get all workflows for the current page
  const currentPageWorkflows = useMemo(() => {
    if (!selectedWorkflow) return [];
    
    const currentWorkflow = workflow[selectedWorkflow];
    if (!currentWorkflow) return [];
    
    return Object.values(workflow)
      .filter(w => w.parentPageId === currentWorkflow.parentPageId)
      .filter(w => w.id !== selectedWorkflow) // Exclude the current workflow
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedWorkflow, workflow]);

  // Check if selecting this workflow would create an infinite loop
  const checkForInfiniteLoop = useCallback((targetId: string): boolean => {
    if (!selectedWorkflow) return false;
    
    // Function to check if a workflow calls another workflow that eventually calls back to the original
    const checkCycle = (currentId: string, visited: Set<string> = new Set()): boolean => {
      // If we've already visited this workflow, we have a cycle
      if (visited.has(currentId)) return true;
      
      // Add current workflow to visited set
      visited.add(currentId);
      
      // Get the current workflow
      const currentWorkflow = workflow[currentId];
      if (!currentWorkflow) return false;
      
      // Check all nodes in the workflow
      for (const node of currentWorkflow.nodes || []) {
        // If this is an ExecuteWorkflowNode and it has a targetWorkflowId
        if (node.type === 'executeWorkflowNode' && node.data?.targetWorkflowId) {
          // If the target is our original workflow, we have a cycle
          if (node.data.targetWorkflowId === selectedWorkflow) return true;
          
          // Recursively check if the target workflow creates a cycle
          if (checkCycle(node.data.targetWorkflowId, new Set(visited))) return true;
        }
      }
      
      return false;
    };
    
    // Start the check from the target workflow
    return checkCycle(targetId);
  }, [selectedWorkflow, workflow]);

  const handleExecuteWorkflow = useCallback(async () => {
    if (!localTargetWorkflowId || !selectedWorkflow) {
      logger.warn('Cannot execute workflow: no target workflow selected or no current workflow', { nodeId: id });
      return;
    }

    // Check if the target workflow exists
    const targetWorkflow = workflow[localTargetWorkflowId];
    if (!targetWorkflow) {
      logger.warn('Cannot execute workflow: target workflow not found', { nodeId: id, targetWorkflowId: localTargetWorkflowId });
      return;
    }

    setIsExecuting(true);
    
    // Update node with running state
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
                  isSuccess: false,
                  isError: false
                } 
              }
            : node
        );
      }
    });

    try {
      logger.debug('Executing workflow', { 
        nodeId: id, 
        targetWorkflowId: localTargetWorkflowId,
        targetWorkflowName: targetWorkflow.name
      });

      const startTime = performance.now();
      
      // Find the start node in the target workflow
      const startNode = targetWorkflow.nodes.find((node: any) => node.type === 'startNode');
      if (!startNode) {
        throw new Error('Target workflow has no start node');
      }
      
      // Execute the target workflow
      const executionContext = await workflowExecutor.executeWorkflow(
        targetWorkflow,
        startNode.id,
        { 
          parentWorkflowId: selectedWorkflow,
          parentNodeId: id,
          startTime: Date.now() 
        }
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Check if there were any errors
      const hasErrors = Object.keys(executionContext.errors).length > 0;
      
      // Add to execution history
      const newHistoryEntry = { 
        timestamp: Date.now(), 
        duration, 
        success: !hasErrors,
        workflowName: targetWorkflow.name
      };
      
      const updatedHistory = [
        newHistoryEntry,
        ...(data.executionHistory || []).slice(0, 9) // Keep last 10 entries
      ];

      // Update node with result
      updateWorkflow({
        id: selectedWorkflow,
        nodes: (prev) => {
          return prev.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    targetWorkflowId: localTargetWorkflowId,
                    result: { 
                      executed: true, 
                      timestamp: Date.now(),
                      duration,
                      success: !hasErrors,
                      data: executionContext.nodeResults
                    },
                    executionHistory: updatedHistory,
                    isRunning: false,
                    isSuccess: !hasErrors,
                    isError: hasErrors,
                    errorMessage: hasErrors ? 'Error executing workflow' : undefined
                  } 
                }
              : node
          );
        }
      });
      
      setIsExecuting(false);
      
      // Scroll to result if expanded
      if (isExpanded) {
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
      
      logger.info('Workflow execution completed', { 
        nodeId: id, 
        targetWorkflowId: localTargetWorkflowId,
        targetWorkflowName: targetWorkflow.name,
        executionId: executionContext.executionId,
        duration,
        success: !hasErrors
      });
    } catch (error) {
      logger.error('Error executing workflow', error as Error);
      
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
                    errorMessage: error instanceof Error ? error.message : 'Unknown error'
                  } 
                }
              : node
          );
        }
      });
      
      setIsExecuting(false);
    }
  }, [id, localTargetWorkflowId, selectedWorkflow, workflow, updateWorkflow, logger, workflowExecutor, isExpanded, data.executionHistory]);

  const saveConfiguration = useCallback(() => {
    if (!selectedWorkflow) return;
    
    try {
      // Check for infinite loops
      if (localTargetWorkflowId && checkForInfiniteLoop(localTargetWorkflowId)) {
        logger.warn('Cannot save configuration: would create an infinite loop', { 
          nodeId: id, 
          targetWorkflowId: localTargetWorkflowId 
        });
        
        // Show error in the node
        updateWorkflow({
          id: selectedWorkflow,
          nodes: (prev) => {
            return prev.map(node => 
              node.id === id 
                ? { 
                    ...node, 
                    data: { 
                      ...node.data,
                      isError: true,
                      errorMessage: 'Cannot create an infinite loop of workflow executions'
                    } 
                  }
                : node
            );
          }
        });
        
        return;
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
                    targetWorkflowId: localTargetWorkflowId,
                    isLocked: node.data.isLocked, // Preserve locked status
                    isError: false,
                    errorMessage: undefined
                  } 
                }
              : node
          );
        }
      });
      
      setIsConfiguring(false);
      logger.info('Execute workflow node configuration saved', { 
        nodeId: id, 
        targetWorkflowId: localTargetWorkflowId 
      });
    } catch (error) {
      logger.error('Error saving execute workflow node configuration', error as Error);
    }
  }, [selectedWorkflow, id, localTargetWorkflowId, updateWorkflow, logger, checkForInfiniteLoop]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Format duration for display
  const formatDuration = (duration: number): string => {
    if (duration < 1000) return `${Math.round(duration)}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  // Render the configuration panel
  const renderConfigPanel = () => (
    <div className="p-3 bg-gray-900/80 border-t border-indigo-500/20 rounded-b-lg">
      <h4 className="text-xs font-medium text-gray-300 mb-2">Workflow Configuration</h4>
      
      <div className="space-y-3">
        {/* Target workflow selection */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            Target Workflow
          </label>
          
          {currentPageWorkflows.length === 0 ? (
            <div className="text-xs text-gray-500 italic">
              No other workflows available on this page
            </div>
          ) : (
            <select
              value={localTargetWorkflowId}
              onChange={(e) => setLocalTargetWorkflowId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
            >
              <option value="">Select a workflow...</option>
              {currentPageWorkflows.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} - {w.description.substring(0, 30)}{w.description.length > 30 ? '...' : ''}
                </option>
              ))}
            </select>
          )}
          
          {/* Warning about infinite loops */}
          {localTargetWorkflowId && checkForInfiniteLoop(localTargetWorkflowId) && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-400 flex items-start">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Infinite loop detected!</strong> This would create a circular reference between workflows.
              </div>
            </div>
          )}
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
            className="px-2 py-1 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-md transition-colors flex items-center"
            disabled={!localTargetWorkflowId || (localTargetWorkflowId && checkForInfiniteLoop(localTargetWorkflowId))}
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
      'border border-indigo-500/30',
      'bg-gradient-to-b from-indigo-500/5 to-indigo-500/10',
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
        className="w-3 h-3 bg-indigo-400 border-2 border-indigo-500/30"
      />
      
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-3 py-2 flex justify-between items-center border-b border-indigo-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-indigo-500/10">
              <FileOutput className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-indigo-400">{data.label}</span>
              <span className="text-xs text-gray-400">Execute Workflow</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded-md hover:bg-gray-800/50 text-gray-400 transition-colors"
              onClick={() => setIsConfiguring(!isConfiguring)}
              title="Configure workflow execution"
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
              onClick={handleExecuteWorkflow}
              disabled={isExecuting || !localTargetWorkflowId}
              title={!localTargetWorkflowId ? "Select a target workflow first" : "Execute workflow"}
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
        
        {/* Target workflow info */}
        <div className="px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            
            {localTargetWorkflowId ? (
              <span className="text-xs text-gray-300">
                Target: {workflow[localTargetWorkflowId]?.name || 'Unknown workflow'}
              </span>
            ) : (
              <span className="text-xs text-gray-500 italic">
                No target workflow selected
              </span>
            )}
          </div>
          
          {data.result?.duration && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
              <span>Last execution: {formatDuration(data.result.duration)}</span>
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
              Success
            </span>
          )}
          {data.isError && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 flex items-center">
              <X className="h-3 w-3 mr-1" />
              Error
            </span>
          )}
          {data.result?.duration && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
              {formatDuration(data.result.duration)}
            </span>
          )}
        </div>
        
        {/* Error message */}
        {data.errorMessage && (
          <div className="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 border-t border-red-500/20">
            {data.errorMessage}
          </div>
        )}
        
        {/* Configuration panel */}
        {isConfiguring && renderConfigPanel()}
        
        {/* Result section */}
        {isExpanded && data.executionHistory && data.executionHistory.length > 0 && (
          <div 
            ref={resultRef}
            className="mt-1 p-3 border-t border-indigo-500/20 bg-gray-900/80 flex-1 overflow-auto"
          >
            <div className="text-xs font-medium text-gray-300 mb-2">
              Execution History
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
                      {execution.workflowName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatDuration(execution.duration)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(execution.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Performance chart */}
            {data.executionHistory.length >= 3 && (
              <div className="mt-3 border-t border-gray-700/50 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-300">Execution Times</span>
                </div>
                
                <div className="h-20 flex items-end gap-0.5">
                  {data.executionHistory.slice(0, 10).reverse().map((execution, index) => {
                    // Find max duration for scaling
                    const maxDuration = Math.max(
                      ...data.executionHistory.slice(0, 10).map(e => e.duration)
                    );
                    
                    // Calculate height percentage (max 100%)
                    const heightPercentage = Math.min(
                      100, 
                      (execution.duration / maxDuration) * 100
                    );
                    
                    return (
                      <div 
                        key={index}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div 
                          className={cn(
                            "w-full transition-all duration-200",
                            execution.success ? "bg-indigo-500/50" : "bg-red-500/50"
                          )}
                          style={{ 
                            height: `${heightPercentage}%`,
                            minHeight: '4px'
                          }}
                        ></div>
                        <div className="text-[8px] text-gray-500 mt-0.5">
                          {index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                  <div>Faster</div>
                  <div>Slower</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right}
        className="w-3 h-3 bg-indigo-400 border-2 border-indigo-500/30"
      />
    </div>
  );
}