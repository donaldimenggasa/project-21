import React, { useState, useCallback } from 'react';
import { Layout, Plus, Search, Pencil, Trash2, GripVertical, Check, AlertTriangle, FileText, FolderOpen } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useStore } from '~/store/zustand/store';
import { CreatePagePopoverForm } from '~/components/forms/CreatePagePopoverForm';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as icons from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

interface DeleteConfirmationProps {
  pageTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation = React.memo(({ pageTitle, onConfirm, onCancel }: DeleteConfirmationProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border border-border">
        <div className="flex items-center space-x-4 text-destructive mb-4">
          <AlertTriangle className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Delete Page</h3>
        </div>
        <p className="text-foreground mb-2">
          Are you sure you want to delete <span className="font-semibold">"{pageTitle}"</span>?
        </p>
        <p className="text-secondary text-sm mb-6">
          This action cannot be undone. The page and all its contents will be permanently deleted.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-sm btn-ghost"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-sm btn-destructive"
          >
            Delete Page
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

const SortablePageItem = React.memo(({ 
  page,
  isActive,
  isSelected,
  onMenuClick,
  onEditClick,
  onDeleteClick,
  onSelect,
}: SortablePageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderPageIcon = useCallback((iconName: string, color: string = '#6b7280') => {
    const IconComponent = (icons[iconName as keyof typeof icons] || Layout) as React.ElementType;
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{
        backgroundColor: `${color}15`,
      }}>
        <IconComponent className="h-3.5 w-3.5" style={{ color }}/>
      </div>
    );
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex items-center gap-2 p-2 rounded-md',
        'border border-transparent',
        isDragging && 'opacity-50 shadow-lg',
        'group',
        isSelected ? 'bg-primary/10 border-primary/20' : 'hover:bg-background'
      )}
      {...attributes}
    >
      <button
        className={cn('p-1 hover:bg-background/80 rounded cursor-grab active:cursor-grabbing')}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5 text-secondary" />
      </button>
      
      <div className="flex-1 min-w-0" onClick={onSelect}>
        <div className="flex items-center gap-2">
          {renderPageIcon(page.icon || 'Layout', page.iconColor || '#6b7280')}
          <div className="flex flex-col min-w-0">
            <span className={cn(
              "text-sm font-medium truncate",
              isSelected ? "text-primary" : "text-foreground"
            )}>
              {page.title}
            </span>
            <span className="text-xs text-secondary truncate">{page.description?.split('\n')[0]}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEditClick}
          className="p-1 hover:bg-background rounded text-secondary hover:text-foreground"
          title="Edit page"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDeleteClick}
          className="p-1 hover:bg-destructive/10 rounded text-secondary hover:text-destructive"
          title="Delete page"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
});

SortablePageItem.displayName = 'SortablePageItem';







export function PagesTab() {
  const { page, selectedPage, setSelectedPage, reorderPages, deletePage } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingPage, setDeletingPage] = useState<{ id: string; title: string } | null>(null);
  const [isCreatePopoverOpen, setIsCreatePopoverOpen] = useState(false);

  const sortedPages = React.useMemo(() => {
    return Object.values(page).sort((a, b) => a.order - b.order);
  }, [page]);

  const filteredPages = React.useMemo(() => 
    sortedPages.filter(page => 
      page?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  , [sortedPages, searchQuery]);

  const handleDeletePage = useCallback((pageId: string) => {
    deletePage(pageId);
    setDeletingPage(null);
  }, [deletePage]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      reorderPages({
        sourceId: active.id as string,
        destinationId: over.id as string,
      });
    }
  }, [reorderPages]);

  return (
    <>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-secondary">Pages</h3>
          <Popover.Root open={isCreatePopoverOpen} onOpenChange={setIsCreatePopoverOpen}>
            <Popover.Trigger asChild>
              <button 
                className="p-1.5 hover:bg-background rounded-md text-secondary hover:text-foreground"
                title="Create new page"
              >
                <Plus className="h-4 w-4" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="right"
                align="start"
                sideOffset={8}
                className="z-50 animate-in fade-in-0 zoom-in-95"
              >
                <CreatePagePopoverForm onClose={() => setIsCreatePopoverOpen(false)} />
                <Popover.Arrow className="fill-card" width={16} height={8} />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        {filteredPages.length > 0 ? (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredPages.map(page => page.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {filteredPages.map((page) => (
                  <SortablePageItem
                    key={page.id}
                    page={page}
                    isActive={false}
                    isSelected={selectedPage === page.id}
                    onMenuClick={() => {}}
                    onEditClick={() => setIsCreatePopoverOpen(true)}
                    onDeleteClick={() => setDeletingPage({ id: page.id, title: page.title })}
                    onSelect={() => setSelectedPage(page.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            {searchQuery ? (
              <>
                <FileText className="h-12 w-12 text-secondary/20 mb-3" />
                <p className="text-sm text-secondary mb-1">No pages found</p>
                <p className="text-xs text-secondary/70">Try a different search term</p>
              </>
            ) : (
              <>
                <FolderOpen className="h-12 w-12 text-secondary/20 mb-3" />
                <p className="text-sm text-secondary mb-1">No pages created yet</p>
                <button 
                  className="mt-3 btn btn-sm btn-outline"
                  onClick={() => setIsCreatePopoverOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Create First Page
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingPage && (
        <DeleteConfirmation
          pageTitle={deletingPage.title}
          onConfirm={() => handleDeletePage(deletingPage.id)}
          onCancel={() => setDeletingPage(null)}
        />
      )}
    </>
  );
}