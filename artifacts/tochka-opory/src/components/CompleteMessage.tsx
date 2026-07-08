import { Send } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface CompleteMessageProps {
  onBack: () => void;
  onHome: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const PSYCHOLOGIST_TELEGRAM_URL = 'https://t.me/anna_diring_msk';

// Единое сообщение после завершения любой техники, со ссылкой на Telegram психолога
export function CompleteMessage({ onBack, onHome, theme, toggleTheme }: CompleteMessageProps) {
  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto p-6">
      <header className="flex justify-end w-full mb-4">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>
      <div className="flex flex-col items-center justify-center flex-1 text-center animate-float-in">
        <div className="bg-card border border-card-border p-8 rounded-2xl shadow-sm w-full">
          <p className="text-lg mb-8 leading-relaxed text-card-foreground">
            Отлично! Вы нашли точку опоры. Если состояние не улучшилось, обратитесь к{' '}
            <a
              href={PSYCHOLOGIST_TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[#3b82f6] dark:text-[#60a5fa] underline underline-offset-2 hover:text-[#2563eb] dark:hover:text-[#93c5fd] transition-colors"
            >
              психологу
              <Send className="w-4 h-4" />
            </a>
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onBack}
              className="w-full py-3 px-4 rounded-xl font-medium border-2 transition-colors bg-white text-slate-700 border-[#cbd5e1] hover:bg-[#f8fafc] dark:bg-[#1e293b] dark:text-[#e2e8f0] dark:border-[#475569] dark:hover:bg-[#28374a]"
            >
              ← К списку техник
            </button>
            <button onClick={onHome} className="w-full py-3 px-4 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              На главную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
