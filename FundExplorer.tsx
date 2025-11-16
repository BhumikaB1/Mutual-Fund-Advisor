import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Loader2, Search, TrendingUp, Star, Info, Filter } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SearchFund {
  id: string;
  fundName: string;
  category: string;
  amc: string;
  currentNav: number;
  riskLevel: string;
  rating: number;
  rank: string;
  expenseRatio: number;
  minInvestment: number;
  returns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
  aum: number;
  exitLoad: string;
  description: string;
}

export function FundExplorer() {
  const [funds, setFunds] = useState<SearchFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [riskLevel, setRiskLevel] = useState('All');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('returns3y');
  const [selectedFund, setSelectedFund] = useState<SearchFund | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    searchFunds();
  }, [category, riskLevel, minRating, sortBy]);

  const searchFunds = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fa862965/search-funds`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            query: searchQuery,
            category: category !== 'All' ? category : null,
            riskLevel: riskLevel !== 'All' ? riskLevel : null,
            minRating,
            sortBy
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch funds');
      }

      const data = await response.json();
      setFunds(data.funds);
    } catch (error) {
      console.error('Error searching funds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchFunds();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadgeColor = (risk: string) => {
    if (risk.includes('Very High')) return 'bg-red-600';
    if (risk.includes('High')) return 'bg-orange-600';
    if (risk.includes('Moderate')) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Discover Mutual Funds</CardTitle>
              <CardDescription>
                Search and compare funds before investing
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by fund name, AMC, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Large Cap">Large Cap</SelectItem>
                    <SelectItem value="Mid Cap">Mid Cap</SelectItem>
                    <SelectItem value="Small Cap">Small Cap</SelectItem>
                    <SelectItem value="Flexi Cap">Flexi Cap</SelectItem>
                    <SelectItem value="ELSS">ELSS</SelectItem>
                    <SelectItem value="Sectoral">Sectoral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Risk Level</label>
                <Select value={riskLevel} onValueChange={setRiskLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Risk Levels</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Moderate to High">Moderate to High</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Very High">Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Minimum Rating</label>
                <Select 
                  value={minRating?.toString() || 'all'} 
                  onValueChange={(val) => setMinRating(val === 'all' ? null : parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Rating</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="returns3y">3Y Returns</SelectItem>
                    <SelectItem value="returns1y">1Y Returns</SelectItem>
                    <SelectItem value="returns5y">5Y Returns</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="aum">AUM (Size)</SelectItem>
                    <SelectItem value="expense">Expense Ratio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Searching funds...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found {funds.length} fund{funds.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid gap-4">
            {funds.map((fund) => (
              <Card 
                key={fund.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedFund(fund)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-gray-900 mb-1">{fund.fundName}</h3>
                          <p className="text-sm text-gray-600">{fund.amc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{fund.category}</Badge>
                          <Badge className={getRiskBadgeColor(fund.riskLevel)}>
                            {fund.riskLevel}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-600">Rating</div>
                          <div className={`flex items-center gap-1 ${getRatingColor(fund.rating)}`}>
                            <Star className="w-4 h-4 fill-current" />
                            <span>{fund.rating}/5</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">1Y Return</div>
                          <div className="text-green-600">
                            {fund.returns.oneYear > 0 ? '+' : ''}{fund.returns.oneYear}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">3Y Return</div>
                          <div className="text-green-600">
                            {fund.returns.threeYear > 0 ? '+' : ''}{fund.returns.threeYear}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Expense Ratio</div>
                          <div className="text-gray-900">{fund.expenseRatio}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Min Investment</div>
                          <div className="text-gray-900">{formatCurrency(fund.minInvestment)}</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">{fund.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400 md:flex-col md:justify-center">
                      <Info className="w-5 h-5" />
                      <span className="text-sm">View Details</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Fund Details Dialog */}
      <Dialog open={!!selectedFund} onOpenChange={() => setSelectedFund(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedFund && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-start justify-between gap-4">
                  <span className="flex-1">{selectedFund.fundName}</span>
                  <Badge className={getRiskBadgeColor(selectedFund.riskLevel)}>
                    {selectedFund.riskLevel}
                  </Badge>
                </DialogTitle>
                <DialogDescription>{selectedFund.amc}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-600 mb-1">Rating</div>
                      <div className={`flex items-center gap-1 ${getRatingColor(selectedFund.rating)}`}>
                        <Star className="w-5 h-5 fill-current" />
                        <span className="text-xl">{selectedFund.rating}/5</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{selectedFund.rank}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-600 mb-1">Current NAV</div>
                      <div className="text-xl text-gray-900">₹{selectedFund.currentNav.toFixed(2)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-600 mb-1">AUM</div>
                      <div className="text-xl text-gray-900">₹{selectedFund.aum} Cr</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-600 mb-1">Expense Ratio</div>
                      <div className="text-xl text-gray-900">{selectedFund.expenseRatio}%</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Returns */}
                <div>
                  <h4 className="text-gray-900 mb-3">Historical Returns</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600 mb-1">1 Year</div>
                        <div className="text-2xl text-green-600 flex items-center gap-1">
                          <TrendingUp className="w-5 h-5" />
                          {selectedFund.returns.oneYear}%
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600 mb-1">3 Year</div>
                        <div className="text-2xl text-blue-600 flex items-center gap-1">
                          <TrendingUp className="w-5 h-5" />
                          {selectedFund.returns.threeYear}%
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600 mb-1">5 Year</div>
                        <div className="text-2xl text-purple-600 flex items-center gap-1">
                          <TrendingUp className="w-5 h-5" />
                          {selectedFund.returns.fiveYear}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Fund Details */}
                <div>
                  <h4 className="text-gray-900 mb-3">Fund Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Category</span>
                      <Badge variant="outline">{selectedFund.category}</Badge>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Risk Level</span>
                      <span className="text-sm text-gray-900">{selectedFund.riskLevel}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Minimum Investment</span>
                      <span className="text-sm text-gray-900">{formatCurrency(selectedFund.minInvestment)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Exit Load</span>
                      <span className="text-sm text-gray-900">{selectedFund.exitLoad}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-gray-900 mb-2">About this Fund</h4>
                  <p className="text-sm text-gray-600">{selectedFund.description}</p>
                </div>

                {/* Disclaimer */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-yellow-900">
                      <strong>Disclaimer:</strong> This information is for educational purposes only. 
                      Please consult with a certified financial advisor before making investment decisions. 
                      Past performance does not guarantee future results.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
