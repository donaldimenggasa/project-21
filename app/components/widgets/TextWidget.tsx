import React from 'react';
import { Component } from './types';
import { cn } from '~/lib/utils';
import { ComponentBuilder } from '~/components/Builder';
import { PropertyEditor } from '~/components/Builder/PropertyEditor';
import { BindingProperties } from '~/components/Builder/BindingProperties';
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

export const textConfig = {
  type: 'text',
  props: {
    content: {
      order: 0,
      section: 'basic',
      type: 'string',
      displayName: 'Text Content',
      bindable: true,
      defaultValue: "Hello World",
      value: null,
      bindValue: null,
    },
    className: {
      order: 2000,
      section: 'style',
      type: 'string',
      displayName: 'CSS Classes',
      bindable: false,
      defaultValue: "",
      value: "",
      bindValue: "",
    },
    style: {
      order: 2001,
      section: 'style',
      type: 'object',
      displayName: 'Inline Styles',
      bindable: false,
      defaultValue: {},
      value: {},
      bindValue: ""
    },
    ...commonProperties
  },
  sections: {
    basic: {
      name: 'Basic',
      order: 0
    },
    style: {
      name: 'Style',
      order: 1
    },
    binding: {
      name: 'Binding',
      order: 2
    }
  }
};



const componentRenderer: React.FC<WidgetProps> = ({ component, editorProps={} }) => {
  const boundContent = useBoundValue(component.id, 'content');
  const boundClassName = useBoundValue(component.id, 'className');
  return (
    <span className={cn(
      "font-sans", // Ensure consistent font
      boundClassName
    )} {...editorProps}>
      {typeof boundContent === 'string' ? boundContent : JSON.stringify(boundContent)}
    </span>
  );
};
componentRenderer.displayName = 'TextWidget';






export const textWidget = new ComponentBuilder()
  .setType(textConfig.type)
  .setDefaultProps(
    Object.entries(textConfig.props).reduce((props, [key, config]) => ({
      ...props,
      [key]: config.defaultValue
    }), {})
  )
  .addPropertySection({
    name: textConfig.sections.basic.name,
    view: (props) => <PropertyEditor {...props} config={textConfig} />
  })
  .addPropertySection({
    name: textConfig.sections.style.name,
    view: (props) => <PropertyEditor {...props} config={textConfig} />
  })
  .addPropertySection({
    name: textConfig.sections.binding.name,
    view: (props) => <BindingProperties {...props} config={textConfig} />
  })
  .setRender(componentRenderer)
  .build();