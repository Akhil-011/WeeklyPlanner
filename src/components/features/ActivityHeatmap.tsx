import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { X } from 'lucide-react';

interface DayData {
  date: Date;
  completionPercent: number;
  tasksCompleted: number;
  totalTasks: number;
  dayOfWeek: number; // 0-6
}

interface MonthHeatmapData {
  month: number; // 0-11
  year: number;
  days: DayData[];
}

interface ActivityHeatmapProps {
  data: Array<{
    weekId: string;
    weekStart: string;
    weekNum: number;
    days: Array<{
      dayIndex: number;
      dayName: string;
      completionPercent: number;
      tasksCompleted: number;
      totalTasks: number;
    }>;
  }>;
  onDayClick?: (date: Date, weekId: string, dayIndex: number) => void;
}

export function ActivityHeatmap({ data, onDayClick }: ActivityHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<{ date: Date; weekId: string; dayIndex: number; completed: number; total: number } | null>(null);

  // Format a Date as YYYY-MM-DD using local time (avoids UTC timezone shift from toISOString)
  const formatDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Parse a YYYY-MM-DD string as local midnight (not UTC)
  const parseLocalDate = (dateStr: string): Date => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const getIntensityColor = (completion: number): string => {
    if (completion === 0) return 'bg-gray-200 hover:bg-gray-300';
    if (completion < 30) return 'bg-green-100 hover:bg-green-200';
    if (completion < 60) return 'bg-green-300 hover:bg-green-400';
    if (completion < 90) return 'bg-green-600 hover:bg-green-700';
    return 'bg-green-800 hover:bg-green-900';
  };

  const getCompletionLabel = (completion: number): string => {
    if (completion === 0) return 'No tasks';
    if (completion < 30) return 'Low';
    if (completion < 60) return 'Medium';
    if (completion < 90) return 'High';
    return 'Complete';
  };

  // Build month data from weekly data
  const buildMonthlyData = (): MonthHeatmapData[] => {
    const monthsMap = new Map<string, Map<string, DayData>>();
    const weekMap = new Map<string, { weekId: string; weekStart: string }>();

    // Collect all day data
    data.forEach((week) => {
      const weekStart = parseLocalDate(week.weekStart);
      
      // Validate week start date
      if (isNaN(weekStart.getTime())) {
        console.warn('Invalid week start date:', week.weekStart);
        return;
      }

      week.days.forEach((day) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + day.dayIndex);

        // Validate calculated date
        if (isNaN(dayDate.getTime())) {
          console.warn('Invalid calculated date for day:', day.dayIndex, 'in week:', week.weekStart);
          return;
        }

        const monthKey = `${dayDate.getFullYear()}-${dayDate.getMonth()}`;
        const dateKey = formatDateKey(dayDate);

        if (!monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, new Map());
        }

        const dayData: DayData = {
          date: dayDate,
          completionPercent: day.completionPercent,
          tasksCompleted: day.tasksCompleted,
          totalTasks: day.totalTasks,
          dayOfWeek: dayDate.getDay(),
        };

        monthsMap.get(monthKey)!.set(dateKey, dayData);
        weekMap.set(dateKey, { weekId: week.weekId, weekStart: week.weekStart });
      });
    });

    console.log('Monthly data built:', Array.from(monthsMap.entries()).map(([key, days]) => ({
      key,
      dayCount: days.size
    })));

    // Convert to array and sort
    return Array.from(monthsMap.entries())
      .map(([key, days]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          month,
          year,
          days: Array.from(days.values()),
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
  };

  const monthlyData = buildMonthlyData();

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100 animate-slide-up mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Heatmap</h2>
        <div className="text-sm text-gray-500">No activity data available yet. Complete your weekly tasks to see the heatmap!</div>
      </div>
    );
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100 animate-slide-up mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Activity Heatmap - Your Daily Progress</h2>

      {/* Monthly Heatmaps */}
      <div className="flex flex-wrap gap-6">
        {monthlyData.map((monthData) => {
          // Get all days in the month
          const firstDay = new Date(monthData.year, monthData.month, 1);
          const lastDay = new Date(monthData.year, monthData.month + 1, 0);
          const daysInMonth = lastDay.getDate();
          const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

          // Create a map for quick lookup
          const dayMap = new Map(monthData.days.map((d) => [formatDateKey(d.date), d]));

          // Create grid: weeks as columns, days of week as rows
          const weeks: (DayData | null)[][] = [];
          let currentWeek: (DayData | null)[] = Array(7).fill(null);
          let dayCounter = 0;

          // Fill in empty cells at the start
          for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek[i] = null;
            dayCounter++;
          }

          // Fill in actual days
          for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(monthData.year, monthData.month, day);
            const dayOfWeek = currentDate.getDay();
            
            const dateStr = formatDateKey(currentDate);
            const dayData = dayMap.get(dateStr);

            currentWeek[dayOfWeek] = dayData || {
              date: currentDate,
              completionPercent: 0,
              tasksCompleted: 0,
              totalTasks: 0,
              dayOfWeek,
            };

            // Move to next week if we've filled Sunday
            if (dayOfWeek === 6) {
              weeks.push([...currentWeek]);
              currentWeek = Array(7).fill(null);
            }
          }

          // Add the last week if it has any days
          if (currentWeek.some((d) => d !== null)) {
            weeks.push(currentWeek);
          }

          return (
            <div key={`${monthData.year}-${monthData.month}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                {monthNames[monthData.month]} {monthData.year}
              </h3>

              {/* Day labels */}
              <div className="flex gap-1 mb-2 pl-8">
                {dayLabels.map((dayLabel) => (
                  <div key={dayLabel} className="w-5 h-5 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {dayLabel[0]}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="space-y-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex gap-1">
                    {/* Week number label */}
                    <div className="w-8 flex-shrink-0 flex items-center justify-center text-xs text-gray-500 font-medium">W{weekIndex + 1}</div>

                    {/* Day boxes */}
                    {week.map((dayData, dayOfWeek) => (
                      <TooltipProvider key={`${weekIndex}-${dayOfWeek}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                if (dayData && dayData.totalTasks > 0) {
                                  // Find the corresponding week that contains this day
                                  const matchingWeek = data.find((w) => {
                                    const weekStart = parseLocalDate(w.weekStart);
                                    const weekEnd = new Date(weekStart);
                                    weekEnd.setDate(weekEnd.getDate() + 6);
                                    
                                    return dayData.date >= weekStart && dayData.date <= weekEnd;
                                  });

                                  if (matchingWeek) {
                                    // Calculate day index (0-6 for Mon-Sun)
                                    // getDay() returns 0=Sunday, 1=Monday, etc.
                                    // day_index is 0=Monday, 1=Tuesday, ..., 6=Sunday
                                    const dayOfWeekNum = dayData.date.getDay();
                                    const dayIndex = (dayOfWeekNum + 6) % 7;
                                    
                                    console.log('Day clicked:', {
                                      date: dayData.date,
                                      weekId: matchingWeek.weekId,
                                      dayIndex,
                                      dayOfWeekNum,
                                      weekStart: matchingWeek.weekStart
                                    });

                                    onDayClick?.(dayData.date, matchingWeek.weekId, dayIndex);
                                    setSelectedDay({
                                      date: dayData.date,
                                      weekId: matchingWeek.weekId,
                                      dayIndex,
                                      completed: dayData.tasksCompleted,
                                      total: dayData.totalTasks,
                                    });
                                  }
                                }
                              }}
                              className={`w-5 h-5 rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-blue-500 ${
                                dayData ? getIntensityColor(dayData.completionPercent) : 'bg-gray-100'
                              }`}
                              title={dayData?.date.toLocaleDateString() || ''}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">
                            <div className="text-xs">
                              <div className="font-semibold">{dayData?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</div>
                              <div className="mt-1">
                                {dayData && dayData.totalTasks > 0 ? (
                                  <>
                                    <div>{dayData.tasksCompleted}/{dayData.totalTasks} tasks completed</div>
                                    <div className="text-green-600 font-medium">{Math.round(dayData.completionPercent)}% · {getCompletionLabel(dayData.completionPercent)}</div>
                                  </>
                                ) : (
                                  <div className="text-gray-500">No tasks</div>
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="text-xs text-gray-600">
          <p className="font-medium text-gray-700 mb-2">Productivity Level:</p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
              <span>No tasks</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 rounded-sm"></div>
              <span>Low (1–29%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-300 rounded-sm"></div>
              <span>Medium (30–59%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-600 rounded-sm"></div>
              <span>High (60–89%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-800 rounded-sm"></div>
              <span>Complete (100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDay(null)}>
          <div
            className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedDay.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long', year: 'numeric' })}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedDay.completed}/{selectedDay.total} tasks completed
                </p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mb-4 border border-green-200">
              <div className="text-sm text-gray-600 mb-2">Completion Status</div>
              <div className="text-3xl font-bold text-green-600">{Math.round((selectedDay.completed / selectedDay.total) * 100)}%</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${(selectedDay.completed / selectedDay.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center">Click on the week details to view task breakdown.</p>
          </div>
        </div>
      )}
    </div>
  );
}
