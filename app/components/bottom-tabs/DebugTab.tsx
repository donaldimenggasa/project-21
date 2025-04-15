import React, { useState, useCallback, memo } from 'react';
import { Circle, Play, StopCircle, StepForward, Search, ChevronRight, ChevronDown, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useStore } from '~/store/zustand/store';
import { cn } from '~/lib/utils';

interface StateTreeProps {
  data: any;
  path?: string[];
  expandedPaths: Set<string>;
  hiddenValues: Set<string>;
  onTogglePath: (path: string) => void;
  onToggleHidden: (path: string) => void;
  searchTerm: string;
  level?: number;
}

const StateTree = memo(({
  data,
  path = [],
  expandedPaths,
  hiddenValues,
  onTogglePath,
  onToggleHidden,
  searchTerm,
  level = 0
}: StateTreeProps) => {
  const getPathString = useCallback((currentPath: string[]) => currentPath.join('.'), []);
  const isExpanded = useCallback((currentPath: string[]) => expandedPaths.has(getPathString(currentPath)), [expandedPaths, getPathString]);
  const isHidden = useCallback((currentPath: string[]) => hiddenValues.has(getPathString(currentPath)), [hiddenValues, getPathString]);

  const shouldShowNode = useCallback((key: string, value: any, currentPath: string[]) => {
    if (!searchTerm) return true;
    
    const pathString = [...currentPath, key].join('.');
    const valueString = JSON.stringify(value);
    
    return pathString.toLowerCase().includes(searchTerm.toLowerCase()) ||
           valueString.toLowerCase().includes(searchTerm.toLowerCase());
  }, [searchTerm]);

  const renderValue = useCallback((value: any, key: string, currentPath: string[]) => {
    if (value === null) return <span className="text-destructive/80">null</span>;
    if (value === undefined) return <span className="text-destructive/80">undefined</span>;
    
    switch (typeof value) {
      case 'boolean':
        return <span className="text-accent">{value.toString()}</span>;
      case 'number':
        return <span className="text-info">{value.toLocaleString()}</span>;
      case 'string':
        return <span className="text-success">"{value}"</span>;
      case 'object':
        if (Array.isArray(value)) {
          return isExpanded(currentPath) ? (
            <div className="space-y-1 mt-1">
              {value.map((item, index) => (
                <div key={index} className="pl-4 border-l border-border">
                  {renderValue(item, index.toString(), [...currentPath, index.toString()])}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-secondary">Array({value.length})</span>
          );
        }
        return isExpanded(currentPath) ? (
          <div className="space-y-1 mt-1">
            {Object.entries(value).map(([k, v]) => (
              shouldShowNode(k, v, currentPath) && (
                <div key={k} className="pl-4 border-l border-border">
                  <StateTree
                    data={{ [k]: v }}
                    path={[...currentPath, k]}
                    expandedPaths={expandedPaths}
                    hiddenValues={hiddenValues}
                    onTogglePath={onTogglePath}
                    onToggleHidden={onToggleHidden}
                    searchTerm={searchTerm}
                    level={level + 1}
                  />
                </div>
              )
            ))}
          </div>
        ) : (
          <span className="text-secondary">{`{...}`}</span>
        );
      default:
        return <span className="text-secondary">{String(value)}</span>;
    }
  }, [isExpanded, shouldShowNode, expandedPaths, hiddenValues, onTogglePath, onToggleHidden, searchTerm]);

  return (
    <>
      {Object.entries(data).map(([key, value]) => {
        const currentPath = [...path, key];
        const pathString = getPathString(currentPath);
        
        if (!shouldShowNode(key, value, path)) return null;

        return (
          <div key={key} className={cn(
            "font-mono text-sm",
            "py-1",
            level > 0 && "border-l border-border"
          )}>
            <div className="flex items-center group">
              {typeof value === 'object' && value !== null ? (
                <button
                  onClick={() => onTogglePath(pathString)}
                  className="p-1 hover:bg-background rounded transition-colors"
                >
                  {isExpanded(currentPath) ? (
                    <ChevronDown className="h-3 w-3 text-secondary" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-secondary" />
                  )}
                </button>
              ) : (
                <div className="w-5" />
              )}
              
              <span className="text-warning font-medium">{key}</span>
              <span className="text-secondary mx-2">:</span>
              
              {isHidden(currentPath) ? (
                <div className="flex items-center">
                  <span className="text-secondary">********</span>
                  <button
                    onClick={() => onToggleHidden(pathString)}
                    className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-background rounded transition-colors"
                    title="Show value"
                  >
                    <Eye className="h-3 w-3 text-secondary" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center group">
                  <div className="flex-1">{renderValue(value, key, currentPath)}</div>
                  <div className="flex ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onToggleHidden(pathString)}
                      className="p-1 hover:bg-background rounded transition-colors"
                      title="Hide value"
                    >
                      <EyeOff className="h-3 w-3 text-secondary" />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(value, null, 2));
                      }}
                      className="p-1 hover:bg-background rounded transition-colors"
                      title="Copy value"
                    >
                      <Copy className="h-3 w-3 text-secondary" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
});

StateTree.displayName = 'StateTree';

export function DebugTab() {
  const state = useStore();
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['ui', 'bottomPanel']));
  const [hiddenValues, setHiddenValues] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const handleTogglePath = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleToggleHidden = useCallback((path: string) => {
    setHiddenValues(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  return (
    <div className="h-full flex flex-col text-foreground bg-card/95 backdrop-blur-xs">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/80">
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-background rounded-lg p-1">
            <button 
              className="p-1.5 hover:bg-background/80 rounded-md transition-colors"
              title="Start debugging"
            >
              <Play className="h-4 w-4 text-success" />
            </button>
            <button 
              className="p-1.5 hover:bg-background/80 rounded-md transition-colors"
              title="Stop debugging"
            >
              <StopCircle className="h-4 w-4 text-destructive" />
            </button>
            <button 
              className="p-1.5 hover:bg-background/80 rounded-md transition-colors"
              title="Step forward"
            >
              <StepForward className="h-4 w-4 text-primary" />
            </button>
          </div>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "p-1.5 rounded-md transition-colors flex items-center gap-2",
              autoRefresh ? "bg-primary/10 text-primary" : "hover:bg-background"
            )}
            title="Toggle auto-refresh"
          >
            <RefreshCw className={cn(
              "h-4 w-4",
              autoRefresh && "animate-spin"
            )} />
            <span className="text-sm">Auto-refresh</span>
          </button>
        </div>
        
        <div className="relative flex-1 max-w-md mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
          <input
            type="text"
            placeholder="Search state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder-secondary focus:outline-hidden focus:ring-1 focus:ring-primary/50 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpandedPaths(new Set())}
            className="px-3 py-1.5 text-xs bg-background hover:bg-background/80 rounded-md transition-colors"
          >
            Collapse All
          </button>
          <button
            onClick={() => {
              const allPaths = new Set<string>();
              const addPaths = (obj: any, path: string[] = []) => {
                if (typeof obj !== 'object' || obj === null) return;
                const currentPath = path.join('.');
                if (currentPath) allPaths.add(currentPath);
                Object.keys(obj).forEach(key => {
                  addPaths(obj[key], [...path, key]);
                });
              };
              addPaths(state);
              setExpandedPaths(allPaths);
            }}
            className="px-3 py-1.5 text-xs bg-background hover:bg-background/80 rounded-md transition-colors"
          >
            Expand All
          </button>
        </div>
      </div>

      {/* State Tree */}
      <div className="flex-1 overflow-auto p-4 bg-card/50 custom-scrollbar">
        <div className="rounded-lg border border-border bg-card/30 p-4">
          <StateTree
            data={state}
            expandedPaths={expandedPaths}
            hiddenValues={hiddenValues}
            onTogglePath={handleTogglePath}
            onToggleHidden={handleToggleHidden}
            searchTerm={searchTerm}
          />
        </div>
      </div>
    </div>
  );
}