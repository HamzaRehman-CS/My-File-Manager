/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Droplets, Image as ImageIcon, Flame, CheckCircle, Info } from 'lucide-react';

import WaterDropletBackground from './components/WaterDropletBackground';
import DropZone from './components/DropZone';
import ImageGallery from './components/ImageGallery';
import ActivePreviewFrame from './components/ActivePreviewFrame';
import { UploadedImage } from './types';

export default function App() {
  const LOCAL_STORAGE_KEY = 'water_glass_uploaded_images';

  // Initialize store of images
  const [images, setImages] = useState<UploadedImage[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Error accessing localStorage, starting fresh:', e);
      return [];
    }
  });

  // Featured lens focus state
  const [activeImage, setActiveImage] = useState<UploadedImage | null>(null);

  // Micro-toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');

  // Trigger floating alert
  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    
    // Automatically fade out after 3 seconds
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  };

  // Select first item or keep preview updated
  useEffect(() => {
    if (images.length > 0 && !activeImage) {
      setActiveImage(images[0]);
    }
  }, [images, activeImage]);

  // Hook for saving image list to storage
  const saveToStorage = (updatedList: UploadedImage[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (err: any) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        triggerToast('Database storage capacity reached. Please clear some images.', 'info');
      } else {
        console.error('LocalStorage save error:', err);
      }
    }
  };

  const handleUploadSuccess = (newImage: UploadedImage) => {
    const updated = [newImage, ...images];
    setImages(updated);
    saveToStorage(updated);
    setActiveImage(newImage);
    triggerToast('Droplet absorbed successfully!', 'success');
  };

  const handleSelectImage = (image: UploadedImage) => {
    setActiveImage(image);
    triggerToast(`Focused image: ${image.name.slice(0, 18)}${image.name.length > 18 ? '...' : ''}`, 'info');
  };

  const handleDeleteImage = (id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    setImages(filtered);
    saveToStorage(filtered);
    
    // If deleted image was currently featured, move focus
    if (activeImage?.id === id) {
      if (filtered.length > 0) {
        setActiveImage(filtered[0]);
      } else {
        setActiveImage(null);
      }
    }
    triggerToast('Image removed from storage', 'success');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all stored images from the local catalog?')) {
      setImages([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setActiveImage(null);
      triggerToast('Local database flushed complete', 'success');
    }
  };

  const handleUploadError = (errorMsg: string) => {
    triggerToast('Upload failed. Check parameters.', 'info');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between py-10 px-4 relative select-none font-sans bg-slate-50/5 text-slate-800">
      {/* Dynamic backdrop anim elements */}
      <WaterDropletBackground />

      {/* Structured Core Layout Grid */}
      <main className="w-full max-w-4xl mx-auto space-y-8 relative z-10 flex-1 flex flex-col justify-center">
        {/* Header Block inside glass banner */}
        <header className="w-full rounded-3xl p-6 water-glass-card border border-white/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden">
          {/* Upper glass highlight glare */}
          <div className="absolute top-[2%] left-[4%] right-[4%] h-[1px] bg-white/60 rounded-full blur-[0.2px] pointer-events-none" />
          
          <div className="flex items-center space-x-3.5">
            {/* Water drop interactive brand bubble */}
            <div className="w-12 h-12 rounded-full water-glass-droplet flex items-center justify-center relative animate-drop-float">
              <div className="absolute top-[8%] left-[12%] w-[5px] h-[2.5px] bg-white/90 rounded-full rotate-[-30deg]" />
              <Droplets className="w-6 h-6 text-blue-600 fill-blue-400" />
            </div>
            
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-light text-slate-800 tracking-tight flex items-center justify-center sm:justify-start gap-1">
                My Image <span className="font-bold text-sky-600">Manager</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-1 uppercase">
                PRECISION IMAGE MANAGEMENT & GLASS REFRACTION
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bead-button px-5 py-2.5 flex items-center justify-center text-xs font-semibold text-sky-800 tracking-wider">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-sky-500 fill-sky-200" />
              Created by Hamza Rehman
            </div>
          </div>
        </header>

        {/* Dynamic Dual columns layout:uploader and gallery info */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start" id="main-workflow-section">
          {/* Main workspace section */}
          <div className="md:col-span-7 space-y-6 flex flex-col">
            {/* Drop uploader widget */}
            <DropZone onUploadSuccess={handleUploadSuccess} onError={handleUploadError} />

            {/* Expanded focal lens display preview */}
            <AnimatePresence mode="wait">
              {activeImage && (
                <ActivePreviewFrame 
                  key={activeImage.id}
                  image={activeImage} 
                  onClear={() => {
                    setActiveImage(null);
                    triggerToast('Preview lens cleared', 'info');
                  }} 
                />
              )}
            </AnimatePresence>
          </div>

          {/* Persistent file gallery directory sidebar */}
          <div className="md:col-span-5 w-full">
            <ImageGallery 
              images={images}
              onSelectImage={handleSelectImage}
              onDeleteImage={handleDeleteImage}
              onClearAll={handleClearAll}
              activeImageId={activeImage?.id}
            />
          </div>
        </section>
      </main>

      {/* Standard Literal Human Footer */}
      <footer className="w-full text-center py-6 mt-8 z-10 pointer-events-none relative" id="literal-footer">
        <p className="text-xs text-slate-400/90 font-medium font-mono">
          My Image Manager • Created by Hamza Rehman
        </p>
      </footer>

      {/* Water Droplet Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            id="floating-macro-toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 py-3 px-5 rounded-full flex items-center space-x-2.5 border backdrop-blur-xl ${
              toastType === 'success' 
                ? 'bg-white/35 border-emerald-300/60 text-slate-800 shadow-[0_10px_25px_rgba(16,185,129,0.12)]'
                : 'bg-white/35 border-blue-300/60 text-slate-800 shadow-[0_10px_25px_rgba(59,130,246,0.12)]'
            }`}
            style={{ 
              boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.6), 0 8px 30px rgba(31,38,135,0.15)'
            }}
          >
            {/* Water droplet visual bubble on the left of toast */}
            <div className="w-6 h-6 rounded-full water-glass-droplet flex items-center justify-center relative shrink-0">
              <div className="absolute top-[8%] left-[12%] w-[2.5px] h-[1.2px] bg-white/95 rounded-full rotate-[-30deg]" />
              {toastType === 'success' ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Info className="w-3.5 h-3.5 text-blue-500" />
              )}
            </div>
            
            <span className="text-xs font-bold font-sans tracking-wide">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
