import React, { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Link, Search, Check, X } from 'lucide-react';
import { cn } from '~/lib/utils';
import * as Popover from '@radix-ui/react-popover';

interface Many2OneFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
  relation: string;
  optionsUrl: string;
  renderOptions: (data: any) => Array<{
    value: number | string;
    label: string;
    description?: string;
  }>;
}

interface Option {
  value: number | string;
  label: string;
  description?: string;
}

export function Many2OneField({ 
  name, 
  label, 
  description, 
  required, 
  readonly, 
  relation,
  optionsUrl,
  renderOptions
}: Many2OneFieldProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const value = watch(name);

  // Fetch options when search query changes
  useEffect(() => {
    const fetchOptions = async () => {
      if (!searchQuery) {
        setOptions([]);
        setFetchError(null);
        return;
      }

      setLoading(true);
      setFetchError(null);
      
      try {
        const response = await fetch(`${optionsUrl}?q=${searchQuery}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // Get the response text to help diagnose the issue
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON response but got ${contentType}`);
        }

        const data = await response.json();
        console.log(data)
        const formattedOptions = renderOptions(data);
        setOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching options:', error);
        setFetchError(error instanceof Error ? error.message : 'Failed to fetch options');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchOptions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, optionsUrl, renderOptions]);

  // Update selected option when value changes
  useEffect(() => {
    if (value && (!selectedOption || selectedOption.value !== value)) {
      const option = options.find(opt => opt.value === value);
      if (option) {
        setSelectedOption(option);
      }
    } else if (!value) {
      setSelectedOption(null);
    }
  }, [value, options, selectedOption]);

  const handleSelect = (option: Option) => {
    setValue(name, option.value, { shouldValidate: true });
    setSelectedOption(option);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue(name, '', { shouldValidate: true });
    setSelectedOption(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={readonly}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left",
              "transition-colors relative",
              readonly ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:bg-gray-50",
              error ? "border-red-300" : "border-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Link className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span className="truncate text-sm">
                {selectedOption ? selectedOption.label : 'Select an option...'}
              </span>
            </div>
            {selectedOption && !readonly && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="z-50 w-[300px] p-2 bg-white rounded-lg shadow-lg border border-gray-200 animate-in fade-in-0 zoom-in-95"
            align="start"
            sideOffset={4}
          >
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {loading ? (
                  <div className="py-20 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
                    <p>Loading options...</p>
                  </div>
                ) : fetchError ? (
                  <div className="py-4 px-3 text-center text-red-600 bg-red-50 rounded-md">
                    <p className="text-sm">{fetchError}</p>
                  </div>
                ) : options.length > 0 ? (
                  <div className="space-y-1">
                    {options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={cn(
                          "w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md transition-colors",
                          "hover:bg-gray-100",
                          value === option.value && "bg-blue-50 text-blue-700"
                        )}
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-gray-500">{option.description}</div>
                          )}
                        </div>
                        {value === option.value && (
                          <Check className="h-4 w-4 text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-gray-500">
                    <p>No options found</p>
                  </div>
                )}
              </div>
            </div>
            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <input type="hidden" {...register(name)} />
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}