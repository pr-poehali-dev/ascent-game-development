export interface GameState {
  cash: number;
  netWorth: number;
  clickValue: number;
  autoClickRate: number;
  educationLevel: string;
  jobId: string;
  assets: { id: string; count: number }[];
  upgrades: string[];
  achievements: string[];
  totalClicks: number;
  totalEarned: number;
  studyEndTime: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (state: GameState) => boolean;
  reward: number;
}

export const EDUCATION_TIERS = [
  { id: 'None', name: 'Без образования', cost: 0, bonus: 0 },
  { id: 'Diploma', name: 'Школьный аттестат', cost: 100, studyTimeSec: 10 },
  { id: 'Associate', name: 'Колледж', cost: 5000, studyTimeSec: 30 },
  { id: 'Bachelor', name: 'Бакалавр', cost: 50000, studyTimeSec: 60 },
  { id: 'Master', name: 'Магистр (MBA)', cost: 250000, studyTimeSec: 90 },
];

export const JOB_TIERS = [
  { id: 'Unemployed', name: 'Безработный', requiredEducation: 'None', salary: 0, icon: '🛑' },
  { id: 'Janitor', name: 'Уборщик', requiredEducation: 'None', salary: 1, icon: '🧹' },
  { id: 'OfficeAssistant', name: 'Офис-ассистент', requiredEducation: 'Diploma', salary: 5, icon: '🗂️' },
  { id: 'TeamLead', name: 'Тимлид', requiredEducation: 'Associate', salary: 20, icon: '👨‍💼' },
  { id: 'CFO', name: 'Финдиректор (CFO)', requiredEducation: 'Bachelor', salary: 100, icon: '📈' },
  { id: 'Director', name: 'Гендиректор', requiredEducation: 'Master', salary: 500, icon: '👑' },
];

export const HUSTLE_UPGRADES = [
  { id: 'mouse', name: 'Эргономичная мышь', cost: 50, clickBoost: 2, autoBoost: 0, icon: '🖱️' },
  { id: 'chair', name: 'Офисное кресло', cost: 250, clickBoost: 5, autoBoost: 0, icon: '💺' },
  { id: 'autov1', name: 'Авто-кликер V1', cost: 1000, clickBoost: 0, autoBoost: 1, icon: '🤖' },
  { id: 'pc', name: 'Игровой ПК', cost: 5000, clickBoost: 15, autoBoost: 0, icon: '🖥️' },
  { id: 'autov2', name: 'Авто-кликер V2', cost: 50000, clickBoost: 0, autoBoost: 5, icon: '⚡' },
];

export const REAL_ESTATE_ASSETS = [
  { id: 'box', name: 'Картонная коробка', cost: 10, income: 0, icon: '📦' },
  { id: 'studio', name: 'Студия', cost: 2000, income: 5, icon: '🏠' },
  { id: 'house', name: 'Загородный дом', cost: 50000, income: 50, icon: '🏡' },
  { id: 'penthouse', name: 'Пентхаус', cost: 500000, income: 300, icon: '🏙️' },
  { id: 'island', name: 'Частный остров', cost: 10000000, income: 5000, icon: '🏝️' },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_click',
    name: 'Первый шаг',
    description: 'Сделай первый клик',
    icon: '👆',
    requirement: (state) => state.totalClicks >= 1,
    reward: 50,
  },
  {
    id: 'click_master',
    name: 'Мастер клика',
    description: 'Сделай 100 кликов',
    icon: '💪',
    requirement: (state) => state.totalClicks >= 100,
    reward: 500,
  },
  {
    id: 'first_job',
    name: 'Первая работа',
    description: 'Получи первую работу',
    icon: '👔',
    requirement: (state) => state.jobId !== 'Unemployed',
    reward: 100,
  },
  {
    id: 'millionaire',
    name: 'Миллионер',
    description: 'Заработай 1,000,000$',
    icon: '💰',
    requirement: (state) => state.totalEarned >= 1000000,
    reward: 10000,
  },
  {
    id: 'real_estate',
    name: 'Риелтор',
    description: 'Купи первую недвижимость',
    icon: '🏠',
    requirement: (state) => state.assets.length > 0,
    reward: 1000,
  },
  {
    id: 'ceo',
    name: 'Генеральный директор',
    description: 'Стань гендиректором',
    icon: '👑',
    requirement: (state) => state.jobId === 'Director',
    reward: 50000,
  },
];

export const GAME_TICK_MS = 1000;

export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).replace('₽', '$').format(amount);
};
