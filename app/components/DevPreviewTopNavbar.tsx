import React, { useRef, useState, useEffect } from 'react';
import { Menu, Bell, ChevronDown, PanelLeft, PanelRight, PanelBottom, Download, Upload, Sun, Moon, Settings, User, LogOut } from 'lucide-react';
import { useStore } from '~/store/zustand/store';
import { cn } from '~/lib/utils';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNavigate } from '@remix-run/react'



export const DevPreviewTopNavbar: React.FC<any> = React.memo(() => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate()
  const goBack = () => navigate(-1)

  const {
    showLeftPanel,
    showRightPanel,
    showBottomPanel,
    notifications,
    isDarkMode,
    toggleLeftPanel,
    toggleRightPanel,
    toggleBottomPanel,
    toggleDarkMode,
    downloadState,
    uploadState
  } = useStore();

  // Apply dark mode class to document when isDarkMode changes
  /*useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('uiPreferences', JSON.stringify({ isDarkMode }));
    
    logger.debug('Theme changed', { isDarkMode });
  }, [isDarkMode, logger]);
*/



  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      uploadState(fileContent);
      alert('State restored successfully');
    } catch (error) {
      alert('Error uploading file: ' + (error instanceof Error ? error.message : 'Invalid file'));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-10 bg-card border-b border-gray-800 px-4 flex items-center justify-between bg-gray-900">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <button onClick={goBack}>
            <Menu className="h-5 w-5 text-secondary" />
          </button>
          <h1 className="ml-3 text-sm font-bold text-foreground">APP BUILDER</h1>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-1 bg-gray-900 px-1.5 py-1 rounded-lg border border-gray-800">
          fsdf
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-sm btn-outline"
            title="Upload State"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            <span className="text-xs">Import</span>
          </button>
          <button
            onClick={downloadState}
            className="btn btn-sm btn-outline"
            title="Download State"
          >
            <Download className="h-4 w-4 mr-1.5" />
            <span className="text-xs">Export</span>
          </button>
        </div>

        <button
          className="relative p-1.5 rounded-full hover:bg-background"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-indigo-500" />
          )}
        </button>

        <button className="relative p-1.5 rounded-full hover:bg-background">
          <Bell className="h-5 w-5 text-secondary" />
          {notifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center font-medium">
              {notifications}
            </span>
          )}
        </button>

        <DropdownMenu.Root open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-background">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="h-7 w-7 rounded-full border border-border"
              />
              <ChevronDown className="h-4 w-4 text-secondary" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[220px] overflow-hidden rounded-md border border-border bg-card p-1 shadow-md animate-in slide-in-from-top-2"
              sideOffset={5}
              align="end"
            >
              <div className="px-2 py-1.5 text-sm font-medium text-foreground/80 border-b border-border mb-1">
                User Settings
              </div>

              <DropdownMenu.Item className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenu.Item>

              <DropdownMenu.Item className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-border" />

              <DropdownMenu.Item className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-destructive focus:text-destructive-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
});

DevPreviewTopNavbar.displayName = 'DevPreviewTopNavbar';