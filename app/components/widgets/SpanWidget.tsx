import React, { useMemo } from 'react';
import { Component } from '~/lib/types';
import { cn } from '~/lib/utils';
//import ReactECharts from 'echarts-for-react';
import { ComponentBuilder } from '~/components/Builder';
import { PropertyEditor } from '~/components/Builder/PropertyEditor';


interface WidgetProps {
  component: Component;
  children?: React.ReactNode;
}


export const spanConfig = {
  type: 'span',
  props: {
    className: {
      type: 'string',
      defaultValue: '',
      displayName: 'CSS Classes',
      section: 'style',
      bindable: true
    },
    style: {
      type: 'object',
      defaultValue: {},
      displayName: 'Inline Styles',
      section: 'style',
      bindable: true
    }
  },
  /*sections: {
    basic: {
      name: 'Basic',
      order: 0
    },
    data: {
      name: 'Data',
      order: 1
    },
    style: {
      name: 'Style',
      order: 2
    }
  }*/
};


const componentRenderer: React.FC<WidgetProps> = React.memo(({ component, children }) => {
  const { props } = component;
  const { children : childrenProps, className, style } = props;
  return (
    <span className={cn('',className)} style={style}>
      {childrenProps}
      {children}
    </span>
  );
});



export const spanWidget = new ComponentBuilder()
  .setType(spanConfig.type)
  .setDefaultProps(
    Object.entries(spanConfig.props).reduce((props, [key, spanConfig]) => ({
      ...props,
      [key]: spanConfig.defaultValue
    }), {})
  )
  /*.addPropertySection({
    name: spanConfig.sections.basic.name,
    view: (props) => <PropertyEditor {...props} config={spanConfig} />
  })
  .addPropertySection({
    name: spanConfig.sections.style.name,
    view: (props) => <PropertyEditor {...props} config={spanConfig} />
  })
  .addPropertySection({
    name: config.sections.binding.name,
    view: (props) => <BindingProperties {...props} config={config} />
  })*/
  .setRender(componentRenderer)
  .build();