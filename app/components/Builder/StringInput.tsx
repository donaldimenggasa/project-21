import React, { Fragment, useCallback, useRef, useEffect } from "react";
import { Component } from "~/lib/types";
import { Terminal } from "lucide-react";
import { cn } from "~/lib/utils";
import { CodeEditor } from "~/components/codeEditor";
import { Logger } from "~/lib/logger";

interface EditorProps {
  title: string;
  component: Component;
  propertyKey: string;
  componentProps: any;
  value: any;
  configProps: any;
  onChange: (value: any) => void;
}

const StringPropertyEditor: React.FC<EditorProps> = ({
  componentProps,
  title,
  configProps,
  onChange,
  component,
  propertyKey
}) => {
  const logger = useRef(Logger.getInstance()).current;
  const componentPropsRef = useRef(componentProps);
  
  // Update ref when componentProps changes
  useEffect(() => {
    componentPropsRef.current = componentProps;
  }, [componentProps]);
  
  const setBindable = useCallback(() => {
    const isCurrentlyBindable = componentPropsRef.current?.bindable;
    
    logger.debug('Toggling bindable property', { 
      componentId: component.id, 
      property: propertyKey, 
      currentValue: isCurrentlyBindable,
      newValue: !isCurrentlyBindable
    });
    
    onChange({
      bindable: !isCurrentlyBindable,
    });
  }, [onChange, component.id, propertyKey, logger]);

  const onChangeBindable = useCallback((value: string) => {
    logger.debug('Updating bindValue', { 
      componentId: component.id, 
      property: propertyKey, 
      value: value.substring(0, 50) 
    });
    
    onChange({
      bindValue: value,
    });
  }, [onChange, component.id, propertyKey, logger]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    logger.debug('Updating property value', { 
      componentId: component.id, 
      property: propertyKey, 
      value: e.target.value.substring(0, 50) 
    });
    
    onChange({ value: e.target.value });
  }, [onChange, component.id, propertyKey, logger]);

  return (
    <Fragment>
      <div className="flex items-center justify-between mb-2 px-2">
        <label className={cn(
          'block text-sm font-medium', 
          componentProps?.bindable ? 'text-success' : 'text-foreground'
        )}>
          {title}
        </label>
        <button 
          className="p-1.5 rounded-md hover:bg-background transition-colors" 
          onClick={setBindable}
          title={componentProps?.bindable ? "Disable binding" : "Enable binding"}
        >
          <Terminal className={cn(
            'h-4 w-4', 
            componentProps?.bindable ? 'text-success' : 'text-secondary'
          )}/>
        </button>
      </div>
     
      {componentProps?.bindable ? (
        <div className="border border-success/20 rounded-md overflow-hidden">
          <CodeEditor 
            value={componentProps.bindValue || ''} 
            onChange={onChangeBindable}
          />
        </div>
      ) : (
        configProps.options ? (
          <select
            value={
              componentProps?.value !== null
                ? componentProps?.value
                : configProps.defaultValue
            }
            onChange={handleInputChange}
            className="w-full p-2 text-sm border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary bg-input outline-none"
          >
            {configProps.options.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={
              componentProps?.value !== null
                ? componentProps?.value
                : configProps.defaultValue
            }
            onChange={handleInputChange}
            className="w-full p-2 text-sm border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary bg-input outline-none"
            placeholder={`Enter ${title.toLowerCase()}...`}
          />
        )
      )}
    </Fragment>
  );
};

export { StringPropertyEditor };