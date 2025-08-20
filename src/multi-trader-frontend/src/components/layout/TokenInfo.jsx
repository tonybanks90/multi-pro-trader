import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Shield, Flame, Clock, Users, DollarSign } from 'lucide-react';
import { useLanguage } from '../../services/i18n/LanguageContext';

export default function TokenInfo({ token }) {
  const { t } = useLanguage();

  const formatNumber = (value, prefix = '$') => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000000000) {
      return `${prefix}${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `${prefix}${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${prefix}${(num / 1000).toFixed(1)}K`;
    }
    return `${prefix}${num.toFixed(2)}`;
  };

  const formatAge = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) {
      return `${Math.floor(minutes / 60)}h`;
    } else {
      return `${Math.floor(minutes / 1440)}d`;
    }
  };

  const getSafetyScore = (score) => {
    if (score >= 8) return { label: 'Safe', color: 'bg-primary/20 text-primary border-primary/30' };
    if (score >= 6) return { label: 'Medium', color: 'bg-warning/20 text-warning border-warning/30' };
    return { label: 'Risky', color: 'bg-destructive/20 text-destructive border-destructive/30' };
  };

  const safetyInfo = getSafetyScore(token.safetyScore);
  const socialLinks = token.socialLinks ? JSON.parse(token.socialLinks) : {};

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Token Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Token Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Price
            </p>
            <p className="font-semibold text-lg" data-testid="text-token-price">
              ${parseFloat(token.price).toFixed(6)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Flame className="w-3 h-3" />
              24h Change
            </p>
            <p
              className={`font-semibold text-lg ${
                parseFloat(token.priceChange24h) >= 0 ? 'text-primary' : 'text-destructive'
              }`}
              data-testid="text-price-change"
            >
              {parseFloat(token.priceChange24h) >= 0 ? '+' : ''}
              {token.priceChange24h}%
            </p>
          </div>
        </div>

        <Separator />

        {/* Market Data */}
        <div className="space-y-4">
          <h4 className="font-semibold">Market Data</h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Market Cap</span>
              <span className="font-medium" data-testid="text-info-market-cap">
                {formatNumber(token.marketCap)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">24h Volume</span>
              <span className="font-medium" data-testid="text-info-volume">
                {formatNumber(token.volume24h)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Liquidity</span>
              <span className="font-medium" data-testid="text-liquidity">
                {formatNumber((parseFloat(token.marketCap) * 0.1).toString())}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Supply</span>
              <span className="font-medium" data-testid="text-supply">
                {formatNumber((parseFloat(token.marketCap) / parseFloat(token.price)).toString(), '')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                Holders
              </span>
              <span className="font-medium" data-testid="text-info-holders">
                {token.holders.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Age
              </span>
              <span className="font-medium" data-testid="text-token-age">
                {formatAge(token.age)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Safety Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Safety Score</h4>
            <Badge className={safetyInfo.color} data-testid="badge-safety-score">
              {token.safetyScore}/10 - {safetyInfo.label}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">LP Burned</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  token.lpBurned ? 'bg-primary' : 'bg-destructive'
                }`}
                data-testid="indicator-lp-burned"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Contract Renounced</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  token.renounced ? 'bg-primary' : 'bg-warning'
                }`}
                data-testid="indicator-renounced"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Honeypot Check</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  token.honeypotCheck ? 'bg-primary' : 'bg-destructive'
                }`}
                data-testid="indicator-honeypot"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Contract & Social */}
        <div className="space-y-4">
          <h4 className="font-semibold">Contract & Social</h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Platform</span>
              <Badge variant="outline" data-testid="text-platform">
                {token.platform}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Chain</span>
              <Badge variant="outline" data-testid="text-chain">
                {token.chain}
              </Badge>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Contract Address</span>
              <div
                className="bg-muted p-2 rounded text-xs font-mono break-all"
                data-testid="text-contract-address"
              >
                {token.address}
              </div>
            </div>

            {Object.keys(socialLinks).length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Social Links</span>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.twitter && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="link-twitter"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Twitter
                      </a>
                    </Button>
                  )}
                  {socialLinks.telegram && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={socialLinks.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="link-telegram"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Telegram
                      </a>
                    </Button>
                  )}
                  {socialLinks.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="link-website"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
