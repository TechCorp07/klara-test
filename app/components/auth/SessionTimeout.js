// components/auth/SessionTimeout.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { FaExclamationTriangle, FaLock } from 'react-icons/fa';

// Default timeout values
const DEFAULT_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const DEFAULT_WARNING_TIME = 60 * 1000; // 1 minute warning before timeout

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
  
  // Reset timer on user activity
  const resetTimer = useCallback(() => {
    if (!showWarning) {
      // No need to reset if warning is already showing
      localStorage.setItem('lastActivity', Date.now().toString());
    }
  }, [showWarning]);
  
  // Check for inactivity and show warning or logout
  const checkInactivity = useCallback(() => {
    const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0', 10);
    const currentTime = Date.now();
    const inactiveTime = currentTime - lastActivity;
    
    if (inactiveTime >= timeout - warningTime) {
      // Show warning when approaching timeout
      setShowWarning(true);
      
      // Calculate countdown
      const remainingTime = Math.max(0, Math.floor((timeout - inactiveTime) / 1000));
      setCountdown(remainingTime);
      
      // If no time remains, perform logout
      if (remainingTime <= 0) {
        handleLogout();
      }
    } else {
      setShowWarning(false);
    }
  }, [timeout, warningTime]);
  
  // Handle continue session
  const handleContinueSession = () => {
    resetTimer();
    setShowWarning(false);
  };
  
  // Handle logout
  const handleLogout = async () => {
    setShowWarning(false);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error during session timeout logout:', error);
      // Force redirect to login even if logout API fails
      router.push('/login');
    }
  };
  
  // Set up activity tracking and inactivity checker
  useEffect(() => {
    // Initialize last activity timestamp
    if (!localStorage.getItem('lastActivity')) {
      resetTimer();
    }
    
    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    // Set up interval to check for inactivity
    const intervalId = setInterval(checkInactivity, 1000);
    
    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(intervalId);
    };
  }, [resetTimer, checkInactivity]);
  
  // Update countdown timer
  useEffect(() => {
    if (showWarning && countdown > 0) {
      const timerId = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timerId);
    }
  }, [showWarning, countdown]);
  
  if (!showWarning) {
    return null;
  }
  
  return (
    <div className="session-timeout-modal" aria-modal="true" role="dialog">
      <div className="session-timeout-content">
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
