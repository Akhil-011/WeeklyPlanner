import { TrendingUp, CheckCircle2, Target } from 'lucide-react';
import { Task, HabitTracking } from '@/types';

interface ProgressCardsProps {
  tasks: Task[];
  tracking: HabitTracking[];
  totalHabits: number;
}

export function ProgressCards({ tasks, tracking, totalHabits }: ProgressCardsProps) {
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const completedHabits = tracking.filter(t => t.completed).length;
  const totalHabitSlots = totalHabits * 7;
  const habitPercentage = totalHabitSlots > 0 ? Math.round((completedHabits / totalHabitSlots) * 100) : 0;

  const overallPercentage = Math.round((taskPercentage + habitPercentage) / 2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-lg shadow-card p-6 border border-primary-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Weekly Progress</h3>
          <TrendingUp className="h-5 w-5 text-primary-600" />
        </div>
        <div className="text-3xl font-bold text-primary-700 mb-1">{overallPercentage}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-white rounded-lg shadow-card p-6 border border-green-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Tasks</h3>
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        </div>
        <div className="text-3xl font-bold text-green-700 mb-1">
          {completedTasks}/{totalTasks}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${taskPercentage}%` }}
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg shadow-card p-6 border border-emerald-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Habit Consistency</h3>
          <Target className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="text-3xl font-bold text-emerald-700 mb-1">{habitPercentage}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${habitPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
