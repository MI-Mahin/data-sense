'use client';

import { useState } from 'react';
import { BarChart3, PieChart, LineChart, TrendingUp } from 'lucide-react';

export default function VisualizationPanel({ results, columns }) {
  const [showViz, setShowViz] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');

  const numericColumns = columns.filter(col => {
    return results.some(row => typeof row[col] === 'number');
  });

  const textColumns = columns.filter(col => {
    return results.some(row => typeof row[col] === 'string');
  });

  const createVisualization = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results,
          columns,
          chart_type: chartType,
          x_column: xColumn,
          y_column: yColumn
        })
      });
      
      const data = await response.json();
      
      if (data.filename) {
        alert(`Visualization saved to ${data.filename}`);
      }
    } catch (error) {
      alert('Error creating visualization');
    }
  };

  if (!results || results.length === 0) return null;

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      <button
        onClick={() => setShowViz(!showViz)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
      >
        <TrendingUp className="w-4 h-4" />
        {showViz ? 'Hide' : 'Create'} Visualization
      </button>

      {showViz && (
        <div className="mt-4 bg-gray-900 rounded-lg p-4 space-y-4">
          {/* Chart Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Chart Type:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('bar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  chartType === 'bar' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Bar Chart
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  chartType === 'pie' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <PieChart className="w-4 h-4" />
                Pie Chart
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  chartType === 'line' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <LineChart className="w-4 h-4" />
                Line Chart
              </button>
            </div>
          </div>

          {/* Column Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                X-Axis (Label):
              </label>
              <select
                value={xColumn}
                onChange={(e) => setXColumn(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select column...</option>
                {textColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Y-Axis (Value):
              </label>
              <select
                value={yColumn}
                onChange={(e) => setYColumn(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select column...</option>
                {numericColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={createVisualization}
            disabled={!xColumn || !yColumn}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Generate Visualization
          </button>
        </div>
      )}
    </div>
  );
}