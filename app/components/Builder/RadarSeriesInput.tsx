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

interface RadarSeriesConfig {
  id: string;
  dataKey: string;
  name: string;
  stroke: string;
  fill: string;
  fillOpacity: number;
  dot: boolean;
}

interface RadarSeriesFormProps {
  series?: RadarSeriesConfig;
  onSave: (series: RadarSeriesConfig) => void;
  onCancel: () => void;
}

interface SortableRadarSeriesItemProps {
  series: RadarSeriesConfig;
  onEdit: () => void;
  onDelete: () => void;
  isSelected: boolean;
  onClick: () => void;
}

const SortableRadarSeriesItem = memo(
  ({ series, onEdit, onDelete, isSelected, onClick }: SortableRadarSeriesItemProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: series.id });

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
              style={{ backgroundColor: series.stroke }}
            />
            <span className="text-sm font-medium text-gray-200 truncate">
              {series.name}
            </span>
          </div>
          <div className="text-xs text-gray-500 font-mono truncate">
            {series.dataKey}
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

SortableRadarSeriesItem.displayName = "SortableRadarSeriesItem";

const RadarSeriesForm = memo(({ series, onSave, onCancel }: RadarSeriesFormProps) => {
  const [formData, setFormData] = useState<RadarSeriesConfig>(series || {
    id: crypto.randomUUID(),
    dataKey: '',
    name: '',
    stroke: '#8884d8',
    fill: '#8884d8',
    fillOpacity: 0.6,
    dot: true
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-200">
            {series ? 'Edit Radar Series' : 'Add New Radar Series'}
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
              placeholder="Mike"
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
              placeholder="A"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-300">
              Stroke Color
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
              Fill Opacity
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.fillOpacity}
                onChange={(e) => setFormData({ ...formData, fillOpacity: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-300 w-10 text-right">
                {formData.fillOpacity.toFixed(1)}
              </span>
            </div>
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
              {series ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

RadarSeriesForm.displayName = "RadarSeriesForm";

function NoBindableConfig({ value, onChange }: any) {
  const [selectedSeries, setSelectedSeries] = useState<RadarSeriesConfig | null>(null);
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
      const oldIndex = value.findIndex((series) => series.id === active.id);
      const newIndex = value.findIndex((series) => series.id === over.id);

      const newSeries = arrayMove(value, oldIndex, newIndex);
      onChange?.({ value: newSeries });
    }
  };

  const handleSaveSeries = (series: RadarSeriesConfig) => {
    let newSeries: RadarSeriesConfig[];
    
    if (selectedSeries) {
      newSeries = value.map((s) => 
        s.id === selectedSeries.id ? series : s
      );
    } else {
      newSeries = [...value, series];
    }
    
    onChange?.({ value: newSeries });
    setSelectedSeries(null);
    setShowForm(false);
  };

  const handleDeleteSeries = (seriesId: string) => {
    const newSeries = value.filter((series) => series.id !== seriesId);
    onChange?.({ value: newSeries });
    if (selectedSeries?.id === seriesId) {
      setSelectedSeries(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-medium text-gray-300">Radar Series</h3>
        <button
          onClick={() => {
            setSelectedSeries(null);
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
            items={value.map((series) => series.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {value.map((series) => (
                <SortableRadarSeriesItem
                  key={series.id}
                  series={series}
                  isSelected={selectedSeries?.id === series.id}
                  onClick={() => {
                    setSelectedSeries(series);
                    setShowForm(true);
                  }}
                  onEdit={() => {
                    setSelectedSeries(series);
                    setShowForm(true);
                  }}
                  onDelete={() => handleDeleteSeries(series.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {value.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No radar series added</p>
            <button
              onClick={() => {
                setSelectedSeries(null);
                setShowForm(true);
              }}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Add your first radar series
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <RadarSeriesForm
          series={selectedSeries || undefined}
          onSave={handleSaveSeries}
          onCancel={() => {
            setSelectedSeries(null);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

export const RadarSeriesEditor = memo(
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

RadarSeriesEditor.displayName = "RadarSeriesEditor";