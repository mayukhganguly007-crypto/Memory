
import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, GameState, Puzzle } from './types';
import { generatePuzzle } from './services/geminiService';
import GameHUD from './components/GameHUD';
import NumberDisplay from './components/NumberDisplay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    streak: 0,
    mode: GameMode.SEQUENCE,
    isVibrating: false
  });

  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isMemorizing, setIsMemorizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const fetchNextPuzzle = useCallback(async (currentLevel: number, mode: GameMode) => {
    setIsLoading(true);
    setFeedback({ msg: "Synthesizing Neural Patterns...", type: 'info' });
    try {
      const puzzle = await generatePuzzle(currentLevel, mode);
      setCurrentPuzzle(puzzle);
      setIsMemorizing(true);
      setFeedback(null);
    } catch (err) {
      setFeedback({ msg: "Connection to Neural Network failed. Retrying...", type: 'error' });
      setTimeout(() => fetchNextPuzzle(currentLevel, mode), 3000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNextPuzzle(gameState.level, gameState.mode);
  }, []);

  const handleStartRecall = () => {
    setIsMemorizing(false);
    setUserInput('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentPuzzle) return;

    // Normalize comparison: remove spaces, commas
    const cleanAnswer = currentPuzzle.answer.replace(/[\s,]/g, '');
    const cleanInput = userInput.replace(/[\s,]/g, '');

    if (cleanInput === cleanAnswer) {
      setFeedback({ msg: "Correct! Neural Pathway Reinforced.", type: 'success' });
      setGameState(prev => ({
        ...prev,
        score: prev.score + (100 * prev.level * (prev.streak + 1)),
        streak: prev.streak + 1,
        level: prev.streak >= 2 ? prev.level + 1 : prev.level,
        isVibrating: true
      }));
      
      // Temporary vibration effect
      setTimeout(() => setGameState(p => ({ ...p, isVibrating: false })), 500);
      
      setTimeout(() => {
        setFeedback(null);
        // Rotate modes every 2 levels or so
        const newMode = (gameState.level % 3 === 0) ? GameMode.LOGIC : 
                        (gameState.level % 3 === 1) ? GameMode.SEQUENCE : GameMode.REVERSE;
        setGameState(p => ({...p, mode: newMode}));
        fetchNextPuzzle(gameState.level + (gameState.streak >= 2 ? 1 : 0), newMode);
      }, 1500);
    } else {
      setFeedback({ msg: "Incorrect. Cognitive Dissonance Detected.", type: 'error' });
      setGameState(prev => ({
        ...prev,
        streak: 0,
        isVibrating: false
      }));
      setShowExplanation(true);
    }
  };

  const handleRetry = () => {
    setShowExplanation(false);
    setUserInput('');
    setFeedback(null);
    fetchNextPuzzle(gameState.level, gameState.mode);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start py-12 px-4 transition-colors duration-500`}>
      <header className="mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent mb-2 italic">
          NeurOn
        </h1>
        <p className="text-slate-400 tracking-[0.2em] uppercase text-sm font-semibold">Brain Vibration Protocol</p>
      </header>

      <GameHUD score={gameState.score} level={gameState.level} streak={gameState.streak} />

      <main className="w-full max-w-2xl glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-20">
             <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-cyan-400 animate-pulse font-medium">Downloading Neural Data...</p>
          </div>
        )}

        {currentPuzzle && !showExplanation && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                {isMemorizing 
                  ? (gameState.mode === GameMode.REVERSE ? "Memorize (Recall Reverse!)" : "Memorize Sequence") 
                  : "Enter Recall Sequence"}
              </h2>
              <p className="text-slate-400 text-sm">
                {gameState.mode === GameMode.LOGIC 
                  ? "Analyze the sequence carefully to find the logic." 
                  : "Store these numbers in your phonological loop."}
              </p>
            </div>

            {isMemorizing ? (
              <NumberDisplay 
                numbers={currentPuzzle.sequence} 
                isVisible={isMemorizing} 
                onTimerEnd={handleStartRecall}
                vibrate={gameState.isVibrating}
              />
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
                <div className="text-center text-indigo-300 font-mono text-lg mb-2">
                  {currentPuzzle.question}
                </div>
                <input
                  type="text"
                  autoFocus
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type sequence here..."
                  className="w-full max-w-sm bg-slate-900/50 border-2 border-slate-700 rounded-2xl py-4 px-6 text-2xl text-center text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all font-mono"
                />
                <button
                  type="submit"
                  className="w-full max-w-sm bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                  TRANSMIT ANSWER
                </button>
              </form>
            )}

            {feedback && (
              <div className={`text-center font-bold px-4 py-2 rounded-lg transition-all animate-bounce ${
                feedback.type === 'success' ? 'text-emerald-400' : 
                feedback.type === 'error' ? 'text-rose-400' : 'text-cyan-400'
              }`}>
                {feedback.msg}
              </div>
            )}
          </div>
        )}

        {showExplanation && currentPuzzle && (
          <div className="text-center space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-rose-500">Neural Breakpoint</h2>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-rose-500/30 text-left">
              <p className="text-slate-300 leading-relaxed mb-4">
                <span className="text-rose-400 font-bold block mb-1 uppercase text-xs tracking-widest">Logic Breakdown</span>
                {currentPuzzle.explanation}
              </p>
              <p className="text-cyan-400 font-bold">
                Correct Answer: <span className="font-mono text-xl">{currentPuzzle.answer}</span>
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl transition-all font-bold"
            >
              RESTART NEURAL SYNTHESIS
            </button>
          </div>
        )}
      </main>

      <footer className="mt-12 max-w-2xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass p-4 rounded-xl text-center">
            <i className="fa-solid fa-brain text-cyan-400 mb-2 text-xl"></i>
            <h3 className="text-xs font-bold text-slate-500 uppercase">Focus Area</h3>
            <p className="text-sm">Working Memory</p>
          </div>
          <div className="glass p-4 rounded-xl text-center">
            <i className="fa-solid fa-bolt text-amber-400 mb-2 text-xl"></i>
            <h3 className="text-xs font-bold text-slate-500 uppercase">Difficulty</h3>
            <p className="text-sm">Dynamic Adaptive</p>
          </div>
          <div className="glass p-4 rounded-xl text-center">
            <i className="fa-solid fa-microchip text-violet-400 mb-2 text-xl"></i>
            <h3 className="text-xs font-bold text-slate-500 uppercase">Engine</h3>
            <p className="text-sm">Gemini AI G3</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
