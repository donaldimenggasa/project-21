import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as Popover from '@radix-ui/react-popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '~/components/ui/Calendar';
import { cn } from '~/lib/utils';

interface DateFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
}

export function DateField({ name, label, description, required, readonly }: DateFieldProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const value = watch(name);

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={readonly}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left text-sm",
              readonly ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:bg-gray-50",
              error ? "border-red-300" : "border-gray-300",
              "focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            )}
          >
            <span className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              {value ? format(new Date(value), 'PPP') : 'Pick a date'}
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            className="z-50 w-auto p-0 bg-white rounded-lg shadow-lg border border-gray-200"
          >
            <Calendar
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={(date) => setValue(name, date?.toISOString())}
              disabled={readonly}
              initialFocus
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <input type="hidden" {...register(name)} />
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}