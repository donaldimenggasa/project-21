import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '~/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  description?: string;
  placeholder?: string;
}

export function SelectField({ name, label, options, description, placeholder = "Select an option..." }: SelectFieldProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const value = watch(name);
  const error = errors[name]?.message as string | undefined;

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="space-y-2">
      <Label.Root
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </Label.Root>

      <Select.Root
        value={value}
        onValueChange={(value) => setValue(name, value, { shouldValidate: true })}
      >
        <Select.Trigger
          className={cn(
            "w-full flex items-center justify-between",
            "px-3 py-2 rounded-lg transition-colors",
            "border border-gray-300",
            "outline-none",
            "bg-white",
            error 
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
              : "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Select.Value>
            {selectedOption ? selectedOption.label : placeholder}
          </Select.Value>
          <Select.Icon>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            className="z-50 min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 animate-in fade-in-0 zoom-in-95"
          >
            <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-gray-700 cursor-default">
              <ChevronDown className="h-4 w-4 rotate-180" />
            </Select.ScrollUpButton>
            
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "relative flex items-center px-8 py-2",
                    "text-sm text-gray-700",
                    "rounded-md",
                    "user-select-none",
                    "data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900",
                    "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
                    "cursor-pointer outline-none"
                  )}
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>

            <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-gray-700 cursor-default">
              <ChevronDown className="h-4 w-4" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}