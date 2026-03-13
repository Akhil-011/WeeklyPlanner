import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export function MotivationalToast() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 5000);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 max-w-md">
        <Sparkles className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium">
          POV: You FINALLY understand weekly planning...
        </p>
      </div>
    </div>
  );
}
