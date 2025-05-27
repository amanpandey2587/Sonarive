import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      {/* Navigation */}
      {/* <Navbar/> */}

      {/* Hero Section */}
      <section className="py-20 md:py-32 lg:py-40 relative">
        <div className="container mx-auto grid items-center gap-12 px-6 md:grid-cols-2 lg:gap-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full border border-cyan-400/30 text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
              AI-Powered Medical Analysis
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Intelligent
              </span>
              <br />
              <span className="text-white">Medical Scan</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Analysis
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-2xl">
              Upload your <span className="text-cyan-400 font-semibold">MRI</span>, {' '}
              <span className="text-emerald-400 font-semibold">CT scans</span>, or {' '}
              <span className="text-teal-400 font-semibold">X-rays</span> and get instant, AI-powered insights. 
              Understand complex medical findings with clear visual reports and plain language summaries.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="group bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white shadow-2xl hover:shadow-cyan-500/25 transition-all transform hover:scale-105 text-lg px-8 py-6 rounded-2xl">
                <Link href="/scan" className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  Analyze Your Scan
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="backdrop-blur-sm bg-white/5 border-cyan-400/30 text-white hover:bg-white/10 hover:border-cyan-400/50 transition-all transform hover:scale-105 text-lg px-8 py-6 rounded-2xl">
                <Link href="/about" className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              {[
                { icon: '✓', text: 'Instant Analysis', color: 'emerald' },
                { icon: '📖', text: 'Plain Language', color: 'cyan' },
                { icon: '💊', text: 'Prescriptions', color: 'teal' },
                { icon: '⚡', text: "Do's & Don'ts", color: 'blue' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-${feature.color}-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm`}>
                    <span className={`text-${feature.color}-400 text-sm`}>{feature.icon}</span>
                  </div>
                  <span className="text-slate-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative z-10 backdrop-blur-md bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Medical Scan Visualization */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 mb-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-400">MRI Brain Scan</span>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-xl h-32 flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-16 h-16 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
                    <div className="h-2 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full w-3/4"></div>
                    <div className="h-2 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full w-1/2"></div>
                    <div className="text-xs text-slate-400 mt-2">Analysis: 98% Complete</div>
                  </div>
                </div>
              </div>

              {/* AI Insights Panel */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">AI Insights</span>
                </div>
                
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-sm text-emerald-400 font-medium">Normal Structure</span>
                  </div>
                  <p className="text-xs text-slate-300">Brain tissue appears healthy with no visible abnormalities detected.</p>
                </div>
                
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-sm text-cyan-400 font-medium">Recommendations</span>
                  </div>
                  <p className="text-xs text-slate-300">Continue regular check-ups and maintain healthy lifestyle.</p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-teal-500/30 to-emerald-500/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-teal-500/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
          </div>
        </div>

        {/* Stats Section */}
       
      </section>

      {/* Features Preview */}
      <section className=" bg-slate-900/50 backdrop-blur-sm">
      </section>
    </div>
  );
}