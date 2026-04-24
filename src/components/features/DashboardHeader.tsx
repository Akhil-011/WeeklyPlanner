import { format } from 'date-fns';
import { LogOut, User, Moon, Sun, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { MotivationalQuotes } from './MotivationalQuotes';

interface DashboardHeaderProps {
  currentDate: Date;
  habitsCompleted: number;
  isPwaMobile?: boolean;
  autoRotateEnabled?: boolean;
  onToggleAutoRotate?: () => void;
}

export function DashboardHeader({ currentDate, habitsCompleted, isPwaMobile = false, autoRotateEnabled = false, onToggleAutoRotate }: DashboardHeaderProps) {
  const { logout, user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const monthName = format(currentDate, 'MMMM').toUpperCase();
  const dateDisplay = format(currentDate, 'EEEE, d MMM');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerOpacity = Math.max(0.72, 0.94 - scrollY / 900);

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2 sm:py-4 animate-fade-in backdrop-blur-md transition-all duration-200"
        style={{
          backgroundColor: isDarkMode
            ? `rgba(17, 24, 39, ${headerOpacity})`
            : `rgba(255, 255, 255, ${headerOpacity})`,
        }}
      >
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 lg:gap-4">
          <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold leading-tight text-gray-800 dark:text-white">{monthName}</h1>
                <Button
                  onClick={toggleDarkMode}
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle theme"
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="h-8 w-8 sm:h-10 sm:w-10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  {isDarkMode ? <Sun /> : <Moon />}
                </Button>
              </div>
              <p className="hidden sm:block text-xs text-gray-600 dark:text-gray-400 truncate">{dateDisplay}</p>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 min-w-0 justify-center px-3">
            <MotivationalQuotes />
          </div>

          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {isPwaMobile && (
              <Button
                onClick={onToggleAutoRotate}
                variant="ghost"
                size="icon"
                aria-label="Toggle auto-rotate"
                title={autoRotateEnabled ? 'Lock orientation' : 'Enable auto-rotate'}
                className="h-8 w-8 sm:h-10 sm:w-10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <RotateCw className={`h-4 w-4 ${autoRotateEnabled ? 'text-green-600' : ''}`} />
              </Button>
            )}
            <div className="text-right flex-shrink-0">
              <div className="hidden sm:block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 leading-none mb-0.5">Habits Completed</div>
              <div className="text-base sm:text-2xl lg:text-3xl font-bold leading-none text-green-600 dark:text-green-400 animate-count">{habitsCompleted}</div>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
              <Button
                onClick={() => setShowProfile(true)}
                variant="ghost"
                size="sm"
                className="h-8 px-1.5 sm:h-11 sm:px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <User className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden md:inline">Profile</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="h-8 px-1.5 sm:h-11 sm:px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <LogOut className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Profile</h2>
              <button onClick={() => setShowProfile(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{user?.username || 'User'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email || 'Loading...'}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Email Address</p>
                <p className="text-base font-medium text-gray-800 dark:text-white">{user?.email || 'Loading...'}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Member Since</p>
                <p className="text-base font-medium text-gray-800 dark:text-white">{user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'Loading...'}</p>
              </div>

              <button
                onClick={() => setShowProfile(false)}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition-colors mt-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
