import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EmailVerification from '../auth/EmailVerification';

/**
 * Email Verification Confirmation Page
 * Handles email verification from link in email
 */
const VerifyEmailPage = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <EmailVerification />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
