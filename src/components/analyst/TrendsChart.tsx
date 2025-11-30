import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function TrendsChart() {
  const [monthlyData, setMonthlyData] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    loadTrendsData();
  }, []);

  async function loadTrendsData() {
    try {
      const { data, error } = await supabase
        .from('food_listings')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const monthlyCounts: Record<string, number> = {};
      data?.forEach(item => {
        const date = new Date(item.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
      });

      const monthlyArray = Object.entries(monthlyCounts)
        .map(([month, count]) => ({ month, count }))
        .slice(-6);

      setMonthlyData(monthlyArray);
    } catch (error) {
      console.error('Error loading trends data:', error);
    }
  }

  const maxCount = Math.max(...monthlyData.map(d => d.count), 1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-green-600" size={24} />
        <h2 className="text-xl font-bold text-gray-900">Monthly Trends</h2>
      </div>

      <div className="space-y-4">
        {monthlyData.map((item) => {
          const [year, month] = item.month.split('-');
          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

          return (
            <div key={item.month}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">{monthName}</span>
                <span className="text-gray-600">{item.count} listings</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          );
        })}

        {monthlyData.length === 0 && (
          <p className="text-gray-600 text-center py-8">No trend data available</p>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          Track the growth of food donations over time to measure platform impact and identify seasonal trends.
        </p>
      </div>
    </div>
  );
}
