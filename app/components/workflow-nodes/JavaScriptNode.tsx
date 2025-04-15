import React, { useCallback, useMemo, memo, useState, useRef, useEffect } from 'react';
import { Code2, Play, GripHorizontal, Check, X, Copy, Save, Trash2, Maximize2, Minimize2, RefreshCw, Settings, Lock } from 'lucide-react';
import { Handle, Position, NodeResizeControl } from '@xyflow/react';
import { CodeEditor } from '../codeEditor';
import { useStore } from '~/store/zustand/store';
import { executeCode } from '~/lib/evaluate';
import { cn } from '~/lib/utils';
import debounce from 'lodash/debounce';
import { Logger } from '~/lib/logger';
import { DeleteButton } from './DeleteButton';
import pkg from 'lodash';
const {isEqual} = pkg;


interface JavaScriptNodeData {
  label: string;
  code?: string;
  result?: any;
  isSuccess?: boolean;
  isError?: boolean;
  errorMessage?: string;
  isRunning?: boolean;
  isLocked?: boolean;
}

interface JavaScriptNodeProps {
  data: JavaScriptNodeData;
  id: string;
}

export const JavaScriptNode = memo(({ data, id }: JavaScriptNodeProps) => {
  const { selectedWorkflow, updateWorkflow } = useStore();
  const logger = useMemo(() => Logger.getInstance(), []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [localCode, setLocalCode] = useState(data.code || 'console.log("hello World");\nreturn { message: "hello World" };');
  const codeEditorRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Update local code when data changes
  useEffect(() => {
    if (data.code && data.code !== localCode) {
      setLocalCode(data.code);
    }
  }, [data.code]);

  const debouncedUpdate = useMemo(() => debounce((newCode: string) => {
    if (!selectedWorkflow) return;
    
    try {
      // Find the current workflow
      updateWorkflow({
        id: selectedWorkflow,
        nodes: (prev) => {
          // Update the code for this specific node
          return prev.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    code: newCode,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      logger.debug('Updated JavaScript node code', { nodeId: id, workflowId: selectedWorkflow });
    } catch (error) {
      logger.error('Failed to update JavaScript node', error as Error);
    }
  }, 750), [id, selectedWorkflow, updateWorkflow, logger]);

  const handleCodeChange = useCallback((newCode: string) => {
    setLocalCode(newCode);
    debouncedUpdate(newCode);
  }, [debouncedUpdate]);

  const handleSaveCode = useCallback(() => {
    if (!selectedWorkflow) return;
    
    setIsSaving(true);
    
    try {
      updateWorkflow({
        id: selectedWorkflow,
        nodes: (prev) => {
          return prev.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    code: localCode,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      logger.info('JavaScript code saved', { nodeId: id });
      
      // Show success indicator briefly
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      logger.error('Error saving JavaScript code', error as Error);
      setIsSaving(false);
    }
  }, [selectedWorkflow, id, localCode, updateWorkflow, logger]);

  const handleExecuteCode = useCallback(async () => {
    if (!localCode || !selectedWorkflow) return;
    
    setIsExecuting(true);
    
    try {
      logger.debug('Executing JavaScript code', { nodeId: id });
      
      const result = await executeCode(localCode, {
        workflow: { id: selectedWorkflow },
        nodes: {},
      });
      
      logger.debug('JavaScript execution result', { 
        nodeId: id, 
        success: result.success,
        data: result.data
      });
      
      // Update node with execution result
      updateWorkflow({
        id: selectedWorkflow,
        nodes: (prev) => {
          return prev.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    result: result.data,
                    isSuccess: result.success,
                    isError: !result.success,
                    errorMessage: result.message,
                    isRunning: false,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (error) {
      logger.error('Error executing JavaScript code', error as Error);
      
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
                    errorMessage: error instanceof Error ? error.message : 'Unknown error',
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
  }, [localCode, id, selectedWorkflow, updateWorkflow, logger]);

  const copyResult = useCallback(() => {
    if (!data.result) return;
    
    try {
      const resultText = typeof data.result === 'object' 
        ? JSON.stringify(data.result, null, 2) 
        : String(data.result);
      
      navigator.clipboard.writeText(resultText);
      logger.info('Result copied to clipboard');
    } catch (error) {
      logger.error('Error copying result', error as Error);
    }
  }, [data.result, logger]);

  return (
    <>
      <NodeResizeControl 
        style={{ 
          background: 'transparent', 
          border: 'none',
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          cursor: 'nwse-resize'
        }} 
        minWidth={280} 
        minHeight={isExpanded ? 300 : 100}
      >
        <GripHorizontal className="h-3 w-3 text-gray-400 opacity-50 hover:opacity-100" />
      </NodeResizeControl>

      <div className={cn(
        'rounded-lg shadow-lg relative',
        'border border-yellow-500/30',
        'bg-linear-to-b from-yellow-500/5 to-yellow-500/10',
        'min-w-[280px]',
        'transition-all duration-200',
        data.isError && 'border-red-500/40 from-red-500/5 to-red-500/10',
        data.isSuccess && 'border-green-500/30 from-green-500/5 to-green-500/10'
      )}>
       
        <DeleteButton nodeId={id} isLocked={data.isLocked} />
       
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-3 h-3 bg-yellow-400 border-2 border-yellow-500/30"
        />
        
        <div>
          {/* Header */}
          <div className="px-3 py-2 flex justify-between items-center border-b border-yellow-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-yellow-500/10">
                <Code2 className="h-3.5 w-3.5 text-yellow-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-yellow-400">{data.label}</span>
                  {data.isLocked && (
                    <Lock className="h-3 w-3 ml-1.5 text-yellow-400/70" title="This node cannot be deleted" />
                  )}
                </div>
                <span className="text-xs text-gray-400">JavaScript Code</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isSaving && (
                <div className="flex items-center text-green-400 text-xs mr-1 animate-in fade-in">
                  <Check className="h-3 w-3 mr-1" />
                  <span>Saved</span>
                </div>
              )}
              
              <button 
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  isExecuting 
                    ? "bg-blue-500/20 text-blue-400 animate-pulse" 
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                )}
                onClick={handleExecuteCode}
                disabled={isExecuting}
                title="Run code"
              >
                {isExecuting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
              </button>
              
              <button 
                className="p-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                onClick={handleSaveCode}
                title="Save code"
              >
                <Save className="h-3.5 w-3.5" />
              </button>
              
              <button 
                className="p-1.5 rounded-md hover:bg-gray-800/50 text-gray-400 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

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
            {data.result !== undefined && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                Has Result
              </span>
            )}
          </div>

          {/* Code editor */}
          <div ref={codeEditorRef} className={cn(
            "transition-all duration-200 ease-in-out nodrag nowheel",
            isExpanded ? "h-[200px]" : "h-[100px]"
          )}>
            <CodeEditor
              value={localCode}
              onChange={handleCodeChange}
              showLineNumbers={true}
              syntaxType="javascript"
              showSuggestions={true}
              showBottomTooltip={false}
              className="h-full"
            />
          </div>

          {/* Result section */}
          {(data.result !== undefined || data.isError) && (
            <div 
              ref={resultRef}
              className={cn(
                "mt-1 p-2 rounded-b-lg border-t transition-all duration-200",
                data.isError 
                  ? "bg-red-950/20 border-red-500/30" 
                  : "bg-gray-900/80 border-yellow-500/20"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-gray-400">
                  {data.isError ? 'Error:' : 'Result:'}
                </div>
                
                {!data.isError && data.result !== undefined && (
                  <button
                    onClick={copyResult}
                    className="p-1 hover:bg-gray-800/50 rounded text-gray-400 hover:text-gray-300 transition-colors"
                    title="Copy result"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>
              
              {data.isError ? (
                <div className="text-xs text-red-400 font-mono break-all">
                  {data.errorMessage || 'Unknown error occurred'}
                </div>
              ) : (
                <pre className="text-xs text-gray-300 font-mono overflow-auto max-h-[100px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                  {typeof data.result === 'object' 
                    ? JSON.stringify(data.result, null, 2) 
                    : String(data.result)
                  }
                </pre>
              )}
            </div>
          )}
        </div>
        
        <Handle 
          type="source" 
          position={Position.Right}
          className="w-3 h-3 bg-yellow-400 border-2 border-yellow-500/30"
        />
      </div>
    </>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    isEqual(prevProps.data, nextProps.data)
  );
});

JavaScriptNode.displayName = 'JavaScriptNode';