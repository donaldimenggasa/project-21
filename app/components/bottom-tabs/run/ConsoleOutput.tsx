import React from 'react';

export function ConsoleOutput() {
  return (
    <div className="flex-1 font-mono text-sm bg-gray-950/50 p-4 overflow-auto">
      <div className="space-y-2">
        <div className="text-gray-400">$ vite</div>
        <div className="text-green-400">
          VITE v5.4.2 ready in 150 ms
        </div>
        <div className="text-blue-400">
          ➜ Local:   http://localhost:5173/
        </div>
        <div className="text-blue-400">
          ➜ Network: http://192.168.1.100:5173/
        </div>
        <div className="text-gray-400">
          press h to show help
        </div>
      </div>
    </div>
  );
}