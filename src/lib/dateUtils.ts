export function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getMonday(date: Date): Date {
  const current = new Date(date);
  const day = current.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // To get Monday of the current week:
  // If today is Sunday, go back 6 days to get Monday of the same week
  // If today is Monday, don't go back (0 days)
  // If today is Tuesday-Saturday, go back 1-5 days
  const daysToGoBack = day === 0 ? 6 : day - 1;
  current.setDate(current.getDate() - daysToGoBack);
  return current;
}
