import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { useLanguage } from '../services/i18n/LanguageContext';
import TokenChart from '../components/layout/TokenChart';
import TokenInfo from '../components/layout/TokenInfo';
import TokenTabs from '../components/layout/TokenTabs';
import TradingPanel from '../components/layout/TradingPanel';

export default function TokenDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  const { data: token, isLoading, error } = useQuery({
    queryKey: ['/api/tokens', id],
    enabled: !!id,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load token details. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-32 mb-4" />
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <Skeleton className="h-96 w-full mb-6" />
              <Skeleton className="h-80 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Token not found.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              {token.symbol.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-token-name">
                {token.name}
              </h1>
              <p className="text-muted-foreground" data-testid="text-token-symbol">
                ${token.symbol} • {token.platform}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Chart and Tabs */}
          <div className="xl:col-span-3 space-y-6">
            <TokenChart token={token} />
            <TokenTabs token={token} />
          </div>

          {/* Right Column - Token Info and Trading */}
          <div className="space-y-6">
            <TokenInfo token={token} />
            <TradingPanel token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}
