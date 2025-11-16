import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingUp, TrendingDown, Loader2, Award } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Fund {
  id: string;
  fundName: string;
  category: string;
  xirr: string;
  cagr: string;
  profitLoss: number;
  profitLossPercentage: number;
  historicalReturns: number[];
  rating: number;
  rank: string;
}

interface MarketData {
  nifty50: {
    value: number;
    change: number;
    changePercent: number;
    returns: {
      oneYear: number;
      threeYear: number;
      fiveYear: number;
    };
  };
  sensex30: {
    value: number;
    change: number;
    changePercent: number;
    returns: {
      oneYear: number;
      threeYear: number;
      fiveYear: number;
    };
  };
}

interface ComparisonViewProps {
  funds: Fund[];
  pan: string;
}

export function ComparisonView({ funds, pan }: ComparisonViewProps) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fa862965/market-data`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }

      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageReturn = (fund: Fund) => {
    return fund.historicalReturns.reduce((a, b) => a + b, 0) / fund.historicalReturns.length;
  };

  const getBestFund = () => {
    return funds.reduce((best, fund) => 
      parseFloat(fund.xirr) > parseFloat(best.xirr) ? fund : best
    );
  };

  const getWorstFund = () => {
    return funds.reduce((worst, fund) => 
      parseFloat(fund.xirr) < parseFloat(worst.xirr) ? fund : worst
    );
  };

  const calculatePortfolioAverage = (period: 'oneYear' | 'threeYear' | 'fiveYear') => {
    const avg = funds.reduce((sum, fund) => {
      const returns = fund.historicalReturns;
      const periodReturns = period === 'oneYear' ? returns.slice(0, 1) :
                           period === 'threeYear' ? returns.slice(0, 3) :
                           returns.slice(0, 5);
      return sum + (periodReturns.reduce((a, b) => a + b, 0) / periodReturns.length);
    }, 0) / funds.length;
    return avg;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading market data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!marketData) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-600">Unable to load market data. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  const bestFund = getBestFund();
  const worstFund = getWorstFund();

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>NIFTY 50</span>
              <Badge className={marketData.nifty50.changePercent >= 0 ? "bg-green-600" : "bg-red-600"}>
                {marketData.nifty50.changePercent >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {marketData.nifty50.changePercent >= 0 ? '+' : ''}{marketData.nifty50.changePercent}%
              </Badge>
            </CardTitle>
            <CardDescription>
              {marketData.nifty50.value.toLocaleString('en-IN')} 
              <span className={marketData.nifty50.change >= 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                {marketData.nifty50.change >= 0 ? '+' : ''}{marketData.nifty50.change.toFixed(2)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">1Y Return</div>
                <div className="text-gray-900">{marketData.nifty50.returns.oneYear}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">3Y Return</div>
                <div className="text-gray-900">{marketData.nifty50.returns.threeYear}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">5Y Return</div>
                <div className="text-gray-900">{marketData.nifty50.returns.fiveYear}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>SENSEX 30</span>
              <Badge className={marketData.sensex30.changePercent >= 0 ? "bg-green-600" : "bg-red-600"}>
                {marketData.sensex30.changePercent >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {marketData.sensex30.changePercent >= 0 ? '+' : ''}{marketData.sensex30.changePercent}%
              </Badge>
            </CardTitle>
            <CardDescription>
              {marketData.sensex30.value.toLocaleString('en-IN')}
              <span className={marketData.sensex30.change >= 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                {marketData.sensex30.change >= 0 ? '+' : ''}{marketData.sensex30.change.toFixed(2)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">1Y Return</div>
                <div className="text-gray-900">{marketData.sensex30.returns.oneYear}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">3Y Return</div>
                <div className="text-gray-900">{marketData.sensex30.returns.threeYear}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">5Y Return</div>
                <div className="text-gray-900">{marketData.sensex30.returns.fiveYear}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best and Worst Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              <CardTitle className="text-green-900">Best Performer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 mb-1">{bestFund.fundName}</div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">{bestFund.category}</Badge>
              <Badge className="bg-green-600">XIRR: {bestFund.xirr}%</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Rating</div>
                <div className="flex items-center gap-1 text-green-900">
                  <span className="text-yellow-500">★</span>
                  <span>{bestFund.rating}/5</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Rank</div>
                <div className="text-green-900">{bestFund.rank}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Needs Attention</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 mb-1">{worstFund.fundName}</div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">{worstFund.category}</Badge>
              <Badge className="bg-red-600">XIRR: {worstFund.xirr}%</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Rating</div>
                <div className="flex items-center gap-1 text-red-900">
                  <span className="text-yellow-500">★</span>
                  <span>{worstFund.rating}/5</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Rank</div>
                <div className="text-red-900">{worstFund.rank}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio vs Benchmarks</CardTitle>
          <CardDescription>
            Compare your portfolio performance against market indices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="nifty">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="nifty">vs NIFTY 50</TabsTrigger>
              <TabsTrigger value="sensex">vs SENSEX 30</TabsTrigger>
            </TabsList>

            <TabsContent value="nifty" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm text-gray-600">Fund Name</th>
                      <th className="text-right p-3 text-sm text-gray-600">XIRR</th>
                      <th className="text-right p-3 text-sm text-gray-600">NIFTY 50 (3Y)</th>
                      <th className="text-center p-3 text-sm text-gray-600">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funds.map((fund) => {
                      const fundReturn = calculateAverageReturn(fund);
                      const outperforms = fundReturn > marketData.nifty50.returns.threeYear;
                      return (
                        <tr key={fund.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="text-gray-900">{fund.fundName}</div>
                            <div className="text-sm text-gray-600">{fund.category}</div>
                          </td>
                          <td className="p-3 text-right text-gray-900">{fund.xirr}%</td>
                          <td className="p-3 text-right text-gray-900">{marketData.nifty50.returns.threeYear}%</td>
                          <td className="p-3 text-center">
                            <Badge className={outperforms ? "bg-green-600" : "bg-red-600"}>
                              {outperforms ? (
                                <>
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  +{(fundReturn - marketData.nifty50.returns.threeYear).toFixed(2)}%
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                  {(fundReturn - marketData.nifty50.returns.threeYear).toFixed(2)}%
                                </>
                              )}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-blue-50">
                      <td className="p-3 text-gray-900">Portfolio Average</td>
                      <td className="p-3 text-right text-gray-900">
                        {calculatePortfolioAverage('threeYear').toFixed(2)}%
                      </td>
                      <td className="p-3 text-right text-gray-900">{marketData.nifty50.returns.threeYear}%</td>
                      <td className="p-3 text-center">
                        <Badge className={
                          calculatePortfolioAverage('threeYear') > marketData.nifty50.returns.threeYear
                            ? "bg-green-600"
                            : "bg-red-600"
                        }>
                          {calculatePortfolioAverage('threeYear') > marketData.nifty50.returns.threeYear ? (
                            <>
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Outperforms
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Underperforms
                            </>
                          )}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="sensex" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm text-gray-600">Fund Name</th>
                      <th className="text-right p-3 text-sm text-gray-600">XIRR</th>
                      <th className="text-right p-3 text-sm text-gray-600">SENSEX 30 (3Y)</th>
                      <th className="text-center p-3 text-sm text-gray-600">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funds.map((fund) => {
                      const fundReturn = calculateAverageReturn(fund);
                      const outperforms = fundReturn > marketData.sensex30.returns.threeYear;
                      return (
                        <tr key={fund.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="text-gray-900">{fund.fundName}</div>
                            <div className="text-sm text-gray-600">{fund.category}</div>
                          </td>
                          <td className="p-3 text-right text-gray-900">{fund.xirr}%</td>
                          <td className="p-3 text-right text-gray-900">{marketData.sensex30.returns.threeYear}%</td>
                          <td className="p-3 text-center">
                            <Badge className={outperforms ? "bg-green-600" : "bg-red-600"}>
                              {outperforms ? (
                                <>
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  +{(fundReturn - marketData.sensex30.returns.threeYear).toFixed(2)}%
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                  {(fundReturn - marketData.sensex30.returns.threeYear).toFixed(2)}%
                                </>
                              )}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-blue-50">
                      <td className="p-3 text-gray-900">Portfolio Average</td>
                      <td className="p-3 text-right text-gray-900">
                        {calculatePortfolioAverage('threeYear').toFixed(2)}%
                      </td>
                      <td className="p-3 text-right text-gray-900">{marketData.sensex30.returns.threeYear}%</td>
                      <td className="p-3 text-center">
                        <Badge className={
                          calculatePortfolioAverage('threeYear') > marketData.sensex30.returns.threeYear
                            ? "bg-green-600"
                            : "bg-red-600"
                        }>
                          {calculatePortfolioAverage('threeYear') > marketData.sensex30.returns.threeYear ? (
                            <>
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Outperforms
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Underperforms
                            </>
                          )}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
          <CardDescription>Average returns grouped by fund category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from(new Set(funds.map(f => f.category))).map(category => {
              const categoryFunds = funds.filter(f => f.category === category);
              const avgXIRR = categoryFunds.reduce((sum, f) => sum + parseFloat(f.xirr), 0) / categoryFunds.length;
              const avgReturn = categoryFunds.reduce((sum, f) => 
                sum + calculateAverageReturn(f), 0
              ) / categoryFunds.length;

              return (
                <div key={category} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-gray-900">{category}</div>
                      <div className="text-sm text-gray-600">{categoryFunds.length} fund(s)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900">Avg XIRR: {avgXIRR.toFixed(2)}%</div>
                      <div className="text-sm text-gray-600">Avg Return: {avgReturn.toFixed(2)}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
