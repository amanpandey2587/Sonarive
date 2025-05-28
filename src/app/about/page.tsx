'use client'
import React, { useEffect, useRef } from 'react';
import { Users, Target, Lightbulb, ArrowRight, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    AOS: {
      init: (config: any) => void;
    };
    Lenis: new (config: any) => {
      raf: (time: number) => void;
    };
  }
}

const AboutPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initAOS = () => {
      if (typeof window !== 'undefined' && window.AOS) {
        window.AOS.init({
          duration: 700,
          easing: 'ease-out-cubic',
          once: true,
          offset: 100,
          delay: 100,
        });
      }
    };

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js';
    script.onload = initAOS;
    script.onerror = () => console.warn('AOS failed to load');
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const initLenis = () => {
      if (typeof window !== 'undefined' && window.Lenis) {
        const lenis = new window.Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smooth: true,
        });

        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    };

    const lenisScript = document.createElement('script');
    lenisScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/lenis/1.0.42/lenis.min.js';
    lenisScript.onload = initLenis;
    lenisScript.onerror = () => console.warn('Lenis failed to load');
    document.head.appendChild(lenisScript);

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const orbs = document.querySelectorAll('.parallax-orb');
      orbs.forEach((orb, index) => {
        const speed = 0.2 + (index * 0.1);
        const element = orb as HTMLElement;
        element.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      const scripts = document.querySelectorAll('script[src*="aos"], script[src*="lenis"]');
      scripts.forEach(script => script.remove());
      const links = document.querySelectorAll('link[href*="aos"]');
      links.forEach(link => link.remove());
    };
  }, []);

  interface FloatingOrbProps {
    className?: string;
    delay?: number;
  }

  const FloatingOrb: React.FC<FloatingOrbProps> = ({ className = '', delay = 0 }) => (
    <div 
      className={`absolute rounded-full blur-3xl opacity-60 animate-float ${className}`}
      style={{ 
        animationDelay: `${delay}s`,
        animation: `float 6s ease-in-out infinite ${delay}s, pulse 4s ease-in-out infinite ${delay + 1}s`
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb className="parallax-orb -top-40 -right-40 w-96 h-96 bg-blue-500/30" delay={0} />
        <FloatingOrb className="parallax-orb top-1/2 -left-40 w-80 h-80 bg-teal-500/25" delay={2} />
        <FloatingOrb className="parallax-orb -bottom-40 right-1/3 w-72 h-72 bg-cyan-500/20" delay={4} />
        <FloatingOrb className="parallax-orb top-1/4 right-1/4 w-64 h-64 bg-indigo-500/15" delay={3} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-900/20 to-teal-900/30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div ref={heroRef} className="text-center mb-32">
          <div 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-blue-200 mb-8 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:border-white/30"
            data-aos="fade-down"
            data-aos-delay="0"
          >
            <Sparkles className="w-5 h-5 animate-spin-slow" />
            <span className="text-sm font-medium tracking-wide">Revolutionizing Healthcare AI</span>
          </div>
          
          <h1 
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <span className="bg-gradient-to-r from-blue-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent animate-gradient-x">
              About Sonarive
            </span>
          </h1>
          
          <p 
            className="text-xl md:text-2xl text-blue-200/90 max-w-4xl mx-auto leading-relaxed font-light"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            Revolutionizing medical scan analysis through artificial intelligence, 
            empowering both patients and healthcare professionals with precision and clarity.
          </p>
        </div>

        <div ref={missionRef} className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <div data-aos="fade-right" data-aos-delay="200">
            <div className="group backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-10 shadow-2xl hover:shadow-blue-500/25 transition-all duration-700 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-white/15 hover:to-white/8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white group-hover:text-blue-100 transition-colors duration-500">Our Mission</h2>
              </div>
              
              <div className="space-y-6 text-lg leading-relaxed">
                <p className="text-blue-100/90 group-hover:text-white transition-colors duration-500">
                  At Sonarive, our mission is to empower patients and healthcare professionals with accessible, 
                  understandable, and highly accurate medical scan interpretations. We believe that by leveraging 
                  the power of AI, we can demystify complex medical data and contribute to better health outcomes.
                </p>
                <p className="text-blue-100/80 group-hover:text-blue-100 transition-colors duration-500">
                  Our platform is built on the principles of precision, privacy, and patient-centricity. We are 
                  committed to continuous innovation and ethical AI development to serve the evolving needs of 
                  the healthcare community.
                </p>
              </div>
              
              <div className="flex items-center gap-3 text-teal-300 font-medium mt-8 hover:gap-5 transition-all duration-500 cursor-pointer group-hover:text-teal-200">
                <span>Learn more about our technology</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          </div>
          
          <div data-aos="fade-left" data-aos-delay="400">
            <div className="relative">
              <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/25 to-teal-500/20 border border-white/25 rounded-3xl p-10 shadow-2xl hover:shadow-teal-500/25 transition-all duration-700 hover:scale-[1.02]">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    { value: '99.7%', label: 'Accuracy Rate', delay: 0 },
                    { value: '50K+', label: 'Scans Analyzed', delay: 100 },
                    { value: '24/7', label: 'Availability', delay: 200 },
                    { value: '5min', label: 'Avg Analysis', delay: 300 }
                  ].map((stat, index) => (
                    <div 
                      key={index}
                      className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-500 hover:scale-105 border border-white/10 hover:border-white/20"
                      data-aos="fade-up"
                      data-aos-delay={stat.delay + 600}
                    >
                      <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                      <div className="text-sm text-blue-200 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="text-center text-blue-100 text-lg font-medium">
                  Trusted by healthcare professionals worldwide
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={valuesRef} className="mb-32">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-300 to-teal-300 bg-clip-text text-transparent">
                Our Core Values
              </span>
            </h2>
            <p className="text-xl text-blue-200/90 max-w-3xl mx-auto leading-relaxed">
              The principles that guide every decision we make and every feature we build
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: Users,
                title: 'Patient-Centricity',
                description: 'We prioritize the needs and understanding of patients in every feature we develop, ensuring accessibility and clarity in all our solutions.',
                gradient: 'from-blue-500 to-cyan-500',
                delay: 200
              },
              {
                icon: Target,
                title: 'Accuracy & Reliability',
                description: 'We are committed to providing highly accurate analyses powered by state-of-the-art AI, ensuring reliable results you can trust.',
                gradient: 'from-teal-500 to-cyan-500',
                delay: 400
              },
              {
                icon: Lightbulb,
                title: 'Innovation',
                description: 'We continuously explore new technologies to enhance our platform and its capabilities, staying at the forefront of medical AI advancement.',
                gradient: 'from-cyan-500 to-blue-500',
                delay: 600
              }
            ].map((value, index) => (
              <div 
                key={index}
                className="group h-full"
                data-aos="fade-up"
                data-aos-delay={value.delay}
              >
                <div className="backdrop-blur-2xl bg-white/8 border border-white/15 rounded-3xl p-8 h-full shadow-2xl hover:shadow-cyan-500/20 transition-all duration-700 hover:scale-105 hover:bg-white/12 hover:border-white/25">
                  <div className="flex flex-col items-center text-center h-full">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${value.gradient} flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-xl group-hover:shadow-2xl`}>
                      <value.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-blue-100 transition-colors duration-500">
                      {value.title}
                    </h3>
                    <p className="text-blue-100/80 leading-relaxed text-lg group-hover:text-white transition-colors duration-500 flex-grow">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div ref={ctaRef} className="text-center" data-aos="fade-up" data-aos-delay="200">
          <div className="relative backdrop-blur-2xl bg-gradient-to-r from-blue-500/25 to-teal-500/25 border border-white/25 rounded-3xl p-16 shadow-2xl hover:shadow-blue-500/30 transition-all duration-700 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-4xl font-bold text-white mb-6 leading-tight">
                Ready to Experience the Future?
              </h3>
              <p className="text-blue-100/90 text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
                Join thousands of healthcare professionals who trust Sonarive for accurate, 
                fast, and reliable medical scan analysis.
              </p>
              <button className="group bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold px-12 py-5 rounded-full transition-all duration-500 hover:scale-110 shadow-xl hover:shadow-2xl hover:shadow-blue-500/40 border border-white/20 hover:border-white/40">
                <span className="flex items-center gap-3">
                  Get Started Today
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-gradient-x {
          animation: gradient-x 8s ease infinite;
          background-size: 200% 200%;
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        /* Smooth scrolling for better performance */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #06b6d4);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #0891b2);
        }
      `}</style>
    </div>
  );
};

export default AboutPage;