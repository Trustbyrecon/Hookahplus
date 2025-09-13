'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LegalPage() {
  const [trustLockVerified, setTrustLockVerified] = useState(false);
  const [activeDocument, setActiveDocument] = useState('terms');
  const [cookieConsent, setCookieConsent] = useState(false);

  useEffect(() => {
    // Trust-Lock verification for legal document access
    const verifyTrustLock = async () => {
      try {
        const response = await fetch('/api/trust-lock/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'legal_access',
            context: 'legal_documents'
          })
        });
        
        if (response.ok) {
          setTrustLockVerified(true);
        }
      } catch (error) {
        console.error('Trust-Lock verification failed:', error);
      }
    };

    verifyTrustLock();

    // Check existing cookie consent
    const existingConsent = localStorage.getItem('cookie-consent');
    if (existingConsent === 'accepted') {
      setCookieConsent(true);
    }
  }, []);

  const handleCookieConsent = (accepted: boolean) => {
    setCookieConsent(accepted);
    localStorage.setItem('cookie-consent', accepted ? 'accepted' : 'declined');
    
    // Track consent with Trust-Lock verification
    fetch('/api/legal/cookie-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accepted,
        timestamp: new Date().toISOString(),
        trustLockVerified: true
      })
    });
  };

  const legalDocuments = [
    {
      id: 'terms',
      title: 'Terms of Service',
      lastUpdated: '2024-12-01',
      content: {
        sections: [
          {
            title: '1. Acceptance of Terms',
            content: 'By accessing and using Hookah+ services, you accept and agree to be bound by the terms and provision of this agreement. Trust-Lock verification is required for all transactions to ensure security and compliance.'
          },
          {
            title: '2. Description of Service',
            content: 'Hookah+ provides a digital platform for managing hookah sessions, including but not limited to flavor selection, payment processing, session tracking, and customer management. All services are protected by Trust-Lock security protocols.'
          },
          {
            title: '3. User Responsibilities',
            content: 'Users are responsible for providing accurate information, maintaining the security of their accounts, and complying with all applicable laws and regulations. Trust-Lock verification may be required for certain operations.'
          },
          {
            title: '4. Payment Terms',
            content: 'All payments are processed securely through Stripe. By completing a purchase, you authorize us to charge your payment method. Trust-Lock verification ensures the security of all financial transactions.'
          },
          {
            title: '5. Privacy and Data Protection',
            content: 'We are committed to protecting your privacy and personal data in accordance with GDPR, CCPA, and other applicable privacy laws. Trust-Lock verification helps ensure data integrity and security.'
          },
          {
            title: '6. Limitation of Liability',
            content: 'Hookah+ shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service, except where prohibited by law.'
          },
          {
            title: '7. Termination',
            content: 'We reserve the right to terminate or suspend your account at any time for violation of these terms. Trust-Lock verification may be required for account recovery processes.'
          },
          {
            title: '8. Governing Law',
            content: 'These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Hookah+ operates, without regard to conflict of law principles.'
          }
        ]
      }
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      lastUpdated: '2024-12-01',
      content: {
        sections: [
          {
            title: '1. Information We Collect',
            content: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes personal information, payment information, and usage data. All data collection is protected by Trust-Lock verification.'
          },
          {
            title: '2. How We Use Your Information',
            content: 'We use your information to provide, maintain, and improve our services, process transactions, communicate with you, and ensure security through Trust-Lock verification protocols.'
          },
          {
            title: '3. Information Sharing',
            content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. Trust-Lock verification ensures the security of any data sharing.'
          },
          {
            title: '4. Data Security',
            content: 'We implement appropriate security measures to protect your personal information, including Trust-Lock verification, encryption, and secure data storage practices.'
          },
          {
            title: '5. Your Rights',
            content: 'You have the right to access, update, or delete your personal information. You may also opt out of certain communications. Trust-Lock verification may be required for data access requests.'
          },
          {
            title: '6. Cookies and Tracking',
            content: 'We use cookies and similar technologies to enhance your experience and analyze usage patterns. You can control cookie preferences through our cookie consent banner.'
          },
          {
            title: '7. International Transfers',
            content: 'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.'
          },
          {
            title: '8. Changes to This Policy',
            content: 'We may update this privacy policy from time to time. We will notify you of any material changes and obtain your consent where required by law.'
          }
        ]
      }
    },
    {
      id: 'cookies',
      title: 'Cookie Policy',
      lastUpdated: '2024-12-01',
      content: {
        sections: [
          {
            title: '1. What Are Cookies',
            content: 'Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience and understand how you use our services.'
          },
          {
            title: '2. Types of Cookies We Use',
            content: 'We use essential cookies for basic functionality, analytics cookies to understand usage patterns, and marketing cookies to provide personalized content. Trust-Lock verification cookies ensure security.'
          },
          {
            title: '3. Managing Cookies',
            content: 'You can control cookie preferences through your browser settings or our cookie consent banner. Some features may not work properly if cookies are disabled.'
          },
          {
            title: '4. Third-Party Cookies',
            content: 'We may use third-party services that set their own cookies, such as analytics providers and payment processors. These are subject to their respective privacy policies.'
          }
        ]
      }
    },
    {
      id: 'gdpr',
      title: 'GDPR Compliance',
      lastUpdated: '2024-12-01',
      content: {
        sections: [
          {
            title: '1. Data Controller',
            content: 'Hookah+ is the data controller for personal data processed through our services. We are committed to compliance with the General Data Protection Regulation (GDPR).'
          },
          {
            title: '2. Lawful Basis for Processing',
            content: 'We process personal data based on consent, contract performance, legitimate interests, and legal obligations. Trust-Lock verification ensures the integrity of consent records.'
          },
          {
            title: '3. Data Subject Rights',
            content: 'Under GDPR, you have the right to access, rectify, erase, restrict processing, data portability, and object to processing. Trust-Lock verification may be required for exercising these rights.'
          },
          {
            title: '4. Data Protection Officer',
            content: 'We have appointed a Data Protection Officer (DPO) to oversee GDPR compliance. Contact our DPO at dpo@hookahplus.net for privacy-related inquiries.'
          },
          {
            title: '5. Data Breach Notification',
            content: 'In the event of a data breach, we will notify the relevant supervisory authority within 72 hours and affected individuals without undue delay.'
          },
          {
            title: '6. International Transfers',
            content: 'We ensure appropriate safeguards for international data transfers, including standard contractual clauses and adequacy decisions.'
          }
        ]
      }
    }
  ];

  if (!trustLockVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Trust-Lock Verification Required</h2>
          <p className="text-gray-300 mb-6">
            Please complete Trust-Lock verification to access legal documents.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentDocument = legalDocuments.find(doc => doc.id === activeDocument);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Legal Documents</h1>
          <p className="text-gray-300 text-lg mb-6">
            Terms of service, privacy policy, and compliance information
          </p>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-sm">Trust-Lock Verified</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-white mb-4">Documents</h3>
                <nav className="space-y-2">
                  {legalDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setActiveDocument(doc.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        activeDocument === doc.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {doc.title}
                    </button>
                  ))}
                </nav>

                {/* Cookie Consent */}
                <div className="mt-8 p-4 bg-blue-500/20 rounded-lg">
                  <h4 className="text-blue-400 font-semibold mb-2">Cookie Consent</h4>
                  <p className="text-blue-200 text-sm mb-3">
                    We use cookies to enhance your experience
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCookieConsent(true)}
                      className={`w-full px-3 py-2 rounded text-sm ${
                        cookieConsent ? 'bg-green-600 text-white' : 'bg-white/20 text-gray-300'
                      }`}
                    >
                      Accept All
                    </button>
                    <button
                      onClick={() => handleCookieConsent(false)}
                      className={`w-full px-3 py-2 rounded text-sm ${
                        !cookieConsent ? 'bg-red-600 text-white' : 'bg-white/20 text-gray-300'
                      }`}
                    >
                      Reject All
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                {currentDocument && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-bold text-white">{currentDocument.title}</h2>
                      <span className="text-gray-400 text-sm">
                        Last updated: {currentDocument.lastUpdated}
                      </span>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      {currentDocument.content.sections.map((section, index) => (
                        <div key={index} className="mb-8">
                          <h3 className="text-xl font-semibold text-white mb-4">{section.title}</h3>
                          <p className="text-gray-300 leading-relaxed">{section.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Trust-Lock Notice */}
                    <div className="mt-8 p-6 bg-green-500/20 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-green-400 text-xl mr-2">🔒</span>
                        <h4 className="text-green-400 font-semibold">Trust-Lock Security</h4>
                      </div>
                      <p className="text-green-200 text-sm">
                        All legal documents and compliance features are protected by Trust-Lock verification 
                        to ensure authenticity and prevent tampering. This document has been verified and 
                        is current as of the last updated date.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Legal Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-white mb-2">General Legal Inquiries</h4>
                <p className="text-gray-300">legal@hookahplus.net</p>
                <p className="text-gray-400 text-sm">Response within 48 hours</p>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-white mb-2">Data Protection Officer</h4>
                <p className="text-gray-300">dpo@hookahplus.net</p>
                <p className="text-gray-400 text-sm">GDPR compliance inquiries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
