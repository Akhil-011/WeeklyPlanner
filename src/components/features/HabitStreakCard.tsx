import { Habit, HabitTracking } from '@/types';
import { calculateCurrentStreak, calculateLongestStreak, getStreakMilestone } from '@/lib/streakUtils';
import { Flame, Trophy, Target } from 'lucide-react';

interface HabitStreakCardProps {
  habits: Habit[];
  tracking: HabitTracking[];
}

export function HabitStreakCard({ habits, tracking }: HabitStreakCardProps) {
  const getHabitStreaks = (habitId: string) => {
    const habitTracking = tracking.filter(t => t.habit_id === habitId);
    
    // Calculate current streak (consecutive days from most recent)
    let currentStreak = 0;
    const sortedTracking = [...habitTracking]
      .filter(t => t.completed)
      .sort((a, b) => {
        // Sort by week and day descending
        if (a.week_id === b.week_id) {
          return b.day_index - a.day_index;
        }
        return b.week_id.localeCompare(a.week_id);
      });
    
    for (let i = 0; i < sortedTracking.length; i++) {
      currentStreak++;
      // Check if next day is consecutive
      if (i < sortedTracking.length - 1) {
        const current = sortedTracking[i];
        const next = sortedTracking[i + 1];
        
        if (current.week_id === next.week_id) {
          if (current.day_index - next.day_index !== 1) break;
        } else {
          if (current.day_index !== 0 || next.day_index !== 6) break;
        }
      }
    }
    
    const longestStreak = calculateLongestStreak(habitId, tracking);
    
    return { currentStreak, longestStreak };
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-800">Habit Streaks</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.filter(h => h.is_active).map((habit) => {
          const { currentStreak, longestStreak } = getHabitStreaks(habit.id);
          const milestone = getStreakMilestone(currentStreak);

          return (
            <div
              key={habit.id}
              className="bg-gradient-to-br from-primary-50 to-green-50 rounded-lg p-4 border border-primary-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-800 text-sm">{habit.name}</h3>
                {currentStreak > 0 && (
                  <Flame className="h-5 w-5 text-orange-500 flex-shrink-0" />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary-600" />
                    <span className="text-xs text-gray-600">Current Streak</span>
                  </div>
                  <span className="text-lg font-bold text-primary-700">
                    {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs text-gray-600">Longest Streak</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
                  </span>
                </div>

                {milestone && (
                  <div className="mt-3 pt-3 border-t border-primary-200">
                    <div className="text-center">
                      <div className="text-2xl mb-1">{milestone.emoji}</div>
                      <p className="text-xs font-medium text-primary-700">
                        {milestone.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {habits.filter(h => h.is_active).length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 text-sm">
            Add habits to start tracking streaks!
          </div>
        )}
      </div>
    </div>
  );
}
