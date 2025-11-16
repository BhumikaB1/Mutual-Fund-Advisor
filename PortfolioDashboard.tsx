import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TrendingUp, TrendingDown, ArrowLeft, MessageSquare, BarChart3, DollarSign, Target, Search } from 'lucide-react';
import { FundCard } from './FundCard';
import { QueryBot } from './QueryBot';
import { ComparisonView } from './ComparisonView';
import { FundExplorer } from './FundExplorer';

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

interface PortfolioData {
  pan: string;
  funds: Fund[];
  totalInvestedAmount: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  fetchedAt: string;
}

interface PortfolioDashboardProps {
  data: PortfolioData;
  onReset: () => void;
}

export function PortfolioDashboard({ data, onReset }: PortfolioDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);

  const totalPLPercentage = ((data.totalProfitLoss / data.totalInvestedAmount) * 100).toFixed(2);
  const isProfit = data.totalProfitLoss >= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (selectedFund) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setSelectedFund(null)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
          <FundCard fund={selectedFund} pan={data.pan} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="mb-1">My Mutual Fund Portfolio</h1>
              <p className="text-blue-100">PAN: {data.pan}</p>
            </div>
            <Button
              variant="outline"
              onClick={onReset}
              className="bg-white text-blue-600 hover:bg-blue-50 border-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change PAN
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 bg-white/10 backdrop-blur-sm text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <div className="text-sm opacity-90">Total Invested</div>
                </div>
                <div>{formatCurrency(data.totalInvestedAmount)}</div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/10 backdrop-blur-sm text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4" />
                  <div className="text-sm opacity-90">Current Value</div>
                </div>
                <div>{formatCurrency(data.totalCurrentValue)}</div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/10 backdrop-blur-sm text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {isProfit ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <div className="text-sm opacity-90">Total P/L</div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span>{formatCurrency(Math.abs(data.totalProfitLoss))}</span>
                  <span className="text-sm">({totalPLPercentage}%)</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/10 backdrop-blur-sm text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <div className="text-sm opacity-90">Total Funds</div>
                </div>
                <div>{data.funds.length} Schemes</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
            <TabsTrigger value="explore">
              <Search className="w-4 h-4 mr-2" />
              Explore Funds
            </TabsTrigger>
            <TabsTrigger value="comparison">Benchmark Comparison</TabsTrigger>
            <TabsTrigger value="query">
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask Bot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              {data.funds.map((fund) => (
                <Card 
                  key={fund.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedFund(fund)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-gray-900 mb-1">{fund.fundName}</h3>
                            <p className="text-sm text-gray-600">{fund.amc} • Folio: {fund.folio}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="whitespace-nowrap">
                              {fund.category}
                            </Badge>
                            <Badge 
                              variant={fund.profitLoss >= 0 ? "default" : "destructive"}
                              className={fund.profitLoss >= 0 ? "bg-green-600" : ""}
                            >
                              {fund.profitLoss >= 0 ? '+' : ''}{fund.profitLossPercentage.toFixed(2)}%
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <div className="text-sm text-gray-600">Current Value</div>
                            <div className="text-gray-900">{formatCurrency(fund.currentValue)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Invested</div>
                            <div className="text-gray-900">{formatCurrency(fund.investedAmount)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">XIRR</div>
                            <div className="text-gray-900">{fund.xirr}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Rating</div>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-gray-900">{fund.rating}/5</span>
                              <span className="text-sm text-gray-600">({fund.rank})</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-sm">View Details</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="explore">
            <FundExplorer />
          </TabsContent>

          <TabsContent value="comparison">
            <ComparisonView funds={data.funds} pan={data.pan} />
          </TabsContent>

          <TabsContent value="query">
            <QueryBot pan={data.pan} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Disclaimer */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-900">
              <strong>Disclaimer:</strong> This analysis is for educational purposes only and does not constitute financial advice. 
              Please consult with a certified financial advisor before making investment decisions. Past performance does not guarantee future results.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
