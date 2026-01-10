'use client';

import React, { createContext, useContext, useState } from 'react';

const DonationContext = createContext(null);

export const DonationProvider = ({ children }) => {
  const [donationData, setDonationData] = useState(null);

  return (
    <DonationContext.Provider value={{ donationData, setDonationData }}>
      {children}
    </DonationContext.Provider>
  );
};

export const useDonationContext = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonationContext must be used within DonationProvider');
  }
  return context;
};