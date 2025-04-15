import React, { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { Bell, Play, RefreshCw, ChevronDown, ChevronUp, Settings, Save, X, Check, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '~/lib/utils';
import { useStore } from '~/store/zustand/store';
import { Logger } from '~/lib/logger';
import { DeleteButton } from './DeleteButton';

interface NotificationNodeData {
  label: string;
  title?: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  result?: any;
  isSuccess?: boolean;
  isError?: boolean;
  isRunning?: boolean;
  isLocked?: boolean;
  history?: { timestamp: number; title: string; message: string; type: string }[];
}

interface NotificationNodeProps {
  data: NotificationNodeData;
  id: string;
}

// Root notification component that will be rendered at the app level
interface RootNotificationProps {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
}

// Component for the actual notification that appears in the app
const RootNotification: React.FC<RootNotificationProps> = ({ title, message, type, onClose }) => {
  return (
    <div 
      className={cn(
        "fixed top-4 right-4 z-9999 p-4 rounded-lg shadow-lg max-w-sm w-full animate-in slide-in-from-right-5 fade-in",
        type === 'info' && "bg-blue-500/95 border border-blue-600",
        type === 'success' && "bg-green-500/95 border border-green-600",
        type === 'warning' && "bg-amber-500/95 border border-amber-600",
        type === 'error' && "bg-red-500/95 border border-red-600"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-white mt-0.5">
          {type === 'info' && <Info className="h-5 w-5" />}
          {type === 'success' && <CheckCircle className="h-5 w-5" />}
          {type === 'warning' && <AlertTriangle className="h-5 w-5" />}
          {type === 'error' && <X className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">
            {title}
          </div>
          <div className="text-sm text-white/90 mt-1">
            {message}
          </div>
        </div>
        <button 
          className="text-white/80 hover:text-white p-1"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export function NotificationNode({ data, id }: NotificationNodeProps) {
  const { selectedWorkflow, updateWorkflow, setNotifications, updateLocalStorage } = useStore();
  const logger = useMemo(() => Logger.getInstance(), []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [localTitle, setLocalTitle] = useState(data.title || 'Notification Title');
  const [localMessage, setLocalMessage] = useState(data.message || 'Notification message');
  const [localType, setLocalType] = useState<'info' | 'success' | 'warning' | 'error'>(
    data.type || 'info'
  );
  const [localDuration, setLocalDuration] = useState(data.duration || 5000);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Handle showing the notification preview
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, localDuration);
      
      return () => clearTimeout(timer);
    }
  }, [showNotification, localDuration]);

  // Create a portal for the notification
  const [notificationPortal, setNotificationPortal] = useState<HTMLDivElement | null>(null);
  
  useEffect(() => {
    // Create a portal element if it doesn't exist
    if (!document.getElementById('notification-portal')) {
      const portalElement = document.createElement('div');
      portalElement.id = 'notification-portal';
      document.body.appendChild(portalElement);
      setNotificationPortal(portalElement);
    } else {
      setNotificationPortal(document.getElementById('notification-portal') as HTMLDivElement);
    }
    
    // Cleanup on unmount
    return () => {
      const portal = document.getElementById('notification-portal');
      if (portal && portal.childNodes.length === 0) {
        document.body.removeChild(portal);
      }
    };
  }, []);

  const handleShowNotification = useCallback(() => {
    if (!localMessage || !selectedWorkflow) {
      logger.warn('Cannot show notification: message is missing or no workflow selected', { nodeId: id });
      return;
    }

    setIsExecuting(true);
    setShowNotification(true);
    
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
                  isLocked: node.data.isLocked // Preserve locked status
                } 
              }
            : node
        );
      }
    });

    try {
      logger.debug('Showing notification', { 
        nodeId: id, 
        title: localTitle,
        message: localMessage, 
        type: localType
      });

      // Increment the notification count in the UI
      setNotifications(prev => prev + 1);
      
      // Store the notification in localStorage for persistence
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.push({
        id: Date.now(),
        title: localTitle,
        message: localMessage,
        type: localType,
        timestamp: Date.now()
      });
      localStorage.setItem('notifications', JSON.stringify(notifications));
      
      // Update the store's localStorage
      updateLocalStorage('notifications', notifications);
      
      // Create a notification element
      const notificationElement = document.createElement('div');
      notificationElement.id = `notification-${Date.now()}`;
      notificationPortal?.appendChild(notificationElement);
      
      // Render the notification component
      const root = document.createElement('div');
      notificationElement.appendChild(root);
      
      // Create a notification component
      const notification = document.createElement('div');
      notification.className = cn(
        "fixed top-4 right-4 z-9999 p-4 rounded-lg shadow-lg max-w-sm w-full animate-in slide-in-from-right-5 fade-in",
        localType === 'info' && "bg-blue-500/95 border border-blue-600",
        localType === 'success' && "bg-green-500/95 border border-green-600",
        localType === 'warning' && "bg-amber-500/95 border border-amber-600",
        localType === 'error' && "bg-red-500/95 border border-red-600"
      );
      
      // Create notification content
      const content = document.createElement('div');
      content.className = "flex items-start gap-3";
      
      // Icon
      const iconContainer = document.createElement('div');
      iconContainer.className = "text-white mt-0.5";
      
      let iconSvg = '';
      if (localType === 'info') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
      } else if (localType === 'success') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
      } else if (localType === 'warning') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
      } else if (localType === 'error') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
      }
      
      iconContainer.innerHTML = iconSvg;
      content.appendChild(iconContainer);
      
      // Text content
      const textContainer = document.createElement('div');
      textContainer.className = "flex-1";
      
      const titleElement = document.createElement('div');
      titleElement.className = "text-sm font-medium text-white";
      titleElement.textContent = localTitle;
      textContainer.appendChild(titleElement);
      
      const messageElement = document.createElement('div');
      messageElement.className = "text-sm text-white/90 mt-1";
      messageElement.textContent = localMessage;
      textContainer.appendChild(messageElement);
      
      content.appendChild(textContainer);
      
      // Close button
      const closeButton = document.createElement('button');
      closeButton.className = "text-white/80 hover:text-white p-1";
      closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
      closeButton.onclick = () => {
        notification.classList.add('animate-out', 'fade-out', 'slide-out-to-right');
        setTimeout(() => {
          if (notificationElement.parentNode) {
            notificationElement.parentNode.removeChild(notificationElement);
          }
        }, 300);
      };
      content.appendChild(closeButton);
      
      notification.appendChild(content);
      notificationElement.appendChild(notification);
      
      // Auto-remove after duration
      setTimeout(() => {
        notification.classList.add('animate-out', 'fade-out', 'slide-out-to-right');
        setTimeout(() => {
          if (notificationElement.parentNode) {
            notificationElement.parentNode.removeChild(notificationElement);
          }
        }, 300);
      }, localDuration);

      // Add to history
      const newHistoryEntry = { 
        timestamp: Date.now(), 
        title: localTitle,
        message: localMessage, 
        type: localType 
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
                      title: localTitle,
                      message: localMessage,
                      type: localType,
                      duration: localDuration,
                      result: { shown: true, timestamp: Date.now() },
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
        
        setIsExecuting(false);
        
        // Scroll to result if expanded
        if (isExpanded) {
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
        
        logger.info('Notification shown successfully', { nodeId: id });
      }, 1000);
    } catch (error) {
      logger.error('Error showing notification', error as Error);
      
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
                    isRunning: false,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      setIsExecuting(false);
    }
  }, [localTitle, localMessage, localType, localDuration, id, selectedWorkflow, updateWorkflow, setNotifications, logger, isExpanded, notificationPortal, updateLocalStorage]);

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
                    title: localTitle,
                    message: localMessage,
                    type: localType,
                    duration: localDuration,
                    isLocked: node.data.isLocked // Preserve locked status
                  } 
                }
              : node
          );
        }
      });
      
      setIsConfiguring(false);
      logger.info('Notification node configuration saved', { nodeId: id });
    } catch (error) {
      logger.error('Error saving notification node configuration', error as Error);
    }
  }, [selectedWorkflow, id, localTitle, localMessage, localType, localDuration, updateWorkflow, logger]);

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-3.5 w-3.5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      case 'error':
        return <X className="h-3.5 w-3.5 text-red-400" />;
      case 'info':
      default:
        return <Info className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Render the configuration panel
  const renderConfigPanel = () => (
    <div className="p-3 bg-gray-900/80 border-t border-pink-500/20 rounded-b-lg">
      <h4 className="text-xs font-medium text-gray-300 mb-2">Notification Configuration</h4>
      
      <div className="space-y-3">
        {/* Title */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            Title
          </label>
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-300 focus:outline-hidden focus:ring-1 focus:ring-pink-500/30"
            placeholder="Enter notification title"
          />
        </div>
        
        {/* Message */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            Message
          </label>
          <textarea
            value={localMessage}
            onChange={(e) => setLocalMessage(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-300 focus:outline-hidden focus:ring-1 focus:ring-pink-500/30 resize-none h-16"
            placeholder="Enter notification message"
          />
        </div>
        
        {/* Type */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setLocalType('info')}
              className={cn(
                "px-2 py-1.5 text-xs rounded-md transition-colors flex flex-col items-center gap-1",
                localType === 'info' 
                  ? "bg-blue-500/20 text-blue-400" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              <Info className="h-3.5 w-3.5" />
              <span>Info</span>
            </button>
            <button
              onClick={() => setLocalType('success')}
              className={cn(
                "px-2 py-1.5 text-xs rounded-md transition-colors flex flex-col items-center gap-1",
                localType === 'success' 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Success</span>
            </button>
            <button
              onClick={() => setLocalType('warning')}
              className={cn(
                "px-2 py-1.5 text-xs rounded-md transition-colors flex flex-col items-center gap-1",
                localType === 'warning' 
                  ? "bg-amber-500/20 text-amber-400" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Warning</span>
            </button>
            <button
              onClick={() => setLocalType('error')}
              className={cn(
                "px-2 py-1.5 text-xs rounded-md transition-colors flex flex-col items-center gap-1",
                localType === 'error' 
                  ? "bg-red-500/20 text-red-400" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              <X className="h-3.5 w-3.5" />
              <span>Error</span>
            </button>
          </div>
        </div>
        
        {/* Duration */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            Duration (ms)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={localDuration}
              onChange={(e) => setLocalDuration(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-gray-300 w-16 text-right">
              {localDuration}ms
            </span>
          </div>
        </div>
        
        {/* Preview */}
        <div>
          <label className="text-xs font-medium text-gray-300 mb-1 block">
            Preview
          </label>
          <div className={cn(
            "p-2 rounded-md border",
            localType === 'info' && "bg-blue-500/10 border-blue-500/20",
            localType === 'success' && "bg-green-500/10 border-green-500/20",
            localType === 'warning' && "bg-amber-500/10 border-amber-500/20",
            localType === 'error' && "bg-red-500/10 border-red-500/20"
          )}>
            <div className="flex items-start gap-2">
              {getNotificationIcon(localType)}
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-300">
                  {localTitle || 'Notification Title'}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {localMessage || 'Notification message'}
                </div>
              </div>
            </div>
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
            className="px-2 py-1 text-xs bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-md transition-colors flex items-center"
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
      'border border-pink-500/30',
      'bg-linear-to-b from-pink-500/5 to-pink-500/10',
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
        className="w-3 h-3 bg-pink-400 border-2 border-pink-500/30"
      />
      
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-3 py-2 flex justify-between items-center border-b border-pink-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-pink-500/10">
              <Bell className="h-3.5 w-3.5 text-pink-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-pink-400">{data.label}</span>
              <span className="text-xs text-gray-400">Notification</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded-md hover:bg-gray-800/50 text-gray-400 transition-colors"
              onClick={() => setIsConfiguring(!isConfiguring)}
              title="Configure notification"
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
              onClick={handleShowNotification}
              disabled={isExecuting || !localMessage}
              title={!localMessage ? "Message is required" : "Show notification"}
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
        
        {/* Notification info */}
        <div className="px-3 py-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            {getNotificationIcon(data.type || 'info')}
            <span className="text-xs font-medium text-gray-300 truncate max-w-[200px]">
              {data.title || 'No title set'}
            </span>
          </div>
          <div className="text-xs text-gray-400 truncate max-w-[220px] pl-5">
            {data.message || 'No message set'}
          </div>
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
          {data.type && (
            <span className={cn(
              "px-2 py-0.5 rounded-full",
              data.type === 'info' && "bg-blue-500/10 text-blue-400",
              data.type === 'success' && "bg-green-500/10 text-green-400",
              data.type === 'warning' && "bg-amber-500/10 text-amber-400",
              data.type === 'error' && "bg-red-500/10 text-red-400"
            )}>
              {data.type}
            </span>
          )}
        </div>
        
        {/* Configuration panel */}
        {isConfiguring && renderConfigPanel()}
        
        {/* Result section */}
        {isExpanded && data.history && data.history.length > 0 && (
          <div 
            ref={resultRef}
            className="mt-1 p-3 border-t border-pink-500/20 bg-gray-900/80 flex-1 overflow-auto"
          >
            <div className="text-xs font-medium text-gray-300 mb-2">
              Notification History
            </div>
            
            <div className="space-y-1 max-h-[200px] overflow-auto pr-1">
              {data.history.map((notification, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-2 rounded border bg-gray-900/50 flex items-start gap-2",
                    notification.type === 'info' && "border-blue-500/20",
                    notification.type === 'success' && "border-green-500/20",
                    notification.type === 'warning' && "border-amber-500/20",
                    notification.type === 'error' && "border-red-500/20"
                  )}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-300">
                      {notification.title}
                    </div>
                    <div className="text-xs text-gray-400 break-words mt-0.5">
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(notification.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Notification preview */}
      {showNotification && (
        <RootNotification
          title={localTitle}
          message={localMessage}
          type={localType}
          onClose={() => setShowNotification(false)}
        />
      )}
      
      <Handle 
        type="source" 
        position={Position.Right}
        className="w-3 h-3 bg-pink-400 border-2 border-pink-500/30"
      />
    </div>
  );
}