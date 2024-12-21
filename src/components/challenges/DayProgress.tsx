import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface DayProgressProps {
  currentDay: number;
  totalDays: number;
  startDate: Date;
  onDaySelect: (day: number) => void;
  isCurrentDayComplete: boolean;
}

const DayProgress: React.FC<DayProgressProps> = ({
  currentDay,
  totalDays,
  startDate,
  onDaySelect,
  isCurrentDayComplete
}) => {
  const { t } = useTranslation();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const today = new Date();

  const scrollDays = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const scrollAmount = direction === 'left' ? -200 : 200;
    containerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  const isDayAccessible = (dayNumber: number) => {
    // Can only access previous days and current day
    if (dayNumber < currentDay) return true;
    
    // Can only access next day if current day is complete
    if (dayNumber === currentDay + 1) {
      return isCurrentDayComplete;
    }
    
    // Can't access future days beyond next day
    if (dayNumber > currentDay + 1) return false;

    // Can access current day
    return dayNumber === currentDay;
  };

  const isDayComplete = (dayNumber: number) => {
    return dayNumber < currentDay || (dayNumber === currentDay && isCurrentDayComplete);
  };

  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="relative">
          <button
            onClick={() => scrollDays('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center z-10"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div 
            ref={containerRef}
            className="overflow-x-auto scrollbar-hide flex gap-3 px-10"
          >
            {Array.from({ length: totalDays }).map((_, index) => {
              const dayNumber = index + 1;
              const dayDate = addDays(startDate, index);
              const accessible = isDayAccessible(dayNumber);
              const completed = isDayComplete(dayNumber);
              
              return (
                <button
                  key={dayNumber}
                  onClick={() => accessible && onDaySelect(dayNumber)}
                  disabled={!accessible}
                  className={`shrink-0 w-16 h-20 rounded-lg flex flex-col items-center justify-center transition-all
                    ${dayNumber === currentDay
                      ? 'bg-primary/10 border-2 border-primary'
                      : completed
                      ? 'bg-gray-100'
                      : accessible
                      ? 'bg-white border-2 border-gray-200 hover:border-primary/50'
                      : 'bg-gray-50 border-2 border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                >
                  <span className="text-sm text-gray-500">{t('challenges.day')}</span>
                  <span className="text-xl font-bold">{dayNumber}</span>
                  <span className="text-xs text-gray-500">
                    {format(dayDate, 'd MMM')}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollDays('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center z-10"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayProgress;