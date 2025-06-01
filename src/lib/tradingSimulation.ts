export interface TradeRecord {
  timestamp: Date;
  action: 'BUY' | 'SELL';
  price: number;
  amount: number;
  balance: number;
  sentiment: number;
}

export interface TradingState {
  balance: number;
  btcHoldings: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  trades: TradeRecord[];
  lastTradeTime: Date | null;
  currentAction: 'BUY' | 'HOLD' | 'SELL';
  metrics: {
    winRate: number;
    totalTrades: number;
    avgReturn: number;
    maxDrawdown: number;
    currentDrawdown: number;
  };
}

export interface HistoricalDataPoint {
  time: string;
  sentiment: number;
  price: number;
  timestamp: Date;
}

export class TradingSimulator {
  private initialBalance: number = 10000;
  private riskAppetite: number = 0.5; // 0-1 scale
  private minTimeBetweenTrades: number = 15 * 60 * 1000; // 15 minutes (matches the backtest interval)
  private stopLossPercent: number = 0.03; // 3% stop loss (tighter for more realistic losses)
  private state: TradingState;
  private entryPrices: Map<number, number> = new Map(); // Track entry prices for stop-loss
  private peakValue: number = 10000; // Track peak value for drawdown
  private marketNoiseLevel: number = 0.15; // 15% chance of false signals
  private slippageFactor: number = 0.001; // 0.1% slippage on trades
  private transactionFee: number = 0.0015; // 0.15% transaction fee

  constructor() {
    this.state = {
      balance: this.initialBalance,
      btcHoldings: 0,
      totalValue: this.initialBalance,
      pnl: 0,
      pnlPercent: 0,
      trades: [],
      lastTradeTime: null,
      currentAction: 'HOLD',
      metrics: {
        winRate: 0,
        totalTrades: 0,
        avgReturn: 0,
        maxDrawdown: 0,
        currentDrawdown: 0
      }
    };
  }

  setRiskAppetite(risk: number) {
    this.riskAppetite = Math.max(0, Math.min(1, risk));
  }

  getRiskAppetite() {
    return this.riskAppetite;
  }

  // Calculate dynamic thresholds based on risk appetite
  private getThresholds() {
    // Base thresholds for medium risk (0.5) - adjusted for more realistic trading
    const baseBuyThreshold = 0.35; // Buy when sentiment < 35% (extreme fear)
    const baseSellThreshold = 0.65; // Sell when sentiment > 65% (extreme greed)
    
    // Adjust band width based on risk
    // High risk = narrow band (more trades)
    // Low risk = wide band (fewer trades)
    const bandAdjustment = (0.5 - this.riskAppetite) * 0.15;
    
    return {
      buyThreshold: baseBuyThreshold - bandAdjustment,
      sellThreshold: baseSellThreshold + bandAdjustment
    };
  }

  // Determine position size based on risk appetite
  private getPositionSize(): number {
    // Base position size is 30% of available capital
    // Adjusted by risk appetite (15-45% range)
    // Smaller positions for more realistic risk management
    const baseSize = 0.3 + (this.riskAppetite - 0.5) * 0.3;
    
    // Add some randomness to position sizing (±10%)
    const randomFactor = 0.9 + Math.random() * 0.2;
    return baseSize * randomFactor;
  }

  // Check if position should be stopped out
  private checkStopLoss(currentPrice: number): boolean {
    if (this.state.btcHoldings === 0) return false;
    
    // Get average entry price
    let totalCost = 0;
    let totalBtc = 0;
    
    for (const trade of this.state.trades) {
      if (trade.action === 'BUY') {
        totalCost += trade.price * trade.amount;
        totalBtc += trade.amount;
      } else if (trade.action === 'SELL') {
        totalBtc -= trade.amount;
      }
    }
    
    if (totalBtc > 0) {
      const avgEntryPrice = totalCost / totalBtc;
      const currentLoss = (currentPrice - avgEntryPrice) / avgEntryPrice;
      
      // Adjust stop loss based on risk appetite (tighter for low risk)
      const adjustedStopLoss = this.stopLossPercent * (1.5 - this.riskAppetite * 0.5);
      return currentLoss < -adjustedStopLoss;
    }
    
    return false;
  }

