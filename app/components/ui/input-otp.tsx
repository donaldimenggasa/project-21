"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InputOTPProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  className?: string;
}

export function InputOTP({ value, onChange, maxLength = 6, className }: InputOTPProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    // Initialize refs array
    inputRefs.current = inputRefs.current.slice(0, maxLength);
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, [maxLength]);

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newChar = e.target.value.slice(-1);
    
    if (newChar.match(/^[0-9]$/)) {
      // Update the OTP value
      const newOTP = value.split('');
      newOTP[index] = newChar;
      onChange(newOTP.join(''));
      
      // Move to next input if available
      if (index < maxLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[index]) {
        // Clear current input
        const newOTP = value.split('');
        newOTP[index] = '';
        onChange(newOTP.join(''));
      } else if (index > 0) {
        // Move to previous input
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < maxLength - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const numbers = pastedData.match(/\d/g);
    if (numbers) {
      const newValue = numbers.slice(0, maxLength).join('');
      onChange(newValue);
      // Focus last input after paste
      inputRefs.current[Math.min(newValue.length, maxLength - 1)]?.focus();
    }
  };

  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {Array.from({ length: maxLength }).map((_, index) => (
        <input
          key={index}
          ref={el => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInputChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "w-12 h-14 text-center text-2xl font-semibold",
            "rounded-md border border-gray-300",
            "focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
            "dark:bg-gray-800 dark:border-gray-600 dark:text-white",
            "transition-all duration-200"
          )}
        />
      ))}
    </div>
  );
}