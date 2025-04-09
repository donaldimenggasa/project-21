import { ReactNode } from 'react';

export interface BaseProps {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  hidden?: boolean;
  loading?: boolean;
}

export interface Component {
  id: string;
  type: string;
  pageId: string;
  parentId: string | null;
  props: Record<string, any>;
  children?: string[];
  bindings?: Record<string, string>;
  value?: any;
  order: number;
}

export interface Action {
  id: string;
  type: 'api' | 'function';
  config: Record<string, any>;
}

export interface Query {
  id: string;
  type: 'data';
  config: Record<string, any>;
  data: any;
}

export type BindingSource = {
  type: 'query' | 'component';
  id: string;
  path: string;
}

export interface PropertySection {
  name: string;
  view: React.ComponentType<any>;
}

export interface ComponentConfigBuilder<T extends Component = Component> {
  type: T['type'];
  defaultProps: Partial<T['props']>;
  propertyViews: PropertySection[];
  render: React.ComponentType<{ component: T }>;
}

/**
 * Interface untuk konfigurasi komponen
 */
export interface ComponentConfig {
  type: string;
  props: Record<string, PropertyConfig>;
  sections: Record<string, SectionConfig>;
  defaultChildren?: string[];
  allowedChildren?: string[];
  disallowedParents?: string[];
  category?: string;
  icon?: React.ElementType;
  description?: string;
  examples?: ComponentExample[];
}

/**
 * Interface untuk konfigurasi properti komponen
 */
export interface PropertyConfig {
  type: string;
  defaultValue: any;
  displayName: string;
  description?: string;
  section: string;
  bindable?: boolean;
  options?: string[] | { value: string; label: string }[];
  order?: number;
  condition?: (props: any) => boolean;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
}

/**
 * Interface untuk konfigurasi section properti
 */
export interface SectionConfig {
  name: string;
  order: number;
  description?: string;
  icon?: React.ElementType;
  collapsed?: boolean;
}

/**
 * Interface untuk contoh komponen
 */
export interface ComponentExample {
  name: string;
  description?: string;
  props: Record<string, any>;
  children?: ComponentExample[];
}

// Common properties that should be added to all components
export const commonProperties = {
  hidden: {
    type: 'boolean',
    defaultValue: false,
    value: false,
    displayName: 'Hidden',
    description: 'Hide this component from view',
    section: 'basic',
    bindable: false,
    bindValue: "",
    order: 1000 // High order number to ensure it appears at the bottom
  },
  loading: {
    type: 'boolean',
    defaultValue: false,
    value: false,
    displayName: 'Loading',
    description: 'Show loading state for this component',
    section: 'basic',
    bindable: false,
    bindValue: "",
    order: 1001
  },
  testId: {
    type: 'string',
    defaultValue: '',
    value: '',
    displayName: 'Test ID',
    description: 'ID for automated testing',
    section: 'advanced',
    bindable: false,
    bindValue: "",
    order: 2000
  }
};