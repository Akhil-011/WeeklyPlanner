import { Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeekControlsProps {
  onSaveWeek: () => void;
  onResetWeek: () => void;
  saving: boolean;
  resetting: boolean;
}

export function WeekControls({ onSaveWeek, onResetWeek, saving, resetting }: WeekControlsProps) {
  const isSunday = new Date().getDay() === 0;

  return (
    <div className="bg-white rounded-lg shadow-card p-4 border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1">Week Management</p>
          <p className="text-xs text-gray-500">
            {isSunday ? 'Save to archive or start fresh' : 'Week can only be saved on Sunday'}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={onSaveWeek}
            disabled={saving}
            className={isSunday ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : isSunday ? 'Save Week' : 'Saves on Sunday'}
          </Button>
          <Button
            onClick={onResetWeek}
            disabled={resetting}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {resetting ? 'Resetting...' : 'Reset Week'}
          </Button>
        </div>
      </div>
    </div>
  );
}
