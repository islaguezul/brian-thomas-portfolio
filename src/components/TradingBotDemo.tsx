'use client'

import React, { useMemo } from 'react';
import { BookOpen, TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, Area, XAxis, YAxis, Tooltip, ComposedChart, Line, Legend, ReferenceLine } from 'recharts';
import { tradingSimulator, type TradingState } from '../lib/tradingSimulation';
import { generateBacktestData, type CryptoSentimentData } from '../lib/cryptoSentiment';

interface TradingBotDemoProps {
  currentSentiment: number;
  tradingState: TradingState | null;
  riskAppetite: number;
  chartData: Array<{
    time: string;
    sentiment: number;
    pnl: number;
    price: number;
  }>;
  isClient: boolean;
  onShowDocumentation: () => void;
  onRiskAppetiteChange: (newRisk: number) => void;
  onChartDataUpdate: (data: Array<{
    time: string;
    sentiment: number;
    pnl: number;
    price: number;
  }>) => void;
  onTradingStateUpdate: (state: TradingState) => void;
}

const TradingBotDemo: React.FC<TradingBotDemoProps> = ({
  currentSentiment,
  tradingState,
  riskAppetite,
  chartData,
  isClient,
  onShowDocumentation,
  onRiskAppetiteChange,
  onChartDataUpdate,
  onTradingStateUpdate
}) => {
  const getSentimentColor = useMemo(() => (sentiment: number): string => {
    if (sentiment > 0.6) return 'text-green-400';
    if (sentiment > 0.4) return 'text-yellow-400';
    return 'text-red-400';
  }, []);

  const getSentimentLabel = useMemo(() => (sentiment: number): string => {
    if (sentiment > 0.7) return 'Bullish';
    if (sentiment > 0.5) return 'Neutral';
    return 'Bearish';
  }, []);

  const handleRiskChange = useMemo(() => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRisk = parseInt(e.target.value) / 100;
    onRiskAppetiteChange(newRisk);
    
    // Re-run backtest with new risk level
    tradingSimulator.reset();
    const historicalData = generateBacktestData();
    tradingSimulator.setRiskAppetite(newRisk);
    const backtestResults = tradingSimulator.backtest(historicalData);
    onTradingStateUpdate(backtestResults);
    
    // Generate chart data showing actual P&L progression
    const chartPoints = [];
    let runningCash = 10000;
    let runningBtc = 0;
    let tradeIndex = 0;
    const sortedTrades = [...backtestResults.trades].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    // Process each historical data point chronologically
    for (let i = 0; i < historicalData.length; i++) {
      const point = historicalData[i];
      
      // Apply all trades that occurred before or at this point in time
      while (tradeIndex < sortedTrades.length && 
             sortedTrades[tradeIndex].timestamp.getTime() <= point.timestamp.getTime()) {
        const trade = sortedTrades[tradeIndex];
        
        if (trade.action === 'BUY') {
          const spendAmount = trade.price * trade.amount;
          runningCash -= spendAmount;
          runningBtc += trade.amount;
        } else if (trade.action === 'SELL') {
          const receiveAmount = trade.price * trade.amount;
          runningCash += receiveAmount;
          runningBtc -= trade.amount;
        }
        
        tradeIndex++;
      }
      
      // Calculate portfolio value at this point using current market price
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
    
    // Show last 12 points for chart clarity
    onChartDataUpdate(chartPoints.slice(-12));
  }, [onRiskAppetiteChange, onTradingStateUpdate, onChartDataUpdate]);

  return (
    <div>
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
            onClick={onShowDocumentation}
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
            <ComposedChart data={chartData} margin={{ top: 5, right: 50, left: 0, bottom: 5 }}>
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
              <Line
                yAxisId="pnl"
                type="monotone"
                dataKey="pnl"
                stroke={(chartData && chartData.length > 0 && chartData[chartData.length - 1].pnl >= 0) ? '#10b981' : '#ef4444'}
                strokeWidth={3}
                dot={false}
                name="P&L (Demo)"
              />
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
              onChange={handleRiskChange}
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
    </div>
  );
};

export default TradingBotDemo;