import React, { useState, useCallback } from 'react';
import { Layout, Box, FileText, FolderTree, Database, Settings, Plus } from 'lucide-react';
import { cn } from '~/lib/utils';
import { PagesTab } from './left-tabs/PagesTab';
import { ComponentsTab } from './left-tabs/ComponentsTab';

type TabType = 'pages' | 'components' | 'files' | 'database' | 'settings';

interface TabConfig {
  id: TabType;
  icon: React.ElementType;
  label: string;
  color: string;
}

export function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<TabType>('pages');

  const tabs: TabConfig[] = [
    { id: 'pages', icon: Layout, label: 'Pages', color: 'blue' },
    { id: 'components', icon: Box, label: 'Components', color: 'violet' },
    { id: 'files', icon: FileText, label: 'Files', color: 'emerald' },
    { id: 'database', icon: Database, label: 'Database', color: 'amber' },
    { id: 'settings', icon: Settings, label: 'Settings', color: 'slate' }
  ];

  const tabButton = useCallback((tab: TabConfig) => {
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={cn(
          'flex flex-col items-center justify-center py-3 px-1 transition-colors relative',
          isActive
            ? `text-${tab.color}-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-${tab.color}-500`
            : 'text-secondary hover:text-foreground'
        )}
        title={tab.label}
      >
        <tab.icon className={cn("h-5 w-5", isActive && `text-${tab.color}-500`)} />
        <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
      </button>
    );
  }, [activeTab]);

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Tabs */}
      <div className="flex justify-between border-b border-border px-1">
        <div className="flex-1 flex justify-between">
          {tabs.map(tab => tabButton(tab))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'pages' && <PagesTab />}
        {activeTab === 'components' && <ComponentsTab />}
        {activeTab === 'files' && (
          <div className="p-4 flex flex-col items-center justify-center h-full text-secondary">
            <FileText className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-sm">File manager coming soon</p>
            <button className="mt-4 btn btn-sm btn-outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Files
            </button>
          </div>
        )}
        {activeTab === 'database' && (
          <div className="p-4 flex flex-col items-center justify-center h-full text-secondary">
            <Database className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-sm">Database manager coming soon</p>
            <button className="mt-4 btn btn-sm btn-outline">
              <Plus className="h-4 w-4 mr-1" />
              Connect Database
            </button>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="p-4 flex flex-col items-center justify-center h-full text-secondary">
            <Settings className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-sm">Settings panel coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}