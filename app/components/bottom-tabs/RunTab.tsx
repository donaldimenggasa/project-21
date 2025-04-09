import React, { useState } from 'react';
import { Box, Database } from 'lucide-react';
import { NodesTab } from './run/NodesTab';
import { QueryTab } from './run/QueryTab';
import { FlowEditor } from './run/FlowEditor';
import { cn } from '~/lib/utils';
import { useStore } from '~/store/zustand/store';

type TabType = 'nodes' | 'query';

export function RunTab() {
  const [activeTab, setActiveTab] = useState<TabType>('query');
  const { selectedPage } = useStore();

  const tabButton = (isActive: boolean, color: string) => cn(
    'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
    isActive && [
      `text-${color}-400`,
      'border-b-2',
      `border-${color}-400`
    ],
    !isActive && [
      'text-gray-400',
      'hover:text-gray-300'
    ]
  );

  return (
    <div className="h-full flex text-gray-300">
      <div className="w-[280px] border-r border-gray-800 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('query')}
            className={tabButton(activeTab === 'query', 'purple')}
          >
            <Database className="h-4 w-4" />
            Query
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={tabButton(activeTab === 'nodes', 'blue')}
          >
            <Box className="h-4 w-4" />
            Nodes
          </button>
          
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {activeTab === 'nodes' ? <NodesTab /> : <QueryTab />}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <FlowEditor />
      </div>
    </div>
  );
}