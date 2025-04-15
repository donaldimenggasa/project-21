import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useStore } from '~/store/zustand/store';
import { Database, Plus, Trash2, Edit2, Save, X, Copy, Download, Upload, Search, RefreshCw, Eye, EyeOff, ChevronRight, ChevronDown, FileJson, HardDrive, Key, AlertTriangle, Check, Undo, Redo, History, Info } from 'lucide-react';
import { cn } from '~/lib/utils';
import { CodeEditor } from '~/components/codeEditor';
import { isValidJson } from '~/lib/utils';
import { Logger } from '~/lib/logger';

// Types for state entries
type StateValueType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
type StateScope = 'appState' | 'localStorage';

interface StateEntry {
  id: string;
  key: string;
  value: any;
  type: StateValueType;
  scope: StateScope;
  bindable: boolean;
  bindValue?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// History entry for undo/redo
interface HistoryEntry {
  pageAppState: Record<string, any>;
  localStorage: Record<string, any>;
  timestamp: Date;
}

// Validation rules for keys
const KEY_VALIDATION = {
  // Key must start with a letter and contain only letters, numbers, and underscores
  PATTERN: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
  RESERVED_WORDS: [
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 
    'default', 'delete', 'do', 'else', 'export', 'extends', 'false', 
    'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 
    'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 
    'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'
  ]
};

// Utility functions
const getValueType = (value: any): StateValueType => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as StateValueType;
};

const formatValue = (value: any, type: StateValueType): string => {
  if (type === 'object' || type === 'array') {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  }
  return String(value);
};

const parseValue = (value: string, type: StateValueType): any => {
  switch (type) {
    case 'string':
      return value;
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true';
    case 'object':
    case 'array':
      try {
        return JSON.parse(value);
      } catch (e) {
        return type === 'array' ? [] : {};
      }
    case 'null':
      return null;
    default:
      return value;
  }
};

// Validate a key name
const validateKey = (
  key: string, 
  scope: StateScope, 
  existingKeys: Set<string>, 
  isEditing: boolean = false, 
  originalKey?: string
): string | null => {
  // Check if key is empty
  if (!key.trim()) {
    return 'Key is required';
  }

  // Check if key matches pattern (starts with letter, contains only letters, numbers, underscores)
  if (!KEY_VALIDATION.PATTERN.test(key)) {
    return 'Key must start with a letter and contain only letters, numbers, and underscores';
  }

  // Check key length
  if (key.length < KEY_VALIDATION.MIN_LENGTH) {
    return `Key must be at least ${KEY_VALIDATION.MIN_LENGTH} characters`;
  }
  
  if (key.length > KEY_VALIDATION.MAX_LENGTH) {
    return `Key cannot exceed ${KEY_VALIDATION.MAX_LENGTH} characters`;
  }

  // Check if key is a reserved word
  if (KEY_VALIDATION.RESERVED_WORDS.includes(key)) {
    return `"${key}" is a reserved JavaScript keyword and cannot be used`;
  }

  // Check if key already exists (only if not editing or if key has changed)
  if (!isEditing || (originalKey && key !== originalKey)) {
    if (existingKeys.has(key)) {
      return `Key "${key}" already exists in ${scope === 'appState' ? 'App State' : 'Local Storage'}`;
    }
  }

  return null;
};

// Component for editing a state entry
interface StateEditorProps {
  entry: StateEntry | null;
  onSave: (entry: StateEntry) => void;
  onCancel: () => void;
  existingAppStateKeys: Set<string>;
  existingLocalStorageKeys: Set<string>;
}

