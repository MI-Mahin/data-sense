'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Database, History, Download, Menu, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

interface Message {
  id: number;
  type: 'user' | 'assistant' | 'error';
  content: string;
  results?: any[];
  columns?: string[];
  rowCount?: number;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [schema, setSchema] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load schema on mount
  useEffect(() => {
    loadSchema();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSchema = async () => {
    try {
      const response = await axios.get(`${API_URL}/schema`);
      setSchema(response.data.schema);
    } catch (error) {
      console.error('Error loading schema:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/query`, {
        prompt: input
      });

      const assistantMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.data.sql_query,
        results: response.data.results,
        columns: response.data.columns,
        rowCount: response.data.row_count,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'error',
        content: error.response?.data?.error || 'An error occurred',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async (results: any[]) => {
    try {
      const response = await axios.post(`${API_URL}/export`, {
        results: results
      });
      alert(response.data.message);
    } catch (error) {
      alert('Error exporting data');
    }
  };

  const clearHistory = () => {
    if (confirm('Clear all conversation history?')) {
      setMessages([]);
    }
  };

  const calculateStatistics = (results: any[], columns: string[]) => {
    const stats: any = {};

    columns.forEach(col => {
      const values = results
        .map(row => row[col])
        .filter(val => typeof val === 'number');

      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        stats[col] = {
          count: values.length,
          sum: sum.toFixed(2),
          average: avg.toFixed(2),
          min: min.toFixed(2),
          max: max.toFixed(2),
          range: (max - min).toFixed(2)
        };
      }
    });

    return stats;
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold">SQL Analytics</h1>
          </div>
          <button
            onClick={clearHistory}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 justify-center transition-colors"
          >
            <History className="w-4 h-4" />
            Clear History
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-sm font-semibold text-gray-400 mb-3">Recent Queries</h2>
          <div className="space-y-2">
            {messages
              .filter(m => m.type === 'user')
              .slice(-10)
              .reverse()
              .map(msg => (
                <div
                  key={msg.id}
                  className="p-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 cursor-pointer transition-colors truncate"
                  onClick={() => setInput(msg.content)}
                >
                  {msg.content}
                </div>
              ))}
          </div>
        </div>

        {/* Database Schema */}
        <div className="p-4 border-t border-gray-700 max-h-64 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Database Schema</h3>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
            {schema}
          </pre>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="text-lg font-semibold">Prompt to SQL Query Generator</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Welcome to SQL Analytics
              </h3>
              <p className="text-gray-500">
                Ask questions about your database in natural language
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <button
                  onClick={() => setInput('Show all employees')}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                >
                  Show all employees
                </button>
                <button
                  onClick={() => setInput('Count employees by department')}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                >
                  Count employees by department
                </button>
                <button
                  onClick={() => setInput('Find highest paid employee')}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                >
                  Find highest paid employee
                </button>
                <button
                  onClick={() => setInput('Average salary by department')}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                >
                  Average salary by department
                </button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl ${message.type === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                {/* User Message */}
                {message.type === 'user' && (
                  <div className="bg-blue-600 rounded-2xl px-6 py-3">
                    <p className="text-white">{message.content}</p>
                  </div>
                )}

                {/* Assistant Message */}
                {message.type === 'assistant' && (
                  <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
                    {/* SQL Query */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">
                        Generated SQL Query:
                      </h4>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <code className="text-green-400 text-sm">{message.content}</code>
                      </div>
                    </div>

                    {/* Results Table */}
                    {message.results && message.results.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-400">
                            Results ({message.rowCount} rows):
                          </h4>
                          <button
                            onClick={() => exportToCSV(message.results!)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Export CSV
                          </button>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-700">
                                {message.columns!.map((col, idx) => (
                                  <th key={idx} className="text-left p-2 text-gray-400 font-semibold">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {message.results!.slice(0, 10).map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                  {message.columns!.map((col, colIdx) => (
                                    <td key={colIdx} className="p-2 text-gray-300">
                                      {row[col]?.toString() || 'null'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {message.results!.length > 10 && (
                            <p className="text-gray-500 text-xs mt-2">
                              Showing first 10 of {message.results!.length} rows
                            </p>
                          )}
                        </div>

                        {/* Quick Statistics */}
                        {Object.keys(calculateStatistics(message.results!, message.columns!)).length > 0 && (
                          <div className="mt-4 border-t border-gray-700 pt-4">
                            <h4 className="text-sm font-semibold text-gray-400 mb-3">Quick Statistics:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {Object.entries(calculateStatistics(message.results!, message.columns!)).map(([col, stats]: [string, any]) => (
                                <div key={col} className="bg-gray-900 rounded-lg p-4">
                                  <h5 className="text-xs font-semibold text-purple-400 mb-3 uppercase tracking-wider">
                                    {col}
                                  </h5>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-400">Average:</span>
                                      <span className="text-sm font-semibold text-blue-400">{stats.average}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-400">Min:</span>
                                      <span className="text-sm font-semibold text-green-400">{stats.min}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-400">Max:</span>
                                      <span className="text-sm font-semibold text-red-400">{stats.max}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {message.type === 'error' && (
                  <div className="bg-red-900/30 border border-red-500 rounded-2xl px-6 py-3">
                    <p className="text-red-400">{message.content}</p>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-700 p-4 bg-gray-800">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your database..."
                className="flex-1 px-6 py-4 bg-gray-700 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-2xl transition-colors flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}