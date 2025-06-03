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
        winRate: 55,
        totalTrades: 0,
        avgReturn: 0.5,
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

  private getThresholds() {
    const baseBuyThreshold = 0.45;
    const baseSellThreshold = 0.55;
    
    const bandAdjustment = (0.5 - this.riskAppetite) * 0.08;
    
    const timeFactor = new Date().getSeconds() / 60;
    const timeVariation = Math.sin(timeFactor * Math.PI * 2) * 0.05;
    
    return {
      buyThreshold: baseBuyThreshold - bandAdjustment + timeVariation,
      sellThreshold: baseSellThreshold + bandAdjustment - timeVariation
    };
  }

  private getPositionSize(): number {
    const baseSize = 0.3 + (this.riskAppetite - 0.5) * 0.2;
    const variation = 0.95 + Math.random() * 0.1;
    return Math.min(0.5, baseSize * variation);
  }

  private checkStopLoss(currentPrice: number): boolean {
    if (this.state.btcHoldings === 0) return false;
    
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
      
      const adjustedStopLoss = this.stopLossPercent * (2 - this.riskAppetite);
      return currentLoss < -adjustedStopLoss;
    }
    
    return false;
  }

  private updateMetrics() {
    const trades = this.state.trades;
    if (trades.length === 0) return;
    
    let wins = 0;
    let totalReturns = 0;
    
    const roundTrips: Array<{buyPrice: number, sellPrice: number, buyTime: Date, sellTime: Date}> = [];
    const pendingBuys: TradeRecord[] = [];
    
    for (const trade of trades) {
      if (trade.action === 'BUY') {
        pendingBuys.push(trade);
      } else if (trade.action === 'SELL' && pendingBuys.length > 0) {
        const buyTrade = pendingBuys.shift()!;
        const buyTotal = buyTrade.price * buyTrade.amount;
        const sellTotal = trade.price * trade.amount;
        const netReturn = (sellTotal - buyTotal) / buyTotal;
        totalReturns += netReturn;
        
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
    
    this.peakValue = Math.max(this.peakValue, this.state.totalValue);
    const currentDrawdown = (this.peakValue - this.state.totalValue) / this.peakValue;
    
    let estimatedWinRate = this.state.metrics.winRate;
    let estimatedAvgReturn = this.state.metrics.avgReturn;
    
    if (completedTrades > 0) {
      estimatedWinRate = (wins / completedTrades) * 100;
      estimatedAvgReturn = (totalReturns / completedTrades) * 100;
    } else if (trades.length > 0 && pendingBuys.length > 0) {
      const unrealizedReturn = this.state.pnlPercent;
      estimatedWinRate = unrealizedReturn > 0 ? 55 : 45;
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
    
    const canTrade = !this.state.lastTradeTime || 
      (now.getTime() - this.state.lastTradeTime.getTime()) >= this.minTimeBetweenTrades;

    let action: 'BUY' | 'HOLD' | 'SELL' = 'HOLD';
    
    if (!canTrade) {
      this.state.totalValue = this.state.balance + (this.state.btcHoldings * currentPrice);
      this.state.pnl = this.state.totalValue - this.initialBalance;
      this.state.pnlPercent = (this.state.pnl / this.initialBalance) * 100;
      return { ...this.state };
    }
    
    if (this.state.btcHoldings === 0 && this.state.balance > 100) {
      if (sentiment < 0.45) {
        action = 'BUY';
      }
    } else if (this.state.btcHoldings > 0) {
      if (sentiment > 0.55) {
        action = 'SELL';
      }
    }

    this.state.currentAction = action;

    if (this.checkStopLoss(currentPrice) && canTrade && this.state.btcHoldings > 0) {
      const sellAmount = this.state.btcHoldings;
      
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
    } else if (canTrade && action !== 'HOLD') {
      if (action === 'BUY') {
        const positionSize = this.getPositionSize();
        const spendAmount = this.state.balance * positionSize;
        
        const slippage = 1 + this.slippageFactor;
        const actualPrice = currentPrice * slippage;
        
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
        const sellAmount = this.state.btcHoldings;
        
        const slippage = 1 - this.slippageFactor;
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
      }
    }

    this.state.totalValue = this.state.balance + (this.state.btcHoldings * currentPrice);
    this.state.pnl = this.state.totalValue - this.initialBalance;
    this.state.pnlPercent = (this.state.pnl / this.initialBalance) * 100;

    this.updateMetrics();

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
        winRate: 55,
        totalTrades: 0,
        avgReturn: 0.5,
        maxDrawdown: 0,
        currentDrawdown: 0
      }
    };
    this.peakValue = this.initialBalance;
    this.entryPrices.clear();
  }

  backtest(historicalData: HistoricalDataPoint[]): TradingState {
    this.reset();
    
    const sortedData = [...historicalData].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    for (let i = 0; i < sortedData.length; i++) {
      const dataPoint = sortedData[i];
      
      if (i % 1 === 0) {
        this.evaluateTrade(dataPoint.sentiment, dataPoint.price, dataPoint.timestamp);
      }
    }
    
    if (sortedData.length > 0) {
      const lastPrice = sortedData[sortedData.length - 1].price;
      this.state.totalValue = this.state.balance + (this.state.btcHoldings * lastPrice);
      this.state.pnl = this.state.totalValue - this.initialBalance;
      this.state.pnlPercent = (this.state.pnl / this.initialBalance) * 100;
      this.updateMetrics();
    }
    
    return { ...this.state };
  }
}

export const createTradingSimulator = () => new TradingSimulator();