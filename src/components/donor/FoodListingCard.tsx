import { Calendar, MapPin, Package } from 'lucide-react';
import { FoodListing, supabase } from '../../lib/supabase';

type FoodListingCardProps = {
  listing: FoodListing;
  onUpdate: () => void;
};

export default function FoodListingCard({ listing, onUpdate }: FoodListingCardProps) {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  async function updateStatus(newStatus: FoodListing['status']) {
    try {
      const { error } = await supabase
        .from('food_listings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', listing.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[listing.status]}`}>
            {listing.status}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

        <div className="space-y-2 mb-4">
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
        </div>

        {listing.status === 'available' && (
          <div className="flex gap-2">
            <button
              onClick={() => updateStatus('completed')}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Mark Complete
            </button>
            <button
              onClick={() => updateStatus('cancelled')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
