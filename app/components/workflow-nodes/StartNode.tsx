import React, { useCallback, useState, useRef, useMemo } from 'react';
import { Play, RefreshCw, ChevronDown, ChevronUp, Settings, Save, X, Check, Clock, BarChart, Lock } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '~/lib/utils';
import { useStore } from '~/store/zustand/store';
import { Logger } from '~/lib/logger';
import { WorkflowExecutor } from '~/lib/workflow-executor';

interface StartNodeData {
  label: string;
  result?: any;
  isSuccess?: boolean;
  isError?: boolean;
  isRunning?: boolean;
  isLocked?: boolean;
  executionHistory?: { timestamp: number; duration: number; success: boolean }[];
  autoStart?: boolean;
  triggerType?: 'manual' | 'scheduled' | 'webhook';
  schedule?: string;
}

interface StartNodeProps {
  data: StartNodeData;
  id: string;
}

export function StartNode({ data, id }: StartNodeProps) {
  const { selectedWorkflow, workflow, updateWorkflow } = useStore();
  const logger = useMemo(() => Logger.getInstance(), []);
  const workflowExecutor = useMemo(() => WorkflowExecutor.getInstance(), []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [localAutoStart, setLocalAutoStart] = useState(data.autoStart || false);
  const [localTriggerType, setLocalTriggerType] = useState<'manual' | 'scheduled' | 'webhook'>(
    data.triggerType || 'manual'
  );
  const [localSchedule, setLocalSchedule] = useState(data.schedule || '0 0 * * *'); // Default to midnight
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleStartWorkflow = useCallback(async () => {
    if (!selectedWorkflow) {
      logger.warn('Cannot start workflow: no workflow selected', { nodeId: id });
      return;
    }

    setIsStarting(true);
    
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
      logger.debug('Starting workflow execution', { nodeId: id, workflowId: selectedWorkflow });

      const startTime = performance.now();
      
      // Get the current workflow
      const currentWorkflow = workflow[selectedWorkflow];
      
      // Execute the workflow
      const executionContext = await workflowExecutor.executeWorkflow(
        currentWorkflow,
        id,
        { startTime: Date.now() }
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Check if there were any errors
      const hasErrors = Object.keys(executionContext.errors).length > 0;
      
      // Add to execution history
      const newHistoryEntry = { 
        timestamp: Date.now(), 
        duration, 
        success: !hasErrors 
      };
      
      const updatedHistory = [
        newHistoryEntry,
        ...(data.executionHistory || []).slice(0, 9) // Keep last 10 entries
      ];

      // Update all nodes with their execution results
      updateWorkflow({
        id: selectedWorkflow,
        nodes: (prev) => {
          return prev.map(node => {
            // For the start node
            if (node.id === id) {
              return { 
                ...node, 
                data: { 
                  ...node.data, 
                  result: { 
                    started: true, 
                    timestamp: Date.now(),
                    duration,
                    success: !hasErrors
                  },
                  executionHistory: updatedHistory,
                  isRunning: false,
                  isSuccess: !hasErrors,
                  isError: hasErrors
                } 
              };
            }
            
            // For other nodes that were executed
            if (executionContext.executedNodes.includes(node.id)) {
              const nodeResult = executionContext.nodeResults[node.id];
              const nodeError = executionContext.errors[node.id];
              
              return {
                ...node,
                data: {
                  ...node.data,
                  result: nodeResult,
                  isSuccess: !nodeError,
                  isError: !!nodeError,
                  isRunning: false,
                  errorMessage: nodeError?.message
                }
              };
            }
            
            return node;
          });
        }
      });
      
      setIsStarting(false);
      
      // Scroll to result if expanded
      if (isExpanded) {
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
      
      logger.info('Workflow execution completed', { 
        nodeId: id, 
        workflowId: selectedWorkflow,
        executionId: executionContext.executionId,
        duration,
        success: !hasErrors,
        executedNodes: executionContext.executedNodes.length
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
                    isError: true
                  } 
                }
              : node
          );
        }
      });
      
      setIsStarting(false);
    }
  }, [id, selectedWorkflow, updateWorkflow, logger, workflow, workflowExecutor, isExpanded, data.executionHistory]);

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
                    autoStart: localAutoStart,
                    triggerType: localTriggerType,
                    schedule: localTriggerType === 'scheduled' ? localSchedule : undefined,
                    isLocked: true // Always keep the locked status
                  } 
                }
              : node
          );
        }
      });
      
      setIsConfiguring(false);
      logger.info('Start node configuration saved', { nodeId: id });
    } catch (error) {
      logger.error('Error saving start node configuration', error as Error);
    }
  }, [selectedWorkflow, id, localAutoStart, localTriggerType, localSchedule, updateWorkflow, logger]);

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
    <div className="p-3 bg-gray-900/80 border-t border-emerald-500/20 rounded-b-lg">
      <h4 className="text-xs font-medium text-gray-300 mb-2">Start Configuration</h4>
      
      <div className="space-y-3">
        {/* Trigger type */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            Trigger Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setLocalTriggerType('manual')}
              className={cn(
                "px-2 py-1.5 text-xs rounded-md transition-colors flex flex-col items-center gap-1",
                localTriggerType === 'manual' 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              <Play className="h-3.5 w-3.5" />
              <span>Manual</span>
            </button>
            <button
              onClick={() => setLocalTriggerType('scheduled')}
              className={cn(
                "px-2 py-1.5 text-xs rounded-md transition-colors flex flex-col items-center gap-1",
                localTriggerType === 'scheduled' 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Scheduled</span>
            </button>
            <button
              onClick={() => setLocalTriggerType('webhook')}
              className={cn(
                "px-2 py-1.5 text-xs rounded-md transition-colors flex flex-col items-center gap-1",
                localTriggerType === 'webhook' 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 16.98h-5.99c-1.66 0-3.01-1.34-3.01-3s1.34-3 3.01-3H18" />
                <path d="M6 7.02h6c1.66 0 3 1.34 3 3s-1.34 3-3 3H6" />
              </svg>
              <span>Webhook</span>
            </button>
          </div>
        </div>
        
        {/* Schedule (only for scheduled trigger) */}
        {localTriggerType === 'scheduled' && (
          <div>
            <label className="text-xs font-medium text-gray-300 mb-1 block">
              Schedule (Cron Expression)
            </label>
            <input
              type="text"
              value={localSchedule}
              onChange={(e) => setLocalSchedule(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              placeholder="0 0 * * *"
            />
            <div className="text-xs text-gray-500 mt-1">
              Example: "0 0 * * *" (daily at midnight)
            </div>
          </div>
        )}
        
        {/* Webhook URL (only for webhook trigger) */}
        {localTriggerType === 'webhook' && (
          <div>
            <label className="text-xs font-medium text-gray-300 mb-1 block">
              Webhook URL
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value="https://api.example.com/webhooks/workflow-123"
                readOnly
                className="flex-1 bg-gray-800 border border-gray-700 rounded-l-md px-2 py-1.5 text-xs text-gray-300"
              />
              <button
                className="px-2 py-1.5 bg-gray-700 text-gray-300 rounded-r-md text-xs"
                onClick={() => {
                  navigator.clipboard.writeText("https://api.example.com/webhooks/workflow-123");
                }}
              >
                Copy
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Send a POST request to this URL to trigger the workflow
            </div>
          </div>
        )}
        
        {/* Auto start */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoStart"
            checked={localAutoStart}
            onChange={(e) => setLocalAutoStart(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
          />
          <label htmlFor="autoStart" className="ml-2 text-xs text-gray-300">
            Auto-start when workflow is loaded
          </label>
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
            className="px-2 py-1 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-md transition-colors flex items-center"
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
      'rounded-lg shadow-lg overflow-hidden',
      'border border-emerald-500/30',
      'bg-gradient-to-b from-emerald-500/5 to-emerald-500/10',
      'min-w-[240px]',
      isExpanded && 'min-h-[280px]',
      data.isError && 'border-red-500/40 from-red-500/5 to-red-500/10',
      data.isSuccess && 'border-emerald-500/40 from-emerald-500/10 to-emerald-500/15'
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-3 py-2 flex justify-between items-center border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-500/10">
              <Play className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-sm font-medium text-emerald-400">{data.label}</span>
                {data.isLocked && (
                  <Lock className="h-3 w-3 ml-1.5 text-emerald-400/70" title="This node cannot be deleted" />
                )}
              </div>
              <span className="text-xs text-gray-400">Start</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded-md hover:bg-gray-800/50 text-gray-400 transition-colors"
              onClick={() => setIsConfiguring(!isConfiguring)}
              title="Configure start node"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
            
            <button 
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isStarting 
                  ? "bg-blue-500/20 text-blue-400 animate-pulse" 
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
              )}
              onClick={handleStartWorkflow}
              disabled={isStarting}
              title="Start workflow"
            >
              {isStarting ? (
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
        
        {/* Trigger info */}
        <div className="px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            {data.triggerType === 'scheduled' ? (
              <Clock className="h-3.5 w-3.5 text-gray-400" />
            ) : data.triggerType === 'webhook' ? (
              <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 16.98h-5.99c-1.66 0-3.01-1.34-3.01-3s1.34-3 3.01-3H18" />
                <path d="M6 7.02h6c1.66 0 3 1.34 3 3s-1.34 3-3 3H6" />
              </svg>
            ) : (
              <Play className="h-3.5 w-3.5 text-gray-400" />
            )}
            
            <span className="text-xs text-gray-300">
              {data.triggerType === 'scheduled' 
                ? `Scheduled (${data.schedule || 'Not set'})` 
                : data.triggerType === 'webhook'
                  ? 'Webhook Trigger'
                  : 'Manual Trigger'
              }
            </span>
          </div>
          
          {data.autoStart && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
              <Check className="h-3 w-3" />
              Auto-start enabled
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
        
        {/* Configuration panel */}
        {isConfiguring && renderConfigPanel()}
        
        {/* Result section */}
        {isExpanded && data.executionHistory && data.executionHistory.length > 0 && (
          <div 
            ref={resultRef}
            className="mt-1 p-3 border-t border-emerald-500/20 bg-gray-900/80 flex-1 overflow-auto"
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
                      {formatTimestamp(execution.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatDuration(execution.duration)}
                    </span>
                    <span className="text-xs text-gray-500">
                      #{data.executionHistory.length - index}
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
                            execution.success ? "bg-emerald-500/50" : "bg-red-500/50"
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
        className="w-3 h-3 bg-emerald-400 border-2 border-emerald-500/30"
      />
    </div>
  );
}