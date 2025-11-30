import { useEffect, useState } from 'react';
import { Heart, Apple, Droplets } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ImpactMetrics() {
  const [metrics, setMetrics] = useState({
    mealsProvided: 0,
    foodSaved: 0,
    waterSaved: 0,
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const { data, error } = await supabase
        .from('waste_analytics')
        .select('*');

      if (error) throw error;

      const analytics = data || [];
      const mealsProvided = analytics.reduce((sum, a) => sum + a.meals_provided, 0);
      const foodSaved = analytics.reduce((sum, a) => sum + Number(a.food_saved_kg), 0);
      const waterSaved = Math.round(foodSaved * 2.5);

      setMetrics({
        mealsProvided,
        foodSaved: Math.round(foodSaved),
        waterSaved,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Impact Metrics</h2>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <Heart className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metrics.mealsProvided}</p>
            <p className="text-sm text-gray-600">Meals Provided</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Apple className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metrics.foodSaved} kg</p>
            <p className="text-sm text-gray-600">Food Waste Prevented</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-cyan-100 p-3 rounded-lg">
            <Droplets className="text-cyan-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metrics.waterSaved} L</p>
            <p className="text-sm text-gray-600">Water Saved (est.)</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-gray-700">
          Every kilogram of food saved prevents approximately 2.5 liters of water waste
          and reduces carbon emissions.
        </p>
      </div>
    </div>
  );
}
