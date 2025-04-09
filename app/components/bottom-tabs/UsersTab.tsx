import React from 'react';
import { UserPlus } from 'lucide-react';

export function UsersTab() {
  return (
    <div className="h-full flex flex-col text-gray-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-md flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((user) => (
            <div key={user} className="bg-gray-800/30 rounded-lg p-4 flex items-center space-x-4">
              <img
                src={`https://images.unsplash.com/photo-${1500000000000 + user}?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`}
                alt="User"
                className="h-10 w-10 rounded-full"
              />
              <div>
                <div className="text-sm font-medium">User {user}</div>
                <div className="text-sm text-gray-400">user{user}@example.com</div>
              </div>
              <div className="ml-auto">
                <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}