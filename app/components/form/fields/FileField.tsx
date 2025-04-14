import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Upload } from 'lucide-react';

interface FileFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
  accept?: string;
}

export function FileField({ name, label, description, required, readonly, accept }: FileFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <label
          htmlFor={name}
          className={`
            flex justify-center items-center px-6 py-4 border-2 border-dashed rounded-lg
            ${readonly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              {' '}or drag and drop
            </div>
          </div>
          <input
            type="file"
            id={name}
            {...register(name)}
            disabled={readonly}
            accept={accept}
            className="sr-only"
          />
        </label>
      </div>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}