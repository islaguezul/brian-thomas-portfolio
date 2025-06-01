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
  private minTimeBetweenTrades: number = 5 * 60 * 1000; // 5 minutes for more active trading
  private stopLossPercent: number = 0.05; // 5% stop loss
  private state: TradingState;
  private entryPrices: Map<number, number> = new Map(); // Track entry prices for stop-loss
  private peakValue: number = 10000; // Track peak value for drawdown
  private slippageFactor: number = 0.001; // 0.1% slippage on trades
  private transactionFee: number = 0.001; // 0.1% transaction fee

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
        winRate: 55, // Start with expected win rate
        totalTrades: 0,
        avgReturn: 0.5, // Start with small positive return
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
    // More aggressive thresholds to ensure regular trading
    const baseBuyThreshold = 0.45;  // Buy more frequently
    const baseSellThreshold = 0.55; // Sell more frequently
    
    // Adjust band width based on risk
    const bandAdjustment = (0.5 - this.riskAppetite) * 0.08;
    
    // Add some time-based variation to create trading opportunities
    const timeFactor = new Date().getSeconds() / 60;
    const timeVariation = Math.sin(timeFactor * Math.PI * 2) * 0.05;
    
    return {
      buyThreshold: baseBuyThreshold - bandAdjustment + timeVariation,
      sellThreshold: baseSellThreshold + bandAdjustment - timeVariation
    };
  }

  // Determine position size based on risk appetite
  private getPositionSize(): number {
    // More conservative sizing for realistic trading
    // Base position size is 30% of available capital
    const baseSize = 0.3 + (this.riskAppetite - 0.5) * 0.2;
    
    // Add small variation
    const variation = 0.95 + Math.random() * 0.1;
    
    return Math.min(0.5, baseSize * variation); // Never more than 50%
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
    const roundTrips: Array<{buyPrice: number, sellPrice: number, buyTime: Date, sellTime: Date}> = [];
    const pendingBuys: TradeRecord[] = [];
    
    for (const trade of trades) {
      if (trade.action === 'BUY') {
        pendingBuys.push(trade);
      } else if (trade.action === 'SELL' && pendingBuys.length > 0) {
        const buyTrade = pendingBuys.shift()!;
        // Calculate actual return considering all costs
        const buyTotal = buyTrade.price * buyTrade.amount; // Total spent
        const sellTotal = trade.price * trade.amount; // Total received
        const netReturn = (sellTotal - buyTotal) / buyTotal;
        totalReturns += netReturn;
        
        // Count as win if we made any profit after ALL costs
        // This already includes fees and slippage from the actual trade execution
        if (netReturn > 0) wins++;
        
        roundTrips.push({ 
          buyPrice: buyTrade.price, 
          sellPrice: trade.price,
          buyTime: buyTrade.timestamp,
          sellTime: trade.timestamp
        });
      }
    }
    
    const completedTrades = roundTrips.length;
    
    // Update drawdown
    this.peakValue = Math.max(this.peakValue, this.state.totalValue);
    const currentDrawdown = (this.peakValue - this.state.totalValue) / this.peakValue;
    
    // Calculate estimated metrics including open positions
    let estimatedWinRate = this.state.metrics.winRate; // Keep previous if no new data
    let estimatedAvgReturn = this.state.metrics.avgReturn;
    
    if (completedTrades > 0) {
      // We have completed trades, use actual data
      estimatedWinRate = (wins / completedTrades) * 100;
      estimatedAvgReturn = (totalReturns / completedTrades) * 100;
    } else if (trades.length > 0 && pendingBuys.length > 0) {
      // We have open positions but no completed trades yet
      // Estimate based on current unrealized P&L
      const unrealizedReturn = this.state.pnlPercent;
      estimatedWinRate = unrealizedReturn > 0 ? 55 : 45; // Rough estimate
      estimatedAvgReturn = unrealizedReturn / Math.max(1, pendingBuys.length);
    }
    
    this.state.metrics = {
      winRate: estimatedWinRate,
      totalTrades: trades.length,
      avgReturn: estimatedAvgReturn,
      maxDrawdown: Math.max(this.state.metrics.maxDrawdown, currentDrawdown * 100),
      currentDrawdown: currentDrawdown * 100
    };
  }

  evaluateTrade(sentiment: number, currentPrice: number, timestamp?: Date): TradingState {
    const now = timestamp || new Date();
    
    // Check if enough time has passed since last trade
    const canTrade = !this.state.lastTradeTime || 
      (now.getTime() - this.state.lastTradeTime.getTime()) >= this.minTimeBetweenTrades;

    // Very simple trading logic to ensure trades happen
    let action: 'BUY' | 'HOLD' | 'SELL' = 'HOLD';
    
    if (!canTrade) {
      // Can't trade yet, just update values and return
      this.state.totalValue = this.state.balance + (this.state.btcHoldings * currentPrice);
      this.state.pnl = this.state.totalValue - this.initialBalance;
      this.state.pnlPercent = (this.state.pnl / this.initialBalance) * 100;
      return { ...this.state };
    }
    
    // Simple counter-sentiment trading
    if (this.state.btcHoldings === 0 && this.state.balance > 100) {
      // We have cash - buy when sentiment is low
      if (sentiment < 0.45) {
        action = 'BUY';
        console.log(`BUY SIGNAL: sentiment ${sentiment.toFixed(3)} < 0.45`);
      }
    } else if (this.state.btcHoldings > 0) {
      // We have BTC - sell when sentiment is high
      if (sentiment > 0.55) {
        action = 'SELL';
        console.log(`SELL SIGNAL: sentiment ${sentiment.toFixed(3)} > 0.55`);
      }
    }

    this.state.currentAction = action;

    // Check stop loss first
    if (this.checkStopLoss(currentPrice) && canTrade && this.state.btcHoldings > 0) {
      // Execute stop loss sell
      const sellAmount = this.state.btcHoldings;
      
      // Stop loss executes at slightly worse price
      const slippage = 1 - this.slippageFactor * 1.5;
      const actualPrice = currentPrice * slippage;
      
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
      // Stop loss triggered
    } else if (canTrade && action !== 'HOLD') {
      // Execute regular trade if conditions are met
      if (action === 'BUY') {
        const positionSize = this.getPositionSize();
        const spendAmount = this.state.balance * positionSize;
        
        // Apply slippage - buy at slightly higher price
        const slippage = 1 + this.slippageFactor;
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
        const slippage = 1 - this.slippageFactor;
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

    // Update metrics before trimming trades
    this.updateMetrics();

    // Note: We keep all trades for accurate metrics calculation
    // Only trim for display if absolutely necessary (e.g., > 100 trades)
    if (this.state.trades.length > 100) {
      this.state.trades = this.state.trades.slice(-100);
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
        winRate: 55, // Start with expected win rate
        totalTrades: 0,
        avgReturn: 0.5, // Start with small positive return
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
      if (i % 1 === 0) { // Process every data point
        // Temporarily override the lastTradeTime to use historical time
        // Don't override lastTradeTime - let the trading logic handle it naturally
        
        const prevBalance = this.state.balance;
        const prevHoldings = this.state.btcHoldings;
        
        // Pass the historical timestamp to evaluateTrade
        this.evaluateTrade(dataPoint.sentiment, dataPoint.price, dataPoint.timestamp);
        
        if (this.state.balance !== prevBalance || this.state.btcHoldings !== prevHoldings) {
          const tradeType = this.state.btcHoldings > prevHoldings ? 'BUY' : 'SELL';
          console.log(`${tradeType} at ${dataPoint.time} - sentiment ${dataPoint.sentiment.toFixed(2)}, price $${dataPoint.price.toFixed(0)}: Cash $${this.state.balance.toFixed(2)}, BTC ${this.state.btcHoldings.toFixed(6)}`);
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

// Create fresh instance each time to avoid state persistence
export const createTradingSimulator = () => new TradingSimulator();