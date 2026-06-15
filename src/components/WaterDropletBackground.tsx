/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function WaterDropletBackground() {
  return (
    <div 
      className="fixed inset-0 -z-20 overflow-hidden bg-[#f0f9ff] pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(216, 241, 230, 0.5) 0.1%, rgba(233, 226, 226, 0.35) 90.1%), radial-gradient(circle at 80% 80%, rgba(186, 230, 253, 0.45) 0%, transparent 60%)'
      }}
    >
      {/* Decorative ambient water orbs / light sources */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-teal-200/25 to-sky-200/35 blur-3xl pointer-events-none animate-drop-float-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-sky-200/40 to-teal-100/30 blur-3xl pointer-events-none animate-drop-float" />
      <div className="absolute top-[40%] right-[15%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-tl from-sky-200/25 to-indigo-100/15 blur-2xl pointer-events-none animate-drop-float-fast" />

      {/* Floating Frosted 3D-like Water Blobs/Droplets */}
      {/* Droplet 1: Large Liquid Sphere */}
      <div 
        className="absolute top-[15%] left-[10%] w-48 h-48 rounded-full water-glass-droplet opacity-50 animate-liquid-wave animate-drop-float-slow"
        style={{ animationDelay: '0s' }}
      >
        <div className="absolute top-[12%] left-[15%] w-8 h-4 bg-white/70 rounded-full rotate-[-30deg] blur-[1px]" />
        <div className="absolute top-[22%] left-[25%] w-3 h-3 bg-white/50 rounded-full blur-[1px]" />
      </div>

      {/* Droplet 2: Medium Organic Sphere */}
      <div 
        className="absolute bottom-[20%] left-[12%] w-32 h-32 rounded-full water-glass-droplet opacity-40 animate-liquid-wave animate-drop-float"
        style={{ animationDelay: '-2s' }}
      >
        <div className="absolute top-[12%] left-[15%] w-6 h-3 bg-white/70 rounded-full rotate-[-25deg] blur-[1px]" />
      </div>

      {/* Droplet 3: Small Floating Droplets */}
      <div 
        className="absolute top-[45%] left-[5%] w-12 h-12 rounded-full water-glass-droplet opacity-60 animate-drop-float-fast"
        style={{ animationDelay: '-1.5s' }}
      >
        <div className="absolute top-[10%] left-[15%] w-3 h-1.5 bg-white/80 rounded-full rotate-[-20deg]" />
      </div>

      <div 
        className="absolute top-[65%] right-[8%] w-20 h-20 rounded-full water-glass-droplet opacity-40 animate-liquid-wave animate-drop-float-slow"
        style={{ animationDelay: '-4s' }}
      >
        <div className="absolute top-[12%] left-[15%] w-4 h-2 bg-white/70 rounded-full rotate-[-30deg] blur-[0.5px]" />
      </div>

      <div 
        className="absolute bottom-[10%] right-[30%] w-16 h-16 rounded-full water-glass-droplet opacity-50 animate-drop-float"
        style={{ animationDelay: '-3s' }}
      >
        <div className="absolute top-[12%] left-[15%] w-3.5 h-1.5 bg-white/85 rounded-full rotate-[-30deg]" />
      </div>

      {/* Drop overlay shimmer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_25%,rgba(186,230,253,0.15)_80%)] mix-blend-overlay" />
    </div>
  );
}
