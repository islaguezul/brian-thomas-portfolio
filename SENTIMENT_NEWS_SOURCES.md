# Trading Bot News Sources

This document contains all the RSS feeds and data sources used by the trading bot for sentiment analysis.

## Global RSS Feeds
*Used for Model 1 sentiment analysis (global themes like tariffs, regulation, etc.)*

```
https://www.coindesk.com/arc/outboundfeeds/rss/
https://cointelegraph.com/rss
https://decrypt.co/feed
https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664
https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000113
http://feeds.bbci.co.uk/news/business/rss.xml
https://ir.thomsonreuters.com/rss/news-releases.xml?items=15
https://www.sec.gov/news/pressreleases.rss
https://www.federalreserve.gov/feeds/press_all.xml
```

## Coin-Specific RSS Feeds
*Used for Model 2 sentiment analysis (coin-specific news)*

### Bitcoin (BTC)
```
https://bitcoinmagazine.com/feed
https://feeds.bitcoinist.com/bitcoinist
```

### Ethereum (ETH)
```
https://blog.ethereum.org/feed.xml
https://ethhub.substack.com/feed
```

### Solana (SOL)
```
No specific feeds configured - falls back to global feeds with keyword filtering
```

## Additional Data Sources

### Fear & Greed Index API
```
https://api.alternative.me/fng/?limit=1
```

## How These Sources Are Used

### Model 1 (Global Sentiment - VADER Analysis)
- Uses **Global RSS Feeds**
- Filters for Trump/crypto context keywords
- Analyzes sentiment for themes: tariffs, regulation, reserves, Fed policy
- Lookback period: 1 hour (configurable)

### Model 2 (Coin-Specific Sentiment - LLM Analysis)
- Prioritizes **Coin-Specific RSS Feeds** for each coin
- Falls back to **Global RSS Feeds** with keyword filtering if needed
- Uses OpenAI GPT for sentiment analysis
- Target: 10 headlines per coin (configurable)

### Keywords Used for Filtering

#### Trump Context Keywords
```
trump, donald, president, white house, administration
```

#### Crypto Context Keywords
```
bitcoin, btc, crypto, cryptocurrency, digital asset, ethereum, eth, blockchain, coinbase, binance
```

#### Global Theme Keywords
- **Tariff**: tariff, trade war, import duty, sanction, trade deal
- **Regulation**: regulation, sec, cftc, crypto law, stablecoin bill, sab 121, legislation, guidance, enforcement
- **Reserve**: reserve, bitcoin reserve, national stockpile, digital asset reserve
- **Fed**: federal reserve, fed, interest rate, powell, monetary policy, fomc

## Configuration Notes

- All feeds are validated for proper URL format before use
- Fallback to global feeds is enabled for coin-specific analysis
- RSS lookback period: 1 hour (3600 seconds) for global, 3 hours for coin-specific
- Invalid or unreachable feeds are automatically filtered out
- Duplicate headlines are removed across different feeds