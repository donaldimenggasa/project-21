import React, { Fragment, memo } from 'react';
import { Component } from '~/lib/types';
import { useStore } from '~/store/zustand/store';
import { componentConfigs } from '~/components/widgets';
import pkg from 'lodash';
const {isEqual} = pkg;


interface DynamicComponentProps {
  component: Component;
}

interface EditorProps {
  'data-component-id': string;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const getChildren = (components: Record<string, Component>, parentId: string) => {
  return Object.values(components)
    .filter(c => c.parentId === parentId)
    .sort((a, b) => a.order - b.order);
};



export const DynamicComponent: React.FC<DynamicComponentProps> = memo(({ component }) => {
  const { component: allComponents, setSelectedComponent, setHoveredComponent } = useStore();
  
  // Get children components
  const children = getChildren(allComponents, component.id);
  
  // Get component config
  const config = componentConfigs[component.type as keyof typeof componentConfigs];
  const { builder } = config || {};
  
  type ComponentRenderProps = { component: Component; children?: React.ReactNode; editorProps?: EditorProps };

  const editorProps: EditorProps = {
    'data-component-id': component.id,
    onClick: (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setSelectedComponent(component.id);
    },
    onMouseEnter: () => setHoveredComponent(component.id),
    onMouseLeave: () => setHoveredComponent(null),
  };

  if (!builder) {
    return <Fragment />;
  }
  

  const ComponentRender = builder.render as React.ComponentType<ComponentRenderProps>;

  return (
    <ComponentRender component={component} editorProps={editorProps}>
      {children.map((child: Component) => {
        if (!componentConfigs[child.type as keyof typeof componentConfigs]) {
          return <Fragment key={child.id} />;
        }
        return <DynamicComponent key={child.id} component={child} />;
      })}
    </ComponentRender>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  const prev = prevProps.component;
  const next = nextProps.component;

  // Check if component has bindings in its props
  const hasBindings = (component: Component) => {
    if (!component.props) return false;
    
    return Object.values(component.props).some(
      prop => typeof prop === 'object' && prop && 'bindable' in prop && prop.bindable
    );
  };

  // Always re-render if the component has bindings
  if (hasBindings(prev) || hasBindings(next)) {
    return false;
  }

  return (
    prev.id === next.id &&
    prev.type === next.type &&
    isEqual(prev.props, next.props) &&
    prev.value === next.value
  );
});

DynamicComponent.displayName = 'DynamicComponent';