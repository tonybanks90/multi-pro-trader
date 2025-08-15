import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Settings, ChevronDown, Zap, Shield } from 'lucide-react';
import { useLanguage } from '../../services/i18n/LanguageContext';

export default function TradingPanel({ token }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [solAmount, setSolAmount] = useState('');
  const [slippage, setSlippage] = useState([1]);
  const [gasPrice, setGasPrice] = useState([2]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoSlippage, setAutoSlippage] = useState(true);
  const [mevProtection, setMevProtection] = useState(true);

  const tokenPrice = parseFloat(token.price);
  const estimatedTokens = amount ? (parseFloat(amount) / tokenPrice) : 0;
  const estimatedSol = solAmount ? (parseFloat(solAmount) * tokenPrice) : 0;

  const handleQuickAmount = (percentage) => {
    const walletBalance = 10;
    const quickAmount = (walletBalance * percentage / 100).toString();
    setAmount(quickAmount);
  };

  const handleTrade = () => {
    console.log(`${activeTab.toUpperCase()} ${amount || solAmount} tokens`);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Trade
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="buy"
              className="text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid="tab-buy"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className="text-destructive data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
              data-testid="tab-sell"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buy-amount">Amount (SOL)</Label>
                <div className="relative">
                  <Input
                    id="buy-amount"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pr-16"
                    data-testid="input-buy-amount"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    SOL
                  </span>
                </div>

                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((percentage) => (
                    <Button
                      key={percentage}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(percentage)}
                      className="flex-1"
                      data-testid={`button-quick-${percentage}`}
                    >
                      {percentage}%
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">You'll receive approximately:</span>
                  <span className="font-semibold" data-testid="text-estimated-tokens">
                    {estimatedTokens.toLocaleString()} {token.symbol}
                  </span>
                </div>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleTrade}
                disabled={!amount}
                data-testid="button-buy-token"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Buy {token.symbol}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sell-amount">Amount ({token.symbol})</Label>
                <div className="relative">
                  <Input
                    id="sell-amount"
                    type="number"
                    placeholder="0.0"
                    value={solAmount}
                    onChange={(e) => setSolAmount(e.target.value)}
                    className="pr-20"
                    data-testid="input-sell-amount"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    {token.symbol}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">You'll receive approximately:</span>
                  <span className="font-semibold" data-testid="text-estimated-sol">
                    {estimatedSol.toFixed(4)} SOL
                  </span>
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleTrade}
                disabled={!solAmount}
                data-testid="button-sell-token"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Sell {token.symbol}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto"
              data-testid="button-toggle-advanced"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced Settings
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Slippage Tolerance</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoSlippage}
                    onCheckedChange={setAutoSlippage}
                    data-testid="switch-auto-slippage"
                  />
                  <span className="text-sm text-muted-foreground">Auto</span>
                </div>
              </div>

              {!autoSlippage && (
                <div className="space-y-2">
                  <Slider
                    value={slippage}
                    onValueChange={setSlippage}
                    max={20}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                    data-testid="slider-slippage"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.1%</span>
                    <span className="font-semibold">{slippage[0]}%</span>
                    <span>20%</span>
                  </div>
                </div>
              )}

              {autoSlippage && (
                <div className="p-2 bg-muted rounded text-sm">
                  <Badge variant="outline" className="mb-1">Auto: 1.5%</Badge>
                  <p className="text-muted-foreground">
                    Slippage will be automatically adjusted based on market conditions.
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Gas Price (Priority Fee)</Label>
              <Slider
                value={gasPrice}
                onValueChange={setGasPrice}
                max={10}
                min={1}
                step={1}
                className="w-full"
                data-testid="slider-gas-price"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Slow (1x)</span>
                <span className="font-semibold">{gasPrice[0]}x</span>
                <span>Fast (10x)</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <div>
                  <Label>MEV Protection</Label>
                  <p className="text-xs text-muted-foreground">
                    Protect against front-running attacks
                  </p>
                </div>
              </div>
              <Switch
                checked={mevProtection}
                onCheckedChange={setMevProtection}
                data-testid="switch-mev-protection"
              />
            </div>

            {mevProtection && (
              <div className="p-2 bg-primary/10 border border-primary/20 rounded text-sm">
                <Badge className="bg-primary/20 text-primary border-primary/30 mb-1">
                  Protected
                </Badge>
                <p className="text-muted-foreground">
                  Your transaction will be protected from MEV attacks with additional validation.
                </p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Current Price</span>
            <span className="font-semibold" data-testid="text-current-token-price">
              ${tokenPrice.toFixed(6)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">24h Change</span>
            <span
              className={`font-semibold ${
                parseFloat(token.priceChange24h) >= 0 ? 'text-primary' : 'text-destructive'
              }`}
              data-testid="text-trading-price-change"
            >
              {parseFloat(token.priceChange24h) >= 0 ? '+' : ''}
              {token.priceChange24h}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
