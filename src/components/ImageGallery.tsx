/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Image as ImageIcon, Calendar, Layers, Eye, RefreshCw } from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageGalleryProps {
  images: UploadedImage[];
  onSelectImage: (image: UploadedImage) => void;
  onDeleteImage: (id: string) => void;
  onClearAll: () => void;
  activeImageId?: string;
}

export default function ImageGallery({
  images,
  onSelectImage,
  onDeleteImage,
  onClearAll,
  activeImageId,
}: ImageGalleryProps) {
  
  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Human readable date
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 1000 * 60) return 'Just now';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full space-y-5 flex flex-col justify-between" id="image-gallery-module">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            Recent Files
          </h3>
          <span className="text-[10px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-bold">
            {images.length} TOTAL
          </span>
        </div>

        {images.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500/85 px-2.5 py-1 rounded-full border border-rose-200/40 hover:border-transparent transition-all active:scale-95 cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {images.length === 0 ? (
          <motion.div
            key="empty-gallery"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full rounded-[30px] water-glass-card p-10 flex flex-col items-center justify-center text-center border-dashed border-sky-200"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4 text-sky-500 border border-white/45">
              <ImageIcon className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No local uploads found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
              Drag images into the zone. They will persist through computer reboots and hard page refreshes.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="gallery-grid"
            layout
            className="space-y-3.5 max-h-[352px] overflow-y-auto pr-1 pb-2"
          >
            {images.map((img, i) => {
              const isActive = img.id === activeImageId;
              return (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { delay: i * 0.04 } 
                  }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  whileHover={{ y: -2 }}
                  className={`bead-button relative p-3 flex items-center gap-3.5 group cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'border-sky-400 bg-sky-500/[0.04] ring-1 ring-sky-400/20' 
                      : 'hover:bg-white/45 hover:border-white/90 border-transparent'
                  }`}
                  onClick={() => onSelectImage(img)}
                >
                  {/* Glass highlight glare lines */}
                  <div className="absolute top-[3%] left-[3%] right-[3%] h-[1px] bg-white/50 rounded-full pointer-events-none" />

                  {/* Bubble Thumbnail Preview */}
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/60 shrink-0 bg-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),_0_4px_8px_rgba(0,0,0,0.04)]">
                    <img 
                      src={img.dataUrl} 
                      alt={img.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>

                  {/* Metadata and Stats */}
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold text-slate-700 truncate leading-snug group-hover:text-sky-600 transition-colors">
                      {img.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {formatBytes(img.size)} • {formatTime(img.timestamp)}
                    </p>
                  </div>

                  {/* Inline Action Triggers */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {/* Select preview bullet indicator */}
                    {isActive ? (
                      <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm">
                        <Eye className="w-2.5 h-2.5" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/30 border border-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-sky-100 hover:border-sky-300 transition-all duration-200">
                        <Eye className="w-2.5 h-2.5 text-sky-600" />
                      </div>
                    )}
                    
                    {/* Delete droplet trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteImage(img.id);
                      }}
                      className="w-6 h-6 rounded-full bg-transparent hover:bg-rose-50 border border-transparent hover:border-rose-250 flex items-center justify-center group/btn transition-colors duration-200"
                      title="Remove image from cache"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-rose-500 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Storage Footer matching the exact nested template */}
      <div className="pt-4 mt-auto">
        <div className="p-4 rounded-[30px] bg-sky-900/10 border border-white/20">
          <div className="flex justify-between items-end mb-2 px-1">
            <span className="text-[10px] font-bold text-sky-800">STORAGE</span>
            <span className="text-[10px] font-bold text-sky-800">
              {(() => {
                const totalBytesUsed = images.reduce((sum, img) => sum + img.size, 0);
                const totalMB = totalBytesUsed / (1024 * 1024);
                return `${totalMB.toFixed(2)} MB / 5.00 MB`;
              })()}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sky-600 transition-all duration-500" 
              style={{ 
                width: `${Math.min(
                  100, 
                  Math.round(
                    (images.reduce((sum, img) => sum + img.size, 0) / (5 * 1024 * 1024)) * 100
                  )
                )}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
