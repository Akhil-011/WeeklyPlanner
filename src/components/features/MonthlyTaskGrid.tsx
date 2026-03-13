import { Week, Task } from '@/types';

interface MonthlyTaskGridProps {
  weeks: Week[];
  tasksMap: Record<string, Task[]>;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthlyTaskGrid({ weeks, tasksMap }: MonthlyTaskGridProps) {
  const getDayTasks = (weekId: string, dayIndex: number): { completed: number; total: number } => {
    const tasks = (tasksMap[weekId] || []).filter(t => t.day_index === dayIndex);
    return {
      completed: tasks.filter(t => t.completed).length,
      total: tasks.length
    };
  };

  const getWeekNumber = (week: Week): number => {
    const startDate = new Date(week.start_date);
    const startOfYear = new Date(startDate.getFullYear(), 0, 1);
    const days = Math.floor((startDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  const getWeekTotal = (weekId: string): { completed: number; total: number } => {
    const tasks = tasksMap[weekId] || [];
    return {
      completed: tasks.filter(t => t.completed).length,
      total: tasks.length
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Tasks Completion</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {/* Week Headers */}
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-2 sm:px-4 text-sm font-semibold text-gray-800 bg-gray-50 sticky left-0 z-10 min-w-[100px] sm:min-w-[150px]">
                
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
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-800 bg-gray-50">
                Weekly Total
              </th>
            </tr>
            {/* Day Headers */}
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50"></th>
              {weeks.map((week) => (
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
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-sm font-medium text-gray-800 sticky left-0 z-10 bg-white">
                Completed / Total
              </td>
              {weeks.map((week) => (
                DAYS.map((_, dayIndex) => {
                  const { completed, total } = getDayTasks(week.id, dayIndex);
                  const percentage = total > 0 ? (completed / total) * 100 : 0;
                  return (
                    <td 
                      key={`${week.id}-${dayIndex}`} 
                      className={`text-center py-3 px-1 ${
                        dayIndex === 0 ? 'border-l-2 border-gray-200' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-semibold ${
                          percentage === 100 ? 'text-green-600' :
                          percentage >= 50 ? 'text-green-500' :
                          total > 0 ? 'text-yellow-600' :
                          'text-gray-400'
                        }`}>
                          {total > 0 ? `${completed}/${total}` : '-'}
                        </span>
                      </div>
                    </td>
                  );
                })
              ))}
              <td className="text-center py-3 px-4">
                {weeks.map(week => {
                  const { completed, total } = getWeekTotal(week.id);
                  return null;
                })}
                <span className="text-sm font-semibold text-gray-700">
                  {weeks.reduce((acc, week) => {
                    const { completed, total } = getWeekTotal(week.id);
                    return { 
                      completed: acc.completed + completed, 
                      total: acc.total + total 
                    };
                  }, { completed: 0, total: 0 }).completed}
                  /
                  {weeks.reduce((acc, week) => {
                    const { completed, total } = getWeekTotal(week.id);
                    return { 
                      completed: acc.completed + completed, 
                      total: acc.total + total 
                    };
                  }, { completed: 0, total: 0 }).total}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
