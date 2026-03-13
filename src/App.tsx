import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Dashboard } from '@/pages/Dashboard';
import { Auth } from '@/pages/Auth';
import { Landing } from '@/pages/Landing';
import { RootLayout } from '@/components/layout/RootLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return !user ? <>{children}</> : <Navigate to="/dashboard" />;
}

function App() {
  const router = createBrowserRouter(
    [
      {
        element: <RootLayout />,
        children: [
          {
            path: '/',
            element: (
              <PublicRoute>
                <Landing />
              </PublicRoute>
            ),
          },
          {
            path: '/dashboard',
            element: (
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            ),
          },
          {
            path: '/auth',
            element: (
              <PublicRoute>
                <Auth />
              </PublicRoute>
            ),
          },
        ],
      },
    ],
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  );

  return <RouterProvider router={router} />;
}

export default App;
