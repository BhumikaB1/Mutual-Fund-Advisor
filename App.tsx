import { useState } from 'react';
import { PANInput } from './components/PANInput';
import { PortfolioDashboard } from './components/PortfolioDashboard';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from './utils/supabase/info';

interface PortfolioData {
  pan: string;
  funds: any[];
  totalInvestedAmount: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  fetchedAt: string;
}

export default function App() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePANSubmit = async (pan: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fa862965/fetch-portfolio`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ pan })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch portfolio');
      }

      const data = await response.json();
      setPortfolioData(data);
      toast.success('Portfolio fetched successfully!', {
        description: `Found ${data.funds.length} mutual fund schemes`
      });
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
      setError(err.message || 'Failed to fetch portfolio. Please try again.');
      toast.error('Error', {
        description: err.message || 'Failed to fetch portfolio'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPortfolioData(null);
    setError(null);
  };

  return (
    <>
      {!portfolioData ? (
        <PANInput 
          onSubmit={handlePANSubmit}
          loading={loading}
          error={error}
        />
      ) : (
        <PortfolioDashboard 
          data={portfolioData}
          onReset={handleReset}
        />
      )}
      <Toaster />
    </>
  );
}
