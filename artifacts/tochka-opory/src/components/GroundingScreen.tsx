import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { incrementUsage } from '../lib/store';
import { CompleteMessage } from './CompleteMessage';
import { ThemeToggle } from './ThemeToggle';

interface GroundingScreenProps {
  onBack: () => void;
  onHome: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const STEPS = [
  "Найдите 5 предметов одного цвета",
  "Услышьте 4 разных звука",
  "Потрогайте 3 разные текстуры",
  "Уловите 2 запаха",
  "Почувствуйте 1 вкус"
];

export function GroundingScreen({ onBack, onHome, theme, toggleTheme }: GroundingScreenProps) {
  const [checked, setChecked] = useState<boolean[]>(Array(5).fill(false));
  const [isComplete, setIsComplete] = useState(false);

  const toggleCheck = (index: number) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);
  };

  const handleComplete = () => {
    setIsComplete(true);
    incrementUsage('tech2');
  };

  const progress = (checked.filter(Boolean).length / 5) * 100;
  const allChecked = progress === 100;

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

  return (
    <div className="flex flex-col min-h-[100dvh] animate-float-in max-w-2xl mx-auto w-full p-6">
      <header className="flex justify-between items-center w-full mb-8">
        <button onClick={onBack} className="flex items-center text-sm font-medium hover:text-primary transition-colors text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад
        </button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>

      <main className="flex-1 flex flex-col">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Заземление 5-4-3-2-1</h2>
        
        <div className="w-full bg-secondary h-2 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-4 mb-12">
          {STEPS.map((step, idx) => (
            <div 
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all select-none ${
                checked[idx] ? 'bg-primary/5 border-primary/20' : 'bg-card border-card-border hover:border-primary/30'
              }`}
            >
              <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                checked[idx] ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 text-transparent'
              }`}>
                <Check className="w-4 h-4" />
              </div>
              <span className={`text-lg transition-colors ${checked[idx] ? 'text-foreground/50 line-through' : 'text-card-foreground'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        <button 
          onClick={handleComplete} 
          className={`w-full py-4 rounded-xl font-medium text-white transition-colors mt-auto cursor-pointer
            ${allChecked ? 'bg-primary hover:bg-primary/90' : 'bg-[#64748b] hover:bg-[#475569]'}
          `}
        >
          Завершить
        </button>
      </main>
    </div>
  );
}
