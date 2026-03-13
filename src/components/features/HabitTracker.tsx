import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Habit, HabitTracking } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface HabitTrackerProps {
  habits: Habit[];
  tracking: HabitTracking[];
  weekDates: Date[];
  onAddHabit: (name: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleHabit: (habitId: string, dayIndex: number, completed: boolean) => void;
}

const isDayInFuture = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return target > today; // Only block future days, allow past and today
};

export function HabitTracker({ habits, tracking, weekDates, onAddHabit, onDeleteHabit, onToggleHabit }: HabitTrackerProps) {
  const [newHabit, setNewHabit] = useState('');

  const handleAddHabit = () => {
    if (newHabit.trim()) {
      onAddHabit(newHabit.trim());
      setNewHabit('');
    }
  };

  const getHabitCompletion = (habitId: string, dayIndex: number): boolean => {
    return tracking.some(t => t.habit_id === habitId && t.day_index === dayIndex && t.completed);
  };

  const getHabitConsistency = (habitId: string): number => {
    // Only consider days up to and including today for consistency
    const validDayIndices = weekDates
      .map((d, i) => (!isDayInFuture(d) ? i : -1))
      .filter(i => i >= 0);

    const completedDays = tracking.filter(
      t => t.habit_id === habitId && t.completed && validDayIndices.includes(t.day_index)
    ).length;

    const denom = validDayIndices.length;
    return denom > 0 ? (completedDays / denom) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Habit Tracker
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
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Habit</th>
              {weekDates.map((date, idx) => (
                <th key={idx} className="text-center py-2 px-2">
                  <div className="text-xs text-blue-700">{format(date, 'dd')}</div>
                  <div className="text-xs font-medium text-gray-700">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                </th>
              ))}
              <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">%</th>
              <th className="py-2 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {habits.filter(h => h.is_active).map((habit) => (
              <tr key={habit.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3 text-sm text-gray-800 font-medium">{habit.name}</td>
                {weekDates.map((date, dayIndex) => {
                  const isFuture = isDayInFuture(date);
                  return (
                  <td key={dayIndex} className={`text-center py-3 px-2 ${
                    isFuture ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}>
                    <div className="flex justify-center">
                      {!isFuture ? (
                        <Checkbox
                          checked={getHabitCompletion(habit.id, dayIndex)}
                          onCheckedChange={(checked) => {
                            onToggleHabit(habit.id, dayIndex, checked as boolean);
                          }}
                          className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                        />
                      ) : (
                        <div className="w-4 h-4 border border-gray-300 rounded bg-gray-200 opacity-40" />
                      )}
                    </div>
                  </td>
                  );
                })}
                <td className="text-center py-3 px-3">
                  <span className="text-sm font-semibold text-primary-700">
                    {Math.round(getHabitConsistency(habit.id))}%
                  </span>
                </td>
                <td className="py-3 px-2">
                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {habits.filter(h => h.is_active).length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No habits yet. Add your first habit above!
          </div>
        )}
      </div>
    </div>
  );
}
