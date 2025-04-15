import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Hash, Minus, Plus } from 'lucide-react';
import { cn } from '~/lib/utils';

interface NumberFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({ 
  name, 
  label, 
  description, 
  required, 
  readonly, 
  min = 0, 
  max = 100, 
  step = 1 
}: NumberFieldProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const value = watch(name) || min;

  const increment = () => {
    const newValue = Math.min(value + step, max);
    setValue(name, newValue);
  };

  const decrement = () => {
    const newValue = Math.max(value - step, min);
    setValue(name, newValue);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Hash className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="number"
          {...register(name)}
          min={min}
          max={max}
          step={step}
          disabled={readonly}
          className={cn(
            "w-full pl-10 pr-20 py-2 text-sm rounded-lg transition-colors",
            readonly ? "bg-gray-100 cursor-not-allowed" : "bg-white",
            error 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          )}
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          <button
            type="button"
            onClick={decrement}
            disabled={readonly || value <= min}
            className={cn(
              "p-1.5 rounded transition-colors",
              readonly || value <= min 
                ? "text-gray-300 cursor-not-allowed" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            )}
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={increment}
            disabled={readonly || value >= max}
            className={cn(
              "p-1.5 rounded transition-colors",
              readonly || value >= max 
                ? "text-gray-300 cursor-not-allowed" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            )}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}