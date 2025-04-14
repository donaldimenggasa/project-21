import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Image } from 'lucide-react';

interface ImageFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
  accept?: string;
  width?: number;
  height?: number;
}

export function ImageField({ name, label, description, required, readonly, accept = "image/*", width, height }: ImageFieldProps) {
  const { register, formState: { errors }, watch } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const file = watch(name);

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
          style={{ width, height }}
        >
          <div className="space-y-1 text-center">
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              {' '}or drag and drop
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
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