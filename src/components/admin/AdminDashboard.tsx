import { useState, useEffect } from 'react';
import { Users, Package, Heart, TrendingUp } from 'lucide-react';
import { supabase, Profile, FoodListing, DonationRequest } from '../../lib/supabase';
import UserManagement from './UserManagement';
import ListingsOverview from './ListingsOverview';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'requests'>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    donors: 0,
    recipients: 0,
    totalListings: 0,
    activeListings: 0,
    totalRequests: 0,
    openRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [usersResult, listingsResult, requestsResult] = await Promise.all([
        supabase.from('profiles').select('role'),
        supabase.from('food_listings').select('status'),
        supabase.from('donation_requests').select('status'),
      ]);

      const users = usersResult.data || [];
      const listings = listingsResult.data || [];
      const requests = requestsResult.data || [];

      setStats({
        totalUsers: users.length,
        donors: users.filter(u => u.role === 'donor').length,
        recipients: users.filter(u => u.role === 'recipient').length,
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'available').length,
        totalRequests: requests.length,
        openRequests: requests.filter(r => r.status === 'open').length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {activeTab === 'overview' && (
        <>
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
                      <p className="text-gray-600 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.donors} donors, {stats.recipients} recipients
                      </p>
                    </div>
                    <Users className="text-green-600" size={32} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Food Listings</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalListings}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.activeListings} active
                      </p>
                    </div>
                    <Package className="text-blue-600" size={32} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Requests</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRequests}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.openRequests} open
                      </p>
                    </div>
                    <Heart className="text-red-600" size={32} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Impact</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeListings}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        items available
                      </p>
                    </div>
                    <TrendingUp className="text-green-600" size={32} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Activity</h2>
                <p className="text-gray-600">
                  The platform is actively connecting food donors with recipient organizations
                  to reduce waste and improve food security.
                </p>
              </div>
            </>
          )}
        </>
      )}

      <div className="bg-white rounded-lg shadow mt-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'listings'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Listings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && <UserManagement onUpdate={loadStats} />}
          {activeTab === 'listings' && <ListingsOverview onUpdate={loadStats} />}
        </div>
      </div>
    </div>
  );
}
