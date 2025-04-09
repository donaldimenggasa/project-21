import { useState, memo, useCallback, Fragment } from "react";
import { cn } from "~/lib/utils";
import { Plus, Trash2, ChevronRight, GripVertical, X } from "lucide-react";
import { Terminal } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Component } from "~/lib/types";
import { CodeEditor } from "../codeEditor";

interface EditorProps {
  title: string;
  component: Component;
  propertyKey: string;
  componentProps: any;
  value: any;
  configProps: any;
  onChange: (value: any) => void;
}

interface PieColorConfig {
  id: string;
  name: string;
  fill: string;
}

interface PieColorFormProps {
  color?: PieColorConfig;
  onSave: (color: PieColorConfig) => void;
  onCancel: () => void;
}

interface SortablePieColorItemProps {
  color: PieColorConfig;
  onEdit: () => void;
  onDelete: () => void;
  isSelected: boolean;
  onClick: () => void;
}

const SortablePieColorItem = memo(
  ({ color, onEdit, onDelete, isSelected, onClick }: SortablePieColorItemProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: color.id });

    const style = {
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
      transition,
      zIndex: isDragging ? 1 : undefined,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer",
          "border border-transparent",
          isSelected ? "bg-gray-800" : "hover:bg-gray-800/50",
          isDragging && "opacity-50 shadow-lg"
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
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color.fill }}
            />
            <span className="text-sm font-medium text-gray-200 truncate">
              {color.name}
            </span>
          </div>
          <div className="text-xs text-gray-500 font-mono truncate">
            {color.fill}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-gray-700/50 rounded text-gray-400 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    );
  }
);

SortablePieColorItem.displayName = "SortablePieColorItem";

const PieColorForm = memo(({ color, onSave, onCancel }: PieColorFormProps) => {
  const [formData, setFormData] = useState<PieColorConfig>(color || {
    id: crypto.randomUUID(),
    name: '',
    fill: '#0088FE'
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-200">
            {color ? 'Edit Color' : 'Add New Color'}
          </h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Segment Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(
                "w-full px-2.5 py-1.5 text-sm rounded-md transition-colors",
                "bg-gray-800 border border-gray-700",
                "text-gray-200 placeholder-gray-500",
                "focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
              )}
              placeholder="Group A"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Fill Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.fill}
                onChange={(e) => setFormData({ ...formData, fill: e.target.value })}
                className="w-12 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.fill}
                onChange={(e) => setFormData({ ...formData, fill: e.target.value })}
                className={cn(
                  "flex-1 px-2.5 py-1.5 text-sm rounded-md transition-colors",
                  "bg-gray-800 border border-gray-700",
                  "text-gray-200 placeholder-gray-500 font-mono",
                  "focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                "text-gray-300 hover:bg-gray-700"
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(formData)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                "bg-blue-500 hover:bg-blue-600 text-white"
              )}
            >
              {color ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PieColorForm.displayName = "PieColorForm";

function NoBindableConfig({ value, onChange }: any) {
  const [selectedColor, setSelectedColor] = useState<PieColorConfig | null>(null);
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
      const oldIndex = value.findIndex((color) => color.id === active.id);
      const newIndex = value.findIndex((color) => color.id === over.id);

      const newColors = arrayMove(value, oldIndex, newIndex);
      onChange?.({ value: newColors });
    }
  };

  const handleSaveColor = (color: PieColorConfig) => {
    let newColors: PieColorConfig[];
    
    if (selectedColor) {
      newColors = value.map((c) => 
        c.id === selectedColor.id ? color : c
      );
    } else {
      newColors = [...value, color];
    }
    
    onChange?.({ value: newColors });
    setSelectedColor(null);
    setShowForm(false);
  };

  const handleDeleteColor = (colorId: string) => {
    const newColors = value.filter((color) => color.id !== colorId);
    onChange?.({ value: newColors });
    if (selectedColor?.id === colorId) {
      setSelectedColor(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-medium text-gray-300">Pie Segments</h3>
        <button
          onClick={() => {
            setSelectedColor(null);
            setShowForm(true);
          }}
          className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-gray-200"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value.map((color) => color.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {value.map((color) => (
                <SortablePieColorItem
                  key={color.id}
                  color={color}
                  isSelected={selectedColor?.id === color.id}
                  onClick={() => {
                    setSelectedColor(color);
                    setShowForm(true);
                  }}
                  onEdit={() => {
                    setSelectedColor(color);
                    setShowForm(true);
                  }}
                  onDelete={() => handleDeleteColor(color.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {value.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No colors defined</p>
            <button
              onClick={() => {
                setSelectedColor(null);
                setShowForm(true);
              }}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Add your first color
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <PieColorForm
          color={selectedColor || undefined}
          onSave={handleSaveColor}
          onCancel={() => {
            setSelectedColor(null);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

export const PieSeriesEditor = memo(
  ({ title, componentProps, configProps, onChange }: EditorProps) => {
    const setBindable = useCallback(() => {
      onChange({
        bindable: !componentProps.bindable,
      });
    }, [componentProps, onChange]);

    const onChangeBindable = useCallback(
      (value: string) => {
        onChange({
          bindValue: value,
        });
      },
      [onChange]
    );

    const onChangeValue = useCallback(
      (value: any) => {
        onChange(value);
      },
      [onChange]
    );

    return (
      <Fragment>
        <div className="flex items-center justify-between mb-2 px-2">
          <label
            className={cn(
              "block text-sm text-gray-300 uppercase font-semibold",
              componentProps.bindable ? "text-lime-400" : "text-gray-300"
            )}
          >
            {title}
          </label>
          <button
            className="bloc text-xs text-gray-300 cursor-pointer"
            onClick={setBindable}
          >
            <Terminal
              className={cn(
                "h-5 w-5 font-bold",
                componentProps.bindable ? "text-lime-400" : "text-gray-300"
              )}
            />
          </button>
        </div>

        {!componentProps?.bindable ? (
          <NoBindableConfig
            value={
              componentProps.value !== null
                ? componentProps.value
                : configProps.defaultValue
            }
            onChange={onChangeValue}
          />
        ) : (
          <CodeEditor
            value={componentProps.bindValue}
            onChange={onChangeBindable}
          />
        )}
      </Fragment>
    );
  }
);

PieSeriesEditor.displayName = "PieSeriesEditor";