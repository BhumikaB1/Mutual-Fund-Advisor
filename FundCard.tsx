import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, AlertTriangle, Loader2, Building2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { FundHoldings } from './FundHoldings';

interface Fund {
  id: string;
  fundName: string;
  category: string;
  folio: string;
  amc: string;
  units: number;
  currentNav: number;
  purchaseDate: string;
  purchaseNav: number;
  riskLevel: string;
  exitLoad: string;
  currentValue: number;
  investedAmount: number;
  profitLoss: number;
  profitLossPercentage: number;
  xirr: string;
  cagr: string;
  rating: number;
  rank: string;
  rollingReturns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
  tax: {
    isLongTerm: boolean;
    taxRate: number;
    estimatedTax: string;
  };
  transactions: Array<{
    date: string;
    amount: number;
    units: number;
    nav: number;
  }>;
  historicalReturns: number[];
}

interface FundCardProps {
  fund: Fund;
  pan: string;
}

interface Evaluation {
  recommendation: string;
  reasoning: string[];
  metrics: {
    rating: number;
    rank: string;
    avgReturn: string;
    volatility: string;
    consistencyScore: string;
    benchmarkReturn: string;
    outperformsBenchmark: boolean;
  };
}

export function FundCard({ fund, pan }: FundCardProps) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const fetchEvaluation = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fa862965/evaluate-fund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ fundId: fund.id, pan })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch evaluation');
      }

      const data = await response.json();
      setEvaluation(data);
    } catch (error) {
      console.error('Error fetching evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, [fund.id]);

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'BUY': return 'bg-green-600';
      case 'HOLD': return 'bg-yellow-600';
      case 'EXIT': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'BUY': return <CheckCircle2 className="w-5 h-5" />;
      case 'HOLD': return <AlertTriangle className="w-5 h-5" />;
      case 'EXIT': return <AlertCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="mb-2">{fund.fundName}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{fund.category}</Badge>
                <Badge variant="outline">{fund.riskLevel}</Badge>
                <Badge className={fund.profitLoss >= 0 ? "bg-green-600" : "bg-red-600"}>
                  {fund.profitLoss >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {fund.profitLoss >= 0 ? '+' : ''}{fund.profitLossPercentage.toFixed(2)}%
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-500 mb-1">
                <span>★</span>
                <span>{fund.rating}/5</span>
              </div>
              <div className="text-sm text-gray-600">{fund.rank}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Current Value</div>
              <div className="text-gray-900">{formatCurrency(fund.currentValue)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Invested Amount</div>
              <div className="text-gray-900">{formatCurrency(fund.investedAmount)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Profit/Loss</div>
              <div className={fund.profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                {formatCurrency(Math.abs(fund.profitLoss))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Units Held</div>
              <div className="text-gray-900">{fund.units.toFixed(3)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Card */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Analyzing fund performance...</p>
          </CardContent>
        </Card>
      ) : evaluation ? (
        <Card className={`border-2 ${
          evaluation.recommendation === 'BUY' ? 'border-green-500 bg-green-50' :
          evaluation.recommendation === 'HOLD' ? 'border-yellow-500 bg-yellow-50' :
          'border-red-500 bg-red-50'
        }`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${getRecommendationColor(evaluation.recommendation)} text-white`}>
                {getRecommendationIcon(evaluation.recommendation)}
              </div>
              <div>
                <CardTitle>Recommendation: {evaluation.recommendation}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Based on comprehensive analysis and market comparison
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-900 mb-2">Key Reasons:</h4>
                <ul className="space-y-2">
                  {evaluation.reasoning.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Avg Return</div>
                  <div className="text-gray-900">{evaluation.metrics.avgReturn}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Volatility</div>
                  <div className="text-gray-900">{evaluation.metrics.volatility}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Consistency Score</div>
                  <div className="text-gray-900">{evaluation.metrics.consistencyScore}/100</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Benchmark (Nifty 50)</div>
                  <div className="text-gray-900">{evaluation.metrics.benchmarkReturn}%</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Performance</div>
                  <Badge className={evaluation.metrics.outperformsBenchmark ? "bg-green-600" : "bg-red-600"}>
                    {evaluation.metrics.outperformsBenchmark ? 'Outperforms' : 'Underperforms'} Benchmark
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Detailed Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="performance">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
              <TabsTrigger value="holdings">
                <Building2 className="w-4 h-4 mr-2" />
                Holdings
              </TabsTrigger>
              <TabsTrigger value="tax">Tax</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current NAV</div>
                  <div className="text-gray-900">₹{fund.currentNav.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Purchase NAV</div>
                  <div className="text-gray-900">₹{fund.purchaseNav.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">NAV Growth</div>
                  <div className={fund.currentNav > fund.purchaseNav ? "text-green-600" : "text-red-600"}>
                    {((fund.currentNav - fund.purchaseNav) / fund.purchaseNav * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">XIRR</div>
                  <div className="text-gray-900">{fund.xirr}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">CAGR</div>
                  <div className="text-gray-900">{fund.cagr}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">First Investment</div>
                  <div className="text-gray-900">{formatDate(fund.purchaseDate)}</div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Exit Load:</strong> {fund.exitLoad}
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="returns" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">1 Year Return</div>
                  <div className="text-gray-900">{fund.rollingReturns.oneYear.toFixed(2)}%</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">3 Year Return</div>
                  <div className="text-gray-900">{fund.rollingReturns.threeYear.toFixed(2)}%</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">5 Year Return</div>
                  <div className="text-gray-900">{fund.rollingReturns.fiveYear.toFixed(2)}%</div>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 mb-3">Historical Returns (Yearly)</h4>
                <div className="grid grid-cols-5 gap-2">
                  {fund.historicalReturns.map((ret, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded text-center">
                      <div className="text-xs text-gray-600 mb-1">Year {index + 1}</div>
                      <div className={ret > 0 ? "text-green-600" : "text-red-600"}>
                        {ret > 0 ? '+' : ''}{ret.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="holdings">
              <FundHoldings fundId={fund.id} fundName={fund.fundName} pan={pan} />
            </TabsContent>

            <TabsContent value="tax" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Holding Type</div>
                  <Badge className={fund.tax.isLongTerm ? "bg-green-600" : "bg-orange-600"}>
                    {fund.tax.isLongTerm ? 'Long Term' : 'Short Term'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tax Rate</div>
                  <div className="text-gray-900">{fund.tax.taxRate}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Estimated Tax (on Exit)</div>
                  <div className="text-gray-900">₹{fund.tax.estimatedTax}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Post-Tax Gains</div>
                  <div className="text-green-600">
                    {formatCurrency(fund.profitLoss - parseFloat(fund.tax.estimatedTax))}
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>Tax Information:</strong><br/>
                  • LTCG (Long Term Capital Gains): Gains above ₹1,25,000 taxed at 12.5%<br/>
                  • STCG (Short Term Capital Gains): Taxed at 20%<br/>
                  • Holding period for equity funds: &gt;1 year for long term
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="transactions">
              <div className="space-y-3">
                {fund.transactions.map((txn, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-gray-900 mb-1">{formatDate(txn.date)}</div>
                      <div className="text-sm text-gray-600">
                        {txn.units.toFixed(3)} units @ ₹{txn.nav.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900">{formatCurrency(txn.amount)}</div>
                      <div className="text-xs text-gray-600">Invested</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}