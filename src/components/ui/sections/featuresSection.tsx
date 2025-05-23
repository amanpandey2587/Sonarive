import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Eye, FileText, Zap, Shield, Activity, Users, Clock } from "lucide-react";

const features = [
  {
    icon: <Zap className="h-8 w-8 text-white" />,
    title: 'Automated Scan Analysis',
    description: 'Leverage cutting-edge AI to analyze MRI, CT scans, and X-rays for anomalies and potential conditions quickly and accurately.',
    gradient: 'from-cyan-500 to-blue-500',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-400/30',
    delay: '0ms'
  },
  {
    icon: <Eye className="h-8 w-8 text-white" />,
    title: 'Visual Report Generation',
    description: 'View detailed reports with detected conditions, risks, and anatomical locations. Findings are clearly highlighted on your scan.',
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-400/30',
    delay: '100ms'
  },
  {
    icon: <FileText className="h-8 w-8 text-white" />,
    title: 'Plain Language Summaries',
    description: 'Receive concise summaries of complex medical findings in easy-to-understand language, empowering you with knowledge.',
    gradient: 'from-teal-500 to-cyan-500',
    bgGradient: 'from-teal-500/20 to-cyan-500/20',
    borderColor: 'border-teal-400/30',
    delay: '200ms'
  },
  {
    icon: <Brain className="h-8 w-8 text-white" />,
    title: 'AI-Powered Insights',
    description: 'Get intelligent recommendations and treatment suggestions based on advanced machine learning algorithms trained on millions of scans.',
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-400/30',
    delay: '300ms'
  },
  {
    icon: <Shield className="h-8 w-8 text-white" />,
    title: 'Privacy & Security',
    description: 'Your medical data is encrypted and processed with the highest security standards. HIPAA compliant and fully confidential.',
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-400/30',
    delay: '400ms'
  },
  {
    icon: <Activity className="h-8 w-8 text-white" />,
    title: 'Real-time Processing',
    description: 'Get results in minutes, not days. Our advanced cloud infrastructure ensures rapid analysis without compromising accuracy.',
    gradient: 'from-rose-500 to-pink-500',
    bgGradient: 'from-rose-500/20 to-pink-500/20',
    borderColor: 'border-rose-400/30',
    delay: '500ms'
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full border border-cyan-400/30 text-sm font-medium text-cyan-300 mb-6 backdrop-blur-sm">
            <Zap className="w-4 h-4 mr-2" />
            Advanced AI Technology
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-white">Why Choose </span>
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              MediScan AI?
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Experience the future of medical imaging analysis with features designed for 
            <span className="text-cyan-400 font-semibold"> clarity</span>, 
            <span className="text-emerald-400 font-semibold"> precision</span>, and 
            <span className="text-teal-400 font-semibold"> speed</span>.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative"
              style={{ animationDelay: feature.delay }}
            >
              {/* Card */}
              <div className={`
                backdrop-blur-md bg-white/5 rounded-2xl p-8 border ${feature.borderColor}
                hover:bg-white/10 hover:scale-105 transition-all duration-500
                hover:shadow-2xl hover:shadow-cyan-500/10
                relative overflow-hidden
              `}>
                {/* Background Gradient */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 
                  group-hover:opacity-100 transition-opacity duration-500 rounded-2xl
                `}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`
                    w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl 
                    flex items-center justify-center mb-6 shadow-lg
                    group-hover:scale-110 transition-transform duration-300
                    group-hover:shadow-xl group-hover:shadow-cyan-400/25
                  `}>
                    {feature.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-100 transition-colors">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-cyan-400/20 transition-colors duration-500"></div>
              </div>

              {/* Floating Elements */}
              <div className={`
                absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br ${feature.gradient} 
                rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500
                group-hover:animate-pulse
              `}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center">
          <div className="backdrop-blur-md bg-white/5 rounded-3xl p-12 border border-cyan-400/20 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Transform Your Medical Analysis?
            </h3>
            
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of healthcare professionals and patients who trust MediScan AI 
              for accurate, fast, and reliable medical scan analysis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Start Free Analysis
              </button>
              <button className="backdrop-blur-sm bg-white/5 border border-cyan-400/30 text-white hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105">
                View Pricing Plans
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
          {[
            { number: '99.8%', label: 'Accuracy' },
            { number: '<2min', label: 'Analysis Time' },
            { number: '50K+', label: 'Scans Processed' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                {stat.number}
              </div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}