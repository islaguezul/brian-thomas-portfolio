'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Github, Play, Calendar, Users, BarChart3, Zap, Database, Brain, Code, Smartphone, Globe, Download, Mail, Phone, MapPin, FileText, Activity, Layers, Cpu, Rocket, Shield } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Resume from './Resume';


interface Project {
  id: string;
  name: string;
  status: string;
  description: string;
  tech: string[];
  stage: string;
  progress: number;
  impact: Record<string, string | undefined>; // Allow undefined values
  features: string[];
  experimental: boolean;
}

interface SentimentData {
  time: string;
  sentiment: number;
  volume: number;
  confidence: number;
}

const MainPortfolio = () => {
  // Core state management
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Hero section state
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [currentSentiment, setCurrentSentiment] = useState(0.5);
  const [isLoading, setIsLoading] = useState(true);
  const [siteMetrics] = useState({
    performance: 98,
    accessibility: 96,
    SEO: 94,
    uptime: 99.9
  });

  const heroRef = useRef(null);

  // Project data structure
  const projects = [
    {
      id: 'crypto-bot',
      name: 'AI Crypto Trading Bot',
      status: 'MVP Ready',
      description: 'OpenAI GPT-4.1 powered sentiment analysis engine for automated cryptocurrency trading with contrarian model achieving 10% returns in backtesting.',
      tech: ['OpenAI GPT-4.1', 'Python', 'React', 'PostgreSQL', 'WebSocket', 'Coinbase API', 'Binance API'],
      stage: 'mvp',
      progress: 85,
      impact: { backtesting: '10% ROI', models: '3 A/B Tests', exchanges: '2 Integrated' },
      features: ['RSS sentiment analysis', 'Contrarian trading model', 'Risk management algorithms', 'Multi-exchange support'],
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

  const techSkills = [
    { skill: 'Product Strategy', value: 95 },
    { skill: 'Full-Stack Architecture', value: 88 },
    { skill: 'AI/ML Integration', value: 82 },
    { skill: 'API Design', value: 90 },
    { skill: 'Database Design', value: 85 },
    { skill: 'DevOps/CI-CD', value: 78 },
    { skill: 'User Experience', value: 92 },
    { skill: 'Team Leadership', value: 94 }
  ];

  // Simulate live crypto sentiment data
  useEffect(() => {
    const generateSentimentData = () => {
      const now = new Date();
      const data = [];
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sentiment: 0.3 + Math.random() * 0.4,
          volume: Math.floor(Math.random() * 1000) + 500,
          confidence: 0.7 + Math.random() * 0.3
        });
      }
      return data;
    };

    setSentimentData(generateSentimentData());
    setIsLoading(false);

    const interval = setInterval(() => {
      setSentimentData(prev => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sentiment: 0.3 + Math.random() * 0.4,
          volume: Math.floor(Math.random() * 1000) + 500,
          confidence: 0.7 + Math.random() * 0.3
        });
        return newData;
      });
      setCurrentSentiment(0.3 + Math.random() * 0.4);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'production': return 'bg-green-500';
      case 'mvp': return 'bg-blue-500';
      case 'backend': return 'bg-purple-500';
      case 'concept': return 'bg-yellow-500';
      case 'research': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getProjectIcon = (projectId: string): React.JSX.Element => {
    switch (projectId) {
      case 'crypto-bot': return <Activity className="w-8 h-8 text-blue-400" />;
      case 'konnosaur': return <Users className="w-8 h-8 text-purple-400" />;
      case 'ecco-stream': return <Globe className="w-8 h-8 text-green-400" />;
      case 'process-hub': return <Database className="w-8 h-8 text-orange-400" />;
      case 'portfolio-site': return <Layers className="w-8 h-8 text-cyan-400" />;
      default: return <Cpu className="w-8 h-8 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment: number): string => {
    if (sentiment > 0.6) return 'text-green-400';
    if (sentiment > 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentLabel = (sentiment: number): string => {
    if (sentiment > 0.6) return 'Bullish';
    if (sentiment > 0.4) return 'Neutral';
    return 'Bearish';
  };

  const handleSectionTransition = (newSection: string, project: Project | null = null): void => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSection(newSection);
      if (project) setSelectedProject(project);
      setIsAnimating(false);
    }, 150);
  };

  const handleProjectSelect = (project: Project): void => {
    setSelectedProject(project);
    handleSectionTransition('project-detail');
  };

  // Generate stable particle data only on client
  const particleData = useMemo(() => {
    if (!isClient) return [];
    
    return Array.from({ length: 3000 }, (_, i) => ({ // Doubled from 1500 to 3000
      id: i,
      left: (Math.random() * 800) - 300, // -300% to 500% (huge coverage area)
      top: (Math.random() * 800) - 300,  // -300% to 500% (huge coverage area)
      animationDelay: Math.random() * 3,
      animationDuration: 2 + Math.random() * 3,
      transformX: (Math.random() - 0.5) * 20,
      transformY: (Math.random() - 0.5) * 20
    }));
  }, [isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Animated background particles */}
      {isClient && (
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            transform: `translate(${(mousePosition.x - window.innerWidth / 2) * 5}px, ${(mousePosition.y - window.innerHeight / 2) * 5}px)`
          }}
        >
          {particleData.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-pulse"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.animationDelay}s`,
                animationDuration: `${particle.animationDuration}s`,
                transform: `translate(${particle.transformX}px, ${particle.transformY}px)`
              }}
            />
          ))}
        </div>
      )}

      {/* Navigation */}
      <nav className="relative z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => handleSectionTransition('home')}
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              Brian Thomas
            </button>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => handleSectionTransition('home')} 
                className={`hover:text-blue-400 transition-colors ${currentSection === 'home' ? 'text-blue-400' : ''}`}
              >
                Home
              </button>
              <button 
                onClick={() => handleSectionTransition('resume')} 
                className={`hover:text-blue-400 transition-colors ${currentSection === 'resume' ? 'text-blue-400' : ''}`}
              >
                Resume
              </button>
              <a href="mailto:brianjamesthomas@outlook.com" className="hover:text-blue-400 transition-colors">Contact</a>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">Live</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content with transition animation */}
      <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {currentSection === 'home' && (
          <>
            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
              <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Hero Content */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm animate-pulse">
                      <Brain className="w-4 h-4 mr-2" />
                      AI-Powered Product Management
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
                      className="group bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center hover:scale-105 transform"
                    >
                      Explore Projects
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => handleSectionTransition('resume')}
                      className="border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center hover:scale-105 transform"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Resume
                    </button>
                  </div>

                  {/* Live Site Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
                    {Object.entries(siteMetrics).map(([key, value]) => (
                      <div key={key} className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 group">
                        <div className="text-2xl font-bold text-green-400 group-hover:scale-110 transition-transform">
                          {value}{key === 'uptime' ? '%' : '/100'}
                        </div>
                        <div className="text-sm text-slate-400 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Live Crypto Sentiment */}
                <div className="space-y-6">
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-400" />
                        Live Crypto Sentiment Analysis
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400">Experimental</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center bg-slate-700/30 rounded-lg p-4">
                        <div className={`text-3xl font-bold ${getSentimentColor(currentSentiment)} animate-pulse`}>
                          {(currentSentiment * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-slate-400 mb-1">Current Sentiment</div>
                        <div className={`text-sm font-semibold ${getSentimentColor(currentSentiment)}`}>
                          {getSentimentLabel(currentSentiment)}
                        </div>
                      </div>
                      <div className="text-center bg-slate-700/30 rounded-lg p-4">
                        <div className="text-3xl font-bold text-blue-400">GPT-4.1</div>
                        <div className="text-sm text-slate-400 mb-1">AI Model</div>
                        <div className="text-sm font-semibold text-blue-400">OpenAI</div>
                      </div>
                    </div>

                    {!isLoading && sentimentData.length > 0 && (
                      <div className="h-32 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sentimentData}>
                            <defs>
                              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                            <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: '#64748b' }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1e293b', 
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                color: '#e2e8f0'
                              }}
                              formatter={(value: number | string, name: string) => [
                                `${(Number(value) * 100).toFixed(1)}%`,
                                name === 'sentiment' ? 'Market Sentiment' : name
                              ]}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="sentiment" 
                              stroke="#3b82f6" 
                              fill="url(#sentimentGradient)" 
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="text-xs text-slate-400 bg-slate-700/20 rounded-lg p-3">
                      <strong>Live Demo:</strong> RSS feed analysis using OpenAI GPT-4.1 for the same market sentiment detection as with AI Crypto Trading Bot. 
                      Currently in fine-tuning phase - achieved 10% returns with contrarian model in backtesting.
                    </div>
                  </div>

                  {/* Tech Stack Visualization */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-purple-500/30 transition-all duration-300">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                      <Layers className="w-5 h-5 mr-2 text-purple-400" />
                      Current Tech Stack
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
                        <div key={tech.name} className="bg-slate-700/50 rounded-lg p-3 text-center hover:bg-slate-700/70 transition-all cursor-pointer group">
                          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{tech.icon}</div>
                          <div className="text-xs text-slate-300 font-semibold mb-1">{tech.name}</div>
                          <div className="w-full bg-slate-600 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-blue-400 to-purple-400 h-1 rounded-full transition-all duration-1000"
                              style={{ width: `${tech.level}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="py-20 bg-slate-900/50">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      Product Portfolio
                    </span>
                  </h2>
                  <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                    Comprehensive showcase of technical product management across diverse domains, 
                    from AI-powered fintech to social platforms and analytics tools.
                  </p>
                </div>

                <div className="grid gap-8">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="group bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-500 overflow-hidden transform hover:scale-[1.01] cursor-pointer"
                      onClick={() => handleProjectSelect(project)}
                    >
                      <div className="p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0 p-3 bg-slate-700/30 rounded-xl">
                              {getProjectIcon(project.id)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center mb-2 flex-wrap gap-3">
                                <h3 className="text-2xl font-bold group-hover:text-blue-400 transition-colors">
                                  {project.name}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStageColor(project.stage)}`}>
                                  {project.status}
                                </span>
                                {project.experimental && (
                                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">
                                    Experimental
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-slate-300 text-lg mb-4 leading-relaxed">
                                {project.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex-shrink-0 ml-6">
                            <div className="relative w-20 h-20">
                              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="32"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  className="text-slate-700"
                                />
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="32"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 32}`}
                                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - project.progress / 100)}`}
                                  className="text-blue-400 transition-all duration-1000"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-bold text-blue-400">{project.progress}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                          {Object.entries(project.impact).map(([key, value]) => (
                            <div key={key} className="text-center bg-slate-700/20 rounded-lg p-4 hover:bg-slate-700/30 transition-colors">
                              <div className="text-xl font-bold text-blue-400">{value}</div>
                              <div className="text-xs text-slate-400 capitalize">{key.replace('-', ' ')}</div>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {project.tech.slice(0, 6).map((tech) => (
                            <span key={tech} className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm hover:bg-slate-600/50 transition-colors">
                              {tech}
                            </span>
                          ))}
                          {project.tech.length > 6 && (
                            <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm">
                              +{project.tech.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
                    <h3 className="text-2xl font-bold mb-6 text-center text-blue-400">Expertise Radar</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={techSkills}>
                          <PolarGrid stroke="#475569" />
                          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 100]} 
                            tick={{ fontSize: 10, fill: '#64748b' }}
                          />
                          <Radar
                            dataKey="value"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold mb-4 flex items-center text-green-400">
                        <Rocket className="w-5 h-5 mr-2" />
                        Product Development Methodology
                      </h3>
                      <div className="space-y-3">
                        {[
                          'User-centered design with systematic validation',
                          'Iterative development with clear MVP definition',
                          'Data-driven decision making with KPI tracking',
                          'Risk-first architecture with scalability planning',
                          'AI-first product strategy with ethical considerations'
                        ].map((item, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                            <span className="text-slate-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold mb-4 flex items-center text-blue-400">
                        <Shield className="w-5 h-5 mr-2" />
                        Technical Leadership Approach
                      </h3>
                      <div className="space-y-3">
                        {[
                          'Cross-functional team coordination and communication',
                          'Technical debt management with business impact analysis',
                          'Security-first development with compliance considerations',
                          'Performance optimization with measurable outcomes',
                          'Knowledge sharing and documentation standards'
                        ].map((item, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            </div>
                            <span className="text-slate-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-slate-900/50">
              <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Let&apos;s Build Something Amazing
                  </span>
                </h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                  Ready to bring technical innovation and systematic product management to your team? 
                  Let&apos;s discuss how AI integration and process excellence can drive your business forward.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <a 
                    href="mailto:brianjamesthomas@outlook.com?subject=Technical Product Manager Discussion" 
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center hover:scale-105 transform"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Schedule Interview
                  </a>
                  <button 
                    onClick={() => handleSectionTransition('resume')}
                    className="border border-slate-600 hover:border-slate-500 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center hover:scale-105 transform"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    View Resume
                  </button>
                </div>

                <div className="text-slate-400 text-sm">
                  This portfolio demonstrates live technical integration, systematic product development, 
                  and the kind of innovative thinking I bring to technical product management roles.
                </div>
              </div>
            </section>
          </>
        )}

        {currentSection === 'resume' && <Resume />}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="text-slate-400">
              © 2025 Brian Thomas Portfolio. Built with Next.js, React, and AI integration.
            </div>
            <div className="flex items-center space-x-4 text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">System Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPortfolio;