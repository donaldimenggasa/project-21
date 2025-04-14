import React, { useState } from 'react';
import { Box, Database } from 'lucide-react';
import { NodesTab } from './run/NodesTab';
import { QueryTab } from './run/QueryTab';
import { FlowEditor } from './run/FlowEditor';
import { cn } from '~/lib/utils';
import { useStore } from '~/store/zustand/store';

type TabType = 'nodes' | 'query';

export function RunTab() {
 


  return (
    <div className="h-full flex text-gray-300">
      <div className="w-[280px] border-r border-gray-800 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <QueryTab />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <FlowEditor />
      </div>
    </div>
  );
}