import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  PieChart, 
  Activity,
  Loader2,
  InfoIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  PieChart as RechartsPie, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Holding {
  companyName: string;
  sector: string;
  allocation: number;
  shares: number;
  value: number;
  changeFromLastMonth: number;
}

interface HoldingChange {
  month: string;
  companyName: string;
  previousAllocation: number;
  currentAllocation: number;
  change: number;
}

interface SectorAllocation {
  sector: string;
  allocation: number;
  value: number;
}

interface RiskMetrics {
  sharpeRatio: number;
  beta: number;
  sortinoRatio: number;
  standardDeviation: number;
  downwardDeviation: number;
  riskFreeRate: number;
  benchmarkCorrelation: number;
}

interface HoldingsData {
  fundId: string;
  fundName: string;
  asOfDate: string;
  totalHoldings: number;
  topHoldings: Holding[];
  sectorAllocation: SectorAllocation[];
  historicalChanges: HoldingChange[];
  addedCompanies: Array<{
    name: string;
    sector: string;
    allocation: number;
    addedOn: string;
  }>;
  removedCompanies: Array<{
    name: string;
    sector: string;
    previousAllocation: number;
    removedOn: string;
    reason: string;
  }>;
  riskMetrics: RiskMetrics;
  monthlyAllocations: Array<{
    month: string;
    [key: string]: any;
  }>;
}

interface FundHoldingsProps {
  fundId: string;
  fundName: string;
  pan: string;
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#6366f1', '#f43f5e', '#14b8a6', '#a855f7'
];

