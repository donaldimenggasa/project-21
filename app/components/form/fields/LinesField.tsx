import React from 'react';
import { useFormContext } from 'react-hook-form';
import { List, Plus, Minus } from 'lucide-react';

interface LinesFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
}

export function LinesField({ name, label, description, required, readonly }: LinesFieldProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const lines = watch(name) || [''];

  const addLine = () => {
    setValue(name, [...lines, '']);
  };

  const removeLine = (index: number) => {
    setValue(name, lines.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {lines.map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <List className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                {...register(`${name}.${index}`)}
                disabled={readonly}
                className={`
                  block w-full pl-10 sm:text-sm rounded-lg
                  ${readonly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                  ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                `}
              />
            </div>
            {!readonly && lines.length > 1 && (
              <button
                type="button"
                onClick={() => removeLine(index)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Minus className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
        {!readonly && (
          <button
            type="button"
            onClick={addLine}
            className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-xs text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Line
          </button>
        )}
      </div>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}