// This file is kept for backward compatibility but now just returns actions from Zustand
import { useStore } from '~/store/zustand/store';
import { Logger } from '~/lib/logger';

/**
 * Hook that provides a Redux-like dispatch interface using Zustand actions
 * This is maintained for backward compatibility with components that expect Redux
 */
export const useAppDispatch = () => {
  const logger = Logger.getInstance();
  const {
    setSearchQuery,
    toggleDarkMode,
    setNotifications,
    toggleLeftPanel,
    toggleRightPanel,
    toggleBottomPanel,
    setComponent,
    changeComponentPosition,
    setSelectedComponent,
    setHoveredComponent,
    setWorkflow,
    updateWorkflow,
    changeNodePosition,
    changeNodeDimensions,
    updateWorkflowNodesChanges,
    updateWorkflowEdgesChanges,
    deleteWorkflow,
    setSelectedWorkflow,
    setPageAppState,
    updatePageAppState,
    deletePageAppStateKey,
    setLocalStorage,
    updateLocalStorage,
    deleteLocalStorageKey,
    createPage,
    updatePage,
    deletePage,
    reorderPages,
    setSelectedPage,
    updateComponentId,
    setActiveTab,
    downloadState,
    uploadState,
    deleteComponent
  } = useStore();

  // Return an object that mimics the Redux dispatch pattern
  return {
    setSearchQuery: (query: string) => {
      logger.debug('Dispatch: setSearchQuery', { query });
      setSearchQuery(query);
    },
    toggleDarkMode: () => {
      logger.debug('Dispatch: toggleDarkMode');
      toggleDarkMode();
    },
    setNotifications: (count: number) => {
      logger.debug('Dispatch: setNotifications', { count });
      setNotifications(count);
    },
    toggleLeftPanel: () => {
      logger.debug('Dispatch: toggleLeftPanel');
      toggleLeftPanel();
    },
    toggleRightPanel: () => {
      logger.debug('Dispatch: toggleRightPanel');
      toggleRightPanel();
    },
    toggleBottomPanel: () => {
      logger.debug('Dispatch: toggleBottomPanel');
      toggleBottomPanel();
    },
    setComponent: (component: any) => {
      logger.debug('Dispatch: setComponent', { componentId: component.id });
      setComponent(component);
    },
    changeComponentPosition: (payload: any) => {
      logger.debug('Dispatch: changeComponentPosition', { count: payload.components?.length });
      changeComponentPosition(payload);
    },
    setSelectedComponent: (id: string | null) => {
      logger.debug('Dispatch: setSelectedComponent', { id });
      setSelectedComponent(id);
    },
    setHoveredComponent: (id: string | null) => {
      // Don't log hover events to avoid spam
      setHoveredComponent(id);
    },
    setWorkflow: (workflow: any) => {
      logger.debug('Dispatch: setWorkflow', { workflowId: workflow.id });
      setWorkflow(workflow);
    },
    updateWorkflow: (payload: any) => {
      logger.debug('Dispatch: updateWorkflow', { workflowId: payload.id });
      updateWorkflow(payload);
    },
    changeNodePosition: (payload: any) => {
      logger.debug('Dispatch: changeNodePosition', { 
        workflowId: payload.workflowId,
        nodeId: payload.nodeId
      });
      changeNodePosition(payload);
    },
    changeNodeDimensions: (payload: any) => {
      logger.debug('Dispatch: changeNodeDimensions', { 
        workflowId: payload.workflowId,
        nodeId: payload.nodeId
      });
      changeNodeDimensions(payload);
    },
    updateWorkflowNodesChanges: (payload: any) => {
      logger.debug('Dispatch: updateWorkflowNodesChanges', { 
        workflowId: payload.id,
        nodeCount: payload.nodes?.length
      });
      updateWorkflowNodesChanges(payload);
    },
    updateWorkflowEdgesChanges: (payload: any) => {
      logger.debug('Dispatch: updateWorkflowEdgesChanges', { 
        workflowId: payload.id,
        edgeCount: payload.edges?.length
      });
      updateWorkflowEdgesChanges(payload);
    },
    deleteWorkflow: (id: string) => {
      logger.debug('Dispatch: deleteWorkflow', { id });
      deleteWorkflow(id);
    },
    setSelectedWorkflow: (id: string | null) => {
      logger.debug('Dispatch: setSelectedWorkflow', { id });
      setSelectedWorkflow(id);
    },
    setAppState: (pageId: string, state: any) => {
      logger.debug('Dispatch: setPageAppState', { pageId });
      setPageAppState(pageId, state);
    },
    updateAppState: (pageId: string, key: string, value: any) => {
      logger.debug('Dispatch: updatePageAppState', { pageId, key });
      updatePageAppState(pageId, key, value);
    },
    deleteAppStateKey: (pageId: string, key: string) => {
      logger.debug('Dispatch: deletePageAppStateKey', { pageId, key });
      deletePageAppStateKey(pageId, key);
    },
    setLocalStorage: (state: any) => {
      logger.debug('Dispatch: setLocalStorage');
      setLocalStorage(state);
    },
    updateLocalStorageKey: (key: string, value: any) => {
      logger.debug('Dispatch: updateLocalStorage', { key });
      updateLocalStorage(key, value);
    },
    deleteLocalStorageKey: (key: string) => {
      logger.debug('Dispatch: deleteLocalStorageKey', { key });
      deleteLocalStorageKey(key);
    },
    createPage: (page: any) => {
      logger.debug('Dispatch: createPage', { title: page.title });
      createPage(page);
    },
    updatePage: (payload: any) => {
      logger.debug('Dispatch: updatePage', { id: payload.id });
      updatePage(payload);
    },
    deletePage: (id: string) => {
      logger.debug('Dispatch: deletePage', { id });
      deletePage(id);
    },
    reorderPages: (payload: any) => {
      logger.debug('Dispatch: reorderPages', { 
        sourceId: payload.sourceId,
        destinationId: payload.destinationId
      });
      reorderPages(payload);
    },
    setSelectedPage: (id: string | null) => {
      logger.debug('Dispatch: setSelectedPage', { id });
      setSelectedPage(id);
    },
    updateComponentId: (payload: any) => {
      logger.debug('Dispatch: updateComponentId', { 
        oldId: payload.oldId,
        newId: payload.newId
      });
      updateComponentId(payload);
    },
    setActiveTab: (tab: any) => {
      logger.debug('Dispatch: setActiveTab', { tab });
      setActiveTab(tab);
    },
    downloadState: () => {
      logger.debug('Dispatch: downloadState');
      downloadState();
    },
    uploadState: (data: string) => {
      logger.debug('Dispatch: uploadState');
      uploadState(data);
    },
    deleteComponent: (id: string) => {
      logger.debug('Dispatch: deleteComponent', { id });
      deleteComponent(id);
    }
  };
};