const StateEditor: React.FC<StateEditorProps> = ({ 
  entry, 
  onSave, 
  onCancel, 
  existingAppStateKeys, 
  existingLocalStorageKeys 
}) => {
  const [key, setKey] = useState(entry?.key || '');
  const [value, setValue] = useState(entry ? formatValue(entry.value, entry.type) : '');
  const [type, setType] = useState<StateValueType>(entry?.type || 'string');
  const [scope, setScope] = useState<StateScope>(entry?.scope || 'appState');
  const [bindable, setBindable] = useState(entry?.bindable || false);
  const [bindValue, setBindValue] = useState(entry?.bindValue || '');
  const [description, setDescription] = useState(entry?.description || '');
  const [error, setError] = useState<string | null>(null);
  const [keyTouched, setKeyTouched] = useState(false);
  
  const logger = useMemo(() => Logger.getInstance(), []);

  // Get the appropriate set of existing keys based on scope
  const existingKeys = useMemo(() => 
    scope === 'appState' ? existingAppStateKeys : existingLocalStorageKeys,
    [scope, existingAppStateKeys, existingLocalStorageKeys]
  );

  // Validate the key whenever it changes
  useEffect(() => {
    if (keyTouched) {
      const keyError = validateKey(
        key, 
        scope, 
        existingKeys, 
        !!entry, // isEditing
        entry?.key // originalKey
      );
      
      if (keyError) {
        setError(keyError);
      } else {
        // Only clear the error if it was a key-related error
        if (error && (
          error.includes('Key') || 
          error.includes('key') || 
          error.includes('reserved')
        )) {
          setError(null);
        }
      }
    }
  }, [key, scope, existingKeys, entry, keyTouched, error]);

  // Validate the value based on the selected type
  const validateValue = useCallback(() => {
    try {
      if (type === 'number' && isNaN(Number(value))) {
        return 'Invalid number format';
      }
      
      if ((type === 'object' || type === 'array') && !isValidJson(value)) {
        return 'Invalid JSON format';
      }
      
      return null;
    } catch (e) {
      logger.error('Error validating value', e as Error);
      return 'Validation error';
    }
  }, [type, value, logger]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Force key validation
    setKeyTouched(true);
    
    // Validate key
    const keyError = validateKey(
      key, 
      scope, 
      existingKeys, 
      !!entry, // isEditing
      entry?.key // originalKey
    );
    
    if (keyError) {
      setError(keyError);
      return;
    }
    
    // Validate value
    const valueError = validateValue();
    if (valueError) {
      setError(valueError);
      return;
    }
    
    // Create or update entry
    const newEntry: StateEntry = {
      id: entry?.id || `${scope}-${key}-${Date.now()}`,
      key,
      value: parseValue(value, type),
      type,
      scope,
      bindable,
      bindValue: bindable ? bindValue : undefined,
      description,
      createdAt: entry?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    onSave(newEntry);
  }, [key, value, type, scope, bindable, bindValue, description, entry, onSave, validateValue, existingKeys, logger]);

  // Update value format when type changes
  useEffect(() => {
    if (entry) {
      try {
        setValue(formatValue(entry.value, type));
      } catch (e) {
        setValue(type === 'array' ? '[]' : type === 'object' ? '{}' : '');
        logger.error('Error formatting value', e as Error);
      }
    }
  }, [type, entry, logger]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border border-border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">
            {entry ? 'Edit State Entry' : 'Add State Entry'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-md hover:bg-background text-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Key */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Key <span className="text-destructive">*</span>
              </label>
              <div className="space-y-1">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    if (!keyTouched) setKeyTouched(true);
                  }}
                  className={cn(
                    "w-full px-3 py-2 bg-input border rounded-md text-foreground focus:outline-hidden focus:ring-2",
                    error && error.includes('Key') 
                      ? "border-destructive focus:ring-destructive/20" 
                      : "border-border focus:ring-primary/20"
                  )}
                  placeholder="Enter key name (e.g. userData)"
                />
                <p className="text-xs text-secondary flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Keys must start with a letter and contain only letters, numbers, and underscores
                </p>
              </div>
            </div>
            
            {/* Type and Scope */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Type <span className="text-destructive">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as StateValueType)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="object">Object</option>
                  <option value="array">Array</option>
                  <option value="null">Null</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Scope <span className="text-destructive">*</span>
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as StateScope)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                >
                  <option value="appState">App State (Page-Specific)</option>
                  <option value="localStorage">Local Storage (Global)</option>
                </select>
              </div>
            </div>
            
            {/* Bindable toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="bindable"
                checked={bindable}
                onChange={(e) => setBindable(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <label htmlFor="bindable" className="ml-2 text-sm text-foreground">
                Bindable Value
              </label>
            </div>
            
            {/* Value or Bind Value */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {bindable ? 'Bind Expression' : 'Value'} <span className="text-destructive">*</span>
              </label>
              
              {bindable ? (
                <div className="border border-success/20 rounded-md overflow-hidden">
                  <CodeEditor
                    value={bindValue}
                    onChange={setBindValue}
                    showLineNumbers={true}
                    className="h-40"
                  />
                </div>
              ) : type === 'boolean' ? (
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : type === 'object' || type === 'array' ? (
                <div className={cn(
                  "border rounded-md overflow-hidden",
                  error && error.includes('JSON') ? "border-destructive" : "border-border"
                )}>
                  <CodeEditor
                    value={value}
                    onChange={setValue}
                    showLineNumbers={true}
                    syntaxType="json"
                    className="h-40"
                  />
                </div>
              ) : (
                <input
                  type={type === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 bg-input border rounded-md text-foreground focus:outline-hidden focus:ring-2",
                    error && error.includes('number') 
                      ? "border-destructive focus:ring-destructive/20" 
                      : "border-border focus:ring-primary/20"
                  )}
                  placeholder={`Enter ${type} value`}
                />
              )}
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                placeholder="Optional description"
                rows={2}
              />
            </div>
            
            {/* Error message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </form>
        
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-background hover:bg-background/80 text-foreground rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for confirming deletion
interface DeleteConfirmationProps {
  entryKey: string;
  scope: StateScope;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ entryKey, scope, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border border-border shadow-lg p-6 max-w-md w-full">
        <div className="flex items-center text-destructive mb-4">
          <AlertTriangle className="h-6 w-6 mr-3" />
          <h3 className="text-lg font-medium">Delete State Entry</h3>
        </div>
        
        <p className="text-foreground mb-2">
          Are you sure you want to delete <span className="font-semibold">{entryKey}</span> from {scope === 'appState' ? 'App State' : 'Local Storage'}?
        </p>
        
        <p className="text-secondary text-sm mb-6">
          This action cannot be undone.
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-background hover:bg-background/80 text-foreground rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-destructive hover:bg-destructive-hover text-destructive-foreground rounded-md transition-colors flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Main component
export function StateTab() {
  const { 
    pageAppState, 
    localStorage, 
    selectedPage,
    updatePageAppState,
    deletePageAppStateKey,
    updateLocalStorage,
    deleteLocalStorageKey
  } = useStore();
  
  const [entries, setEntries] = useState<StateEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<StateEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<StateEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeScope, setActiveScope] = useState<StateScope>('appState');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  
  const logger = useMemo(() => Logger.getInstance(), []);

  // Get current page app state
  const currentPageAppState = useMemo(() => {
    if (!selectedPage) return {};
    return pageAppState[selectedPage] || {};
  }, [pageAppState, selectedPage]);

  // Create sets of existing keys for validation
  const existingAppStateKeys = useMemo(() => {
    const keys = new Set<string>();
    if (selectedPage && pageAppState[selectedPage]) {
      Object.keys(pageAppState[selectedPage]).forEach(key => keys.add(key));
    }
    return keys;
  }, [pageAppState, selectedPage]);

  const existingLocalStorageKeys = useMemo(() => {
    return new Set<string>(Object.keys(localStorage));
  }, [localStorage]);

  // Convert state objects to entries array
  useEffect(() => {
    try {
      const newEntries: StateEntry[] = [];
      
      // Process page-specific app state
      if (selectedPage) {
        const pageState = pageAppState[selectedPage] || {};
        Object.entries(pageState).forEach(([key, value]) => {
          newEntries.push({
            id: `appState-${key}`,
            key,
            value,
            type: getValueType(value),
            scope: 'appState',
            bindable: false,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      }
      
      // Process global localStorage
      Object.entries(localStorage).forEach(([key, value]) => {
        newEntries.push({
          id: `localStorage-${key}`,
          key,
          value,
          type: getValueType(value),
          scope: 'localStorage',
          bindable: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
      
      setEntries(newEntries);
    } catch (error) {
      logger.error('Error converting state to entries', error as Error);
    }
  }, [pageAppState, localStorage, selectedPage, logger]);

  // Add to history when state changes
  useEffect(() => {
    // Only add to history if we have state
    if (selectedPage && (Object.keys(currentPageAppState).length > 0 || Object.keys(localStorage).length > 0)) {
      // Create a new history entry
      const newEntry: HistoryEntry = {
        pageAppState: { ...pageAppState },
        localStorage: { ...localStorage },
        timestamp: new Date()
      };
      
      // If we're not at the end of the history, truncate it
      const newHistory = historyIndex === -1 
        ? [...history, newEntry]
        : [...history.slice(0, historyIndex + 1), newEntry];
      
      setHistory(newHistory);
      setHistoryIndex(-1); // Reset index to end
    }
  }, [currentPageAppState, localStorage, selectedPage, pageAppState, history, historyIndex]);

  // Filter entries based on search and active scope
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Filter by scope
      if (entry.scope !== activeScope) return false;
      
      // Filter by search query
      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      return (
        entry.key.toLowerCase().includes(searchLower) ||
        String(entry.value).toLowerCase().includes(searchLower) ||
        (entry.description && entry.description.toLowerCase().includes(searchLower))
      );
    });
  }, [entries, searchQuery, activeScope]);

  // Save an entry
  const handleSaveEntry = useCallback((entry: StateEntry) => {
    try {
      // Validate key one more time
      const existingKeys = entry.scope === 'appState' ? existingAppStateKeys : existingLocalStorageKeys;
      const keyError = validateKey(
        entry.key, 
        entry.scope, 
        existingKeys, 
        !!editingEntry, // isEditing
        editingEntry?.key // originalKey
      );
      
      if (keyError) {
        logger.warn('Key validation failed on save', { key: entry.key, error: keyError });
        return;
      }
      
      // Update the appropriate state
      if (entry.scope === 'appState') {
        if (!selectedPage) {
          logger.warn('Cannot save app state: no page selected');
          return;
        }
        updatePageAppState(selectedPage, entry.key, entry.value);
      } else {
        updateLocalStorage(entry.key, entry.value);
      }
      
      // Close the editor
      setEditingEntry(null);
      setIsCreating(false);
      
      logger.info('State entry saved', { key: entry.key, scope: entry.scope });
    } catch (error) {
      logger.error('Error saving state entry', error as Error);
    }
  }, [selectedPage, updatePageAppState, updateLocalStorage, logger, editingEntry, existingAppStateKeys, existingLocalStorageKeys]);

  // Delete an entry
  const handleDeleteEntry = useCallback(() => {
    if (!deletingEntry) return;
    
    try {
      // Update the appropriate state
      if (deletingEntry.scope === 'appState') {
        if (!selectedPage) {
          logger.warn('Cannot delete app state: no page selected');
          return;
        }
        deletePageAppStateKey(selectedPage, deletingEntry.key);
      } else {
        deleteLocalStorageKey(deletingEntry.key);
      }
      
      // Close the confirmation
      setDeletingEntry(null);
      
      logger.info('State entry deleted', { key: deletingEntry.key, scope: deletingEntry.scope });
    } catch (error) {
      logger.error('Error deleting state entry', error as Error);
    }
  }, [deletingEntry, selectedPage, deletePageAppStateKey, deleteLocalStorageKey, logger]);

  // Toggle expanded state for an entry
  const toggleExpanded = useCallback((key: string) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  // Copy an entry value to clipboard
  const copyToClipboard = useCallback((value: any) => {
    try {
      const stringValue = typeof value === 'object' 
        ? JSON.stringify(value, null, 2) 
        : String(value);
      
      navigator.clipboard.writeText(stringValue);
      logger.info('Copied to clipboard');
    } catch (error) {
      logger.error('Error copying to clipboard', error as Error);
    }
  }, [logger]);

  // Export state to JSON file
  const handleExport = useCallback(() => {
    try {
      const exportData = activeScope === 'appState' 
        ? (selectedPage ? pageAppState[selectedPage] || {} : {}) 
        : localStorage;
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeScope}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      logger.info('State exported', { scope: activeScope });
    } catch (error) {
      logger.error('Error exporting state', error as Error);
    }
  }, [activeScope, selectedPage, pageAppState, localStorage, logger]);

  // Import state from JSON file
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate keys before importing
        const invalidKeys: string[] = [];
        const existingKeys = activeScope === 'appState' ? existingAppStateKeys : existingLocalStorageKeys;
        
        Object.keys(data).forEach(key => {
          const keyError = validateKey(key, activeScope, existingKeys);
          if (keyError) {
            invalidKeys.push(`${key}: ${keyError}`);
          }
        });
        
        if (invalidKeys.length > 0) {
          alert(`Cannot import: The following keys are invalid:\n\n${invalidKeys.join('\n')}`);
          return;
        }
        
        // Update the appropriate state
        if (activeScope === 'appState') {
          if (!selectedPage) {
            logger.warn('Cannot import app state: no page selected');
            return;
          }
          
          // Update each key individually to maintain reactivity
          Object.entries(data).forEach(([key, value]) => {
            updatePageAppState(selectedPage, key, value);
          });
        } else {
          // Update each key individually to maintain reactivity
          Object.entries(data).forEach(([key, value]) => {
            updateLocalStorage(key, value);
          });
        }
        
        logger.info('State imported', { scope: activeScope });
      } catch (error) {
        logger.error('Error importing state', error as Error);
        alert('Invalid JSON file');
      }
    };
    
    reader.readAsText(file);
    
    // Reset the input
    e.target.value = '';
  }, [activeScope, selectedPage, updatePageAppState, updateLocalStorage, logger, existingAppStateKeys, existingLocalStorageKeys]);

  // Undo/Redo functionality
  const canUndo = historyIndex < history.length - 1;
  const canRedo = historyIndex > 0;
  
  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    
    const newIndex = historyIndex === -1 ? history.length - 2 : historyIndex + 1;
    const historyEntry = history[history.length - 1 - newIndex];
    
    // We need to update the store with the historical state
    // This is a simplified approach - in a real app, you'd need to handle this more carefully
    logger.info('Undo state change', { index: newIndex });
    setHistoryIndex(newIndex);
  }, [canUndo, history, historyIndex, logger]);
  
  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    
    const newIndex = historyIndex - 1;
    const historyEntry = history[history.length - 1 - newIndex];
    
    // We need to update the store with the historical state
    // This is a simplified approach - in a real app, you'd need to handle this more carefully
    logger.info('Redo state change', { index: newIndex });
    setHistoryIndex(newIndex);
  }, [canRedo, history, historyIndex, logger]);

  // Render a value based on its type
  const renderValue = useCallback((value: any, type: StateValueType, isExpanded: boolean) => {
    if (value === null) return <span className="text-destructive/80">null</span>;
    
    switch (type) {
      case 'string':
        return <span className="text-success">"{value}"</span>;
      case 'number':
        return <span className="text-info">{value}</span>;
      case 'boolean':
        return <span className="text-accent">{String(value)}</span>;
      case 'object':
        if (isExpanded) {
          return (
            <div className="pl-4 border-l border-border mt-1 space-y-1">
              {Object.entries(value).map(([k, v]) => (
                <div key={k} className="font-mono text-xs">
                  <span className="text-warning">{k}</span>
                  <span className="text-secondary mx-1">:</span>
                  {renderValue(v, getValueType(v), false)}
                </div>
              ))}
            </div>
          );
        }
        return <span className="text-secondary">{'{...}'}</span>;
      case 'array':
        if (isExpanded) {
          return (
            <div className="pl-4 border-l border-border mt-1 space-y-1">
              {value.map((item: any, index: number) => (
                <div key={index} className="font-mono text-xs">
                  <span className="text-info">{index}</span>
                  <span className="text-secondary mx-1">:</span>
                  {renderValue(item, getValueType(item), false)}
                </div>
              ))}
            </div>
          );
        }
        return <span className="text-secondary">{`[${value.length}]`}</span>;
      default:
        return <span>{String(value)}</span>;
    }
  }, []);

  return (
    <div className="h-full flex flex-col text-foreground bg-card/95 backdrop-blur-xs">
      {/* Header with tabs */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-4">
          <div className="flex">
            <button
              onClick={() => setActiveScope('appState')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-l-md transition-colors",
                activeScope === 'appState' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background text-secondary hover:text-foreground"
              )}
            >
              <Database className="h-4 w-4 mr-2 inline-block" />
              App State
              <span className="ml-1 text-xs opacity-70">(Page-Specific)</span>
            </button>
            <button
              onClick={() => setActiveScope('localStorage')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-r-md transition-colors",
                activeScope === 'localStorage' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background text-secondary hover:text-foreground"
              )}
            >
              <HardDrive className="h-4 w-4 mr-2 inline-block" />
              Local Storage
              <span className="ml-1 text-xs opacity-70">(Global)</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                canUndo 
                  ? "text-foreground hover:bg-background" 
                  : "text-secondary/50 cursor-not-allowed"
              )}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                canRedo 
                  ? "text-foreground hover:bg-background" 
                  : "text-secondary/50 cursor-not-allowed"
              )}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                showHistory 
                  ? "bg-primary/10 text-primary" 
                  : "text-secondary hover:text-foreground hover:bg-background"
              )}
              title="History"
            >
              <History className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="file"
            id="import-file"
            className="hidden"
            accept=".json"
            onChange={handleImport}
          />
          <button
            onClick={() => document.getElementById('import-file')?.click()}
            className="p-1.5 text-secondary hover:text-foreground hover:bg-background rounded-md transition-colors"
            title="Import"
          >
            <Upload className="h-4 w-4" />
          </button>
          <button
            onClick={handleExport}
            className="p-1.5 text-secondary hover:text-foreground hover:bg-background rounded-md transition-colors"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md transition-colors flex items-center"
            disabled={activeScope === 'appState' && !selectedPage}
            title={activeScope === 'appState' && !selectedPage ? "Select a page first" : "Add new entry"}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Entry
          </button>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
          <input
            type="text"
            placeholder={`Search ${activeScope === 'appState' ? 'App State' : 'Local Storage'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-foreground placeholder-secondary focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {showHistory ? (
          // History view
          <div className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-4">State History</h3>
            {history.length === 0 ? (
              <div className="text-center py-8 text-secondary">
                <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No history available yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry, index) => {
                  const isActive = index === history.length - 1 - historyIndex;
                  const reversedIndex = history.length - 1 - index;
                  
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "p-3 rounded-md border transition-colors cursor-pointer",
                        isActive 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:bg-background"
                      )}
                      onClick={() => {
                        // We would update the state here in a real implementation
                        setHistoryIndex(reversedIndex);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {isActive && (
                            <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                          )}
                          <span className="text-sm font-medium">
                            {entry.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-xs text-secondary">
                          {selectedPage && entry.pageAppState[selectedPage] 
                            ? Object.keys(entry.pageAppState[selectedPage]).length 
                            : 0} app state entries, 
                          {Object.keys(entry.localStorage).length} local storage entries
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // State entries view
          <div className="divide-y divide-border">
            {activeScope === 'appState' && !selectedPage ? (
              // No page selected message for app state
              <div className="text-center py-16 text-secondary">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Please select a page to view its App State</p>
                <p className="text-xs mt-2 max-w-md mx-auto">
                  App State is page-specific, meaning each page has its own isolated state.
                  Select a page from the left sidebar to view and edit its state.
                </p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-16 text-secondary">
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No entries found for "{searchQuery}"</p>
                  </>
                ) : (
                  <>
                    {activeScope === 'appState' ? (
                      <Database className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    ) : (
                      <HardDrive className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    )}
                    <p>No {activeScope === 'appState' ? 'App State' : 'Local Storage'} entries</p>
                    <button
                      onClick={() => setIsCreating(true)}
                      className="mt-4 px-3 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md transition-colors inline-flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add First Entry
                    </button>
                  </>
                )}
              </div>
            ) : (
              filteredEntries.map(entry => {
                const isExpanded = expandedKeys.has(entry.id);
                const isObject = entry.type === 'object' || entry.type === 'array';
                
                return (
                  <div key={entry.id} className="p-3 hover:bg-background/50 transition-colors group">
                    <div className="flex items-start">
                      {/* Key and expand button */}
                      <div className="flex items-center">
                        {isObject ? (
                          <button
                            onClick={() => toggleExpanded(entry.id)}
                            className="p-1 hover:bg-background rounded-md mr-1"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-secondary" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-secondary" />
                            )}
                          </button>
                        ) : (
                          <div className="w-6" />
                        )}
                        
                        <div className="flex items-center">
                          <Key className="h-4 w-4 text-secondary mr-2" />
                          <span className="font-medium text-foreground">{entry.key}</span>
                        </div>
                      </div>
                      
                      {/* Type badge */}
                      <div className="ml-3">
                        <span className={cn(
                          "px-1.5 py-0.5 text-xs rounded-full",
                          entry.type === 'string' && "bg-success/10 text-success",
                          entry.type === 'number' && "bg-info/10 text-info",
                          entry.type === 'boolean' && "bg-accent/10 text-accent",
                          entry.type === 'object' && "bg-primary/10 text-primary",
                          entry.type === 'array' && "bg-warning/10 text-warning",
                          entry.type === 'null' && "bg-destructive/10 text-destructive"
                        )}>
                          {entry.type}
                        </span>
                        
                        {entry.bindable && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-success/10 text-success">
                            bindable
                          </span>
                        )}
                      </div>
                      
                      {/* Value */}
                      <div className="ml-auto flex items-center">
                        <div className="mr-4 max-w-[300px] truncate font-mono text-sm">
                          {entry.bindable ? (
                            <span className="text-success italic">{entry.bindValue}</span>
                          ) : (
                            renderValue(entry.value, entry.type, isExpanded)
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyToClipboard(entry.value)}
                            className="p-1.5 text-secondary hover:text-foreground hover:bg-background rounded-md transition-colors"
                            title="Copy value"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingEntry(entry)}
                            className="p-1.5 text-secondary hover:text-foreground hover:bg-background rounded-md transition-colors"
                            title="Edit entry"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingEntry(entry)}
                            className="p-1.5 text-secondary hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description if available */}
                    {entry.description && (
                      <div className="mt-1 ml-6 text-xs text-secondary">
                        {entry.description}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      
      {/* Editor modal */}
      {(editingEntry || isCreating) && (
        <StateEditor
          entry={editingEntry}
          onSave={handleSaveEntry}
          onCancel={() => {
            setEditingEntry(null);
            setIsCreating(false);
          }}
          existingAppStateKeys={existingAppStateKeys}
          existingLocalStorageKeys={existingLocalStorageKeys}
        />
      )}
      
      {/* Delete confirmation */}
      {deletingEntry && (
        <DeleteConfirmation
          entryKey={deletingEntry.key}
          scope={deletingEntry.scope}
          onConfirm={handleDeleteEntry}
          onCancel={() => setDeletingEntry(null)}
        />
      )}
    </div>
  );
}