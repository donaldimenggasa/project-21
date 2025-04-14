import React, { useCallback } from "react";
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

const BooleanPropertyEditor: React.FC<EditorProps> = ({
  componentProps,
  title,
  configProps,
  onChange,
}) => {
 
 
  const value = componentProps.value !== null ? componentProps.value : configProps.defaultValue;

  const onChangeBindable = useCallback(() => {
    console.log(componentProps.bindValue)
    if(componentProps.bindValue === '') {
      onChange({
        bindable: !componentProps.bindable,
        bindValue: String(componentProps.value !== null ? componentProps.value : configProps.defaultValue),
      });
      return;
    }
    onChange({
      bindable: !componentProps.bindable,
    });
  }, [componentProps, onChange]);


  const handleToggle = (checked: boolean) => {
    onChange({ value: checked });
  };

  const onChangeBindValue = useCallback((text : string) => {
      onChange({
        bindValue: text,
      });
      return;
  }, [componentProps, onChange]);


  return (
    <div className=" border-b border-gray-800 p-2">
      <div className="flex items-center justify-between text-xs mb-4">
        <label className={cn('block text-gray-400 uppercase', componentProps.bindable ? 'text-lime-400' : 'text-gray-300')}>
          {title}
        </label>
        <button className="bloc text-xs text-gray-300 cursor-pointer" onClick={onChangeBindable}>
          <Terminal className={cn('h-4 w-4 text-gray-400', componentProps.bindable ? 'text-lime-400' : 'text-gray-300')}/>
        </button>
      </div>
     
      {componentProps.bindable ? (
        <CodeEditor 
          key={`${String(componentProps.bindable)}-${componentProps.id}`} 
          value={String(componentProps.bindValue)} 
          onChange={onChangeBindValue}
        />
      ) : (
        <div className="flex items-start justify-start">
          <div className=" w-full flex-row">
            <button className={cn(
              'w-32 h-8 rounded-tl-md rounded-bl-md text-xs text-gray-300 cursor-pointer',
              value === false ? 'bg-purple-700' : 'bg-gray-700'
            )}
             onClick={() => handleToggle(false)}>
              <span className="text-xs text-gray-300">OFF</span>
            </button>
            <button className={cn(
              'w-32 h-8 rounded-tr-md rounded-br-md text-xs text-gray-300 cursor-pointer',
              value === true ? 'bg-purple-700' : 'bg-gray-700'
            )}
             onClick={() => handleToggle(true)}>
              <span className="text-xs text-gray-300">ON</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export { BooleanPropertyEditor };