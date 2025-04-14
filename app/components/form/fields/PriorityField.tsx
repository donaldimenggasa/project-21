import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Flag } from 'lucide-react';

interface PriorityFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
  levels?: number;
}

export function PriorityField({ name, label, description, required, readonly, levels = 3 }: PriorityFieldProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const value = watch(name) || 0;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex items-center space-x-2">
        {Array.from({ length: levels }).map((_, index) => (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => setValue(name, index + 1)}
            className={`
              p-2 rounded-lg transition-colors
              ${readonly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${value >= index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}
            `}
          >
            <Flag className="h-5 w-5" />
          </button>
        ))}
        <input type="hidden" {...register(name)} />
      </div>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}