import React, { Fragment, memo } from 'react';
import { Component } from '~/lib/types';
import { useStore } from '~/store/zustand/store';
import { componentConfigs } from '~/components/widgets';
import { useShallow } from 'zustand/react/shallow';






type ComponentRenderProps = { component: Component; children?: React.ReactNode; editorProps?: EditorProps };


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
  // only rereder if parentId changes
  //const selectedComponent = useStore(state => state.selectedComponent);
  const parentMap = useStore(
    useShallow((state) =>
      Object.fromEntries(
        Object.entries(state.component).map(([key, val]) => [key, val.parentId])
      )
    )
  );
  const orderMap = useStore(
    useShallow((state) =>
      Object.fromEntries(
        Object.entries(state.component).map(([key, val]) => [key, val.order])
      )
    )
  );

  const allComponents = useStore.getState().component;
  const setHoveredComponent = useStore(state => state.setHoveredComponent);
  const setSelectedComponent = useStore(state => state.setSelectedComponent);
  const children = getChildren(allComponents, component.id);



  console.log('RERENDER DINAMIC COMPONENT')


  // Get component config
  const config = componentConfigs[component.type as keyof typeof componentConfigs];
  const { builder } = config || {};
  
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
});

DynamicComponent.displayName = 'DynamicComponent';