  // Update performance metrics
  private updateMetrics() {
    const trades = this.state.trades;
    if (trades.length === 0) return;
    
    // Calculate win rate
    let wins = 0;
    let totalReturns = 0;
    
    // Group trades into round trips (buy -> sell)
    const roundTrips: Array<{buyPrice: number, sellPrice: number}> = [];
    const pendingBuys: TradeRecord[] = [];
    
    for (const trade of trades) {
      if (trade.action === 'BUY') {
        pendingBuys.push(trade);
      } else if (trade.action === 'SELL' && pendingBuys.length > 0) {
        const buyTrade = pendingBuys.shift()!;
        const returnPct = (trade.price - buyTrade.price) / buyTrade.price;
        totalReturns += returnPct;
        if (returnPct > 0) wins++;
        roundTrips.push({ buyPrice: buyTrade.price, sellPrice: trade.price });
      }
    }
    
    const completedTrades = roundTrips.length;
    
    // Update drawdown
    this.peakValue = Math.max(this.peakValue, this.state.totalValue);
    const currentDrawdown = (this.peakValue - this.state.totalValue) / this.peakValue;
    
    this.state.metrics = {
      winRate: completedTrades > 0 ? (wins / completedTrades) * 100 : 0,
      totalTrades: trades.length,
      avgReturn: completedTrades > 0 ? (totalReturns / completedTrades) * 100 : 0,
      maxDrawdown: Math.max(this.state.metrics.maxDrawdown, currentDrawdown * 100),
      currentDrawdown: currentDrawdown * 100
    };
  }

