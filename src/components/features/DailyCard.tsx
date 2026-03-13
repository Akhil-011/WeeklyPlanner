import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Task, Reflection } from '@/types';
import { DonutChart } from './DonutChart';
import { ReflectionSection } from './ReflectionSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface DailyCardProps {
  dayName: string;
  date: string;
  tasks: Task[];
  reflection: Reflection | null;
  onAddTask: (taskText: string) => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateReflection: (updates: Partial<Reflection>) => void;
}

export function DailyCard({ dayName, date, tasks, reflection, onAddTask, onToggleTask, onDeleteTask, onUpdateReflection }: DailyCardProps) {
  const [newTask, setNewTask] = useState('');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-4 border border-gray-100 hover:shadow-card-hover transition-shadow">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{dayName}</h3>
        <p className="text-sm text-gray-500">{date}</p>
      </div>

      <div className="flex justify-center mb-4">
        <DonutChart percentage={percentage} size={100} />
      </div>

      <div className="space-y-2 mb-3 min-h-[100px] max-h-[160px] overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 group">
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => onToggleTask(task.id, checked as boolean)}
              className="mt-0.5"
            />
            <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {task.task_text}
            </span>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add task..."
          className="text-sm border-gray-200 focus:border-primary-500"
        />
        <Button
          onClick={handleAddTask}
          size="sm"
          className="bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ReflectionSection
        reflection={reflection}
        onUpdate={onUpdateReflection}
      />
    </div>
  );
}
