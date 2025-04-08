// File: /app/profile/change-password/page.js

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import AuthenticatedLayout from '../../../components/layout/AuthenticatedLayout';
import { FaLock, FaExclamationTriangle, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';

// Password strength component
const PasswordStrength = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState([]);
  
  // Calculate password strength
  const calculateStrength = (password) => {
    if (!password) {
      setStrength(0);
      setFeedback(['Password is required']);
      return;
    }
    
    let score = 0;
    const feedbackItems = [];
    
    // Length check
    if (password.length < 8) {
      feedbackItems.push('Password must be at least 8 characters');
    } else {
      score += 1;
    }
    
    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      feedbackItems.push('Add uppercase letters');
    } else {
      score += 1;
    }
    
    // Lowercase check
    if (!/[a-z]/.test(password)) {
      feedbackItems.push('Add lowercase letters');
    } else {
      score += 1;
    }
    
    // Number check
    if (!/[0-9]/.test(password)) {
      feedbackItems.push('Add numbers');
    } else {
      score += 1;
    }
    
    // Special character check
    if (!/[^A-Za-z0-9]/.test(password)) {
      feedbackItems.push('Add special characters');
    } else {
      score += 1;
    }
    
    setStrength(score);
    setFeedback(feedbackItems);
  };
  
  // Update strength when password changes
  useState(() => {
    calculateStrength(password);
  }, [password]);
  
  const getStrengthLabel = () => {
    if (strength === 0) return 'Very Weak';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    if (strength === 4) return 'Strong';
    if (strength === 5) return 'Very Strong';
  };
  
  const getStrengthColor = () => {
    if (strength === 0) return 'bg-red-500';
    if (strength === 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-yellow-500';
    if (strength === 4) return 'bg-green-500';
    if (strength === 5) return 'bg-green-500';
  };
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Password Strength</span>
        <span className="text-sm font-medium text-gray-700">{getStrengthLabel()}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${getStrengthColor()}`} 
          style={{ width: `${(strength / 5) * 100}%` }}
        ></div>
      </div>
      
      {feedback.length > 0 && (
        <ul className="mt-2 space-y-1">
          {feedback.map((item, index) => (
            <li key={index} className="flex items-start">
              <FaTimes className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
              <span className="text-sm text-gray-600">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// HIPAA compliance banner component
const HIPAABanner = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <FaLock className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">HIPAA Security Requirement</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              Strong password security is required by HIPAA regulations to protect patient data.
              Your password must meet the minimum security requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChangePasswordPage() {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(false);
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    
    // Check password strength
    if (newPassword.length < 8 || 
        !/[A-Z]/.test(newPassword) || 
        !/[a-z]/.test(newPassword) || 
        !/[0-9]/.test(newPassword) || 
        !/[^A-Za-z0-9]/.test(newPassword)) {
      setError('Password does not meet security requirements.');
      return;
    }
    
    setLoading(true);
    
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        </div>
        
        {/* HIPAA Compliance Banner */}
        <HIPAABanner />
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Update Your Password</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">Password successfully updated.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              
              <PasswordStrength password={newPassword} />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-2 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <Link
                href="/profile/security"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Password Requirements</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>At least 8 characters long</li>
                    <li>Include at least one uppercase letter (A-Z)</li>
                    <li>Include at least one lowercase letter (a-z)</li>
                    <li>Include at least one number (0-9)</li>
                    <li>Include at least one special character (!@#$%^&*)</li>
                  </ul>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    These requirements are in place to ensure HIPAA compliance and protect sensitive patient information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