  evaluateTrade(sentiment: number, currentPrice: number, timestamp?: Date): TradingState {
    const now = timestamp || new Date();
    const { buyThreshold, sellThreshold } = this.getThresholds();
    
    // Add market noise - sentiment might not always be accurate
    const marketNoise = Math.random();
    const isNoiseSignal = marketNoise < this.marketNoiseLevel;
    
    // Add momentum factor - counter-sentiment works better in ranging markets
    // Calculate simple momentum (would use real price history in production)
    const priceVolatility = 0.02 + Math.random() * 0.03; // 2-5% volatility
    const momentum = (Math.random() - 0.5) * priceVolatility;
    
    console.log('🤖 Trading evaluation:', {
      sentiment: sentiment.toFixed(3),
      buyThreshold: buyThreshold.toFixed(3),
      sellThreshold: sellThreshold.toFixed(3),
      balance: this.state.balance.toFixed(2),
      btcHoldings: this.state.btcHoldings.toFixed(6),
      isNoiseSignal,
      momentum: momentum.toFixed(4)
    });
    
    // Check if enough time has passed since last trade
    const canTrade = !this.state.lastTradeTime || 
      (now.getTime() - this.state.lastTradeTime.getTime()) >= this.minTimeBetweenTrades;

    // Determine action based on counter-sentiment strategy
    let action: 'BUY' | 'HOLD' | 'SELL' = 'HOLD';
    
    // Apply noise to occasionally skip good signals or take bad ones
    if (isNoiseSignal) {
      // Sometimes the market doesn't follow sentiment
      const randomAction = Math.random();
      if (randomAction < 0.3 && this.state.balance > 100) {
        action = 'BUY';
        console.log('🟠 NOISE BUY: Random market movement');
      } else if (randomAction > 0.7 && this.state.btcHoldings > 0) {
        action = 'SELL';
        console.log('🟠 NOISE SELL: Random market movement');
      } else {
        action = 'HOLD';
        console.log('🟡 NOISE HOLD: Uncertain market');
      }
    } else {
      // Normal sentiment-based trading
      if (sentiment < buyThreshold && this.state.balance > 100) {
        // Additional check: momentum shouldn't be too negative
        if (momentum > -0.02) {
          action = 'BUY';
          console.log('🟢 BUY signal: sentiment < buyThreshold');
        } else {
          console.log('🟡 SKIP BUY: Negative momentum');
        }
      } else if (sentiment > sellThreshold && this.state.btcHoldings > 0) {
        // Additional check: momentum shouldn't be too positive
        if (momentum < 0.02) {
          action = 'SELL';
          console.log('🔴 SELL signal: sentiment > sellThreshold');
        } else {
          console.log('🟡 SKIP SELL: Positive momentum');
        }
      } else {
        console.log('🟡 HOLD signal: no conditions met');
      }
    }

    this.state.currentAction = action;

    // Check stop loss first
    if (this.checkStopLoss(currentPrice) && canTrade && this.state.btcHoldings > 0) {
      // Execute stop loss sell with extra slippage (panic selling)
      const sellAmount = this.state.btcHoldings;
      
      // Stop loss executes at worse price due to market pressure
      const panicSlippage = 1 - this.slippageFactor * 2 - (Math.random() * this.slippageFactor * 2);
      const actualPrice = currentPrice * panicSlippage;
      
      const grossAmount = sellAmount * actualPrice;
      const feeAmount = grossAmount * this.transactionFee;
      const netCashAmount = grossAmount - feeAmount;
      
      this.state.btcHoldings = 0;
      this.state.balance += netCashAmount;
      
      this.state.trades.push({
        timestamp: now,
        action: 'SELL',
        price: actualPrice,
        amount: sellAmount,
        balance: this.state.balance,
        sentiment
      });
      
      this.state.lastTradeTime = now;
      this.state.currentAction = 'SELL';
      console.log('🛑 STOP LOSS triggered at', actualPrice.toFixed(2));
    } else if (canTrade && action !== 'HOLD') {
      // Execute regular trade if conditions are met
      if (action === 'BUY') {
        const positionSize = this.getPositionSize();
        const spendAmount = this.state.balance * positionSize;
        
        // Apply slippage - buy at slightly higher price
        const slippage = 1 + this.slippageFactor + (Math.random() * this.slippageFactor);
        const actualPrice = currentPrice * slippage;
        
        // Apply transaction fee
        const feeAmount = spendAmount * this.transactionFee;
        const netSpendAmount = spendAmount - feeAmount;
        
        const btcAmount = netSpendAmount / actualPrice;
        
        this.state.balance -= spendAmount;
        this.state.btcHoldings += btcAmount;
        
        this.state.trades.push({
          timestamp: now,
          action: 'BUY',
          price: actualPrice,
          amount: btcAmount,
          balance: this.state.balance,
          sentiment
        });
        
        this.state.lastTradeTime = now;
      } else if (action === 'SELL') {
        // Sell ALL BTC holdings (100% exit strategy)
        const sellAmount = this.state.btcHoldings;
        
        // Apply slippage - sell at slightly lower price
        const slippage = 1 - this.slippageFactor - (Math.random() * this.slippageFactor);
        const actualPrice = currentPrice * slippage;
        
        const grossAmount = sellAmount * actualPrice;
        const feeAmount = grossAmount * this.transactionFee;
        const netCashAmount = grossAmount - feeAmount;
        
        this.state.btcHoldings = 0; // Clear all BTC holdings
        this.state.balance += netCashAmount;
        
        this.state.trades.push({
          timestamp: now,
          action: 'SELL',
          price: actualPrice,
          amount: sellAmount,
          balance: this.state.balance,
          sentiment
        });
        
        this.state.lastTradeTime = now;
      }
    }

    // Update total value and P&L
    this.state.totalValue = this.state.balance + (this.state.btcHoldings * currentPrice);
    this.state.pnl = this.state.totalValue - this.initialBalance;
    this.state.pnlPercent = (this.state.pnl / this.initialBalance) * 100;

    // Update metrics
    this.updateMetrics();

    // Keep only last 20 trades for display
    if (this.state.trades.length > 20) {
      this.state.trades = this.state.trades.slice(-20);
    }

    return { ...this.state };
  }

