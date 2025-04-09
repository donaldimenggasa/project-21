import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import * as Switch from '@radix-ui/react-switch';
import * as Label from '@radix-ui/react-label';
import { cn } from '~/lib/utils';

interface SwitchFieldProps {
  name: string;
  label: string;
  description?: string;
}

export function SwitchField({ name, label, description }: SwitchFieldProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const value = watch(name);
  const error = errors[name]?.message as string | undefined;

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Switch.Root
          checked={value}
          onCheckedChange={(checked) => setValue(name, checked)}
          className={cn(
            "w-11 h-6 rounded-full",
            "bg-gray-200 data-[state=checked]:bg-blue-500",
            "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "bg-red-100 data-[state=checked]:bg-red-500"
          )}
        >
          <Switch.Thumb
            className={cn(
              "block w-5 h-5 rounded-full bg-white",
              "transition-transform duration-100",
              "translate-x-0.5 data-[state=checked]:translate-x-[22px]"
            )}
          />
        </Switch.Root>

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