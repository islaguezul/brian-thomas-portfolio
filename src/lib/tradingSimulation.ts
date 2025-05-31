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
  private stopLossPercent: number = 0.05; // 5% stop loss
  private state: TradingState;
  private entryPrices: Map<number, number> = new Map(); // Track entry prices for stop-loss
  private peakValue: number = 10000; // Track peak value for drawdown

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
    // Base thresholds for medium risk (0.5)
    const baseBuyThreshold = 0.42;
    const baseSellThreshold = 0.58;
    
    // Adjust band width based on risk
    // High risk = narrow band (more trades)
    // Low risk = wide band (fewer trades)
    const bandAdjustment = (0.5 - this.riskAppetite) * 0.12;
    
    return {
      buyThreshold: baseBuyThreshold - bandAdjustment,
      sellThreshold: baseSellThreshold + bandAdjustment
    };
  }

  // Determine position size based on risk appetite
  private getPositionSize(): number {
    // Base position size is 40% of available capital
    // Adjusted by risk appetite (20-60% range)
    // This allows for more meaningful trades while still maintaining diversification
    return 0.4 + (this.riskAppetite - 0.5) * 0.4;
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
      const adjustedStopLoss = this.stopLossPercent * (2 - this.riskAppetite);
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
    
    // Check if enough time has passed since last trade
    const canTrade = !this.state.lastTradeTime || 
      (now.getTime() - this.state.lastTradeTime.getTime()) >= this.minTimeBetweenTrades;

    // Determine action based on counter-sentiment strategy
    let action: 'BUY' | 'HOLD' | 'SELL' = 'HOLD';
    
    if (sentiment < buyThreshold && this.state.balance > 0) {
      action = 'BUY';
    } else if (sentiment > sellThreshold && this.state.btcHoldings > 0) {
      action = 'SELL';
    }

    this.state.currentAction = action;

    // Check stop loss first
    if (this.checkStopLoss(currentPrice) && canTrade && this.state.btcHoldings > 0) {
      // Execute stop loss sell
      const sellAmount = this.state.btcHoldings;
      const cashAmount = sellAmount * currentPrice;
      
      this.state.btcHoldings = 0;
      this.state.balance += cashAmount;
      
      this.state.trades.push({
        timestamp: now,
        action: 'SELL',
        price: currentPrice,
        amount: sellAmount,
        balance: this.state.balance,
        sentiment
      });
      
      this.state.lastTradeTime = now;
      this.state.currentAction = 'SELL';
    } else if (canTrade && action !== 'HOLD') {
      // Execute regular trade if conditions are met
      if (action === 'BUY') {
        const positionSize = this.getPositionSize();
        const spendAmount = this.state.balance * positionSize;
        const btcAmount = spendAmount / currentPrice;
        
        this.state.balance -= spendAmount;
        this.state.btcHoldings += btcAmount;
        
        this.state.trades.push({
          timestamp: now,
          action: 'BUY',
          price: currentPrice,
          amount: btcAmount,
          balance: this.state.balance,
          sentiment
        });
        
        this.state.lastTradeTime = now;
      } else if (action === 'SELL') {
        // FIXED: Sell ALL BTC holdings (100% exit strategy)
        const sellAmount = this.state.btcHoldings; // Sell everything
        const cashAmount = sellAmount * currentPrice;
        
        this.state.btcHoldings = 0; // Clear all BTC holdings
        this.state.balance += cashAmount;
        
        this.state.trades.push({
          timestamp: now,
          action: 'SELL',
          price: currentPrice,
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
        
        // Pass the historical timestamp to evaluateTrade
        this.evaluateTrade(dataPoint.sentiment, dataPoint.price, dataPoint.timestamp);
        
        if (this.state.balance !== prevBalance || this.state.btcHoldings !== prevHoldings) {
          const tradeType = this.state.btcHoldings > prevHoldings ? 'BUY' : 'SELL';
          console.log(`${tradeType} at ${dataPoint.time} - sentiment ${dataPoint.sentiment.toFixed(2)}, price $${dataPoint.price}: Cash $${this.state.balance.toFixed(2)}, BTC ${this.state.btcHoldings.toFixed(6)}`);
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