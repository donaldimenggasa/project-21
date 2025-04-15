import React, { useCallback, useState, useRef, useMemo } from 'react';
import { FileOutput, Download, RefreshCw, ChevronDown, ChevronUp, Edit2, Save, X, Check, Settings, FileText, File } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '~/lib/utils';
import { useStore } from '~/store/zustand/store';
import { Logger } from '~/lib/logger';
import { CodeEditor } from '../codeEditor';
import { DeleteButton } from './DeleteButton';

interface FileNodeData {
  label: string;
  content?: string;
  fileName?: string;
  fileType?: string;
  result?: any;
  isSuccess?: boolean;
  isError?: boolean;
  isRunning?: boolean;
  isLocked?: boolean;
  history?: { timestamp: number; fileName: string; size: number }[];
}

interface FileNodeProps {
  data: FileNodeData;
  id: string;
}

export function FileNode({ data, id }: FileNodeProps) {
  const { selectedWorkflow, updateWorkflow } = useStore();
  const logger = useMemo(() => Logger.getInstance(), []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [localContent, setLocalContent] = useState(data.content || 'File content goes here');
  const [localFileName, setLocalFileName] = useState(data.fileName || 'output.txt');
  const [localFileType, setLocalFileType] = useState(data.fileType || 'text/plain');
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerateFile = useCallback(() => {
    if (!localContent || !localFileName || !selectedWorkflow) {
      logger.warn('Cannot generate file: content, filename, or workflow is missing', { nodeId: id });
      return;
    }

    setIsGenerating(true);
    
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
      logger.debug('Generating file', { 
        nodeId: id, 
        fileName: localFileName, 
        fileType: localFileType
      });

      // Create file content
      const blob = new Blob([localContent], { type: localFileType });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = localFileName;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Add to history
      const newHistoryEntry = { 
        timestamp: Date.now(), 
        fileName: localFileName, 
        size: new Blob([localContent]).size 
      };
      
      const updatedHistory = [
        newHistoryEntry,
        ...(data.history || []).slice(0, 9) // Keep last 10 entries
      ];

      // Update node with success state
      setTimeout(() => {
        updateWorkflow({
          id: selectedWorkflow,
          nodes: (prev) => {
            return prev.map(node => 
              node.id === id 
                ? { 
                    ...node, 
                    data: { 
                      ...node.data,
                      content: localContent,
                      fileName: localFileName,
                      fileType: localFileType,
                      result: { 
                        generated: true, 
                        timestamp: Date.now(),
                        size: new Blob([localContent]).size
                      },
                      history: updatedHistory,
                      isSuccess: true,
                      isError: false,
                      isRunning: false,
                      isLocked: node.data.isLocked // Preserve locked status
                    } 
                  }
                : node
            );
          }
        });
        
        setIsGenerating(false);
        
        // Scroll to result if expanded
        if (isExpanded) {
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
        
        logger.info('File generated successfully', { 
          nodeId: id, 
          fileName: localFileName,
          size: new Blob([localContent]).size
        });
      }, 1000);
    } catch (error) {
      logger.error('Error generating file', error as Error);
      
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
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      setIsGenerating(false);
    }
  }, [localContent, localFileName, localFileType, id, selectedWorkflow, updateWorkflow, logger, isExpanded]);

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
                    content: localContent,
                    fileName: localFileName,
                    fileType: localFileType,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      setIsConfiguring(false);
      logger.info('File node configuration saved', { nodeId: id });
    } catch (error) {
      logger.error('Error saving file node configuration', error as Error);
    }
  }, [selectedWorkflow, id, localContent, localFileName, localFileType, updateWorkflow, logger]);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Get file icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="h-3.5 w-3.5 text-red-400" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-3.5 w-3.5 text-blue-400" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-3.5 w-3.5 text-green-400" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="h-3.5 w-3.5 text-orange-400" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className="h-3.5 w-3.5 text-purple-400" />;
      case 'zip':
      case 'rar':
        return <FileText className="h-3.5 w-3.5 text-yellow-400" />;
      case 'json':
        return <FileText className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <File className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  // Render the configuration panel
  const renderConfigPanel = () => (
    <div className="p-3 bg-gray-900/80 border-t border-cyan-500/20 rounded-b-lg">
      <h4 className="text-xs font-medium text-gray-300 mb-2">File Configuration</h4>
      
      <div className="space-y-3">
        {/* File name */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            File Name
          </label>
          <input
            type="text"
            value={localFileName}
            onChange={(e) => setLocalFileName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-300 focus:outline-hidden focus:ring-1 focus:ring-cyan-500/30"
            placeholder="output.txt"
          />
        </div>
        
        {/* File type */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            File Type
          </label>
          <select
            value={localFileType}
            onChange={(e) => setLocalFileType(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-300 focus:outline-hidden focus:ring-1 focus:ring-cyan-500/30"
          >
            <option value="text/plain">Text (.txt)</option>
            <option value="application/json">JSON (.json)</option>
            <option value="text/csv">CSV (.csv)</option>
            <option value="text/html">HTML (.html)</option>
            <option value="text/javascript">JavaScript (.js)</option>
            <option value="text/css">CSS (.css)</option>
            <option value="application/xml">XML (.xml)</option>
            <option value="application/pdf">PDF (.pdf)</option>
          </select>
        </div>
        
        {/* File content */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            File Content
          </label>
          <div className="border border-gray-700 rounded-md overflow-hidden">
            <CodeEditor
              value={localContent}
              onChange={setLocalContent}
              showLineNumbers={true}
              syntaxType={localFileType.includes('json') ? 'json' : 'javascript'}
              className="h-32"
            />
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
            className="px-2 py-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-md transition-colors flex items-center"
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
      'border border-cyan-500/30',
      'bg-linear-to-b from-cyan-500/5 to-cyan-500/10',
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
        className="w-3 h-3 bg-cyan-400 border-2 border-cyan-500/30"
      />
      
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-3 py-2 flex justify-between items-center border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-cyan-500/10">
              <FileOutput className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-cyan-400">{data.label}</span>
              <span className="text-xs text-gray-400">Generate File</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded-md hover:bg-gray-800/50 text-gray-400 transition-colors"
              onClick={() => setIsConfiguring(!isConfiguring)}
              title="Configure file"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
            
            <button 
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isGenerating 
                  ? "bg-blue-500/20 text-blue-400 animate-pulse" 
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
              )}
              onClick={handleGenerateFile}
              disabled={isGenerating || !localContent || !localFileName}
              title={!localContent || !localFileName ? "Content and filename are required" : "Generate file"}
            >
              {isGenerating ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
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
        
        {/* File info */}
        <div className="px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            {getFileIcon(localFileName)}
            <span className="text-xs text-gray-300 font-medium">
              {localFileName || 'No file name set'}
            </span>
            {data.result?.size && (
              <span className="text-xs text-gray-500">
                ({formatFileSize(data.result.size)})
              </span>
            )}
          </div>
          
          {localContent && (
            <div className="mt-1 text-xs text-gray-500">
              {localContent.length > 50 
                ? `${localContent.substring(0, 50)}...` 
                : localContent
              }
            </div>
          )}
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center gap-2 px-3 py-1 text-xs">
          {data.isRunning && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 animate-pulse flex items-center">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Generating
            </span>
          )}
          {data.isSuccess && (
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 flex items-center">
              <Check className="h-3 w-3 mr-1" />
              Generated
            </span>
          )}
          {data.isError && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 flex items-center">
              <X className="h-3 w-3 mr-1" />
              Error
            </span>
          )}
          {data.result?.size && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
              {formatFileSize(data.result.size)}
            </span>
          )}
        </div>
        
        {/* Configuration panel */}
        {isConfiguring && renderConfigPanel()}
        
        {/* Result section */}
        {isExpanded && data.history && data.history.length > 0 && (
          <div 
            ref={resultRef}
            className="mt-1 p-3 border-t border-cyan-500/20 bg-gray-900/80 flex-1 overflow-auto"
          >
            <div className="text-xs font-medium text-gray-300 mb-2">
              File Generation History
            </div>
            
            <div className="space-y-1 max-h-[200px] overflow-auto pr-1">
              {data.history.map((file, index) => (
                <div 
                  key={index}
                  className="p-2 rounded border border-gray-700/50 bg-gray-900/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.fileName)}
                    <div>
                      <div className="text-xs text-gray-300">
                        {file.fileName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(file.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <span className="text-xs text-gray-400">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
            
            {/* File stats */}
            {data.history.length >= 2 && (
              <div className="mt-3 border-t border-gray-700/50 pt-3">
                <div className="text-xs font-medium text-gray-300 mb-2">
                  File Statistics
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded bg-gray-900/70 border border-gray-700/50">
                    <div className="text-xs text-gray-400">Total Files</div>
                    <div className="text-sm font-medium text-cyan-400 mt-1">
                      {data.history.length}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-gray-900/70 border border-gray-700/50">
                    <div className="text-xs text-gray-400">Total Size</div>
                    <div className="text-sm font-medium text-cyan-400 mt-1">
                      {formatFileSize(data.history.reduce((sum, file) => sum + file.size, 0))}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-gray-900/70 border border-gray-700/50">
                    <div className="text-xs text-gray-400">Avg Size</div>
                    <div className="text-sm font-medium text-cyan-400 mt-1">
                      {formatFileSize(
                        Math.round(data.history.reduce((sum, file) => sum + file.size, 0) / data.history.length)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right}
        className="w-3 h-3 bg-cyan-400 border-2 border-cyan-500/30"
      />
    </div>
  );
}