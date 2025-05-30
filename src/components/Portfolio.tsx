'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Github, Play, Calendar, Users, BarChart3, Zap, Database, Brain, Code, Smartphone, Globe, Download, Mail, Phone, MapPin, FileText, Activity, Layers, Cpu, Rocket, Shield, Linkedin } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Resume from './Resume';
import ParticleBackground from './ParticleBackground';
import Navigation from './Navigation';
import ProjectList from './ProjectList';
import { fetchRealCryptoSentiment, generateInitialSentimentData, type CryptoSentimentData } from '../lib/cryptoSentiment';

// Update the SentimentData interface to match the new structure
interface SentimentData {
  time: string;
  sentiment: number;
  volume: number;
  confidence: number;
  price?: number;
  priceChange?: number;
}

const MainPortfolio = () => {
  // Add client-only state
  const [isClient, setIsClient] = useState(false);

  // Keep all existing state:
  const [currentSection, setCurrentSection] = useState('home');
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [currentSentiment, setCurrentSentiment] = useState(0.75);

  // Add back the missing ref:
  const heroRef = useRef<HTMLDivElement>(null);

  // Update sentiment data to use the new real data structure - start empty to avoid hydration issues
  const [sentimentData, setSentimentData] = useState<CryptoSentimentData[]>([]);

  // Add back the siteMetrics data:
  const siteMetrics = {
    visitors: '2,847',
    engagement: '4.2m',
    performance: '98/100'
  };

  // Add back the techSkills data:
  const techSkills = [
    { subject: 'React/Next.js', A: 95, fullMark: 100 },
    { subject: 'Python/AI', A: 88, fullMark: 100 },
    { subject: 'Product Strategy', A: 92, fullMark: 100 },
    { subject: 'Process Design', A: 96, fullMark: 100 },
    { subject: 'Data Analysis', A: 85, fullMark: 100 },
    { subject: 'Cloud/AWS', A: 82, fullMark: 100 }
  ];

  // Keep existing mouse effect:
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Add client detection effect
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update the sentiment fetching effect to only run on client
  useEffect(() => {
    if (!isClient) return; // Don't run on server

    // Initialize with historical data on client
    setSentimentData(generateInitialSentimentData());

    const updateSentiment = async () => {
      try {
        setIsLoading(true);
        const newData = await fetchRealCryptoSentiment();
        
        setSentimentData(prev => {
          const updated = [...prev, newData];
          // Keep last 12 data points for the chart
          return updated.length > 12 ? updated.slice(-12) : updated;
        });
        
        setCurrentSentiment(newData.sentiment);
      } catch (error) {
        console.error('Failed to fetch sentiment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    updateSentiment();
    
    // Update every 60 seconds (realistic for demo, not too aggressive)
    const interval = setInterval(updateSentiment, 60000);
    return () => clearInterval(interval);
  }, [isClient]); // Add isClient dependency

  // Keep all existing functions exactly as they were:
  const getSentimentColor = (sentiment: number): string => {
    if (sentiment > 0.6) return 'text-green-400';
    if (sentiment > 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Add back the missing getSentimentLabel function:
  const getSentimentLabel = (sentiment: number): string => {
    if (sentiment > 0.7) return 'Bullish';
    if (sentiment > 0.5) return 'Neutral';
    return 'Bearish';
  };

  const handleSectionTransition = (newSection: string) => {
    if (newSection === currentSection) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSection(newSection);
      setIsAnimating(false);
    }, 150);
  };

  // Keep the projects data exactly as is...
  const projects = [
    {
      id: 'crypto-bot',
      name: 'Crypto Trading Bot',
      status: 'Active Development',
      description: 'AI-powered cryptocurrency trading system with sentiment analysis, technical indicators, and risk management. Built with Python, integrates multiple exchanges, and uses machine learning for market prediction.',
      tech: ['Python', 'TensorFlow', 'Pandas', 'WebSocket', 'REST APIs', 'PostgreSQL', 'Docker', 'AWS'],
      stage: 'mvp',
      progress: 75,
      impact: {
        'roi': '23%',
        'trades': '1,247',
        'accuracy': '68%'
      },
      features: [
        'Real-time market data processing',
        'Machine learning price prediction',
        'Automated risk management',
        'Multi-exchange integration',
        'Sentiment analysis from social media',
        'Technical indicator analysis',
        'Portfolio optimization',
        'Real-time alerting system'
      ],
      experimental: true
    },
    {
      id: 'konnosaur',
      name: 'Konnosaur Social Platform',
      status: 'Backend Complete',
      description: 'Next-generation social media platform with microservices architecture, real-time messaging, and comprehensive strategic documentation using enterprise methodologies.',
      tech: ['Node.js', 'GraphQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'Confluence'],
      stage: 'backend',
      progress: 70,
      impact: { microservices: '8 Services', apis: '40+ Endpoints', documentation: '95% Coverage' },
      features: ['Microservices architecture', 'Real-time messaging', 'Content moderation AI', 'Analytics engine'],
      experimental: false
    },
    {
      id: 'ecco-stream',
      name: 'Ecco Stream Global Search',
      status: 'Conceptual',
      description: 'Global streaming rights search engine addressing JustWatch limitations with country-specific availability and price comparison across 50+ streaming services.',
      tech: ['React', 'Node.js', 'MongoDB', 'Streaming APIs', 'GitLab CI/CD', 'D3.js'],
      stage: 'concept',
      progress: 35,
      impact: { 'market-size': '$2.1B TAM', countries: '15+ Target', differentiation: 'First-to-Market' },
      features: ['Global rights database', 'Country-specific search', 'Price comparison engine', 'Availability alerts'],
      experimental: false
    },
    {
      id: 'process-hub',
      name: 'Enterprise Process Analytics',
      status: 'Trade Studies',
      description: 'Advanced process modeling platform with canonical object creation, inspired by Blue Origin process maturity initiatives and enterprise BPMN 2.0 adoption.',
      tech: ['React', 'D3.js', 'Python', 'Machine Learning', 'Neo4j Graph DB', 'BPMN 2.0'],
      stage: 'research',
      progress: 25,
      impact: { 'enterprise-roi': '$500K+ Potential', processes: '100+ Modeled', efficiency: '40% Target' },
      features: ['BPMN 2.0 modeling', 'Process analytics', 'Canonical object library', 'Enterprise integration'],
      experimental: false
    },
    {
      id: 'portfolio-site',
      name: 'This Portfolio Site',
      status: 'Production',
      description: 'Self-referential demonstration of modern web architecture and technical product management methodology.',
      tech: ['React', 'Next.js', 'Three.js', 'Recharts', 'Tailwind CSS', 'Vercel'],
      stage: 'production',
      progress: 95,
      impact: { performance: '98/100', accessibility: '96/100', innovation: 'High' },
      features: ['Live data integration', 'Responsive design', 'Performance optimization', 'AI personalization'],
      experimental: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Replace the entire particle section with: */}
      <ParticleBackground mousePosition={mousePosition} />

      {/* Navigation */}
      <Navigation 
        currentSection={currentSection} 
        onSectionChange={handleSectionTransition} 
      />

      {/* Content with transition animation */}
      <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {currentSection === 'home' && (
          <>
            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
              <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Hero Content */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-300 text-sm backdrop-blur-sm">
                      <Brain className="w-4 h-4 mr-2 animate-pulse" />
                      <span className="font-medium">AI-Powered Product Management</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                      <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Brian Thomas
                      </span>
                      <br />
                      <span className="text-white">Technical Product Manager</span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                      Transforming complex technical challenges into scalable business solutions through 
                      systematic process improvement, AI integration, and enterprise-grade architecture. 
                      10+ years driving product innovation across aerospace, utilities, and fintech.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                      className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center hover:scale-105 transform shadow-lg hover:shadow-2xl overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                      <span className="relative flex items-center">
                        Explore Projects
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                    <button 
                      onClick={() => handleSectionTransition('resume')}
                      className="group border-2 border-slate-600 hover:border-blue-500 hover:bg-blue-500/10 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center hover:scale-105 transform backdrop-blur-sm"
                    >
                      <FileText className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                      View Resume
                    </button>
                  </div>

                  {/* Live Site Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
                    {Object.entries(siteMetrics).map(([key, value]) => (
                      <div key={key} className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 group overflow-hidden hover-lift">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
                        <div className="relative">
                          <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text group-hover:scale-110 transition-transform">
                            {value}
                          </div>
                          <div className="text-sm text-slate-400 capitalize mt-1">{key}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Live Crypto Sentiment */}
                <div className="space-y-6">
                  {/* Enhanced Crypto Bot Analytics */}
                  <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl hover:border-blue-500/30 transition-all duration-500 hover-lift">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold">
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          Live Crypto Sentiment Analysis
                        </span>
                      </h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`}></div>
                          <span className="text-sm text-slate-300">
                            {isLoading ? 'Updating...' : 'Live Data'}
                          </span>
                        </div>
                        {/* Only render price on client to prevent hydration mismatch */}
                        {isClient && sentimentData.length > 0 && sentimentData[sentimentData.length - 1].price && (
                          <div className="text-sm">
                            <span className="text-slate-400">BTC: </span>
                            <span className="text-white font-mono">
                              ${sentimentData[sentimentData.length - 1].price?.toLocaleString()}
                            </span>
                            <span className={`ml-2 ${sentimentData[sentimentData.length - 1].priceChange && sentimentData[sentimentData.length - 1].priceChange! > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {sentimentData[sentimentData.length - 1].priceChange && sentimentData[sentimentData.length - 1].priceChange! > 0 ? '+' : ''}
                              {sentimentData[sentimentData.length - 1].priceChange?.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getSentimentColor(currentSentiment)}`}>
                          {isClient ? `${(currentSentiment * 100).toFixed(1)}%` : '---'}
                        </div>
                        <div className="text-slate-400">Market Sentiment</div>
                        <div className={`text-sm font-semibold ${getSentimentColor(currentSentiment)}`}>
                          {isClient ? getSentimentLabel(currentSentiment) : '---'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400">
                          {isClient && sentimentData.length > 0 ? `${Math.round(sentimentData[sentimentData.length - 1].volume)}M` : '---'}
                        </div>
                        <div className="text-slate-400">Volume (24h)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-cyan-400">
                          {isClient && sentimentData.length > 0 ? `${(sentimentData[sentimentData.length - 1].confidence * 100).toFixed(0)}%` : '---'}
                        </div>
                        <div className="text-slate-400">Confidence</div>
                      </div>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sentimentData}>
                          <defs>
                            <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" axisLine={false} tickLine={false} className="text-slate-400" />
                          <YAxis domain={[0, 1]} axisLine={false} tickLine={false} className="text-slate-400" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #475569',
                              borderRadius: '8px',
                              color: '#e2e8f0'
                            }}
                            formatter={(value: number, name: string) => [
                              name === 'sentiment' ? `${(value * 100).toFixed(1)}%` : value,
                              name === 'sentiment' ? 'Sentiment' : 'Volume'
                            ]}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="sentiment" 
                            stroke="#3B82F6" 
                            fillOpacity={1} 
                            fill="url(#sentimentGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4 text-xs text-slate-500 text-center">
                      Real-time analysis combining Fear & Greed Index, price movement, news sentiment, and trading volume
                    </div>
                  </div>

                  {/* Tech Stack Visualization */}
                  <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl hover:border-purple-500/30 transition-all duration-500 hover-lift">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                      <Layers className="w-5 h-5 mr-2 text-purple-400" />
                      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Current Tech Stack
                      </span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: 'React', icon: '⚛️', level: 95 },
                        { name: 'Node.js', icon: '🟢', level: 90 },
                        { name: 'Python', icon: '🐍', level: 88 },
                        { name: 'OpenAI', icon: '🤖', level: 85 },
                        { name: 'PostgreSQL', icon: '🐘', level: 87 },
                        { name: 'Docker', icon: '🐳', level: 82 }
                      ].map((tech) => (
                        <div key={tech.name} className="relative bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl p-4 text-center hover:from-slate-700/50 hover:to-slate-800/50 transition-all duration-300 cursor-pointer group border border-slate-700/30 hover:border-purple-500/30 backdrop-blur-sm overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-500"></div>
                          <div className="relative">
                            <div className="text-3xl mb-1 group-hover:scale-125 transition-transform duration-300">{tech.icon}</div>
                            <div className="text-xs text-slate-300 font-semibold mb-2">{tech.name}</div>
                            <div className="w-full bg-slate-600/50 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-full transition-all duration-1000 relative"
                                style={{ width: `${tech.level}%` }}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="relative py-20 overflow-hidden">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      Current Projects
                    </span>
                  </h2>
                  <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                    A showcase of innovative solutions I'm building, from AI-powered trading systems to social platforms that connect people meaningfully.
                  </p>
                </div>

                <ProjectList projects={projects} />
              </div>
            </section>

            {/* Skills Preview */}
            <section className="py-20">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                      Technical Excellence
                    </span>
                  </h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl hover:border-purple-500/30 transition-all duration-500 hover-lift">
                    <h3 className="text-2xl font-bold mb-6 text-center">
                      <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Expertise Radar
                      </span>
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={techSkills}>
                          <PolarGrid stroke="#475569" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                          <PolarRadiusAxis 
                            angle={90}
                            domain={[0, 100]}
                            tick={false}
                            style={{ 
                              stroke: '#475569', 
                              strokeWidth: 2 
                            }}
                          />
                          <Radar 
                            name="Proficiency" 
                            dataKey="A" 
                            stroke="#3B82F6" 
                            fill="url(#radialGradient)" 
                            fillOpacity={0.6} 
                          />
                          <defs>
                            <linearGradient id="radialGradient" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" />
                              <stop offset="95%" stopColor="#9333EA" />
                            </linearGradient>
                          </defs>
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl hover:border-green-500/30 transition-all duration-500 hover-lift">
                    <h3 className="text-2xl font-bold mb-6 text-center">
                      <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                        Process & Strategy
                      </span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center group/item">
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mr-4 group-hover/item:scale-110 transition-all duration-300 border border-blue-500/30">
                          <Zap className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white group-hover/item:text-blue-400 transition-colors">Agile Product Management</h4>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            Leading cross-functional teams to deliver high-impact products using Agile methodologies.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center group/item">
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mr-4 group-hover/item:scale-110 transition-all duration-300 border border-blue-500/30">
                          <Database className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white group-hover/item:text-blue-400 transition-colors">Data-Driven Decision Making</h4>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            Leveraging analytics and user feedback to drive product iterations and enhancements.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center group/item">
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mr-4 group-hover/item:scale-110 transition-all duration-300 border border-blue-500/30">
                          <Shield className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white group-hover/item:text-blue-400 transition-colors">Risk Management</h4>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            Identifying and mitigating potential risks to ensure project success and sustainability.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center group/item">
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mr-4 group-hover/item:scale-110 transition-all duration-300 border border-blue-500/30">
                          <Rocket className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white group-hover/item:text-blue-400 transition-colors">Innovation & Ideation</h4>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            Fostering a culture of innovation to generate and implement creative solutions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {currentSection === 'resume' && (
          <Resume />
        )}

        {/* Footer */}
        <footer className="bg-gradient-to-b from-slate-900/80 to-slate-950 border-t border-slate-700/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <h5 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">Brian Thomas</h5>
                <p className="text-sm text-slate-400 max-w-md">
                  Technical Product Manager | AI Enthusiast | Process Innovator
                </p>
              </div>
              <div className="flex flex-wrap gap-6 justify-center md:justify-end">
                <a href="https://github.com/brianthomas" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 transform">
                  <Github className="w-6 h-6" />
                </a>
                <a href="https://www.linkedin.com/in/brianthomas/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 transform">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="mailto:brianjamesthomas@outlook.com" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 transform">
                  <Mail className="w-6 h-6" />
                </a>
                <a href="tel:+17075368398" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 transform">
                  <Phone className="w-6 h-6" />
                </a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-500">
                © 2024 Brian Thomas. Crafted with React, Next.js, and a passion for exceptional product experiences.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainPortfolio;