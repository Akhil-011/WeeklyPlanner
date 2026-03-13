import { Week, Task, HabitTracking } from '@/types';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthlyCalendarViewProps {
  weeks: Week[];
  tasksMap: Record<string, Task[]>;
  trackingMap: Record<string, HabitTracking[]>;
  currentMonth: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onWeekSelect: (week: Week) => void;
}

export function MonthlyCalendarView({
  weeks,
  tasksMap,
  trackingMap,
  currentMonth,
  onMonthChange,
  onWeekSelect,
}: MonthlyCalendarViewProps) {
  const getWeekCompletion = (weekId: string): number => {
    const tasks = tasksMap[weekId] || [];
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return (completed / tasks.length) * 100;
  };

  const getCompletionColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-green-400';
    if (percentage >= 40) return 'bg-yellow-400';
    if (percentage >= 20) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getTrend = (): { direction: 'up' | 'down' | 'stable'; percentage: number } => {
    if (weeks.length < 2) return { direction: 'stable', percentage: 0 };
    
    const sortedWeeks = [...weeks].sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
    
    const recentWeeks = sortedWeeks.slice(-2);
    const prevCompletion = getWeekCompletion(recentWeeks[0].id);
    const currentCompletion = getWeekCompletion(recentWeeks[1].id);
    
    const diff = currentCompletion - prevCompletion;
    
    if (diff > 5) return { direction: 'up', percentage: diff };
    if (diff < -5) return { direction: 'down', percentage: Math.abs(diff) };
    return { direction: 'stable', percentage: 0 };
  };

  const trend = getTrend();

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Monthly Overview</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-sm">
            {trend.direction === 'up' && (
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+{trend.percentage.toFixed(0)}% trend</span>
              </div>
            )}
            {trend.direction === 'down' && (
              <div className="flex items-center text-red-600">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span>-{trend.percentage.toFixed(0)}% trend</span>
              </div>
            )}
            {trend.direction === 'stable' && (
              <div className="flex items-center text-gray-600">
                <Minus className="h-4 w-4 mr-1" />
                <span>Stable</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onMonthChange('prev')}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-700 min-w-[100px] sm:min-w-[120px] text-center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <Button
              onClick={() => onMonthChange('next')}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {weeks.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 text-sm">
            No weeks found for this month
          </div>
        )}
        
        {weeks.map((week) => {
          const completion = getWeekCompletion(week.id);
          const tasks = tasksMap[week.id] || [];
          const tracking = trackingMap[week.id] || [];
          
          return (
            <button
              key={week.id}
              onClick={() => onWeekSelect(week)}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">
                  Week of {new Date(week.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className={`w-3 h-3 rounded-full ${getCompletionColor(completion)}`} />
              </div>
              
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Completion</span>
                  <span className="font-semibold">{completion.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getCompletionColor(completion)}`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Tasks:</span>
                  <span className="font-medium">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Habits:</span>
                  <span className="font-medium">{tracking.filter(t => t.completed).length}</span>
                </div>
              </div>

              {week.weekly_focus && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 italic truncate">
                    "{week.weekly_focus}"
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
