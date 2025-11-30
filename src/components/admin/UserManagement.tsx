import { useState, useEffect } from 'react';
import { User, Mail, Building } from 'lucide-react';
import { supabase, Profile } from '../../lib/supabase';

type UserManagementProps = {
  onUpdate: () => void;
};

export default function UserManagement({ onUpdate }: UserManagementProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Profile['role']>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.role === filter);

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    donor: 'bg-green-100 text-green-800',
    recipient: 'bg-blue-100 text-blue-800',
    analyst: 'bg-purple-100 text-purple-800',
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
          All Users ({users.length})
        </button>
        <button
          onClick={() => setFilter('donor')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'donor'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Donors
        </button>
        <button
          onClick={() => setFilter('recipient')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'recipient'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Recipients
        </button>
        <button
          onClick={() => setFilter('analyst')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'analyst'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Analysts
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="text-gray-400" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="space-y-1 ml-8">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </div>

                    {user.organization_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building size={14} />
                        <span>{user.organization_name}</span>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
