import React, { useEffect, useState, useRef } from 'react';
import {
  Panel,
  PanelGroup,
} from 'react-resizable-panels';
import { TopNavbar } from '~/components/TopNavbar';
import { LeftSidebar } from '~/components/LeftSidebar';
import { RightSidebar } from '~/components/RightSidebar';
import MainContent from '~/components/MainContent';
import { BottomPanel } from '~/components/BottomPanel';
import { ResizeHandle } from '~/components/ResizeHandle';
import { useStore } from '~/store/zustand/store';
import { FileText, Plus, Upload } from 'lucide-react';
import { CreatePageForm } from '~/components/forms/CreatePageForm';
import { ErrorBoundary } from '~/lib/error-boundary';
import { Logger } from '~/lib/logger';

// Initialize logger
const logger = Logger.getInstance({
  level: process.env.NODE_ENV === 'production' ? 2 : 0, // INFO in prod, DEBUG in dev
  enableConsole: true,
  enableRemote: false,
  appVersion: '1.0.0'
});

function App() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    showLeftPanel, 
    showRightPanel, 
    showBottomPanel, 
    page, 
    selectedPage,
    uploadState,
    setActiveTab,
    isDarkMode,
    toggleDarkMode
  } = useStore();

  // Load saved UI preferences and state
  useEffect(() => {
    try {
      // Load UI preferences
      const savedPreferences = localStorage.getItem('uiPreferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        
        // Apply saved preferences
        if ('isDarkMode' in preferences) {
          // Update the theme in the store if it doesn't match the saved preference
          if (preferences.isDarkMode !== isDarkMode) {
            toggleDarkMode();
          }
          
          // Apply the theme class directly
          document.documentElement.classList.toggle('dark', preferences.isDarkMode);
        }
        
        logger.debug('UI preferences loaded', { preferences });
      } else {
        // If no saved preferences, apply the current theme state
        document.documentElement.classList.toggle('dark', isDarkMode);
      }
      
      // Load saved pages
      const savedPages = localStorage.getItem('pages');
      if (savedPages) {
        try {
          // In a real implementation, we would restore the pages here
          logger.debug('Pages loaded from localStorage');
        } catch (error) {
          logger.error('Error parsing saved pages', error as Error);
        }
      }
      
      // Load saved workflows
      const savedWorkflows = localStorage.getItem('workflows');
      if (savedWorkflows) {
        try {
          // In a real implementation, we would restore the workflows here
          logger.debug('Workflows loaded from localStorage');
        } catch (error) {
          logger.error('Error parsing saved workflows', error as Error);
        }
      }
      
      // Load saved page app state
      const savedPageAppState = localStorage.getItem('pageAppState');
      if (savedPageAppState) {
        try {
          // In a real implementation, we would restore the page app state here
          logger.debug('Page app state loaded from localStorage');
        } catch (error) {
          logger.error('Error parsing saved page app state', error as Error);
        }
      }
      
      // Load saved localStorage
      const savedLocalStorage = localStorage.getItem('appLocalStorage');
      if (savedLocalStorage) {
        try {
          // In a real implementation, we would restore the localStorage here
          logger.debug('App localStorage loaded from localStorage');
        } catch (error) {
          logger.error('Error parsing saved localStorage', error as Error);
        }
      }
    } catch (error) {
      logger.error('Error loading saved preferences', error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isDarkMode, toggleDarkMode]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const fileContent = await file.text();
      uploadState(fileContent);
      logger.info('State restored successfully', { fileName: file.name, fileSize: file.size });
    } catch (error) {
      logger.error('Error uploading file', error as Error);
      alert('Error uploading file: ' + (error instanceof Error ? error.message : 'Invalid file'));
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!page || Object.keys(page).length === 0) {
    return (
      <div className="h-screen w-full flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-6 bg-blue-500/10 rounded-full">
                <FileText className="h-16 w-16 text-blue-400" />
              </div>
            </div>
            <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Welcome to App Builder</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Get started by creating your first page or upload an existing state file.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Page
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 rounded-lg transition-colors duration-200"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload State
              </button>
            </div>
          </div>
        </div>
        {showCreateForm && <CreatePageForm onClose={() => setShowCreateForm(false)} />}
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              Terjadi kesalahan fatal
            </h2>
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
              <pre className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap">
                {error.message}
              </pre>
            </div>
            <button
              onClick={resetError}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              Restart Aplikasi
            </button>
          </div>
        </div>
      )}
      onError={(error) => {
        logger.error('Fatal application error', error);
      }}
    >
      <div className="h-screen w-full flex flex-col">
        <TopNavbar />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <PanelGroup direction="horizontal" className="flex-1">
            {/* Left Section: Always present but collapsed when hidden */}
            <Panel 
              defaultSize={15} 
              minSize={showLeftPanel ? 15 : 0} 
              maxSize={showLeftPanel ? 15 : 0}
              style={{ display: showLeftPanel ? 'block' : 'none' }}
            >
              <LeftSidebar />
            </Panel>

            {/* Left Resize Handle: Always present but hidden when panel is hidden */}
            <ResizeHandle 
              style={{ display: showLeftPanel ? 'flex' : 'none' }}
            />

            {/* Center Content */}
            <Panel defaultSize={55}>
              <PanelGroup direction="vertical" className="h-full">
                {/* Main Content */}
                <Panel 
                  minSize={30} 
                  defaultSize={showBottomPanel ? 70 : 100}
                >
                  <MainContent />
                </Panel>

                {/* Bottom Resize Handle */}
                <ResizeHandle 
                  orientation="horizontal" 
                  style={{ display: showBottomPanel ? 'flex' : 'none' }}
                />

                {/* Bottom Panel */}
                <Panel 
                  minSize={showBottomPanel ? 15 : 0} 
                  defaultSize={showBottomPanel ? 15 : 0}
                  style={{ display: showBottomPanel ? 'block' : 'none' }}
                >
                  <BottomPanel />
                </Panel>
              </PanelGroup>
            </Panel>

            {/* Right Resize Handle: Always present but hidden when panel is hidden */}
            <ResizeHandle 
              style={{ display: showRightPanel ? 'flex' : 'none' }}
            />

            {/* Right Section: Always present but collapsed when hidden */}
            <Panel 
              defaultSize={20} 
              minSize={showRightPanel ? 20 : 0} 
              maxSize={showRightPanel ? 35 : 0}
              style={{ display: showRightPanel ? 'block' : 'none' }}
            >
              <RightSidebar />
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;