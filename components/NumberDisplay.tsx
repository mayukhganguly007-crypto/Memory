
import React, { useEffect, useState } from 'react';

interface NumberDisplayProps {
  numbers: number[];
  isVisible: boolean;
  onTimerEnd: () => void;
  vibrate: boolean;
}

const NumberDisplay: React.FC<NumberDisplayProps> = ({ numbers, isVisible, onTimerEnd, vibrate }) => {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (isVisible) {
      // Calculate time based on number of items and level
      const calcTime = Math.max(3, numbers.length * 0.8);
      setTimeLeft(Math.ceil(calcTime));
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isVisible, numbers, onTimerEnd]);

  if (!isVisible) return null;

  return (
    <div className={`flex flex-col items-center w-full space-y-8 ${vibrate ? 'vibrate-active' : ''}`}>
      <div className="flex flex-wrap justify-center gap-4">
        {numbers.map((num, idx) => (
          <div 
            key={idx}
            className="w-16 h-20 md:w-20 md:h-24 flex items-center justify-center bg-slate-900 border-2 border-cyan-500/30 rounded-xl text-3xl md:text-4xl font-bold text-white shadow-lg shadow-cyan-500/10 num-cell"
          >
            {num}
          </div>
        ))}
      </div>
      
      <div className="w-full max-w-xs flex flex-col items-center">
        <div className="text-cyan-400 text-sm font-medium mb-2 tracking-widest uppercase">
          Neural Retention: {timeLeft}s
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-cyan-500 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / (numbers.length * 0.8)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default NumberDisplay;
