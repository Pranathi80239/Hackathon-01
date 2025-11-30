import { useState, useEffect } from 'react';
import { Plus, Package, TrendingUp } from 'lucide-react';
import { supabase, FoodListing } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import FoodListingForm from './FoodListingForm';
import FoodListingCard from './FoodListingCard';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, available: 0, completed: 0 });

  useEffect(() => {
    loadListings();
  }, [user]);

  async function loadListings() {
    try {
      const { data, error } = await supabase
        .from('food_listings')
        .select('*')
        .eq('donor_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setListings(data || []);

      const total = data?.length || 0;
      const available = data?.filter(l => l.status === 'available').length || 0;
      const completed = data?.filter(l => l.status === 'completed').length || 0;
      setStats({ total, available, completed });
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Food Donations</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          New Listing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Listings</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Package className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.available}</p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.completed}</p>
            </div>
            <Package className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Listing</h2>
          <FoodListingForm
            onSuccess={() => {
              setShowForm(false);
              loadListings();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-600 mb-4">Create your first food listing to start sharing surplus food</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <FoodListingCard
              key={listing.id}
              listing={listing}
              onUpdate={loadListings}
            />
          ))}
        </div>
      )}
    </div>
  );
}
