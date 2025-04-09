import React, { useState } from 'react';
import { 
  Code2, 
  Globe, 
  Circle as RepeatCircle, 
  GitFork, 
  Clock, 
  Bell, 
  FileOutput,
  Box,
  Play,
  Share2
} from 'lucide-react';
import clsx from 'clsx';

const customNodes = [
  {
    id: 'start',
    label: 'Start',
    icon: Play,
    color: 'emerald',
    description: 'Starting point of workflow',
    type: 'startNode'
  },
  {
    id: 'javascript',
    label: 'JavaScript Code',
    icon: Code2,
    color: 'yellow',
    description: 'Execute JavaScript code',
    type: 'javascriptNode'
  },
  {
    id: 'http',
    label: 'HTTP Request',
    icon: Globe,
    color: 'blue',
    description: 'Make HTTP API calls',
    type: 'httpNode'
  },
  {
    id: 'loop',
    label: 'Loop Action',
    icon: RepeatCircle,
    color: 'green',
    description: 'Repeat actions',
    type: 'loopNode'
  },
  {
    id: 'condition',
    label: 'Condition',
    icon: GitFork,
    color: 'purple',
    description: 'Branch based on conditions',
    type: 'conditionNode'
  },
  {
    id: 'interval',
    label: 'Interval',
    icon: Clock,
    color: 'orange',
    description: 'Run at timed intervals',
    type: 'intervalNode'
  },
  {
    id: 'notification',
    label: 'Notification',
    icon: Bell,
    color: 'pink',
    description: 'Show notifications',
    type: 'notificationNode'
  },
  {
    id: 'file',
    label: 'Generate File',
    icon: FileOutput,
    color: 'cyan',
    description: 'Create and save files',
    type: 'fileNode'
  },
  {
    id: 'executeWorkflow',
    label: 'Execute Workflow',
    icon: Share2,
    color: 'indigo',
    description: 'Run another workflow',
    type: 'executeWorkflowNode'
  }
];

export function NodesTab() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodeContainer = clsx(
    'grid grid-cols-2 gap-3',
    'mt-4'
  );

  const nodeCard = (color: string) => clsx(
    'relative p-3 rounded-lg',
    'border border-gray-800',
    'transition-all duration-200',
    'group',
    `hover:border-${color}-500/50`,
    `hover:bg-${color}-500/5`
  );

  const dragHandle = (color: string) => clsx(
    'flex flex-col items-center space-y-2',
    'cursor-move',
    'transition-transform duration-200',
    'hover:scale-105'
  );

  const iconWrapper = (color: string) => clsx(
    'p-2 rounded-lg',
    'transition-all duration-200',
    `bg-${color}-500/10`,
    `text-${color}-400`,
    'group-hover:scale-110'
  );

  const onDragStart = (event: React.DragEvent, node: any) => {
    const dragData = {
      type: node.type,
      label: node.label,
      icon: node.icon,
      color: node.color
    };
    
    event.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="space-y-6">
      {/* Nodes Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Available Nodes</h3>
        <div className={nodeContainer}>
          {customNodes.map((node) => (
            <div
              key={node.id}
              className={nodeCard(node.color)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div 
                className={dragHandle(node.color)} 
                draggable
                onDragStart={(e) => onDragStart(e, node)}
              >
                <div className={iconWrapper(node.color)}>
                  <node.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {node.label}
                </span>
              </div>

              {hoveredNode === node.id && (
                <div className="absolute mt-2 p-2 bg-gray-800 rounded-lg shadow-lg text-xs text-gray-300 w-48 z-10">
                  {node.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}