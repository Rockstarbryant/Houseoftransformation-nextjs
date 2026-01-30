'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const PiPContext = createContext();

export const PiPProvider = ({ children }) => {
  const [floatingPiP, setFloatingPiP] = useState(null);
  const [pipSize, setPipSize] = useState({ width: 360, height: 240 });
  const [pipPosition, setPipPosition] = useState({ x: 20, y: 80 });

  // Sync with localStorage so it persists on hard refreshes
  useEffect(() => {
    const saved = localStorage.getItem('persistentPiP');
    if (saved) setFloatingPiP(JSON.parse(saved));
  }, []);

  const closePiP = () => {
    setFloatingPiP(null);
    localStorage.removeItem('persistentPiP');
  };

  return (
    <PiPContext.Provider value={{ 
      floatingPiP, setFloatingPiP, 
      pipSize, setPipSize, 
      pipPosition, setPipPosition,
      closePiP 
    }}>
      {children}
    </PiPContext.Provider>
  );
};

export const usePiP = () => useContext(PiPContext);