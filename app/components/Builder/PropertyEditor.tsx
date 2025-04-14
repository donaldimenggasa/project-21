import React, { useCallback, Fragment, useEffect, useRef } from 'react';
import { useStore } from '~/store/zustand/store';
import { StringPropertyEditor } from './StringInput';
import { ArrayPropertyEditor } from './ArrayInput';
import { ChartSeriesEditor } from './ChartSeriesInput';
import { ChartDatasourceEditor } from './ChartDatasourceEditor';
import { BooleanPropertyEditor } from './BooleanInput';
import { Logger } from '~/lib/logger';
import pkg from 'lodash';
const {isEqual} = pkg;

interface PropertyEditorProps {
  component: any;
  config: any;
  sectionProperties: [string, any][];
}

const EditorComponents = {
  string: StringPropertyEditor,
  array: ArrayPropertyEditor,
  chartSeriesEditor: ChartSeriesEditor,
  chartDatasourceEditor: ChartDatasourceEditor,
  boolean: BooleanPropertyEditor,
} as const;

export const PropertyEditor: React.FC<PropertyEditorProps> = ({ component, config, sectionProperties }) => {
  const { setComponent } = useStore();
 
  const componentRef = useRef(component);
  const propsRef = useRef<Record<string, any>>({});
  
  // Update componentRef when component changes
  useEffect(() => {
    componentRef.current = component;
    
    // Deep clone props to avoid reference issues
    propsRef.current = JSON.parse(JSON.stringify(component.props || {}));
  }, [component]);
  
  const updateProperty = useCallback((key: string, value: any) => {
    const currentComponent = componentRef.current;
    const currentProps = propsRef.current[key] || {};
    // Buat salinan mendalam dari komponen untuk menghindari mutasi
    const updatedComponent = {
      ...currentComponent,
      props: {
        ...currentComponent.props
      }
    };
    
    // Jika properti belum ada, inisialisasi
    if (!updatedComponent.props[key]) {
      updatedComponent.props[key] = {};
    }
    
    // Perbarui properti dengan nilai baru
    updatedComponent.props[key] = {
      ...updatedComponent.props[key],
      ...value
    };
    
    // Perbarui referensi props
    propsRef.current[key] = { ...propsRef.current[key], ...value };
    // Perbarui komponen di store
    setComponent(updatedComponent);
  }, [setComponent]);



  
  return (
    <Fragment>
      <div className="flex justify-between">
        <span>{component.type}</span>
        <span>{component.id}</span>
      </div>
      
      {sectionProperties.map(([key, prop]) => {
        if (prop.condition && !prop.condition(component.props)) {
          return null;
        }
        const Editor = EditorComponents[prop.type as keyof typeof EditorComponents];
        if (!Editor) return null;
        return (
          <Editor
            key={key}
            title={prop.displayName}
            component={component}
            propertyKey={key}
            componentProps={component.props[key]}
            configProps={config.props[key]}
            value={null}
            onChange={(value) => updateProperty(key, value)}
          />
        );
      })}
    </Fragment>
  );
};