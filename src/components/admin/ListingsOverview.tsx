import { useState, useEffect } from 'react';
import { Package, Calendar, MapPin } from 'lucide-react';
import { supabase, FoodListing } from '../../lib/supabase';

type ListingsOverviewProps = {
  onUpdate: () => void;
};

export default function ListingsOverview({ onUpdate }: ListingsOverviewProps) {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | FoodListing['status']>('all');

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    try {
      const { data, error } = await supabase
        .from('food_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredListings = filter === 'all' ? listings : listings.filter(l => l.status === filter);

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({listings.length})
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'available'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Available
        </button>
        <button
          onClick={() => setFilter('reserved')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'reserved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Reserved
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[listing.status]}`}>
                  {listing.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Package size={16} className="text-gray-400" />
                  <span>{listing.category} - {listing.quantity}</span>
                </div>

                {listing.expiry_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Expires: {new Date(listing.expiry_date).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="line-clamp-1">{listing.pickup_location}</span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Created: {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600">No listings found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
