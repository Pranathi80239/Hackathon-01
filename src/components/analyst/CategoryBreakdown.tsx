import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function CategoryBreakdown() {
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);

  useEffect(() => {
    loadCategoryData();
  }, []);

  async function loadCategoryData() {
    try {
      const { data, error } = await supabase
        .from('food_listings')
        .select('category');

      if (error) throw error;

      const categoryCounts: Record<string, number> = {};
      data?.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      });

      const categoryArray = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      setCategories(categoryArray);
    } catch (error) {
      console.error('Error loading category data:', error);
    }
  }

  const maxCount = Math.max(...categories.map(c => c.count), 1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Food Category Breakdown</h2>

      <div className="space-y-4">
        {categories.map((item) => (
          <div key={item.category}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">{item.category}</span>
              <span className="text-gray-600">{item.count} items</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-gray-600 text-center py-8">No data available</p>
        )}
      </div>
    </div>
  );
}
