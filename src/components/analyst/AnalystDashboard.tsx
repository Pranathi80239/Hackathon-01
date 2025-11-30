import { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, Leaf } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImpactMetrics from './ImpactMetrics';
import CategoryBreakdown from './CategoryBreakdown';
import TrendsChart from './TrendsChart';

export default function AnalystDashboard() {
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonors: 0,
    activeRecipients: 0,
    foodSaved: 0,
    mealsProvided: 0,
    co2Saved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const [donationsResult, profilesResult, analyticsResult] = await Promise.all([
        supabase.from('donations').select('*'),
        supabase.from('profiles').select('role'),
        supabase.from('waste_analytics').select('*'),
      ]);

      const donations = donationsResult.data || [];
      const profiles = profilesResult.data || [];
      const analytics = analyticsResult.data || [];

      const foodSaved = analytics.reduce((sum, a) => sum + Number(a.food_saved_kg), 0);
      const mealsProvided = analytics.reduce((sum, a) => sum + a.meals_provided, 0);
      const co2Saved = analytics.reduce((sum, a) => sum + Number(a.co2_saved_kg), 0);

      setStats({
        totalDonations: donations.length,
        activeDonors: profiles.filter(p => p.role === 'donor').length,
        activeRecipients: profiles.filter(p => p.role === 'recipient').length,
        foodSaved: Math.round(foodSaved),
        mealsProvided,
        co2Saved: Math.round(co2Saved * 10) / 10,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Donations</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalDonations}</p>
                </div>
                <Package className="text-green-600" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.activeDonors + stats.activeRecipients}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.activeDonors}D / {stats.activeRecipients}R
                  </p>
                </div>
                <Users className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Food Saved</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.foodSaved}</p>
                  <p className="text-xs text-gray-500 mt-1">kilograms</p>
                </div>
                <TrendingUp className="text-green-600" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">CO2 Saved</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.co2Saved}</p>
                  <p className="text-xs text-gray-500 mt-1">kg CO2</p>
                </div>
                <Leaf className="text-blue-600" size={32} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ImpactMetrics />
            <CategoryBreakdown />
          </div>

          <TrendsChart />
        </>
      )}
    </div>
  );
}
