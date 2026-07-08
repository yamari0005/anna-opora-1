import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { incrementUsage } from '../lib/store';
import { CompleteMessage } from './CompleteMessage';
import { ThemeToggle } from './ThemeToggle';

interface MuscleRelaxationScreenProps {
  onBack: () => void;
  onHome: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const STEPS = [
  { target: "кулаки", instructionLabel: "Сожмите кулаки" },
  { target: "предплечья", instructionLabel: "Напрягите предплечья" },
  { target: "плечи", instructionLabel: "Напрягите плечи" },
  { target: "лицо", instructionLabel: "Напрягите лицо" },
  { target: "всё тело", instructionLabel: "Напрягите всё тело" }
];

// Фаза шага хранится единым объектом, чтобы currentStep, isTension и timeLeft
// всегда обновлялись атомарно и текст никогда не расходился с цветом круга.
interface StepPhase {
  stepIndex: number;
  isTension: boolean;
  timeLeft: number;
}

export function MuscleRelaxationScreen({ onBack, onHome, theme, toggleTheme }: MuscleRelaxationScreenProps) {
  const [phase, setPhase] = useState<StepPhase>({ stepIndex: 0, isTension: true, timeLeft: 5 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    if (phase.timeLeft <= 0) {
      if (phase.isTension) {
        // Напряжение окончено -> переходим к расслаблению того же участка тела
        setPhase(p => ({ ...p, isTension: false, timeLeft: 10 }));
      } else if (phase.stepIndex < STEPS.length - 1) {
        // Расслабление окончено -> переходим к напряжению следующего участка тела
        setPhase(p => ({ stepIndex: p.stepIndex + 1, isTension: true, timeLeft: 5 }));
      } else {
        handleComplete();
      }
      return;
    }

    const timer = setInterval(() => {
      setPhase(p => ({ ...p, timeLeft: p.timeLeft - 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, isComplete]);

  const handleComplete = () => {
    setIsComplete(true);
    incrementUsage('tech4');
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

  const { stepIndex: currentStep, isTension, timeLeft } = phase;
  const step = STEPS[currentStep];
  const phaseLabel = isTension ? "Напряжение" : "Расслабление";
  const actionText = isTension ? `Напрягите ${step.target}` : `Расслабьте ${step.target}`;
  
  return (
    <div className="flex flex-col min-h-[100dvh] animate-float-in max-w-2xl mx-auto w-full p-6">
      <header className="flex justify-between items-center w-full mb-8">
        <button onClick={onBack} className="flex items-center text-sm font-medium hover:text-primary transition-colors text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад
        </button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative">
        <div className="mb-12 flex flex-col items-center">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-1000 ${
            isTension ? 'bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.5)] scale-105' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-100'
          }`}>
            <span className="text-white font-medium">{phaseLabel}</span>
          </div>
          <h2 className="text-2xl font-semibold text-foreground text-center mb-2">{actionText}</h2>
          <div className="text-4xl font-mono text-muted-foreground mt-4">{timeLeft} сек</div>
        </div>

        <div className="w-full max-w-sm">
          <div className="flex justify-between mb-2 text-sm text-muted-foreground">
            <span>Шаг {currentStep + 1} из {STEPS.length}</span>
            <span>{step.instructionLabel}</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${((currentStep) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </main>

      <footer className="text-center w-full mt-auto pt-8">
        <button 
          onClick={handleComplete} 
          className="w-full py-4 rounded-xl font-medium text-white transition-colors cursor-pointer bg-[#64748b] hover:bg-[#475569]"
        >
          Завершить
        </button>
      </footer>
    </div>
  );
}
