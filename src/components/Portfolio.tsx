'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Mail, Phone, FileText, Layers, Zap, Database, Rocket, Shield, TrendingUp, TrendingDown, Activity, AlertCircle, BookOpen } from 'lucide-react';
import { ResponsiveContainer, Area, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Line, Legend, ReferenceLine } from 'recharts';
import Resume from './Resume';
import ParticleBackground from './ParticleBackground';
import Navigation from './Navigation';
import ProjectList from './ProjectList';
import { fetchRealCryptoSentiment, generateInitialSentimentData, generateBacktestData, type CryptoSentimentData } from '../lib/cryptoSentiment';
import { tradingSimulator, type TradingState } from '../lib/tradingSimulation';
import TradingBotDocumentation from './TradingBotDocumentation';

const MainPortfolio = () => {
  // Add client-only state
  const [isClient, setIsClient] = useState(false);

  // Keep all existing state:
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

  // Add back the missing ref:
  const heroRef = useRef<HTMLDivElement>(null);
  const lastTradeCheck = useRef<Date>(new Date());

  // Update sentiment data to use the new real data structure - start empty to avoid hydration issues
  const [sentimentData, setSentimentData] = useState<CryptoSentimentData[]>([]);

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

  // Add client detection effect and run initial backtest
  useEffect(() => {
    setIsClient(true);
    
    // Always reset to fresh $10,000 starting balance on page load
    tradingSimulator.reset();
    
    // Reset risk appetite to default on page load
    setRiskAppetite(0.5);
    
    // Run backtest on mount with historical data
    const historicalData = generateBacktestData();
    tradingSimulator.setRiskAppetite(0.5); // Use default risk on page load
    const backtestResults = tradingSimulator.backtest(historicalData);
    console.log('Backtest results:', {
      trades: backtestResults.trades.length,
      pnl: backtestResults.pnl,
      metrics: backtestResults.metrics
    });
    setTradingState(backtestResults);
    
    // Prepare chart data from backtest with accurate P&L
    // We need to show more data points to see the P&L progression
    const chartPoints = historicalData.slice(-36).map((point) => {
      // Calculate actual portfolio value at this point in time
      const tradesUpToPoint = backtestResults.trades.filter(t => 
        t.timestamp.getTime() <= point.timestamp.getTime()
      );
      
      // Calculate holdings and cash at this point
      let cashBalance = 10000;
      let btcHoldings = 0;
      
      tradesUpToPoint.forEach(trade => {
        if (trade.action === 'BUY') {
          const spendAmount = trade.price * trade.amount;
          cashBalance -= spendAmount;
          btcHoldings += trade.amount;
        } else if (trade.action === 'SELL') {
          const receiveAmount = trade.price * trade.amount;
          cashBalance += receiveAmount;
          btcHoldings -= trade.amount;
        }
      });
      
      // Calculate total value at current price
      const totalValue = cashBalance + (btcHoldings * point.price);
      const pnl = totalValue - 10000;
      
      return {
        time: point.time,
        sentiment: point.sentiment,
        pnl: pnl,
        price: point.price,
        btcHoldings: btcHoldings,
        cashBalance: cashBalance
      };
    });
    
    // Only show last 12 points in the chart for clarity
    setChartData(chartPoints.slice(-12));
  }, []);

  // Update the sentiment fetching effect to only run on client
  useEffect(() => {
    if (!isClient) return; // Don't run on server

    // Initialize with historical data on client
    const initialData = generateInitialSentimentData();
    setSentimentData(initialData);
    
    // Initialize trading state
    tradingSimulator.setRiskAppetite(riskAppetite);
    const initialTradingState = tradingSimulator.getState();
    setTradingState(initialTradingState);

    const updateSentiment = async () => {
      try {
        const newData = await fetchRealCryptoSentiment();
        
        setSentimentData(prev => {
          const updated = [...prev, newData];
          // Keep last 12 data points for the chart
          return updated.length > 12 ? updated.slice(-12) : updated;
        });
        
        setCurrentSentiment(newData.sentiment);
        
        // Check if 15 minutes have passed since last trade check
        const now = new Date();
        const timeSinceLastCheck = now.getTime() - lastTradeCheck.current.getTime();
        
        if (timeSinceLastCheck >= 15 * 60 * 1000) { // 15 minutes
          // Evaluate trading decision
          const newTradingState = tradingSimulator.evaluateTrade(newData.sentiment, newData.price);
          setTradingState(newTradingState);
          lastTradeCheck.current = now;
          
          // Update chart data with both sentiment and P&L
          setChartData(prev => {
            const newPoint = {
              time: newData.time,
              sentiment: newData.sentiment,
              pnl: newTradingState.pnl,
              price: newData.price
            };
            const updated = [...prev, newPoint];
            return updated.length > 12 ? updated.slice(-12) : updated;
          });
        }
      } catch (error) {
        console.error('Failed to fetch sentiment:', error);
      }
    };

    // Initial load
    updateSentiment();
    
    // Update every 60 seconds (realistic for demo, not too aggressive)
    const interval = setInterval(updateSentiment, 60000);
    return () => clearInterval(interval);
  }, [isClient, riskAppetite]); // Add dependencies

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

  // Calculate real metrics dynamically
  const deployDate = new Date('2024-12-01'); // Adjust this to your actual deploy date
  const currentDate = new Date();
  const daysLive = Math.floor((currentDate.getTime() - deployDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate years of experience
  const startYear = 2011; // Started in relevant product/tech roles
  const currentYear = new Date().getFullYear();
  const yearsExperience = currentYear - startYear;
  
  // Count unique technologies across all projects
  const uniqueTechs = new Set<string>();
  projects.forEach(project => {
    project.tech.forEach(tech => uniqueTechs.add(tech));
  });
  const techStackSize = uniqueTechs.size;
  
  const siteMetrics = {
    performance: '98/100',
    'relevant experience': `${yearsExperience}+ Years`,
    'tech stack': `${techStackSize} Tools`,
    uptime: `${daysLive} Days`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Replace the entire particle section with: */}
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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
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

                  {/* Right Column - Live AI Trading Demo */}
                  <div className="lg:pt-[4.5rem]">
                    {/* Enhanced Crypto Bot Analytics */}
                    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl hover:border-blue-500/30 transition-all duration-500 hover-lift">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            AI Trading Bot Integration Demo
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                          <span className="font-medium">Live</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <button
                          onClick={() => setShowDocumentation(true)}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/20 transition-all duration-300 hover:scale-105"
                        >
                          <BookOpen className="w-4 h-4 mr-1" />
                          <span className="font-medium">Documentation</span>
                        </button>
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-6">
                        Real-time demonstration of AI integration from my crypto trading bot. 
                        Uses ChatGPT-4.1-mini to analyze news headlines for sentiment, combined with market data for counter-sentiment trading.
                      </p>

                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="bg-slate-800/30 rounded-lg p-4">
                          <div className={`text-2xl font-bold ${getSentimentColor(currentSentiment)} mb-1`}>
                            {isClient ? `${(currentSentiment * 100).toFixed(1)}%` : '---'}
                          </div>
                          <div className="text-sm text-slate-400 mb-1">Market Sentiment</div>
                          <div className={`text-sm font-medium ${getSentimentColor(currentSentiment)}`}>
                            {isClient ? getSentimentLabel(currentSentiment) : '---'}
                          </div>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-4">
                          <div className={`text-2xl font-bold ${tradingState && tradingState.pnl >= 0 ? 'text-green-400' : 'text-red-400'} mb-1`}>
                            {tradingState ? `$${tradingState.pnl.toFixed(2)}` : '$0.00'}
                          </div>
                          <div className="text-sm text-slate-400 mb-1">P&L (Demo)</div>
                          <div className={`text-sm font-medium ${tradingState && tradingState.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {tradingState ? `${tradingState.pnlPercent > 0 ? '+' : ''}${tradingState.pnlPercent.toFixed(2)}%` : '0.00%'}
                          </div>
                        </div>
                      </div>

                      <div className="h-64 -mx-4 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chartData.length > 0 ? chartData : sentimentData} margin={{ top: 5, right: 50, left: 0, bottom: 5 }}>
                            <defs>
                              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="time" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#64748b' }}
                              tickMargin={8}
                            />
                            <YAxis 
                              yAxisId="sentiment"
                              domain={[0, 1]} 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#64748b' }}
                              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                            />
                            <YAxis
                              yAxisId="pnl"
                              orientation="right"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fill: '#64748b' }}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                border: '1px solid #334155',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#e2e8f0'
                              }}
                              formatter={(value: number, name: string) => {
                                if (name === 'sentiment') return [`${(value * 100).toFixed(1)}%`, 'Sentiment'];
                                if (name === 'pnl') return [`$${value.toFixed(2)}`, 'P&L'];
                                return [value, name];
                              }}
                            />
                            <Legend 
                              verticalAlign="top" 
                              height={36}
                              iconType="line"
                              wrapperStyle={{ fontSize: '12px' }}
                            />
                            <ReferenceLine yAxisId="pnl" y={0} stroke="#666" strokeDasharray="3 3" />
                            <Area 
                              yAxisId="sentiment"
                              type="monotone" 
                              dataKey="sentiment" 
                              stroke="#60A5FA" 
                              fillOpacity={1} 
                              fill="url(#sentimentGradient)"
                              strokeWidth={2}
                              name="Market Sentiment"
                            />
                            {chartData.length > 0 && (
                              <Line
                                yAxisId="pnl"
                                type="monotone"
                                dataKey="pnl"
                                stroke={tradingState && tradingState.pnl >= 0 ? '#10b981' : '#ef4444'}
                                strokeWidth={3}
                                dot={false}
                                name="P&L (Demo)"
                              />
                            )}
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Trading Controls and Status */}
                      <div className="space-y-4">
                        {/* Current Action Indicator */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                          <span className="text-sm text-slate-400">Current Action</span>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                            tradingState?.currentAction === 'BUY' ? 'bg-green-500/20 text-green-400' :
                            tradingState?.currentAction === 'SELL' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {
                              tradingState?.currentAction === 'BUY' ? <TrendingUp className="w-4 h-4" /> :
                              tradingState?.currentAction === 'SELL' ? <TrendingDown className="w-4 h-4" /> :
                              <Activity className="w-4 h-4" />
                            }
                            <span className="font-medium">{tradingState?.currentAction || 'HOLD'}</span>
                          </div>
                        </div>
                        
                        {/* Risk Appetite Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Risk Appetite</span>
                            <span className="text-white font-medium">{(riskAppetite * 100).toFixed(0)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={riskAppetite * 100}
                            onChange={(e) => {
                              const newRisk = parseInt(e.target.value) / 100;
                              setRiskAppetite(newRisk);
                              
                              // Re-run backtest with new risk level
                              tradingSimulator.reset(); // Reset to $10,000 starting balance
                              const historicalData = generateBacktestData();
                              tradingSimulator.setRiskAppetite(newRisk);
                              const backtestResults = tradingSimulator.backtest(historicalData);
                              setTradingState(backtestResults);
                              
                              // Update chart with new results and accurate P&L
                              const chartPoints = historicalData.slice(-36).map((point) => {
                                // Calculate actual portfolio value at this point in time
                                const tradesUpToPoint = backtestResults.trades.filter(t => 
                                  t.timestamp.getTime() <= point.timestamp.getTime()
                                );
                                
                                // Calculate holdings and cash at this point
                                let cashBalance = 10000;
                                let btcHoldings = 0;
                                
                                tradesUpToPoint.forEach(trade => {
                                  if (trade.action === 'BUY') {
                                    const spendAmount = trade.price * trade.amount;
                                    cashBalance -= spendAmount;
                                    btcHoldings += trade.amount;
                                  } else if (trade.action === 'SELL') {
                                    const receiveAmount = trade.price * trade.amount;
                                    cashBalance += receiveAmount;
                                    btcHoldings -= trade.amount;
                                  }
                                });
                                
                                // Calculate total value at current price
                                const totalValue = cashBalance + (btcHoldings * point.price);
                                const pnl = totalValue - 10000;
                                
                                return {
                                  time: point.time,
                                  sentiment: point.sentiment,
                                  pnl: pnl,
                                  price: point.price,
                                  btcHoldings: btcHoldings,
                                  cashBalance: cashBalance
                                };
                              });
                              
                              // Only show last 12 points in the chart for clarity
                              setChartData(chartPoints.slice(-12));
                            }}
                            className="slider w-full h-2 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Conservative</span>
                            <span>Moderate</span>
                            <span>Aggressive</span>
                          </div>
                        </div>
                        
                        {/* Performance Metrics */}
                        <div className="mb-4 p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-lg">
                          <h4 className="text-sm font-medium text-slate-300 mb-3">Performance Metrics (24h Backtest)</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-slate-400">Win Rate</div>
                              <div className={`text-lg font-bold ${
                                (tradingState?.metrics?.winRate ?? 0) >= 50 ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {tradingState?.metrics?.winRate?.toFixed(1) || '0.0'}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400">Avg Return</div>
                              <div className={`text-lg font-bold ${
                                (tradingState?.metrics?.avgReturn ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {tradingState?.metrics?.avgReturn && tradingState.metrics.avgReturn > 0 ? '+' : ''}
                                {tradingState?.metrics?.avgReturn?.toFixed(2) || '0.00'}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400">Max Drawdown</div>
                              <div className="text-lg font-bold text-orange-400">
                                -{tradingState?.metrics?.maxDrawdown?.toFixed(1) || '0.0'}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400">Total Trades</div>
                              <div className="text-lg font-bold text-blue-400">
                                {tradingState?.metrics?.totalTrades || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Portfolio Status */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs text-slate-400 mb-1">Simulated Cash Balance</div>
                            <div className="text-lg font-semibold text-white">
                              ${tradingState?.balance.toFixed(2) || '10,000.00'}
                            </div>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs text-slate-400 mb-1">BTC Holdings</div>
                            <div className="text-lg font-semibold text-white">
                              {tradingState?.btcHoldings.toFixed(6) || '0.000000'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Recent Trades */}
                        {tradingState && tradingState.trades.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-slate-300">Recent Trades</h4>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {tradingState.trades.slice(-3).reverse().map((trade, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-800/30 rounded">
                                  <span className={trade.action === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                                    {trade.action}
                                  </span>
                                  <span className="text-slate-400">
                                    {trade.amount.toFixed(4)} BTC @ ${trade.price.toFixed(0)}
                                  </span>
                                  <span className="text-slate-500">
                                    {new Date(trade.timestamp).toLocaleTimeString('en-US', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-slate-400 leading-relaxed">
                            <strong className="text-slate-300">AI Integration Demo:</strong> This showcases AI-powered trading decisions from my crypto bot. 
                            The backtest shows 24 hours of historical performance based on your selected risk level. Going forward, it evaluates 
                            new trades every 15 minutes using live sentiment data. Features include counter-sentiment strategy, dynamic position sizing, 
                            and stop-loss protection (5% adjusted by risk tolerance).
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tech Stack Visualization */}
                    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl hover:border-purple-500/30 transition-all duration-500 hover-lift mt-6">
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