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

interface LineConfig {
  id: string;
  dataKey: string;
  name: string;
  stroke: string;
  fill: string;
  type: string;
  activeDot: {
    r: number;
  };
  dot: boolean;
  strokeWidth: number;
}

interface LineFormProps {
  line?: LineConfig;
  onSave: (line: LineConfig) => void;
  onCancel: () => void;
}

interface SortableLineItemProps {
  line: LineConfig;
  onEdit: () => void;
  onDelete: () => void;
  isSelected: boolean;
  onClick: () => void;
}

const SortableLineItem = memo(
  ({ line, onEdit, onDelete, isSelected, onClick }: SortableLineItemProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: line.id });

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
              style={{ backgroundColor: line.stroke }}
            />
            <span className="text-sm font-medium text-gray-200 truncate">
              {line.name}
            </span>
          </div>
          <div className="text-xs text-gray-500 font-mono truncate">
            {line.dataKey}
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

SortableLineItem.displayName = "SortableLineItem";

const LineForm = memo(({ line, onSave, onCancel }: LineFormProps) => {
  const [formData, setFormData] = useState<LineConfig>(line || {
    id: crypto.randomUUID(),
    dataKey: '',
    name: '',
    stroke: '#8884d8',
    fill: '#8884d8',
    type: 'monotone',
    activeDot: {
      r: 8
    },
    dot: true,
    strokeWidth: 2
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-200">
            {line ? 'Edit Line Series' : 'Add New Line Series'}
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
              Series Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(
                "w-full px-2.5 py-1.5 text-sm rounded-md transition-colors",
                "bg-gray-800 border border-gray-700",
                "text-gray-200 placeholder-gray-500",
                "focus:outline-hidden focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
              )}
              placeholder="Series 1"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Data Key
            </label>
            <input
              type="text"
              value={formData.dataKey}
              onChange={(e) => setFormData({ ...formData, dataKey: e.target.value })}
              className={cn(
                "w-full px-2.5 py-1.5 text-sm rounded-md transition-colors",
                "bg-gray-800 border border-gray-700",
                "text-gray-200 placeholder-gray-500 font-mono",
                "focus:outline-hidden focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
              )}
              placeholder="value1"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Line Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={cn(
                "w-full px-2.5 py-1.5 text-sm rounded-md transition-colors",
                "bg-gray-800 border border-gray-700",
                "text-gray-200",
                "focus:outline-hidden focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
              )}
            >
              <option value="monotone">Monotone</option>
              <option value="linear">Linear</option>
              <option value="step">Step</option>
              <option value="basis">Basis</option>
              <option value="natural">Natural</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Line Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.stroke}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  stroke: e.target.value,
                  fill: e.target.value // Update fill to match stroke
                })}
                className="w-12 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.stroke}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  stroke: e.target.value,
                  fill: e.target.value // Update fill to match stroke
                })}
                className={cn(
                  "flex-1 px-2.5 py-1.5 text-sm rounded-md transition-colors",
                  "bg-gray-800 border border-gray-700",
                  "text-gray-200 placeholder-gray-500 font-mono",
                  "focus:outline-hidden focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Line Width
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.strokeWidth}
              onChange={(e) => setFormData({ ...formData, strokeWidth: parseInt(e.target.value) })}
              className={cn(
                "w-full px-2.5 py-1.5 text-sm rounded-md transition-colors",
                "bg-gray-800 border border-gray-700",
                "text-gray-200 placeholder-gray-500",
                "focus:outline-hidden focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Active Dot Size
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.activeDot.r}
              onChange={(e) => setFormData({ 
                ...formData, 
                activeDot: { ...formData.activeDot, r: parseInt(e.target.value) } 
              })}
              className={cn(
                "w-full px-2.5 py-1.5 text-sm rounded-md transition-colors",
                "bg-gray-800 border border-gray-700",
                "text-gray-200 placeholder-gray-500",
                "focus:outline-hidden focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30"
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showDots"
              checked={formData.dot}
              onChange={(e) => setFormData({ ...formData, dot: e.target.checked })}
              className="rounded border-gray-700 bg-gray-800 text-blue-500"
            />
            <label htmlFor="showDots" className="text-sm text-gray-300">
              Show Dots
            </label>
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
              {line ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

LineForm.displayName = "LineForm";

function NoBindableConfig({ value, onChange }: any) {
  const [selectedLine, setSelectedLine] = useState<LineConfig | null>(null);
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
      const oldIndex = value.findIndex((line) => line.id === active.id);
      const newIndex = value.findIndex((line) => line.id === over.id);

      const newLines = arrayMove(value, oldIndex, newIndex);
      onChange?.({ value: newLines });
    }
  };

  const handleSaveLine = (line: LineConfig) => {
    let newLines: LineConfig[];
    
    if (selectedLine) {
      newLines = value.map((l) => 
        l.id === selectedLine.id ? line : l
      );
    } else {
      newLines = [...value, line];
    }
    
    onChange?.({ value: newLines });
    setSelectedLine(null);
    setShowForm(false);
  };

  const handleDeleteLine = (lineId: string) => {
    const newLines = value.filter((line) => line.id !== lineId);
    onChange?.({ value: newLines });
    if (selectedLine?.id === lineId) {
      setSelectedLine(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-medium text-gray-300">Line Series</h3>
        <button
          onClick={() => {
            setSelectedLine(null);
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
            items={value.map((line) => line.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {value.map((line) => (
                <SortableLineItem
                  key={line.id}
                  line={line}
                  isSelected={selectedLine?.id === line.id}
                  onClick={() => {
                    setSelectedLine(line);
                    setShowForm(true);
                  }}
                  onEdit={() => {
                    setSelectedLine(line);
                    setShowForm(true);
                  }}
                  onDelete={() => handleDeleteLine(line.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {value.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No line series added</p>
            <button
              onClick={() => {
                setSelectedLine(null);
                setShowForm(true);
              }}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Add your first line series
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <LineForm
          line={selectedLine || undefined}
          onSave={handleSaveLine}
          onCancel={() => {
            setSelectedLine(null);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

export const LineSeriesEditor = memo(
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

LineSeriesEditor.displayName = "LineSeriesEditor";