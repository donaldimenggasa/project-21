import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Tag, X, Plus, Check } from 'lucide-react';
import { cn } from '~/lib/utils';
import * as Popover from '@radix-ui/react-popover';

interface TagsFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
  options?: string[];
  optionsUrl?: string;
  renderLabel?: (tag: string) => string;
}

export function TagsField({ 
  name, 
  label, 
  description, 
  required, 
  readonly, 
  options: initialOptions,
  optionsUrl = '/api/tags',
  renderLabel = (tag) => tag
}: TagsFieldProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<string[]>(initialOptions || []);
  const [loading, setLoading] = useState(false);
  
  // Get the current value from the form
  const value = watch(name);
  
  // Initialize selectedTags from form value or empty array
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    try {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      if (Array.isArray(value)) {
        return value;
      }
    } catch (e) {
      console.error('Error parsing tags:', e);
    }
    return [];
  });

  // Fetch options when input value changes
  useEffect(() => {
    const fetchOptions = async () => {
      if (!inputValue || initialOptions) return;
      setLoading(true);
      try {
        const response = await fetch(`${optionsUrl}?search=${inputValue}`);
        const data = await response.json();
        setOptions(data);
      } catch (error) {
        console.error('Error fetching options:', error);
        // Fallback to initial options or empty array
        setOptions(initialOptions || []);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchOptions, 300);
    return () => clearTimeout(timeoutId);
  }, [inputValue, optionsUrl, initialOptions]);

  // Update form value when selectedTags changes
  useEffect(() => {
    setValue(name, selectedTags, { shouldValidate: true });
  }, [selectedTags, name, setValue]);

  // Update selectedTags when form value changes externally
  useEffect(() => {
    if (value !== undefined) {
      try {
        const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
        if (Array.isArray(parsedValue) && JSON.stringify(parsedValue) !== JSON.stringify(selectedTags)) {
          setSelectedTags(parsedValue);
        }
      } catch (e) {
        console.error('Error updating tags:', e);
      }
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    }
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
      setInputValue('');
      setIsOpen(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const filteredOptions = options.filter(opt => 
    !selectedTags.includes(opt) && 
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="min-h-[38px] p-1.5 flex flex-wrap gap-1.5 bg-white rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium",
              "bg-blue-50 text-blue-700 border border-blue-100",
              "transition-colors group"
            )}
          >
            <Tag className="h-3.5 w-3.5 text-blue-500" />
            {renderLabel(tag)}
            {!readonly && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="p-0.5 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-600 transition-colors"
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
                  "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm",
                  "border border-dashed border-gray-300 hover:border-gray-400",
                  "text-gray-500 hover:text-gray-600",
                  "transition-colors"
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Tag
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="z-50 w-64 p-2 bg-white rounded-lg shadow-lg border border-gray-200 animate-in fade-in-0 zoom-in-95"
                sideOffset={5}
              >
                <div className="space-y-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search or enter tag..."
                    className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <div className="max-h-48 overflow-y-auto">
                    {loading ? (
                      <div className="py-8 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2" />
                        <p>Loading tags...</p>
                      </div>
                    ) : filteredOptions.length > 0 ? (
                      <div className="space-y-1">
                        {filteredOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => addTag(opt)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors group"
                          >
                            <Check className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                            {renderLabel(opt)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <p>No matching tags found</p>
                        {inputValue && (
                          <button
                            type="button"
                            onClick={() => addTag(inputValue)}
                            className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                          >
                            Create "{inputValue}"
                          </button>
                        )}
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

      <input type="hidden" {...register(name)} />
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}