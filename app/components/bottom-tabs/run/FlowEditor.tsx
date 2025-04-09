import React, { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ReactFlow, Background, BackgroundVariant, Controls, Node, MarkerType, Edge, ReactFlowInstance, NodeChange, Connection, ConnectionLineType, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '~/store/zustand/store';
import { Share2, Plus, AlertCircle, Lock, LayoutGrid } from 'lucide-react';
import { CreateWorkflowForm } from '~/components/forms/CreateWorkflowForm';
import { Logger } from '~/lib/logger';
import { autoLayout, autoLayoutHorizontal } from '~/lib/layout';
import { cn } from '~/lib/utils';

import {
  JavaScriptNode,
  HttpNode,
  LoopNode,
  ConditionNode,
  IntervalNode,
  NotificationNode,
  FileNode,
  StartNode,
  ExecuteWorkflowNode
} from '~/components/workflow-nodes';
import { CustomEdge } from '~/components/workflow-nodes/CustomEdge';

const nodeTypes = {
  startNode: StartNode,
  javascriptNode: JavaScriptNode,
  httpNode: HttpNode,
  loopNode: LoopNode,
  conditionNode: ConditionNode,
  intervalNode: IntervalNode,
  notificationNode: NotificationNode,
  fileNode: FileNode,
  executeWorkflowNode: ExecuteWorkflowNode
};

const edgeTypes = {
  customEdge: CustomEdge,
};

let id = 0;
const getId = () => `node_${id++}`;

interface FlowEditorProps {
  
}

export function FlowEditor() {
  const { 
    selectedPage, 
    selectedWorkflow, 
    workflow, 
    changeNodePosition, 
    updateWorkflowNodesChanges, 
    updateWorkflowEdgesChanges,
    updateWorkflow
  } = useStore();
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [showErrorToast, setShowErrorToast] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const connectingNodeId = useRef<string | null>(null);
  const connectingHandleId = useRef<string | null>(null);
  const [isLayouting, setIsLayouting] = useState(false);
  
  const logger = useMemo(() => Logger.getInstance(), []);

  const currentPageWorkflows = useMemo(() => 
    Object.values(workflow).filter((w) => (w as { parentPageId: string }).parentPageId === selectedPage)
  , [workflow, selectedPage]);

  const activeWorkflow = useMemo(() => 
    selectedWorkflow ? workflow[selectedWorkflow] : null
  , [workflow, selectedWorkflow]);

  // Ensure nodes and edges are always arrays
  const WorkflowNode = Array.isArray(activeWorkflow?.nodes) ? activeWorkflow.nodes : [];
  const WorkflowEdge = Array.isArray(activeWorkflow?.edges) ? activeWorkflow.edges : [];

  // Check if a node is an initial node (start_node or end_node)
  const isInitialNode = useCallback((nodeId: string) => {
    return nodeId === 'start_node' || nodeId === 'end_node';
  }, []);

  const _getConvertNode = useCallback(() => {
    return WorkflowNode.map((item : Node) => {
      // Add a locked property to initial nodes
      if (isInitialNode(item.id)) {
        return {
          ...item,
          data: {
            ...item.data,
            isLocked: true
          }
        };
      }
      return {
        ...item
      };
    });
  }, [WorkflowNode, isInitialNode]);
  
  const _getConvertEdge = useCallback(() => {
    return WorkflowEdge.map((item : Edge) => {
      return {
        ...item,
        type: item.type || 'customEdge' // Use our custom edge by default
      };
    });
  }, [WorkflowEdge]);

  // Apply auto layout when workflow changes
  useEffect(() => {
    if (activeWorkflow && reactFlowInstance) {
      // Only auto-layout if we have nodes and edges
      if (WorkflowNode.length > 0 && WorkflowEdge.length > 0) {
        // Find the start node
        const startNodeId = WorkflowNode.find(node => node.type === 'startNode')?.id;
        
        // Apply auto layout
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2 });
        }, 100);
      }
    }
  }, [activeWorkflow, reactFlowInstance, WorkflowNode, WorkflowEdge]);

  // Handle node changes immutably
  const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    if(!activeWorkflow || !selectedWorkflow){
      return void 0;
    }
    
    // Check if this is a node deletion
    const deletionChange = changes.find(change => change.type === 'remove');
    if (deletionChange) {
      const nodeId = (deletionChange as { id: string }).id;
      
      // Prevent deletion of initial nodes
      if (isInitialNode(nodeId)) {
        setErrorMessage('Initial workflow nodes cannot be deleted');
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }
    }
    
    // CHANGE POSITION NODE
    if (changes.length === 1 && changes[0].type === "position" && changes[0].dragging && changes[0].position) {
      const { position, id } = changes[0] as { id: string; position: { x: number; y: number } };
      
      // Only call changeNodePosition if we have valid position coordinates
      if (typeof position.x === 'number' && typeof position.y === 'number') {
        changeNodePosition({
          workflowId: selectedWorkflow,
          nodeId: id,
          position: position,
        });
      }
    }

    // CHANGE DIMENSION NODE
    if (changes.length === 1 && changes[0].type === "dimensions" && changes[0].resizing && changes[0].dimensions && changes[0].position) {
      const { position, id } = changes[0] as { id: string; position: { x: number; y: number } };
      
      // Only call changeNodePosition if we have valid position coordinates
      if (typeof position.x === 'number' && typeof position.y === 'number') {
        changeNodePosition({
          workflowId: selectedWorkflow,
          nodeId: id,
          position: position,
        });
      }
    }

    // For node removal, we need to handle it separately to prevent initial nodes deletion
    if (changes.some(change => change.type === 'remove')) {
      const nodesToRemove = changes
        .filter(change => change.type === 'remove')
        .map(change => (change as { id: string }).id)
        .filter(id => !isInitialNode(id)); // Filter out initial nodes
      
      if (nodesToRemove.length > 0) {
        // Update workflow by removing non-initial nodes
        updateWorkflowNodesChanges({
          id: selectedWorkflow,
          nodes: WorkflowNode.filter(node => !nodesToRemove.includes(node.id))
        });
        
        // Also remove any edges connected to these nodes
        updateWorkflowEdgesChanges({
          id: selectedWorkflow,
          edges: WorkflowEdge.filter(edge => 
            !nodesToRemove.includes(edge.source) && !nodesToRemove.includes(edge.target)
          )
        });
      }
      
      // Return to prevent default handling
      return;
    }
  }, [WorkflowNode, WorkflowEdge, changeNodePosition, activeWorkflow, selectedWorkflow, updateWorkflowNodesChanges, updateWorkflowEdgesChanges, isInitialNode]);

  const _onConnectStart = useCallback((event: React.MouseEvent | React.TouchEvent, params: any) => {
    connectingNodeId.current = params?.nodeId;
    connectingHandleId.current = params?.handleId;
  },[]);

  // Check if a target node already has a connection to the specified handle
  const hasExistingConnection = useCallback((targetId: string, targetHandle: string | null) => {
    return WorkflowEdge.some(edge => 
      edge.target === targetId && 
      (targetHandle ? edge.targetHandle === targetHandle : true)
    );
  }, [WorkflowEdge]);

  // Check if a source node already has a connection from the specified handle
  const hasExistingSourceConnection = useCallback((sourceId: string, sourceHandle: string | null) => {
    return WorkflowEdge.some(edge => 
      edge.source === sourceId && 
      (sourceHandle ? edge.sourceHandle === sourceHandle : true)
    );
  }, [WorkflowEdge]);

  // Validate connection before it's created
  const isValidConnection = useCallback((connection: Connection) => {
    // Check if target already has a connection
    if (hasExistingConnection(connection.target!, connection.targetHandle)) {
      setErrorMessage('This input connection point already has a source node connected. Only one source node per connection point is allowed.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
      return false;
    }

    // For condition nodes, check if the source handle already has a connection
    // This prevents multiple connections from the same output point
    if (connection.sourceHandle && hasExistingSourceConnection(connection.source!, connection.sourceHandle)) {
      setErrorMessage('This output connection point already has a target node connected. Only one target node per connection point is allowed.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
      return false;
    }

    return true;
  }, [hasExistingConnection, hasExistingSourceConnection]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connectingNodeId.current || !selectedWorkflow || !connection.source || !connection.target) return;
    
    try {
      // Validate the connection
      if (!isValidConnection(connection)) {
        return;
      }
      
      const updatesEdge = [...WorkflowEdge, connection];
      const validEdges = updatesEdge.map((edge : any) => ({
        ...edge,
        id : uuidv4(),
        type: edge.type || 'customEdge', // Use our custom edge by default
        markerEnd: { type: MarkerType.ArrowClosed },
      }));
      
      connectingNodeId.current = null;
      connectingHandleId.current = null;
      updateWorkflowEdgesChanges({ id: selectedWorkflow, edges: validEdges });
      
      logger.debug('Edge connected', { 
        workflowId: selectedWorkflow,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle
      });
    } catch (error) {
      logger.error('Error connecting edge', error as Error);
    }
  }, [WorkflowEdge, updateWorkflowEdgesChanges, selectedWorkflow, logger, isValidConnection]);
  
  const _onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    if (!reactFlowInstance || !connectingNodeId.current) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const targetIsPane = target.classList.contains('react-flow__pane');
    const targetIsHandle = target.classList.contains('react-flow__handle');
  }, [reactFlowInstance, connectingNodeId]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    connectingNodeId.current = null;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, [connectingNodeId]);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowWrapper.current || !reactFlowInstance || !activeWorkflow || !selectedWorkflow) {
      return;
    }
    
    try {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow');
      
      const nodeData = JSON.parse(data);
      const position = {
        x: (event.clientX - reactFlowBounds.left) / reactFlowInstance.getZoom() - reactFlowInstance.getViewport().x,
        y: (event.clientY - reactFlowBounds.top) / reactFlowInstance.getZoom() - reactFlowInstance.getViewport().y
      };
      
      const newNode = {
        id: getId(),
        type: nodeData.type,
        position,
        data: { 
          label: nodeData.label,
          icon: nodeData.icon,
          color: nodeData.color,
          code: nodeData.type === 'javascriptNode' ? 'console.log("hello World");\nreturn { message: "hello World" };' : undefined,
        }
      };
      
      const updatesNodes = WorkflowNode.concat(newNode);
      const validNodes: any[] = updatesNodes.map((node: Node) => ({
        ...node,
        type: node.type || 'default', // Ensure 'type' is always a string
        data: {
          ...node.data,
          label: (node.data as { label?: string }).label || 'Default Label', // Ensure 'label' exists
        },
      }));
      
      updateWorkflowNodesChanges({ id: selectedWorkflow, nodes: validNodes });
      
      logger.debug('Node added', { 
        workflowId: selectedWorkflow,
        nodeType: nodeData.type,
        position
      });
    } catch (error) {
      logger.error('Error adding node', error as Error);
    }
  }, [reactFlowInstance, activeWorkflow, WorkflowNode, selectedWorkflow, updateWorkflowNodesChanges, logger]);

  // Apply auto layout to the workflow
  const applyAutoLayout = useCallback(() => {
    if (!selectedWorkflow || !activeWorkflow) {
      logger.warn('Cannot apply auto layout: no workflow selected');
      return;
    }
    
    try {
      setIsLayouting(true);
      
      // Get current nodes and edges
      const currentNodes = Array.isArray(activeWorkflow.nodes) ? [...activeWorkflow.nodes] : [];
      const currentEdges = Array.isArray(activeWorkflow.edges) ? [...activeWorkflow.edges] : [];
      
      // Find the start node
      const startNodeId = currentNodes.find(node => node.type === 'startNode')?.id;
      
      // Apply auto layout
      const layoutedNodes = autoLayoutHorizontal(currentNodes, currentEdges, startNodeId);
      
      // Update the workflow with the new layout
      updateWorkflowNodesChanges({ id: selectedWorkflow, nodes: layoutedNodes });
      
      // Fit view after layout
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2 });
        }
        setIsLayouting(false);
      }, 300);
      
      logger.info('Auto layout applied', { workflowId: selectedWorkflow });
    } catch (error) {
      logger.error('Error applying auto layout', error as Error);
      setIsLayouting(false);
    }
  }, [selectedWorkflow, activeWorkflow, updateWorkflowNodesChanges, reactFlowInstance, logger]);

  // Render conditions
  if (!selectedPage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950/50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-6 bg-gray-800/50 rounded-full">
              <Share2 className="h-12 w-12 text-gray-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No Page Selected</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Select a page from the sidebar to view or create workflows.
          </p>
        </div>
      </div>
    );
  }

  if (currentPageWorkflows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950/50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-6 bg-blue-500/10 rounded-full">
              <Share2 className="h-12 w-12 text-blue-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No Workflows Yet</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Create your first workflow to start building automated processes for this page.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Workflow
          </button>
        </div>

        {showCreateForm && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateForm(false)} />
            <div className="relative z-10">
              <CreateWorkflowForm onClose={() => setShowCreateForm(false)} />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!selectedWorkflow) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950/50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-6 bg-gray-800/50 rounded-full">
              <Share2 className="h-12 w-12 text-gray-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No Workflow Selected</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Select a workflow from the left panel to start editing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={reactFlowWrapper} className="relative h-full w-full bg-[#141414] text-white text-xs">
      {/* Error Toast */}
      {showErrorToast && (
        <div className="absolute top-4 right-4 z-50 bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg flex items-start max-w-md animate-in slide-in-from-top-5 fade-in">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-white/90 text-sm">{errorMessage}</p>
          </div>
          <button 
            className="ml-2 p-1 hover:bg-red-600 rounded-full"
            onClick={() => setShowErrorToast(false)}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <ReactFlow
        nodes={_getConvertNode()}
        edges={_getConvertEdge()}
        onConnectStart={_onConnectStart}
        onConnectEnd={_onConnectEnd}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        isValidConnection={isValidConnection}
        defaultEdgeOptions={{
          type: 'customEdge',
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        className="bg-gray-950"
        minZoom={0.2}
        attributionPosition="top-right"
        proOptions={{ account: "paid-pro", hideAttribution: true }}
        nodesDraggable={(node) => !node.data?.isLocked} // Disable dragging for locked nodes
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
        
        {/* Auto Layout Button */}
        <Panel position="top-left" className="bg-gray-900/80 rounded-md border border-gray-800 shadow-lg">
          <button
            onClick={applyAutoLayout}
            disabled={isLayouting}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors",
              isLayouting 
                ? "text-gray-400 cursor-wait" 
                : "text-blue-400 hover:text-blue-300"
            )}
            title="Auto-arrange nodes horizontally"
          >
            <LayoutGrid className={cn(
              "h-4 w-4",
              isLayouting && "animate-pulse"
            )} />
            {isLayouting ? "Arranging..." : "Auto Layout"}
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}