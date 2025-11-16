import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  data?: any;
  timestamp: Date;
}

interface QueryBotProps {
  pan: string;
}

export function QueryBot({ pan }: QueryBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your Mutual Fund Analysis Bot. I can help you with:\n\n• Basic MF concepts (NAV, SIP, Fund categories)\n• XIRR and return analysis\n• Fund evaluation and exit recommendations\n• Benchmark comparisons\n• Tax calculations\n\nWhat would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "What is NAV?",
    "Explain XIRR of my funds",
    "Compare my funds with Nifty 50",
    "Should I exit my small-cap fund?",
    "What is the difference between SIP and lumpsum?"
  ];

  const handleSend = async (question?: string) => {
    const queryText = question || input;
    if (!queryText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: queryText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fa862965/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ question: queryText, pan })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response from bot');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.answer,
        data: data.data,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error querying bot:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageData = (data: any, type: string) => {
    if (!data) return null;

    if (Array.isArray(data)) {
      return (
        <div className="mt-3 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">{key}:</span>
                  <span className="text-sm">{typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (typeof data === 'object') {
      return (
        <div className="mt-3 p-3 bg-white rounded-lg border space-y-1">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{key}:</span>
              <span className="text-sm">{typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}</span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {/* Quick Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle>Quick Questions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-sm"
              >
                {q}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="h-[600px] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'bot' 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600' 
                  : 'bg-gray-300'
              }`}>
                {message.type === 'bot' ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
              </div>

              <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-lg ${
                  message.type === 'bot'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.data && renderMessageData(message.data, message.type)}
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="p-4 rounded-lg bg-gray-100 inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-gray-600">Analyzing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="p-4 border-t bg-gray-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about mutual funds..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-900">
            <strong>Educational Bot:</strong> Responses are for educational purposes only and do not constitute financial advice. 
            Always consult with a certified financial advisor for investment decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
