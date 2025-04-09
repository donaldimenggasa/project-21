import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import * as Label from '@radix-ui/react-label';
import { cn } from '~/lib/utils';
import { AlertCircle } from 'lucide-react';

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
        className="text-sm font-medium text-foreground"
      >
        {label}
      </Label.Root>
      
      <div className="relative">
        <input
          {...register(name)}
          {...props}
          id={name}
          className={cn(
            "input",
            error && "border-destructive focus-visible:ring-destructive/30",
            className
          )}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>
      
      {description && !error && (
        <p className="text-sm text-secondary">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}