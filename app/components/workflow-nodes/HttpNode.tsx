import React, { useCallback, useState, useRef, useMemo } from 'react';
import { Globe, Play, RefreshCw, ChevronDown, ChevronUp, Copy, Check, X, Settings, Edit2, Save } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '~/lib/utils';
import { useStore } from '~/store/zustand/store';
import { Logger } from '~/lib/logger';
import { CodeEditor } from '../codeEditor';
import { DeleteButton } from './DeleteButton';

interface HttpNodeData {
  label: string;
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  result?: any;
  isSuccess?: boolean;
  isError?: boolean;
  isRunning?: boolean;
  statusCode?: number;
  responseTime?: number;
  isLocked?: boolean;
}

interface HttpNodeProps {
  data: HttpNodeData;
  id: string;
}

export function HttpNode({ data, id }: HttpNodeProps) {
  const { selectedWorkflow, updateWorkflow } = useStore();
  const logger = useMemo(() => Logger.getInstance(), []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [localUrl, setLocalUrl] = useState(data.url || '');
  const [localMethod, setLocalMethod] = useState(data.method || 'GET');
  const [localHeaders, setLocalHeaders] = useState<Record<string, string>>(data.headers || {});
  const [localBody, setLocalBody] = useState<string>(
    typeof data.body === 'object' ? JSON.stringify(data.body, null, 2) : (data.body || '')
  );
  const [copied, setCopied] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleExecuteRequest = useCallback(async () => {
    if (!localUrl || !selectedWorkflow) {
      logger.warn('Cannot execute HTTP request: URL is missing or no workflow selected', { nodeId: id });
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
      logger.debug('Executing HTTP request', { 
        nodeId: id, 
        url: localUrl, 
        method: localMethod
      });

      const startTime = performance.now();

      // Prepare request options
      const options: RequestInit = {
        method: localMethod,
        headers: Object.keys(localHeaders).length > 0 ? new Headers(localHeaders) : undefined,
      };

      // Add body for non-GET requests
      if (localMethod !== 'GET' && localBody.trim()) {
        try {
          // Try to parse as JSON first
          options.body = JSON.stringify(JSON.parse(localBody));
          if (!options.headers) options.headers = {};
          (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
        } catch (e) {
          // If not valid JSON, send as plain text
          options.body = localBody;
        }
      }

      // Execute the request
      const response = await fetch(localUrl, options);
      const responseTime = performance.now() - startTime;
      
      // Try to parse as JSON first
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      logger.debug('HTTP request completed', { 
        nodeId: id, 
        status: response.status,
        success: response.ok,
        responseTime
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
                    url: localUrl,
                    method: localMethod,
                    headers: localHeaders,
                    body: localBody.trim() ? (
                      // Try to parse as JSON, fallback to string
                      (() => {
                        try {
                          return JSON.parse(localBody);
                        } catch (e) {
                          return localBody;
                        }
                      })()
                    ) : undefined,
                    result,
                    statusCode: response.status,
                    responseTime,
                    isSuccess: response.ok,
                    isError: !response.ok,
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
      logger.error('Error executing HTTP request', error as Error);
      
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
                    url: localUrl,
                    method: localMethod,
                    headers: localHeaders,
                    body: localBody.trim() ? localBody : undefined,
                    isSuccess: false,
                    isError: true,
                    isRunning: false,
                    isLocked: node.data.isLocked, // Preserve locked status
                    result: { error: error instanceof Error ? error.message : 'Unknown error' }
                  } 
                }
              : node
          );
        }
      });
    } finally {
      setIsExecuting(false);
    }
  }, [localUrl, localMethod, localHeaders, localBody, id, selectedWorkflow, updateWorkflow, logger]);

  const saveConfiguration = useCallback(() => {
    if (!selectedWorkflow) return;
    
    try {
      // Parse body if it's a string
      let parsedBody;
      if (localBody.trim()) {
        try {
          parsedBody = JSON.parse(localBody);
        } catch (e) {
          parsedBody = localBody;
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
                    url: localUrl,
                    method: localMethod,
                    headers: localHeaders,
                    body: parsedBody,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      setIsConfiguring(false);
      logger.info('HTTP node configuration saved', { nodeId: id });
    } catch (error) {
      logger.error('Error saving HTTP node configuration', error as Error);
    }
  }, [selectedWorkflow, id, localUrl, localMethod, localHeaders, localBody, updateWorkflow, logger]);

  const copyResult = useCallback(() => {
    if (!data.result) return;
    
    try {
      const resultText = typeof data.result === 'object' 
        ? JSON.stringify(data.result, null, 2) 
        : String(data.result);
      
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      logger.info('Result copied to clipboard');
    } catch (error) {
      logger.error('Error copying result', error as Error);
    }
  }, [data.result, logger]);

  const addHeader = useCallback(() => {
    setLocalHeaders(prev => ({
      ...prev,
      '': ''
    }));
  }, []);

  const updateHeader = useCallback((key: string, newKey: string, value: string) => {
    setLocalHeaders(prev => {
      const newHeaders = { ...prev };
      delete newHeaders[key];
      newHeaders[newKey] = value;
      return newHeaders;
    });
  }, []);

  const removeHeader = useCallback((key: string) => {
    setLocalHeaders(prev => {
      const newHeaders = { ...prev };
      delete newHeaders[key];
      return newHeaders;
    });
  }, []);

  // Render the configuration panel
  const renderConfigPanel = () => (
    <div className="p-3 bg-gray-900/80 border-t border-blue-500/20 rounded-b-lg">
      <h4 className="text-xs font-medium text-gray-300 mb-2">Request Configuration</h4>
      
      {/* URL and Method */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <select
            value={localMethod}
            onChange={(e) => setLocalMethod(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          
          <input
            type="text"
            value={localUrl}
            onChange={(e) => setLocalUrl(e.target.value)}
            placeholder="https://api.example.com/data"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
        
        {/* Headers */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => setShowHeaders(!showHeaders)}
              className="flex items-center text-xs font-medium text-gray-300"
            >
              {showHeaders ? (
                <ChevronUp className="h-3 w-3 mr-1 text-gray-500" />
              ) : (
                <ChevronDown className="h-3 w-3 mr-1 text-gray-500" />
              )}
              Headers {Object.keys(localHeaders).length > 0 && `(${Object.keys(localHeaders).length})`}
            </button>
            
            <button
              onClick={addHeader}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              + Add Header
            </button>
          </div>
          
          {showHeaders && (
            <div className="space-y-2 mt-2">
              {Object.entries(localHeaders).map(([key, value], index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => updateHeader(key, e.target.value, value)}
                    placeholder="Header name"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateHeader(key, key, e.target.value)}
                    placeholder="Value"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  />
                  <button
                    onClick={() => removeHeader(key)}
                    className="p-1 hover:bg-gray-700 rounded-md text-gray-400 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {Object.keys(localHeaders).length === 0 && (
                <div className="text-xs text-gray-500 italic">No headers defined</div>
              )}
            </div>
          )}
        </div>
        
        {/* Body (only for non-GET requests) */}
        {localMethod !== 'GET' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <button
                onClick={() => setShowBody(!showBody)}
                className="flex items-center text-xs font-medium text-gray-300"
              >
                {showBody ? (
                  <ChevronUp className="h-3 w-3 mr-1 text-gray-500" />
                ) : (
                  <ChevronDown className="h-3 w-3 mr-1 text-gray-500" />
                )}
                Request Body
              </button>
            </div>
            
            {showBody && (
              <div className="mt-2 border border-gray-700 rounded-md overflow-hidden">
                <CodeEditor
                  value={localBody}
                  onChange={setLocalBody}
                  showLineNumbers={true}
                  syntaxType="json"
                  className="h-24"
                />
              </div>
            )}
          </div>
        )}
        
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
            className="px-2 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-md transition-colors flex items-center"
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
      'border border-blue-500/30',
      'bg-gradient-to-b from-blue-500/5 to-blue-500/10',
      'min-w-[240px]',
      isExpanded && 'min-h-[300px]',
      data.isError && 'border-red-500/40 from-red-500/5 to-red-500/10',
      data.isSuccess && 'border-green-500/30 from-green-500/5 to-green-500/10'
    )}>
      {/* Delete button */}
      <DeleteButton nodeId={id} isLocked={data.isLocked} />
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-blue-400 border-2 border-blue-500/30"
      />
      
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-3 py-2 flex justify-between items-center border-b border-blue-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/10">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-blue-400">{data.label}</span>
              <span className="text-xs text-gray-400">HTTP Request</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded-md hover:bg-gray-800/50 text-gray-400 transition-colors"
              onClick={() => setIsConfiguring(!isConfiguring)}
              title="Configure request"
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
              onClick={handleExecuteRequest}
              disabled={isExecuting || !localUrl}
              title={!localUrl ? "URL is required" : "Execute request"}
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
        
        {/* Request info */}
        <div className="px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full",
              localMethod === 'GET' && "bg-blue-500/10 text-blue-400",
              localMethod === 'POST' && "bg-green-500/10 text-green-400",
              localMethod === 'PUT' && "bg-yellow-500/10 text-yellow-400",
              localMethod === 'DELETE' && "bg-red-500/10 text-red-400",
              localMethod === 'PATCH' && "bg-purple-500/10 text-purple-400"
            )}>
              {localMethod}
            </span>
            
            <span className="text-xs font-mono text-gray-400 truncate max-w-[160px]">
              {localUrl || 'No URL set'}
            </span>
          </div>
          
          {data.statusCode && (
            <span className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full",
              data.statusCode >= 200 && data.statusCode < 300 && "bg-green-500/10 text-green-400",
              data.statusCode >= 300 && data.statusCode < 400 && "bg-blue-500/10 text-blue-400",
              data.statusCode >= 400 && data.statusCode < 500 && "bg-yellow-500/10 text-yellow-400",
              data.statusCode >= 500 && "bg-red-500/10 text-red-400"
            )}>
              {data.statusCode}
            </span>
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
          {data.responseTime !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
              {Math.round(data.responseTime)}ms
            </span>
          )}
        </div>
        
        {/* Configuration panel */}
        {isConfiguring && renderConfigPanel()}
        
        {/* Result section */}
        {isExpanded && (data.result !== undefined || data.isError) && (
          <div 
            ref={resultRef}
            className={cn(
              "mt-1 p-3 border-t flex-1 overflow-auto",
              data.isError 
                ? "bg-red-950/20 border-red-500/30" 
                : "bg-gray-900/80 border-blue-500/20"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-300">
                {data.isError ? 'Error Response' : 'Response'}
              </div>
              
              {!data.isError && data.result !== undefined && (
                <button
                  onClick={copyResult}
                  className="p-1 hover:bg-gray-800/50 rounded text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1"
                  title="Copy result"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span className="text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className={cn(
              "p-2 rounded bg-gray-900/50 border",
              data.isError ? "border-red-500/20" : "border-gray-700/50"
            )}>
              {data.isError ? (
                <div className="text-xs text-red-400 font-mono break-all">
                  {data.result?.error || 'Unknown error occurred'}
                </div>
              ) : (
                <pre className="text-xs text-gray-300 font-mono overflow-auto max-h-[200px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                  {typeof data.result === 'object' 
                    ? JSON.stringify(data.result, null, 2) 
                    : String(data.result)
                  }
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right}
        className="w-3 h-3 bg-blue-400 border-2 border-blue-500/30"
      />
    </div>
  );
}