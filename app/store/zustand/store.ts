import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createId, generateChecksum } from '~/lib/utils';
import { sampleComponents } from '~/sample_template';
import { divConfig } from '~/components/widgets/DivWidget';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { Logger } from '~/lib/logger';
import { Cache } from '~/lib/cache';


// Types
import type { 
  ComponentState, 
  WorkflowState, 
  AppState, 
  LocalStorageState,
  PageState,
  Page,
  Workflow,
  TabId
} from '../types';

const defaultPageId = 'page-bYNmnE6';
const logger = Logger.getInstance();

interface ComponentPositionPayload {
  id: string;
  parentId: string | null;
}

interface ChangeComponentPositionPayload {
  components: ComponentPositionPayload[];
}

// Memisahkan state menjadi slice-slice yang lebih kecil
interface UISlice {
  searchQuery: string;
  isDarkMode: boolean;
  notifications: number;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  showBottomPanel: boolean;
  activeTab: TabId;
  tabHistory: TabId[];
}

interface ComponentSlice {
  component: ComponentState;
}

interface WorkflowSlice {
  workflow: WorkflowState;
  selectedWorkflow: string | null;
}

interface PageSlice {
  page: PageState;
  selectedPage: string | null;
}

interface SelectionSlice {
  selectedComponent: string | null;
  hoveredComponent: string | null;
}

interface StorageSlice {
  pageAppState: Record<string, Record<string, any>>;
  localStorage: LocalStorageState;
}


interface UIState extends 
  UISlice, 
  ComponentSlice, 
  WorkflowSlice, 
  PageSlice, 
  SelectionSlice, 
  StorageSlice {}

// Actions juga dipisahkan berdasarkan slice
interface UIActions {
  setSearchQuery: (query: string) => void;
  toggleDarkMode: () => void;
  setNotifications: (count: number) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  setActiveTab: (tab: TabId) => void;
}

interface ComponentActions {
  setComponent: (component: any) => void;
  changeComponentPosition: (payload: ChangeComponentPositionPayload) => void;
  updateComponentId: (payload: { oldId: string; newId: string }) => void;
  deleteComponent: (id: string) => void;
}

interface WorkflowActions {
  setWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (payload: Partial<Workflow> & { id: string } | { id: string, nodes: (prev: any[]) => any[] } | { id: string, edges: (prev: any[]) => any[] }) => void;
  changeNodePosition: (payload: { workflowId: string; nodeId: string; position: { x: number; y: number } }) => void;
  changeNodeDimensions: (payload: { workflowId: string; nodeId: string; dimensions: { width: number; height: number } }) => void;
  updateWorkflowNodesChanges: (payload: Partial<Workflow> & { id: string }) => void;
  updateWorkflowEdgesChanges: (payload: Partial<Workflow> & { id: string }) => void;
  deleteWorkflow: (id: string) => void;
  setSelectedWorkflow: (id: string | null) => void;
}

interface PageActions {
  createPage: (page: Page) => void;
  updatePage: (payload: Partial<Page> & { id: string }) => void;
  deletePage: (id: string) => void;
  reorderPages: (payload: { sourceId: string; destinationId: string }) => void;
  setSelectedPage: (id: string | null) => void;
}

interface SelectionActions {
  setSelectedComponent: (id: string | null) => void;
  setHoveredComponent: (id: string | null) => void;
}

interface StorageActions {
  setPageAppState: (pageId: string, state: Record<string, any>) => void;
  updatePageAppState: (pageId: string, key: string, value: any) => void;
  deletePageAppStateKey: (pageId: string, key: string) => void;
  setLocalStorage: (state: LocalStorageState) => void;
  updateLocalStorage: (key: string, value: any) => void;
  deleteLocalStorageKey: (key: string) => void;
  downloadState: () => void;
  uploadState: (data: string) => void;
}

// Gabungkan semua actions
interface AllActions extends 
  UIActions, 
  ComponentActions, 
  WorkflowActions, 
  PageActions, 
  SelectionActions, 
  StorageActions {}

// Initial state untuk setiap slice
const initialUISlice: UISlice = {
  searchQuery: '',
  isDarkMode: true,
  notifications: 3,
  showLeftPanel: true,
  showRightPanel: true,
  showBottomPanel: true,
  activeTab: 'terminal',
  tabHistory: ['terminal'],
};

const initialComponentSlice: ComponentSlice = {
  component: sampleComponents,
};


const initialWorkflowSlice: WorkflowSlice = {
  workflow: {},
  selectedWorkflow: null,
};

