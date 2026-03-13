import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TotalProgressCardProps {
  percentage: number;
}

export function TotalProgressCard({ percentage }: TotalProgressCardProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="bg-white rounded-lg shadow-card p-8 border border-gray-100 hover:shadow-card-hover transition-all animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Total Progress</h2>
        <TrendingUp className="h-5 w-5 text-green-600" />
      </div>
      
      <div className="text-center mb-6">
        <div className="text-4xl sm:text-6xl font-bold text-green-600 mb-2 animate-count">
          {animatedPercentage}%
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full progress-bar-fill"
          style={{ width: `${animatedPercentage}%` }}
        />
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        {percentage >= 80 && "Outstanding progress! 🎉"}
        {percentage >= 60 && percentage < 80 && "You're doing great! 💪"}
        {percentage >= 40 && percentage < 60 && "Keep pushing forward! ✨"}
        {percentage < 40 && "Every step counts! 🌱"}
      </div>
    </div>
  );
}
