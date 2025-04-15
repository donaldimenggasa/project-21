import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Link, Search, Check, X } from 'lucide-react';
import { cn } from '~/lib/utils';
import * as Popover from '@radix-ui/react-popover';

interface Many2ManyFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
  relation: string;
  optionsUrl?: string;
  labelUrl?: string;
  renderLabel?: (item: any) => string;
  renderDescription?: (item: any) => string;
}

interface Option {
  id: string;
  [key: string]: any;
}

export function Many2ManyField({ 
  name, 
  label, 
  description, 
  required, 
  readonly, 
  relation,
  optionsUrl = 'https://dummyjson.com/products/search?q=',
  labelUrl = 'https://dummyjson.com/products',
  renderLabel = (item) => item.name || item.id,
  renderDescription = (item) => item.description || ''
}: Many2ManyFieldProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  // Use useMemo to prevent unnecessary re-renders
  const selectedIds = useMemo(() => watch(name) || [], [watch, name]);

  // Memoize fetch functions
  const fetchOptions = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch(`${optionsUrl}${query}`);
      if (!response.ok) throw new Error('Failed to fetch options');
      const data = await response.json();
      const filteredOptions = data.products.filter((opt: Option) => !selectedIds.includes(opt.id));
      setOptions(filteredOptions);
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [optionsUrl, selectedIds]);

  const fetchLabels = useCallback(async (ids: string[]) => {
    if (!ids.length) {
      setSelectedOptions([]);
      return;
    }

    try {
      const promises = ids.map(id => 
        fetch(`${labelUrl}/${id}`).then(res => res.json())
      );
      const results = await Promise.all(promises);
      setSelectedOptions(results);
    } catch (error) {
      console.error('Error fetching labels:', error);
      setSelectedOptions(ids.map(id => ({ 
        id, 
        name: `Option ${id}`,
        description: `Description for option ${id}`
      })));
    }
  }, [labelUrl]);

  // Handle search query changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        fetchOptions(searchQuery);
      } else {
        setOptions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchOptions]);

  // Fetch labels for selected items
  useEffect(() => {
    fetchLabels(selectedIds);
  }, [selectedIds, fetchLabels]);

  const handleSelect = useCallback((option: Option) => {
    const newIds = [...selectedIds, option.id];
    setValue(name, newIds, { shouldValidate: true });
    setSearchQuery('');
    setIsOpen(false);
  }, [selectedIds, setValue, name]);

  const handleRemove = useCallback((optionId: string) => {
    setValue(
      name, 
      selectedIds.filter(id => id !== optionId),
      { shouldValidate: true }
    );
  }, [selectedIds, setValue, name]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="space-y-2">
        {/* Selected Items */}
        <div className="min-h-[38px] p-2 flex flex-wrap gap-2 bg-white rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm",
                "bg-blue-50 text-blue-700 border border-blue-100"
              )}
            >
              <Link className="h-3.5 w-3.5 text-blue-500" />
              {renderLabel(option)}
              {!readonly && (
                <button
                  type="button"
                  onClick={() => handleRemove(option.id)}
                  className="p-0.5 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}

          {!readonly && (
            <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className={cn(
                    "px-2 py-1 rounded-md text-sm",
                    "border border-dashed border-gray-300 hover:border-gray-400",
                    "text-gray-500 hover:text-gray-600",
                    "transition-colors"
                  )}
                >
                  Add Item...
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
                        className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                      {loading ? (
                        <div className="py-20 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
                          <p>Loading options...</p>
                        </div>
                      ) : options.length > 0 ? (
                        <div className="space-y-1">
                          {options.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelect(option)}
                              className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <div className="flex-1 text-left">
                                <div className="font-medium">{renderLabel(option)}</div>
                                <div className="text-xs text-gray-500">{renderDescription(option)}</div>
                              </div>
                              <Check className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
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
          )}
        </div>
      </div>

      <input type="hidden" {...register(name)} />
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}