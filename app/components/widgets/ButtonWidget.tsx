import React from 'react';
import { Component } from './types';
import { cn } from '~/lib/utils';
import { ComponentBuilder } from '~/components/Builder';
import { PropertyEditor } from '~/components/Builder/PropertyEditor';
import { commonProperties } from './types';

interface EditorProps {
  'data-component-id': string;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}
interface WidgetProps {
  component: Component;
  children?: React.ReactNode;
  editorProps?: EditorProps;
}



export const buttonConfig = {
  type: 'button',
  props: {
    className: {
      type: 'string',
      defaultValue: '',
      displayName: 'CSS Classes',
      section: 'style',
      bindable: true,
      order: 0
    },
    style: {
      type: 'object',
      defaultValue: {},
      displayName: 'Inline Styles',
      section: 'style',
      bindable: true,
      order: 1
    },
    children: {
      type: 'string',
      defaultValue: 'Button',
      displayName: 'Label',
      section: 'basic',
      bindable: true,
      order: 0
    },
    disabled: {
      type: 'boolean',
      defaultValue: false,
      displayName: 'Disabled',
      section: 'basic',
      bindable: true,
      order: 1
    },
    ...commonProperties
  }
};

const componentRenderer: React.FC<WidgetProps> = React.memo(({ component, children }) => {
  const { props } = component;
  const { children: childrenProps, className, style, disabled, hidden, loading } = props;

  if (hidden) return null;

  return (
    <button 
      className={cn('', className, loading && 'opacity-50 pointer-events-none')} 
      style={style}
      disabled={disabled || loading}
    >
      {childrenProps || children}
    </button>
  );
});

componentRenderer.displayName = 'ButtonWidget';

export const buttonWidget = new ComponentBuilder()
  .setType(buttonConfig.type)
  .setDefaultProps(
    Object.entries(buttonConfig.props).reduce((props, [key, config]) => ({
      ...props,
      [key]: config.defaultValue
    }), {})
  )
  /*.addPropertySection({
    name: buttonConfig.sections.basic.name,
    view: (props) => <PropertyEditor {...props} config={buttonConfig} />
  })
  .addPropertySection({
    name: buttonConfig.sections.style.name,
    view: (props) => <PropertyEditor {...props} config={buttonConfig} />
  })*/
  .setRender(componentRenderer)
  .build();