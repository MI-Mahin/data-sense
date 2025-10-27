'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, MessageSquare, Download, Menu, X, Sparkles, ChevronDown, Plus, Sun, Moon, Database, BarChart2, Zap } from 'lucide-react';

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
  const [darkMode, setDarkMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSchema();
  }, []);

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
      const response = await axios.post(`${API_URL}/query`, { prompt: input });
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
      await axios.post(`${API_URL}/export`, { results });
      alert('Data exported successfully');
    } catch (error) {
      alert('Error exporting data');
    }
  };

  const clearHistory = () => {
    if (confirm('Clear all conversation history?')) {
      setMessages([]);
    }
  };

  const calculateStats = (results: any[], columns: string[]) => {
    const stats: any = {};
    columns.forEach(col => {
      const values = results.map(row => row[col]).filter(val => typeof val === 'number');
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        stats[col] = {
          avg: (sum / values.length).toFixed(2),
          min: Math.min(...values).toFixed(2),
          max: Math.max(...values).toFixed(2),
        };
      }
    });
    return stats;
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-[#0f172a]' : 'bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50'} transition-all duration-300`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} ${darkMode ? 'bg-[#1e293b]' : 'bg-white/80 backdrop-blur-xl'} flex flex-col transition-all duration-300 overflow-hidden border-r ${darkMode ? 'border-slate-700/50' : 'border-slate-200/60'} shadow-2xl`}>
        {/* Header */}
        <div className={`p-5 border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className={`font-bold text-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent`}>
              DataSense
            </h2>
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={clearHistory}
            className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium ${darkMode ? 'text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500' : 'text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600'} rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]`}
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-600'} px-3 mb-3 uppercase tracking-wider`}>
            Recent Chats
          </div>
          {messages.filter(m => m.type === 'user').slice(-10).reverse().map(msg => (
            <button
              key={msg.id}
              onClick={() => setInput(msg.content)}
              className={`flex items-start gap-3 w-full px-3 py-3 text-sm ${darkMode ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-100'} rounded-xl transition-all mb-2 text-left group`}
            >
              <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-violet-400' : 'text-violet-500'}`} />
              <span className="truncate group-hover:text-violet-400 transition-colors">{msg.content}</span>
            </button>
          ))}
        </div>

        {/* Database Schema */}
        <div className={`border-t ${darkMode ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
          <details className="group">
            <summary className={`flex items-center justify-between px-4 py-4 text-sm font-medium ${darkMode ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-100'} cursor-pointer transition-all`}>
              <span className="flex items-center gap-2">
                <Database className={`w-4 h-4 ${darkMode ? 'text-violet-400' : 'text-violet-500'}`} />
                Schema
              </span>
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4 max-h-48 overflow-y-auto">
              <pre className={`text-xs ${darkMode ? 'text-slate-400 bg-slate-800/50' : 'text-slate-600 bg-slate-50'} whitespace-pre-wrap font-mono p-3 rounded-lg`}>{schema}</pre>
            </div>
          </details>
        </div>

        {/* Theme Toggle */}
        <div className={`border-t ${darkMode ? 'border-slate-700/50' : 'border-slate-200/60'} p-3`}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium ${darkMode ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-100'} rounded-xl transition-all`}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            <span>{darkMode ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div className="w-full max-w-4xl">
                <div className="text-center mb-12 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl mb-8 shadow-2xl shadow-purple-500/30 animate-pulse">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h1 className={`text-6xl font-extrabold mb-5 ${darkMode ? 'text-white' : 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent'}`}>
                    DataSense AI
                  </h1>
                  <p className={`text-xl ${darkMode ? 'text-slate-400' : 'text-slate-600'} font-light max-w-2xl mx-auto`}>
                    Transform your data into insights with natural language queries
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {[
                    { text: 'Show all employees', icon: Database, color: 'from-blue-500 to-cyan-500' },
                    { text: 'Count by department', icon: BarChart2, color: 'from-emerald-500 to-teal-500' },
                    { text: 'Highest paid employee', icon: Sparkles, color: 'from-violet-500 to-purple-500' },
                    { text: 'Average salary by dept', icon: BarChart2, color: 'from-fuchsia-500 to-pink-500' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(item.text)}
                      className={`group p-6 text-left border-2 ${darkMode ? 'border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600' : 'border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300'} backdrop-blur-sm rounded-2xl transition-all hover:scale-105 hover:shadow-2xl`}
                    >
                      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{item.text}</p>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Click to try</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="h-full">
              <div className="max-w-4xl mx-auto px-6 py-8">
                {messages.map(message => (
                  <div key={message.id} className="mb-12 animate-slide-up">
                    {message.type === 'user' && (
                      <div className="flex gap-5 items-start">
                        <div className={`w-10 h-10 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-slate-700 to-slate-800' : 'bg-gradient-to-br from-slate-200 to-slate-300'} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-700'}`}>You</span>
                        </div>
                        <div className="flex-1 pt-2">
                          <p className={`text-lg ${darkMode ? 'text-slate-100' : 'text-slate-900'} leading-relaxed font-medium`}>{message.content}</p>
                        </div>
                      </div>
                    )}

                    {message.type === 'assistant' && (
                      <div className="flex gap-5 items-start">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-xl shadow-purple-500/30">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 space-y-5 min-w-0">
                          {/* SQL Query */}
                          <div>
                            <p className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-600'} uppercase tracking-wider mb-3`}>Generated Query</p>
                            <div className={`${darkMode ? 'bg-slate-900/50 border border-slate-700/50' : 'bg-white/60 border border-slate-200'} backdrop-blur-sm rounded-2xl p-5 overflow-x-auto shadow-lg`}>
                              <code className={`text-sm ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} font-mono leading-relaxed`}>{message.content}</code>
                            </div>
                          </div>

                          {/* Results Table */}
                          {message.results && message.results.length > 0 && (
                            <>
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <p className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-600'} uppercase tracking-wider`}>
                                    Query Results ({message.rowCount} rows)
                                  </p>
                                  <button
                                    onClick={() => exportToCSV(message.results!)}
                                    className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-2 ${darkMode ? 'border-slate-600 hover:bg-slate-700/50 text-slate-300' : 'border-slate-300 hover:bg-slate-50 text-slate-700'} rounded-xl transition-all hover:scale-105`}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Export CSV
                                  </button>
                                </div>
                                <div className={`border-2 ${darkMode ? 'border-slate-700/50' : 'border-slate-200'} rounded-2xl overflow-hidden shadow-xl ${darkMode ? 'bg-slate-900/30' : 'bg-white/60'} backdrop-blur-sm`}>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className={`${darkMode ? 'bg-slate-800/50 border-b-2 border-slate-700/50' : 'bg-slate-50/80 border-b-2 border-slate-200'}`}>
                                        <tr>
                                          {message.columns!.map((col, i) => (
                                            <th key={i} className={`px-5 py-4 text-left text-xs font-bold ${darkMode ? 'text-violet-400' : 'text-violet-600'} uppercase tracking-wider`}>
                                              {col}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className={`${darkMode ? 'divide-slate-700/50' : 'divide-slate-100'} divide-y`}>
                                        {message.results!.slice(0, 10).map((row, i) => (
                                          <tr key={i} className={`${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/60'} transition-colors`}>
                                            {message.columns!.map((col, j) => (
                                              <td key={j} className={`px-5 py-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'} font-medium`}>
                                                {row[col]?.toString() || '-'}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  {message.results!.length > 10 && (
                                    <div className={`${darkMode ? 'bg-slate-800/50 border-t-2 border-slate-700/50 text-slate-500' : 'bg-slate-50/80 border-t-2 border-slate-200 text-slate-600'} px-5 py-3 text-xs font-semibold`}>
                                      Showing 10 of {message.results!.length} rows
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Statistics */}
                              {Object.keys(calculateStats(message.results!, message.columns!)).length > 0 && (
                                <div>
                                  <p className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-600'} uppercase tracking-wider mb-3`}>Statistics</p>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Object.entries(calculateStats(message.results!, message.columns!)).map(([col, stats]: [string, any]) => (
                                      <div key={col} className={`border-2 ${darkMode ? 'border-slate-700/50 bg-slate-900/30' : 'border-slate-200 bg-white/60'} backdrop-blur-sm rounded-2xl p-4 shadow-lg`}>
                                        <p className={`text-sm font-bold ${darkMode ? 'text-violet-400' : 'text-violet-600'} mb-3`}>{col}</p>
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className={`${darkMode ? 'text-slate-500' : 'text-slate-600'} font-medium`}>Average</span>
                                            <span className={`font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{stats.avg}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className={`${darkMode ? 'text-slate-500' : 'text-slate-600'} font-medium`}>Minimum</span>
                                            <span className={`font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{stats.min}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className={`${darkMode ? 'text-slate-500' : 'text-slate-600'} font-medium`}>Maximum</span>
                                            <span className={`font-bold ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>{stats.max}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {message.type === 'error' && (
                      <div className="flex gap-5 items-start">
                        <div className="w-10 h-10 rounded-2xl bg-red-500 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg">
                          !
                        </div>
                        <div className={`flex-1 ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border-2 rounded-2xl p-5`}>
                          <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-800'} font-medium`}>{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-5 items-start mb-12">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-xl shadow-purple-500/30">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 pt-2">
                      <div className={`w-2.5 h-2.5 ${darkMode ? 'bg-slate-500' : 'bg-slate-400'} rounded-full animate-bounce`}></div>
                      <div className={`w-2.5 h-2.5 ${darkMode ? 'bg-slate-500' : 'bg-slate-400'} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                      <div className={`w-2.5 h-2.5 ${darkMode ? 'bg-slate-500' : 'bg-slate-400'} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar - Fixed at Bottom */}
        <div className={`border-t ${darkMode ? 'border-slate-700/50 bg-[#0f172a]' : 'border-slate-200 bg-gradient-to-br from-slate-50 to-purple-50/30'} p-5`}>
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
              <div className={`relative flex items-center ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-300'} border-2 rounded-3xl shadow-2xl transition-all hover:shadow-purple-500/20`}>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`flex-shrink-0 p-4 ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-100'} rounded-l-3xl transition-all`}
                >
                  {sidebarOpen ? (
                    <X className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                  ) : (
                    <Menu className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                  )}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your data..."
                  className={`flex-1 px-4 py-4 bg-transparent border-none focus:outline-none text-base ${darkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'} font-medium`}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex-shrink-0 m-2 p-3 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-110"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>
            <p className={`text-xs text-center ${darkMode ? 'text-slate-600' : 'text-slate-500'} mt-4 font-medium`}>
              DataSense AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
