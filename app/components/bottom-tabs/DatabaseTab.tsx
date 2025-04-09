import React from 'react';
import { Table, Plus, Trash2 } from 'lucide-react';

export function DatabaseTab() {
  return (
    <div className="h-full flex flex-col text-gray-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Query</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left py-2 px-4">Table Name</th>
              <th className="text-left py-2 px-4">Records</th>
              <th className="text-left py-2 px-4">Size</th>
              <th className="text-left py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800/50 hover:bg-gray-800/30">
              <td className="py-2 px-4 flex items-center">
                <Table className="h-4 w-4 mr-2 text-purple-400" />
                users
              </td>
              <td className="py-2 px-4">1,234</td>
              <td className="py-2 px-4">2.3 MB</td>
              <td className="py-2 px-4">
                <button className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}