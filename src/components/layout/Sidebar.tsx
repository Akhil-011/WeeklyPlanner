import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
  currentWeekNumber: number;
  onWeekSelect: (weekNumber: number) => void;
  totalWeeks: number;
}

export function Sidebar({ currentWeekNumber, onWeekSelect, totalWeeks }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const weekNumbers = Array.from({ length: Math.max(totalWeeks, 52) }, (_, i) => i + 1);

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-20"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-0' : 'w-16'
        } overflow-hidden`}
      >
        <div className="h-full overflow-y-auto py-4 scrollbar-thin">
          <div className="space-y-1 px-2">
            {weekNumbers.map((weekNum) => (
              <button
                key={weekNum}
                onClick={() => {
                  onWeekSelect(weekNum);
                  if (isMobile) setIsCollapsed(true);
                }}
                className={`w-full text-center py-2 rounded-md text-sm font-medium transition-all hover:bg-green-50 hover:text-green-700 ${
                  weekNum === currentWeekNumber
                    ? 'bg-green-100 text-green-800 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {weekNum}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-gray-200 rounded-r-md p-1 hover:bg-gray-50 transition-all shadow-md"
        style={{ left: isCollapsed ? '0' : '64px' }}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>
    </>
  );
}
