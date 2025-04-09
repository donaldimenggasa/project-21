// This file is kept for backward compatibility but now just returns values from Zustand
import { useStore } from '~/store/zustand/store';
import { useCallback } from 'react';
import { Logger } from '~/lib/logger';

/**
 * Hook that provides a Redux-like selector interface using Zustand state
 * This is maintained for backward compatibility with components that expect Redux
 * 
 * @param selector Function that selects data from the store
 * @param equalityFn Optional equality function to optimize renders
 * @returns The selected state
 */
export const useAppSelector = <T>(
  selector: (state: ReturnType<typeof useStore.getState>) => T, 
  equalityFn?: (a: T, b: T) => boolean
): T => {
  const logger = Logger.getInstance();
  
  try {
    // Create a compatibility layer for Redux-style state structure
    const zustandState = useStore.getState();
    
    // Create a Redux-like state structure
    const reduxState = {
      ui: {
        searchQuery: zustandState.searchQuery,
        isDarkMode: zustandState.isDarkMode,
        notifications: zustandState.notifications,
        showLeftPanel: zustandState.showLeftPanel,
        showRightPanel: zustandState.showRightPanel,
        showBottomPanel: zustandState.showBottomPanel,
        component: zustandState.component,
        workflow: zustandState.workflow,
        selectedPage: zustandState.selectedPage,
        selectedWorkflow: zustandState.selectedWorkflow,
        selectedComponent: zustandState.selectedComponent,
        hoveredComponent: zustandState.hoveredComponent,
        page: zustandState.page
      },
      bottomPanel: {
        activeTab: zustandState.activeTab,
        tabHistory: zustandState.tabHistory
      }
    };
    
    // Use the selector with our compatibility layer
    return useStore(
      useCallback(state => {
        try {
          return selector({
            ...state,
            ui: {
              searchQuery: state.searchQuery,
              isDarkMode: state.isDarkMode,
              notifications: state.notifications,
              showLeftPanel: state.showLeftPanel,
              showRightPanel: state.showRightPanel,
              showBottomPanel: state.showBottomPanel,
              component: state.component,
              workflow: state.workflow,
              selectedPage: state.selectedPage,
              selectedWorkflow: state.selectedWorkflow,
              selectedComponent: state.selectedComponent,
              hoveredComponent: state.hoveredComponent,
              page: state.page
            },
            bottomPanel: {
              activeTab: state.activeTab,
              tabHistory: state.tabHistory
            }
          });
        } catch (error) {
          logger.error('Error in useAppSelector', error as Error);
          return null as unknown as T;
        }
      }, []),
      equalityFn
    );
  } catch (error) {
    logger.error('Error in useAppSelector setup', error as Error);
    return null as unknown as T;
  }
};