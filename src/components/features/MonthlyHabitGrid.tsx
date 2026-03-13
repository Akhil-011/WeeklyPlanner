import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Habit, HabitTracking, Week } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface MonthlyHabitGridProps {
  habits: Habit[];
  weeks: Week[];
  trackingMap: Record<string, HabitTracking[]>;
  onAddHabit: (name: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleHabit: (habitId: string, weekId: string, dayIndex: number, completed: boolean) => void;
  currentDate: Date;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthlyHabitGrid({ 
  habits, 
  weeks, 
  trackingMap,
  onAddHabit, 
  onDeleteHabit, 
  onToggleHabit,
  currentDate
}: MonthlyHabitGridProps) {
  const [newHabit, setNewHabit] = useState('');

  const handleAddHabit = () => {
    if (newHabit.trim()) {
      onAddHabit(newHabit.trim());
      setNewHabit('');
    }
  };

  const getHabitCompletion = (habitId: string, weekId: string, dayIndex: number): boolean => {
    const tracking = trackingMap[weekId] || [];
    return tracking.some(t => t.habit_id === habitId && t.day_index === dayIndex && t.completed);
  };

  const getWeekNumber = (week: Week): number => {
    const startDate = new Date(week.start_date);
    const startOfYear = new Date(startDate.getFullYear(), 0, 1);
    const days = Math.floor((startDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  const isDayInFuture = (week: Week, dayIndex: number): boolean => {
    const weekStartDate = new Date(week.start_date);
    const targetDate = new Date(weekStartDate);
    targetDate.setDate(weekStartDate.getDate() + dayIndex);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    
    return target > today; // Only block future days, allow past and today

  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100 animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Monthly Habit Tracker
          {habits.filter(h => h.is_active).length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({habits.filter(h => h.is_active).length} {habits.filter(h => h.is_active).length === 1 ? 'habit' : 'habits'})
            </span>
          )}
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddHabit()}
            placeholder="New habit..."
            className="flex-1 sm:w-48 text-sm border-gray-200"
          />
          <Button
            onClick={handleAddHabit}
            size="sm"
            className="bg-green-600 hover:bg-green-700 ripple"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            {/* Week Headers */}
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-2 sm:px-4 text-sm font-semibold text-gray-800 bg-gray-50 sticky left-0 z-10 min-w-[100px] sm:min-w-[150px]">
                Habits
              </th>
              {weeks.map((week) => (
                <th 
                  key={week.id} 
                  colSpan={7} 
                  className="text-center py-3 px-2 text-sm font-semibold text-gray-800 bg-green-50 border-l-2 border-gray-200"
                >
                  Week {getWeekNumber(week)}
                </th>
              ))}
              <th className="py-3 px-2 bg-gray-50"></th>
            </tr>
            {/* Day Headers */}
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50"></th>
              {weeks.map((week, weekIdx) => (
                DAYS.map((day, dayIdx) => (
                  <th 
                    key={`${week.id}-${dayIdx}`} 
                    className={`text-center py-2 px-1 text-xs font-medium text-gray-600 ${
                      dayIdx === 0 ? 'border-l-2 border-gray-200' : ''
                    }`}
                  >
                    {day}
                  </th>
                ))
              ))}
              <th className="bg-gray-50"></th>
            </tr>
          </thead>
          <tbody>
            {habits.filter(h => h.is_active).map((habit, habitIdx) => (
              <tr 
                key={habit.id} 
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  habitIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
              >
                <td className="py-3 px-4 text-sm font-medium text-gray-800 sticky left-0 z-10 bg-inherit">
                  <div 
                    className="w-3 h-3 rounded-full inline-block mr-2" 
                    style={{ backgroundColor: habit.color || '#10b981' }}
                  />
                  {habit.name}
                </td>
                {weeks.map((week) => (
                  DAYS.map((_, dayIndex) => {
                    const isFuture = isDayInFuture(week, dayIndex);
                    return (
                    <td 
                      key={`${week.id}-${dayIndex}`} 
                      className={`text-center py-2 px-1 ${
                        dayIndex === 0 ? 'border-l-2 border-gray-200' : ''
                      } ${
                        isFuture ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex justify-center">
                        {!isFuture ? (
                          <Checkbox
                            checked={getHabitCompletion(habit.id, week.id, dayIndex)}
                            onCheckedChange={(checked) => {
                              onToggleHabit(habit.id, week.id, dayIndex, checked as boolean);
                            }}
                            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-4 w-4"
                          />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded bg-gray-200 opacity-50 cursor-not-allowed" />
                        )}
                      </div>
                    </td>
                    );
                  })
                ))}
                <td className="py-2 px-2">
                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {habits.filter(h => h.is_active).length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            No habits yet. Add your first habit above!
          </div>
        )}
      </div>
    </div>
  );
}
