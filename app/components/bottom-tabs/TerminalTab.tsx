import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, ArrowUp, Clipboard, Check } from 'lucide-react';
import { cn } from '~/lib/utils';

interface CommandHistoryItem {
  command: string;
  output: string;
  isError?: boolean;
  timestamp: Date;
}

export function TerminalTab() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([
   
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add command to history
    const newHistoryItem: CommandHistoryItem = {
      command: input,
      output: processCommand(input),
      timestamp: new Date()
    };
    
    setHistory([...history, newHistoryItem]);
    
    // Add to command history for up/down navigation
    setCommandHistory([...commandHistory, input]);
    
    // Reset
    setInput('');
    setHistoryIndex(-1);
  };

  const processCommand = (cmd: string): string => {
    const command = cmd.trim().toLowerCase();
    
    if (command === 'clear' || command === 'cls') {
      setTimeout(() => setHistory([]), 0);
      return '';
    }
    
    if (command === 'help') {
      return `Available commands:
- help: Show this help message
- clear: Clear the terminal
- version: Show app version
- echo [text]: Print text
- ls: List files`;
    }
    
    if (command === 'version') {
      return 'App Builder v1.0.0';
    }
    
    if (command.startsWith('echo ')) {
      return command.substring(5);
    }
    
    if (command === 'ls') {
      return `src/
node_modules/
package.json
README.md
tsconfig.json
vite.config.ts`;
    }
    
    return `Command not found: ${command}. Type 'help' for available commands.`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle up/down arrow for command history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const copyToClipboard = () => {
    const text = history.map(item => `$ ${item.command}\n${item.output}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col text-foreground bg-card/95 backdrop-blur-xs">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center">
          <TerminalIcon className="h-4 w-4 mr-2 text-primary" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={copyToClipboard}
            className="p-1.5 rounded hover:bg-background transition-colors text-secondary hover:text-foreground"
            title="Copy terminal output"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Clipboard className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => setHistory([])}
            className="p-1.5 rounded hover:bg-background transition-colors text-secondary hover:text-foreground"
            title="Clear terminal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 font-mono text-sm overflow-auto p-3 space-y-2 custom-scrollbar bg-card/50"
      >
        {history.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-start">
              <span className="text-success mr-2">$</span>
              <span className="flex-1">{item.command}</span>
              <span className="text-xs text-secondary ml-2">{formatTimestamp(item.timestamp)}</span>
            </div>
            <div className={cn(
              "pl-4 whitespace-pre-wrap",
              item.isError ? "text-destructive" : "text-foreground"
            )}>
              {item.output}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="border-t border-border p-3 flex items-center">
        <span className="text-success mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-hidden text-foreground font-mono text-sm"
          placeholder="Type a command..."
        />
        <button 
          type="submit" 
          className="p-1.5 rounded hover:bg-background transition-colors text-secondary hover:text-foreground"
          disabled={!input.trim()}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}