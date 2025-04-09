import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import * as Label from '@radix-ui/react-label';
import { cn } from '~/lib/utils';
import { Check, ChevronDown, AlertCircle } from 'lucide-react';

interface ColorFieldProps {
  name: string;
  label: string;
  description?: string;
}

const colors = [
  { value: '#64748b', name: 'Slate' },
  { value: '#6b7280', name: 'Gray' },
  { value: '#71717a', name: 'Zinc' },
  { value: '#737373', name: 'Neutral' },
  { value: '#78716c', name: 'Stone' },
  { value: '#ef4444', name: 'Red' },
  { value: '#f97316', name: 'Orange' },
  { value: '#f59e0b', name: 'Amber' },
  { value: '#eab308', name: 'Yellow' },
  { value: '#84cc16', name: 'Lime' },
  { value: '#22c55e', name: 'Green' },
  { value: '#10b981', name: 'Emerald' },
  { value: '#14b8a6', name: 'Teal' },
  { value: '#06b6d4', name: 'Cyan' },
  { value: '#0ea5e9', name: 'Sky' },
  { value: '#3b82f6', name: 'Blue' },
  { value: '#6366f1', name: 'Indigo' },
  { value: '#8b5cf6', name: 'Violet' },
  { value: '#a855f7', name: 'Purple' },
  { value: '#d946ef', name: 'Fuchsia' },
  { value: '#ec4899', name: 'Pink' },
  { value: '#f43f5e', name: 'Rose' }
];

export function ColorField({ name, label, description }: ColorFieldProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const value = watch(name);
  const error = errors[name]?.message as string | undefined;

  const selectedColor = colors.find(c => c.value === value);

  const handleColorSelect = (colorValue: string) => {
    setValue(name, colorValue, { shouldValidate: true });
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label.Root className="text-sm font-medium text-foreground">
        {label}
      </Label.Root>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between",
            "px-3 py-2 rounded-md transition-colors",
            "border",
            error 
              ? "border-destructive focus-visible:ring-destructive/30" 
              : "border-border focus-visible:ring-primary/30",
            "bg-input",
            "focus-visible:outline-none focus-visible:ring-2"
          )}
        >
          <div className="flex items-center gap-2">
            {value && (
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: value }}
              />
            )}
            <span className="text-sm">{selectedColor?.name || 'Select a color...'}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-secondary" />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-card rounded-md shadow-lg border border-border">
            <div className="p-2 grid grid-cols-8 gap-1">
              {colors.map(({ value: colorValue, name }) => (
                <button
                  key={colorValue}
                  type="button"
                  onClick={() => handleColorSelect(colorValue)}
                  className="group relative aspect-square rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  title={name}
                >
                  <div
                    className="w-full h-full rounded-md border border-border transition-transform group-hover:scale-110"
                    style={{ backgroundColor: colorValue }}
                  />
                  {value === colorValue && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="p-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setShowCustomPicker(!showCustomPicker);
                }}
                className="w-full text-left text-sm text-secondary hover:text-foreground px-2 py-1 rounded hover:bg-background"
              >
                Custom color
              </button>
              {showCustomPicker && (
                <div className="mt-2 px-2">
                  <input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {description && !error && (
        <p className="text-sm text-secondary">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}

      <input type="hidden" {...register(name)} />
    </div>
  );
}