import React, { useState, useCallback } from 'react';
import { 
  Code2, 
  Globe, 
  Circle as RepeatCircle, 
  GitFork, 
  Clock, 
  Bell, 
  FileOutput, 
  Database, 
  Box, 
  ChevronRight, 
  Settings, 
  FolderOpen,
  Plus,
  Search,
  Play,
  Pause,
  Trash2,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '~/store/zustand/store';

interface DeleteConfirmationProps {
  workflowName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation = React.memo(({ workflowName, onConfirm, onCancel }: DeleteConfirmationProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border border-gray-800">
        <div className="flex items-center space-x-4 text-red-400 mb-4">
          <AlertTriangle className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Delete Workflow</h3>
        </div>
        <p className="text-gray-300 mb-2">
          Are you sure you want to delete <span className="font-semibold">"{workflowName}"</span>?
        </p>
        <p className="text-gray-400 text-sm mb-6">
          This action cannot be undone. The workflow and all its configurations will be permanently deleted.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Delete Workflow
          </button>
        </div>
      </div>
    </div>
  );
});

DeleteConfirmation.displayName = 'DeleteConfirmation';

interface SortablePageItemProps {
  page: any;
  isActive: boolean;
  isSelected: boolean;
  onMenuClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onSelect: () => void;
}

type TabType = 'nodes' | 'query';

interface CustomNode {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  type: string;
}

const customNodes: CustomNode[] = [
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
  }
];

export function ProjectTree() {
  const { workflow, selectedWorkflow, selectedPage, setSelectedWorkflow, deleteWorkflow } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('nodes');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeWorkflowMenu, setActiveWorkflowMenu] = useState<string | null>(null);
  const [deletingWorkflow, setDeletingWorkflow] = useState<{ id: string; name: string } | null>(null);

  const tabButton = (isActive: boolean, color: string) => clsx(
    'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
    isActive && [
      `text-${color}-400`,
      'border-b-2',
      `border-${color}-400`
    ],
    !isActive && [
      'text-gray-400',
      'hover:text-gray-300'
    ]
  );

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

  const selectClass = clsx(
    'w-full',
    'bg-gray-800',
    'border border-gray-700',
    'rounded',
    'px-2 py-1',
    'text-sm'
  );

  const scrollableContent = clsx(
    'flex-1',
    'p-4',
    'overflow-y-auto',
    'scrollbar-hide'
  );

  const handleDeleteWorkflow = (workflowId: string) => {
    deleteWorkflow(workflowId);
    setDeletingWorkflow(null);
    setActiveWorkflowMenu(null);
  };

  const handleSelectWorkflow = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
    setActiveWorkflowMenu(null);
  };

  const sortedWorkflows = React.useMemo(() => {
    return Object.values(workflow).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [workflow]);

  const filteredWorkflows = React.useMemo(() => 
    sortedWorkflows.filter(workflow => 
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  , [sortedWorkflows, searchQuery]);

  return (
    <div className="w-1/4 border-r border-gray-800 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('nodes')}
          className={tabButton(activeTab === 'nodes', 'blue')}
        >
          <Box className="h-4 w-4" />
          Nodes
        </button>
        <button
          onClick={() => setActiveTab('query')}
          className={tabButton(activeTab === 'query', 'purple')}
        >
          <Database className="h-4 w-4" />
          Query
        </button>
      </div>

      {/* Content */}
      <div className={scrollableContent}>
        {activeTab === 'nodes' ? (
          <div className="space-y-6">
            {/* Workflows List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Workflows</h3>
                <button className="p-1 hover:bg-gray-800 rounded">
                  <Plus className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                {filteredWorkflows.map((workflow) => (
                  <div key={workflow.id} className="relative group">
                    <div 
                      onClick={() => handleSelectWorkflow(workflow.id)}
                      className={clsx(
                        "flex items-center justify-between",
                        "px-3 py-2 rounded-lg",
                        "cursor-pointer",
                        "transition-colors",
                        selectedWorkflow === workflow.id
                          ? "bg-gray-800 text-gray-200"
                          : "text-gray-400 hover:bg-gray-800/70 hover:text-gray-300"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={clsx(
                          "h-2 w-2 rounded-full",
                          workflow.isActive ? "bg-green-400" : "bg-gray-600"
                        )} />
                        <span className="text-sm">{workflow.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            workflow.isActive ? null : null; // Toggle workflow
                          }}
                        >
                          {workflow.isActive ? (
                            <Pause className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Play className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveWorkflowMenu(activeWorkflowMenu === workflow.id ? null : workflow.id);
                          }}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Workflow Menu */}
                    {activeWorkflowMenu === workflow.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10">
                        <button
                          className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                          onClick={() => {
                            setDeletingWorkflow({ id: workflow.id, name: workflow.name });
                            setActiveWorkflowMenu(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Workflow
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

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
                    <div className={dragHandle(node.color)} draggable>
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
        ) : (
          <div className="space-y-4">
            {/* Query Builder */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Query Builder</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Table</label>
                  <select className={selectClass}>
                    <option>users</option>
                    <option>posts</option>
                    <option>comments</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Operation</label>
                  <select className={selectClass}>
                    <option>SELECT</option>
                    <option>INSERT</option>
                    <option>UPDATE</option>
                    <option>DELETE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Conditions</label>
                  <textarea 
                    className={clsx(
                      selectClass,
                      'h-24',
                      'resize-none'
                    )}
                    placeholder="WHERE clause..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingWorkflow && (
        <DeleteConfirmation
          workflowName={deletingWorkflow.name}
          onConfirm={() => handleDeleteWorkflow(deletingWorkflow.id)}
          onCancel={() => setDeletingWorkflow(null)}
        />
      )}
    </div>
  );
}