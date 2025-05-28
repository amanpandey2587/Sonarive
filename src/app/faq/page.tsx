"use client"
import React, { useState } from 'react';
import {  Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';


const faqData = [
  {
    question: "What is Sonarive and how does it work?",
    answer: "Sonarive is an advanced medical imaging analysis platform that uses artificial intelligence to assist healthcare professionals in diagnosing medical conditions. Our AI algorithms analyze medical scans such as X-rays, CT scans, and MRIs to identify potential abnormalities and provide detailed insights to support clinical decision-making."
  },
  {
    question: "How accurate is the AI diagnosis?",
    answer: "Our AI models achieve accuracy rates of 75-78% across various imaging modalities, often matching or exceeding the performance of experienced radiologists. However, Sonarive is designed to assist, not replace, medical professionals. All AI-generated insights should be reviewed and interpreted by qualified healthcare providers."
  },
  {
    question: "What types of medical scans does Sonarive support?",
    answer: "Sonarive supports a wide range of medical imaging modalities including X-rays, CT scans, MRI scans, ultrasounds, and mammograms. Our platform can analyze scans for various medical specialties including cardiology, orthopedics, oncology, and general radiology."
  },
  {
    question: "How secure is patient data on your platform?",
    answer: "Patient data security is our top priority. We employ enterprise-grade encryption, comply with HIPAA regulations, and follow SOC 2 Type II standards. All data is encrypted both in transit and at rest, and we maintain strict access controls and audit trails to ensure patient privacy and data integrity."
  },
  {
    question: "Can Sonarive integrate with existing hospital systems?",
    answer: "Yes, Sonarive is designed to seamlessly integrate with existing PACS (Picture Archiving and Communication Systems), EMR/EHR systems, and other hospital infrastructure. Our platform supports standard medical imaging protocols like DICOM and HL7 for smooth data exchange."
  },
  {
    question: "What is the pricing model for Sonarive?",
    answer: "We offer flexible pricing models including per-scan pricing, monthly subscriptions, and enterprise licensing options. Pricing varies based on usage volume, features required, and integration complexity. Contact our sales team for a customized quote based on your specific needs."
  },
  {
    question: "Do you provide training and support?",
    answer: "Absolutely! We provide comprehensive training programs for healthcare professionals, including online tutorials, live webinars, and on-site training sessions. Our support team is available 24/7 to assist with technical issues, and we offer dedicated customer success managers for enterprise clients."
  }
];

export default function FaqPage() {
  const [openItems, setOpenItems] = useState(new Set());
  const router=useRouter();
  const toggleItem = (index:Number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500/12 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-300/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 min-h-screen">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-200 via-teal-200 to-green-200 bg-clip-text text-transparent drop-shadow-lg">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about Sonarive.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqData.map((item, index) => {
              const isOpen = openItems.has(index);
              return (
                <div key={index} className="group">
                  
                  <div className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/40 via-emerald-900/20 to-teal-900/30 border border-emerald-200/10 rounded-2xl transition-all duration-300 hover:border-emerald-300/20 hover:shadow-emerald-500/10 overflow-hidden">
                    
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full px-6 py-6 text-left flex items-center justify-between group-hover:bg-emerald-500/5 transition-all duration-300 relative z-10"
                    >
                      <span className="text-lg font-semibold text-emerald-100 group-hover:text-emerald-50 transition-colors duration-300 pr-4">
                        {item.question}
                      </span>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-400/30 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180 bg-emerald-600/30' : ''}`}>
                        {isOpen ? (
                          <Minus className="w-4 h-4 text-emerald-300" />
                        ) : (
                          <Plus className="w-4 h-4 text-emerald-300" />
                        )}
                      </div>
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="px-6 pb-6 relative z-10">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent mb-4"></div>
                        <p className="text-base text-teal-200/80 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>

                    <div className="absolute top-4 right-16 w-2 h-2 bg-emerald-400/30 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-4 left-6 w-1 h-1 bg-teal-400/40 rounded-full animate-pulse delay-1000"></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/30 via-emerald-900/20 to-teal-900/30 border border-emerald-200/10 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-emerald-100 mb-4">
                Still have questions?
              </h3>
              <p className="text-teal-200/80 mb-6 leading-relaxed">
                Our support team is here to help. Reach out to us for personalized assistance with your specific needs.
              </p>
              <button
              onClick={()=>router.push('/contact')}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}