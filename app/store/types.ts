export interface FlatComponent {
  id: string;
  pageId: string;
  type: string;
  props: Record<string, any>;
  bindings?: Record<string, string>;
  value?: any;
  order: number;
  parentId: string | null;
  children?: string[];
}

export interface ComponentState {
  [id: string]: FlatComponent;
}

export interface Page {
  id: string;
  title: string;
  description: string;
  layout: string;
  isPublic: boolean;
  showInNavigation: boolean;
  content: string;
  createdAt: string;
  order: number;
  icon?: string;
  iconColor?: string;
}

export interface PageState {
  [id: string]: Page;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  data: {
    label: string;
    icon?: string;
    color?: string;
    config?: Record<string, any>;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  label?: string;
}

export interface WorkflowTrigger {
  type: 'schedule' | 'webhook' | 'event';
  config: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isActive: boolean;
  triggers: WorkflowTrigger[];
  parentPageId: string;
}

export interface WorkflowState {
  [id: string]: Workflow;
}

export interface AppState {
  [key: string]: any;
}

export interface LocalStorageState {
  [key: string]: any;
}

export type TabId = 'terminal' | 'debug' | 'run' | 'state' | 'settings' | 'users' | 'security' | 'components';