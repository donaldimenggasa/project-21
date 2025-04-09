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

export interface ComponentConfig {
  type: string;
  properties: Record<string, PropertyConfig>;
  sections: Record<string, SectionConfig>;
}

export interface PropertyConfig {
  type: string;
  defaultValue?: any;
  displayName: string;
  section: string;
  bindable?: boolean;
  options?: string[];
  order?: number;
}

export interface SectionConfig {
  name: string;
  order: number;
}

// Common properties that should be added to all components
export const commonProperties = {
  hidden: {
    type: 'boolean',
    defaultValue: false,
    value : false,
    displayName: 'Hidden',
    section: 'basic',
    bindable: false,
    bindValue:"",
    order: 1000 // High order number to ensure it appears at the bottom
  },
  loading: {
    type: 'boolean',
    defaultValue: false,
    value : false,
    displayName: 'Loading',
    section: 'basic',
    bindable: false,
    bindValue:"",
    order: 1001
  }
};

