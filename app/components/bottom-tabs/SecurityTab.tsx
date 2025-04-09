import React from 'react';
import { Shield, Key, Lock } from 'lucide-react';

export function SecurityTab() {
  return (
    <div className="h-full flex flex-col text-gray-300">
      <div className="flex-1 overflow-auto">
        <div className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center space-x-4">
            <Shield className="h-5 w-5 text-green-400" />
            <div className="text-sm text-green-400">All security checks passed</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg">
              <Key className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-sm font-medium">API Keys</div>
                <div className="text-sm text-gray-400">Manage your API keys</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg">
              <Lock className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-sm font-medium">Access Control</div>
                <div className="text-sm text-gray-400">Configure access permissions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}