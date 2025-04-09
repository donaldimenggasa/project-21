import React, { useState, useCallback, memo, useEffect } from 'react';
import { 
  Search,
  Plus,
  Play,
  Pause,
  Trash2,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '~/store/zustand/store';
import { CreateWorkflowForm } from '~/components/forms/CreateWorkflowForm';

interface DeleteConfirmationProps {
  workflowName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation = memo(({ workflowName, onConfirm, onCancel }: DeleteConfirmationProps) => {
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

export function QueryTab() {
  const { workflow, selectedWorkflow, selectedPage, setSelectedWorkflow, deleteWorkflow } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkflowMenu, setActiveWorkflowMenu] = useState<string | null>(null);
  const [deletingWorkflow, setDeletingWorkflow] = useState<{ id: string; name: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const sortedWorkflows = React.useMemo(() => {
    return Object.values(workflow)
      .filter(workflow => workflow.parentPageId === selectedPage)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [workflow, selectedPage]);

  // Select first workflow if none is selected
  useEffect(() => {
    if (selectedPage && sortedWorkflows.length > 0 && !selectedWorkflow) {
      setSelectedWorkflow(sortedWorkflows[0].id);
    }
  }, [selectedPage, sortedWorkflows, selectedWorkflow, setSelectedWorkflow]);

  const handleDeleteWorkflow = useCallback((workflowId: string) => {
    deleteWorkflow(workflowId);
    setDeletingWorkflow(null);
    setActiveWorkflowMenu(null);
  }, [deleteWorkflow]);

  const handleSelectWorkflow = useCallback((workflowId: string) => {
    setSelectedWorkflow(workflowId);
    setActiveWorkflowMenu(null);
  }, [setSelectedWorkflow]);

  const filteredWorkflows = React.useMemo(() => 
    sortedWorkflows.filter(workflow => 
      (workflow?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  , [sortedWorkflows, searchQuery]);

  return (
    <div className="">
      <div className="space-y-6">
        {/* Workflows List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">Workflows</h3>
            <button 
              className="p-1 hover:bg-gray-800 rounded"
              onClick={() => setShowCreateForm(true)}
              disabled={!selectedPage}
              title={!selectedPage ? "Select a page first" : "Create new workflow"}
            >
              <Plus className={clsx(
                "h-4 w-4",
                selectedPage ? "text-gray-400" : "text-gray-600"
              )} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            {!selectedPage ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Select a page to view its workflows</p>
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'No workflows found' : 'No workflows created yet'}
                </p>
              </div>
            ) : (
              filteredWorkflows.map((workflow) => (
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateForm(false)} />
          <div className="relative z-10">
            <CreateWorkflowForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}

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