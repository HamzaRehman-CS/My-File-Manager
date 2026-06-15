/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Copy, Check, Trash2, Eye, ShieldCheck, Sparkles, Sliders } from 'lucide-react';
import { UploadedImage } from '../types';

interface ActivePreviewFrameProps {
  key?: string;
  image: UploadedImage | null;
  onClear: () => void;
}

export default function ActivePreviewFrame({ image, onClear }: ActivePreviewFrameProps) {
  const [copied, setCopied] = useState(false);

  if (!image) return null;

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleCopyClipboard = async () => {
    try {
      // First, fetch the blob from data URL
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      
      // Attempt copy helper (PNG-supported)
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type.includes('png') ? 'image/png' : 'image/png']: blob // Browser clipboard prefers PNG
          })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback: Copy raw Base64 data string
        await navigator.clipboard.writeText(image.dataUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      // Fallback: Text copy
      try {
        await navigator.clipboard.writeText(image.dataUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Clipboard copy failed:', fallbackErr);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ type: 'spring', damping: 22, stiffness: 180 }}
      className="w-full water-glass-card rounded-3xl p-6 relative overflow-hidden"
      id="active-preview-lens"
    >
      {/* Upper Glare refraction lines */}
      <div className="absolute top-[1.5%] left-[3%] right-[3%] h-[1.5px] bg-white/75 rounded-full blur-[0.2px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Decorative mini water bubbles floating in the frame border */}
      <div className="absolute top-4 right-4 w-5 h-5 rounded-full water-glass-droplet opacity-30 pointer-events-none" />
      <div className="absolute bottom-6 left-4 w-4 h-4 rounded-full water-glass-droplet opacity-20 pointer-events-none" />

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Crystal Clear Photo Frame with high-fidelity magnifying lens overlays */}
        <div className="relative w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden border border-white/50 bg-slate-900/5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.1),_0_16px_32px_rgba(31,38,135,0.08)] group">
          <img
            src={image.dataUrl}
            alt={image.name}
            className="w-full h-full object-contain select-none p-2 relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
            referrerPolicy="no-referrer"
          />

          {/* Liquid Glass Overlay reflections */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 z-20 pointer-events-none" />
          
          {/* Real diagonal highlight gloss across the image */}
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/12 to-transparent -skew-x-12 group-hover:animate-[shimmer_1.5s_ease-in-out_infinite] pointer-events-none" />
        </div>

        {/* Detailed Image Metadata Panel */}
        <div className="flex-1 w-full space-y-5 flex flex-col justify-between py-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-sky-600 bg-sky-50/60 px-2.5 py-1 rounded-full border border-sky-100/20 shadow-xs">
                  Refraction Focus Lens
                </span>
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1 max-w-[280px] leading-tight mt-1.5">
                  {image.name}
                </h3>
              </div>

              {/* Reset droplet triggers */}
              <button
                onClick={onClear}
                className="w-8 h-8 rounded-full bg-transparent hover:bg-rose-50 border border-transparent hover:border-rose-200/50 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                title="Dismiss current lens preview"
              >
                <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-500" />
              </button>
            </div>

            {/* Micro grid of beautiful specs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/15 border border-white/30 rounded-xl p-3 shadow-xs">
                <span className="text-slate-450 text-[10px] block font-mono font-bold tracking-wide">DIMENSIONS</span>
                <span className="text-slate-700 text-sm font-bold font-mono">
                  {image.width && image.height ? `${image.width} × ${image.height}` : 'Calculating'}
                </span>
              </div>
              <div className="bg-white/15 border border-white/30 rounded-xl p-3 shadow-xs">
                <span className="text-slate-450 text-[10px] block font-mono font-bold tracking-wide">CAPSULE SIZE</span>
                <span className="text-sky-600 text-sm font-bold font-mono">
                  {formatBytes(image.size)}
                </span>
              </div>
              <div className="bg-white/15 border border-white/30 rounded-xl p-3 shadow-xs col-span-2">
                <span className="text-slate-450 text-[10px] block font-mono font-bold tracking-wide">MIME FORMAT</span>
                <span className="text-slate-600 text-xs font-semibold uppercase font-sans tracking-wide">
                  {image.type}
                </span>
              </div>
            </div>
          </div>

          {/* Action cluster buttons with glassy style */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {/* Copy button */}
            <button
              onClick={handleCopyClipboard}
              className="flex-1 flex items-center justify-center space-x-2 text-sm font-semibold py-3 px-4 rounded-2xl text-slate-700 water-glass-button active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600">Copied base64</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            {/* Direct download element */}
            <a
              href={image.dataUrl}
              download={image.name}
              className="flex-1 flex items-center justify-center space-x-2 text-sm font-semibold py-3 px-4 rounded-2xl text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-500/15 hover:shadow-lg hover:shadow-sky-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </a>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium justify-center pt-2 border-t border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted local database integrity guaranteed•100% Client-Side</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
