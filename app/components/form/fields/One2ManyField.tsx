import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { List, Plus, Trash2, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { cn } from '~/lib/utils';

interface One2ManyFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
  relation: string;
  inverse_field: string;
}

interface LineItem {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

export function One2ManyField({ 
  name, 
  label, 
  description, 
  required, 
  readonly, 
  relation, 
  inverse_field 
}: One2ManyFieldProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Get form values with default empty array
  const items = watch(name) || [];

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
    };
    setValue(name, [...items, newItem]);
    setExpandedItems(prev => [...prev, newItem.id]);
  };

  const removeItem = (itemId: string) => {
    setValue(name, items.filter((item: LineItem) => item.id !== itemId));
    setExpandedItems(prev => prev.filter(id => id !== itemId));
  };

  const updateItem = (itemId: string, field: string, value: any) => {
    setValue(
      name,
      items.map((item: LineItem) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {!readonly && (
          <button
            type="button"
            onClick={addItem}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm",
              "bg-blue-50 text-blue-700 hover:bg-blue-100",
              "transition-colors"
            )}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item: LineItem, index: number) => {
          const isExpanded = expandedItems.includes(item.id);
          
          return (
            <div
              key={item.id}
              className={cn(
                "border rounded-lg overflow-hidden transition-colors",
                isExpanded ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-white"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-2 p-3">
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="p-1 hover:bg-blue-100 rounded-md transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-blue-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium truncate">
                      {item.name || `Item ${index + 1}`}
                    </span>
                  </div>
                  {item.description && !isExpanded && (
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  )}
                </div>

                {!readonly && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="p-1.5 hover:bg-blue-100 rounded-md text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 hover:bg-red-100 rounded-md text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-3 border-t border-blue-200 space-y-3 bg-white">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">
                      Name
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      disabled={readonly}
                      className={cn(
                        "w-full px-3 py-2 text-sm rounded-md transition-colors",
                        readonly ? "bg-gray-100" : "bg-white",
                        "border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-600">
                      Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      disabled={readonly}
                      rows={3}
                      className={cn(
                        "w-full px-3 py-2 text-sm rounded-md transition-colors",
                        readonly ? "bg-gray-100" : "bg-white",
                        "border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
            <List className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No items added yet</p>
            {!readonly && (
              <button
                type="button"
                onClick={addItem}
                className="mt-2 text-sm text-blue-500 hover:text-blue-600"
              >
                Add your first item
              </button>
            )}
          </div>
        )}
      </div>

      <input type="hidden" {...register(name)} />
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}