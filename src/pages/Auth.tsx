import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const APP_LOGO_URL = 'https://ik.imagekit.io/d2msyju70/Gemini_Generated_Image_bqhigvbqhigvbqhi.png';

export function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const modeFromQuery = new URLSearchParams(location.search).get('mode');
    setMode(modeFromQuery === 'register' ? 'register' : 'login');
  }, [location.search]);

  const handleRegister = async () => {
    if (!email || !password || !name || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    const username = name;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      login({
        id: data.user.id,
        email: data.user.email!,
        username,
        createdAt: data.user.created_at,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      login({
        id: data.user.id,
        email: data.user.email!,
        username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
        createdAt: data.user.created_at,
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Button
        onClick={() => navigate('/')}
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      <Button
        onClick={toggleDarkMode}
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src={APP_LOGO_URL}
            alt="Weekly Planner logo"
            className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
            loading="eager"
            decoding="async"
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Weekly Planner</h1>
          <p className="text-gray-600 dark:text-gray-300">Your productivity companion</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-card p-8 border border-gray-100 dark:border-gray-700">
          {mode === 'login' && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Sign In</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => setMode('register')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Don't have an account? Register
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === 'register' && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create Account</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => setMode('login')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          <p>Track your tasks • Build habits • Achieve goals</p>
        </div>
      </div>
    </div>
  );
}
