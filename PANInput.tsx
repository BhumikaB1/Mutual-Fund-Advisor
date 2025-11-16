import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, TrendingUp, Shield, AlertCircle } from 'lucide-react';

interface PANInputProps {
  onSubmit: (pan: string) => void;
  loading: boolean;
  error: string | null;
}

export function PANInput({ onSubmit, loading, error }: PANInputProps) {
  const [pan, setPan] = useState('');
  const [validationError, setValidationError] = useState('');

  const validatePAN = (value: string): boolean => {
    // PAN format: 5 letters, 4 digits, 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(value.toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const upperPAN = pan.toUpperCase();
    
    if (!upperPAN) {
      setValidationError('Please enter your PAN number');
      return;
    }
    
    if (!validatePAN(upperPAN)) {
      setValidationError('Invalid PAN format. Example: ABCDE1234F');
      return;
    }
    
    setValidationError('');
    onSubmit(upperPAN);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Mutual Fund Analysis & Query Bot</h1>
          <p className="text-gray-600">
            Advanced portfolio analysis with AI-powered insights
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Enter Your PAN Number</CardTitle>
            <CardDescription>
              We'll fetch your mutual fund portfolio from CAMS and KFintech registries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={pan}
                  onChange={(e) => {
                    setPan(e.target.value.toUpperCase());
                    setValidationError('');
                  }}
                  maxLength={10}
                  className="text-center tracking-wider"
                  disabled={loading}
                />
                {validationError && (
                  <p className="text-sm text-red-600 mt-2">{validationError}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Portfolio...
                  </>
                ) : (
                  'Fetch My Portfolio'
                )}
              </Button>
            </form>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="mb-1">
                    <strong>Privacy Notice:</strong> This is a prototype application. Please be aware that:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>PAN numbers are sensitive personal information</li>
                    <li>This demo uses sample data for demonstration</li>
                    <li>For production use, implement proper security and compliance measures</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Demo PAN: ABCDE1234F • This application is for educational purposes only
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-blue-600 mb-1">XIRR</div>
            <div className="text-xs text-gray-600">Annualized Returns</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-purple-600 mb-1">Tax Analysis</div>
            <div className="text-xs text-gray-600">LTCG & STCG</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-green-600 mb-1">AI Insights</div>
            <div className="text-xs text-gray-600">Smart Recommendations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
