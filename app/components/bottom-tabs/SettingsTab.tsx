import React from 'react';
import { Save } from 'lucide-react';

export function SettingsTab() {
  return (
    <div className="h-full flex flex-col text-gray-300">
      <div className="flex-1 overflow-auto">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-200">Editor Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Theme</label>
                <select className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm">
                  <option>Dark</option>
                  <option>Light</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Font Size</label>
                <input type="number" value="14" className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" />
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}