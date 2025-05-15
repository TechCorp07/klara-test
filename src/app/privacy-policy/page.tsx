// src/app/privacy-policy/page.tsx
'use client';

import Link from 'next/link';
import { AppLogo } from '@/components/ui/AppLogo';

export default function PrivacyPolicyPage() {
  // Table of contents items
  const tableOfContents = [
    { id: '1-key-terms', title: '1. Key Terms' },
    { id: '2-information-we-collect', title: '2. Information We Collect' },
    { id: '3-how-we-use-your-information', title: '3. How We Use Your Information' },
    { id: '4-how-we-share-your-information', title: '4. How We Share Your Information' },
    { id: '5-your-rights-and-choices', title: '5. Your Rights and Choices' },
    { id: '6-data-security', title: '6. Data Security' },
    { id: '7-data-retention', title: '7. Data Retention' },
    { id: '8-childrens-privacy', title: '8. Children\'s Privacy' },
    { id: '9-international-data-transfers', title: '9. International Data Transfers' },
    { id: '10-hipaa-compliance', title: '10. HIPAA Compliance' },
    { id: '11-california-privacy-rights', title: '11. California Privacy Rights' },
    { id: '12-european-privacy-rights', title: '12. European Privacy Rights' },
    { id: '13-cookies-and-tracking-technologies', title: '13. Cookies and Tracking Technologies' },
    { id: '14-third-party-links-and-services', title: '14. Third-Party Links and Services' },
    { id: '15-changes-to-this-privacy-policy', title: '15. Changes to This Privacy Policy' },
    { id: '16-contact-us', title: '16. Contact Us' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <AppLogo size="sm" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Klararety</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/terms-of-service"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Terms of Service
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
                    Klararety Platform Privacy Policy
                  </h1>
                  
                  <p className="text-gray-600 mb-8">
                    <strong>Effective Date:</strong> May 10, 2025
                  </p>

                  {/* Introduction */}
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                    
                    <p className="mb-4">
                      At Klararety (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your privacy and the security of your information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our platform, website, mobile applications, and related services (collectively, the &quot;Services&quot;).
                    </p>

                    <p className="mb-4">
                      We understand the sensitive nature of healthcare information and take our responsibility to protect your data seriously. This Privacy Policy is designed to comply with applicable data protection laws, including the Health Insurance Portability and Accountability Act of 1996 (&quot;HIPAA&quot;), the California Consumer Privacy Act (&quot;CCPA&quot;), the General Data Protection Regulation (&quot;GDPR&quot;), and other applicable privacy laws.
                    </p>

                    <p className="mb-4">
                      Please read this Privacy Policy carefully. By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with our policies and practices, please do not use our Services.
                    </p>
                  </section>

                  {/* Section 1: Key Terms */}
                  <section id="1-key-terms" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Key Terms</h2>
                    
                    <p className="mb-4">
                      Before we dive into the details, let&apos;s clarify some key terms used throughout this Privacy Policy:
                    </p>

                    <dl className="space-y-4">
                      <dt className="font-semibold">Personal Information:</dt>
                      <dd className="ml-4">Information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular individual or household.</dd>
                      
                      <dt className="font-semibold">Protected Health Information (PHI):</dt>
                      <dd className="ml-4">Individually identifiable health information transmitted or maintained in any form or medium by a covered entity or business associate, as defined under HIPAA.</dd>
                      
                      <dt className="font-semibold">De-identified Information:</dt>
                      <dd className="ml-4">Information that has been modified so that it no longer identifies or provides a reasonable basis to identify an individual.</dd>
                      
                      <dt className="font-semibold">Covered Entity:</dt>
                      <dd className="ml-4">A health plan, healthcare clearinghouse, or healthcare provider who transmits health information electronically, as defined by HIPAA.</dd>
                      
                      <dt className="font-semibold">Business Associate:</dt>
                      <dd className="ml-4">A person or entity that performs certain functions or activities involving the use or disclosure of PHI on behalf of, or provides services to, a Covered Entity.</dd>
                    </dl>
                  </section>

                  {/* Section 2: Information We Collect */}
                  <section id="2-information-we-collect" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                    
                    <p className="mb-4">
                      We collect several types of information from and about users of our Services, including:
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Information You Provide to Us</h3>
                    <p className="mb-4">
                      You may provide us with various types of information when you register for, access, or use our Services, including:
                    </p>

                    <ul className="list-disc list-inside mb-4 space-y-2">
                      <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, phone number, professional credentials (for healthcare providers), and login credentials.</li>
                      <li><strong>Profile Information:</strong> Information you provide in your user profile, such as your photograph, professional background, and specialties (for healthcare providers).</li>
                      <li><strong>Health Information:</strong> If you are a patient or end-user, we may collect health information you provide, including medical history, symptoms, diagnoses, treatments, medications, and other health-related information.</li>
                      <li><strong>Payment Information:</strong> If you subscribe to our paid Services, we collect payment details, billing address, and other financial information necessary to process your payment. Note that payment processing is handled by our third-party payment processors, and we do not store complete credit card information on our servers.</li>
                      <li><strong>Communications:</strong> When you contact us, we collect information you provide in your communications, including customer support inquiries, feedback, and testimonials.</li>
                      <li><strong>User Content:</strong> Information you post, upload, or otherwise share through our Services, such as comments, documents, or other content.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Information We Collect Automatically</h3>
                    <p className="mb-4">
                      When you access or use our Services, we may automatically collect certain information about your equipment, browsing actions, and patterns, including:
                    </p>

                    <ul className="list-disc list-inside mb-4 space-y-2">
                      <li><strong>Device Information:</strong> Information about your device and internet connection, including your device&apos;s unique device identifier, IP address, operating system, browser type, mobile network information, and device settings.</li>
                      <li><strong>Usage Information:</strong> Details of your visits to our Services, including traffic data, location data, logs, and other communication data and the resources that you access and use on the Services.</li>
                      <li><strong>Location Information:</strong> We may collect information about your precise or approximate location as determined through data such as your IP address or mobile device&apos;s GPS when you enable location services.</li>
                      <li><strong>Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and similar technologies to track activity on our Services and to collect certain information. For more information, see the &quot;Cookies and Tracking Technologies&quot; section below.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Information from Third Parties</h3>
                    <p className="mb-4">
                      We may receive information about you from third parties, including:
                    </p>

                    <ul className="list-disc list-inside mb-4 space-y-2">
                      <li><strong>Healthcare Providers:</strong> If you are a patient, your healthcare provider may share your health information with us when using our Services to coordinate your care.</li>
                      <li><strong>Business Partners:</strong> We may receive information about you from our business partners, such as identity verification services, analytics providers, and marketing partners.</li>
                      <li><strong>Public Sources:</strong> We may collect information about you from publicly available sources, such as public healthcare provider directories or professional licensing boards.</li>
                    </ul>
                  </section>

                  {/* Section 3: How We Use Your Information */}
                  <section id="3-how-we-use-your-information" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                    
                    <p className="mb-4">
                      We use the information we collect for various purposes, including:
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Providing and Improving Our Services</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>To provide, maintain, and improve our Services.</li>
                      <li>To process transactions and manage your account.</li>
                      <li>To respond to your inquiries, comments, or concerns.</li>
                      <li>To develop new products, services, features, and functionality.</li>
                      <li>To monitor and analyze trends, usage, and activities in connection with our Services.</li>
                      <li>To personalize your experience with our Services.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Communications</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>To communicate with you about your account, services, updates, security alerts, and support messages.</li>
                      <li>To provide information about products, services, or events that may be of interest to you, where you have consented to receive such communications.</li>
                      <li>To respond to your inquiries, requests, and feedback.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Legal and Safety Purposes</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>To comply with legal obligations and regulatory requirements.</li>
                      <li>To enforce our terms, conditions, and policies.</li>
                      <li>To protect our rights, privacy, safety, or property, and/or that of our affiliates, you, or others.</li>
                      <li>To investigate and prevent fraudulent transactions, unauthorized access to our Services, and other illegal activities.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 With Your Consent</h3>
                    <p className="mb-4">
                      For any other purpose with your consent.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3.5 Aggregated and De-identified Data</h3>
                    <p className="mb-4">
                      We may use aggregated or de-identified information, which does not identify any individual, for any purpose permitted under applicable law, including for research, analytics, and improving our Services.
                    </p>
                  </section>

                  {/* Section 4: How We Share Your Information */}
                  <section id="4-how-we-share-your-information" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
                    
                    <p className="mb-4">
                      We may share your information in the following circumstances:
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 With Your Consent</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>We may share your information when you direct us to do so or provide your consent.</li>
                      <li>For healthcare providers using our Services, we will share patient information as directed by you and as permitted by applicable law.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Service Providers</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>We may share your information with third-party service providers who perform services on our behalf, such as hosting providers, payment processors, analytics providers, customer service providers, and marketing providers.</li>
                      <li>These service providers are required to maintain the confidentiality and security of your information and are prohibited from using your information for any purpose other than providing services to us.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Business Transactions</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>If we engage in a merger, acquisition, sale of assets, financing, or other corporate transaction, we may share or transfer your information as part of that transaction.</li>
                      <li>In such cases, we will require the recipient to honor this Privacy Policy.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.4 Legal Requirements</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>We may disclose your information if required to do so by law or in response to valid requests from public authorities (e.g., a court or government agency).</li>
                      <li>We may also disclose your information to protect our rights, privacy, safety, or property, and/or that of our affiliates, you, or others.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.5 Healthcare Partners</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>If you are a patient, we may share your information with your healthcare providers who use our Services and with other healthcare partners involved in your care, as permitted by applicable law.</li>
                      <li>If you are a healthcare provider, we may share information about your practice with patients who use our Services to connect with providers.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4.6 Aggregated and De-identified Information</h3>
                    <p className="mb-4">
                      We may share aggregated or de-identified information, which cannot reasonably be used to identify you, for various purposes, including research, analysis, and improving our Services.
                    </p>
                  </section>

                  {/* Section 5: Your Rights and Choices */}
                  <section id="5-your-rights-and-choices" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Choices</h2>
                    
                    <p className="mb-4">
                      Depending on your location and applicable law, you may have certain rights regarding your personal information. These rights may include:
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Access and Data Portability</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>You have the right to access the personal information we hold about you.</li>
                      <li>You may request a copy of your personal information in a structured, commonly used, and machine-readable format.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Correction</h3>
                    <p className="mb-4">
                      You have the right to request that we correct inaccurate or incomplete personal information about you.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Deletion</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>You have the right to request the deletion of your personal information in certain circumstances.</li>
                      <li>We may retain certain information as required by law or for legitimate business purposes.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.4 Restriction and Objection</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>You have the right to request that we restrict the processing of your personal information in certain circumstances.</li>
                      <li>You have the right to object to the processing of your personal information in certain circumstances.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.5 Automated Decision-Making</h3>
                    <p className="mb-4">
                      You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or similarly significantly affects you.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.6 Marketing Communications</h3>
                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>You can opt out of receiving marketing communications from us by following the unsubscribe instructions included in each communication or by contacting us.</li>
                      <li>Even if you opt out of marketing communications, we may still send you administrative communications, such as service announcements and account-related messages.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.7 Cookies and Tracking Technologies</h3>
                    <p className="mb-4">
                      You can manage your cookie preferences through your browser settings. For more information, see the &quot;Cookies and Tracking Technologies&quot; section below.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5.8 How to Exercise Your Rights</h3>
                    <p className="mb-4">
                      To exercise any of the rights described above, please contact us using the contact information provided at the end of this Privacy Policy. We may need to verify your identity before responding to your request. We will respond to your request within the time period required by applicable law.
                    </p>
                  </section>

                  {/* Section 6: Data Security */}
                  <section id="6-data-security" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
                    
                    <p className="mb-4">
                      We have implemented appropriate technical and organizational measures designed to secure your information from accidental loss and from unauthorized access, use, alteration, and disclosure. These measures include:
                    </p>

                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>Encryption of sensitive information both in transit and at rest.</li>
                      <li>Regular security assessments and penetration testing.</li>
                      <li>Access controls and authentication mechanisms.</li>
                      <li>Employee training on data protection and security practices.</li>
                      <li>Physical, electronic, and procedural safeguards.</li>
                      <li>Business continuity and disaster recovery plans.</li>
                    </ul>

                    <p className="mb-4">
                      Despite our efforts, no security system is impenetrable, and we cannot guarantee the security of our systems or your information. You are responsible for maintaining the secrecy of any credentials used to access your account and for taking appropriate measures to protect your own information.
                    </p>

                    <p className="mb-4">
                      If you have reason to believe that your interaction with us is no longer secure (for example, if you feel that the security of your account has been compromised), please immediately notify us using the contact information provided at the end of this Privacy Policy.
                    </p>
                  </section>

                  {/* Section 7: Data Retention */}
                  <section id="7-data-retention" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
                    
                    <p className="mb-4">
                      We retain your information for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                    </p>

                    <p className="mb-4">
                      To determine the appropriate retention period for personal information, we consider:
                    </p>

                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>The amount, nature, and sensitivity of the personal information.</li>
                      <li>The potential risk of harm from unauthorized use or disclosure of your personal information.</li>
                      <li>The purposes for which we process your personal information and whether we can achieve those purposes through other means.</li>
                      <li>The applicable legal, regulatory, tax, accounting, or other requirements.</li>
                    </ul>

                    <p className="mb-4">
                      In some circumstances, we may anonymize your personal information (so that it can no longer be associated with you) for research or statistical purposes, in which case we may use this information indefinitely without further notice to you.
                    </p>

                    <p className="mb-4">
                      For personal health information, we comply with applicable laws, including HIPAA, regarding retention periods.
                    </p>
                  </section>

                  {/* Section 8: Children's Privacy */}
                  <section id="8-childrens-privacy" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
                    
                    <p className="mb-4">
                      Our Services are not intended for children under the age of 18, and we do not knowingly collect personal information from children under 18. If we learn we have collected or received personal information from a child under 18 without verification of parental consent, we will delete that information.
                    </p>

                    <p className="mb-4">
                      If you believe we might have any information from or about a child under 18, please contact us using the contact information provided at the end of this Privacy Policy.
                    </p>
                  </section>

                  {/* Section 9: International Data Transfers */}
                  <section id="9-international-data-transfers" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
                    
                    <p className="mb-4">
                      We are based in the United States and the information we collect is governed by U.S. law. If you are accessing our Services from outside the United States, please be aware that information collected through our Services may be transferred to, processed, stored, and used in the United States and other countries where our data processors operate.
                    </p>

                    <p className="mb-4">
                      If we transfer your personal information from the European Economic Area (EEA), United Kingdom, or Switzerland to a country that has not received an adequacy decision from the European Commission, we will implement appropriate safeguards, such as standard contractual clauses, to protect your personal information.
                    </p>

                    <p className="mb-4">
                      By using our Services, you consent to the transfer of your information to the United States and other countries, which may have different data protection rules than those of your country.
                    </p>
                  </section>

                  {/* Section 10: HIPAA Compliance */}
                  <section id="10-hipaa-compliance" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">10. HIPAA Compliance</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">10.1 Business Associate Agreement</h3>
                    <p className="mb-4">
                      If you are a Covered Entity under HIPAA and you use our Services in a way that involves PHI, we will enter into a Business Associate Agreement (BAA) with you. The BAA sets forth our obligations with respect to PHI and compliance with HIPAA.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">10.2 Use and Disclosure of PHI</h3>
                    <p className="mb-4">
                      As a Business Associate, we will:
                    </p>

                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>Use or disclose PHI only as permitted or required by the BAA or as required by law.</li>
                      <li>Use appropriate safeguards to prevent unauthorized use or disclosure of PHI.</li>
                      <li>Report to you any use or disclosure of PHI not provided for by the BAA of which we become aware.</li>
                      <li>Ensure that any subcontractors that create, receive, maintain, or transmit PHI on our behalf agree to the same restrictions and conditions.</li>
                      <li>Make available PHI as required to fulfill your obligations to provide individuals with access to their PHI and accounting of disclosures.</li>
                      <li>Return or destroy all PHI received from you or created or received on your behalf, if feasible, upon termination of the BAA.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">10.3 Patient Rights</h3>
                    <p className="mb-4">
                      If you are a patient whose healthcare provider uses our Services, your PHI is protected under HIPAA. You have certain rights regarding your PHI, including the right to:
                    </p>

                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>Access your PHI.</li>
                      <li>Request corrections to your PHI.</li>
                      <li>Request restrictions on certain uses and disclosures of your PHI.</li>
                      <li>Request an accounting of disclosures of your PHI.</li>
                      <li>Request communications of your PHI by alternative means or at alternative locations.</li>
                      <li>Receive notification of breaches of unsecured PHI.</li>
                    </ul>

                    <p className="mb-4">
                      To exercise these rights, please contact your healthcare provider directly, as they are the Covered Entity responsible for your PHI.
                    </p>
                  </section>

                  {/* Section 11: California Privacy Rights */}
                  <section id="11-california-privacy-rights" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">11. California Privacy Rights</h2>
                    
                    <p className="mb-4">
                      If you are a California resident, the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA) provide you with specific rights regarding your personal information.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">11.1 Right to Know</h3>
                    <p className="mb-4">
                      You have the right to request that we disclose certain information to you about our collection, use, disclosure, and sale of your personal information over the past 12 months.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">11.2 Right to Delete</h3>
                    <p className="mb-4">
                      You have the right to request that we delete any of your personal information that we collected from you and retained, subject to certain exceptions.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">11.3 Right to Opt-Out of Sale or Sharing</h3>
                    <p className="mb-4">
                      If we sell or share your personal information, you have the right to opt-out of the sale or sharing of your personal information.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">11.4 Right to Non-Discrimination</h3>
                    <p className="mb-4">
                      We will not discriminate against you for exercising any of your CCPA rights. Unless permitted by the CCPA, we will not:
                    </p>

                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>Deny you goods or services.</li>
                      <li>Charge you different prices or rates for goods or services.</li>
                      <li>Provide you a different level or quality of goods or services.</li>
                      <li>Suggest that you may receive a different price or rate for goods or services or a different level or quality of goods or services.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">11.5 Exercising Your California Privacy Rights</h3>
                    <p className="mb-4">
                      To exercise the rights described above, please submit a verifiable consumer request to us using the contact information provided at the end of this Privacy Policy.
                    </p>

                    <p className="mb-4">
                      Only you, or someone legally authorized to act on your behalf, may make a verifiable consumer request related to your personal information. You may also make a verifiable consumer request on behalf of your minor child.
                    </p>

                    <p className="mb-4">
                      The verifiable consumer request must:
                    </p>

                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>Provide sufficient information that allows us to reasonably verify you are the person about whom we collected personal information or an authorized representative.</li>
                      <li>Describe your request with sufficient detail that allows us to properly understand, evaluate, and respond to it.</li>
                    </ul>

                    <p className="mb-4">
                      We cannot respond to your request or provide you with personal information if we cannot verify your identity or authority to make the request and confirm the personal information relates to you.
                    </p>
                  </section>

                  {/* Section 12: European Privacy Rights */}
                  <section id="12-european-privacy-rights" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">12. European Privacy Rights</h2>
                    
                    <p className="mb-4">
                      If you are in the European Economic Area (EEA), United Kingdom, or Switzerland, the General Data Protection Regulation (GDPR) or similar data protection laws provide you with certain rights regarding your personal data.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">12.1 Legal Basis for Processing</h3>
                    <p className="mb-4">
                      We will only collect and process your personal data where we have a legal basis to do so. Legal bases include:
                    </p>

                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li><strong>Consent:</strong> You have given us consent to process your personal data for a specific purpose.</li>
                      <li><strong>Contract:</strong> The processing is necessary for the performance of a contract with you.</li>
                      <li><strong>Legal Obligation:</strong> The processing is necessary for us to comply with a legal obligation.</li>
                      <li><strong>Legitimate Interests:</strong> The processing is necessary for our legitimate interests or the legitimate interests of a third party, unless there is a good reason to protect your personal data which overrides those legitimate interests.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">12.2 Data Protection Rights</h3>
                    <p className="mb-4">
                      In addition to the rights described in the &quot;Your Rights and Choices&quot; section, you have the right to:
                    </p>

                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li><strong>Withdraw Consent:</strong> If we rely on your consent to process your personal data, you have the right to withdraw that consent at any time.</li>
                      <li><strong>Lodge a Complaint:</strong> You have the right to lodge a complaint with a supervisory authority if you believe our processing of your personal data violates data protection laws.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">12.3 International Transfers</h3>
                    <p className="mb-4">
                      If we transfer your personal data from the EEA, United Kingdom, or Switzerland to a country that has not received an adequacy decision from the European Commission, we will implement appropriate safeguards, such as standard contractual clauses, to protect your personal data.
                    </p>
                  </section>

                  {/* Section 13: Cookies and Tracking Technologies */}
                  <section id="13-cookies-and-tracking-technologies" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Cookies and Tracking Technologies</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">13.1 What Are Cookies</h3>
                    <p className="mb-4">
                      Cookies are small text files that are stored on your device when you visit a website. We and our third-party service providers use cookies and similar technologies (such as web beacons, pixels, and clear GIFs) to:
                    </p>

                    <ul className="list-disc list-inside mb-4 space-y-1">
                      <li>Enable certain functions of our Services.</li>
                      <li>Provide analytics.</li>
                      <li>Store your preferences.</li>
                      <li>Enable advertisements delivery, including behavioral advertising.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">13.2 Types of Cookies We Use</h3>
                    <ul className="list-disc list-inside mb-4 space-y-2">
                      <li><strong>Essential Cookies:</strong> These cookies are necessary for our Services to function properly and cannot be switched off in our systems.</li>
                      <li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources, so we can measure and improve the performance of our Services.</li>
                      <li><strong>Functional Cookies:</strong> These cookies enable the Services to provide enhanced functionality and personalization.</li>
                      <li><strong>Targeting Cookies:</strong> These cookies may be set through our Services by our advertising partners to build a profile of your interests and show you relevant advertisements on other sites.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">13.3 Managing Cookies</h3>
                    <p className="mb-4">
                      Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, or to alert you when cookies are being sent. The methods for doing so vary from browser to browser, and from version to version.
                    </p>

                    <p className="mb-4">
                      Please note that if you choose to remove or reject cookies, this could affect the availability and functionality of our Services.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">13.4 Do Not Track Signals</h3>
                    <p className="mb-4">
                      Some web browsers may transmit &quot;Do Not Track&quot; signals to the websites and other online services with which the browser communicates. There is no standard that governs what, if anything, websites should do when they receive these signals. We currently do not take action in response to these signals.
                    </p>
                  </section>

                  {/* Section 14: Third-Party Links and Services */}
                  <section id="14-third-party-links-and-services" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Third-Party Links and Services</h2>
                    
                    <p className="mb-4">
                      Our Services may contain links to third-party websites, applications, or services that are not operated by us. This Privacy Policy does not apply to those third-party services. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party services.
                    </p>

                    <p className="mb-4">
                      We encourage you to review the privacy policies of any third-party services you access through our Services.
                    </p>
                  </section>

                  {/* Section 15: Changes to This Privacy Policy */}
                  <section id="15-changes-to-this-privacy-policy" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Changes to This Privacy Policy</h2>
                    
                    <p className="mb-4">
                      We may update this Privacy Policy from time to time. If we make material changes to this Privacy Policy, we will notify you by email or through our Services prior to the changes becoming effective.
                    </p>

                    <p className="mb-4">
                      We encourage you to review this Privacy Policy periodically to stay informed about our information practices. Your continued use of our Services after we make changes is deemed to be acceptance of those changes.
                    </p>
                  </section>

                  {/* Section 16: Contact Us */}
                  <section id="16-contact-us" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Us</h2>
                    
                    <p className="mb-4">
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
                    </p>

                    <div className="space-y-6">
                      <div className="bg-gray-100 p-6 rounded-lg">
                        <h3 className="font-semibold mb-2">Klararety Data Protection Officer</h3>
                        <p>Evanston Technology Partners</p>
                        <p>1452 East 53rd Street</p>
                        <p>Chicago, IL 60615, USA</p>
                        <p className="mt-2">
                          Email: <a href="mailto:privacy@klararety.com" className="text-blue-600 hover:text-blue-800">privacy@klararety.com</a>
                        </p>
                        <p>
                          Phone: <a href="tel:+13125550124" className="text-blue-600 hover:text-blue-800">+1 (312) 555-0124</a>
                        </p>
                      </div>

                      <div className="bg-gray-100 p-6 rounded-lg">
                        <h3 className="font-semibold mb-2">For HIPAA-related inquiries:</h3>
                        <p>
                          Email: <a href="mailto:hipaa@klararety.com" className="text-blue-600 hover:text-blue-800">hipaa@klararety.com</a>
                        </p>
                        <p>
                          Phone: <a href="tel:+13125550125" className="text-blue-600 hover:text-blue-800">+1 (312) 555-0125</a>
                        </p>
                      </div>

                      <div className="bg-gray-100 p-6 rounded-lg">
                        <h3 className="font-semibold mb-2">If you are a California resident exercising your rights under the CCPA/CPRA:</h3>
                        <p>
                          Email: <a href="mailto:ccpa@klararety.com" className="text-blue-600 hover:text-blue-800">ccpa@klararety.com</a>
                        </p>
                        <p>
                          Toll-free number: <a href="tel:+18005550126" className="text-blue-600 hover:text-blue-800">+1 (800) 555-0126</a>
                        </p>
                      </div>

                      <div className="bg-gray-100 p-6 rounded-lg">
                        <h3 className="font-semibold mb-2">If you are in the EEA, United Kingdom, or Switzerland:</h3>
                        <p>Klararety EU Representative</p>
                        <p>
                          Email: <a href="mailto:eu-representative@klararety.com" className="text-blue-600 hover:text-blue-800">eu-representative@klararety.com</a>
                        </p>
                      </div>
                    </div>

                    <p className="mt-6 text-sm text-gray-500">
                      <strong>Effective Date:</strong> May 10, 2025<br />
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
              <Link href="/terms-of-service" className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
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