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
import tokens from '../data/data'; // ✅ import mock tokens array

export default function TokenDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  const { data: token, isLoading, error } = useQuery({
    queryKey: ['/api/tokens', id],
    queryFn: async () => {
      // Simulate delay
      await new Promise((res) => setTimeout(res, 500));
      // Find token in mock data
      return tokens.find((t) => t.id.toString() === id);
    },
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
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-8 w-48" />
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
            <AlertDescription>Token not found.</AlertDescription>
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
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              {token.symbol.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{token.name}</h1>
              <p className="text-muted-foreground">${token.symbol} • {token.platform}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <TokenChart token={token} />
            <TokenTabs token={token} />
          </div>
          <div className="space-y-6">
            <TokenInfo token={token} />
            <TradingPanel token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}
