import React, { Fragment, useCallback, useRef, useEffect } from "react";
import { Component } from "~/lib/types";
import { Terminal } from "lucide-react";
import { cn } from "~/lib/utils";
import { CodeEditor } from "~/components/codeEditor";


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
  const componentPropsRef = useRef(componentProps);
  
  // Update ref when componentProps changes
  useEffect(() => {
    componentPropsRef.current = componentProps;
  }, [componentProps]);
  
  const setBindable = useCallback(() => {
    const isCurrentlyBindable = componentPropsRef.current?.bindable;
    onChange({
      bindable: !isCurrentlyBindable,
    });
  }, [onChange, component.id, propertyKey]);

  const onChangeBindable = useCallback((value: string) => {
    onChange({
      bindValue: value,
    });
  }, [onChange, component.id, propertyKey]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ value: e.target.value });
  }, [onChange, component.id, propertyKey]);

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
            className="w-full p-2 text-sm border border-gray-800 rounded-md bg-gray-800 outline-none"
            placeholder={`Enter ${title.toLowerCase()}...`}
          />
        )
      )}
    </Fragment>
  );
};

export { StringPropertyEditor };