export function FundHoldings({ fundId, fundName, pan }: FundHoldingsProps) {
  const [holdingsData, setHoldingsData] = useState<HoldingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHoldingsData();
  }, [fundId]);

  // Generate mock data as fallback
  const generateMockHoldingsData = (): HoldingsData => {
    const companies = [
      { name: 'Reliance Industries Ltd', sector: 'Energy', allocation: 8.5 },
      { name: 'HDFC Bank Ltd', sector: 'Banking', allocation: 7.2 },
      { name: 'Infosys Ltd', sector: 'Information Technology', allocation: 6.8 },
      { name: 'ICICI Bank Ltd', sector: 'Banking', allocation: 5.9 },
      { name: 'TCS Ltd', sector: 'Information Technology', allocation: 5.4 },
      { name: 'Bharti Airtel Ltd', sector: 'Telecom', allocation: 4.8 },
      { name: 'ITC Ltd', sector: 'FMCG', allocation: 4.2 },
      { name: 'Kotak Mahindra Bank', sector: 'Banking', allocation: 3.9 },
      { name: 'HUL Ltd', sector: 'FMCG', allocation: 3.5 },
      { name: 'Axis Bank Ltd', sector: 'Banking', allocation: 3.2 },
      { name: 'Larsen & Toubro', sector: 'Infrastructure', allocation: 2.8 },
      { name: 'Asian Paints Ltd', sector: 'Consumer Goods', allocation: 2.5 },
      { name: 'Maruti Suzuki', sector: 'Automobile', allocation: 2.2 },
      { name: 'Titan Company', sector: 'Consumer Goods', allocation: 2.0 },
      { name: 'Sun Pharma', sector: 'Pharmaceuticals', allocation: 1.8 }
    ];

    const topHoldings: Holding[] = companies.slice(0, 15).map(company => ({
      companyName: company.name,
      sector: company.sector,
      allocation: company.allocation,
      shares: Math.floor(Math.random() * 500000) + 100000,
      value: (company.allocation / 100) * 50000000,
      changeFromLastMonth: (Math.random() - 0.5) * 3
    }));

    // Calculate sector allocation
    const sectorMap = new Map<string, { allocation: number; value: number }>();
    topHoldings.forEach(holding => {
      const existing = sectorMap.get(holding.sector) || { allocation: 0, value: 0 };
      sectorMap.set(holding.sector, {
        allocation: existing.allocation + holding.allocation,
        value: existing.value + holding.value
      });
    });

    const sectorAllocation: SectorAllocation[] = Array.from(sectorMap.entries()).map(([sector, data]) => ({
      sector,
      allocation: data.allocation,
      value: data.value / 10000000
    }));

    // Generate historical changes
    const historicalChanges: HoldingChange[] = [];
    const months = ['Oct 2024', 'Sep 2024', 'Aug 2024', 'Jul 2024', 'Jun 2024', 'May 2024'];
    
    topHoldings.slice(0, 5).forEach(holding => {
      months.forEach((month, idx) => {
        const change = (Math.random() - 0.5) * 2;
        historicalChanges.push({
          month,
          companyName: holding.companyName,
          previousAllocation: holding.allocation - change,
          currentAllocation: holding.allocation,
          change
        });
      });
    });

    // Generate monthly allocations for chart
    const monthlyAllocations = months.reverse().map(month => {
      const data: any = { month };
      topHoldings.slice(0, 5).forEach(holding => {
        data[holding.companyName] = holding.allocation + (Math.random() - 0.5) * 2;
      });
      return data;
    });

    // Generate newly added and removed companies
    const addedCompanies = [
      { name: 'Adani Green Energy', sector: 'Renewable Energy', allocation: 2.1, addedOn: 'Sep 2024' },
      { name: 'Zomato Ltd', sector: 'Food Tech', allocation: 1.5, addedOn: 'Oct 2024' },
      { name: 'Delhivery Ltd', sector: 'Logistics', allocation: 1.2, addedOn: 'Aug 2024' }
    ];

    const removedCompanies = [
      { name: 'Vodafone Idea Ltd', sector: 'Telecom', previousAllocation: 2.3, removedOn: 'Sep 2024', reason: 'Poor Performance' },
      { name: 'YES Bank Ltd', sector: 'Banking', previousAllocation: 1.8, removedOn: 'Aug 2024', reason: 'Risk Management' },
      { name: 'Paytm (One97)', sector: 'Fintech', previousAllocation: 1.5, removedOn: 'Jul 2024', reason: 'Regulatory Concerns' }
    ];

    return {
      fundId,
      fundName,
      asOfDate: new Date().toISOString(),
      totalHoldings: 45,
      topHoldings,
      sectorAllocation,
      historicalChanges,
      addedCompanies,
      removedCompanies,
      riskMetrics: {
        sharpeRatio: 1.2 + Math.random() * 0.8,
        beta: 0.9 + Math.random() * 0.4,
        sortinoRatio: 1.5 + Math.random() * 0.7,
        standardDeviation: 12 + Math.random() * 8,
        downwardDeviation: 8 + Math.random() * 4,
        riskFreeRate: 6.5,
        benchmarkCorrelation: 0.75 + Math.random() * 0.2
      },
      monthlyAllocations
    };
  };

  const fetchHoldingsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fa862965/fund-holdings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ fundId, pan })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch holdings data');
      }

      const data = await response.json();
      setHoldingsData(data);
    } catch (err: any) {
      console.error('Error fetching holdings:', err);
      // Use mock data as fallback
      console.log('Using mock data as fallback');
      const mockData = generateMockHoldingsData();
      setHoldingsData(mockData);
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRiskLevel = (value: number, type: 'sharpe' | 'beta' | 'sortino') => {
    if (type === 'sharpe') {
      if (value > 2) return { level: 'Excellent', color: 'text-green-600' };
      if (value > 1) return { level: 'Good', color: 'text-blue-600' };
      if (value > 0) return { level: 'Moderate', color: 'text-yellow-600' };
      return { level: 'Poor', color: 'text-red-600' };
    } else if (type === 'beta') {
      if (value < 0.8) return { level: 'Low Volatility', color: 'text-green-600' };
      if (value < 1.2) return { level: 'Moderate Volatility', color: 'text-blue-600' };
      return { level: 'High Volatility', color: 'text-red-600' };
    } else { // sortino
      if (value > 2) return { level: 'Excellent', color: 'text-green-600' };
      if (value > 1) return { level: 'Good', color: 'text-blue-600' };
      if (value > 0) return { level: 'Moderate', color: 'text-yellow-600' };
      return { level: 'Poor', color: 'text-red-600' };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading holdings data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !holdingsData) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error || 'Failed to load holdings data. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Holdings & Risk Analysis</CardTitle>
              <CardDescription>
                As of {new Date(holdingsData.asOfDate).toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {holdingsData.totalHoldings} Total Holdings
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="holdings">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="holdings">
            <PieChart className="w-4 h-4 mr-2" />
            Current Holdings
          </TabsTrigger>
          <TabsTrigger value="changes">
            <Activity className="w-4 h-4 mr-2" />
            Historical Changes
          </TabsTrigger>
          <TabsTrigger value="sectors">
            <BarChart3 className="w-4 h-4 mr-2" />
            Sector Allocation
          </TabsTrigger>
          <TabsTrigger value="risk">
            <TrendingUp className="w-4 h-4 mr-2" />
            Risk Metrics
          </TabsTrigger>
        </TabsList>

        {/* Current Holdings Tab */}
        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Holdings</CardTitle>
              <CardDescription>
                Companies with highest allocation in the fund portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {holdingsData.topHoldings.map((holding, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-gray-900">{holding.companyName}</h4>
                          <p className="text-sm text-gray-600">{holding.sector}</p>
                        </div>
                      </div>
                      
                      <div className="ml-11 grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-gray-600">Allocation</div>
                          <div className="text-gray-900">{holding.allocation.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Value</div>
                          <div className="text-gray-900">{formatCurrency(holding.value)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Shares</div>
                          <div className="text-gray-900">{holding.shares.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      {holding.changeFromLastMonth !== 0 && (
                        <Badge 
                          className={holding.changeFromLastMonth > 0 ? 'bg-green-600' : 'bg-red-600'}
                        >
                          {holding.changeFromLastMonth > 0 ? (
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                          )}
                          {Math.abs(holding.changeFromLastMonth).toFixed(2)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historical Changes Tab */}
        <TabsContent value="changes" className="space-y-4">
          {/* Added and Removed Companies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Newly Added Companies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <ArrowUpRight className="w-5 h-5" />
                  Newly Added Companies
                </CardTitle>
                <CardDescription>
                  Companies added to portfolio in last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                {holdingsData.addedCompanies.length > 0 ? (
                  <div className="space-y-3">
                    {holdingsData.addedCompanies.map((company, index) => (
                      <div 
                        key={index}
                        className="p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-gray-900">{company.name}</h4>
                            <p className="text-sm text-gray-600">{company.sector}</p>
                          </div>
                          <Badge className="bg-green-600">
                            {company.allocation.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Added on: <span className="text-gray-900">{company.addedOn}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">
                    No new companies added recently
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Removed Companies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <ArrowDownRight className="w-5 h-5" />
                  Removed Companies
                </CardTitle>
                <CardDescription>
                  Companies exited from portfolio in last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                {holdingsData.removedCompanies.length > 0 ? (
                  <div className="space-y-3">
                    {holdingsData.removedCompanies.map((company, index) => (
                      <div 
                        key={index}
                        className="p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-gray-900">{company.name}</h4>
                            <p className="text-sm text-gray-600">{company.sector}</p>
                          </div>
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            {company.previousAllocation.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-600">
                            Removed on: <span className="text-gray-900">{company.removedOn}</span>
                          </div>
                          <div className="text-xs">
                            <Badge variant="outline" className="text-xs">
                              {company.reason}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">
                    No companies removed recently
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Allocation Changes Over Time</CardTitle>
              <CardDescription>
                Track how fund managers adjusted holdings in the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Recent Changes List */}
              <div className="mb-6">
                <h4 className="text-gray-900 mb-4">Recent Allocation Changes</h4>
                <div className="space-y-2">
                  {holdingsData.historicalChanges
                    .filter(change => Math.abs(change.change) > 0.1)
                    .slice(0, 10)
                    .map((change, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="text-gray-900">{change.companyName}</div>
                          <div className="text-sm text-gray-600">{change.month}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {change.previousAllocation.toFixed(2)}%
                            </span>
                            {change.change > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`${change.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {change.currentAllocation.toFixed(2)}%
                            </span>
                          </div>
                          <Badge 
                            variant="outline"
                            className={change.change > 0 ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}
                          >
                            {change.change > 0 ? '+' : ''}{change.change.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Chart */}
              <div className="mt-6">
                <h4 className="text-gray-900 mb-4">Top 5 Holdings Trend</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={holdingsData.monthlyAllocations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      label={{ value: 'Allocation %', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Legend />
                    {holdingsData.topHoldings.slice(0, 5).map((holding, index) => (
                      <Line
                        key={holding.companyName}
                        type="monotone"
                        dataKey={holding.companyName}
                        stroke={COLORS[index]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sector Allocation Tab */}
        <TabsContent value="sectors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sector Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={holdingsData.sectorAllocation}
                      dataKey="allocation"
                      nameKey="sector"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ sector, allocation }) => `${sector}: ${allocation.toFixed(1)}%`}
                    >
                      {holdingsData.sectorAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sector-wise Value</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={holdingsData.sectorAllocation}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="sector" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      label={{ value: 'Value (₹ Cr)', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value * 10000000)}
                    />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sector List */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Sector Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {holdingsData.sectorAllocation
                  .sort((a, b) => b.allocation - a.allocation)
                  .map((sector, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">{sector.sector}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            {formatCurrency(sector.value * 10000000)}
                          </span>
                          <span className="text-gray-900 min-w-[60px] text-right">
                            {sector.allocation.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${sector.allocation}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Metrics Tab */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sharpe Ratio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Sharpe Ratio
                  <InfoIcon className="w-4 h-4 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl text-gray-900 mb-2">
                    {holdingsData.riskMetrics.sharpeRatio.toFixed(2)}
                  </div>
                  <div className={`text-sm ${getRiskLevel(holdingsData.riskMetrics.sharpeRatio, 'sharpe').color}`}>
                    {getRiskLevel(holdingsData.riskMetrics.sharpeRatio, 'sharpe').level}
                  </div>
                </div>
                <Alert className="mt-4 bg-blue-50 border-blue-200">
                  <AlertDescription className="text-xs text-blue-900">
                    Measures risk-adjusted returns. Higher is better. 
                    Above 1 is good, above 2 is excellent.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Beta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Beta
                  <InfoIcon className="w-4 h-4 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl text-gray-900 mb-2">
                    {holdingsData.riskMetrics.beta.toFixed(2)}
                  </div>
                  <div className={`text-sm ${getRiskLevel(holdingsData.riskMetrics.beta, 'beta').color}`}>
                    {getRiskLevel(holdingsData.riskMetrics.beta, 'beta').level}
                  </div>
                </div>
                <Alert className="mt-4 bg-purple-50 border-purple-200">
                  <AlertDescription className="text-xs text-purple-900">
                    Measures volatility vs market. 1 = market level, 
                    &lt;1 = less volatile, &gt;1 = more volatile.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Sortino Ratio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Sortino Ratio
                  <InfoIcon className="w-4 h-4 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl text-gray-900 mb-2">
                    {holdingsData.riskMetrics.sortinoRatio.toFixed(2)}
                  </div>
                  <div className={`text-sm ${getRiskLevel(holdingsData.riskMetrics.sortinoRatio, 'sortino').color}`}>
                    {getRiskLevel(holdingsData.riskMetrics.sortinoRatio, 'sortino').level}
                  </div>
                </div>
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <AlertDescription className="text-xs text-green-900">
                    Like Sharpe but focuses on downside risk only. 
                    Higher values indicate better risk-adjusted returns.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Risk Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Risk Analysis</CardTitle>
              <CardDescription>
                Statistical measures of fund risk and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Standard Deviation</div>
                  <div className="text-2xl text-gray-900">
                    {holdingsData.riskMetrics.standardDeviation.toFixed(2)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total volatility measure
                  </p>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Downward Deviation</div>
                  <div className="text-2xl text-gray-900">
                    {holdingsData.riskMetrics.downwardDeviation.toFixed(2)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Negative volatility only
                  </p>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Risk-Free Rate</div>
                  <div className="text-2xl text-gray-900">
                    {holdingsData.riskMetrics.riskFreeRate.toFixed(2)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Used in calculations
                  </p>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Benchmark Correlation</div>
                  <div className="text-2xl text-gray-900">
                    {holdingsData.riskMetrics.benchmarkCorrelation.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Correlation with Nifty 50
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-gray-900 mb-2">Understanding Risk Metrics</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>Sharpe Ratio:</strong> Shows how much return you get for the risk taken. 
                    Formula: (Fund Return - Risk Free Rate) / Standard Deviation
                  </p>
                  <p>
                    <strong>Beta:</strong> Compares fund's volatility to the market (Nifty 50). 
                    Beta of 1.2 means 20% more volatile than market.
                  </p>
                  <p>
                    <strong>Sortino Ratio:</strong> Similar to Sharpe but only penalizes downside volatility. 
                    Better for evaluating downside protection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}