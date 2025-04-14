import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useStore } from '~/store/zustand/store';
import { cn } from '~/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { autoLayoutHorizontal } from '~/lib/layout';


interface DeleteButtonProps {
  nodeId: string;
  isLocked?: boolean;
}



export function DeleteButton({ nodeId, isLocked = false }: DeleteButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { selectedWorkflow, workflow, updateWorkflowNodesChanges, updateWorkflowEdgesChanges } = useStore();
 

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) {
      return;
    }
    if (!selectedWorkflow) {
      return;
    }
    
    try {
      const currentWorkflow = workflow[selectedWorkflow];
      if (!currentWorkflow) {
        return;
      }
      
      const currentNodes = Array.isArray(currentWorkflow.nodes) ? [...currentWorkflow.nodes] : [];
      const currentEdges = Array.isArray(currentWorkflow.edges) ? [...currentWorkflow.edges] : [];
      
      // Find edges connected to this node
      const incomingEdges = currentEdges.filter(edge => edge.target === nodeId);
      const outgoingEdges = currentEdges.filter(edge => edge.source === nodeId);
      
      // Create new connections between the nodes before and after the deleted node
      const newEdges = [];
      
      for (const incoming of incomingEdges) {
        for (const outgoing of outgoingEdges) {
          // Create a new edge connecting the source of the incoming edge to the target of the outgoing edge
          newEdges.push({
            id: `edge_${uuidv4().substring(0, 8)}`,
            source: incoming.source,
            target: outgoing.target,
            type: 'customEdge',
            sourceHandle: incoming.sourceHandle,
            targetHandle: outgoing.targetHandle,
            markerEnd: { type: 'arrowclosed' },
          });
        }
      }
      
      // Filter out the node and its connected edges
      const updatedNodes = currentNodes.filter(node => node.id !== nodeId);
      const updatedEdges = currentEdges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      );
      
      // Add the new connecting edges
      const finalEdges = [...updatedEdges, ...newEdges];
      
      // Apply auto layout to reorganize the nodes
      const startNodeId = currentNodes.find(node => node.type === 'startNode')?.id;
      const layoutedNodes = autoLayoutHorizontal(updatedNodes, finalEdges, startNodeId);
      
      // Update the workflow with the new layout
      updateWorkflowNodesChanges({ id: selectedWorkflow, nodes: layoutedNodes });
      updateWorkflowEdgesChanges({ id: selectedWorkflow, edges: finalEdges });
    } catch (error) {
     
    }
  };

  return (
    <button
      className={cn(
        "absolute -top-3 -right-3 p-1.5 rounded-full z-10 transition-all",
        isLocked ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600",
        isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90",
        "shadow-md border border-gray-700"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleDelete}
      title={isLocked ? "This node cannot be deleted" : "Delete node"}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}