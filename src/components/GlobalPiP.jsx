'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePiP } from '@/context/PiPContext';

const GlobalPiP = () => {
  const { 
    floatingPiP, 
    closePiP, 
    pipSize, 
    setPipSize, 
    pipPosition, 
    setPipPosition 
  } = usePiP();

  const [isDraggingPiP, setIsDraggingPiP] = useState(false);
  const [isResizingPiP, setIsResizingPiP] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 360, height: 240 });

  // 1. ALL hooks must be up here, before any 'return' statements
  useEffect(() => {
    const handlePiPDragMove = (e) => {
      if (!isDraggingPiP) return;
      const coords = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
      setPipPosition({ x: coords.x - dragOffset.x, y: coords.y - dragOffset.y });
    };

    const handleResizeMove = (e) => {
      if (!isResizingPiP) return;
      const coords = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
      setPipSize({
        width: Math.max(280, resizeStart.width + (coords.x - resizeStart.x)),
        height: Math.max(180, resizeStart.height + (coords.y - resizeStart.y))
      });
    };

    const endAll = () => {
      setIsDraggingPiP(false);
      setIsResizingPiP(false);
    };

    if (isDraggingPiP || isResizingPiP) {
      window.addEventListener('mousemove', isDraggingPiP ? handlePiPDragMove : handleResizeMove);
      window.addEventListener('mouseup', endAll);
      window.addEventListener('touchmove', isDraggingPiP ? handlePiPDragMove : handleResizeMove);
      window.addEventListener('touchend', endAll);
    }

    return () => {
      window.removeEventListener('mousemove', handlePiPDragMove);
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', endAll);
    };
  }, [isDraggingPiP, isResizingPiP, dragOffset, resizeStart, setPipPosition, setPipSize]);

  // 2. Instead of returning null at the top, we check floatingPiP here:
  if (!floatingPiP) return null; 

  const getEmbedUrl = (stream) => {
    if (stream.youtubeVideoId) return `https://www.youtube.com/embed/${stream.youtubeVideoId}?autoplay=1`;
    return stream.youtubeUrl || stream.facebookUrl;
  };

  return (
    <div
      className="fixed z-[200] rounded-[20px] overflow-hidden shadow-2xl border-2 border-red-600 bg-black"
      style={{
        left: `${pipPosition.x}px`,
        top: `${pipPosition.y}px`,
        width: `${pipSize.width}px`,
        height: `${pipSize.height}px`,
      }}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={(e) => {
          setDragOffset({ x: e.clientX - pipPosition.x, y: e.clientY - pipPosition.y });
          setIsDraggingPiP(true);
        }}
        className="bg-red-600 px-4 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing"
      >
        <span className="text-white text-[10px] font-bold truncate">{floatingPiP.title}</span>
        <button onClick={closePiP} className="text-white"><X size={16} /></button>
      </div>

      <div className="w-full bg-black" style={{ height: 'calc(100% - 40px)' }}>
        <iframe src={getEmbedUrl(floatingPiP)} className="w-full h-full" allow="autoplay" />
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={(e) => {
          setResizeStart({ x: e.clientX, y: e.clientY, width: pipSize.width, height: pipSize.height });
          setIsResizingPiP(true);
        }}
        className="absolute bottom-0 right-0 w-4 h-4 bg-red-600 cursor-se-resize"
      />
    </div>
  );
};

export default GlobalPiP;