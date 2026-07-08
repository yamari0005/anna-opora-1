import { useState, useEffect } from 'react';
import { MainScreen } from './components/MainScreen';
import { SelectionScreen } from './components/SelectionScreen';
import { BilateralScreen } from './components/BilateralScreen';
import { GroundingScreen } from './components/GroundingScreen';
import { BreathingScreen } from './components/BreathingScreen';
import { MuscleRelaxationScreen } from './components/MuscleRelaxationScreen';
import { getStore, saveStore, AppScreen } from './lib/store';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function AppContent() {
  const [screen, setScreen] = useState<AppScreen>('main');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const store = getStore();
    setTheme(store.theme);
    if (store.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    const store = getStore();
    store.theme = newTheme;
    saveStore(store);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const goHome = () => setScreen('main');
  const goSelection = () => setScreen('selection');

  return (
    <div className="w-full min-h-[100dvh] bg-background text-foreground transition-colors duration-300">
      {screen === 'main' && (
        <MainScreen onNext={goSelection} toggleTheme={toggleTheme} theme={theme} />
      )}
      {screen === 'selection' && (
        <SelectionScreen onBack={goHome} onSelect={setScreen} toggleTheme={toggleTheme} theme={theme} />
      )}
      {screen === 'tech1' && (
        <BilateralScreen onBack={goSelection} onHome={goHome} theme={theme} toggleTheme={toggleTheme} />
      )}
      {screen === 'tech2' && (
        <GroundingScreen onBack={goSelection} onHome={goHome} theme={theme} toggleTheme={toggleTheme} />
      )}
      {screen === 'tech3' && (
        <BreathingScreen onBack={goSelection} onHome={goHome} theme={theme} toggleTheme={toggleTheme} />
      )}
      {screen === 'tech4' && (
        <MuscleRelaxationScreen onBack={goSelection} onHome={goHome} theme={theme} toggleTheme={toggleTheme} />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
