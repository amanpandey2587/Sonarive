import { Brain, FileText, Zap, Shield, Users, Pill, MapPin, Heart, Stethoscope, UserCheck,   } from "lucide-react";
import Link from "next/link";
const coreFeatures = [
  {
    icon: <Zap className="h-8 w-8 text-white" />,
    title: 'Medical Imaging Analysis',
    description: 'Advanced AI analysis of MRI, CT scans, X-rays, and ultrasounds with 99.8% accuracy. Detect anomalies, fractures, tumors, and complex conditions instantly.',
    gradient: 'from-cyan-500 to-blue-500',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-400/30',
    delay: '0ms'
  },
  {
    icon: <Pill className="h-8 w-8 text-white" />,
    title: 'AI Drug Discovery',
    description: 'Accelerate pharmaceutical research with AI-powered molecular analysis, drug interaction prediction, and personalized medication recommendations.',
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-400/30',
    delay: '100ms'
  },
  {
    icon: <MapPin className="h-8 w-8 text-white" />,
    title: 'Smart Hospital Finder',
    description: 'Find the best hospitals and specialists near you based on your condition, insurance, ratings, and real-time availability.',
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-400/30',
    delay: '200ms'
  },
  {
    icon: <Heart className="h-8 w-8 text-white" />,
    title: 'Mental Health Analysis',
    description: 'Comprehensive mental health assessments using AI-powered behavioral analysis, mood tracking, and personalized therapy recommendations.',
    gradient: 'from-rose-500 to-pink-500',
    bgGradient: 'from-rose-500/20 to-pink-500/20',
    borderColor: 'border-rose-400/30',
    delay: '300ms'
  },
  {
    icon: <FileText className="h-8 w-8 text-white" />,
    title: 'Treatment Planner',
    description: 'Create personalized treatment plans with AI-optimized protocols, medication schedules, and progress tracking for better outcomes.',
    gradient: 'from-teal-500 to-cyan-500',
    bgGradient: 'from-teal-500/20 to-cyan-500/20',
    borderColor: 'border-teal-400/30',
    delay: '400ms'
  },
  {
    icon: <UserCheck className="h-8 w-8 text-white" />,
    title: 'Second Opinion AI',
    description: 'Get expert-level second opinions on diagnoses and treatments using our AI trained on millions of medical cases and expert knowledge.',
    gradient: 'from-indigo-500 to-blue-500',
    bgGradient: 'from-indigo-500/20 to-blue-500/20',
    borderColor: 'border-indigo-400/30',
    delay: '500ms'
  }
];



export default function SonariveFeatures() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/6 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-3000"></div>
        <div className="absolute top-1/3 left-2/3 w-32 h-32 bg-rose-500/10 rounded-full blur-xl animate-pulse delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full border border-cyan-400/30 text-sm font-medium text-cyan-300 mb-8 backdrop-blur-sm">
            <Brain className="w-5 h-5 mr-2" />
            Next-Generation Medical AI Platform
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
            <span className="text-white">Transform Healthcare with </span>
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Sonarive AI
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-12">
            From medical imaging analysis to drug discovery, mental health assessment to treatment planning - 
            experience the complete AI-powered healthcare ecosystem designed for
            <span className="text-cyan-400 font-semibold"> precision</span>, 
            <span className="text-emerald-400 font-semibold"> speed</span>, and 
            <span className="text-teal-400 font-semibold"> trust</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white px-10 py-5 rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg">
              <Link href="/drugResearch">
              Start Drug Research
              </Link>
            </button>
            <button className="backdrop-blur-sm bg-white/5 border border-cyan-400/30 text-white hover:bg-white/10 px-10 py-5 rounded-2xl font-semibold transition-all transform hover:scale-105 text-lg">
              <Link href="/secondOpinion">
              Take a Second Opinion
              </Link>
            </button>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-20">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Complete Medical AI </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Suite
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Six powerful AI modules working together to revolutionize every aspect of healthcare delivery and research.
            </p>
          </div>

          {/* Main Features Grid */}
          <div className="grid gap-8 md:gap-10 lg:grid-cols-2 xl:grid-cols-3 mb-20">
            {coreFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`
                  backdrop-blur-md bg-white/5 rounded-3xl p-8 border ${feature.borderColor}
                  hover:bg-white/10 hover:scale-105 transition-all duration-500
                  hover:shadow-2xl hover:shadow-cyan-500/20
                  relative overflow-hidden min-h-[280px]
                `}>
                  <div className={`
                    absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500 rounded-3xl
                  `}></div>
                  
                  <div className="relative z-10">
                    <div className={`
                      w-18 h-18 bg-gradient-to-br ${feature.gradient} rounded-2xl 
                      flex items-center justify-center mb-6 shadow-xl
                      group-hover:scale-110 transition-transform duration-300
                    `}>
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-100 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
                      {feature.description}
                    </p>
                  </div>

                  <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-cyan-400/30 transition-colors duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="py-20">
          <div className="backdrop-blur-md bg-white/5 rounded-3xl p-12 border border-cyan-400/20 max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="flex space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-7 h-7 text-white" />
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Revolutionize Healthcare?
              </h3>
              
              <p className="text-slate-300 mb-8 max-w-3xl mx-auto text-lg">
                Join over 10,000 healthcare professionals and researchers worldwide who trust Sonarive 
                for comprehensive AI-powered medical solutions. Start with any module and expand as you grow.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                <button className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white px-10 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <Link href="/scan">
                  Start Medical Scan
                  </Link>
                </button>
                <button className="backdrop-blur-sm bg-white/5 border border-cyan-400/30 text-white hover:bg-white/10 px-10 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105">
                  <Link href="/mentalHealth">
                  Start Mental Health Analysis
                  </Link>
                </button>
              </div>
            </div>

            
          </div>
        </section>

      </div>
    </div>
  );
}