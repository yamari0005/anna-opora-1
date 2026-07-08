import { getRecentUsageCount } from '../lib/store';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

interface MainScreenProps {
  onNext: () => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

export function MainScreen({ onNext, toggleTheme, theme }: MainScreenProps) {
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    setUsageCount(getRecentUsageCount());
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] p-6 animate-float-in max-w-4xl mx-auto w-full">
      <header className="flex justify-between items-start w-full">
        <div>
          <h1 className="text-lg font-medium text-foreground">Точка опоры</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">Стабилизация состояния при тревоге и стрессе</p>
        </div>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center py-10">
        <p className="text-center text-lg md:text-xl mb-16 max-w-md mx-auto text-foreground/90 leading-relaxed">
          Здравствуйте! Это Анна, ваш психолог. Если вам сейчас тяжело, давайте вместе найдём точку опоры и стабилизируем состояние.
        </p>

        <button 
          onClick={onNext}
          className="w-[200px] h-[200px] rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xl shadow-xl shadow-rose-500/20 animate-pulse-button transition-colors flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-rose-500/50 cursor-pointer select-none"
        >
          МНЕ ПЛОХО
        </button>
      </main>

      <footer className="text-center mt-auto pt-6 text-sm text-muted-foreground">
        Вы обращались к Точке опоры {usageCount} раз за последние 7 дней
      </footer>
    </div>
  );
}
