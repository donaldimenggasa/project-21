import React, { useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Pen } from 'lucide-react';

interface SignatureFieldProps {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
  width?: number;
  height?: number;
}

export function SignatureField({ 
  name, 
  label, 
  description, 
  required, 
  readonly, 
  width = 400, 
  height = 200 
}: SignatureFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const isDrawing = useRef(false);
  const value = watch(name);

  // Load saved signature when component mounts or value changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If there's a saved signature, load it
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = value;
    }
  }, [value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || readonly) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial styles
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    let lastX = 0;
    let lastY = 0;

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e 
        ? e.touches[0].clientX - rect.left
        : e.clientX - rect.left;
      const y = 'touches' in e 
        ? e.touches[0].clientY - rect.top
        : e.clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      lastX = x;
      lastY = y;
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawing.current = true;
      const rect = canvas.getBoundingClientRect();
      lastX = 'touches' in e 
        ? e.touches[0].clientX - rect.left
        : e.clientX - rect.left;
      lastY = 'touches' in e 
        ? e.touches[0].clientY - rect.top
        : e.clientY - rect.top;
    };

    const stopDrawing = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      // Save signature to form state
      setValue(name, canvas.toDataURL(), { shouldDirty: true });
    };

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrawing(e);
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      draw(e);
    });
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      stopDrawing();
    });

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [name, readonly, setValue]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setValue(name, '', { shouldDirty: true });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="space-y-2">
        <div className={`
          relative border-2 rounded-lg overflow-hidden
          ${readonly ? 'cursor-not-allowed' : 'cursor-crosshair'}
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}>
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="touch-none bg-white"
          />
          
          {/* Placeholder text when empty */}
          {!value && !readonly && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
              <span className="text-sm">Click or touch to sign</span>
            </div>
          )}
        </div>

        {!readonly && (
          <button
            type="button"
            onClick={clearSignature}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
          >
            <Pen className="h-4 w-4 mr-2" />
            Clear Signature
          </button>
        )}
      </div>

      <input type="hidden" {...register(name)} />
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}