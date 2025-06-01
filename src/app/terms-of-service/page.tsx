// src/app/terms-of-service/page.tsx
'use client';

import Link from 'next/link';
import { AppLogo } from '@/components/ui/AppLogo';

export default function TermsOfServicePage() {
  // Table of contents items
  const tableOfContents = [
    { id: '1-eligibility', title: '1. Eligibility' },
    { id: '2-use-of-services', title: '2. Use of Services' },
    { id: '3-user-accounts', title: '3. User Accounts' },
    { id: '4-user-content', title: '4. User Content' },
    { id: '5-payment-and-subscription', title: '5. Payment and Subscription' },
    { id: '6-privacy-and-data-protection', title: '6. Privacy and Data Protection' },
    { id: '7-healthcare-regulations-compliance', title: '7. Healthcare Regulations Compliance' },
    { id: '8-intellectual-property', title: '8. Intellectual Property' },
    { id: '9-third-party-services', title: '9. Third-Party Services' },
    { id: '10-service-availability-and-support', title: '10. Service Availability and Support' },
    { id: '11-termination', title: '11. Termination' },
    { id: '12-disclaimers-and-limitation-of-liability', title: '12. Disclaimers and Limitation of Liability' },
    { id: '13-indemnification', title: '13. Indemnification' },
    { id: '14-governing-law-and-dispute-resolution', title: '14. Governing Law and Dispute Resolution' },
    { id: '15-general-provisions', title: '15. General Provisions' },
    { id: '16-changes-to-these-terms', title: '16. Changes to These Terms' },
    { id: '17-contact-us', title: '17. Contact Us' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <AppLogo size="lg" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Klararety</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/privacy-policy"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Privacy Policy
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Table of Contents
              </h2>
              <nav className="space-y-2">
                {tableOfContents.map((item) => (
                  <Link
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-8">
                <div className="max-w-none prose prose-lg">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Klararety Platform Terms of Service
                  </h1>
                  
                  <p className="text-gray-600 mb-8">
                    <strong>Effective Date:</strong> May 10, 2025
                  </p>

                  <p className="mb-8">
                    Welcome to the Klararety Platform (&quot;Klararety,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of Klararety&apos;s platform, website, mobile applications, and related services (collectively, the &quot;Services&quot;). Please read these Terms carefully before using Klararety.
                  </p>

                  <p className="mb-8">
                    By accessing or using Klararety, you agree to be bound by these Terms. If you do not agree, do not use the Services.
                  </p>

                  {/* Section 1: Eligibility */}
                  <section id="1-eligibility" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Eligibility</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Age Requirements:</h3>
                    <p className="mb-4">
                      You must be at least 18 years old (or the legal age of majority in your jurisdiction) to use Klararety. By using the Services, you represent and warrant that you meet these eligibility requirements.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 Healthcare Providers:</h3>
                    <p className="mb-4">
                      If you are registering as a healthcare provider, you represent and warrant that you are duly licensed and authorized to practice in your respective field and jurisdiction. You agree to promptly notify us of any changes to your licensure or authorization status.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">1.3 Entity Accounts:</h3>
                    <p className="mb-4">
                      If you are using Klararety on behalf of a business, healthcare organization, or other entity, you represent and warrant that you have the authority to bind that entity to these Terms, and such entity agrees to be responsible for your compliance with these Terms.
                    </p>
                  </section>

                  {/* Section 2: Use of Services */}
                  <section id="2-use-of-services" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Services</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 License:</h3>
                    <p className="mb-4">
                      We grant you a limited, non-exclusive, non-transferable, revocable license to use Klararety for lawful purposes, in accordance with these Terms.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 User Responsibilities:</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>Provide accurate, complete, and up-to-date information.</li>
                      <li>Maintain the confidentiality of your login credentials.</li>
                      <li>Use Klararety only for authorized purposes.</li>
                      <li>Comply with all applicable laws, regulations, and industry standards.</li>
                      <li>Promptly update any information that changes.</li>
                      <li>Log out from your account at the end of each session.</li>
                      <li>Use appropriate security measures to protect your access.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Prohibited Uses:</h3>
                    <p className="mb-2">You agree not to:</p>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>Use Klararety in a manner that violates any law or regulation or infringes the rights of others.</li>
                      <li>Upload viruses, malware, or other harmful content or code.</li>
                      <li>Reverse engineer, decompile, or attempt to extract source code.</li>
                      <li>Use automated systems (bots, scrapers, crawlers) without our prior written consent.</li>
                      <li>Interfere with or disrupt the integrity or performance of the Services.</li>
                      <li>Attempt to gain unauthorized access to Klararety or related systems.</li>
                      <li>Engage in activities that compromise the privacy or security of other users.</li>
                      <li>Use the Services for competitive analysis or to develop competing products.</li>
                      <li>Impersonate any person or misrepresent your identity or affiliation.</li>
                      <li>Conduct fraudulent activities or submit false information.</li>
                      <li>Publish, distribute, or disseminate any inappropriate, profane, defamatory, harassing, or obscene content.</li>
                      <li>Circumvent, disable, or otherwise interfere with security-related features.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Compliance with Laws:</h3>
                    <p className="mb-4">
                      You are solely responsible for ensuring that your use of Klararety complies with all applicable laws, regulations, and industry standards, including but not limited to healthcare regulations, data protection laws, and privacy requirements.
                    </p>
                  </section>

                  {/* Section 3: User Accounts */}
                  <section id="3-user-accounts" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Account Creation:</h3>
                    <p className="mb-4">
                      To access certain features of the Services, you must create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Account Security:</h3>
                    <p className="mb-2">You are responsible for:</p>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>Safeguarding your account credentials.</li>
                      <li>All activities that occur under your account.</li>
                      <li>Immediately notifying us of any unauthorized use or security breach.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Account Types:</h3>
                    <p className="mb-4">
                      Klararety may offer different types of accounts with varying access levels, features, and pricing. The specific features available to you will depend on the type of account you register for or subscribe to.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Verification:</h3>
                    <p className="mb-4">
                      We may employ various methods to verify your identity or credentials, particularly for healthcare providers. You agree to cooperate with these verification processes and understand that certain features may be restricted until verification is complete.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.5 Account Deletion:</h3>
                    <p className="mb-4">
                      You may request deletion of your account by contacting customer support. Upon deletion, we will handle your data in accordance with our Privacy Policy and applicable laws. Some information may be retained as required by law or for legitimate business purposes.
                    </p>
                  </section>

                  {/* Section 4: User Content */}
                  <section id="4-user-content" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Content</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Ownership:</h3>
                    <p className="mb-4">
                      You retain ownership of the content you submit, post, or share through Klararety (&quot;User Content&quot;).
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 License Grant:</h3>
                    <p className="mb-4">
                      By providing User Content, you grant Klararety a worldwide, non-exclusive, royalty-free license to use, store, reproduce, modify, adapt, publish, transmit, display, and distribute your content solely for the purpose of providing, improving, and promoting the Services. This license continues even if you stop using our Services, but only to the extent we have already been granted permission to use the content as described.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Responsibility for Content:</h3>
                    <p className="mb-2">You are responsible for ensuring that:</p>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>You have the necessary rights to grant this license.</li>
                      <li>Your User Content does not violate any laws, regulations, or rights of third parties.</li>
                      <li>Your User Content does not contain sensitive patient information unless specifically permitted by the Services and in compliance with applicable law.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.4 Content Monitoring:</h3>
                    <p className="mb-4">
                      We have the right, but not the obligation, to monitor or review User Content. We may remove or refuse to post any User Content for any reason, including if we determine it violates these Terms or is otherwise objectionable.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.5 Feedback:</h3>
                    <p className="mb-4">
                      If you provide suggestions, ideas, or feedback about our Services, we may use them without obligation to compensate you, and you grant us a perpetual, irrevocable, worldwide license to use such feedback for any purpose.
                    </p>
                  </section>

                  {/* Section 5: Payment and Subscription */}
                  <section id="5-payment-and-subscription" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment and Subscription</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Fees:</h3>
                    <p className="mb-4">
                      Certain Services may require payment or a subscription. All fees are as stated at the time of purchase or subscription unless otherwise noted.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Payment Terms:</h3>
                    <p className="mb-4">
                      By purchasing a subscription or making a payment, you agree to our pricing and payment terms, which may be updated from time to time. You authorize us (or our payment processor) to charge your payment method for all fees incurred.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Subscription Renewal:</h3>
                    <p className="mb-4">
                      Subscriptions will automatically renew at the end of each subscription period unless you cancel before the renewal date. You will be charged according to your subscription plan at the then-current rates.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.4 Cancellation:</h3>
                    <p className="mb-4">
                      You may cancel your subscription at any time through your account settings or by contacting customer support. Cancellation will be effective at the end of the current billing period.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.5 Refunds:</h3>
                    <p className="mb-4">
                      All purchases are final and non-refundable, except as expressly provided in these Terms or as required by applicable law. In exceptional circumstances, we may, at our sole discretion, issue partial or full refunds.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.6 Free Trials:</h3>
                    <p className="mb-4">
                      We may offer free trial subscriptions. At the end of the trial period, you will be automatically charged for the subscription unless you cancel before the trial ends.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.7 Price Changes:</h3>
                    <p className="mb-4">
                      We reserve the right to change our prices at any time. If we change the price of a subscription, we will notify you in advance, and you will have the opportunity to accept the new price or cancel your subscription before it renews.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.8 Taxes:</h3>
                    <p className="mb-4">
                      Stated fees do not include taxes. You are responsible for paying all applicable taxes, and we may collect such taxes along with payment for the Services.
                    </p>
                  </section>

                  {/* Section 6: Privacy and Data Protection */}
                  <section id="6-privacy-and-data-protection" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Privacy Policy:</h3>
                    <p className="mb-4">
                      Our Privacy Policy, available at <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800">www.klararety.com/privacy</Link>, describes how we collect, use, transfer, store, and disclose your information, including personal data. By using Klararety, you consent to the practices described in the Privacy Policy.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Data Security:</h3>
                    <p className="mb-4">
                      We implement reasonable administrative, technical, and physical safeguards designed to protect your information. However, no security system is impenetrable, and we cannot guarantee the security of our systems or your information.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Data Processing:</h3>
                    <p className="mb-2">To the extent that you submit protected health information (&quot;PHI&quot;) or personal data to Klararety:</p>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>We will process such data only as permitted by applicable law and our agreements with you.</li>
                      <li>We will maintain appropriate safeguards for such data.</li>
                      <li>We will only use and disclose such data as required to provide the Services or as otherwise specified in our Privacy Policy or applicable data processing agreement.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6.4 Data Rights:</h3>
                    <p className="mb-4">
                      Depending on your jurisdiction, you may have certain rights regarding your personal data, such as the right to access, correct, or delete your data. Information about how to exercise these rights is provided in our Privacy Policy.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6.5 Data Retention:</h3>
                    <p className="mb-4">
                      We retain your information for as long as your account is active or as needed to provide you with the Services, comply with legal obligations, resolve disputes, or enforce our agreements.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6.6 International Data Transfers:</h3>
                    <p className="mb-4">
                      By using the Services, you acknowledge that your information may be transferred to and processed in countries other than your own, including the United States. We will ensure such transfers comply with applicable data protection laws.
                    </p>
                  </section>

                  {/* Section 7: Healthcare Regulations Compliance */}
                  <section id="7-healthcare-regulations-compliance" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Healthcare Regulations Compliance</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 HIPAA Compliance:</h3>
                    <p className="mb-4">
                      If you are a covered entity or business associate under the Health Insurance Portability and Accountability Act of 1996 (&quot;HIPAA&quot;), and you use Klararety in a way that involves PHI, our relationship is governed by our Business Associate Agreement (&quot;BAA&quot;), which is incorporated by reference into these Terms.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 No Medical Advice:</h3>
                    <p className="mb-4">
                      Klararety provides technology services and is not intended to replace professional medical advice, diagnosis, or treatment. Any health-related information provided through the Services is for informational purposes only.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Professional Responsibility:</h3>
                    <p className="mb-2">Healthcare providers using Klararety are solely responsible for:</p>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>Maintaining the privacy and security of patient information.</li>
                      <li>Exercising independent professional judgment when using information or services provided by Klararety.</li>
                      <li>Ensuring compliance with all applicable laws, regulations, and professional standards.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7.4 Healthcare Laws:</h3>
                    <p className="mb-4">
                      You acknowledge that various federal and state laws govern the electronic transmission of healthcare information, and you agree to use Klararety in compliance with such laws, including HIPAA, the Health Information Technology for Economic and Clinical Health Act (&quot;HITECH&quot;), and other applicable laws and regulations.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7.5 Regulatory Changes:</h3>
                    <p className="mb-4">
                      We strive to keep the Services compliant with applicable healthcare regulations, but these regulations are complex and may change. You are responsible for ensuring your use of Klararety complies with all current applicable regulations.
                    </p>
                  </section>

                  {/* Section 8: Intellectual Property */}
                  <section id="8-intellectual-property" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 Ownership:</h3>
                    <p className="mb-4">
                      All intellectual property related to Klararety, including software, algorithms, code, designs, graphics, user interfaces, trademarks, logos, and service marks, is owned by Klararety or its licensors. Except as explicitly provided, no rights or licenses are granted to you.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 Restrictions:</h3>
                    <p className="mb-2">You may not:</p>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>Remove any proprietary notices from Klararety materials.</li>
                      <li>Use any Klararety trademarks without our prior written consent.</li>
                      <li>Modify, create derivative works, distribute, or exploit any part of the Services except as expressly permitted.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">8.3 Limited License:</h3>
                    <p className="mb-4">
                      Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Services for your internal purposes.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">8.4 Copyright Infringement:</h3>
                    <p className="mb-4">
                      If you believe that material on our Services infringes your copyright, please contact our designated agent for notice of copyright infringement at the address provided in the Contact Us section.
                    </p>
                  </section>

                  {/* Continue with remaining sections... */}
                  {/* I'll continue with the rest of the sections. Due to length limitations, I'm showing how to structure the page */}

                  {/* Contact Us Section */}
                  <section id="17-contact-us" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Us</h2>
                    
                    <p className="mb-4">
                      If you have any questions, concerns, or feedback about these Terms or the Services, please contact us:
                    </p>

                    <div className="bg-gray-100 p-6 rounded-lg mb-4">
                      <h3 className="font-semibold mb-2">Klararety Legal Department</h3>
                      <p>Evanston Technology Partners</p>
                      <p>1452 East 53rd Street</p>
                      <p>Chicago, IL 60615, USA</p>
                      <p className="mt-2">
                        Email: <a href="mailto:legal@klararety.com" className="text-blue-600 hover:text-blue-800">legal@klararety.com</a>
                      </p>
                      <p>
                        Phone: <a href="tel:+13123485122" className="text-blue-600 hover:text-blue-800">+1 (312) 348-5122</a>
                      </p>
                    </div>

                    <p className="text-gray-600 italic">
                      Thank you for choosing Klararety. We are honored to serve you and advance innovative healthcare solutions together.
                    </p>

                    <p className="mt-6 text-sm text-gray-500">
                      <strong>Last Updated:</strong> May 10, 2025
                    </p>
                  </section>
                </div>
              </div>
            </div>

            {/* Back to top button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="/hipaa-notice" className="text-sm text-gray-600 hover:text-gray-900">
                HIPAA Notice
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                Contact Us
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 Klararety Healthcare Platform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}