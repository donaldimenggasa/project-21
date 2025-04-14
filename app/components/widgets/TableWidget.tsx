import React from 'react';
import { Component } from './types';
import { cn } from '~/lib/utils';
import { ComponentBuilder } from '~/components/Builder';
import { PropertyEditor } from '~/components/Builder/PropertyEditor';
import { useBoundValue } from '~/hooks/useBoundValue';
import { commonProperties } from './types';

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

export const tableConfig = {
  type: 'table',
  props: {
    className: {
      order: 0,
      section: 'basic',
      type: 'string',
      displayName: 'CSS Classes',
      bindable: false,
      defaultValue: "",
      value : "",
      bindValue:"",
    },
    style: {
      order: 1,
      section: 'basic',
      type: 'object',
      displayName: 'Inline Styles',
      bindable: false,
      defaultValue: {},
      value : {},
      bindValue:""
    },
    ...commonProperties
  },
  sections: {
    basic: {
      name: 'Basic',
      order: 0
    }
  }
};

const componentRenderer: React.FC<WidgetProps> = React.memo(({ component, editorProps={} }) => {
  const className = useBoundValue(component.id, 'className');
  const style = useBoundValue(component.id, 'style');
  const hidden = useBoundValue(component.id, 'hidden');
  const loading = useBoundValue(component.id, 'loading');


  if(!editorProps && hidden){
    return null;
  }
  
  if(loading){
    return (
      <div className={cn(className, 'bg-gray-200 animate-pulse')} {...editorProps}>
        {String(loading)}
      </div>
    );
  }

  return (
    <div className={cn(className,  hidden  && editorProps && 'bg-red-300')}  {...editorProps}>
      {String(hidden)}
   sdasdasdasdasdasdas
    </div>
  );
});

componentRenderer.displayName = 'TableWidget';

export const tableWidget = new ComponentBuilder()
  .setType(tableConfig.type)
  .setDefaultProps(
    Object.entries(tableConfig.props).reduce((props, [key, config]) => ({
      ...props,
      [key]: config.defaultValue
    }), {})
  ).addPropertySection({
    name: tableConfig.sections.basic.name,
    view: (props) => <PropertyEditor {...props} config={tableConfig} />
  })
  .setRender(componentRenderer)
  .build();