import React from 'react';
import { PanelResizeHandle, type PanelResizeHandleProps } from 'react-resizable-panels';

export function ResizeHandle({ className = '', orientation = 'vertical', ...props }: any) {
  const isHorizontal = orientation === 'horizontal';
  
  return (
    <PanelResizeHandle
      {...props}
      className={`
        group relative flex items-center justify-center
        ${isHorizontal 
          ? 'h-2 -my-1 cursor-row-resize' 
          : 'w-2 -mx-1 cursor-col-resize'
        }
        transition-all duration-150 ease-in-out
        hover:bg-gray-800/10
        ${className}
      `}
    >
      <div
        className={`
          absolute transition-all duration-150 ease-in-out
          bg-gray-700 group-hover:bg-gray-600
          ${isHorizontal
            ? 'h-[2px] w-8 shadow-[0_-1px_2px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.3)]'
            : 'w-[2px] h-8 shadow-[-1px_0_2px_rgba(0,0,0,0.3),1px_0_2px_rgba(0,0,0,0.3)]'
          }
        `}
      />
    </PanelResizeHandle>
  );
}