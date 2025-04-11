// components/auth/SessionTimeout.js
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { FaExclamationTriangle, FaLock } from 'react-icons/fa';

// Default timeout values (milliseconds)
const DEFAULT_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const DEFAULT_WARNING_TIME = 60 * 1000; // 1 minute warning

/**
 * HIPAA compliant session timeout component
 * Shows a warning dialog before automatically logging out the user due to inactivity
 */
const SessionTimeout = ({
  timeout = DEFAULT_TIMEOUT,
  warningTime = DEFAULT_WARNING_TIME
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(Math.floor(warningTime / 1000));
  const { logout } = useAuth();
  const router = useRouter();
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  
  // Reset timer on user activity
  const resetTimer = useCallback(() => {
    if (showWarning) return; // Don't reset if warning is already showing
    
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Store last activity time
    localStorage.setItem('lastActivity', Date.now().toString());
    
    // Set new timeout
    timerRef.current = setTimeout(() => {
      showTimeoutWarning();
    }, timeout - warningTime);
  }, [showWarning, timeout, warningTime]);
  
  // Show timeout warning
  const showTimeoutWarning = useCallback(() => {
    setShowWarning(true);
    setCountdown(Math.floor(warningTime / 1000));
    
    // Set timeout for auto-logout
    countdownRef.current = setTimeout(() => {
      handleLogout();
    }, warningTime);
  }, [warningTime]);
  
  // Handle continue session
  const handleContinueSession = useCallback(() => {
    // Clear countdown timeout
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
    }
    
    setShowWarning(false);
    resetTimer();
  }, [resetTimer]);
  
  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      // Clear all timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearTimeout(countdownRef.current);
      
      setShowWarning(false);
      await logout();
      router.push('/login?reason=timeout');
    } catch (error) {
      console.error('Error during session timeout logout:', error);
      // Force redirect to login even if logout API fails
      router.push('/login?reason=timeout');
    }
  }, [logout, router]);
  
  // Set up activity tracking and timer on mount
  useEffect(() => {
    // Initialize timer
    resetTimer();
    
    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetTimer();
    
    // Attach event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    // Cleanup function
    return () => {
      // Remove event listeners
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      
      // Clear timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [resetTimer]);
  
  // Update countdown timer
  useEffect(() => {
    let intervalId = null;
    
    if (showWarning && countdown > 0) {
      intervalId = setInterval(() => {
        setCountdown(prevCountdown => prevCountdown - 1);
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showWarning, countdown]);
  
  // No warning, no render
  if (!showWarning) {
    return null;
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      aria-modal="true" 
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center mb-4 text-yellow-500">
          <FaExclamationTriangle className="h-6 w-6" />
          <h2 className="ml-2 text-xl font-semibold">Session Timeout Warning</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Your session is about to expire due to inactivity. For security and HIPAA compliance, you will be logged out in:
          </p>
          
          <p className="text-3xl font-bold text-gray-900 text-center mb-4">
            {Math.floor(countdown / 60).toString().padStart(2, '0')}:
            {(countdown % 60).toString().padStart(2, '0')}
          </p>
          
          <div className="flex items-center justify-center text-blue-600 mb-2">
            <FaLock className="h-4 w-4 mr-2" />
            <p className="text-sm">This is a HIPAA security requirement</p>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={handleContinueSession}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue Session
          </button>
          
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeout;