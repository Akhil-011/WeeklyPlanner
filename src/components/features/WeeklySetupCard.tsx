import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Week } from '@/types';
import { formatDate } from '@/lib/dateUtils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface WeeklySetupCardProps {
  week: Week | null;
  onUpdate: (updates: Partial<Week>) => void;
  onDateChange: (date: Date) => void;
}

export function WeeklySetupCard({ week, onUpdate, onDateChange }: WeeklySetupCardProps) {
  const [localStartDate, setLocalStartDate] = useState('');

  useEffect(() => {
    if (week) {
      setLocalStartDate(week.start_date);
    }
  }, [week]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setLocalStartDate(newDate);
    onDateChange(new Date(newDate));
  };

  if (!week) return null;

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="start-date" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary-600" />
            Week Starting
          </Label>
          <Input
            id="start-date"
            type="date"
            value={localStartDate}
            onChange={handleDateChange}
            className="border-gray-200 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <Label htmlFor="focus" className="text-sm font-medium text-gray-700 mb-2">
            Weekly Focus
          </Label>
          <Input
            id="focus"
            value={week.weekly_focus || ''}
            onChange={(e) => onUpdate({ weekly_focus: e.target.value })}
            placeholder="What's your main goal?"
            className="border-gray-200 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <Label htmlFor="reward" className="text-sm font-medium text-gray-700 mb-2">
            Reward
          </Label>
          <Input
            id="reward"
            value={week.reward || ''}
            onChange={(e) => onUpdate({ reward: e.target.value })}
            placeholder="How will you celebrate?"
            className="border-gray-200 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <Label htmlFor="affirmation" className="text-sm font-medium text-gray-700 mb-2">
            Affirmation
          </Label>
          <Input
            id="affirmation"
            value={week.affirmation || ''}
            onChange={(e) => onUpdate({ affirmation: e.target.value })}
            placeholder="Your mindset reminder"
            className="border-gray-200 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );
}
