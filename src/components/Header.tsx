import { LogOut, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { profile, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Leaf className="text-green-600" size={32} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">FoodShare</h1>
              <p className="text-xs text-gray-600">Reducing waste, improving security</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {profile && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                <p className="text-xs text-gray-600 capitalize">{profile.role}</p>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
