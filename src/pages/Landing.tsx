import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Target, TrendingUp, Sparkles, ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const APP_LOGO_URL = 'https://ik.imagekit.io/d2msyju70/Gemini_Generated_Image_bqhigvbqhigvbqhi.png';

export function Landing() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="px-4 sm:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img
            src={APP_LOGO_URL}
            alt="Weekly Planner logo"
            className="w-10 h-10 rounded-lg object-cover"
            loading="eager"
            decoding="async"
          />
          <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Weekly Planner</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            onClick={toggleDarkMode}
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link to="/auth?mode=login">
            <Button variant="ghost" className="hidden sm:inline-flex text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Sign In
            </Button>
          </Link>
          <Link to="/auth?mode=register">
            <Button className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Stay Focussed!
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Plan Your Week,<br />
            <span className="text-green-600 dark:text-green-400">Achieve Your Goals</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Track your daily tasks, build lasting habits, and reflect on your progress. 
            Weekly Planner helps you stay organized and motivated every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                Start Planning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to stay on track
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Simple yet powerful tools to help you organize your week and build better habits.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />}
              title="Task Management"
              description="Organize daily, weekly, and monthly tasks with easy tracking and completion status."
            />
            <FeatureCard
              icon={<Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
              title="Habit Tracking"
              description="Build and maintain positive habits with visual streaks and progress indicators."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />}
              title="Progress Overview"
              description="See your accomplishments at a glance with intuitive charts and statistics."
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-amber-600 dark:text-amber-400" />}
              title="Weekly Reflections"
              description="Reflect on what went well and areas for improvement to grow continuously."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your productivity?
            </h2>
            <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have improved their weekly planning and habit building.
            </p>
            <Link to="/auth?mode=register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 px-8 py-6 text-lg">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src={APP_LOGO_URL}
              alt="Weekly Planner logo"
              className="w-8 h-8 rounded-lg object-cover"
              loading="lazy"
              decoding="async"
            />
            <span className="font-semibold text-gray-900 dark:text-white">Weekly Planner</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Weekly Planner. Track your tasks, build habits, achieve goals.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
