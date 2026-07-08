import { Eye, Compass, Wind, Activity, ArrowLeft } from 'lucide-react';
import { AppScreen } from '../lib/store';
import { ThemeToggle } from './ThemeToggle';

interface SelectionScreenProps {
  onBack: () => void;
  onSelect: (screen: AppScreen) => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

const TECHNIQUES = [
  { id: 'tech1', icon: Eye, title: 'Билатеральная стимуляция', desc: 'Следите глазами за точкой для стабилизации' },
  { id: 'tech2', icon: Compass, title: 'Заземление 5-4-3-2-1', desc: 'Переключите внимание на окружающий мир' },
  { id: 'tech3', icon: Wind, title: 'Дыхание 4-7-8', desc: 'Успокойте дыхание за 60 секунд' },
  { id: 'tech4', icon: Activity, title: 'Прогрессивная релаксация', desc: 'Снимите мышечное напряжение' },
] as const;

export function SelectionScreen({ onBack, onSelect, toggleTheme, theme }: SelectionScreenProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] p-6 animate-float-in max-w-2xl mx-auto w-full">
      <header className="flex justify-between items-center w-full mb-8">
        <button onClick={onBack} className="flex items-center text-sm font-medium hover:text-primary text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад
        </button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>

      <h1 className="text-2xl font-semibold mb-8 text-center text-foreground">Выберите технику</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {TECHNIQUES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id as AppScreen)}
            className="flex flex-col items-center text-center p-6 bg-card border border-card-border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <t.icon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-medium mb-2 text-card-foreground">{t.title}</h2>
            <p className="text-sm text-muted-foreground">{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
