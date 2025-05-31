'use client'

import React from 'react';
import { X } from 'lucide-react';

interface TradingBotDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const TradingBotDocumentation: React.FC<TradingBotDocumentationProps> = ({
  isOpen,
  onClose
}) => {
  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="flex items-center justify-center min-h-full">
        <div className="relative p-[2px] rounded-2xl max-w-4xl w-full bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header with close button - Fixed */}
            <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 p-6 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AI Trading Bot Integration Demo
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-slate-300 mt-2">
                Complete technical documentation and methodology
              </p>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto flex-1 p-6 space-y-8 text-slate-200">
              {/* Executive Summary */}
              <section>
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Executive Summary</h3>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                <p className="text-slate-300 leading-relaxed mb-3">
                  This demonstration showcases AI-powered trading functionality extracted from my cryptocurrency trading bot application. 
                  Using simulated currency, it demonstrates real algorithmic decision-making based on market sentiment analysis and 
                  counter-sentiment trading strategies.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  The system analyzes market sentiment in real-time, executes trades based on contrarian principles 
                  (buying during fear, selling during greed), and dynamically adjusts position sizing based on configurable risk appetite.
                </p>
              </div>
            </section>

            {/* How It Works - Non-Technical */}
            <section>
              <h3 className="text-xl font-semibold text-green-400 mb-4">How It Works (Overview)</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                    <h4 className="font-semibold text-white mb-2">📊 Market Analysis</h4>
                    <p className="text-sm text-slate-300">
                      Continuously monitors cryptocurrency market sentiment, combining multiple data sources 
                      to determine if the market is fearful or greedy.
                    </p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                    <h4 className="font-semibold text-white mb-2">🔄 Counter-Sentiment Strategy</h4>
                    <p className="text-sm text-slate-300">
                      Applies the investment principle &ldquo;Be fearful when others are greedy, be greedy when others are fearful&rdquo; - 
                      buying during market fear and selling during market greed.
                    </p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                    <h4 className="font-semibold text-white mb-2">⚖️ Risk Management</h4>
                    <p className="text-sm text-slate-300">
                      Adjusts trade sizes based on your risk tolerance. Higher risk means larger positions, 
                      lower risk means smaller, more conservative trades.
                    </p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                    <h4 className="font-semibold text-white mb-2">📈 Performance Tracking</h4>
                    <p className="text-sm text-slate-300">
                      Tracks all trades, calculates win rates, average returns, and risk metrics to 
                      demonstrate strategy effectiveness over time.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Trading Strategy Details */}
            <section>
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Trading Strategy Mechanics</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                  <h4 className="font-semibold text-white mb-3">Decision Logic</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-2">
                        <span className="text-green-400 font-semibold">BUY Signal</span>
                      </div>
                      <p className="text-slate-300">Sentiment &lt; 42%</p>
                      <p className="text-slate-400 text-xs">(Market Fear)</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-2">
                        <span className="text-yellow-400 font-semibold">HOLD Signal</span>
                      </div>
                      <p className="text-slate-300">42% ≤ Sentiment ≤ 58%</p>
                      <p className="text-slate-400 text-xs">(Neutral Zone)</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-2">
                        <span className="text-red-400 font-semibold">SELL Signal</span>
                      </div>
                      <p className="text-slate-300">Sentiment &gt; 58%</p>
                      <p className="text-slate-400 text-xs">(Market Greed)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                  <h4 className="font-semibold text-white mb-3">Position Sizing Formula</h4>
                  <div className="font-mono text-sm bg-slate-900/50 rounded-lg p-3 mb-3">
                    <span className="text-blue-400">Position Size</span> = 
                    <span className="text-green-400"> Base Size</span> + 
                    <span className="text-purple-400"> (Risk Appetite × Risk Multiplier)</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-400 font-semibold">Base Size:</span>
                      <span className="text-slate-300"> 40% of available capital</span>
                    </div>
                    <div>
                      <span className="text-purple-400 font-semibold">Risk Range:</span>
                      <span className="text-slate-300"> 20% - 60% of capital</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Implementation */}
            <section>
              <h3 className="text-xl font-semibold text-cyan-400 mb-4">Technical Implementation</h3>
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                  <h4 className="font-semibold text-white mb-3">Data Architecture</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 font-semibold min-w-[120px]">Data Generation:</span>
                      <span className="text-slate-300">Deterministic mathematical models create consistent 24-hour market scenarios with realistic price movements and sentiment patterns</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-400 font-semibold min-w-[120px]">Backtesting:</span>
                      <span className="text-slate-300">Processes 288 data points (5-minute intervals) to simulate 24 hours of trading activity</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-purple-400 font-semibold min-w-[120px]">State Management:</span>
                      <span className="text-slate-300">Tracks portfolio balance, BTC holdings, trade history, and performance metrics in real-time</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                  <h4 className="font-semibold text-white mb-3">Mathematical Models</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-blue-400 font-semibold">Price Generation:</span>
                      <div className="font-mono text-xs bg-slate-900/50 rounded p-2 mt-1">
                        price_change = sin(i × 0.02) × 0.015 + seeded_random(i) × 0.025
                      </div>
                    </div>
                    <div>
                      <span className="text-green-400 font-semibold">Sentiment Analysis:</span>
                      <div className="font-mono text-xs bg-slate-900/50 rounded p-2 mt-1">
                        chatgpt_analysis(headlines) → sentiment_score(0-1)
                      </div>
                    </div>
                    <div>
                      <span className="text-purple-400 font-semibold">P&L Calculation:</span>
                      <div className="font-mono text-xs bg-slate-900/50 rounded p-2 mt-1">
                        portfolio_value = cash_balance + (btc_holdings × current_price)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Performance Metrics */}
            <section>
              <h3 className="text-xl font-semibold text-orange-400 mb-4">Performance Metrics Explained</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                  <h4 className="font-semibold text-white mb-2">Win Rate</h4>
                  <p className="text-sm text-slate-300 mb-2">
                    Percentage of profitable round-trip trades (buy → sell cycles)
                  </p>
                  <div className="text-xs text-slate-400">
                    Calculated from completed buy/sell pairs, excluding partial positions
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                  <h4 className="font-semibold text-white mb-2">Average Return</h4>
                  <p className="text-sm text-slate-300 mb-2">
                    Mean percentage return per completed trade
                  </p>
                  <div className="text-xs text-slate-400">
                    Sum of all trade returns divided by number of completed trades
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                  <h4 className="font-semibold text-white mb-2">Max Drawdown</h4>
                  <p className="text-sm text-slate-300 mb-2">
                    Largest peak-to-trough decline in portfolio value
                  </p>
                  <div className="text-xs text-slate-400">
                    Risk metric showing worst-case portfolio decline during the period
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                  <h4 className="font-semibold text-white mb-2">Total Trades</h4>
                  <p className="text-sm text-slate-300 mb-2">
                    Number of buy and sell transactions executed
                  </p>
                  <div className="text-xs text-slate-400">
                    Indicates strategy activity level and market opportunity utilization
                  </div>
                </div>
              </div>
            </section>

            {/* Risk Management */}
            <section>
              <h3 className="text-xl font-semibold text-red-400 mb-4">Risk Management Features</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-xl p-4 border border-red-500/30">
                  <h4 className="font-semibold text-white mb-3">Stop-Loss Protection</h4>
                  <p className="text-slate-300 text-sm mb-2">
                    Automatic position exit when losses exceed 5% (adjusted by risk tolerance)
                  </p>
                  <div className="text-xs text-slate-400">
                    Lower risk tolerance = tighter stop-loss (more protection)
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-500/30">
                  <h4 className="font-semibold text-white mb-3">Position Limits</h4>
                  <p className="text-slate-300 text-sm mb-2">
                    Maximum 60% of capital per trade, minimum $100 trade size
                  </p>
                  <div className="text-xs text-slate-400">
                    Prevents over-exposure and ensures meaningful trade execution
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded-xl p-4 border border-green-500/30">
                  <h4 className="font-semibold text-white mb-3">Time-Based Controls</h4>
                  <p className="text-slate-300 text-sm mb-2">
                    15-minute minimum between trades prevents over-trading
                  </p>
                  <div className="text-xs text-slate-400">
                    Allows sentiment to stabilize and reduces transaction costs
                  </div>
                </div>
              </div>
            </section>

            {/* Data Sources and Validation */}
            <section>
              <h3 className="text-xl font-semibold text-indigo-400 mb-4">Data Sources &amp; Validation</h3>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-blue-400 font-semibold">Production Data Sources:</span>
                    <ul className="list-disc list-inside text-slate-300 mt-2 ml-4 space-y-1">
                      <li>CoinGecko API - Real-time Bitcoin pricing and volume data</li>
                      <li>Fear &amp; Greed Index - Market sentiment indicator (0-100 scale)</li>
                      <li>ChatGPT-4.1-mini API - AI-powered analysis of crypto news headlines for sentiment scoring</li>
                      <li>Social Media Sentiment - Twitter/Reddit discussion analysis via NLP</li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-green-400 font-semibold">Demo Implementation:</span>
                    <p className="text-slate-300 mt-2">
                      Uses deterministic mathematical models to ensure consistent results for demonstration purposes. 
                      Patterns mirror real market behavior including trends, volatility, and sentiment cycles.
                    </p>
                  </div>
                  <div>
                    <span className="text-purple-400 font-semibold">Validation Methods:</span>
                    <p className="text-slate-300 mt-2">
                      Backtesting results validated against historical market data. Strategy performance 
                      correlates with documented contrarian investment approaches and academic research.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="border-t border-slate-700/50 pt-6">
              <div className="bg-gradient-to-r from-amber-900/20 to-red-900/20 rounded-xl p-4 border border-amber-500/30">
                <h4 className="font-semibold text-amber-400 mb-2">Important Notice</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  This demonstration uses simulated trading with virtual currency for educational and showcase purposes only. 
                  The functionality is extracted from my actual cryptocurrency trading bot application but operates with 
                  simulated data and virtual money. Past performance does not guarantee future results. 
                  Real cryptocurrency trading involves substantial risk of loss.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TradingBotDocumentation;