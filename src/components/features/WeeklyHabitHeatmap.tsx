import { Habit, HabitTracking } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface WeeklyHabitHeatmapProps {
  weekDates: Date[];
  habits: Habit[];
  tracking: HabitTracking[];
}

export function WeeklyHabitHeatmap({ weekDates, habits, tracking }: WeeklyHabitHeatmapProps) {
  const getDayName = (dayIndex: number): string => {
    const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return names[dayIndex];
  };

  const getCompletedHabitsForDay = (dayIndex: number): number => {
    return tracking.filter(t => t.day_index === dayIndex && t.completed).length;
  };

  const getTotalHabitsForDay = (dayIndex: number): number => {
    return habits.filter(h => h.is_active).length;
  };

  // Color based on number of habits completed
  const getIntensityColor = (completed: number, total: number): string => {
    if (total === 0) return 'bg-gray-200 hover:bg-gray-300';
    
    const percentage = (completed / total) * 100;
    
    if (completed === 0) return 'bg-gray-200 hover:bg-gray-300';
    if (percentage <= 25) return 'bg-blue-200 hover:bg-blue-300';
    if (percentage <= 50) return 'bg-blue-400 hover:bg-blue-500';
    if (percentage <= 75) return 'bg-blue-600 hover:bg-blue-700';
    return 'bg-blue-800 hover:bg-blue-900';
  };

  const getCompletionLabel = (completed: number, total: number): string => {
    if (total === 0) return 'No habits';
    if (completed === 0) return 'Not started';
    return `${completed}/${total} habits`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100 animate-slide-up">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Habit Heatmap</h2>
      
      <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
        {weekDates.map((date, dayIndex) => {
          const completed = getCompletedHabitsForDay(dayIndex);
          const total = getTotalHabitsForDay(dayIndex);
          const dayDate = new Date(date);
          dayDate.setHours(0, 0, 0, 0);
          const isToday = dayDate.getTime() === today.getTime();

          return (
            <TooltipProvider key={dayIndex}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex flex-col items-center rounded-lg p-3 transition-all ${
                      isToday ? 'ring-2 ring-green-500 ring-offset-1' : ''
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      {getDayName(dayIndex)}
                    </div>
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center text-white font-bold text-sm sm:text-lg transition-colors ${getIntensityColor(
                        completed,
                        total
                      )}`}
                    >
                      {completed}/{total}
                    </div>
                    <div className="text-xs text-gray-700 mt-2 font-semibold">
                      {format(date, 'dd')}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    {getDayName(dayIndex)}, {format(date, 'MMM dd')}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {getCompletionLabel(completed, total)}
                  </p>
                  {total > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {Math.round((completed / total) * 100)}% complete
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {getTotalHabitsForDay(0) === 0 && (
        <p className="text-sm text-gray-500 mt-4">
          Add habits to visualize your daily progress in this heatmap.
        </p>
      )}
    </div>
  );
}
