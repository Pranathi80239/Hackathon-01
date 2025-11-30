import { AlertCircle, Package } from 'lucide-react';
import { DonationRequest, supabase } from '../../lib/supabase';

type MyRequestsProps = {
  requests: DonationRequest[];
  onUpdate: () => void;
};

export default function MyRequests({ requests, onUpdate }: MyRequestsProps) {
  const statusColors = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    fulfilled: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const urgencyColors = {
    low: 'text-gray-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  };

  async function updateStatus(requestId: string, newStatus: DonationRequest['status']) {
    try {
      const { error } = await supabase
        .from('donation_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating request:', error);
    }
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests yet</h3>
        <p className="text-gray-600">Create a request to let donors know what you need</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                {request.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4">{request.description}</p>

          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-gray-400" />
              <span className="text-gray-700">{request.category} - {request.quantity_needed}</span>
            </div>

            <div className="flex items-center gap-2">
              <AlertCircle size={16} className={urgencyColors[request.urgency]} />
              <span className={urgencyColors[request.urgency]}>
                {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Created: {new Date(request.created_at).toLocaleDateString()}
          </div>

          {request.status === 'open' && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => updateStatus(request.id, 'fulfilled')}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Mark Fulfilled
              </button>
              <button
                onClick={() => updateStatus(request.id, 'cancelled')}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
