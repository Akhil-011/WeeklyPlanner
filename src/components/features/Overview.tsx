import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Week, Task, Habit, HabitTracking } from '@/types';
import { X, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ActivityHeatmap } from './ActivityHeatmap';

// --- localStorage helpers for cleared week IDs ---
const getClearedKey = (userId: string) => `cleared_week_ids_${userId}`;

const getClearedIds = (userId: string): Set<string> => {
  try {
    const raw = localStorage.getItem(getClearedKey(userId));
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
};

const saveClearedIds = (userId: string, ids: Set<string>) => {
  try {
    localStorage.setItem(getClearedKey(userId), JSON.stringify([...ids]));
  } catch (err) {
    console.error('Failed to persist cleared week IDs', err);
  }
};
// --------------------------------------------------

interface ArchivedWeek {
  id: string;
  user_id: string;
  week_data: any;
  created_at: string;
}

interface MonthGroup {
  monthName: string;
  monthNum: number;
  year: number;
  weeks: ArchivedWeek[];
}

export function Overview({ refreshKey, currentWeek, tasks, habits, habitTracking, allWeeks, allTasksMap }: { refreshKey?: number; currentWeek?: Week | null; tasks?: Task[]; habits?: Habit[]; habitTracking?: HabitTracking[]; allWeeks?: Week[]; allTasksMap?: Record<string, Task[]> }) {
  const [archived, setArchived] = useState<ArchivedWeek[]>([]);
  const [history, setHistory] = useState<ArchivedWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<ArchivedWeek | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<MonthGroup | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadArchived = async () => {
      setLoading(true);
      if (!user) {
        setArchived([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.from('archived_weeks').select('*');

        if (error) {
          console.error('Error loading archived weeks:', error);
          setArchived([]);
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setArchived([]);
          setLoading(false);
          return;
        }

        const clearedIds = getClearedIds(user.id);

        const filtered = data
          .filter((item: any) => {
            const itemUserId = item.user_id || item.week_data?.user_id;
            // Show in archived only if not cleared (check both DB flag and localStorage)
            return itemUserId === user.id &&
              item.week_data?.is_cleared !== true &&
              !clearedIds.has(item.id);
          })
          .sort((a: any, b: any) => {
            const aDate = a.week_data?.week_start ? new Date(a.week_data.week_start).getTime() : 0;
            const bDate = b.week_data?.week_start ? new Date(b.week_data.week_start).getTime() : 0;
            return bDate - aDate;
          });

        const historyFiltered = data
          .filter((item: any) => {
            const itemUserId = item.user_id || item.week_data?.user_id;
            // Show in history if cleared via DB flag OR localStorage
            return itemUserId === user.id &&
              (item.week_data?.is_cleared === true || clearedIds.has(item.id));
          })
          .sort((a: any, b: any) => {
            const aDate = a.week_data?.week_start ? new Date(a.week_data.week_start).getTime() : 0;
            const bDate = b.week_data?.week_start ? new Date(b.week_data.week_start).getTime() : 0;
            return bDate - aDate;
          });

        setArchived(filtered);
        setHistory(historyFiltered);
        setLoading(false);
      } catch (err) {
        console.error('Exception caught:', err);
        setArchived([]);
        setLoading(false);
      }
    };

    loadArchived();
  }, [refreshKey, user]);

  const getWeekNumber = (startDate: string): number => {
    try {
      const date = new Date(startDate);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date for week number:', startDate);
        return 1;
      }
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      return Math.ceil((days + startOfYear.getDay() + 1) / 7);
    } catch (error) {
      console.error('Error calculating week number:', error);
      return 1;
    }
  };

  const getWeekNumberInMonth = (dateStr: string): number => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateStr);
        return 1; // Default to week 1 for invalid dates
      }
      
      const month = date.getMonth();
      const year = date.getFullYear();
      const firstDay = new Date(year, month, 1);
      const firstDayWeekNumber = getWeekNumber(firstDay.toISOString());
      const currentDateWeekNumber = getWeekNumber(dateStr);
      const weekInMonth = currentDateWeekNumber - firstDayWeekNumber + 1;
      return Math.max(1, weekInMonth);
    } catch (error) {
      console.error('Error calculating week number for date:', dateStr, error);
      return 1; // Default to week 1 on error
    }
  };

  const buildHeatmapData = (): Array<{
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
  }> => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const heatmapWeeks: Array<{
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
    }> = [];

    const processedStartDates = new Set<string>();

    // Build from all weeks in the weeks table (matches the weekly view)
    if (allWeeks && allTasksMap) {
      allWeeks.forEach((week) => {
        try {
          const weekStart = week.start_date;
          const dateObj = new Date(weekStart);
          if (isNaN(dateObj.getTime())) return;

          const weekNum = getWeekNumberInMonth(weekStart);
          // For the current active week, use live tasks from props
          const weekTasks = (currentWeek && week.id === currentWeek.id && tasks)
            ? tasks
            : (allTasksMap[week.id] || []);

          const days = Array.from({ length: 7 }, (_, dayIndex) => {
            const dayTasks = weekTasks.filter((t) => t.day_index === dayIndex);
            const completedTasks = dayTasks.filter((t) => t.completed).length;
            const totalTasks = dayTasks.length;
            const completionPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return {
              dayIndex,
              dayName: dayNames[dayIndex],
              completionPercent,
              tasksCompleted: completedTasks,
              totalTasks,
            };
          });

          heatmapWeeks.push({ weekId: week.id, weekStart, weekNum, days });
          processedStartDates.add(weekStart);
        } catch (error) {
          console.error('Error building heatmap data for week:', week.id, error);
        }
      });
    } else if (currentWeek && tasks) {
      // Fallback when allWeeks not available
      try {
        const weekStart = currentWeek.start_date;
        const dateObj = new Date(weekStart);
        if (!isNaN(dateObj.getTime())) {
          const weekNum = getWeekNumberInMonth(weekStart);
          const days = Array.from({ length: 7 }, (_, dayIndex) => {
            const dayTasks = tasks.filter((t) => t.day_index === dayIndex);
            const completedTasks = dayTasks.filter((t) => t.completed).length;
            const totalTasks = dayTasks.length;
            const completionPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            return {
              dayIndex,
              dayName: dayNames[dayIndex],
              completionPercent,
              tasksCompleted: completedTasks,
              totalTasks,
            };
          });
          heatmapWeeks.push({ weekId: currentWeek.id, weekStart, weekNum, days });
          processedStartDates.add(weekStart);
        }
      } catch (error) {
        console.error('Error building heatmap data for current week:', error);
      }
    }

    // Include archived weeks not already covered
    archived.forEach((week) => {
      try {
        const weekStart = week.week_data?.week_start || week.created_at;
        const dateObj = new Date(weekStart);
        if (isNaN(dateObj.getTime())) return;
        if (processedStartDates.has(weekStart)) return;

        const weekNum = getWeekNumberInMonth(weekStart);
        const archivedTasks = week.week_data?.tasks || [];

        const days = Array.from({ length: 7 }, (_, dayIndex) => {
          const dayTasks = archivedTasks.filter((t: any) => t.day_index === dayIndex);
          const completedTasks = dayTasks.filter((t: any) => t.completed).length;
          const totalTasks = dayTasks.length;
          const completionPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return {
            dayIndex,
            dayName: dayNames[dayIndex],
            completionPercent,
            tasksCompleted: completedTasks,
            totalTasks,
          };
        });

        heatmapWeeks.push({ weekId: week.id, weekStart, weekNum, days });
      } catch (error) {
        console.error('Error building heatmap data for archived week:', week.id, error);
      }
    });

    return heatmapWeeks;
  };

  const groupWeeksByMonth = (): MonthGroup[] => {
    const grouped = new Map<string, ArchivedWeek[]>();
    const monthInfo = new Map<string, { name: string; num: number; year: number }>();

    archived.forEach((week) => {
      const dateStr = week.week_data?.week_start || week.created_at;
      const date = new Date(dateStr);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
        monthInfo.set(monthKey, {
          name: date.toLocaleDateString('en-US', { month: 'long' }),
          num: date.getMonth() + 1,
          year: date.getFullYear(),
        });
      }
      grouped.get(monthKey)!.push(week);
    });

    return Array.from(grouped.entries())
      .map(([key, weeks]) => {
        const info = monthInfo.get(key)!;
        return {
          monthName: info.name,
          monthNum: info.num,
          year: info.year,
          weeks: weeks.sort((a, b) => {
            const aDate = new Date(a.week_data?.week_start).getTime();
            const bDate = new Date(b.week_data?.week_start).getTime();
            return aDate - bDate;
          }),
        };
      })
      .sort((a, b) => {
        const aDate = new Date(a.year, a.monthNum - 1);
        const bDate = new Date(b.year, b.monthNum - 1);
        return bDate.getTime() - aDate.getTime();
      });
  };

  const clearAllWeeks = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAllWeeks = async () => {
    setShowClearConfirm(false);
    
    if (!user) return;
    
    try {
      // Persist cleared IDs in localStorage so refresh cannot restore them
      const clearedIds = getClearedIds(user.id);
      archived.forEach(week => clearedIds.add(week.id));
      saveClearedIds(user.id, clearedIds);

      // Also mark in DB (best-effort — may fail if RLS update policy is missing)
      for (const week of archived) {
        const updatedWeekData = { ...week.week_data, is_cleared: true };
        const { error } = await supabase
          .from('archived_weeks')
          .update({ week_data: updatedWeekData })
          .eq('id', week.id);
        
        if (error) {
          console.error('Error clearing week in DB', week.id, error);
        }
      }
      
      // Move archived weeks to history
      setHistory([...history, ...archived]);
      setArchived([]);
    } catch (err) {
      console.error('Exception clearing weeks:', err);
    }
  };

  const handleRestoreWeek = async (weekToRestore: ArchivedWeek) => {
    if (!user) return;
    
    try {
      // Remove from localStorage cleared set so it survives future refreshes
      const clearedIds = getClearedIds(user.id);
      clearedIds.delete(weekToRestore.id);
      saveClearedIds(user.id, clearedIds);

      // Also remove cleared flag in DB (best-effort)
      const updatedWeekData = { ...weekToRestore.week_data, is_cleared: false };
      await supabase
        .from('archived_weeks')
        .update({ week_data: updatedWeekData })
        .eq('id', weekToRestore.id);
      
      // Update local state
      const updatedHistory = history.filter(w => w.id !== weekToRestore.id);
      setHistory(updatedHistory);
      const restoredWeek = { ...weekToRestore, week_data: updatedWeekData };
      setArchived([...archived, restoredWeek]);
    } catch (err) {
      console.error('Error restoring week:', err);
    }
  };

  if (loading) {
    return <div className="bg-white rounded-lg p-6 border border-gray-100">Loading...</div>;
  }

  if (archived.length === 0 && history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Saved Weeks</h2>
        <div className="text-sm text-gray-500">No weeks saved yet. Save a week to see it here!</div>
      </div>
    );
  }

  const monthGroups = groupWeeksByMonth();
  const heatmapData = buildHeatmapData();

  return (
    <>
      <ActivityHeatmap 
        data={heatmapData} 
        onDayClick={(date, weekId, dayIndex) => {
          const week = archived.find(w => w.id === weekId);
          if (week) setSelectedWeek(week);
        }} 
      />
      
      <div className="bg-white rounded-lg shadow-card p-6 border border-gray-100 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {showHistory ? 'Cleared Weeks History' : 'Saved Weeks'}
          </h2>
          <div className="flex gap-2">
            {!showHistory && history.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                History
              </button>
            )}
            {showHistory && (
              <button
                onClick={() => setShowHistory(false)}
                className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Back to Saved
              </button>
            )}
            {!showHistory && archived.length > 0 && (
              <button
                onClick={clearAllWeeks}
                className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {showHistory ? (
            // Display history
            history.length > 0 ? (
              history.map((week) => {
                const weekNum = getWeekNumberInMonth(week.week_data?.week_start || week.created_at);
                const completion = week.week_data?.completion || 0;
                return (
                  <div key={week.id} className="p-4 rounded-lg border-2 border-gray-300 bg-white hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <span className="text-lg font-bold text-gray-800">Week {weekNum}</span>
                        <span className={`ml-2 sm:ml-4 text-sm font-semibold px-2 py-1 rounded ${
                          completion >= 80 ? 'bg-green-100 text-green-800' :
                          completion >= 60 ? 'bg-blue-100 text-blue-800' :
                          completion >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {completion}%
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedWeek(week)}
                          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleRestoreWeek(week)}
                          className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(week.week_data?.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">No cleared weeks in history</div>
            )
          ) : (
            // Display saved weeks
            monthGroups.map((month) => (
              <div key={`${month.year}-${month.monthNum}`} className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {month.monthName} {month.year}
                  </h3>
                  <span className="text-sm text-gray-600">{month.weeks.length} week{month.weeks.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
                  {month.weeks.map((week) => {
                    const weekNum = getWeekNumberInMonth(week.week_data?.week_start || week.created_at);
                    const completion = week.week_data?.completion || 0;
                    
                    return (
                      <button
                        key={week.id}
                        onClick={() => setSelectedWeek(week)}
                        className={`p-4 rounded-lg border-2 text-center transition-all hover:shadow-md ${
                          completion >= 80
                            ? 'border-green-500 bg-green-50'
                            : completion >= 60
                            ? 'border-blue-500 bg-blue-50'
                            : completion >= 40
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <div className="text-2xl font-bold text-gray-800">W{weekNum}</div>
                        <div className="text-sm font-semibold text-gray-700 mt-2">{completion}%</div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setSelectedMonth(month)}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Monthly View
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Week Details Modal */}
      {selectedWeek && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Week {getWeekNumberInMonth(selectedWeek.week_data?.week_start || selectedWeek.created_at)} Details - {new Date(selectedWeek.week_data?.week_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={() => setSelectedWeek(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Progress Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600">Overall Completion</div>
                  <div className="text-3xl font-bold text-blue-600">{selectedWeek.week_data?.completion || 0}%</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-gray-600">Tasks</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {selectedWeek.week_data?.tasks ? selectedWeek.week_data.tasks.filter((t: any) => t.completed).length : 0} / {selectedWeek.week_data?.tasks?.length || 0}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-gray-600">Habits</div>
                  <div className="text-3xl font-bold text-green-600">
                    {selectedWeek.week_data?.habit_tracking ? selectedWeek.week_data.habit_tracking.filter((t: any) => t.completed).length : 0} / {(selectedWeek.week_data?.habits?.length || 0) * 7}
                  </div>
                </div>
              </div>

              {/* Charts Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Habits Bar Chart */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Habit Completion Overview</h3>
                  {selectedWeek.week_data?.habit_tracking && selectedWeek.week_data.habit_tracking.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[{
                        name: 'Habits',
                        completed: selectedWeek.week_data.habit_tracking.filter((t: any) => t.completed).length,
                        pending: selectedWeek.week_data.habit_tracking.filter((t: any) => !t.completed).length,
                      }]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" fill="#3b82f6" />
                        <Bar dataKey="pending" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No habit data available</div>
                  )}
                </div>

                {/* Habits Distribution Pie Chart */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Habit Distribution</h3>
                  {selectedWeek.week_data?.habit_tracking && selectedWeek.week_data.habit_tracking.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completed', value: selectedWeek.week_data.habit_tracking.filter((t: any) => t.completed).length },
                            { name: 'Pending', value: selectedWeek.week_data.habit_tracking.filter((t: any) => !t.completed).length },
                          ]}
                          cx="50%" cy="50%" outerRadius={80} dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No habit data available</div>
                  )}
                </div>
              </div>

              {/* Daily Habit Progress Line Chart */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Progress Track</h3>
                {selectedWeek.week_data?.habit_tracking && selectedWeek.week_data.habit_tracking.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={[
                      { day: 'Mon', completed: selectedWeek.week_data.habit_tracking.filter((t: any) => t.day_index === 0 && t.completed).length },
                      { day: 'Tue', completed: selectedWeek.week_data.habit_tracking.filter((t: any) => t.day_index === 1 && t.completed).length },
                      { day: 'Wed', completed: selectedWeek.week_data.habit_tracking.filter((t: any) => t.day_index === 2 && t.completed).length },
                      { day: 'Thu', completed: selectedWeek.week_data.habit_tracking.filter((t: any) => t.day_index === 3 && t.completed).length },
                      { day: 'Fri', completed: selectedWeek.week_data.habit_tracking.filter((t: any) => t.day_index === 4 && t.completed).length },
                      { day: 'Sat', completed: selectedWeek.week_data.habit_tracking.filter((t: any) => t.day_index === 5 && t.completed).length },
                      { day: 'Sun', completed: selectedWeek.week_data.habit_tracking.filter((t: any) => t.day_index === 6 && t.completed).length },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">No habit data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly View Modal */}
      {selectedMonth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedMonth.monthName} {selectedMonth.year} - Monthly View
              </h2>
              <button onClick={() => setSelectedMonth(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Monthly Summary */}
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Total Weeks</div>
                    <div className="text-3xl font-bold text-blue-600">{selectedMonth.weeks.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Average Completion</div>
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round(selectedMonth.weeks.reduce((sum, w) => sum + (w.week_data?.completion || 0), 0) / selectedMonth.weeks.length)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {selectedMonth.weeks.reduce((sum, w) => sum + (w.week_data?.tasks?.length || 0), 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Completed Tasks</div>
                    <div className="text-3xl font-bold text-yellow-600">
                      {selectedMonth.weeks.reduce((sum, w) => sum + (w.week_data?.tasks?.filter((t: any) => t.completed).length || 0), 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Trend */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Progress Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={selectedMonth.weeks.map((w) => ({
                    week: `W${getWeekNumberInMonth(w.week_data?.week_start)}`,
                    completion: w.week_data?.completion || 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completion" stroke="#3b82f6" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Week Details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Weeks in {selectedMonth.monthName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMonth.weeks.map((week) => {
                    const weekNum = getWeekNumberInMonth(week.week_data?.week_start);
                    const completion = week.week_data?.completion || 0;
                    return (
                      <button
                        key={week.id}
                        onClick={() => {
                          setSelectedMonth(null);
                          setSelectedWeek(week);
                        }}
                        className="p-4 rounded-lg border-2 border-gray-300 bg-white hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-gray-800">Week {weekNum}</span>
                          <span className={`text-sm font-semibold px-2 py-1 rounded ${
                            completion >= 80 ? 'bg-green-100 text-green-800' :
                            completion >= 60 ? 'bg-blue-100 text-blue-800' :
                            completion >= 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {completion}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(week.week_data?.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Weeks</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all saved weeks? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmClearAllWeeks}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear All
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
