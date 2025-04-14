import React, { useState, useCallback } from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';
import { Plus, X } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useStore } from '~/store/zustand/store';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '~/lib/logger';
import { autoLayoutHorizontal } from '~/lib/layout';

interface CustomEdgeProps extends EdgeProps {
  data?: {
    label?: string;
  };
}

// Node types available for insertion
const NODE_TYPES = [
  { 
    id: 'odooGetListDataNode', 
    label: 'ODOO - GET DATA',
    description: 'ODOO GET DATA TABLE',
    color: 'yellow'
  },
  { 
    id: 'javascriptNode', 
    label: 'JavaScript Code',
    description: 'Execute JavaScript code',
    color: 'yellow'
  },
  { 
    id: 'httpNode', 
    label: 'HTTP Request',
    description: 'Make HTTP API calls',
    color: 'blue'
  },
  { 
    id: 'loopNode', 
    label: 'Loop Action',
    description: 'Repeat actions',
    color: 'green'
  },
  { 
    id: 'conditionNode', 
    label: 'Condition',
    description: 'Branch based on conditions',
    color: 'purple'
  },
  { 
    id: 'intervalNode', 
    label: 'Interval',
    description: 'Run at timed intervals',
    color: 'orange'
  },
  { 
    id: 'notificationNode', 
    label: 'Notification',
    description: 'Show notifications',
    color: 'pink'
  },
  { 
    id: 'fileNode', 
    label: 'Generate File',
    description: 'Create and save files',
    color: 'cyan'
  },
  { 
    id: 'executeWorkflowNode', 
    label: 'Execute Workflow',
    description: 'Run another workflow',
    color: 'indigo'
  }
];

export function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: CustomEdgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const { selectedWorkflow, workflow, updateWorkflow } = useStore();
  const logger = Logger.getInstance();

  // Check if this edge connects initial nodes (start_node and end_node)
  const isInitialEdge = useCallback(() => {
    return (source === 'start_node' && target === 'end_node');
  }, [source, target]);

  // Get the path for the edge
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Handle adding a new node in the middle of the edge
  const handleAddNode = useCallback((nodeType: string) => {
    if (!selectedWorkflow) {
      logger.warn('Cannot add node: no workflow selected');
      return;
    }

    try {
      // Get current workflow
      const currentWorkflow = workflow[selectedWorkflow];
      if (!currentWorkflow) {
        logger.warn('Cannot add node: workflow not found', { workflowId: selectedWorkflow });
        return;
      }

      // Get current nodes and edges
      const currentNodes = Array.isArray(currentWorkflow.nodes) ? [...currentWorkflow.nodes] : [];
      const currentEdges = Array.isArray(currentWorkflow.edges) ? [...currentWorkflow.edges] : [];

      // Create a unique ID for the new node
      const newNodeId = `node_${uuidv4().substring(0, 8)}`;

      // Create the new node
      const newNode = {
        id: newNodeId,
        type: nodeType,
        position: { x: (sourceX + targetX) / 2 - 140, y: (sourceY + targetY) / 2 - 60 }, // Initial position
        data: {
          label: NODE_TYPES.find(t => t.id === nodeType)?.label || 'New Node',
          code: nodeType === 'javascriptNode' ? 'console.log("New node added");\nreturn data;' : undefined,
        },
      };

      // Create new edges: source -> new node and new node -> target
      const newEdge1 = {
        id: `edge_${uuidv4().substring(0, 8)}`,
        source,
        target: newNodeId,
        type: 'customEdge',
        markerEnd: { type: 'arrowclosed' },
      };

      const newEdge2 = {
        id: `edge_${uuidv4().substring(0, 8)}`,
        source: newNodeId,
        target,
        type: 'customEdge',
        markerEnd: { type: 'arrowclosed' },
      };

      // Filter out the original edge
      const updatedEdges = currentEdges.filter(edge => edge.id !== id);
      const finalEdges = [...updatedEdges, newEdge1, newEdge2];
      
      // Add the new node to the nodes array
      const updatedNodes = [...currentNodes, newNode];
      
      // Apply auto layout to reorganize the nodes
      const startNodeId = currentNodes.find(node => node.type === 'startNode')?.id;
      const layoutedNodes = autoLayoutHorizontal(updatedNodes, finalEdges, startNodeId);

      // Update the workflow with the new layout
      updateWorkflow({
        id: selectedWorkflow,
        nodes: layoutedNodes,
        edges: finalEdges,
      });

      // Close the node selector
      setShowNodeSelector(false);

    } catch (error) {
      logger.error('Error adding node to edge', error as Error);
    }
  }, [id, source, target, sourceX, sourceY, targetX, targetY, selectedWorkflow, workflow, updateWorkflow, logger]);

  // Handle button click to show node selector
  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNodeSelector(prev => !prev);
  }, []);


  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isHovered || showNodeSelector ? '#3b82f6' : '#64748b',
          strokeWidth: isHovered || showNodeSelector ? 2 : 1,
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
       // onMouseEnter={() => setIsHovered(true)}
       // onMouseLeave={() => setIsHovered(false)}
      />

      {/* Edge label if provided */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-md"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Plus button in the middle of the edge */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 10,
          }}
          //onMouseEnter={() => setIsButtonHovered(true)}
          //onMouseLeave={() => setIsButtonHovered(false)}
        >
          <button
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200",
              "shadow-lg border border-gray-700 bg-gray-800/80 text-gray-400 scale-110"
             
             
            
            )}
            onClick={handleButtonClick}
            title={showNodeSelector ? "Close" : "Add node"}
          >
            {showNodeSelector ? <X className="h-2 w-2" /> : <Plus className="h-2 w-2" />}
          </button>
        </div>
      </EdgeLabelRenderer>

      {/* Node selector popover */}
      {showNodeSelector && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + 40}px)`,
              pointerEvents: 'all',
              zIndex: 20,
            }}
            className=" nodrag nowheel bg-gray-900 rounded-lg border border-gray-700 shadow-xl p-2 w-64 animate-in fade-in zoom-in-95"
          >
            <div className="text-xs font-medium text-gray-300 mb-2 px-2">
              Select Node Type
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
              {NODE_TYPES.map((nodeType) => (
                <button
                  key={nodeType.id}
                  className="w-full text-left p-2 rounded-md hover:bg-gray-800 transition-colors flex items-start gap-2"
                  onClick={() => handleAddNode(nodeType.id)}
                >
                  <div className={cn(
                    "mt-0.5 w-2 h-2 rounded-full flex-shrink-0",
                    nodeType.color === 'yellow' && "bg-yellow-400",
                    nodeType.color === 'blue' && "bg-blue-400",
                    nodeType.color === 'green' && "bg-green-400",
                    nodeType.color === 'purple' && "bg-purple-400",
                    nodeType.color === 'orange' && "bg-orange-400",
                    nodeType.color === 'pink' && "bg-pink-400",
                    nodeType.color === 'cyan' && "bg-cyan-400",
                    nodeType.color === 'indigo' && "bg-indigo-400",
                    nodeType.color === 'emerald' && "bg-emerald-400"
                  )} />
                  <div>
                    <div className="text-sm font-medium text-gray-200">
                      {nodeType.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {nodeType.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}