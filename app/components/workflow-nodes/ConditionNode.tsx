import React, { useCallback, useState, useRef, useMemo } from 'react';
import { GitFork, Play, RefreshCw, ChevronDown, ChevronUp, Edit2, Save, X, Check } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '~/lib/utils';
import { useStore } from '~/store/zustand/store';
import { Logger } from '~/lib/logger';
import { executeCode } from '~/lib/evaluate';
import { CodeEditor } from '../codeEditor';
import { DeleteButton } from './DeleteButton';

interface ConditionNodeData {
  label: string;
  condition?: string;
  result?: any;
  isSuccess?: boolean;
  isError?: boolean;
  truePath?: boolean;
  falsePath?: boolean;
  isRunning?: boolean;
  isLocked?: boolean;
}

interface ConditionNodeProps {
  data: ConditionNodeData;
  id: string;
}

export function ConditionNode({ data, id }: ConditionNodeProps) {
  const { selectedWorkflow, updateWorkflow } = useStore();
  const logger = useMemo(() => Logger.getInstance(), []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [localCondition, setLocalCondition] = useState(data.condition || 'return true;');
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleEvaluateCondition = useCallback(async () => {
    if (!localCondition || !selectedWorkflow) {
      logger.warn('Cannot evaluate condition: condition expression is missing or no workflow selected', { nodeId: id });
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
                  isError: false,
                  truePath: false,
                  falsePath: false
                } 
              }
            : node
        );
      }
    });

    try {
      logger.debug('Evaluating condition', { nodeId: id, condition: localCondition });

      // Execute the condition code
      const result = await executeCode(localCondition, {
        workflow: { id: selectedWorkflow },
        nodes: {},
      });

      const conditionResult = !!result.data; // Convert to boolean
      logger.debug('Condition evaluation result', { 
        nodeId: id, 
        result: conditionResult,
        success: result.success
      });

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
                    condition: localCondition,
                    result: conditionResult,
                    isSuccess: result.success,
                    isError: !result.success,
                    truePath: conditionResult,
                    falsePath: !conditionResult,
                    isRunning: false,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      // Scroll to result if expanded
      if (isExpanded) {
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    } catch (error) {
      logger.error('Error evaluating condition', error as Error);
      
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
                    isSuccess: false,
                    isError: true,
                    truePath: false,
                    falsePath: false,
                    isRunning: false,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
    } finally {
      setIsExecuting(false);
    }
  }, [localCondition, id, selectedWorkflow, updateWorkflow, logger, isExpanded]);

  const saveCondition = useCallback(() => {
    if (!selectedWorkflow) return;
    
    try {
      // Update node with new condition
      updateWorkflow({
        id: selectedWorkflow,
        nodes: (prev) => {
          return prev.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data,
                    condition: localCondition,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      setIsEditing(false);
      logger.info('Condition saved', { nodeId: id });
    } catch (error) {
      logger.error('Error saving condition', error as Error);
    }
  }, [selectedWorkflow, id, localCondition, updateWorkflow, logger]);

  return (
    <div className={cn(
      'rounded-lg shadow-lg overflow-hidden relative',
      'border border-purple-500/30',
      'bg-linear-to-b from-purple-500/5 to-purple-500/10',
      'min-w-[240px]',
      isExpanded && 'min-h-[280px]',
      data.isError && 'border-red-500/40 from-red-500/5 to-red-500/10',
      data.truePath && 'border-green-500/30 from-green-500/5 to-green-500/10',
      data.falsePath && 'border-amber-500/30 from-amber-500/5 to-amber-500/10'
    )}>
      {/* Delete button */}
      <DeleteButton nodeId={id} isLocked={data.isLocked} />
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-purple-400 border-2 border-purple-500/30"
      />
      
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-3 py-2 flex justify-between items-center border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/10">
              <GitFork className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-purple-400">{data.label}</span>
              <span className="text-xs text-gray-400">Condition</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded-md hover:bg-gray-800/50 text-gray-400 transition-colors"
              onClick={() => setIsEditing(!isEditing)}
              title="Edit condition"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            
            <button 
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isExecuting 
                  ? "bg-blue-500/20 text-blue-400 animate-pulse" 
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
              )}
              onClick={handleEvaluateCondition}
              disabled={isExecuting || !localCondition}
              title={!localCondition ? "Condition is required" : "Evaluate condition"}
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
        
        {/* Condition display */}
        {!isEditing ? (
          <div className="px-3 py-1.5">
            <div className="text-xs font-mono text-gray-300 bg-gray-900/30 p-2 rounded-md max-h-16 overflow-auto">
              {data.condition || 'No condition set'}
            </div>
          </div>
        ) : (
          <div className="p-3 border-b border-purple-500/20">
            <div className="mb-2">
              <label className="text-xs font-medium text-gray-300">Condition Expression</label>
              <div className="mt-1 border border-gray-700 rounded-md overflow-hidden">
                <CodeEditor
                  value={localCondition}
                  onChange={setLocalCondition}
                  showLineNumbers={true}
                  syntaxType="javascript"
                  className="h-24"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCondition}
                className="px-2 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-md transition-colors flex items-center"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </button>
            </div>
          </div>
        )}
        
        {/* Status indicators */}
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs">
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
          {data.truePath && (
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
              True
            </span>
          )}
          {data.falsePath && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
              False
            </span>
          )}
        </div>
        
        {/* Result section (when expanded) */}
        {isExpanded && (data.result !== undefined || data.isError) && (
          <div 
            ref={resultRef}
            className={cn(
              "mt-1 p-3 border-t flex-1 overflow-auto",
              data.isError 
                ? "bg-red-950/20 border-red-500/30" 
                : data.truePath
                  ? "bg-green-950/20 border-green-500/30"
                  : "bg-amber-950/20 border-amber-500/30"
            )}
          >
            <div className="text-xs font-medium text-gray-300 mb-2">
              Evaluation Result
            </div>
            
            <div className={cn(
              "p-2 rounded bg-gray-900/50 border",
              data.isError 
                ? "border-red-500/20" 
                : data.truePath
                  ? "border-green-500/20"
                  : "border-amber-500/20"
            )}>
              {data.isError ? (
                <div className="text-xs text-red-400 font-mono">
                  Error evaluating condition
                </div>
              ) : (
                <div className={cn(
                  "text-xs font-mono",
                  data.truePath ? "text-green-400" : "text-amber-400"
                )}>
                  Condition evaluated to: <strong>{data.truePath ? "TRUE" : "FALSE"}</strong>
                </div>
              )}
            </div>
            
            <div className="mt-3 text-xs text-gray-400">
              <div className="mb-1 font-medium">Flow Direction:</div>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center",
                  data.truePath ? "text-green-400" : "text-gray-500"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-1",
                    data.truePath ? "bg-green-400" : "bg-gray-600"
                  )}></div>
                  True Path (Right)
                </div>
                <div className={cn(
                  "flex items-center",
                  data.falsePath ? "text-amber-400" : "text-gray-500"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-1",
                    data.falsePath ? "bg-amber-400" : "bg-gray-600"
                  )}></div>
                  False Path (Bottom)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        id="true"
        className={cn(
          "w-3 h-3 border-2",
          data.truePath 
            ? "bg-green-400 border-green-500/30" 
            : "bg-purple-400 border-purple-500/30"
        )}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="false"
        className={cn(
          "w-3 h-3 border-2",
          data.falsePath 
            ? "bg-amber-400 border-amber-500/30" 
            : "bg-purple-400 border-purple-500/30"
        )}
      />
    </div>
  );
}