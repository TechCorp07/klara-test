// src/app/(dashboard)/_shared/layouts/LayoutContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  emergencyAlerts: [];
  isOnline: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const contextValue: LayoutContextType = {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    theme,
    setTheme,
    emergencyAlerts: [],
    isOnline: true,
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

// Optional: Simple notification center component placeholder
export default function NotificationCenter() {
  return null; // Placeholder for future implementation
}