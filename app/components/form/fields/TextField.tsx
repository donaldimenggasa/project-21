import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import * as Label from '@radix-ui/react-label';
import { cn } from '~/lib/utils';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  description?: string;
}

export function TextField({ name, label, description, className, ...props }: TextFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <Label.Root
        htmlFor={name}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </Label.Root>
      
      <input
        {...register(name)}
        {...props}
        id={name}
        className={cn(
          "w-full px-3 py-2 rounded-lg transition-colors",
          "border border-gray-300",
          "outline-none",
          error 
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
            : "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      />
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}