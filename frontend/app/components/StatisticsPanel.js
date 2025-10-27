'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatisticsPanel({ results, columns }) {
  if (!results || results.length === 0) return null;

  // Calculate statistics for numeric columns
  const getStatistics = () => {
    const stats = {};

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

  const statistics = getStatistics();
  const hasStats = Object.keys(statistics).length > 0;

  if (!hasStats) return null;

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      <h4 className="text-sm font-semibold text-gray-400 mb-3">
        Quick Statistics:
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(statistics).map(([col, stats]) => (
          <div key={col} className="bg-gray-900 rounded-lg p-4">
            <h5 className="text-xs font-semibold text-purple-400 mb-3 uppercase tracking-wider">
              {col}
            </h5>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Count:</span>
                <span className="text-sm font-semibold text-white">{stats.count}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Sum:</span>
                <span className="text-sm font-semibold text-white">{stats.sum}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Average:</span>
                <span className="text-sm font-semibold text-blue-400">{stats.average}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                <span className="text-xs text-gray-400">Min:</span>
                <span className="text-sm font-semibold text-green-400 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {stats.min}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Max:</span>
                <span className="text-sm font-semibold text-red-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stats.max}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Range:</span>
                <span className="text-sm font-semibold text-yellow-400">{stats.range}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}