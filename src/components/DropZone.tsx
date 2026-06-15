/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, AlertCircle, FileImage, Sparkles, Check } from 'lucide-react';
import { UploadedImage } from '../types';

interface DropZoneProps {
  onUploadSuccess: (image: UploadedImage) => void;
  onError: (msg: string) => void;
}

// Compression / Downscaling helper to avoid exceeding the 5MB localStorage quota limit
const compressAndResizeImage = (dataUrl: string, fileType: string): Promise<{ base64: string; width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const maxWidth = 1000;
      const maxHeight = 1000;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Safe JPEG compression
        const resultBase64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve({ base64: resultBase64, width, height });
      } else {
        resolve({ base64: dataUrl, width: img.width, height: img.height });
      }
    };
    img.onerror = () => {
      resolve({ base64: dataUrl, width: 0, height: 0 });
    };
  });
};

export default function DropZone({ onUploadSuccess, onError }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [tempFileName, setTempFileName] = useState('');
  const [tempFileSize, setTempFileSize] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    
    // Check if the file is an image and of valid type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
      const errorMsg = `Only image file types (JPG, PNG, GIF) are allowed. Attempted to upload: "${file.name}"`;
      setErrorMessage(errorMsg);
      onError(errorMsg);
      return;
    }

    // Prepare temporary metadata for display during simulation
    setTempFileName(file.name);
    setTempFileSize(file.size);
    setIsUploading(true);
    setUploadProgress(0);
    setStatusMessage('Reading image content...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        setErrorMessage('Failed to read image.');
        setIsUploading(false);
        return;
      }

      setStatusMessage('Optimizing dimensions...');
      const optimized = await compressAndResizeImage(rawDataUrl, file.type);

      // Start realistic staggered progress bar simulation
      setStatusMessage('Uploading to local core...');
      let currentProgress = 0;
      
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 15) + 8; // jump 8% - 23%
        if (currentProgress >= 100) {
          currentProgress = 100;
          setUploadProgress(100);
          setStatusMessage('Finalizing droplet creation!');
          clearInterval(interval);
          
          setTimeout(() => {
            const finalImage: UploadedImage = {
              id: Math.random().toString(36).substring(2, 11),
              name: file.name,
              type: file.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
              size: Math.round(optimized.base64.length * 0.75), // Actual base64 byte approximation
              dataUrl: optimized.base64,
              timestamp: Date.now(),
              width: optimized.width,
              height: optimized.height
            };

            onUploadSuccess(finalImage);
            setIsUploading(false);
            setUploadProgress(0);
            setStatusMessage('');
          }, 600);
        } else {
          setUploadProgress(currentProgress);
        }
      }, 150);
    };

    reader.onerror = () => {
      setErrorMessage('Error reading image.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Convert bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        id="image-file-input"
        accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Drag & Drop Zone container */}
      <motion.div
        id="drag-and-drop-container"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!isUploading ? triggerFileInput : undefined}
        className={`relative w-full min-h-[310px] rounded-[40px] p-8 flex flex-col justify-center items-center text-center cursor-pointer overflow-hidden transition-all duration-500 border-2 border-dashed ${
          isDragActive 
            ? 'border-sky-400 bg-sky-100/10 scale-[1.015] shadow-lg shadow-sky-950/5' 
            : 'border-sky-200 hover:border-sky-300/80 hover:scale-[1.005]'
        } water-glass-card drop-zone-glow ${
          isUploading ? 'pointer-events-none' : ''
        }`}
        whileTap={!isUploading ? { scale: 0.99 } : {}}
      >
        {/* Decorative subtle water glare */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/12 to-transparent pointer-events-none" />

        {/* Refractive Water Highlights on the card edges */}
        <div className="absolute top-[2%] left-[3%] right-[3%] h-[1px] bg-white/70 rounded-full blur-[0.2px] pointer-events-none" />
        <div className="absolute bottom-[2%] left-[4%] right-[4%] h-[1.5px] bg-white/25 rounded-full blur-[0.5px] pointer-events-none" />

        <AnimatePresence mode="wait">
          {!isUploading ? (
            <motion.div
              key="idle-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center justify-center space-y-6"
            >
              {/* Droplet Styled Icon Button representing glass-water */}
              <div 
                id="droplet-icon-container"
                className={`water-drop w-24 h-24 rounded-full flex items-center justify-center relative transition-all duration-500 mb-2 ${
                  isDragActive ? 'scale-110 shadow-2xl border-white/85' : 'shadow-xl border-white/60'
                }`}
              >
                {/* Micro glossy highlight on the icon glass */}
                <div className="absolute top-[12%] left-[18%] w-8 h-4 bg-white/50 rounded-full rotate-[-30deg] blur-[0.2px]" />
                <Upload 
                  id="upload-icon"
                  className={`w-10 h-10 text-sky-500 transition-all duration-300 ${
                    isDragActive ? 'scale-110 stroke-[2px] text-sky-600 animate-bounce' : 'opacity-90'
                  }`} 
                />
              </div>

              <div id="text-instructions" className="space-y-2.5 max-w-sm">
                <h2 className="text-2xl font-light text-slate-700 tracking-tight">
                  {isDragActive ? 'Drop to absorb droplet' : 'Ready to upload?'}
                </h2>
                <p className="text-sm text-slate-400 font-sans leading-relaxed">
                  Drag and drop your images here or <span className="text-sky-500 font-semibold underline cursor-pointer hover:text-sky-600 transition-colors">browse images</span>
                </p>
              </div>

              {/* Decorative extra spark of glass design footer */}
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold border-t border-slate-200/50 pt-4 px-10">
                Supports JPG, PNG, GIF up to 10MB
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="uploading-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md flex flex-col items-center justify-center space-y-6 px-4"
            >
              {/* Droplet Loading Animation */}
              <div className="w-16 h-16 rounded-full water-glass-droplet flex items-center justify-center relative animate-pulse-subtle">
                <div className="absolute top-[8%] left-[12%] w-[6px] h-[3px] bg-white/85 rounded-full rotate-[-30deg]" />
                <div className="w-10 h-10 rounded-full border-[3px] border-blue-500/20 border-t-blue-600/90 animate-spin" />
              </div>

              {/* Status and Name metadata */}
              <div className="text-center space-y-1">
                <p className="text-xs text-blue-600/90 font-semibold uppercase tracking-wider font-mono">
                  {statusMessage}
                </p>
                <h4 className="text-base font-semibold text-slate-800 line-clamp-1 max-w-[320px]">
                  {tempFileName}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  {formatBytes(tempFileSize)}
                </p>
              </div>

              {/* Water Fill Progress Bar styling */}
              <div className="w-full space-y-1">
                <div className="flex justify-between items-center text-xs font-mono font-medium text-slate-500 px-1">
                  <span>Uploading simulated flow</span>
                  <span className="text-blue-600">{uploadProgress}%</span>
                </div>
                
                {/* The "Water Tube" container */}
                <div className="w-full h-5 rounded-full bg-slate-300/20 border border-white/50 backdrop-blur-md p-0.5 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] relative">
                  {/* Subtle water surface sheen */}
                  <div className="absolute inset-x-0 top-0.5 h-[2px] bg-white/40 z-10 rounded-full" />
                  
                  {/* Animated Liquid level fill */}
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-400 relative overflow-hidden shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.15 }}
                  >
                    {/* Tiny bubbles floating right-to-left inside the liquid */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[length:12px_12px] opacity-60 animate-[pulse-subtle_2s_infinite]" />
                    
                    {/* Liquid Wave Overlay effect */}
                    <div className="absolute inset-0 bg-white/12 mix-blend-overlay animate-[liquid-wave_3s_infinite]" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Local Error feedback inside the zone */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              id="error-message-bubble"
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 250 }}
              onClick={(e) => {
                e.stopPropagation(); // Don't trigger search
                setErrorMessage(null);
              }}
              className="absolute bottom-4 left-4 right-4 bg-rose-50/95 backdrop-blur-md border border-rose-200 p-3.5 rounded-2xl flex items-start gap-2.5 shadow-md shadow-rose-950/5 text-left pointer-events-auto cursor-pointer group"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 group-hover:animate-shake" />
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-rose-800">Invalid Image Type</p>
                <p className="text-xs text-rose-600/90 leading-tight">
                  {errorMessage}
                </p>
              </div>
              <button 
                className="ml-auto text-xs font-semibold text-rose-400 hover:text-rose-600 bg-rose-100/50 hover:bg-rose-100 px-2 py-1 rounded-lg border border-rose-200/40 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setErrorMessage(null);
                }}
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
