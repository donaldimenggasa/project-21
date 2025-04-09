import React, { useEffect, useState, useRef } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { TopNavbar } from "~/components/TopNavbar";
import { LeftSidebar } from "~/components/LeftSidebar";
import { RightSidebar } from "~/components/RightSidebar";
import MainContent from "~/components/MainContent";
import { BottomPanel } from "~/components/BottomPanel";
import { ResizeHandle } from "~/components/ResizeHandle";
import { useStore } from "~/store/zustand/store";
import { FileText, Plus, Upload } from "lucide-react";
import { CreatePageForm } from "~/components/forms/CreatePageForm";

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
    toggleDarkMode,
  } = useStore();

  // Load saved UI preferences and state
  useEffect(() => {
    try {
      // Load UI preferences
      const savedPreferences = localStorage.getItem("uiPreferences");
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);

        // Apply saved preferences
        if ("isDarkMode" in preferences) {
          // Update the theme in the store if it doesn't match the saved preference
          if (preferences.isDarkMode !== isDarkMode) {
            toggleDarkMode();
          }

          // Apply the theme class directly
          document.documentElement.classList.toggle(
            "dark",
            preferences.isDarkMode
          );
        }
      } else {
        // If no saved preferences, apply the current theme state
        document.documentElement.classList.toggle("dark", isDarkMode);
      }

      // Load saved pages
      const savedPages = localStorage.getItem("pages");
      if (savedPages) {
        try {
          // In a real implementation, we would restore the pages here
        } catch (error) { }
      }

      // Load saved workflows
      const savedWorkflows = localStorage.getItem("workflows");
      if (savedWorkflows) {
        try {
          // In a real implementation, we would restore the workflows here
        } catch (error) { }
      }

      // Load saved page app state
      const savedPageAppState = localStorage.getItem("pageAppState");
      if (savedPageAppState) {
        try {
          // In a real implementation, we would restore the page app state here
        } catch (error) { }
      }

      // Load saved localStorage
      const savedLocalStorage = localStorage.getItem("appLocalStorage");
      if (savedLocalStorage) {
        try {
          // In a real implementation, we would restore the localStorage here
        } catch (error) { }
      }
    } catch (error) {
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
    } catch (error) {
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading application...
          </p>
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
            <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Welcome to App Builder
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Get started by creating your first page or upload an existing
              state file.
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
        {showCreateForm && (
          <CreatePageForm onClose={() => setShowCreateForm(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen ">
      <TopNavbar />

      <PanelGroup direction="vertical" className="h-full">
        <Panel defaultSize={96}>
          <div className="flex flex-1 overflow-hidden h-full">
            {showLeftPanel && (<LeftSidebar />)}

            <MainContent />
            {showRightPanel && (<RightSidebar />)}

          </div>

        </Panel>
        <ResizeHandle
          orientation="horizontal"
          style={{ display: showBottomPanel ? 'flex' : 'none' }}
        />
        <Panel
          minSize={showBottomPanel ? 4 : 0}
          defaultSize={showBottomPanel ? 4 : 0}
          style={{ display: showBottomPanel ? 'block' : 'none' }}
        >
          <BottomPanel />
        </Panel>
      </PanelGroup>




    </div>
  );
}

export default App;
