import { useAuth } from './contexts/AuthContext';
import AuthForm from './components/auth/AuthForm';
import Header from './components/Header';
import DonorDashboard from './components/donor/DonorDashboard';
import RecipientDashboard from './components/recipient/RecipientDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import AnalystDashboard from './components/analyst/AnalystDashboard';

function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">FoodShare Platform</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connecting food donors with recipient organizations to reduce waste and improve food security
            </p>
          </div>
          <div className="flex justify-center">
            <AuthForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main>
        {profile.role === 'donor' && <DonorDashboard />}
        {profile.role === 'recipient' && <RecipientDashboard />}
        {profile.role === 'admin' && <AdminDashboard />}
        {profile.role === 'analyst' && <AnalystDashboard />}
      </main>
    </div>
  );
}

export default App;
