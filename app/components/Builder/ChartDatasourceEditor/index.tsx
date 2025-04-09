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

export const ChartDatasourceEditor = memo(
  ({ title, componentProps, configProps, onChange }: EditorProps) => {
    const setBindable = useCallback(() => {
      onChange({
        bindable: !componentProps.bindable,
      });
    }, [componentProps, onChange]);

    const onChangeBindable = useCallback(
      (value: string) => {
        onChange({
          bindValue: value,
        });
      },
      [onChange]
    );

    const onChangeValue = useCallback(
      (value: any) => {
        onChange(value);
      },
      [onChange]
    );

    return (
      <Fragment>
        <div className="flex items-center justify-between mb-2 px-2">
          <label
            className={cn(
              "block text-sm text-gray-300 uppercase font-semibold",
              componentProps.bindable ? "text-lime-400" : "text-gray-300"
            )}
          >
            {title}
          </label>
          <button
            className="bloc text-xs text-gray-300 cursor-pointer"
            onClick={setBindable}
          >
            <Terminal
              className={cn(
                "h-5 w-5 font-bold",
                componentProps.bindable ? "text-lime-400" : "text-gray-300"
              )}
            />
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
            onChange={onChangeBindable}
          />
        )}
      </Fragment>
    );
  }
);

ChartDatasourceEditor.displayName = "ChartDatasourceEditor";