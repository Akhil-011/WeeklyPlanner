import { Week, Task } from '@/types';
import { format } from 'date-fns';

interface WeeklyTrackerTableProps {
  weeks: Week[];
  tasksMap: Record<string, Task[]>;
}

export function WeeklyTrackerTable({ weeks, tasksMap }: WeeklyTrackerTableProps) {
  const getWeekCompletion = (weekId: string): number => {
    const tasks = tasksMap[weekId] || [];
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getWeekNumber = (week: Week): number => {
    const startDate = new Date(week.start_date);
    const startOfYear = new Date(startDate.getFullYear(), 0, 1);
    const days = Math.floor((startDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  const getDayTasks = (week: Week, dayIndex: number): { completed: number; total: number } => {
    const tasks = (tasksMap[week.id] || []).filter(t => t.day_index === dayIndex);
    return {
      completed: tasks.filter(t => t.completed).length,
      total: tasks.length
    };
  };

  const getDayDate = (week: Week, dayIndex: number): string => {
    try {
      const startDate = new Date(week.start_date);
      // Ensure correct parsing of the date
      if (isNaN(startDate.getTime())) {
        return '-';
      }
      const dayDate = new Date(startDate.getTime());
      dayDate.setDate(startDate.getDate() + dayIndex);
      return format(dayDate, 'dd');
    } catch (e) {
      return '-';
    }
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Tracker</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Week</th>
              {dayNames.map((day, idx) => (
                <th key={day} className="text-center py-3 px-4">
                  <div className="text-xs text-blue-700">{weeks.length > 0 ? getDayDate(weeks[0], idx) : '-'}</div>
                  <div className="text-sm font-semibold text-gray-700">{day}</div>
                </th>
              ))}
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Monthly %</th>
            </tr>
          </thead>
          <tbody>
            {weeks.slice(0, 12).map((week, idx) => {
              const completion = getWeekCompletion(week.id);
              return (
                <tr 
                  key={week.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-700">
                    <div>
                      <div>Week {getWeekNumber(week)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {weeks.length > 0 
                          ? `${getDayDate(week, 0)} - ${getDayDate(week, 6)}`
                          : ''
                        }
                      </div>
                    </div>
                  </td>
                  {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                    const dayData = getDayTasks(week, dayIndex);
                    return (
                      <td key={dayIndex} className="text-center py-3 px-4 text-sm text-gray-600">
                        {dayData.total > 0 ? dayData.completed : '-'}
                      </td>
                    );
                  })}
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-sm font-semibold ${
                        completion >= 80 ? 'text-green-600' :
                        completion >= 60 ? 'text-green-500' :
                        completion >= 40 ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {completion}%
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            completion >= 80 ? 'bg-green-600' :
                            completion >= 60 ? 'bg-green-500' :
                            completion >= 40 ? 'bg-yellow-600' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
