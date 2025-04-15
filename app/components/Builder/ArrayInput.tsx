import { useState, memo, useCallback } from 'react';
import { cn } from '~/lib/utils';
import { Plus, Trash2, Pencil, GripVertical } from 'lucide-react';
import { Terminal } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import * as Popover from '@radix-ui/react-popover';
import { Component } from "~/lib/types";

interface EditorProps {
  title: string;
  component: Component;
  propertyKey: string;
  componentProps: any;
  value: any;
  configProps: any;
  onChange: (value: any) => void;
}

interface TableColumn {
  id: string;
  header: string;
  accessorKey: string;
  sortable?: boolean;
  width?: number;
}

interface ColumnFormProps {
  column?: TableColumn;
  onSave: (column: TableColumn) => void;
  onCancel: () => void;
}

const ColumnForm = memo(({ column, onSave, onCancel }: ColumnFormProps) => {
  const [formData, setFormData] = useState<TableColumn>(column || {
    id: crypto.randomUUID(),
    header: '',
    accessorKey: '',
    sortable: true,
    width: 200
  });

  return (
    <div className="w-[320px] space-y-3 p-3 bg-gray-900 rounded-lg border border-indigo-800">
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-300">
          Header Text
        </label>
        <input
          type="text"
          value={formData.header}
          onChange={(e) => setFormData({ ...formData, header: e.target.value })}
          className={cn(
            "w-full px-2.5 py-1.5 text-sm rounded-md transition-colors",
            "bg-gray-900/50 border border-gray-700/50",
            "text-gray-200 placeholder-gray-500",
            "focus:outline-hidden focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
          )}
          placeholder="Column Header"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-300">
          Data Key
        </label>
        <input
          type="text"
          value={formData.accessorKey}
          onChange={(e) => setFormData({ ...formData, accessorKey: e.target.value })}
          className={cn(
            "w-full px-2.5 py-1.5 text-sm rounded-md transition-colors",
            "bg-gray-900/50 border border-gray-700/50",
            "text-gray-200 placeholder-gray-500 font-mono",
            "focus:outline-hidden focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
          )}
          placeholder="data.field"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-300">
          Width (px)
        </label>
        <input
          type="number"
          value={formData.width}
          onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
          className={cn(
            "w-full px-2.5 py-1.5 text-sm rounded-md transition-colors",
            "bg-gray-900/50 border border-gray-700/50",
            "text-gray-200 placeholder-gray-500",
            "focus:outline-hidden focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
          )}
          placeholder="200"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="sortable"
          checked={formData.sortable}
          onChange={(e) => setFormData({ ...formData, sortable: e.target.checked })}
          className="rounded border-gray-700/50 bg-gray-900/50 text-blue-500 focus:ring-blue-500/20"
        />
        <label htmlFor="sortable" className="text-sm text-gray-300">
          Enable column sorting
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            "px-2.5 py-1.5 text-xs rounded-md transition-colors",
            "text-gray-300 hover:bg-gray-700/50"
          )}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(formData)}
          className={cn(
            "px-2.5 py-1.5 text-xs rounded-md transition-colors",
            "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
          )}
        >
          {column ? 'Update Column' : 'Add Column'}
        </button>
      </div>
    </div>
  );
});

ColumnForm.displayName = 'ColumnForm';

interface SortableColumnItemProps {
  column: TableColumn;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableColumnItem = memo(({ column, onEdit, onDelete }: SortableColumnItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: column.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg',
        'border border-gray-700/50',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <button
        className="p-1 hover:bg-gray-700/50 rounded cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5 text-gray-500" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-200 truncate">{column.header}</span>
          {column.sortable && (
            <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/10 text-blue-400 rounded-full font-medium">
              Sortable
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400 truncate font-mono">
          {column.accessorKey}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-1 hover:bg-gray-700/50 rounded text-gray-400 hover:text-gray-200"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-gray-700/50 rounded text-gray-400 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
});

SortableColumnItem.displayName = 'SortableColumnItem';

export const ArrayPropertyEditor = memo(({title, componentProps, value = [], onChange }: EditorProps) => {
  const [columns, setColumns] = useState<TableColumn[]>([
    {
      id: 'personalInfo',
      header: 'Personal Information',
      accessorKey: 'personalInfo'
    },
    {
      id: 'address',
      header: 'Address Details',
      accessorKey: 'address'
    },
    {
      id: 'sales2023',
      header: '2023 Performance',
      accessorKey: 'sales2023'
    },
    {
      id: 'sales2024',
      header: '2024 Performance',
      accessorKey: 'sales2024'
    }
  ]);

  const [editingColumn, setEditingColumn] = useState<TableColumn | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over.id);
      
      const newColumns = arrayMove(columns, oldIndex, newIndex);
      setColumns(newColumns);
      onChange(newColumns);
    }
  };

  const handleSaveColumn = (column: TableColumn) => {
    let newColumns: TableColumn[];
    
    if (editingColumn) {
      newColumns = columns.map((col) => 
        col.id === editingColumn.id ? column : col
      );
    } else {
      newColumns = [...columns, column];
    }
    
    setColumns(newColumns);
    onChange(newColumns);
    setEditingColumn(null);
    setShowForm(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    const newColumns = columns.filter((col) => col.id !== columnId);
    setColumns(newColumns);
    onChange(newColumns);
  };

  const setBindable = useCallback(() => {
    onChange({
      bindable: !componentProps.bindable,
    });
  }, [componentProps, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2 px-2">
        <label className={cn('block text-sm text-gray-300 uppercase font-semibold', componentProps.bindable ? 'text-lime-400' : 'text-gray-300')}>
          {title}
        </label>
        <button className="bloc text-xs text-gray-300 cursor-pointer" onClick={setBindable}>
          <Terminal className={cn('h-5 w-5 font-bold', componentProps.bindable ? 'text-lime-400' : 'text-gray-300')}/>
        </button>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map((col) => col.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {columns.map((column) => (
              <div key={column.id} className="relative">
                <SortableColumnItem
                  column={column}
                  onEdit={() => setEditingColumn(column)}
                  onDelete={() => handleDeleteColumn(column.id)}
                />
                <Popover.Root open={editingColumn?.id === column.id} onOpenChange={(open) => !open && setEditingColumn(null)}>
                  <Popover.Anchor />
                  <Popover.Portal>
                    <Popover.Content
                      side="left"
                      align="center" 
                      sideOffset={8}
                      className="z-50 animate-in fade-in-0 zoom-in-95 relative -mt-10"
                      style={{
                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'
                      }}
                    >
                      <ColumnForm
                        column={editingColumn || undefined}
                        onSave={handleSaveColumn}
                        onCancel={() => setEditingColumn(null)}
                      />
                      <Popover.Arrow 
                        className="fill-indigo-800" 
                        width={16} 
                        height={8}
                      />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={() => setShowForm(true)}
        className={cn(
          "w-full px-4 py-2 text-sm rounded-lg transition-colors",
          "border border-dashed border-gray-700",
          "text-gray-400 hover:text-gray-200 hover:border-gray-600",
          "flex items-center justify-center gap-2"
        )}
      >
        <Plus className="h-4 w-4" />
        Add Column
      </button> 
    </div>
  );
});

ArrayPropertyEditor.displayName = 'ArrayPropertyEditor';