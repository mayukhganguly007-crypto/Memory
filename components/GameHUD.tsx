
import React from 'react';

interface GameHUDProps {
  score: number;
  level: number;
  streak: number;
}

const GameHUD: React.FC<GameHUDProps> = ({ score, level, streak }) => {
  return (
    <div className="flex justify-between items-center w-full max-w-2xl px-6 py-4 glass rounded-2xl mb-8">
      <div className="flex flex-col">
        <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Current IQ Index</span>
        <span className="text-2xl font-bold text-cyan-400">{score.toLocaleString()}</span>
      </div>
      <div className="h-12 w-[1px] bg-slate-700/50" />
      <div className="flex flex-col items-center">
        <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Neural Stage</span>
        <span className="text-2xl font-bold text-violet-400">{level}</span>
      </div>
      <div className="h-12 w-[1px] bg-slate-700/50" />
      <div className="flex flex-col items-end">
        <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Synapse Streak</span>
        <span className="text-2xl font-bold text-amber-400">×{streak}</span>
      </div>
    </div>
  );
};

export default GameHUD;
