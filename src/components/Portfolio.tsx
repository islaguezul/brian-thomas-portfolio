'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Mail, Phone, FileText, Layers, Zap, Database, Rocket, Shield, Users } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Resume from './Resume';
import ParticleBackground from './ParticleBackground';
import Navigation from './Navigation';
import ProjectList from './ProjectList';
import { fetchRealCryptoSentiment, generateBacktestData } from '../lib/cryptoSentiment';
import { createTradingSimulator, type TradingState } from '../lib/tradingSimulation';
import TradingBotDocumentation from './TradingBotDocumentation';
import TradingBotDemo from './TradingBotDemo';
import type { Project as DBProject } from '@/lib/database/types';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

const MainPortfolio = () => {
  const [isClient, setIsClient] = useState(false);
  const [dbProjects, setDbProjects] = useState<DBProject[]>([]);
  const [personalInfo, setPersonalInfo] = useState<{ bio?: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_workExperience, setWorkExperience] = useState<{ company: string; role: string; startDate: string; endDate?: string; description?: string }[]>([]);

  useRealtimeUpdates((message) => {
    if (message.type === 'content-update') {
      if (message.data?.contentType === 'Projects') {
        fetchProjects();
      } else if (message.data?.contentType === 'Personal Info') {
        fetchPersonalInfo();
      }
    }
  });

  const [currentSection, setCurrentSection] = useState('home');
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentSentiment, setCurrentSentiment] = useState(0.75);
  const [tradingState, setTradingState] = useState<TradingState | null>(null);
  const [riskAppetite, setRiskAppetite] = useState(0.5);
  const [chartData, setChartData] = useState<Array<{
    time: string;
    sentiment: number;
    pnl: number;
    price: number;
  }>>([]);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [expertiseRadar, setExpertiseRadar] = useState<Array<{
    subject: string;
    A: number;
    fullMark: number;
  }>>([]);

  const heroRef = useRef<HTMLDivElement>(null);
  const lastTradeCheck = useRef<Date>(new Date());
  
  const [tradingSimulator] = useState(() => createTradingSimulator());

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const fetchedProjects = await response.json();
        setDbProjects(fetchedProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchPersonalInfo = async () => {
    try {
      const response = await fetch(`/api/personal?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const info = await response.json();
        setPersonalInfo(info);
      }
    } catch (error) {
      console.error('Error fetching personal info:', error);
    }
  };

  const fetchWorkExperience = async () => {
    try {
      const response = await fetch('/api/resume/experience');
      if (response.ok) {
        const experience = await response.json();
        setWorkExperience(experience);
      }
    } catch (error) {
      console.error('Error fetching work experience:', error);
    }
  };

  const fetchExpertiseRadar = async () => {
    try {
      const response = await fetch('/api/expertise-radar');
      if (response.ok) {
        const radarData = await response.json();
        const formattedData = radarData.map((item: { skill_name: string; skill_level: number }) => ({
          subject: item.skill_name,
          A: item.skill_level * 10, // Convert 0-10 scale to 0-100 scale
          fullMark: 100
        }));
        setExpertiseRadar(formattedData);
      }
    } catch (error) {
      console.error('Error fetching expertise radar:', error);
      // Fallback to default data
      setExpertiseRadar([
        { subject: 'React/Next.js', A: 95, fullMark: 100 },
        { subject: 'Python/AI', A: 88, fullMark: 100 },
        { subject: 'Product Strategy', A: 92, fullMark: 100 },
        { subject: 'Process Design', A: 96, fullMark: 100 },
        { subject: 'Data Analysis', A: 85, fullMark: 100 },
        { subject: 'Cloud/AWS', A: 82, fullMark: 100 }
      ]);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchPersonalInfo();
    fetchWorkExperience();
    fetchExpertiseRadar();
  }, []);

  // Initialize trading simulation with backtest data
  useEffect(() => {
    console.log('🚀 Portfolio component mounting...');
    setIsClient(true);
    
    tradingSimulator.reset();
    setRiskAppetite(0.5);
    console.log('💰 Trading simulator reset to $10,000');
    
    const historicalData = generateBacktestData();
    console.log('📊 Generated historical data:', historicalData.length, 'points');
    tradingSimulator.setRiskAppetite(0.5);
    const backtestResults = tradingSimulator.backtest(historicalData);
    console.log('🎯 Backtest results:', {
      trades: backtestResults.trades.length,
      pnl: backtestResults.pnl,
      pnlPercent: backtestResults.pnlPercent,
      balance: backtestResults.balance,
      btcHoldings: backtestResults.btcHoldings
    });
    setTradingState(backtestResults);
    
    const chartPoints = [];
    const dataSlice = historicalData.slice(-48);
    
    let runningCash = 10000;
    let runningBtc = 0;
    let tradeIndex = 0;
    const sortedTrades = [...backtestResults.trades].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    for (let i = 0; i < dataSlice.length; i++) {
      const point = dataSlice[i];
      
      while (tradeIndex < sortedTrades.length && 
             sortedTrades[tradeIndex].timestamp <= point.timestamp) {
        const trade = sortedTrades[tradeIndex];
        runningCash = trade.balance;
        if (trade.action === 'BUY') {
          runningBtc += trade.amount;
        } else {
          runningBtc = 0;
        }
        tradeIndex++;
      }
      
      const totalValue = runningCash + (runningBtc * point.price);
      const pnl = totalValue - 10000;
      
      chartPoints.push({
        time: point.time,
        sentiment: point.sentiment,
        pnl: pnl,
        price: point.price,
        btcHoldings: runningBtc,
        cashBalance: runningCash
      });
    }
    
    const finalChartData = chartPoints.slice(-12);
    
    const maxReasonablePnL = 500;
    const validatedChartData = finalChartData.map((point, index) => {
      if (Math.abs(point.pnl) > maxReasonablePnL) {
        const prevPoint = index > 0 ? finalChartData[index - 1] : null;
        const smoothedPnL = prevPoint ? prevPoint.pnl * 0.9 + point.pnl * 0.1 : point.pnl * 0.1;
        return { ...point, pnl: smoothedPnL };
      }
      return point;
    });
    
    console.log('📈 Chart data prepared:', validatedChartData.length, 'points');
    setChartData(validatedChartData);
  }, [tradingSimulator]);

  // Handle real-time sentiment updates and trading evaluation
  useEffect(() => {
    if (!isClient) {
      console.log('⏳ Waiting for client-side mounting...');
      return;
    }

    console.log('🌐 Client-side effect starting...');

    const updateSentiment = async () => {
      try {
        console.log('🔄 Fetching new sentiment data...');
        const newData = await fetchRealCryptoSentiment();
        console.log('📊 New data received:', { sentiment: newData.sentiment, price: newData.price, time: newData.time });
        setCurrentSentiment(newData.sentiment);
        
        const now = new Date();
        const timeSinceLastCheck = now.getTime() - lastTradeCheck.current.getTime();
        
        if (timeSinceLastCheck >= 2 * 60 * 1000) {
          console.log('🔄 2 minutes passed, evaluating trade...');
          const newTradingState = tradingSimulator.evaluateTrade(newData.sentiment, newData.price);
          console.log('Trade result:', newTradingState.currentAction, 'Trades:', newTradingState.trades.length);
          setTradingState(newTradingState);
          lastTradeCheck.current = now;
          
          setChartData(prev => {
            const portfolioValue = newTradingState.balance + (newTradingState.btcHoldings * newData.price);
            const actualPnL = portfolioValue - 10000;
            
            const newPoint = {
              time: newData.time,
              sentiment: newData.sentiment,
              pnl: actualPnL,
              price: newData.price,
              cashBalance: newTradingState.balance,
              btcHoldings: newTradingState.btcHoldings
            };
            
            const lastPoint = prev[prev.length - 1];
            if (!lastPoint || lastPoint.time !== newPoint.time) {
              if (lastPoint && Math.abs(newPoint.pnl - lastPoint.pnl) > 1000) {
                newPoint.pnl = lastPoint.pnl + (newPoint.pnl - lastPoint.pnl) * 0.1;
              }
              
              const updated = [...prev, newPoint];
              
              if (updated.length > 12) {
                return updated.slice(-12);
              }
              return updated;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Failed to fetch sentiment:', error);
      }
    };

    console.log('🔄 Waiting 2 seconds before starting sentiment updates...');
    const initialTimeout = setTimeout(() => {
      console.log('🔄 Starting initial sentiment update...');
      updateSentiment();
    }, 2000);
    
    const interval = setInterval(updateSentiment, 60000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isClient, riskAppetite, tradingSimulator]);

  const handleRiskAppetiteChange = (newRisk: number) => {
    setRiskAppetite(newRisk);
  };

  const handleChartDataUpdate = (data: Array<{
    time: string;
    sentiment: number;
    pnl: number;
    price: number;
  }>) => {
    setChartData(data);
  };

  const handleTradingStateUpdate = (state: TradingState) => {
    setTradingState(state);
  };

  const handleShowDocumentation = () => {
    setShowDocumentation(true);
  };

  const handleSectionTransition = (newSection: string) => {
    if (newSection === currentSection) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSection(newSection);
      setIsAnimating(false);
    }, 150);
  };

  // Project data structure
  const projects: Array<{
    id: string;
    name: string;
    status: string;
    description: string;
    tech: string[];
    stage: string;
    progress: number;
    impact: Record<string, string>;
    features: string[];
    experimental: boolean;
    legacy?: boolean;
    screenshots?: Array<{ filePath: string; altText?: string; displayOrder?: number }>;
    detailedDescription?: string;
    challenges?: string[];
    outcomes?: string[];
    links?: {
      live?: string | null;
      github?: string | null;
      demo?: string | null;
    };
  }> = [
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
      experimental: false,
      screenshots: [
        { filePath: '/api/placeholder/800/600', altText: 'Portfolio homepage showing hero section' },
        { filePath: '/api/placeholder/800/600', altText: 'Live trading bot demo visualization' }
      ]
    },
    {
      id: 'knowledge-management',
      name: 'Enterprise Process Knowledge System',
      status: 'Legacy Project',
      description: 'SharePoint-based knowledge management platform with custom process modeling that connected employees to role-specific training and job aids within two clicks, while visualizing organizational workflows.',
      tech: ['SharePoint', 'HTML/CSS', 'JavaScript', 'SQL Server', 'Custom SVG Graphics', 'D3.js'],
      stage: 'legacy',
      progress: 100,
      impact: { 
        'adoption': '2,500+ Users',
        'efficiency': '40% Task Time Reduction',
        'training': '85% Self-Service Rate'
      },
      features: [
        'Custom-built SVG process modeling visualization',
        'Role-based content delivery',
        'Two-click navigation to any resource',
        'Upstream/downstream dependency mapping',
        'Integrated training modules',
        'Real-time process documentation',
        'Automated workflow triggers',
        'Performance analytics dashboard'
      ],
      experimental: false,
      legacy: true
    }
  ];

  const transformedDbProjects = dbProjects
    .filter(project => project.screenshots && project.screenshots.length > 0)
    .map(project => ({
      id: project.id?.toString() || 'unknown',
      name: project.name,
      status: project.status || 'Unknown',
      description: project.description || '',
      tech: project.technologies || [],
      stage: project.stage,
      progress: project.progress || 0,
      impact: project.impacts?.reduce((acc, impact) => {
        if (impact.metricKey && impact.metricValue && 
            impact.metricValue !== 'undefined' && impact.metricValue !== 'null') {
          acc[impact.metricKey] = impact.metricValue;
        }
        return acc;
      }, {} as Record<string, string>) || {},
      features: project.features?.map(f => f.feature) || [],
      experimental: project.experimental || false,
      legacy: project.legacy || false,
      screenshots: project.screenshots,
      detailedDescription: project.detailedDescription,
      challenges: project.challenges?.map(c => c.challenge) || [],
      outcomes: project.outcomes?.map(o => o.outcome) || [],
      links: {
        live: project.liveUrl,
        github: project.githubUrl,
        demo: project.demoUrl
      }
    }));

  const mergedProjects = [...projects];
  transformedDbProjects.forEach(dbProject => {
    const existingIndex = mergedProjects.findIndex(p => p.name === dbProject.name);
    if (existingIndex >= 0) {
      mergedProjects[existingIndex] = dbProject;
    } else {
      mergedProjects.push(dbProject);
    }
  });

  const finalProjects = mergedProjects;

  // const deployDate = new Date('2024-12-01');
  // const currentDate = new Date();
  // const daysLive = Math.floor((currentDate.getTime() - deployDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // const startYear = 2011;
  // const currentYear = new Date().getFullYear();
  // const yearsExperience = currentYear - startYear;
  
  // const uniqueTechs = new Set<string>();
  // finalProjects.forEach(project => {
  //   project.tech.forEach(tech => uniqueTechs.add(tech));
  // });
  // const techStackSize = uniqueTechs.size;
  
  // Calculate actual companies from work experience
  // const uniqueCompanies = new Set(workExperience.map(exp => exp.company));
  // const companiesCount = uniqueCompanies.size || 10; // Fallback if data not loaded
  
  const siteMetrics = {
    performance: 98,
    accessibility: 96,
    seo: 94,
    uptime: 99.9
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <ParticleBackground mousePosition={currentSection === 'resume' ? undefined : mousePosition} />

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
              <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  {/* Left Column - Hero Content */}
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-300 text-sm backdrop-blur-sm">
                        <Rocket className="w-4 h-4 mr-2 animate-pulse" />
                        <span className="font-medium">Let&apos;s build something great together</span>
                      </div>
                      <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                          Brian Thomas
                        </span>
                        <br />
                        <span className="text-white">Technical Product Manager</span>
                      </h1>
                      <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                        {personalInfo?.bio || 
                          `Transforming complex technical challenges into scalable business solutions through 
                          systematic process improvement, AI integration, and enterprise-grade architecture. 
                          10+ years driving product innovation across aerospace, utilities, and tech.`
                        }
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
                        View Résumé
                      </button>
                    </div>

                    {/* Live Site Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
                      {Object.entries(siteMetrics).map(([key, value]) => (
                        <div key={key} className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 group">
                          <div className="text-2xl font-bold text-green-400 group-hover:scale-110 transition-transform">
                            {value}{key === 'uptime' ? '%' : '/100'}
                          </div>
                          <div className="text-sm text-slate-400 capitalize">{key === 'seo' ? 'SEO' : key}</div>
                        </div>
                      ))}
                    </div>

                    {/* Current Tech Stack */}
                    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl hover:border-purple-500/30 transition-all duration-500 hover-lift">
                      <h3 className="text-lg font-bold mb-4 flex items-center">
                        <Layers className="w-5 h-5 mr-2 text-purple-400" />
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          Current Tech Stack
                        </span>
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { name: 'React', icon: '⚛️' },
                          { name: 'Node.js', icon: '🟢' },
                          { name: 'Python', icon: '🐍' },
                          { name: 'OpenAI', icon: '🤖' },
                          { name: 'PostgreSQL', icon: '🐘' },
                          { name: 'Docker', icon: '🐳' }
                        ].map((tech) => (
                          <div key={tech.name} className="relative bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl p-4 text-center hover:from-slate-700/50 hover:to-slate-800/50 transition-all duration-300 cursor-pointer group border border-slate-700/30 hover:border-purple-500/30 backdrop-blur-sm overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-500"></div>
                            <div className="relative">
                              <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">{tech.icon}</div>
                              <div className="text-sm text-slate-300 font-semibold">{tech.name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Live AI Trading Demo */}
                  <div className="lg:pt-[4.5rem]">
                    <TradingBotDemo
                      currentSentiment={currentSentiment}
                      tradingState={tradingState}
                      riskAppetite={riskAppetite}
                      chartData={chartData}
                      isClient={isClient}
                      onShowDocumentation={handleShowDocumentation}
                      onRiskAppetiteChange={handleRiskAppetiteChange}
                      onChartDataUpdate={handleChartDataUpdate}
                      onTradingStateUpdate={handleTradingStateUpdate}
                      tradingSimulator={tradingSimulator}
                    />
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
                    A showcase of innovative solutions I&apos;m building, from AI-powered trading systems to social platforms that connect people meaningfully.
                  </p>
                </div>

                <ProjectList projects={finalProjects.filter(p => !p.legacy)} />
                
                {/* Legacy Projects Section */}
                <div className="mt-20">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                      <span className="bg-gradient-to-r from-slate-400 to-slate-600 bg-clip-text text-transparent">
                        Historical Projects
                      </span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                      Enterprise-scale solutions from previous roles that demonstrate deep technical expertise and business impact.
                    </p>
                  </div>
                  
                  <ProjectList projects={finalProjects.filter(p => p.legacy)} />
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

                <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                  <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl hover:border-purple-500/30 transition-all duration-500 hover-lift min-h-[600px] flex flex-col">
                    <h3 className="text-2xl font-bold mb-6 text-center">
                      <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Expertise Radar
                      </span>
                    </h3>
                    <div className="flex-1 min-h-[500px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={expertiseRadar} margin={{ top: 60, right: 90, bottom: 60, left: 90 }}>
                          <PolarGrid stroke="#475569" />
                          <PolarAngleAxis 
                            dataKey="subject"
                            axisLineType="polygon"
                            tick={(props) => {
                              const { x, y, payload, cx, cy } = props;
                              const value = payload.value;
                              
                              // Calculate distance from center to push labels further out
                              const dx = x - cx;
                              const dy = y - cy;
                              const distance = Math.sqrt(dx * dx + dy * dy);
                              const pushOutFactor = 1.35; // Push labels 35% further from center
                              const newX = cx + (dx / distance) * (distance * pushOutFactor);
                              const newY = cy + (dy / distance) * (distance * pushOutFactor);
                              
                              // Smart line breaking for long labels
                              let lines = [value];
                              if (value.length > 15) {
                                const words = value.split(' ');
                                if (words.length >= 2) {
                                  const breakPoint = Math.ceil(words.length / 2);
                                  const firstLine = words.slice(0, breakPoint).join(' ');
                                  const secondLine = words.slice(breakPoint).join(' ');
                                  lines = [firstLine, secondLine];
                                }
                              }
                              
                              return (
                                <g>
                                  {lines.map((line, index) => (
                                    <text
                                      key={index}
                                      x={newX}
                                      y={newY + (index * 14) - ((lines.length - 1) * 7)}
                                      fill="#94a3b8"
                                      fontSize="12"
                                      textAnchor="middle"
                                      dominantBaseline="central"
                                    >
                                      {line}
                                    </text>
                                  ))}
                                </g>
                              );
                            }}
                          />
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

                  <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl hover:border-green-500/30 transition-all duration-500 hover-lift min-h-[600px] flex flex-col">
                    <h3 className="text-2xl font-bold mb-6 text-center">
                      <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                        Process & Strategy
                      </span>
                    </h3>
                    <div className="space-y-4 flex-1">
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

                      <div className="flex items-center group/item">
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mr-4 group-hover/item:scale-110 transition-all duration-300 border border-blue-500/30">
                          <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white group-hover/item:text-blue-400 transition-colors">Stakeholder Communication</h4>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            Translating technical concepts into business value for diverse stakeholder groups.
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
          <Resume key="resume-section" />
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
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/brianthomas/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 transform">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
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
              <div className="mt-2">
                <a 
                  href="/admin" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-2 h-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors duration-300"
                  aria-label="Admin"
                />
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Trading Bot Documentation Modal */}
      <TradingBotDocumentation 
        isOpen={showDocumentation}
        onClose={() => setShowDocumentation(false)}
      />
    </div>
  );
};

export default MainPortfolio;