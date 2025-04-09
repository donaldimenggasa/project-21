import React, { useEffect, useRef, memo, useMemo } from 'react';
import { Component } from './types';
import { cn } from '~/lib/utils';
import { ComponentBuilder } from '~/components/Builder';
import { PropertyEditor } from '~/components/Builder/PropertyEditor';
import { BindingProperties } from '~/components/Builder/BindingProperties';
import { useBoundValue } from '~/hooks/useBoundValue';
import { commonProperties } from './types';
import { Logger } from '~/lib/logger';
import { useRenderTimer } from '~/lib/performance';
import { Cache } from '~/lib/cache';

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

// Gunakan memo untuk mencegah render ulang yang tidak perlu
const TextRenderer = memo(({ content, className, editorProps }: { 
  content: any; 
  className: string; 
  editorProps: EditorProps;
}) => {
  // Measure render time
  useRenderTimer('TextRenderer');
  
  return (
    <span className={cn(
      "font-sans", // Ensure consistent font
      className
    )} {...editorProps}>
      {typeof content === 'string' ? content : JSON.stringify(content)}
    </span>
  );
});

TextRenderer.displayName = 'TextRenderer';

const componentRenderer: React.FC<WidgetProps> = ({ component, editorProps={} }) => {
  // Measure render time
  useRenderTimer(`TextWidget(${component.id})`);
  
  // Get cache instance
  const cache = useMemo(() => Cache.getInstance(), []);
  
  // Try to get from cache first for non-bindable content
  const cacheKey = `text-widget-${component.id}`;
  const cachedProps = cache.get(cacheKey);
  
  // If we have cached props and content is not bindable, use them
  if (cachedProps && !component.props.content?.bindable) {
    return (
      <TextRenderer 
        content={cachedProps.content} 
        className={cachedProps.className} 
        editorProps={editorProps} 
      />
    );
  }
  
  // Always call hooks at the top level, before any conditional logic
  const boundContent = useBoundValue(component.props.content);
  const boundClassName = useBoundValue(component.props.className);
  const logger = useRef(Logger.getInstance()).current;
  
  // Memoize values to prevent unnecessary re-renders
  const content = useMemo(() => 
    boundContent ?? textConfig.props.content.defaultValue, 
    [boundContent]
  );
  
  const className = useMemo(() => 
    boundClassName ?? textConfig.props.className.defaultValue,
    [boundClassName]
  );
  
  // Cache the props for future renders if content is not bindable
  useEffect(() => {
    if (!component.props.content?.bindable) {
      cache.set(cacheKey, { content, className }, 10000); // Cache for 10 seconds
    }
    
    // Untuk debugging
    logger.debug('TextWidget values updated', { 
      componentId: component.id, 
      content: typeof content === 'string' ? content.substring(0, 50) : typeof content,
      className,
      hasBindableContent: component.props.content?.bindable,
      isCached: !!cachedProps
    });
  }, [component.id, content, className, component.props.content?.bindable, logger, cache, cacheKey, cachedProps]);
  
  // Gunakan komponen yang di-memo untuk mencegah render ulang yang tidak perlu
  return (
    <TextRenderer 
      content={content} 
      className={className} 
      editorProps={editorProps} 
    />
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