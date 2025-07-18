// src/components/auth/ApprovalPending.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircleIcon, ClockIcon, HeartIcon, UsersIcon } from 'lucide-react';

interface ApprovalPendingProps {
  userRole: string;
  submittedAt: string;
  message?: string;
}

const ApprovalPending: React.FC<ApprovalPendingProps> = ({ 
  userRole, 
  submittedAt, 
  message 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleSpecificContent = (role: string) => {
    switch (role.toLowerCase()) {
      case 'patient':
        return {
          title: "Welcome to Your Rare Disease Journey",
          subtitle: "Your KLARARETY account is being prepared",
          description: "We're excited to have you join our community of individuals living with rare diseases. Our team is carefully reviewing your application to ensure you receive the personalized care and support you deserve.",
          benefits: [
            "Connect with healthcare providers who understand rare diseases",
            "Access cutting-edge research and clinical trials",
            "Join supportive community groups with others who share similar experiences",
            "Track your health journey with smart medication reminders"
          ],
          icon: <HeartIcon className="w-12 h-12 text-rose-500" />,
          color: "rose"
        };
      case 'provider':
        return {
          title: "Join the Rare Disease Care Network",
          subtitle: "Your provider account is under review",
          description: "Thank you for choosing to serve the rare disease community. We're verifying your credentials to ensure the highest quality of care for our patients.",
          benefits: [
            "Access comprehensive rare disease patient records",
            "Collaborate with specialized research teams",
            "Utilize advanced telemedicine capabilities",
            "Contribute to groundbreaking rare disease research"
          ],
          icon: <UsersIcon className="w-12 h-12 text-blue-500" />,
          color: "blue"
        };
      case 'pharmco':
        return {
          title: "Advancing Rare Disease Research",
          subtitle: "Your pharmaceutical account is being validated",
          description: "Welcome to KLARARETY's research ecosystem. We're reviewing your credentials to ensure compliance and prepare your access to our research platform.",
          benefits: [
            "Access consented patient research data",
            "Monitor medication adherence in real-time",
            "Collaborate with leading rare disease researchers",
            "Contribute to life-changing drug development"
          ],
          icon: <CheckCircleIcon className="w-12 h-12 text-emerald-500" />,
          color: "emerald"
        };
      default:
        return {
          title: "Welcome to KLARARETY",
          subtitle: "Your account is being reviewed",
          description: "Thank you for joining our mission to advance knowledge, learning, and advocacy for people with rare diseases.",
          benefits: [
            "Access specialized healthcare resources",
            "Connect with the rare disease community",
            "Contribute to important research initiatives",
            "Make a difference in rare disease care"
          ],
          icon: <HeartIcon className="w-12 h-12 text-purple-500" />,
          color: "purple"
        };
    }
  };

  const content = getRoleSpecificContent(userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className={`bg-gradient-to-r from-${content.color}-500 to-${content.color}-600 px-8 py-6 text-white`}>
          <div className="flex items-center space-x-4">
            {content.icon}
            <div>
              <h1 className="text-2xl font-bold">{content.title}</h1>
              <p className="text-blue-100 opacity-90">{content.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-8 py-6">
          {/* Status Indicator */}
          <div className="flex items-center space-x-3 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <ClockIcon className="w-6 h-6 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">Account Under Review</p>
              <p className="text-sm text-amber-700">
                Submitted on {formatDate(submittedAt)}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed mb-6">
            {content.description}
          </p>

          {/* What's Next Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              What to expect during review:
            </h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Our team verifies your information and credentials</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">We ensure compliance with healthcare privacy regulations</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">You'll receive an email notification once approved</p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Once approved, you'll be able to:
            </h3>
            <div className="grid gap-2">
              {content.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Expected Timeline</h4>
            <p className="text-sm text-gray-600">
              Most accounts are reviewed within <span className="font-semibold">24-48 hours</span>. 
              Complex applications may take up to 5 business days. We appreciate your patience 
              as we ensure the security and quality of our platform.
            </p>
          </div>

          {/* Support Section */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
            <p className="text-gray-600 mb-3">
              Our support team is here to assist you with any questions about the approval process.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/support"
                className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                Contact Support
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                View FAQ
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-900">KLARARETY</span> - 
              Knowledge, Learning & Advocacy for Rare Diseases
            </p>
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPending;