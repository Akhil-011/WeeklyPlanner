export interface Week {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  weekly_focus: string | null;
  reward: string | null;
  affirmation: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  week_id: string;
  day_index: number;
  task_text: string;
  completed: boolean;
  task_type: 'daily' | 'weekly' | 'monthly';
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface HabitTracking {
  id: string;
  habit_id: string;
  week_id: string;
  day_index: number;
  completed: boolean;
}

export interface Reflection {
  id: string;
  week_id: string;
  day_index: number;
  went_well: string | null;
  improvements: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}
