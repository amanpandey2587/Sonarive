"use client"
import React, { useState } from 'react';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    alert('Email sent successfully!');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent drop-shadow-lg">
            Reach Out to Us
          </h1>
          <p className="text-xl text-slate-300/90 max-w-2xl mx-auto leading-relaxed">
            Have questions or feedback? Drop your email and we'll get back to you.
          </p>
        </div>

        <div className="flex justify-center items-center flex-1">
          <div className="w-full max-w-lg">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-teal-500/20 to-indigo-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/30 via-blue-900/20 to-indigo-900/30 border border-white/10 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-blue-500/10 hover:border-white/20 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-3xl"></div>
                
                <div className="absolute inset-0 -top-40 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-12 transform scale-x-150 transition-all duration-1000 group-hover:top-40"></div>
                
                <div className="relative z-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label 
                        htmlFor="email" 
                        className="block text-sm font-semibold text-slate-200 tracking-wide"
                      >
                        Your Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-slate-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:bg-white/15 hover:border-white/30"
                          required
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"></div>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      type="button"
                      disabled={isSubmitting}
                      className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${
                        isSubmitting 
                          ? 'bg-gradient-to-r from-slate-600 to-slate-700 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-500 hover:via-indigo-500 hover:to-teal-500 shadow-blue-500/25 hover:shadow-blue-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <span>Send Email</span>
                        )}
                      </div>
                    </button>
                  </div>

                  <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-full blur-xl"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-lg"></div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8 space-y-2">
              <p className="text-slate-400/80 text-sm">
                We typically respond within 24 hours
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400/60 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-pulse delay-200"></div>
                <div className="w-2 h-2 bg-teal-400/60 rounded-full animate-pulse delay-400"></div>
              </div>
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