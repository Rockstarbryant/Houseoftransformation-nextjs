'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { usePiP } from '@/context/PiPContext';

const GlobalPiP = () => {
  const { floatingPiP, closePiP, pipSize, setPipSize, pipPosition, setPipPosition } = usePiP();

  const [isDraggingPiP, setIsDraggingPiP] = useState(false);
  const [isResizingPiP, setIsResizingPiP] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 360, height: 240 });

  // Helper to get coordinates from either Mouse or Touch
  const getCoords = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleMove = useCallback((e) => {
    if (!isDraggingPiP && !isResizingPiP) return;
    
    // Prevent mobile scrolling/bouncing while dragging
    if (e.cancelable) e.preventDefault();

    const { x, y } = getCoords(e);

    if (isDraggingPiP) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      
      // Boundary checks for mobile screens
      const maxX = window.innerWidth - pipSize.width;
      const maxY = window.innerHeight - pipSize.height;
      
      setPipPosition({ 
        x: Math.max(0, Math.min(newX, maxX)), 
        y: Math.max(0, Math.min(newY, maxY)) 
      });
    }

    if (isResizingPiP) {
      const deltaX = x - resizeStart.x;
      const deltaY = y - resizeStart.y;
      
      setPipSize({
        width: Math.max(150, resizeStart.width + deltaX), // Smaller min-width for mobile
        height: Math.max(100, resizeStart.height + deltaY)
      });
    }
  }, [isDraggingPiP, isResizingPiP, dragOffset, resizeStart, pipSize, setPipPosition, setPipSize]);

  useEffect(() => {
    const endInteraction = () => {
      setIsDraggingPiP(false);
      setIsResizingPiP(false);
    };

    if (isDraggingPiP || isResizingPiP) {
      // Use { passive: false } to allow e.preventDefault() on mobile
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('mouseup', endInteraction);
      window.addEventListener('touchend', endInteraction);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', endInteraction);
      window.removeEventListener('touchend', endInteraction);
    };
  }, [isDraggingPiP, isResizingPiP, handleMove]);

  if (!floatingPiP) return null;

  return (
    <div
      className="fixed z-[200] rounded-xl overflow-hidden shadow-2xl border-2 border-red-600 bg-black touch-none"
      style={{
        left: `${pipPosition.x}px`,
        top: `${pipPosition.y}px`,
        width: `${pipSize.width}px`,
        height: `${pipSize.height}px`,
      }}
    >
      {/* Header - Drag Handle */}
      <div
        onMouseDown={(e) => {
          const { x, y } = getCoords(e);
          setDragOffset({ x: x - pipPosition.x, y: y - pipPosition.y });
          setIsDraggingPiP(true);
        }}
        onTouchStart={(e) => {
          const { x, y } = getCoords(e);
          setDragOffset({ x: x - pipPosition.x, y: y - pipPosition.y });
          setIsDraggingPiP(true);
        }}
        className="bg-red-600 px-3 py-2 flex items-center justify-between cursor-move select-none"
      >
        <span className="text-white text-[10px] font-bold truncate">LIVE</span>
        <button onClick={closePiP} className="text-white p-1"><X size={16} /></button>
      </div>

      {/* Video */}
      <div className="w-full h-full pointer-events-none">
         {/* pointer-events-none on the wrapper ensures the iframe doesn't "steal" the touch from the container */}
         <iframe 
            src={`https://www.youtube.com/embed/${floatingPiP.youtubeVideoId}?autoplay=1`} 
            className="w-full h-full pointer-events-auto" 
         />
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={(e) => {
          const { x, y } = getCoords(e);
          setResizeStart({ x, y, width: pipSize.width, height: pipSize.height });
          setIsResizingPiP(true);
        }}
        onTouchStart={(e) => {
          const { x, y } = getCoords(e);
          setResizeStart({ x, y, width: pipSize.width, height: pipSize.height });
          setIsResizingPiP(true);
        }}
        className="absolute bottom-0 right-0 w-8 h-8 bg-transparent cursor-se-resize flex items-end justify-end p-1"
      >
        <div className="w-4 h-4 bg-red-600 rounded-tl-lg" />
      </div>
    </div>
  );
};

export default GlobalPiP;