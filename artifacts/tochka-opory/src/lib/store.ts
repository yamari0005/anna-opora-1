// Ключи техник, используемые как поля верхнего уровня в хранилище
export const TECHNIQUE_KEYS = ['tech1', 'tech2', 'tech3', 'tech4'] as const;
export type TechniqueKey = (typeof TECHNIQUE_KEYS)[number];

export type AppScreen = 'main' | 'selection' | TechniqueKey;

export interface UsageRecord {
  date: string; // Формат YYYY-MM-DD
  count: number;
}

// Плоская структура данных: ключи техник лежат на верхнем уровне,
// рядом с theme и soundEnabled, как того требует техническое задание.
export type StoreData = {
  [K in TechniqueKey]?: UsageRecord[];
} & {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
};

const STORE_KEY = 'tochka-opory-store';

const DEFAULT_STORE: StoreData = {
  theme: 'dark',
  soundEnabled: true,
};

export const getStore = (): StoreData => {
  try {
    const data = localStorage.getItem(STORE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...DEFAULT_STORE, ...parsed };
    }
  } catch (e) {
    console.error('Не удалось прочитать данные из localStorage', e);
  }
  return { ...DEFAULT_STORE };
};

export const saveStore = (data: StoreData) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
};

// Увеличивает счётчик использования техники за сегодняшний день
export const incrementUsage = (technique: TechniqueKey) => {
  const store = getStore();
  const today = new Date().toISOString().split('T')[0];

  const records = store[technique] ?? [];
  const todayRecord = records.find((r) => r.date === today);

  if (todayRecord) {
    todayRecord.count += 1;
  } else {
    records.push({ date: today, count: 1 });
  }

  store[technique] = records;
  saveStore(store);
};

// Считает суммарное количество обращений за последние 7 дней
// (включая сегодняшний день, т.е. окно [сегодня - 6 дней; сегодня]).
export const getRecentUsageCount = (): number => {
  const store = getStore();
  let total = 0;

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffDate = cutoff.toISOString().split('T')[0];

  TECHNIQUE_KEYS.forEach((key) => {
    const records = store[key] ?? [];
    records.forEach((r) => {
      if (r.date >= cutoffDate) {
        total += r.count;
      }
    });
  });

  return total;
};
