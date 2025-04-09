import React, { useState, useCallback, memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '~/lib/utils';
import { useBindings } from '~/lib/bindingContext';
import { Link2, X, Plus, Trash2, Check, Pencil, GripVertical } from 'lucide-react';
import { useAppDispatch } from '~/hooks/useAppDispatch';
import { setComponent } from '~/store/slices/uiSlice';
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

interface EditorProps {
  component: any;
  propertyKey: string;
  property: any;
  value: any;
  onChange: (value: any) => void;
  onBindingChange?: (binding: string | null) => void;
  binding?: string | null;
}

const inputBaseClasses = cn(
  "w-full px-3 py-2 text-sm rounded-lg transition-colors",
  "bg-gray-800 border border-gray-700",
  "text-gray-200 placeholder-gray-500",
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40"
);

const buttonBaseClasses = cn(
  "p-2 rounded-lg transition-colors",
  "hover:bg-gray-700/50",
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
);

const bindingInputClasses = cn(
  inputBaseClasses,
  "bg-blue-500/5 border-blue-500/20",
  "font-mono text-blue-400"
);

const StringEditor: React.FC<EditorProps> = ({ property, value, onChange, onBindingChange, binding }) => {
  return (
    <div className="relative">
      pukieeee
      {binding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={binding}
            onChange={(e) => onBindingChange?.(e.target.value)}
            className={bindingInputClasses}
            placeholder="{{component.property}}"
          />
          <button
            onClick={() => onBindingChange?.(null)}
            className={cn(buttonBaseClasses, "text-gray-400")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={value || property.defaultValue}
          onChange={(e) => onChange(e.target.value)}
          className={inputBaseClasses}
          placeholder={`Enter ${property.displayName.toLowerCase()}...`}
        />
      )}
    </div>
  );
};


const SelectEditor: React.FC<EditorProps> = ({ property, value, onChange, onBindingChange, binding }) => {
  const [showBinding, setShowBinding] = useState(!!binding);

  return (
    <div className="relative">
      {showBinding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={binding || ''}
            onChange={(e) => onBindingChange?.(e.target.value)}
            className={bindingInputClasses}
            placeholder="{{component.property}}"
          />
          <button
            onClick={() => {
              setShowBinding(false);
              onBindingChange?.(null);
            }}
            className={cn(buttonBaseClasses, "text-gray-400")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <select
            value={value || property.defaultValue}
            onChange={(e) => onChange(e.target.value)}
            className={inputBaseClasses}
          >
            {property.options?.map((option: string) => (
              <option key={option} value={option} className="bg-gray-800">
                {option}
              </option>
            ))}
          </select>
          {property.bindable && (
            <button
              onClick={() => setShowBinding(true)}
              className={cn(buttonBaseClasses, "text-blue-400")}
              title="Add binding"
            >
              <Link2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const ColorEditor: React.FC<EditorProps> = ({ property, value, onChange, onBindingChange, binding }) => {
  const [showBinding, setShowBinding] = useState(!!binding);

  if (showBinding) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={binding || ''}
          onChange={(e) => onBindingChange?.(e.target.value)}
          className={bindingInputClasses}
          placeholder="{{component.property}}"
        />
        <button
          onClick={() => {
            setShowBinding(false);
            onBindingChange?.(null);
          }}
          className={cn(buttonBaseClasses, "text-gray-400")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="flex flex-1 space-x-2">
        <input
          type="color"
          value={value || property.defaultValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 p-1 rounded-lg bg-gray-800 border border-gray-700"
        />
        <input
          type="text"
          value={value || property.defaultValue}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputBaseClasses, "font-mono")}
          pattern="^#[0-9A-Fa-f]{6}$"
          placeholder="#000000"
        />
      </div>
      {property.bindable && (
        <button
          onClick={() => setShowBinding(true)}
          className={cn(buttonBaseClasses, "text-blue-400")}
          title="Add binding"
        >
          <Link2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const NumberEditor: React.FC<EditorProps> = ({ property, value, onChange, onBindingChange, binding }) => {
  const [showBinding, setShowBinding] = useState(!!binding);

  return (
    <div className="relative">
      {showBinding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={binding || ''}
            onChange={(e) => onBindingChange?.(e.target.value)}
            className={bindingInputClasses}
            placeholder="{{component.property}}"
          />
          <button
            onClick={() => {
              setShowBinding(false);
              onBindingChange?.(null);
            }}
            className={cn(buttonBaseClasses, "text-gray-400")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="number"
            value={value || property.defaultValue}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={inputBaseClasses}
          />
          {property.bindable && (
            <button
              onClick={() => setShowBinding(true)}
              className={cn(buttonBaseClasses, "text-blue-400")}
              title="Add binding"
            >
              <Link2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const BooleanEditor: React.FC<EditorProps> = ({ property, value, onChange }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={value || false}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500/20"
      />
    </div>
  );
};

interface TableColumn {
  id: string;
  header: string;
  accessorKey: string;
  sortable?: boolean;
  width?: number;
}

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
            "focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
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
            "focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
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
            "focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
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

const TableColumnEditor = memo(({ value = [], onChange }: EditorProps) => {
  const [columns, setColumns] = useState<TableColumn[]>(value);
  const [editingColumn, setEditingColumn] = useState<TableColumn | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  return (
    <div className="space-y-4">
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

      {showForm && (
        <div className="mt-4">
          <ColumnForm
            onSave={handleSaveColumn}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
});

TableColumnEditor.displayName = 'TableColumnEditor';

const EditorComponents = {
  string: StringEditor,
  select: SelectEditor,
  color: ColorEditor,
  number: NumberEditor,
  array: TableColumnEditor,
  boolean: BooleanEditor
};

interface PropertyEditorProps {
  component: any;
  config: any;
  sectionProperties: [string, any][];
}




export const PropertyEditor: React.FC<PropertyEditorProps> = ({ component, config, sectionProperties }) => {
  const dispatch = useAppDispatch();
  const bindingManager = useBindings();

  const updateProperty = useCallback((key: string, value: any, binding: string | null = null) => {
    const updatedComponent = {
      ...component,
      props: {
        ...component.props
      }
    };
    
    if (binding) {
      updatedComponent.bindings = {
        ...updatedComponent.bindings,
        [key]: binding
      };
      
      if (key === 'children') {
        updatedComponent.props = {
          ...updatedComponent.props,
          [key]: ''
        };
      }
    } else {
      if (updatedComponent.bindings) {
        const { [key]: _, ...remainingBindings } = updatedComponent.bindings;
        updatedComponent.bindings = remainingBindings;
      }
      
      updatedComponent.props = {
        ...updatedComponent.props,
        [key]: key === 'children' ? (value ?? '') : value
      };
    }

    dispatch(setComponent(updatedComponent));
  }, [component, dispatch]);

  return (
    <div className="space-y-4">
      {sectionProperties.map(([key, prop]) => {
        if (prop.condition && !prop.condition(component.props)) {
          return null;
        }

        const editorType = key === 'className' ? 'string' : 
                          key === 'style' ? 'string' : 
                          prop.type;
        
        const Editor = EditorComponents[editorType as keyof typeof EditorComponents];
        if (!Editor) return null;

        const binding = component.bindings?.[key];

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-300">
                {prop.displayName}
              </label>
              {prop.bindable && (
                <button
                  onClick={() => {
                    const currentBinding = component.bindings?.[key];
                    if (currentBinding) {
                      updateProperty(key, component.props[key]);
                    } else {
                      updateProperty(key, undefined, '{{}}');
                    }
                  }}
                  className={cn(
                    buttonBaseClasses,
                    "text-blue-400",
                    binding && "bg-blue-500/10"
                  )}
                  title={binding ? "Remove binding" : "Add binding"}
                >
                  <Link2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <Editor
              component={component}
              propertyKey={key}
              property={prop}
              value={component.props[key]}
              onChange={(value) => updateProperty(key, value)}
              onBindingChange={(binding) => updateProperty(key, undefined, binding)}
              binding={binding}
            />
          </div>
        );
      })}
    </div>
  );
};