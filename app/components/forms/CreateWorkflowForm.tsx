import React from 'react';
import { useStore } from '~/store/zustand/store';
import { DynamicForm } from '~/components/form/DynamicForm';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '~/lib/logger';
import { autoLayoutHorizontal } from '~/lib/layout';

interface CreateWorkflowFormProps {
  onClose: () => void;
}



export function CreateWorkflowForm({ onClose }: CreateWorkflowFormProps) {
  const { selectedPage, workflow, setWorkflow } = useStore();
  const logger = Logger.getInstance();

  const fields = [
    [
      {
        name: "name",
        title: "Workflow Name",
        type: "char",
        description: "Enter a unique identifier for your workflow (a-z, 0-9, _)",
        rules: {
          required: "Workflow name is required",
          pattern: {
            value: /^[a-z][a-z0-9_]*$/,
            message: "Name must start with a letter and can only contain lowercase letters, numbers, and underscores"
          },
          custom: (value: string) => {
            // Check if workflow name already exists for this page
            const exists = Object.values(workflow).some(w => 
              w.parentPageId === selectedPage && w.name === value
            );
            return exists ? "A workflow with this name already exists" : true;
          }
        },
      },
      {
        name: "description",
        title: "Description",
        type: "text",
        description: "Provide a brief description of what this workflow does",
        rules: {
          required: "Description is required",
        },
      },
    ],
  ];


  const handleSubmit = (data: any) => {
    try {
      // Create unique IDs for nodes and edge
      const startNodeId = "start_node";
      const endNodeId = "end_node";
      const edgeId = `edge_${uuidv4().substring(0, 8)}`;
      
      const initialNodes = [
        // Start node
        {
          id: startNodeId,
          type: "startNode",
          position: { x: 0, y: 0 }, // Position will be updated by auto layout
          data: {
            label: "Start",
            icon: "Play",
            color: "emerald",
            isLocked: true
          }
        },
        // JavaScript code node
        {
          id: endNodeId,
          type: "javascriptNode",
          position: { x: 300, y: 0 }, // Position will be updated by auto layout
          data: {
            label: "JavaScript Code",
            code: "// This is your workflow code\nconsole.log('Workflow started');\n\n// Return a result\nreturn {\n  success: true,\n  message: 'Workflow executed successfully'\n};",
            icon: "Code2",
            color: "yellow",
            isLocked: true
          }
        }
      ];
      
      // Create the edge connecting start to end
      const initialEdges = [
        // Connect start node to JavaScript code node
        {
          id: edgeId,
          source: startNodeId,
          target: endNodeId,
          type: "customEdge",
          markerEnd: { type: "arrowclosed" }
        }
      ];
      
      // Apply auto layout to position nodes nicely
      const layoutedNodes = autoLayoutHorizontal(initialNodes, initialEdges, startNodeId);
      
      // Create the workflow with initial nodes and edge
      const newWorkflow = {
        id: data.name, // Use the workflow name as the ID
        name: data.name,
        description: data.description,
        parentPageId: selectedPage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
        nodes: layoutedNodes,
        edges: initialEdges,
        triggers: [],
      };
      
      // Save the workflow
      setWorkflow(newWorkflow);
      
      logger.info('Workflow created with initial nodes', { 
        workflowId: data.name,
        nodeCount: 2,
        edgeCount: 1
      });
      
      onClose();
    } catch (error) {
      logger.error('Error creating workflow', error as Error);
    }
  };

  return (
    <DynamicForm
      fields={fields}
      onSubmit={handleSubmit}
      onCancel={onClose}
      title="Create New Workflow"
    />
  );
}