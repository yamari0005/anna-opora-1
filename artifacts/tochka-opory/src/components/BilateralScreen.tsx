import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { incrementUsage } from '../lib/store';
import { CompleteMessage } from './CompleteMessage';
import { ThemeToggle } from './ThemeToggle';

interface BilateralScreenProps {
  onBack: () => void;
  onHome: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function BilateralScreen({ onBack, onHome, theme, toggleTheme }: BilateralScreenProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;
    if (timeLeft <= 0) {
      handleComplete();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isComplete]);

  const handleComplete = () => {
    setIsComplete(true);
    incrementUsage('tech1');
  };

  if (isComplete) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <CompleteMessage 
          onBack={onBack} 
          onHome={onHome} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </div>
    );
  }

  // Uses custom dark styles specifically as requested
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#1e293b] text-white animate-float-in">
      <header className="flex justify-between items-center p-6 w-full max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center text-sm font-medium hover:text-white/80 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад
        </button>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button onClick={handleComplete} className="text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors cursor-pointer">
            Завершить
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[70vw] max-w-2xl h-1 bg-white/5 rounded-full" />
        <div className="w-[30px] h-[30px] rounded-full bg-[#60a5fa] shadow-[0_0_20px_rgba(96,165,250,0.6)] animate-bilateral-move absolute top-1/2 -translate-y-1/2 left-[calc(50%-15px)]" />
      </main>

      <footer className="p-6 text-center max-w-md mx-auto w-full">
        <p className="mb-6 text-white/80 leading-relaxed">Следите глазами за точкой. Не двигайте головой. Дышите ровно.</p>
        <div className="text-3xl font-mono opacity-50 mb-4">{timeLeft} сек</div>
      </footer>
    </div>
  );
}
