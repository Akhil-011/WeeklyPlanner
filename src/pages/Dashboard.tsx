import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Week, Task, Habit, HabitTracking, Reflection } from '@/types';
import { getWeekDates, formatDate, formatDisplayDate, getDayName, getMonday } from '@/lib/dateUtils';
import { DashboardHeader } from '@/components/features/DashboardHeader';
import { TotalProgressCard } from '@/components/features/TotalProgressCard';
import { WeeklyTrackerTable } from '@/components/features/WeeklyTrackerTable';
import { MonthlyProgressCard } from '@/components/features/MonthlyProgressCard';
import { MonthlyHabitGrid } from '@/components/features/MonthlyHabitGrid';
import { Overview } from '@/components/features/Overview';
import { MonthlyTaskGrid } from '@/components/features/MonthlyTaskGrid';
import { MotivationalToast } from '@/components/features/MotivationalToast';
import { WeeklySetupCard } from '@/components/features/WeeklySetupCard';
import { DailyCard } from '@/components/features/DailyCard';
import { HabitTracker } from '@/components/features/HabitTracker';
import { TaskTrackerCard } from '@/components/features/TaskTrackerCard';
import { HabitStreakCard } from '@/components/features/HabitStreakCard';
import { WeekControls } from '@/components/features/WeekControls';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, LayoutGrid, RotateCw } from 'lucide-react';
 import { toast } from 'sonner';
 
 interface ScreenOrientation extends EventTarget {
   lock: (orientation: string) => Promise<void>;
   unlock: () => void;
   type: string;
   angle: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitTracking, setHabitTracking] = useState<HabitTracking[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [monthlyWeeks, setMonthlyWeeks] = useState<Week[]>([]);
  const [monthlyTasksMap, setMonthlyTasksMap] = useState<Record<string, Task[]>>({});
  const [monthlyTrackingMap, setMonthlyTrackingMap] = useState<Record<string, HabitTracking[]>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekNumber, setCurrentWeekNumber] = useState(1);
  const [allWeeks, setAllWeeks] = useState<Week[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [overviewRefreshKey, setOverviewRefreshKey] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveBlockedDialog, setShowSaveBlockedDialog] = useState(false);
  const [isPwaMobile, setIsPwaMobile] = useState(false);
  const [isStandalonePwa, setIsStandalonePwa] = useState(false);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    const checkPwaMobile = () => {
      const iosStandalone =
        ((window.navigator as Navigator & { standalone?: boolean }).standalone ?? false) === true;
      const isStandalone = mediaQuery.matches || iosStandalone;
      const isMobileViewport = window.innerWidth < 640;
      setIsStandalonePwa(isStandalone);
      setIsPwaMobile(isStandalone && isMobileViewport);
    };

    checkPwaMobile();

    mediaQuery.addEventListener?.('change', checkPwaMobile);
    window.addEventListener('resize', checkPwaMobile);

    return () => {
      mediaQuery.removeEventListener?.('change', checkPwaMobile);
      window.removeEventListener('resize', checkPwaMobile);
    };
  }, []);

  // Load auto-rotate preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('pwa-auto-rotate-enabled');
    if (savedPreference !== null) {
      setAutoRotateEnabled(JSON.parse(savedPreference));
    }
  }, []);

  // Apply orientation lock/unlock based on user preference
  useEffect(() => {
    if (!isPwaMobile) return;

    const applyOrientationLock = async () => {
      try {
        const screen = window.screen as Screen & { orientation?: ScreenOrientation };
        if (!screen.orientation) return;

        if (autoRotateEnabled) {
          // Unlock: allow rotation
          screen.orientation.unlock();
        } else {
          // Lock to portrait
          await screen.orientation.lock('portrait-primary');
        }
      } catch (error) {
        console.error('Error applying orientation lock:', error);
      }
    };

    applyOrientationLock();
  }, [autoRotateEnabled, isPwaMobile]);

  const handleToggleAutoRotate = () => {
    const newState = !autoRotateEnabled;
    setAutoRotateEnabled(newState);
    localStorage.setItem('pwa-auto-rotate-enabled', JSON.stringify(newState));
    
    const message = newState ? 'Auto-rotate enabled' : 'Auto-rotate disabled';
    toast.success(message);
  };

  useEffect(() => {
    if (user) {
      loadCurrentWeek();
      loadHabits();
      loadMonthlyData(currentMonth);
      loadAllWeeks();
    }

    // Update current date every minute
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    // Reload monthly data when switching to monthly view
    if (viewMode === 'monthly' && user) {
      loadAllWeeks();
    }
  }, [viewMode]);

  const loadAllWeeks = async () => {
    const { data, error } = await supabase
      .from('weeks')
      .select('*')
      .eq('user_id', user!.id)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error loading all weeks:', error);
      return;
    }

    setAllWeeks(data || []);

    const tasksMap: Record<string, Task[]> = {};
    const trackingMap: Record<string, HabitTracking[]> = {};
    
    for (const week of data || []) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('week_id', week.id);
      tasksMap[week.id] = tasks || [];
      
      const { data: tracking } = await supabase
        .from('habit_tracking')
        .select('*')
        .eq('week_id', week.id);
      trackingMap[week.id] = tracking || [];
    }
    
    setMonthlyTasksMap(tasksMap);
    setMonthlyTrackingMap(trackingMap);
  };

  const loadCurrentWeek = async () => {
    const monday = getMonday(new Date());
    const startDate = formatDate(monday);

    // First, check if there's a week starting on Sunday that needs migration
    const sundayDate = new Date(monday);
    sundayDate.setDate(monday.getDate() - 1);
    const sundayStartDate = formatDate(sundayDate);

    const { data: oldSundayWeek } = await supabase
      .from('weeks')
      .select('*')
      .eq('user_id', user!.id)
      .eq('start_date', sundayStartDate)
      .eq('is_active', true)
      .single();

    // If old Sunday week exists, deactivate it
    if (oldSundayWeek) {
      await supabase
        .from('weeks')
        .update({ is_active: false })
        .eq('id', oldSundayWeek.id);
    }

    const { data: existingWeek, error: fetchError } = await supabase
      .from('weeks')
      .select('*')
      .eq('user_id', user!.id)
      .eq('start_date', startDate)
      .eq('is_active', true)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error loading week:', fetchError);
      toast.error('Failed to load week');
      setLoading(false);
      return;
    }

    if (existingWeek) {
      setCurrentWeek(existingWeek);
      setWeekDates(getWeekDates(new Date(existingWeek.start_date)));
      await loadTasks(existingWeek.id);
      await loadHabitTracking(existingWeek.id);
      await loadReflections(existingWeek.id);
    } else {
      await createNewWeek(monday);
    }

    setLoading(false);
  };

  const createNewWeek = async (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const { data: newWeek, error } = await supabase
      .from('weeks')
      .insert({
        user_id: user!.id,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating week:', error);
      toast.error('Failed to create week');
      return;
    }

    setCurrentWeek(newWeek);
    setWeekDates(getWeekDates(startDate));
  };

  const loadTasks = async (weekId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('week_id', weekId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading tasks:', error);
      return;
    }

    setTasks(data || []);
  };

  const loadHabits = async () => {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading habits:', error);
      return;
    }

    setHabits(data || []);
  };

  const loadHabitTracking = async (weekId: string) => {
    const { data, error } = await supabase
      .from('habit_tracking')
      .select('*')
      .eq('week_id', weekId);

    if (error) {
      console.error('Error loading habit tracking:', error);
      return;
    }

    setHabitTracking(data || []);
  };

  const loadReflections = async (weekId: string) => {
    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('week_id', weekId);

    if (error) {
      console.error('Error loading reflections:', error);
      return;
    }

    setReflections(data || []);
  };

  const loadMonthlyData = async (month: Date) => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const { data: weeks, error: weeksError } = await supabase
      .from('weeks')
      .select('*')
      .eq('user_id', user!.id)
      .gte('start_date', formatDate(firstDay))
      .lte('start_date', formatDate(lastDay))
      .order('start_date', { ascending: true });

    if (weeksError) {
      console.error('Error loading monthly weeks:', weeksError);
      return;
    }

    setMonthlyWeeks(weeks || []);

    const tasksMap: Record<string, Task[]> = {};
    const trackingMap: Record<string, HabitTracking[]> = {};

    for (const week of weeks || []) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('week_id', week.id);

      const { data: tracking } = await supabase
        .from('habit_tracking')
        .select('*')
        .eq('week_id', week.id);

      tasksMap[week.id] = tasks || [];
      trackingMap[week.id] = tracking || [];
    }

    setMonthlyTasksMap(tasksMap);
    setMonthlyTrackingMap(trackingMap);
  };

  const handleWeekUpdate = async (updates: Partial<Week>) => {
    if (!currentWeek) return;

    const { error } = await supabase
      .from('weeks')
      .update(updates)
      .eq('id', currentWeek.id);

    if (error) {
      console.error('Error updating week:', error);
      toast.error('Failed to update week');
      return;
    }

    setCurrentWeek({ ...currentWeek, ...updates });
  };

  const handleDateChange = async (newStartDate: Date) => {
    const monday = getMonday(newStartDate);
    const startDate = formatDate(monday);

    const { data: existingWeek, error: fetchError } = await supabase
      .from('weeks')
      .select('*')
      .eq('user_id', user!.id)
      .eq('start_date', startDate)
      .eq('is_active', true)
      .single();

    if (!fetchError && existingWeek) {
      setCurrentWeek(existingWeek);
      setWeekDates(getWeekDates(monday));
      await loadTasks(existingWeek.id);
      await loadHabitTracking(existingWeek.id);
      await loadReflections(existingWeek.id);
    } else {
      await createNewWeek(monday);
    }
  };

  const handleUpdateReflection = async (dayIndex: number, updates: Partial<Reflection>) => {
    if (!currentWeek) return;

    const existing = reflections.find(r => r.day_index === dayIndex);

    if (existing) {
      const { error } = await supabase
        .from('reflections')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating reflection:', error);
        return;
      }

      setReflections(reflections.map(r =>
        r.id === existing.id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
      ));
    } else {
      const { data, error } = await supabase
        .from('reflections')
        .insert({
          week_id: currentWeek.id,
          day_index: dayIndex,
          ...updates,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reflection:', error);
        return;
      }

      setReflections([...reflections, data]);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    loadMonthlyData(newMonth);
  };

  const handleWeekSelect = (week: Week) => {
    setViewMode('weekly');
    setCurrentWeek(week);
    setWeekDates(getWeekDates(new Date(week.start_date)));
    loadTasks(week.id);
    loadHabitTracking(week.id);
    loadReflections(week.id);
  };

  const handleAddTask = async (dayIndex: number, taskText: string, taskType: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    if (!currentWeek) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        week_id: currentWeek.id,
        day_index: dayIndex,
        task_text: taskText,
        task_type: taskType,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding task - Full:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      toast.error(`Failed to add task: ${error.message}`);
      return;
    }

    setTasks([...tasks, data]);
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', taskId);

    if (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
      return;
    }

    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed } : t));
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      return;
    }

    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleAddHabit = async (name: string) => {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user!.id,
        name,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding habit:', error);
      toast.error('Failed to add habit');
      return;
    }

    setHabits([...habits, data]);
  };

  const handleDeleteHabit = async (habitId: string) => {
    const { error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', habitId);

    if (error) {
      console.error('Error deleting habit:', error);
      toast.error('Failed to delete habit');
      return;
    }

    setHabits(habits.filter(h => h.id !== habitId));
    setHabitTracking(habitTracking.filter(ht => ht.habit_id !== habitId));
  };

  const handleToggleHabit = async (habitId: string, dayIndex: number, completed: boolean) => {
    if (!currentWeek) return;

    // Optimistic update - update UI immediately
    const existing = habitTracking.find(
      ht => ht.habit_id === habitId && ht.week_id === currentWeek.id && ht.day_index === dayIndex
    );
    const previousTracking = [...habitTracking];

    if (existing) {
      setHabitTracking(prev => prev.map(ht =>
        ht.habit_id === habitId && ht.week_id === currentWeek.id && ht.day_index === dayIndex
          ? { ...ht, completed }
          : ht
      ));
    } else {
      setHabitTracking(prev => [...prev, {
        id: `temp-${habitId}-${dayIndex}`,
        habit_id: habitId,
        week_id: currentWeek.id,
        day_index: dayIndex,
        completed,
      } as HabitTracking]);
    }

    // Save to database in background
    const { data, error } = await supabase
      .from('habit_tracking')
      .upsert(
        {
          habit_id: habitId,
          week_id: currentWeek.id,
          day_index: dayIndex,
          completed,
        },
        {
          onConflict: 'habit_id,week_id,day_index',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating habit tracking:', error);
      toast.error('Failed to update habit');
      // Rollback on error
      setHabitTracking(previousTracking);
      return;
    }

    // Replace temp entry with real data
    setHabitTracking(prev => prev.map(ht =>
      (ht.habit_id === habitId && ht.week_id === currentWeek.id && ht.day_index === dayIndex)
        ? data
        : ht
    ));
  };

  const handleToggleMonthlyHabit = async (habitId: string, weekId: string, dayIndex: number, completed: boolean) => {
    // Optimistic update - update UI immediately
    const trackingForWeek = monthlyTrackingMap[weekId] || [];
    const existing = trackingForWeek.find(
      ht => ht.habit_id === habitId && ht.week_id === weekId && ht.day_index === dayIndex
    );
    const previousMap = { ...monthlyTrackingMap };

    if (existing) {
      setMonthlyTrackingMap(prev => ({
        ...prev,
        [weekId]: (prev[weekId] || []).map(ht =>
          ht.habit_id === habitId && ht.week_id === weekId && ht.day_index === dayIndex
            ? { ...ht, completed }
            : ht
        )
      }));
    } else {
      setMonthlyTrackingMap(prev => ({
        ...prev,
        [weekId]: [...(prev[weekId] || []), {
          id: `temp-${habitId}-${dayIndex}`,
          habit_id: habitId,
          week_id: weekId,
          day_index: dayIndex,
          completed,
        } as HabitTracking]
      }));
    }

    // Save to database in background
    const { data, error } = await supabase
      .from('habit_tracking')
      .upsert(
        {
          habit_id: habitId,
          week_id: weekId,
          day_index: dayIndex,
          completed,
        },
        {
          onConflict: 'habit_id,week_id,day_index',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating habit tracking:', error);
      toast.error('Failed to update habit');
      // Rollback on error
      setMonthlyTrackingMap(previousMap);
      return;
    }

    // Replace temp entry with real data
    setMonthlyTrackingMap(prev => ({
      ...prev,
      [weekId]: (prev[weekId] || []).map(ht =>
        (ht.habit_id === habitId && ht.week_id === weekId && ht.day_index === dayIndex)
          ? data
          : ht
      )
    }));
  };

  const handleSaveWeek = async () => {
    if (!currentWeek) return;

    const today = new Date();
    if (today.getDay() !== 0) {
      setShowSaveBlockedDialog(true);
      return;
    }

    setSaving(true);

    const weekData = {
      week: currentWeek,
      tasks,
      habits,
      habit_tracking: habitTracking,
    };

    // compute completion percentage for this week to store with archive
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const taskPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const completedHabitSlots = habitTracking.filter(t => t.completed).length;
    const totalHabitSlots = habits.length * 7;
    const habitPercentage = totalHabitSlots > 0 ? (completedHabitSlots / totalHabitSlots) * 100 : 0;

    const completion = Math.round((taskPercentage + habitPercentage) / 2);

    // store completion and week_start inside week_data to avoid schema mismatch
    weekData.completion = completion;
    weekData.week_start = currentWeek.start_date;

    const { data: inserted, error } = await supabase
      .from('archived_weeks')
      .insert({
        user_id: user!.id,
        week_data: {
          ...weekData,
          user_id: user!.id,
        },
      })
      .select()
      .single();

    console.log('handleSaveWeek: insert result', { inserted, error });

    if (error) {
      console.error('Insert error - Full:', error);
      console.error('Insert error message:', error.message);
      console.error('Insert error details:', error.details);
    }

    // Try to verify the insert
    if (inserted) {
      console.log('Successfully inserted week:', inserted);
    }

    // fetch and log archived rows for this user to verify persistence
    try {
      const { data: archivedRows, error: fetchArchivedError } = await supabase
        .from('archived_weeks')
        .select('*');

      if (fetchArchivedError) {
        console.error('Fetch error - Full:', fetchArchivedError);
        console.error('Fetch error message:', fetchArchivedError.message);
      }

      console.log('handleSaveWeek: archived rows after insert', { archivedRows, fetchArchivedError });
    } catch (e) {
      console.error('handleSaveWeek: error fetching archived rows', e);
    }

    if (error) {
      console.error('Error saving week:', error);
      toast.error('Failed to save week');
      setSaving(false);
      return;
    }

    toast.success('Week archived successfully!');

    // trigger overview refresh
    setOverviewRefreshKey(k => k + 1);

    if (!inserted || error) {
      console.error('Archive insert failed or returned no data:', { inserted, error });
      toast.error('Archive may not have been saved correctly. Check console for details.');
    }

    // Advance to next week (create if missing) and clear current tasks/tracking in UI
    try {
      const start = new Date(currentWeek.start_date);
      const nextStart = new Date(start);
      nextStart.setDate(start.getDate() + 7);
      const nextStartStr = formatDate(nextStart);

      // Try to find existing week
      const { data: existingNextWeek, error: fetchNextError } = await supabase
        .from('weeks')
        .select('*')
        .eq('user_id', user!.id)
        .eq('start_date', nextStartStr)
        .single();

      if (fetchNextError && fetchNextError.code !== 'PGRST116') {
        console.error('Error checking next week:', fetchNextError);
      }

      let nextWeekRecord = existingNextWeek;
      if (!nextWeekRecord) {
        const endDate = new Date(nextStart);
        endDate.setDate(nextStart.getDate() + 6);
        const { data: newWeek, error: createWeekError } = await supabase
          .from('weeks')
          .insert({
            user_id: user!.id,
            start_date: formatDate(nextStart),
            end_date: formatDate(endDate),
            is_active: true,
          })
          .select()
          .single();

        if (createWeekError) {
          console.error('Error creating next week:', createWeekError);
        } else {
          nextWeekRecord = newWeek;
        }
      }

      // Switch UI to next week and clear tasks/tracking
      if (nextWeekRecord) {
        // Check if next week is in the same month as current week
        const currentWeekStart = new Date(currentWeek.start_date);
        const nextWeekStart = new Date(nextWeekRecord.start_date);
        const isSameMonth = currentWeekStart.getMonth() === nextWeekStart.getMonth() && 
                           currentWeekStart.getFullYear() === nextWeekStart.getFullYear();

        // If in the same month, copy monthly tasks to next week
        if (isSameMonth) {
          const monthlyTasks = tasks.filter(t => t.task_type === 'monthly');
          
          for (const task of monthlyTasks) {
            // Insert the monthly task into the next week
            const { error: insertError } = await supabase
              .from('tasks')
              .insert({
                week_id: nextWeekRecord.id,
                day_index: task.day_index,
                task_text: task.task_text,
                task_type: task.task_type,
                completed: false,
              });

            if (insertError) {
              console.error('Error copying monthly task to next week:', insertError);
            }
          }
        }

        setCurrentWeek(nextWeekRecord);
        setWeekDates(getWeekDates(new Date(nextWeekRecord.start_date)));
        setTasks([]);
        setHabitTracking([]);
        // Load tasks/tracking from next week
        await loadTasks(nextWeekRecord.id);
        await loadHabitTracking(nextWeekRecord.id);
      }
    } catch (e) {
      console.error('Error advancing to next week after save:', e);
    }

    setSaving(false);
  };

  const handleResetWeek = () => {
    setShowResetConfirm(true);
  };

  const confirmResetWeek = async () => {
    if (!currentWeek) return;
    setShowResetConfirm(false);
    setResetting(true);

    const { error: taskError } = await supabase
      .from('tasks')
      .delete()
      .eq('week_id', currentWeek.id);

    if (taskError) {
      console.error('Error deleting tasks:', taskError);
      toast.error('Failed to reset week');
      setResetting(false);
      return;
    }

    const { error: trackingError } = await supabase
      .from('habit_tracking')
      .delete()
      .eq('week_id', currentWeek.id);

    if (trackingError) {
      console.error('Error deleting habit tracking:', trackingError);
      toast.error('Failed to reset week');
      setResetting(false);
      return;
    }

    const { error: weekError } = await supabase
      .from('weeks')
      .update({
        weekly_focus: null,
        reward: null,
        affirmation: null,
      })
      .eq('id', currentWeek.id);

    if (weekError) {
      console.error('Error resetting week:', weekError);
      toast.error('Failed to reset week');
      setResetting(false);
      return;
    }

    setTasks([]);
    setHabitTracking([]);
    setCurrentWeek({
      ...currentWeek,
      weekly_focus: null,
      reward: null,
      affirmation: null,
    });

    toast.success('Week reset successfully!');
    setResetting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const totalHabitsCompleted = habitTracking.filter(t => t.completed).length;
  const overallCompletion = (() => {
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const taskPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const totalHabitSlots = habits.length * 7;
    const habitPercentage = totalHabitSlots > 0 ? (totalHabitsCompleted / totalHabitSlots) * 100 : 0;
    
    return Math.round((taskPercentage + habitPercentage) / 2);
  })();



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <DashboardHeader
        currentDate={currentDate}
        habitsCompleted={totalHabitsCompleted}
        isPwaMobile={isPwaMobile}
        autoRotateEnabled={autoRotateEnabled}
        onToggleAutoRotate={handleToggleAutoRotate}
      />

      <MotivationalToast />
    
      <main className="max-w-[1440px] mx-auto px-3 sm:px-4 pt-28 sm:pt-32 pb-4 sm:pb-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div className={`flex w-full sm:w-auto gap-2 ${isPwaMobile ? '-mx-4 w-[calc(100%+2rem)] px-4 gap-3' : ''}`}>
              <Button
                onClick={() => setViewMode('weekly')}
                variant={viewMode === 'weekly' ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 sm:flex-none whitespace-nowrap ${isPwaMobile ? 'h-12 text-base' : ''} ${viewMode === 'weekly' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                <LayoutGrid className={`${isPwaMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-2`} />
                Weekly View
              </Button>
              <Button
                onClick={() => setViewMode('monthly')}
                variant={viewMode === 'monthly' ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 sm:flex-none whitespace-nowrap ${isPwaMobile ? 'h-12 text-base' : ''} ${viewMode === 'monthly' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                <Calendar className={`${isPwaMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-2`} />
                Overview
              </Button>
            </div>
          </div>

          {viewMode === 'monthly' && (
            <>
              <Overview 
                refreshKey={overviewRefreshKey} 
                currentWeek={currentWeek}
                tasks={tasks}
                habits={habits}
                habitTracking={habitTracking}
                allWeeks={allWeeks}
                allTasksMap={monthlyTasksMap}
              />
            </>
          )}

          {viewMode === 'weekly' && (
            <>
              <HabitTracker
                habits={habits}
                tracking={habitTracking}
                weekDates={weekDates}
                onAddHabit={handleAddHabit}
                onDeleteHabit={handleDeleteHabit}
                onToggleHabit={handleToggleHabit}
              />

              <TaskTrackerCard
                currentWeek={currentWeek}
                tasks={tasks}
                weekDates={weekDates}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                currentDate={currentDate}
              />

              <HabitStreakCard
                habits={habits}
                tracking={habitTracking}
              />

              <WeekControls
                onSaveWeek={handleSaveWeek}
                onResetWeek={handleResetWeek}
                saving={saving}
                resetting={resetting}
              />
            </>
          )}
        </main>

        <AlertDialog open={showSaveBlockedDialog} onOpenChange={setShowSaveBlockedDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cannot Save Week Yet</AlertDialogTitle>
              <AlertDialogDescription>
                The week can only be saved on <span className="font-bold text-primary-600">Sunday</span>. Please come back on the weekend to save your weekly progress!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Week</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reset this week? All tasks and habits will be cleared. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmResetWeek}
                className="bg-red-600 hover:bg-red-700"
              >
                Reset Week
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