const initialPageSlice: PageSlice = {
  page: {
    [defaultPageId]: {
      "id": "page-bYNmnE6",
      "title": "sdas",
      "description": "sdas\n",
      "icon": "Layout",
      "iconColor": "#6b7280",
      "layout": "default",
      "isPublic": false,
      "showInNavigation": true,
      "content": "",
      "createdAt": "2025-04-06T22:31:35.443Z",
      "order": 4
    },
  },
  selectedPage: defaultPageId,
};

const initialSelectionSlice: SelectionSlice = {
  selectedComponent: null,
  hoveredComponent: null,
};

const initialStorageSlice: StorageSlice = {
  pageAppState: {},
  localStorage: {},
};

const initialState: UIState = {
  ...initialUISlice,
  ...initialComponentSlice,
  ...initialWorkflowSlice,
  ...initialPageSlice,
  ...initialSelectionSlice,
  ...initialStorageSlice,
};



export const useStore = create<UIState & AllActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      ...initialState,

      // UI Actions
      setSearchQuery: (query) => set(state => {
        state.searchQuery = query;
      }),

      toggleDarkMode: () => set(state => {
        state.isDarkMode = !state.isDarkMode;
        
        // Save to localStorage
        try {
          const preferences = JSON.parse(localStorage.getItem('uiPreferences') || '{}');
          preferences.isDarkMode = state.isDarkMode;
          localStorage.setItem('uiPreferences', JSON.stringify(preferences));
          
          // Apply the theme class directly
          if (state.isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          logger.debug('Dark mode toggled', { isDarkMode: state.isDarkMode });
        } catch (error) {
          logger.error('Error saving dark mode preference', error as Error);
        }
      }),

      setNotifications: (count) => set(state => {
        state.notifications = count;
      }),

      toggleLeftPanel: () => set(state => {
        state.showLeftPanel = !state.showLeftPanel;
      }),

      toggleRightPanel: () => set(state => {
        state.showRightPanel = !state.showRightPanel;
      }),

      toggleBottomPanel: () => set(state => {
        state.showBottomPanel = !state.showBottomPanel;
      }),

      setActiveTab: (tab) => set(state => {
        if (state.activeTab !== tab) {
          state.activeTab = tab;
          state.tabHistory = [...state.tabHistory, tab].slice(-5); // Keep last 5 tabs
        }
      }),

      // Component Actions
      setComponent: (component) => set(state => {
        if (component.id) {
          state.component[component.id] = component;
        } else {
          state.component = component;
        }
      }),

      changeComponentPosition: (payload) => set(state => {
        const { components } = payload;
        components.forEach((item, index) => {
          const component = state.component[item.id];
          if (component) {
            component.parentId = item.parentId;
            component.order = index;
            if ('updatedAt' in component) {
              component.updatedAt = Date.now();
            }
          }
        });
      }),

      updateComponentId: (payload) => set(state => {
        const { oldId, newId } = payload;
        
        if (state.component[newId]) {
          return;
        }

        const oldComponent = state.component[oldId];
        if (!oldComponent) {
          return;
        }

        const newComponent = {
          ...oldComponent,
          id: newId
        };

        Object.values(state.component).forEach(component => {
          if (component.parentId === oldId) {
            component.parentId = newId;
          }
        });

        delete state.component[oldId];
        state.component[newId] = newComponent;

        if (state.selectedComponent === oldId) {
          state.selectedComponent = newId;
        }

        if (state.hoveredComponent === oldId) {
          state.hoveredComponent = newId;
        }
      }),

      deleteComponent: (id) => set(state => {
        // First, recursively find all child components
        const findAllChildren = (parentId: string): string[] => {
          const children = Object.values(state.component)
            .filter(comp => comp.parentId === parentId)
            .map(comp => comp.id);
          
          return [
            ...children,
            ...children.flatMap(childId => findAllChildren(childId))
          ];
        };
        
        const childrenIds = findAllChildren(id);
        const allIdsToDelete = [id, ...childrenIds];
        
        // Delete all components
        allIdsToDelete.forEach(compId => {
          delete state.component[compId];
        });
        
        // Clear selection if deleted
        if (state.selectedComponent === id || childrenIds.includes(state.selectedComponent as string)) {
          state.selectedComponent = null;
        }
        
        // Clear hover if deleted
        if (state.hoveredComponent === id || childrenIds.includes(state.hoveredComponent as string)) {
          state.hoveredComponent = null;
        }
        
        logger.info('Component deleted', { id, childrenCount: childrenIds.length });
      }),

      // Workflow Actions
      setWorkflow: (workflow) => set(state => {
        state.workflow[workflow.id] = workflow;
      }),

      updateWorkflow: (payload) => set(state => {
        if (state.workflow[payload.id]) {
          if ('nodes' in payload && typeof payload.nodes === 'function') {
            // Handle function-based node updates
            const currentNodes = state.workflow[payload.id].nodes || [];
            state.workflow[payload.id].nodes = payload.nodes(currentNodes);
            state.workflow[payload.id].updatedAt = new Date().toISOString();
          } else if ('edges' in payload && typeof payload.edges === 'function') {
            // Handle function-based edge updates
            const currentEdges = state.workflow[payload.id].edges || [];
            state.workflow[payload.id].edges = payload.edges(currentEdges);
            state.workflow[payload.id].updatedAt = new Date().toISOString();
          } else {
            // Handle regular updates
            state.workflow[payload.id] = {
              ...state.workflow[payload.id],
              ...payload,
              updatedAt: new Date().toISOString()
            };
          }
        }
      }),

      changeNodePosition: (payload) => set(state => {
        const { workflowId, nodeId, position } = payload;
        if (!state.workflow[workflowId]) return;
        if (!state.workflow[workflowId].nodes) return;
        
        const nodeTarget = state.workflow[workflowId].nodes.find((node) => node.id === nodeId);
        if (nodeTarget) {
          nodeTarget.position = {
            x: position.x,
            y: position.y,
          };
        }
      }),

      changeNodeDimensions: (payload) => set(state => {
        const { workflowId, nodeId, dimensions } = payload;
        if (!state.workflow[workflowId]) return;
        if (!state.workflow[workflowId].nodes) return;
        
        const nodeTarget = state.workflow[workflowId].nodes.find((node) => node.id === nodeId);
        if (nodeTarget) {
          nodeTarget.width = dimensions.width;
          nodeTarget.height = dimensions.height;
        }
      }),

      updateWorkflowNodesChanges: (payload) => set(state => {
        const { id, nodes } = payload;
        if (state.workflow[id]) {
          state.workflow[id].nodes = nodes || [];
          state.workflow[id].updatedAt = new Date().toISOString();
        }
      }),

      updateWorkflowEdgesChanges: (payload) => set(state => {
        const { id, edges } = payload;
        if (state.workflow[id]) {
          state.workflow[id].edges = edges || [];
          state.workflow[id].updatedAt = new Date().toISOString();
        }
      }),

      deleteWorkflow: (id) => set(state => {
        if (state.workflow[id]) {
          delete state.workflow[id];
          if (state.selectedWorkflow === id) {
            state.selectedWorkflow = null;
          }
        }
      }),

      setSelectedWorkflow: (id) => set(state => {
        state.selectedWorkflow = id;
        
        // If selecting a workflow, make sure the page is also selected
        if (id) {
          const workflow = state.workflow[id];
          if (workflow && workflow.parentPageId !== state.selectedPage) {
            state.selectedPage = workflow.parentPageId;
          }
        }
      }),

      // Page Actions
      createPage: (page) => set(state => {
        const id = createId();
        const maxOrder = Object.values(state.page).reduce((max, page) => Math.max(max, page.order || 0), -1);
        const newPage = {
          ...page,
          id: `page-${id}`,
          order: maxOrder + 1,
          createdAt: new Date().toISOString()
        };
        
        state.page[`page-${id}`] = newPage;
        state.component[`root-${id}`] = {
          ...divConfig,
          props: {
            ...divConfig.props,
            className: {
              ...divConfig.props.className,
              value: `bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-full w-full`,
            }
          },
          id: `root-${id}`,
          pageId: `page-${id}`,
          parentId: null,
          order: 0,
        };
        
        state.selectedPage = `page-${id}`;
        state.selectedComponent = `root-${id}`;
      }),

      updatePage: (payload) => set(state => {
        if (state.page[payload.id]) {
          state.page[payload.id] = {
            ...state.page[payload.id],
            ...payload,
          };
        }
      }),

      deletePage: (id) => set(state => {
        if (state.page[id]) {
          delete state.page[id];
          if (state.selectedPage === id) {
            // Find next page to select
            const remainingPages = Object.values(state.page)
              .sort((a, b) => a.order - b.order);
            
            state.selectedPage = remainingPages.length > 0 ? remainingPages[0].id : null;
          }
        }
      }),

      reorderPages: (payload) => set(state => {
        const { sourceId, destinationId } = payload;
        const sourcePage = state.page[sourceId];
        const destinationPage = state.page[destinationId];

        if (!sourcePage || !destinationPage) return;

        const sourceOrder = sourcePage.order;
        const destinationOrder = destinationPage.order;

        Object.values(state.page).forEach(page => {
          if (sourceOrder < destinationOrder) {
            if (page.order > sourceOrder && page.order <= destinationOrder) {
              page.order--;
            }
          } else {
            if (page.order >= destinationOrder && page.order < sourceOrder) {
              page.order++;
            }
          }
        });

        sourcePage.order = destinationOrder;
      }),

      setSelectedPage: (id) => set(state => {
        state.selectedPage = id;
        state.selectedWorkflow = null;
        
        // Find workflows for the selected page
        if (id) {
          const pageWorkflows = Object.values(state.workflow)
            .filter(w => w.parentPageId === id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          // Select first workflow if available
          if (pageWorkflows.length > 0) {
            state.selectedWorkflow = pageWorkflows[0].id;
          }
        }
      }),

      // Selection Actions
      setSelectedComponent: (id) => set(state => {
        state.selectedComponent = id;
      }),

      setHoveredComponent: (id) => set(state => {
        state.hoveredComponent = id;
      }),

      // Storage Actions
      setPageAppState: (pageId, appState) => set(state => {
        state.pageAppState[pageId] = appState;
      }),

      updatePageAppState: (pageId, key, value) => set(state => {
        if (!state.pageAppState[pageId]) {
          state.pageAppState[pageId] = {};
        }
        state.pageAppState[pageId][key] = value;
      }),

      deletePageAppStateKey: (pageId, key) => set(state => {
        if (state.pageAppState[pageId]) {
          delete state.pageAppState[pageId][key];
        }
      }),

      setLocalStorage: (localStorage) => set(state => {
        state.localStorage = localStorage;
      }),

      updateLocalStorage: (key, value) => set(state => {
        state.localStorage[key] = value;
      }),

      deleteLocalStorageKey: (key) => set(state => {
        delete state.localStorage[key];
      }),

      downloadState: () => {
        const state = get();
        const stateString = JSON.stringify({
          component: state.component,
          workflow: state.workflow,
          page: state.page,
          pageAppState: state.pageAppState,
          localStorage: state.localStorage
        });
        
        const downloadData = { 
          state: {
            component: state.component,
            workflow: state.workflow,
            page: state.page,
            pageAppState: state.pageAppState,
            localStorage: state.localStorage
          }, 
          checksum: generateChecksum(stateString)
        };
        
        const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'app-state.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },

      uploadState: (fileContent) => set(state => {
        try {
          const uploadedData = JSON.parse(fileContent);

          // Validate structure
          if (!uploadedData.state || !uploadedData.checksum) {
            throw new Error('Invalid file format');
          }

          // Validate checksum
          const calculatedChecksum = generateChecksum(JSON.stringify(uploadedData.state));
          if (calculatedChecksum !== uploadedData.checksum) {
            throw new Error('Invalid checksum');
          }

          // Restore state
          const { state: newState } = uploadedData;

          // Reset all state first
          state.component = {};
          state.workflow = {};
          state.pageAppState = {};
          state.localStorage = {};
          state.page = {};
          state.selectedWorkflow = null;
          state.selectedPage = null;

          // Then restore each state slice
          Object.entries(newState.component || {}).forEach(([id, data]) => {
            if (typeof data === 'object' && data !== null) {
              state.component[id] = data as any;
            }
          });

          Object.entries(newState.workflow || {}).forEach(([id, data]) => {
            if (typeof data === 'object' && data !== null) {
              state.workflow[id] = data as any;
            }
          });

          Object.entries(newState.page || {}).forEach(([id, data]) => {
            state.page[id] = data as any;
          });

          state.pageAppState = newState.pageAppState || {};
          state.localStorage = newState.localStorage || {};

          // Set selected page to first page in uploaded state
          const pages = Object.values(newState.page || {});
          if (pages.length > 0) {
            state.selectedPage = pages[0].id;
          }
        } catch (error) {
          logger.error('Error uploading file:', error as Error);
          throw error;
        }
      })
    }))
  )
);

// Utility selectors for easier store usage
export const useRootComponent = () => useStore(
  state => {
    const rootComponent = Object.values(state.component).find(
      c => c.parentId === null && c.pageId === state.selectedPage
    );
    return rootComponent;
  },
  (a, b) => a?.id === b?.id
);

export const useComponentChildren = (parentId: string) => {
  // Create a memoized selector function to avoid recreating it on each render
  const selector = React.useMemo(
    () => (state: UIState) => 
      Object.values(state.component)
        .filter(c => c.parentId === parentId)
        .sort((a, b) => a.order - b.order),
    [parentId]
  );
  
  return useStore(selector, shallow);
};
