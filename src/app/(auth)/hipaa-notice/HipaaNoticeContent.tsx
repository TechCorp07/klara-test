// src/app/(auth)/hipaa-notice/HipaaNoticeContent.tsx
'use client';

import Link from 'next/link';
import { config } from '@/lib/config';
import { useState, ChangeEvent, FormEvent } from 'react';

// Define types for our provider information data
interface ProviderData {
  providerName: string;
  address: string;
  cityStateZip: string;
  phone: string;
  email: string;
  website: string;
  effectiveDate: string;
}

// Define types for our acknowledgment data
interface AcknowledgmentData {
  name: string;
  telephone: string;
  relationship: string;
  signed: boolean;
  signature: string;
  signatureDate: string;
}

// Define types for office use data
/* interface OfficeUseData {
  refused: boolean;
  barriers: boolean;
  emergency: boolean;
  other: boolean;
  otherSpecify: string;
  date: string;
} */

export default function HipaaNoticeContent() {
  // Initialize today's date for the default effective date
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  // State for the provider information
  const [providerData, setProviderData] = useState<ProviderData>({
    providerName: '',
    address: '',
    cityStateZip: '',
    phone: '',
    email: '',
    website: '',
    effectiveDate: today,
  });

  // State for the acknowledgment form
  const [acknowledgmentData, setAcknowledgmentData] = useState<AcknowledgmentData>({
    name: '',
    telephone: '',
    relationship: '',
    signed: false,
    signature: '',
    signatureDate: today,
  });
  
  // State for the office use section
/*   const [officeUseData, setOfficeUseData] = useState<OfficeUseData>({
    refused: false,
    barriers: false,
    emergency: false,
    other: false,
    otherSpecify: '',
    date: today,
  }); */

  // Handle changes to the provider information form
  const handleProviderInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setProviderData({
      ...providerData,
      [name]: value,
    });
  };

  // Handle changes to the acknowledgment form
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setAcknowledgmentData({
      ...acknowledgmentData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle changes to the office use section
/*   const handleOfficeUseChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setOfficeUseData({
      ...officeUseData,
      [name]: type === 'checkbox' ? checked : value,
    });
  }; */

  const handleRelationshipChange = (value: string): void => {
    setAcknowledgmentData({
      ...acknowledgmentData,
      relationship: value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Handle the form submission logic here
    //console.log('Form submitted:', { providerData, acknowledgmentData, officeUseData });
    // You could send this data to your backend, show a confirmation message, etc.
    alert('Form submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">NOTICE OF PRIVACY PRACTICES</h1>
            
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <p className="text-sm text-blue-800">
                Please complete the provider information below. All fields are required.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="providerName" className="block text-sm font-medium text-gray-700">Healthcare Provider Name</label>
                <input
                  type="text"
                  id="providerName"
                  name="providerName"
                  value={providerData.providerName}
                  onChange={handleProviderInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={providerData.address}
                  onChange={handleProviderInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cityStateZip" className="block text-sm font-medium text-gray-700">City, State ZIP</label>
                <input
                  type="text"
                  id="cityStateZip"
                  name="cityStateZip"
                  value={providerData.cityStateZip}
                  onChange={handleProviderInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={providerData.phone}
                  onChange={handleProviderInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={providerData.email}
                  onChange={handleProviderInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={providerData.website}
                  onChange={handleProviderInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700">Effective Date</label>
                <input
                  type="date"
                  id="effectiveDate"
                  name="effectiveDate"
                  value={providerData.effectiveDate}
                  onChange={handleProviderInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6 prose prose-blue max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.
              </h2>
            </div>

            <p>
              We understand the importance of privacy and are committed to maintaining the confidentiality of your medical information. We make a record of the medical care we provide and may receive such records from others. We use these records to provide or enable other health care providers to provide quality medical care, to obtain payment for services provided to you as allowed by your health plan and to enable us to meet our professional and legal obligations to operate this medical practice properly. We are required by law to maintain the privacy of protected health information, to provide individuals with notice of our legal duties and privacy practices with respect to protected health information, and to notify affected individuals following a breach of unsecured protected health information. This notice describes how we may use and disclose your medical information. It also describes your rights and our legal obligations with respect to your medical information.
            </p>

            <p>
              If you have any questions about this Notice, please contact our Privacy Officer at {config.supportEmail}.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">TABLE OF CONTENTS</h2>
            <ol className="list-decimal list-inside space-y-1 text-blue-600">
              <li><a href="#uses-disclosures" className="hover:underline">How This Medical Practice May Use or Disclose Your Health Information</a></li>
              <li><a href="#no-use-disclosure" className="hover:underline">When This Medical Practice May Not Use or Disclose Your Health Information</a></li>
              <li><a href="#your-rights" className="hover:underline">Your Health Information Rights</a></li>
              <li><a href="#changes" className="hover:underline">Changes to this Notice of Privacy Practices</a></li>
              <li><a href="#complaints" className="hover:underline">Complaints</a></li>
              <li><a href="#acknowledgment" className="hover:underline">Acknowledgment of Receipt</a></li>
            </ol>

            <h2 id="uses-disclosures" className="text-xl font-bold text-gray-900 mt-8 mb-4">1. HOW THIS MEDICAL PRACTICE MAY USE OR DISCLOSE YOUR HEALTH INFORMATION</h2>
            
            <p>
              The medical record is the property of this medical practice, but the information in the medical record belongs to you. The law permits us to use or disclose your health information for the following purposes:
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Treatment</h3>
            <p>
              We use medical information about you to provide your medical care. We disclose medical information to our employees and others who are involved in providing the care you need. For example, we may share your medical information with other physicians or other health care providers who will provide services that we do not provide. Or we may share this information with a pharmacist who needs it to dispense a prescription to you, or a laboratory that performs a test. We may also disclose medical information to members of your family or others who can help you when you are sick or injured, or after you die.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Payment</h3>
            <p>
              We use and disclose medical information about you to obtain payment for the services we provide. For example, we give your health plan the information it requires before it will pay us. We may also disclose information to other health care providers to assist them in obtaining payment for services they have provided to you.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Health Care Operations</h3>
            <p>
              We may use and disclose medical information about you to operate this medical practice. For example, we may use and disclose this information to review and improve the quality of care we provide, or the competence and qualifications of our professional staff. Or we may use and disclose this information to get your health plan to authorize services or referrals. We may also use and disclose this information as necessary for medical reviews, legal services and audits, including fraud and abuse detection and compliance programs and business planning and management. We may also share your medical information with our &quot;business associates,&quot; such as our billing service, that perform administrative services for us. We have a written contract with each of these business associates that contains terms requiring them and their subcontractors to protect the confidentiality and security of your protected health information.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Appointment Reminders</h3>
            <p>
              We may use and disclose medical information to contact and remind you about appointments. If you are not home, we may leave this information on your answering machine or in a message left with the person answering the phone.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Sign-in Sheet</h3>
            <p>
              We may use and disclose medical information about you by having you sign in when you arrive at our office. We may also call out your name when we are ready to see you.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Notification and Communication with Family</h3>
            <p>
              We may disclose your health information to notify or assist in notifying a family member, your personal representative or another person responsible for your care about your location, your general condition or, unless you had instructed us otherwise, in the event of your death. In the event of a disaster, we may disclose information to a relief organization so that they may coordinate these notification efforts. We may also disclose information to someone who is involved with your care or helps pay for your care. If you are able and available to agree or object, we will give you the opportunity to object prior to making these disclosures, although we may disclose this information in a disaster even over your objection if we believe it is necessary to respond to the emergency circumstances. If you are unable or unavailable to agree or object, our health professionals will use their best judgment in communication with your family and others.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Marketing</h3>
            <p>
              Provided we do not receive any payment for making these communications, we may contact you to give you information about products or services related to your treatment, case management or care coordination, or to direct or recommend other treatments, therapies, health care providers or settings of care that may be of interest to you. We may similarly describe products or services provided by this practice and tell you which health plans this practice participates in. We may also encourage you to maintain a healthy lifestyle and get recommended tests, participate in a disease management program, provide you with small gifts, tell you about government sponsored health programs or encourage you to purchase a product or service when we see you, for which we may be paid. Finally, we may receive compensation which covers our cost of reminding you to take and refill your medication, or otherwise communicate about a drug or biologic that is currently prescribed for you. We will not otherwise use or disclose your medical information for marketing purposes or accept any payment for other marketing communications without your prior written authorization. The authorization will disclose whether we receive any compensation for any marketing activity you authorize, and we will stop any future marketing activity to the extent you revoke that authorization.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Sale of Health Information</h3>
            <p>
              We will not sell your health information without your prior written authorization. The authorization will disclose that we will receive compensation for your health information if you authorize us to sell it, and we will stop any future sales of your information to the extent that you revoke that authorization.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Required by Law</h3>
            <p>
              As required by law, we will use and disclose your health information, but we will limit our use or disclosure to the relevant requirements of the law. When the law requires us to report abuse, neglect or domestic violence, or respond to judicial or administrative proceedings, or to law enforcement officials, we will further comply with the requirement set forth below concerning those activities.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Public Health</h3>
            <p>
              We may, and are sometimes required by law, to disclose your health information to public health authorities for purposes related to: preventing or controlling disease, injury or disability; reporting child, elder or dependent adult abuse or neglect; reporting domestic violence; reporting to the Food and Drug Administration problems with products and reactions to medications; and reporting disease or infection exposure. When we report suspected elder or dependent adult abuse or domestic violence, we will inform you or your personal representative promptly unless in our best professional judgment, we believe the notification would place you at risk of serious harm or would require informing a personal representative we believe is responsible for the abuse or harm.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Health Oversight Activities</h3>
            <p>
              We may, and are sometimes required by law, to disclose your health information to health oversight agencies during the course of audits, investigations, inspections, licensure and other proceedings, subject to the limitations imposed by law.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Judicial and Administrative Proceedings</h3>
            <p>
              We may, and are sometimes required by law, to disclose your health information in the course of any administrative or judicial proceeding to the extent expressly authorized by a court or administrative order. We may also disclose information about you in response to a subpoena, discovery request or other lawful process if reasonable efforts have been made to notify you of the request and you have not objected, or if your objections have been resolved by a court or administrative order.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Law Enforcement</h3>
            <p>
              We may, and are sometimes required by law, to disclose your health information to a law enforcement official for purposes such as identifying or locating a suspect, fugitive, material witness or missing person, complying with a court order, warrant, grand jury subpoena and other law enforcement purposes.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Coroners</h3>
            <p>
              We may, and are often required by law, to disclose your health information to coroners in connection with their investigations of deaths.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Organ or Tissue Donation</h3>
            <p>
              We may disclose your health information to organizations involved in procuring, banking or transplanting organs and tissues.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Public Safety</h3>
            <p>
              We may, and are sometimes required by law, to disclose your health information to appropriate persons in order to prevent or lessen a serious and imminent threat to the health or safety of a particular person or the general public.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Proof of Immunization</h3>
            <p>
              We will disclose proof of immunization to a school that is required to have it before admitting a student where you have agreed to the disclosure on behalf of yourself or your dependent.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Specialized Government Functions</h3>
            <p>
              We may disclose your health information for military or national security purposes or to correctional institutions or law enforcement officers that have you in their lawful custody.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Workers&apos; Compensation</h3>
            <p>
              We may disclose your health information as necessary to comply with workers&apos; compensation laws. For example, to the extent your care is covered by workers&apos; compensation, we may be required make periodic reports to your employer about your condition. We are also required by law to report cases of occupational injury or occupational illness to the employer or workers&apos; compensation insurer.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Change of Ownership</h3>
            <p>
              In the event that this medical practice is sold or merged with another organization, your health information/record will become the property of the new owner, although you will maintain the right to request that copies of your health information be transferred to another physician or medical group.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Breach Notification</h3>
            <p>
              In the case of a breach of unsecured protected health information, we will notify you as required by law. If you have provided us with a current e-mail address, we may use e-mail to communicate information related to the breach. In some circumstances our business associate may provide the notification. We may also provide notification by other methods as appropriate.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Research</h3>
            <p>
              We may disclose your health information to researchers conducting research with respect to which your written authorization is not required as approved by an Institutional Review Board or privacy board, in compliance with governing law.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Fundraising</h3>
            <p>
              We may use or disclose your demographic information in order to contact you for our fundraising activities. For example, we may use the dates that you received treatment, the department of service, your treating physician, outcome information and health insurance status to identify individuals that may be interested in participating in fundraising activities. If you do not want to receive these materials, notify the Privacy Officer listed at the top of this Notice of Privacy Practices and we will stop any further fundraising communications. Similarly, you should notify the Privacy Officer if you decide you want to start receiving these solicitations again.
            </p>

            <h2 id="no-use-disclosure" className="text-xl font-bold text-gray-900 mt-8 mb-4">2. WHEN THIS MEDICAL PRACTICE MAY NOT USE OR DISCLOSE YOUR HEALTH INFORMATION</h2>
            <p>
              Except as described in this Notice of Privacy Practices, this medical practice will, consistent with its legal obligations, not use or disclose health information which identifies you without your written authorization. If you do authorize this medical practice to use or disclose your health information for another purpose, you may revoke your authorization in writing at any time.
            </p>

            <h2 id="your-rights" className="text-xl font-bold text-gray-900 mt-8 mb-4">3. YOUR HEALTH INFORMATION RIGHTS</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Right to Request Special Privacy Protections</h3>
            <p>
              You have the right to request restrictions on certain uses and disclosures of your health information by a written request specifying what information you want to limit, and what limitations on our use or disclosure of that information you wish to have imposed. If you tell us not to disclose information to your commercial health plan concerning health care items or services for which you paid for in full out-of-pocket, we will abide by your request, unless we must disclose the information for treatment or legal reasons. We reserve the right to accept or reject any other request, and will notify you of our decision.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Right to Request Confidential Communications</h3>
            <p>
              You have the right to request that you receive your health information in a specific way or at a specific location. For example, you may ask that we send information to a particular e-mail account or to your work address. We will comply with all reasonable requests submitted in writing which specify how or where you wish to receive these communications.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Right to Inspect and Copy</h3>
            <p>
              You have the right to inspect and copy your health information, with limited exceptions. To access your medical information, you must submit a written request detailing what information you want access to, whether you want to inspect it or get a copy of it, and if you want a copy, your preferred form and format. We will provide copies in your requested form and format if it is readily producible, or we will provide you with an alternative format you find acceptable, or if we can&apos;t agree and we maintain the record in an electronic format, your choice of a readable electronic or hardcopy format. We will also send a copy to any other person you designate in writing. We will charge a reasonable fee which covers our costs for labor, supplies, postage, and if requested and agreed to in advance, the cost of preparing an explanation or summary. We may deny your request under limited circumstances. If we deny your request to access your child&apos;s records or the records of an incapacitated adult you are representing because we believe allowing access would be reasonably likely to cause substantial harm to the patient, you will have a right to appeal our decision.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Right to Amend or Supplement</h3>
            <p>
              You have a right to request that we amend your health information that you believe is incorrect or incomplete. You must make a request to amend in writing, and include the reasons you believe the information is inaccurate or incomplete. We are not required to change your health information, and will provide you with information about this medical practice&apos;s denial and how you can disagree with the denial. We may deny your request if we do not have the information, if we did not create the information (unless the person or entity that created the information is no longer available to make the amendment), if you would not be permitted to inspect or copy the information at issue, or if the information is accurate and complete as is. If we deny your request, you may submit a written statement of your disagreement with that decision, and we may, in turn, prepare a written rebuttal. All information related to any request to amend will be maintained and disclosed in conjunction with any subsequent disclosure of the disputed information.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Right to an Accounting of Disclosures</h3>
            <p>
              You have a right to receive an accounting of disclosures of your health information made by this medical practice, except that this medical practice does not have to account for the disclosures provided to you or pursuant to your written authorization, or as described in paragraphs 1 (treatment), 2 (payment), 3 (health care operations), 6 (notification and communication with family) and 18 (specialized government functions) of Section A of this Notice of Privacy Practices or disclosures for purposes of research or public health which exclude direct patient identifiers, or which are incident to a use or disclosure otherwise permitted or authorized by law, or the disclosures to a health oversight agency or law enforcement official to the extent this medical practice has received notice from that agency or official that providing this accounting would be reasonably likely to impede their activities.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Right to a Paper or Electronic Copy of this Notice</h3>
            <p>
              You have a right to notice of our legal duties and privacy practices with respect to your health information, including a right to a paper copy of this Notice of Privacy Practices, even if you have previously requested its receipt by e-mail.
            </p>

            <p>
              If you would like to have a more detailed explanation of these rights or if you would like to exercise one or more of these rights, contact our Privacy Officer at {config.supportEmail}.
            </p>

            <h2 id="changes" className="text-xl font-bold text-gray-900 mt-8 mb-4">4. CHANGES TO THIS NOTICE OF PRIVACY PRACTICES</h2>
            <p>
              We reserve the right to amend this Notice of Privacy Practices at any time in the future. Until such amendment is made, we are required by law to comply with the terms of this Notice currently in effect. After an amendment is made, the revised Notice of Privacy Practices will apply to all protected health information that we maintain, regardless of when it was created or received. We will keep a copy of the current notice posted in our reception area, and a copy will be available at each appointment. We will also post the current notice on our website.
            </p>

            <h2 id="complaints" className="text-xl font-bold text-gray-900 mt-8 mb-4">5. COMPLAINTS</h2>
            <p>
              Complaints about this Notice of Privacy Practices or how this medical practice handles your health information should be directed to our Privacy Officer at {config.supportEmail}.
            </p>

            <p>
              If you are not satisfied with the manner in which this office handles a complaint, you may submit a formal complaint to:
            </p>

            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <p>
                Office for Civil Rights<br />
                Department of Health and Human Services<br />
                200 Independence Avenue, S.W.<br />
                Washington, D.C. 20201<br />
                http://www.hhs.gov/ocr/privacy/hipaa/complaints/hipcomplaint.pdf
              </p>
            </div>

            <p className="mt-4">
              You will not be penalized in any way for filing a complaint.
            </p>

            {/* Added Acknowledgment Section */}
            <h2 id="acknowledgment" className="text-xl font-bold text-gray-900 mt-8 mb-4">ACKNOWLEDGMENT OF RECEIPT OF NOTICE OF PRIVACY PRACTICES</h2>
            
            <h2 id="acknowledgment" className="text-xl font-bold text-gray-900 mt-8 mb-4">ACKNOWLEDGMENT OF RECEIPT OF NOTICE OF PRIVACY PRACTICES</h2>
            
            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mt-4">
              <p className="mb-6">
                I hereby acknowledge that I received a copy of this medical practice&apos;s Notice of Privacy Practices. 
                I further acknowledge that a copy of the current notice will be posted in the reception area, 
                and that a copy of any amended Notice of Privacy Practices will be available at each appointment.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="flex flex-col">
                  <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-1">Signed:</label>
                  <div className="border-b-2 border-gray-300 pb-1">
                    <input 
                      type="text" 
                      id="signature" 
                      name="signature" 
                      className="w-full border-none focus:ring-0 focus:outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="signatureDate" className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
                  <div className="border-b-2 border-gray-300 pb-1">
                    <input 
                      type="date" 
                      id="signatureDate" 
                      name="signatureDate" 
                      className="w-full border-none focus:ring-0 focus:outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Print Name:</label>
                  <div className="border-b-2 border-gray-300 pb-1">
                    <input 
                      type="text" 
                      id="name" 
                      name="name"
                      value={acknowledgmentData.name}
                      onChange={handleInputChange}
                      className="w-full border-none focus:ring-0 focus:outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Telephone:</label>
                  <div className="border-b-2 border-gray-300 pb-1">
                    <input 
                      type="tel" 
                      id="telephone" 
                      name="telephone"
                      value={acknowledgmentData.telephone}
                      onChange={handleInputChange}
                      className="w-full border-none focus:ring-0 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="block text-sm font-medium text-gray-700 mb-2">If not signed by the patient, please indicate relationship:</p>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
                  <div className="flex items-center">
                    <input 
                      id="parent" 
                      name="relationship" 
                      type="checkbox" 
                      checked={acknowledgmentData.relationship === 'Parent or guardian of minor patient'}
                      onChange={() => handleRelationshipChange('Parent or guardian of minor patient')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="parent" className="ml-2 block text-sm text-gray-700">Parent or guardian of minor patient</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      id="guardian" 
                      name="relationship" 
                      type="checkbox"
                      checked={acknowledgmentData.relationship === 'Guardian or conservator of an incompetent patient'}
                      onChange={() => handleRelationshipChange('Guardian or conservator of an incompetent patient')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="guardian" className="ml-2 block text-sm text-gray-700">Guardian or conservator of an incompetent patient</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      id="representative" 
                      name="relationship" 
                      type="checkbox"
                      checked={acknowledgmentData.relationship === 'Beneficiary or personal representative of deceased patient'}
                      onChange={() => handleRelationshipChange('Beneficiary or personal representative of deceased patient')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="representative" className="ml-2 block text-sm text-gray-700">Beneficiary or personal representative of deceased patient</label>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gray-100 rounded-md">
                <p className="font-medium text-gray-700 mb-3">For Office Use Only:</p>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="h-5 flex items-center">
                      <input 
                        type="checkbox" 
                        id="refused" 
                        name="officeUseRefused"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="refused" className="text-gray-700">Individual refused to sign</label>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-5 flex items-center">
                      <input 
                        type="checkbox" 
                        id="barriers" 
                        name="officeUseBarriers"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="barriers" className="text-gray-700">Communications barriers prohibited obtaining the acknowledgment</label>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-5 flex items-center">
                      <input 
                        type="checkbox" 
                        id="emergency" 
                        name="officeUseEmergency"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="emergency" className="text-gray-700">An emergency situation prevented us from obtaining acknowledgment</label>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-5 flex items-center">
                      <input 
                        type="checkbox" 
                        id="other" 
                        name="officeUseOther"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="other" className="text-gray-700 flex items-center">
                        Other (Please Specify): 
                        <div className="border-b border-gray-400 w-64 ml-1">
                          <input 
                            type="text" 
                            name="officeUseOtherSpecify"
                            className="w-full border-none focus:ring-0 bg-transparent text-sm" 
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center">
                      <span className="block text-sm font-medium text-gray-700 mr-2">Date:</span>
                      <div className="border-b border-gray-400 w-48">
                        <input 
                          type="date" 
                          name="officeUseDate"
                          className="w-full border-none focus:ring-0 bg-transparent text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit Form
                </button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex justify-between">
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Home
                </Link>
                <button
                  onClick={() => window.print()}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Print Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    <style>{`
      @media print {
        body {
          font-size: 12pt;
        }
        .no-print {
          display: none !important;
        }
        .print-only {
          display: block !important;
        }
      }
    `}</style>
    </div>
  );
}