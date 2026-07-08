import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { incrementUsage, getStore, saveStore } from '../lib/store';
import { CompleteMessage } from './CompleteMessage';
import { ThemeToggle } from './ThemeToggle';

interface BreathingScreenProps {
  onBack: () => void;
  onHome: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';

export function BreathingScreen({ onBack, onHome, theme, toggleTheme }: BreathingScreenProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isComplete, setIsComplete] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeToneRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
  // Реф для чтения текущей фазы внутри эффектов без добавления в массив зависимостей
  const phaseRef = useRef<Phase>('inhale');

  useEffect(() => {
    const store = getStore();
    setSoundEnabled(store.soundEnabled !== false);
  }, []);

  // Останавливает текущий проигрываемый тон немедленно
  const stopActiveTone = () => {
    const active = activeToneRef.current;
    if (active) {
      try {
        active.gain.gain.cancelScheduledValues(active.osc.context.currentTime);
        active.gain.gain.setValueAtTime(0, active.osc.context.currentTime);
        active.osc.stop();
      } catch (e) {
        // осциллятор мог уже быть остановлен - это не ошибка
      }
      activeToneRef.current = null;
    }
  };

  const toggleSound = () => {
    const newSound = !soundEnabled;
    setSoundEnabled(newSound);
    if (!newSound) stopActiveTone();
    const store = getStore();
    store.soundEnabled = newSound;
    saveStore(store);
  };

  // Непрерывный успокаивающий тон на вдохе (нарастание) и выдохе (затухание).
  // На задержке дыхания - тишина.
  const playPhaseTone = (newPhase: Phase) => {
    stopActiveTone();
    if (!soundEnabled) return;
    if (newPhase === 'hold') return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine'; // синусоида - самый мягкий, без резких обертонов
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // нота До (C5) - мягкий тон

      const now = ctx.currentTime;
      if (newPhase === 'inhale') {
        // Плавное нарастание громкости на вдохе: 0 -> 0.2 за 4 секунды
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 4);
        osc.start(now);
        osc.stop(now + 4);
      } else {
        // Плавное затухание на выдохе: 0.2 -> 0 за 8 секунд
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 8);
        osc.start(now);
        osc.stop(now + 8);
      }

      activeToneRef.current = { osc, gain };
      osc.onended = () => {
        if (activeToneRef.current?.osc === osc) activeToneRef.current = null;
      };
    } catch (e) {
      console.warn('Не удалось воспроизвести звук', e);
    }
  };

  // Синхронизируем реф с состоянием фазы для доступа внутри эффектов
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Останавливаем звук и закрываем AudioContext при уходе с экрана
  useEffect(() => {
    return () => {
      stopActiveTone();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isComplete) return;

    // Запускаем тон для текущей фазы немедленно при старте (или при включении звука)
    playPhaseTone(phaseRef.current);

    // Цикл 19 секунд: вдох 4 сек, задержка 7 сек, выдох 8 сек
    const startTime = Date.now();
    let frameId: number;

    const tick = () => {
      const elapsed = (Date.now() - startTime) % 19000;
      let newPhase: Phase;

      if (elapsed < 4000) {
        newPhase = 'inhale';
      } else if (elapsed < 11000) {
        newPhase = 'hold';
      } else {
        newPhase = 'exhale';
      }

      setPhase(p => {
        if (p !== newPhase) {
          playPhaseTone(newPhase);
          return newPhase;
        }
        return p;
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isComplete, soundEnabled]); // пересоздаём при включении/выключении звука

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
    incrementUsage('tech3');
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
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

  // Animation values based on phase
  const circleScale = phase === 'inhale' ? 1.5 : (phase === 'hold' ? 1.5 : 1);
  const circleText = phase === 'inhale' ? 'Вдох' : (phase === 'hold' ? 'Задержка' : 'Выдох');
  const transitionDuration = phase === 'inhale' ? '4s' : (phase === 'hold' ? '0s' : '8s');

  return (
    <div className="flex flex-col min-h-[100dvh] animate-float-in max-w-2xl mx-auto w-full p-6">
      <header className="flex justify-between items-center w-full mb-8">
        <button onClick={onBack} className="flex items-center text-sm font-medium hover:text-primary transition-colors text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад
        </button>
        <div className="flex items-center gap-1">
          <button onClick={toggleSound} className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground" aria-label="Звук">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-50" />}
          </button>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative my-12">
        <div 
          className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center relative ease-linear"
          style={{ 
            transform: `scale(${circleScale})`,
            transitionProperty: 'transform',
            transitionDuration: transitionDuration
          }}
        >
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl mix-blend-multiply opacity-50" />
          <span 
            className="text-primary-foreground font-medium text-lg relative z-10"
            style={{ 
              transform: `scale(${1/circleScale})`, // Counter-scale text so it doesn't grow huge
              transitionProperty: 'transform',
              transitionDuration: transitionDuration
            }}
          >
            {circleText}
          </span>
        </div>
      </main>

      <footer className="text-center w-full mt-auto">
        <p className="mb-6 text-foreground/80 leading-relaxed text-lg">Дышите через нос. Вдох на 4 счёта, задержка на 7, выдох на 8.</p>
        <div className="text-3xl font-mono text-muted-foreground mb-8">{timeLeft} сек</div>
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
