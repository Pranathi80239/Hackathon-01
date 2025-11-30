import { useState } from 'react';
import { Calendar, MapPin, Package, Heart } from 'lucide-react';
import { FoodListing, supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type AvailableFoodListProps = {
  items: FoodListing[];
  onUpdate: () => void;
};

export default function AvailableFoodList({ items, onUpdate }: AvailableFoodListProps) {
  const { user } = useAuth();
  const [requesting, setRequesting] = useState<string | null>(null);

  async function requestFood(listing: FoodListing) {
    setRequesting(listing.id);
    try {
      const { error: donationError } = await supabase.from('donations').insert({
        listing_id: listing.id,
        donor_id: listing.donor_id,
        recipient_id: user!.id,
        quantity: listing.quantity,
        status: 'pending',
      });

      if (donationError) throw donationError;

      const { error: updateError } = await supabase
        .from('food_listings')
        .update({ status: 'reserved', updated_at: new Date().toISOString() })
        .eq('id', listing.id);

      if (updateError) throw updateError;

      onUpdate();
    } catch (error) {
      console.error('Error requesting food:', error);
    } finally {
      setRequesting(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No food available</h3>
        <p className="text-gray-600">Check back later for new donations</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.id} className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Package size={16} className="text-gray-400" />
              <span>{item.category} - {item.quantity}</span>
            </div>

            {item.expiry_date && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar size={16} className="text-gray-400" />
                <span>Expires: {new Date(item.expiry_date).toLocaleDateString()}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin size={16} className="text-gray-400" />
              <span className="line-clamp-1">{item.pickup_location}</span>
            </div>
          </div>

          {item.pickup_instructions && (
            <p className="text-xs text-gray-600 mb-4 italic">
              Pickup: {item.pickup_instructions}
            </p>
          )}

          <button
            onClick={() => requestFood(item)}
            disabled={requesting === item.id}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            <Heart size={16} />
            {requesting === item.id ? 'Requesting...' : 'Request This Food'}
          </button>
        </div>
      ))}
    </div>
  );
}
