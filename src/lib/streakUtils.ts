import { HabitTracking } from '@/types';

export function calculateCurrentStreak(habitId: string, tracking: HabitTracking[], weekStartDates: string[]): number {
  // Sort weeks by date descending
  const sortedWeeks = [...weekStartDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let currentStreak = 0;
  
  for (const weekStart of sortedWeeks) {
    const weekTracking = tracking.filter(t => 
      t.habit_id === habitId && 
      t.completed
    );
    
    if (weekTracking.length === 0) break;
    
    // Count consecutive days in this week
    for (let i = 6; i >= 0; i--) {
      const dayCompleted = weekTracking.some(t => t.day_index === i);
      if (dayCompleted) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  return currentStreak;
}

export function calculateLongestStreak(habitId: string, tracking: HabitTracking[]): number {
  const habitTracking = tracking.filter(t => t.habit_id === habitId && t.completed);
  
  if (habitTracking.length === 0) return 0;
  
  // Group by week and sort
  const weekGroups = habitTracking.reduce((acc, t) => {
    if (!acc[t.week_id]) acc[t.week_id] = [];
    acc[t.week_id].push(t.day_index);
    return acc;
  }, {} as Record<string, number[]>);
  
  let longestStreak = 0;
  let currentStreak = 0;
  
  Object.values(weekGroups).forEach(days => {
    const sortedDays = days.sort((a, b) => a - b);
    
    sortedDays.forEach(day => {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    });
  });
  
  return longestStreak;
}

export function getStreakMilestone(streak: number): { message: string; emoji: string } | null {
  const milestones = [
    { days: 100, message: "Century Club! 100 days strong! 🎊", emoji: "🎊" },
    { days: 90, message: "90 days! You're unstoppable!", emoji: "🚀" },
    { days: 60, message: "2 months! Keep the momentum!", emoji: "💪" },
    { days: 30, message: "30-day streak! You're on fire!", emoji: "🔥" },
    { days: 21, message: "21 days! Habit formed!", emoji: "⭐" },
    { days: 14, message: "2 weeks strong! Keep going!", emoji: "💚" },
    { days: 7, message: "Week streak! Amazing start!", emoji: "🎯" },
    { days: 3, message: "3 days! Building momentum!", emoji: "✨" },
  ];
  
  const milestone = milestones.find(m => m.days === streak);
  return milestone || null;
}
