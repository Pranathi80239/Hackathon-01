import { useState, useEffect } from 'react';
import { Search, Heart, CheckCircle } from 'lucide-react';
import { supabase, FoodListing, DonationRequest } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import AvailableFoodList from './AvailableFoodList';
import RequestForm from './RequestForm';
import MyRequests from './MyRequests';

export default function RecipientDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'requests'>('browse');
  const [availableFood, setAvailableFood] = useState<FoodListing[]>([]);
  const [myRequests, setMyRequests] = useState<DonationRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ available: 0, myRequests: 0, fulfilled: 0 });

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    try {
      const [foodResult, requestsResult] = await Promise.all([
        supabase
          .from('food_listings')
          .select('*')
          .eq('status', 'available')
          .order('created_at', { ascending: false }),
        supabase
          .from('donation_requests')
          .select('*')
          .eq('recipient_id', user!.id)
          .order('created_at', { ascending: false }),
      ]);

      if (foodResult.error) throw foodResult.error;
      if (requestsResult.error) throw requestsResult.error;

      setAvailableFood(foodResult.data || []);
      setMyRequests(requestsResult.data || []);

      const fulfilled = requestsResult.data?.filter(r => r.status === 'fulfilled').length || 0;
      setStats({
        available: foodResult.data?.length || 0,
        myRequests: requestsResult.data?.length || 0,
        fulfilled,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Food Recipient Portal</h1>
        <button
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Heart size={20} />
          New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Available Food</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.available}</p>
            </div>
            <Search className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">My Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.myRequests}</p>
            </div>
            <Heart className="text-gray-900" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Fulfilled</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.fulfilled}</p>
            </div>
            <CheckCircle className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {showRequestForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create Food Request</h2>
          <RequestForm
            onSuccess={() => {
              setShowRequestForm(false);
              loadData();
            }}
            onCancel={() => setShowRequestForm(false)}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'browse'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Browse Available Food
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'requests'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Requests
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            </div>
          ) : activeTab === 'browse' ? (
            <AvailableFoodList items={availableFood} onUpdate={loadData} />
          ) : (
            <MyRequests requests={myRequests} onUpdate={loadData} />
          )}
        </div>
      </div>
    </div>
  );
}
