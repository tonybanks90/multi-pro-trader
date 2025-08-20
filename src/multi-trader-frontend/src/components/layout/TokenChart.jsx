import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../services/themes/ThemeContext';
import { useLanguage } from '../../services/i18n/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock chart data for demonstration - in real app this would come from API
const generateChartData = (currentPrice) => {
  const price = parseFloat(currentPrice);
  const data = [];
  const baseTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
  
  for (let i = 0; i < 100; i++) {
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    const timestamp = baseTime + (i * 24 * 60 * 60 * 1000 / 100);
    data.push({
      time: new Date(timestamp).toLocaleTimeString(),
      price: price * (1 + variation * (i / 100)),
      volume: Math.random() * 100000 + 10000
    });
  }
  
  return data;
};

export default function TokenChart({ token }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState('1D');
  
  const chartData = generateChartData(token.price);
  const priceChange = parseFloat(token.priceChange24h);
  const isPositive = priceChange >= 0;
  
  const timeframes = ['15M', '1H', '4H', '1D', '1W'];

  const formatPrice = (value) => {
    if (value < 0.01) {
      return `$${value.toFixed(6)}`;
    }
    return `$${value.toFixed(4)}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Price Chart</CardTitle>
          <div className="flex items-center gap-2">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className="h-8 px-3"
                data-testid={`button-timeframe-${tf}`}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" data-testid="text-current-price">
              {formatPrice(parseFloat(token.price))}
            </span>
            <Badge 
              variant={isPositive ? 'default' : 'destructive'}
              className={`flex items-center gap-1 ${
                isPositive 
                  ? 'bg-primary/20 text-primary border-primary/30' 
                  : 'bg-destructive/20 text-destructive border-destructive/30'
              }`}
              data-testid="badge-price-change"
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(priceChange).toFixed(2)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))'} 
                opacity={0.3}
              />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                stroke={theme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))'}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke={theme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))'}
                tickFormatter={formatPrice}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? 'hsl(var(--card))' : 'hsl(var(--card))',
                  border: `1px solid ${theme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))'}`,
                  borderRadius: '8px',
                  color: theme === 'dark' ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'
                }}
                formatter={(value) => [formatPrice(value), 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositive ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Volume 24h</p>
            <p className="font-semibold" data-testid="text-volume">
              ${parseFloat(token.volume24h).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="font-semibold" data-testid="text-market-cap">
              ${parseFloat(token.marketCap).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Holders</p>
            <p className="font-semibold" data-testid="text-holders">
              {token.holders.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
