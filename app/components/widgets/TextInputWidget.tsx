import React, { useState, useCallback, useMemo } from 'react';
import { Component } from '~/lib/types';
import { cn } from '~/lib/utils';
import { ComponentBuilder } from '~/components/Builder';
import { PropertyEditor } from '~/components/Builder/PropertyEditor';
import { useBoundValue } from '~/hooks/useBoundValue';
import * as Label from '@radix-ui/react-label';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface EditorProps {
  'data-component-id': string;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

interface WidgetProps {
  component: Component;
  editorProps?: EditorProps;
}

export const textInputConfig = {
  type: 'textinput',
  props: {
    label: {
      order: 0,
      section: 'basic',
      type: 'string',
      displayName: 'Label',
      bindable: false,
      defaultValue: 'Label',
      value: null,
      bindValue: "",
    },
    placeholder: {
      order: 1,
      section: 'basic',
      type: 'string',
      displayName: 'Placeholder',
      bindable: false,
      defaultValue: 'Enter text...',
      value: null,
      bindValue: "",
    },
    value: {
      order: 2,
      section: 'basic',
      type: 'string',
      displayName: 'Value',
      bindable: false,
      defaultValue: '',
      value: null,
      bindValue: "",
    },
    type: {
      order: 3,
      section: 'basic',
      type: 'string',
      displayName: 'Input Type',
      bindable: false,
      defaultValue: 'text',
      value: null,
      bindValue: "",
      options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search']
    },
    required: {
      order: 4,
      section: 'basic',
      type: 'boolean',
      displayName: 'Required',
      bindable: false,
      defaultValue: false,
      value: null,
      bindValue: "",
    },
    disabled: {
      order: 5,
      section: 'basic',
      type: 'boolean',
      displayName: 'Disabled',
      bindable: false,
      defaultValue: false,
      value: null,
      bindValue: "",
    },
    readOnly: {
      order: 6,
      section: 'basic',
      type: 'boolean',
      displayName: 'Read Only',
      bindable: false,
      defaultValue: false,
      value: null,
      bindValue: "",
    },
    helperText: {
      order: 7,
      section: 'basic',
      type: 'string',
      displayName: 'Helper Text',
      bindable: false,
      defaultValue: '',
      value: null,
      bindValue: "",
    },
    errorMessage: {
      order: 8,
      section: 'basic',
      type: 'string',
      displayName: 'Error Message',
      bindable: false,
      defaultValue: '',
      value: null,
      bindValue: "",
    },
    hasError: {
      order: 9,
      section: 'basic',
      type: 'boolean',
      displayName: 'Has Error',
      bindable: false,
      defaultValue: false,
      value: null,
      bindValue: "",
    },
    size: {
      order: 10,
      section: 'appearance',
      type: 'string',
      displayName: 'Size',
      bindable: false,
      defaultValue: 'medium',
      value: null,
      bindValue: "",
      options: ['small', 'medium', 'large']
    },
    variant: {
      order: 11,
      section: 'appearance',
      type: 'string',
      displayName: 'Variant',
      bindable: false,
      defaultValue: 'outlined',
      value: null,
      bindValue: "",
      options: ['outlined', 'filled', 'unstyled']
    },
    fullWidth: {
      order: 12,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Full Width',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    labelPosition: {
      order: 13,
      section: 'appearance',
      type: 'string',
      displayName: 'Label Position',
      bindable: false,
      defaultValue: 'top',
      value: null,
      bindValue: "",
      options: ['top', 'left', 'floating']
    },
    showPasswordToggle: {
      order: 14,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Show Password Toggle',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    className: {
      order: 15,
      section: 'style',
      type: 'string',
      displayName: 'CSS Classes',
      bindable: false,
      defaultValue: '',
      value: null,
      bindValue: "",
    },
    style: {
      order: 16,
      section: 'style',
      type: 'object',
      displayName: 'Inline Styles',
      bindable: false,
      defaultValue: {},
      value: null,
      bindValue: "",
    },
    hidden: {
      type: 'boolean',
      defaultValue: false,
      value: false,
      displayName: 'Hidden',
      section: 'basic',
      bindable: false,
      bindValue: "",
      order: 1000
    },
    loading: {
      type: 'boolean',
      defaultValue: false,
      value: false,
      displayName: 'Loading',
      section: 'basic',
      bindable: false,
      bindValue: "",
      order: 1001
    }
  },
  sections: {
    basic: {
      name: 'Basic',
      order: 0
    },
    appearance: {
      name: 'Appearance',
      order: 1
    },
    style: {
      name: 'Style',
      order: 2
    }
  }
};

const componentRenderer: React.FC<WidgetProps> = React.memo(({ component, editorProps = {} }) => {
  const { props } = component;
  
  // Use useBoundValue for all props
  const label = useBoundValue(component.id, 'label');
  const placeholder = useBoundValue(component.id, 'placeholder');
  const value = useBoundValue(component.id, 'value');
  const type = useBoundValue(component.id, 'type');
  const required = useBoundValue(component.id, 'required');
  const disabled = useBoundValue(component.id, 'disabled');
  const readOnly = useBoundValue(component.id, 'readOnly');
  const helperText = useBoundValue(component.id, 'helperText');
  const errorMessage = useBoundValue(component.id, 'errorMessage');
  const hasError = useBoundValue(component.id, 'hasError');
  const size = useBoundValue(component.id, 'size');
  const variant = useBoundValue(component.id, 'variant');
  const fullWidth = useBoundValue(component.id, 'fullWidth');
  const labelPosition = useBoundValue(component.id, 'labelPosition');
  const showPasswordToggle = useBoundValue(component.id, 'showPasswordToggle');
  const className = useBoundValue(component.id, 'className');
  const style = useBoundValue(component.id, 'style');
  const hidden = useBoundValue(component.id, 'hidden');
  const loading = useBoundValue(component.id, 'loading');


  // For password toggle functionality
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Determine input type (for password toggle)
  const inputType = useMemo(() => {
    if (type === 'password' && showPassword) {
      return 'text';
    }
    return type || textInputConfig.props.type.defaultValue;
  }, [type, showPassword]);

  // Size classes
  const getSizeClasses = useCallback(() => {
    switch (size || textInputConfig.props.size.defaultValue) {
      case 'small':
        return 'h-8 text-xs px-2';
      case 'large':
        return 'h-12 text-base px-4';
      case 'medium':
      default:
        return 'h-10 text-sm px-3';
    }
  }, [size]);

  // Variant classes
  const getVariantClasses = useCallback(() => {
    switch (variant || textInputConfig.props.variant.defaultValue) {
      case 'filled':
        return 'bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900';
      case 'unstyled':
        return 'border-transparent shadow-none bg-transparent';
      case 'outlined':
      default:
        return 'bg-transparent border-gray-300 dark:border-gray-700';
    }
  }, [variant]);

  // Label position classes
  const getLabelContainerClasses = useCallback(() => {
    switch (labelPosition || textInputConfig.props.labelPosition.defaultValue) {
      case 'left':
        return 'flex flex-row items-center gap-2';
      case 'floating':
        return 'relative';
      case 'top':
      default:
        return 'flex flex-col gap-1.5';
    }
  }, [labelPosition]);

  // Label classes
  const getLabelClasses = useCallback(() => {
    const baseClasses = 'text-sm font-medium text-gray-700 dark:text-gray-300';
    
    switch (labelPosition || textInputConfig.props.labelPosition.defaultValue) {
      case 'left':
        return `${baseClasses} whitespace-nowrap`;
      case 'floating':
        return `${baseClasses} absolute left-3 -top-2.5 px-1 bg-white dark:bg-gray-900 text-xs transition-all pointer-events-none`;
      case 'top':
      default:
        return baseClasses;
    }
  }, [labelPosition]);

  // Input container classes
  const getInputContainerClasses = useCallback(() => {
    return cn(
      'relative',
      labelPosition === 'left' && 'flex-1'
    );
  }, [labelPosition]);

  if (hidden) return null;

  return (
    <div 
      className={cn(
        getLabelContainerClasses(),
        fullWidth && 'w-full',
        loading && 'opacity-70 pointer-events-none',
        className
      )} 
      style={style}
      {...editorProps}
    >
      {label && labelPosition !== 'floating' && (
        <Label.Root 
          className={getLabelClasses()}
          htmlFor={`input-${component.id}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label.Root>
      )}
      
      <div className={getInputContainerClasses()}>
        <input
          id={`input-${component.id}`}
          type={inputType}
          value={value || ''}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={cn(
            // Base styles
            'rounded-md border transition-colors duration-200 outline-hidden',
            // Size
            getSizeClasses(),
            // Variant
            getVariantClasses(),
            // Full width
            fullWidth && 'w-full',
            // Error state
            hasError ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'focus:ring-blue-500/20 focus:border-blue-500',
            // Focus state
            'focus:ring-2',
            // Disabled state
            disabled && 'opacity-50 cursor-not-allowed',
            // Password toggle padding
            type === 'password' && showPasswordToggle && 'pr-10',
            // Floating label
            labelPosition === 'floating' && 'pt-1',
          )}
        />
        
        {/* Floating label */}
        {label && labelPosition === 'floating' && (
          <Label.Root 
            className={getLabelClasses()}
            htmlFor={`input-${component.id}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label.Root>
        )}
        
        {/* Password toggle */}
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      
      {/* Helper text or error message */}
      {(helperText || (hasError && errorMessage)) && (
        <div className={cn(
          "text-xs mt-1",
          hasError ? "text-red-500 flex items-center gap-1" : "text-gray-500 dark:text-gray-400"
        )}>
          {hasError && errorMessage ? (
            <>
              <AlertCircle className="h-3 w-3" />
              {errorMessage}
            </>
          ) : helperText}
        </div>
      )}
    </div>
  );
});

componentRenderer.displayName = 'TextInputWidget';

export const textInputWidget = new ComponentBuilder()
  .setType(textInputConfig.type)
  .setDefaultProps(
    Object.entries(textInputConfig.props).reduce((props, [key, config]) => ({
      ...props,
      [key]: {
        value: null,
        bindValue: "",
        defaultValue: config.defaultValue
      }
    }), {})
  )
  .addPropertySection({
    name: textInputConfig.sections.basic.name,
    view: (props) => <PropertyEditor {...props} config={textInputConfig} />
  })
  .addPropertySection({
    name: textInputConfig.sections.appearance.name,
    view: (props) => <PropertyEditor {...props} config={textInputConfig} />
  })
  .addPropertySection({
    name: textInputConfig.sections.style.name,
    view: (props) => <PropertyEditor {...props} config={textInputConfig} />
  })
  .setRender(componentRenderer)
  .build();