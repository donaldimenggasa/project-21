import React, { Fragment, memo } from 'react';
import { Component } from '~/lib/types';
import { useStore } from '~/store/zustand/store';
import { componentConfigs } from '~/components/widgets';


type ComponentRenderProps = { component: Component; children?: React.ReactNode };
interface DynamicComponentProps {
  component: Component;
}


const getChildren = (components: Record<string, Component>, parentId: string) => {
  return Object.values(components)
    .filter(c => c.parentId === parentId)
    .sort((a, b) => a.order - b.order);
};


export const DynamicComponentPreview: React.FC<DynamicComponentProps> = memo(({ component }) => {
  const allComponents = useStore.getState().component;
  const children = getChildren(allComponents, component.id);

  const config = componentConfigs[component.type as keyof typeof componentConfigs];
  const { builder } = config || {};
  

  if (!builder) {
    return <Fragment />;
  }

  const ComponentRender = builder.render as React.ComponentType<ComponentRenderProps>;

  return (
    <ComponentRender component={component}>
      {children.map((child: Component) => {
        if (!componentConfigs[child.type as keyof typeof componentConfigs]) {
          return <Fragment key={child.id} />;
        }
        return <DynamicComponentPreview key={child.id} component={child} />;
      })}
    </ComponentRender>
  );
});

DynamicComponentPreview.displayName = 'DynamicComponentPreview';