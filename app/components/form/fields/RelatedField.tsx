import React, { useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Link } from 'lucide-react';
import { cn } from '~/lib/utils';

interface RelatedFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
  relation: string;
  path: string[];
}

export function RelatedField({ 
  name, 
  label, 
  description, 
  required = false, 
  readonly = true, // Related fields should be readonly by default
  relation,
  path 
}: RelatedFieldProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  // Watch the source fields that this related field depends on
  const sourceValues = path.map(fieldPath => watch(fieldPath));

  // Memoize the compute function to prevent infinite loops
  const computeRelatedValue = useCallback(async () => {
    try {
      // Check if all required source values exist
      const hasAllValues = sourceValues.every(Boolean);
      if (!hasAllValues) {
        setValue(name, '');
        return;
      }

      // For demo, simulate a computed value
      const mockRelatedValue = `${relation} value for ${path.join('.')} = ${sourceValues.join('/')}`;
      setValue(name, mockRelatedValue);

    } catch (error) {
      console.error('Error computing related value:', error);
      setValue(name, '');
    }
  }, [sourceValues.join(','), name, relation, path.join(',')]); // Stable dependencies

  // Update the related field value when source fields change
  useEffect(() => {
    computeRelatedValue();
  }, [computeRelatedValue]); // Only depend on the memoized function

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Link className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          {...register(name)}
          readOnly={readonly}
          className={cn(
            "w-full pl-9 pr-4 py-2 text-sm rounded-lg transition-colors",
            readonly ? "bg-gray-100 cursor-not-allowed" : "bg-white",
            error 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          )}
        />
      </div>

      {/* Source Path Display */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Computed from:</span>
        {path.map((fieldPath, index) => (
          <React.Fragment key={fieldPath}>
            {index > 0 && <span className="text-gray-400">/</span>}
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
              {fieldPath}
            </span>
          </React.Fragment>
        ))}
      </div>

      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}