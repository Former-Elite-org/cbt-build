import { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatDuration } from '@/lib/utils/format';

interface ExamTimerProps {
  duration: number; // in minutes
  onTimeUp: () => void;
  startTime: Date;
}

export function ExamTimer({ duration, onTimeUp, startTime }: ExamTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Convert to seconds
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const remaining = duration * 60 - elapsed;
      setTimeRemaining(Math.max(0, remaining));

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp();
      } else if (remaining <= 300) {
        // 5 minutes warning
        setIsWarning(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, startTime, onTimeUp]);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const formatTime = () => {
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const percentage = (timeRemaining / (duration * 60)) * 100;

  return (
    <Card className={isWarning ? 'border-red-500 bg-red-50' : ''}>
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock
              className={`w-5 h-5 ${isWarning ? 'text-red-600' : 'text-primary-600'}`}
            />
            <div>
              <p className={`text-2xl font-bold ${isWarning ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                {formatTime()}
              </p>
              <p className="text-xs text-gray-500">Time Remaining</p>
            </div>
          </div>

          {isWarning && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Less than 5 minutes!
            </Badge>
          )}

          {/* Progress Bar */}
          <div className="flex-1 max-w-xs ml-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isWarning ? 'bg-red-500' : 'bg-primary-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {percentage.toFixed(0)}% remaining
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

