import React, { Fragment, useCallback } from "react";
import { Component } from "~/lib/types";
import { Terminal } from "lucide-react";
import { cn } from "~/lib/utils";
import { CodeEditor } from "~/components/codeEditor";
import * as Switch from '@radix-ui/react-switch';

interface EditorProps {
  title: string;
  component: Component;
  propertyKey: string;
  componentProps: any;
  value: any;
  configProps: any;
  onChange: (value: any) => void;
}

const BooleanPropertyEditor: React.FC<EditorProps> = ({
  componentProps,
  title,
  configProps,
  onChange,
}) => {
  const setBindable = useCallback(() => {
    onChange({
      bindable: !componentProps.bindable,
    });
  }, [componentProps, onChange]);

  const onChangeBindable = useCallback((value: string) => {
    onChange({
      bindValue: value,
    });
  }, [onChange]);

  const handleToggle = (checked: boolean) => {
    onChange({ value: checked });
  };

  return (
    <Fragment>
      <div className="flex items-center justify-between mb-2 px-2">
        <label className={cn('block text-sm text-gray-300 uppercase font-semibold', componentProps.bindable ? 'text-lime-400' : 'text-gray-300')}>
          {title}
        </label>
        <button className="bloc text-xs text-gray-300 cursor-pointer" onClick={setBindable}>
          <Terminal className={cn('h-5 w-5 font-bold', componentProps.bindable ? 'text-lime-400' : 'text-gray-300')}/>
        </button>
      </div>
     
      {componentProps.bindable ? (
        <CodeEditor value={componentProps.bindValue} onChange={onChangeBindable}/>
      ) : (
        <div className="flex items-center">
          <Switch.Root
            checked={componentProps.value !== null ? componentProps.value : configProps.defaultValue}
            onCheckedChange={handleToggle}
            className={cn(
              "w-11 h-6 rounded-full relative",
              "bg-gray-700 data-[state=checked]:bg-blue-600",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 focus:ring-offset-gray-900"
            )}
          >
            <Switch.Thumb 
              className={cn(
                "block w-5 h-5 rounded-full bg-white",
                "transform transition-transform duration-100 will-change-transform",
                "translate-x-0.5 data-[state=checked]:translate-x-[22px]"
              )} 
            />
          </Switch.Root>
          <span className="ml-3 text-sm text-gray-300">
            {componentProps.value !== null ? 
              (componentProps.value ? 'Enabled' : 'Disabled') : 
              (configProps.defaultValue ? 'Enabled' : 'Disabled')}
          </span>
        </div>
      )}
    </Fragment>
  );
};

export { BooleanPropertyEditor };