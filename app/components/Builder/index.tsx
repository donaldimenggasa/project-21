import React from 'react';
import { Component, PropertySection, ComponentConfigBuilder,  } from '~/lib/types';




export class ComponentBuilder<T extends Component = Component> {
  private config: Partial<ComponentConfigBuilder<T>> = {};

  setType(type: T['type']) {
    this.config.type = type;
    return this;
  }

  setDefaultProps(props: Partial<T['props']>) {
    this.config.defaultProps = props;
    return this;
  }

  addPropertySection(section: PropertySection) {
    if (!this.config.propertyViews) {
      this.config.propertyViews = [];
    }
    this.config.propertyViews.push(section);
    return this;
  }

  setRender(render: React.ComponentType<{ component: T }>) {
    this.config.render = render;
    return this;
  }

  build(): ComponentConfigBuilder<T> {
    if (!this.config.type) {
      throw new Error('Component type is required');
    }
    if (!this.config.render) {
      throw new Error('Component render function is required');
    }

    return {
      type: this.config.type,
      defaultProps: this.config.defaultProps || {},
      propertyViews: this.config.propertyViews || [],
      render: this.config.render,
    } as ComponentConfigBuilder<T>;
  }
}