  getState(): TradingState {
    return { ...this.state };
  }

  reset() {
    this.state = {
      balance: this.initialBalance,
      btcHoldings: 0,
      totalValue: this.initialBalance,
      pnl: 0,
      pnlPercent: 0,
      trades: [],
      lastTradeTime: null,
      currentAction: 'HOLD',
      metrics: {
        winRate: 0,
        totalTrades: 0,
        avgReturn: 0,
        maxDrawdown: 0,
        currentDrawdown: 0
      }
    };
    this.peakValue = this.initialBalance;
    this.entryPrices.clear();
  }

  // Backtest on historical data
  backtest(historicalData: HistoricalDataPoint[]): TradingState {
    this.reset();
    
    // Sort by timestamp to ensure chronological order
    const sortedData = [...historicalData].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    console.log('Starting backtest with', sortedData.length, 'data points');
    console.log('Risk appetite:', this.riskAppetite);
    const thresholds = this.getThresholds();
    console.log('Trading thresholds:', thresholds);
    
    // Simulate trades on historical data
    for (let i = 0; i < sortedData.length; i++) {
      const dataPoint = sortedData[i];
      
      // Only process every 3rd data point to simulate 15-minute intervals
      // (assuming data points are 5 minutes apart)
      if (i % 3 === 0) {
        // Temporarily override the lastTradeTime to use historical time
        if (i > 2) {
          // Set last trade time to the previous evaluation point (3 data points back)
          const prevTradePoint = sortedData[i - 3];
          if (prevTradePoint) {
            this.state.lastTradeTime = prevTradePoint.timestamp;
          }
        }
        
        const prevBalance = this.state.balance;
        const prevHoldings = this.state.btcHoldings;
        
        // Add random market events (flash crashes, pumps)
        let adjustedPrice = dataPoint.price;
        const marketEventChance = Math.random();
        if (marketEventChance < 0.05) { // 5% chance of market event
          const eventMagnitude = 0.02 + Math.random() * 0.03; // 2-5% move
          if (marketEventChance < 0.025) {
            // Flash crash
            adjustedPrice = dataPoint.price * (1 - eventMagnitude);
            console.log('📉 FLASH CRASH at', dataPoint.time, '- Price dropped', (eventMagnitude * 100).toFixed(1) + '%');
          } else {
            // Flash pump
            adjustedPrice = dataPoint.price * (1 + eventMagnitude);
            console.log('📈 FLASH PUMP at', dataPoint.time, '- Price jumped', (eventMagnitude * 100).toFixed(1) + '%');
          }
        }
        
        // Pass the historical timestamp to evaluateTrade
        this.evaluateTrade(dataPoint.sentiment, adjustedPrice, dataPoint.timestamp);
        
        if (this.state.balance !== prevBalance || this.state.btcHoldings !== prevHoldings) {
          const tradeType = this.state.btcHoldings > prevHoldings ? 'BUY' : 'SELL';
          console.log(`${tradeType} at ${dataPoint.time} - sentiment ${dataPoint.sentiment.toFixed(2)}, price $${adjustedPrice.toFixed(0)}: Cash $${this.state.balance.toFixed(2)}, BTC ${this.state.btcHoldings.toFixed(6)}`);
        }
      }
    }
    
    // Make sure to update final P&L with last price
    if (sortedData.length > 0) {
      const lastPrice = sortedData[sortedData.length - 1].price;
      this.state.totalValue = this.state.balance + (this.state.btcHoldings * lastPrice);
      this.state.pnl = this.state.totalValue - this.initialBalance;
      this.state.pnlPercent = (this.state.pnl / this.initialBalance) * 100;
      this.updateMetrics();
    }
    
    console.log('Backtest complete:', this.state.trades.length, 'trades executed, P&L: $' + this.state.pnl.toFixed(2) + ' (' + this.state.pnlPercent.toFixed(2) + '%)');
    return { ...this.state };
  }
}

// Singleton instance
export const tradingSimulator = new TradingSimulator();