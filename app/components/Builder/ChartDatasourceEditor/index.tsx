import { useState, memo, useCallback, Fragment } from "react";
import { cn } from "~/lib/utils";
import { Terminal } from "lucide-react";
import { Component } from "~/lib/types";
import NoBindableConfig from './NoBindableConfig';
import BindableConfig from './BindableConfig';


interface EditorProps {
  title: string;
  component: Component;
  propertyKey: string;
  componentProps: any;
  value: any;
  configProps: any;
  onChange: (value: any) => void;
}



export const ChartDatasourceEditor = memo(({ title, componentProps, configProps, onChange }: EditorProps) => {


  const onChangeBindable = useCallback(() => {
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
  
  
  
  const onChangeValue = useCallback((value: any) => {
    onChange(value);
  }, [onChange]);


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

        {!componentProps?.bindable ? (
          <NoBindableConfig
            value={
              componentProps.value !== null
                ? componentProps.value
                : configProps.defaultValue
            }
            onChange={onChangeValue}
          />
        ) : (
          <BindableConfig
            value={componentProps.bindValue}
            onChange={onChangeBindValue}
          />
        )}
      </div>
    );
  }
);

ChartDatasourceEditor.displayName = "ChartDatasourceEditor";