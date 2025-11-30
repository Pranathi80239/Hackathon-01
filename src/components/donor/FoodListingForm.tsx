import { useState } from 'react';
import { supabase, FoodListing } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type FoodListingFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
  listing?: FoodListing;
};

const categories = [
  'Produce',
  'Dairy',
  'Bakery',
  'Prepared Meals',
  'Canned Goods',
  'Frozen',
  'Beverages',
  'Other'
];

export default function FoodListingForm({ onSuccess, onCancel, listing }: FoodListingFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(listing?.title || '');
  const [description, setDescription] = useState(listing?.description || '');
  const [category, setCategory] = useState(listing?.category || categories[0]);
  const [quantity, setQuantity] = useState(listing?.quantity || '');
  const [expiryDate, setExpiryDate] = useState(listing?.expiry_date || '');
  const [pickupLocation, setPickupLocation] = useState(listing?.pickup_location || '');
  const [pickupInstructions, setPickupInstructions] = useState(listing?.pickup_instructions || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (listing) {
        const { error } = await supabase
          .from('food_listings')
          .update({
            title,
            description,
            category,
            quantity,
            expiry_date: expiryDate || null,
            pickup_location: pickupLocation,
            pickup_instructions: pickupInstructions || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', listing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('food_listings').insert({
          donor_id: user!.id,
          title,
          description,
          category,
          quantity,
          expiry_date: expiryDate || null,
          pickup_location: pickupLocation,
          pickup_instructions: pickupInstructions || null,
          status: 'available',
        });

        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g., Fresh vegetables from farm"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          placeholder="Provide details about the food items..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            placeholder="e.g., 10 kg, 50 servings"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expiry Date (Optional)
        </label>
        <input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pickup Location
        </label>
        <input
          type="text"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          required
          placeholder="Address or general location"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pickup Instructions (Optional)
        </label>
        <textarea
          value={pickupInstructions}
          onChange={(e) => setPickupInstructions(e.target.value)}
          rows={2}
          placeholder="Special instructions for pickup..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Saving...' : listing ? 'Update Listing' : 'Create Listing'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
