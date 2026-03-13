import { Task, Week } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface TaskTrackerCardProps {
  currentWeek: Week | null;
  tasks: Task[];
  weekDates: Date[];
  onAddTask: (dayIndex: number, taskText: string, taskType: 'daily' | 'weekly' | 'monthly') => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
  currentDate?: Date;
}

export function TaskTrackerCard({ 
  currentWeek, 
  tasks, 
  weekDates, 
  onAddTask, 
  onToggleTask,
  currentDate = new Date()
}: TaskTrackerCardProps) {
  const [newTaskDaily, setNewTaskDaily] = useState('');
  const [newTaskWeekly, setNewTaskWeekly] = useState('');
  const [newTaskMonthly, setNewTaskMonthly] = useState('');

  const getTodayIndex = (): number => {
    const today = currentDate.getDay();
    return today === 0 ? 6 : today - 1;
  };

  const dailyTasks = tasks.filter(t => t.day_index === getTodayIndex() && t.task_type === 'daily');
  const weeklyTasks = tasks.filter(t => t.task_type === 'weekly');
  const monthlyTasks = tasks.filter(t => t.task_type === 'monthly');

  const handleAddDailyTask = () => {
    if (newTaskDaily.trim() && currentWeek) {
      onAddTask(getTodayIndex(), newTaskDaily.trim(), 'daily');
      setNewTaskDaily('');
    }
  };

  const handleAddWeeklyTask = () => {
    if (newTaskWeekly.trim() && currentWeek) {
      onAddTask(getTodayIndex(), newTaskWeekly.trim(), 'weekly');
      setNewTaskWeekly('');
    }
  };

  const handleAddMonthlyTask = () => {
    if (newTaskMonthly.trim() && currentWeek) {
      onAddTask(getTodayIndex(), newTaskMonthly.trim(), 'monthly');
      setNewTaskMonthly('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Task Tracker</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Tasks */}
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Daily <span className="text-blue-700">({dailyTasks.filter(t => t.completed).length}/{dailyTasks.length})</span>
            </h3>
          </div>
          
          <div className="flex gap-2 mb-4">
            <Input
              value={newTaskDaily}
              onChange={(e) => setNewTaskDaily(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDailyTask()}
              placeholder="Add task..."
              className="text-sm border-gray-200"
            />
            <Button
              onClick={handleAddDailyTask}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {dailyTasks.length === 0 ? (
              <p className="text-sm text-gray-500">No tasks for today</p>
            ) : (
              dailyTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 p-2 bg-white rounded hover:bg-gray-50">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => onToggleTask(task.id, checked as boolean)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.task_text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Tasks */}
        <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Weekly <span className="text-green-700">({weeklyTasks.filter(t => t.completed).length}/{weeklyTasks.length})</span>
            </h3>
          </div>
          
          <div className="flex gap-2 mb-4">
            <Input
              value={newTaskWeekly}
              onChange={(e) => setNewTaskWeekly(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddWeeklyTask()}
              placeholder="Add task..."
              className="text-sm border-gray-200"
            />
            <Button
              onClick={handleAddWeeklyTask}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {weeklyTasks.length === 0 ? (
              <p className="text-sm text-gray-500">No weekly tasks</p>
            ) : (
              weeklyTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 p-2 bg-white rounded hover:bg-gray-50">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => onToggleTask(task.id, checked as boolean)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm block ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {task.task_text}
                    </span>
                    <span className="text-xs text-gray-500">
                      {weekDates[task.day_index] ? format(weekDates[task.day_index], 'EEE') : 'Day'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monthly Tasks */}
        <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Monthly <span className="text-purple-700">({monthlyTasks.filter(t => t.completed).length}/{monthlyTasks.length})</span>
            </h3>
          </div>
          
          <div className="flex gap-2 mb-4">
            <Input
              value={newTaskMonthly}
              onChange={(e) => setNewTaskMonthly(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddMonthlyTask()}
              placeholder="Add task..."
              className="text-sm border-gray-200"
            />
            <Button
              onClick={handleAddMonthlyTask}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {monthlyTasks.length === 0 ? (
              <p className="text-sm text-gray-500">No monthly tasks</p>
            ) : (
              monthlyTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 p-2 bg-white rounded hover:bg-gray-50">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => onToggleTask(task.id, checked as boolean)}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm block ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {task.task_text}
                    </span>
                    <span className="text-xs text-gray-500">
                      {weekDates[task.day_index] ? format(weekDates[task.day_index], 'EEE') : 'Day'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
