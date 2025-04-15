import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as Popover from '@radix-ui/react-popover';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '~/components/ui/Calendar';
import { cn } from '~/lib/utils';

interface DateTimeFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
}

export function DateTimeField({ name, label, description, required, readonly }: DateTimeFieldProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const value = watch(name);

  const [date, time] = value ? value.split('T') : ['', ''];

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    const currentTime = time || '00:00';
    setValue(name, `${format(newDate, 'yyyy-MM-dd')}T${currentTime}`);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    const currentDate = date || format(new Date(), 'yyyy-MM-dd');
    setValue(name, `${currentDate}T${newTime}`);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex gap-2">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              disabled={readonly}
              className={cn(
                "flex-1 flex items-center justify-between px-3 py-2 rounded-lg border text-left text-sm",
                readonly ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:bg-gray-50",
                error ? "border-red-300" : "border-gray-300",
                "focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              )}
            >
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                {date ? format(new Date(date), 'PPP') : 'Pick a date'}
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
                selected={date ? new Date(date) : undefined}
                onSelect={handleDateChange}
                disabled={readonly}
                initialFocus
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <div className="relative shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            disabled={readonly}
            className={cn(
              "w-32 pl-10 pr-4 py-2 text-sm rounded-lg transition-colors",
              readonly ? "bg-gray-100 cursor-not-allowed" : "bg-white",
              error 
                ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
          />
        </div>
      </div>

      <input type="hidden" {...register(name)} />
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}