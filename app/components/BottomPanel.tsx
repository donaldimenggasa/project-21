import React from 'react';
import { 
  Terminal, 
  Bug, 
  Play, 
  Database, 
  Settings, 
  Users, 
  KeyRound, 
  Layers,
  Code2,
  LayoutGrid,
  MessageSquare
} from 'lucide-react';
import { useStore } from '~/store/zustand/store';
import { TerminalTab } from '~/components/bottom-tabs/TerminalTab';
import { DebugTab } from '~/components/bottom-tabs/DebugTab';
import { RunTab } from '~/components/bottom-tabs/RunTab';
import { StateTab } from '~/components/bottom-tabs/StateTab';
import { SettingsTab } from '~/components/bottom-tabs/SettingsTab';
import { UsersTab } from '~/components/bottom-tabs/UsersTab';
import { SecurityTab } from '~/components/bottom-tabs/SecurityTab';
import { ComponentsTab } from '~/components/bottom-tabs/ComponentsTab';
import { cn } from '~/lib/utils';
import type { TabId } from '~/store/types';

export function BottomPanel() {
  const { activeTab, setActiveTab } = useStore();

  const leftTabs = [
    { 
      id: 'terminal' as TabId, 
      icon: Terminal, 
      label: 'Terminal', 
      color: 'emerald',
      description: 'Command line interface'
    },
    { 
      id: 'debug' as TabId, 
      icon: Bug, 
      label: 'Debug', 
      color: 'amber',
      description: 'Debug and inspect state'
    },
    { 
      id: 'run' as TabId, 
      icon: Play, 
      label: 'Run', 
      color: 'blue',
      description: 'Run workflows'
    },
    { 
      id: 'state' as TabId, 
      icon: Database, 
      label: 'State', 
      color: 'purple',
      description: 'Manage application state'
    },
  ];

  const rightTabs = [
    { 
      id: 'components' as TabId, 
      icon: LayoutGrid, 
      label: 'Components', 
      color: 'indigo',
      description: 'UI Components'
    },
    { 
      id: 'settings' as TabId, 
      icon: Settings, 
      label: 'Settings', 
      color: 'slate',
      description: 'Application settings'
    },
    { 
      id: 'users' as TabId, 
      icon: Users, 
      label: 'Users', 
      color: 'pink',
      description: 'User management'
    },
    { 
      id: 'security' as TabId, 
      icon: KeyRound, 
      label: 'Security', 
      color: 'red',
      description: 'Security settings'
    },
  ];

  const getTabStyles = (tabId: TabId, color: string) => {
    const isActive = activeTab === tabId;
    return cn(
      'px-4 py-2 flex items-center gap-2 text-sm font-medium relative transition-all',
      isActive 
        ? `text-${color}-500` 
        : 'text-secondary hover:text-foreground',
      isActive && `after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-${color}-500 after:rounded-full`
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'terminal':
        return <TerminalTab />;
      case 'debug':
        return <DebugTab />;
      case 'run':
        return <RunTab />;
      case 'state':
        return <StateTab />;
      case 'components':
        return <ComponentsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'users':
        return <UsersTab />;
      case 'security':
        return <SecurityTab />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col  border-t border-gray-800">
      {/* Tabs Header */}
      <div className="border-b border-gray-800 flex justify-between ">
        {/* Left Tabs */}
        <div className="flex">
          {leftTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={getTabStyles(tab.id, tab.color)}
              title={tab.description}
            >
              <tab.icon className={cn(`h-4 w-4`, activeTab === tab.id ? `text-${tab.color}-500` : '')} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Tabs */}
        <div className="flex">
          {rightTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={getTabStyles(tab.id, tab.color)}
              title={tab.description}
            >
              <tab.icon className={cn(`h-4 w-4`, activeTab === tab.id ? `text-${tab.color}-500` : '')} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
}