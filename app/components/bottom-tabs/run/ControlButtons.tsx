import React from 'react';
import { Play, RefreshCw, XCircle } from 'lucide-react';
import clsx from 'clsx';

export function ControlButtons() {
  const buttonBase = clsx(
    'px-3 py-1',
    'rounded-md',
    'flex items-center space-x-2'
  );

  const buttonVariants = {
    green: clsx(buttonBase, 'bg-green-500/10 hover:bg-green-500/20 text-green-400'),
    blue: clsx(buttonBase, 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400'),
    red: clsx(buttonBase, 'bg-red-500/10 hover:bg-red-500/20 text-red-400'),
  };

  return (
    <div className="flex items-center space-x-2 p-4 border-b border-gray-800">
      <button className={buttonVariants.green}>
        <Play className="h-4 w-4" />
        <span>Run</span>
      </button>
      <button className={buttonVariants.blue}>
        <RefreshCw className="h-4 w-4" />
        <span>Restart</span>
      </button>
      <button className={buttonVariants.red}>
        <XCircle className="h-4 w-4" />
        <span>Stop</span>
      </button>
    </div>
  );
}