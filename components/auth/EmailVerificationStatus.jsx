export const dynamic = 'force-dynamic';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Email Verification Status Component
 * Shows email verification status and allows requesting verification
 */
const EmailVerificationStatus = () => {
  const { user } = useAuth();
  const router = useRouter();

  // If no user is logged in, don't show anything
  if (!user) {
    return null;
  }

  const handleRequestVerification = () => {
    router.push('/request-verification');
  };

  return (
    <div className="email-verification-status">
      {user.email_verified ? (
        <div className="verified-status">
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            <div>
              Your email address has been verified.
            </div>
          </div>
        </div>
      ) : (
        <div className="unverified-status">
          <div className="alert alert-warning d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>
              Your email address is not verified. Some features may be limited.
              <button 
                className="btn btn-link p-0 ms-2"
                onClick={handleRequestVerification}
              >
                Verify now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailVerificationStatus;
