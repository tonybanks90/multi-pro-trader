import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Clock, DollarSign, Users, Target } from 'lucide-react';
import { useLanguage } from '../../services/i18n/LanguageContext';

// Mock data for demonstration - in real app this would come from API
const mockTrades = [
  {
    id: 1,
    type: 'buy',
    amount: 1250.0,
    price: 0.00245,
    tokens: 510204,
    time: '2 min ago',
    wallet: 'H3k9...x7mP',
  },
  {
    id: 2,
    type: 'sell',
    amount: 850.0,
    price: 0.00241,
    tokens: 352697,
    time: '5 min ago',
    wallet: 'A9j2...k5nQ',
  },
  {
    id: 3,
    type: 'buy',
    amount: 2100.0,
    price: 0.00243,
    tokens: 864197,
    time: '8 min ago',
    wallet: 'K7s4...m2bV',
  },
];

const mockHolders = [
  {
    id: 1,
    wallet: 'H3k9...x7mP',
    balance: 5250000,
    percentage: 12.5,
    value: 12812.5,
  },
  {
    id: 2,
    wallet: 'A9j2...k5nQ',
    balance: 3750000,
    percentage: 8.9,
    value: 9187.5,
  },
  {
    id: 3,
    wallet: 'K7s4...m2bV',
    balance: 2100000,
    percentage: 5.0,
    value: 5145.0,
  },
];

export default function TokenTabs({ token }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('trades');

  const formatNumber = (value, prefix = '') => {
    if (value >= 1000000) {
      return `${prefix}${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${prefix}${(value / 1000).toFixed(1)}K`;
    }
    return `${prefix}${value.toFixed(2)}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="trades"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              data-testid="tab-trades"
            >
              Trades
            </TabsTrigger>
            <TabsTrigger
              value="holders"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              data-testid="tab-holders"
            >
              Holders
            </TabsTrigger>
            <TabsTrigger
              value="position"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              data-testid="tab-position"
            >
              My Position
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trades" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent Trades</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" data-testid="button-filter-all">
                  All
                </Button>
                <Button variant="ghost" size="sm" data-testid="button-filter-buys">
                  Buys
                </Button>
                <Button variant="ghost" size="sm" data-testid="button-filter-sells">
                  Sells
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Wallet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTrades.map((trade) => (
                    <TableRow key={trade.id} data-testid={`row-trade-${trade.id}`}>
                      <TableCell>
                        <Badge
                          variant={trade.type === 'buy' ? 'default' : 'destructive'}
                          className={
                            trade.type === 'buy'
                              ? 'bg-primary/20 text-primary border-primary/30'
                              : 'bg-destructive/20 text-destructive border-destructive/30'
                          }
                        >
                          {trade.type === 'buy' ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {trade.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">${formatNumber(trade.amount)}</TableCell>
                      <TableCell className="font-mono">${trade.price.toFixed(6)}</TableCell>
                      <TableCell className="font-mono">{formatNumber(trade.tokens)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {trade.time}
                      </TableCell>
                      <TableCell className="font-mono">{trade.wallet}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="holders" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Top Holders</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Total: {token.holders.toLocaleString()} holders
                </span>
              </div>
            </div>

            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Share</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHolders.map((holder, index) => (
                    <TableRow key={holder.id} data-testid={`row-holder-${holder.id}`}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell className="font-mono">{holder.wallet}</TableCell>
                      <TableCell className="font-mono">{formatNumber(holder.balance)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.min(holder.percentage * 8, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{holder.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">${formatNumber(holder.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="position" className="p-6 space-y-4">
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Position</h3>
              <p className="text-muted-foreground mb-6">
                You don't have any position in this token yet. Start trading to see your positions here.
              </p>
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-start-trading">
                <DollarSign className="w-4 h-4 mr-2" />
                Start Trading
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
