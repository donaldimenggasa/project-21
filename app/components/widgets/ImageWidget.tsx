import React from 'react';
import { Component } from './types';
import { cn } from '~/lib/utils';
import { ComponentBuilder } from '~/components/Builder';
import { PropertyEditor } from '~/components/Builder/PropertyEditor';
import { commonProperties } from './types';

interface WidgetProps {
  component: Component;
}

export const imgConfig = {
  type: 'img',
  props: {
    src: {
      type: 'string',
      defaultValue: '',
      displayName: 'Image URL',
      section: 'basic',
      bindable: true,
      order: 0
    },
    alt: {
      type: 'string',
      defaultValue: '',
      displayName: 'Alt Text',
      section: 'basic',
      bindable: true,
      order: 1
    },
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
    ...commonProperties
  },
  /*sections: {
    basic: {
      name: 'Basic',
      order: 0
    },
    style: {
      name: 'Style',
      order: 1
    }
  }*/
};

const componentRenderer: React.FC<WidgetProps> = React.memo(({ component }) => {
  const { props } = component;
  const { src, alt, className, style, hidden, loading } = props;

  if (hidden) return null;

  return (
    <img 
      src={src}
      alt={alt}
      className={cn('', className, loading && 'opacity-50 pointer-events-none')} 
      style={style}
    />
  );
});

componentRenderer.displayName = 'ImageWidget';

export const imgWidget = new ComponentBuilder()
  .setType(imgConfig.type)
  .setDefaultProps(
    Object.entries(imgConfig.props).reduce((props, [key, config]) => ({
      ...props,
      [key]: config.defaultValue
    }), {})
  )
  /*.addPropertySection({
    name: imgConfig.sections.basic.name,
    view: (props) => <PropertyEditor {...props} config={imgConfig} />
  })
  .addPropertySection({
    name: imgConfig.sections.style.name,
    view: (props) => <PropertyEditor {...props} config={imgConfig} />
  })*/
  .setRender(componentRenderer)
  .build();