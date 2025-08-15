// Mock token data
const tokens = [
  {
    id: 1,
    symbol: "BTC",
    name: "Bitcoin",
    price: 29150,
    priceChange24h: 2.3,
    marketCap: 567000000000,
    volume24h: 21000000000,
    holders: 950000,
    safetyScore: 9,
    age: 547500, // minutes (about 1 year)
    lpBurned: true,
    renounced: true,
    honeypotCheck: true,
    platform: "Bitcoin",
    chain: "mainnet",
    category: "top",
  },
  {
    id: 2,
    symbol: "ETH",
    name: "Ethereum",
    price: 1820,
    priceChange24h: -1.1,
    marketCap: 218000000000,
    volume24h: 9800000000,
    holders: 1200000,
    safetyScore: 8,
    age: 262800, // minutes (about 6 months)
    lpBurned: false,
    renounced: true,
    honeypotCheck: true,
    platform: "Ethereum",
    chain: "mainnet",
    category: "top",
  },
  {
    id: 3,
    symbol: "BNB",
    name: "Binance Coin",
    price: 243,
    priceChange24h: 0.5,
    marketCap: 37900000000,
    volume24h: 1500000000,
    holders: 870000,
    safetyScore: 8,
    age: 105120, // minutes (about 2 months)
    lpBurned: true,
    renounced: false,
    honeypotCheck: true,
    platform: "Binance Smart Chain",
    chain: "mainnet",
    category: "exchange",
  },
  // Add more tokens as needed
];

export default tokens;
