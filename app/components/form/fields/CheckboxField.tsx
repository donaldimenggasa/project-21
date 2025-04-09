import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';
import { Check } from 'lucide-react';
import { cn } from '~/lib/utils';

interface CheckboxFieldProps {
  name: string;
  label: string;
  description?: string;
}

export function CheckboxField({ name, label, description }: CheckboxFieldProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const value = watch(name);
  const error = errors[name]?.message as string | undefined;

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox.Root
          checked={value}
          onCheckedChange={(checked) => setValue(name, checked)}
          className={cn(
            "h-4 w-4 rounded",
            "border border-gray-300",
            "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500"
          )}
        >
          <Checkbox.Indicator>
            <Check className="h-3 w-3" />
          </Checkbox.Indicator>
        </Checkbox.Root>

        <Label.Root
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </Label.Root>
      </div>

      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}