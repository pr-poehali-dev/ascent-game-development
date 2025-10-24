import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface GameState {
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

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (state: GameState) => boolean;
  reward: number;
}

const EDUCATION_TIERS = [
  { id: 'None', name: 'Без образования', cost: 0, bonus: 0 },
  { id: 'Diploma', name: 'Школьный аттестат', cost: 100, studyTimeSec: 10 },
  { id: 'Associate', name: 'Колледж', cost: 5000, studyTimeSec: 30 },
  { id: 'Bachelor', name: 'Бакалавр', cost: 50000, studyTimeSec: 60 },
  { id: 'Master', name: 'Магистр (MBA)', cost: 250000, studyTimeSec: 90 },
];

const JOB_TIERS = [
  { id: 'Unemployed', name: 'Безработный', requiredEducation: 'None', salary: 0, icon: '🛑' },
  { id: 'Janitor', name: 'Уборщик', requiredEducation: 'None', salary: 1, icon: '🧹' },
  { id: 'OfficeAssistant', name: 'Офис-ассистент', requiredEducation: 'Diploma', salary: 5, icon: '🗂️' },
  { id: 'TeamLead', name: 'Тимлид', requiredEducation: 'Associate', salary: 20, icon: '👨‍💼' },
  { id: 'CFO', name: 'Финдиректор (CFO)', requiredEducation: 'Bachelor', salary: 100, icon: '📈' },
  { id: 'Director', name: 'Гендиректор', requiredEducation: 'Master', salary: 500, icon: '👑' },
];

const HUSTLE_UPGRADES = [
  { id: 'mouse', name: 'Эргономичная мышь', cost: 50, clickBoost: 2, autoBoost: 0, icon: '🖱️' },
  { id: 'chair', name: 'Офисное кресло', cost: 250, clickBoost: 5, autoBoost: 0, icon: '💺' },
  { id: 'autov1', name: 'Авто-кликер V1', cost: 1000, clickBoost: 0, autoBoost: 1, icon: '🤖' },
  { id: 'pc', name: 'Игровой ПК', cost: 5000, clickBoost: 15, autoBoost: 0, icon: '🖥️' },
  { id: 'autov2', name: 'Авто-кликер V2', cost: 50000, clickBoost: 0, autoBoost: 5, icon: '⚡' },
];

const REAL_ESTATE_ASSETS = [
  { id: 'box', name: 'Картонная коробка', cost: 10, income: 0, icon: '📦' },
  { id: 'studio', name: 'Студия', cost: 2000, income: 5, icon: '🏠' },
  { id: 'house', name: 'Загородный дом', cost: 50000, income: 50, icon: '🏡' },
  { id: 'penthouse', name: 'Пентхаус', cost: 500000, income: 300, icon: '🏙️' },
  { id: 'island', name: 'Частный остров', cost: 10000000, income: 5000, icon: '🏝️' },
];

const ACHIEVEMENTS: Achievement[] = [
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

const GAME_TICK_MS = 1000;

export default function Index() {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    cash: 10,
    netWorth: 10,
    clickValue: 1,
    autoClickRate: 0,
    educationLevel: 'None',
    jobId: 'Unemployed',
    assets: [],
    upgrades: [],
    achievements: [],
    totalClicks: 0,
    totalEarned: 0,
    studyEndTime: 0,
  });

  const [clickAnimations, setClickAnimations] = useState<{ id: number; x: number; y: number }[]>([]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace('₽', '$').format(amount);
  };

  const getCurrentJob = () => JOB_TIERS.find((job) => job.id === gameState.jobId) || JOB_TIERS[0];
  const getCurrentEducation = () => EDUCATION_TIERS.find((edu) => edu.id === gameState.educationLevel) || EDUCATION_TIERS[0];

  const getPassiveIncomePerSec = () => {
    const currentJob = getCurrentJob();
    let totalIncome = currentJob.salary;

    totalIncome += gameState.assets.reduce((sum, asset) => {
      const item = REAL_ESTATE_ASSETS.find((a) => a.id === asset.id);
      return sum + (item ? item.income * asset.count : 0);
    }, 0);

    totalIncome += gameState.autoClickRate;

    return totalIncome;
  };

  const calculateNetWorth = () => {
    const assetValue = gameState.assets.reduce((sum, asset) => {
      const item = REAL_ESTATE_ASSETS.find((a) => a.id === asset.id);
      return sum + (item ? item.cost * asset.count : 0);
    }, 0);
    return gameState.cash + assetValue;
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (gameState.studyEndTime > 0) {
      toast({
        title: '📚 Ты учишься!',
        description: 'Закончи обучение, чтобы продолжить зарабатывать',
      });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setClickAnimations((prev) => [...prev, { id: Date.now(), x, y }]);
    setTimeout(() => {
      setClickAnimations((prev) => prev.slice(1));
    }, 500);

    setGameState((prev) => ({
      ...prev,
      cash: prev.cash + prev.clickValue,
      totalClicks: prev.totalClicks + 1,
      totalEarned: prev.totalEarned + prev.clickValue,
    }));
  };

  const purchaseItem = (type: string, itemId: string, cost: number) => {
    if (gameState.cash < cost) {
      toast({
        title: '💸 Недостаточно средств',
        description: `Нужно ${formatMoney(cost)}`,
        variant: 'destructive',
      });
      return;
    }

    setGameState((prev) => {
      const newState = { ...prev, cash: prev.cash - cost };

      switch (type) {
        case 'upgrade':
          newState.upgrades = [...prev.upgrades, itemId];
          const upgrade = HUSTLE_UPGRADES.find((u) => u.id === itemId);
          if (upgrade) {
            newState.clickValue = prev.clickValue + upgrade.clickBoost;
            newState.autoClickRate = prev.autoClickRate + upgrade.autoBoost;
          }
          toast({ title: '🛒 Куплено!', description: upgrade?.name });
          break;

        case 'education':
          const edu = EDUCATION_TIERS.find((e) => e.id === itemId);
          if (edu) {
            newState.studyEndTime = Date.now() + edu.studyTimeSec * 1000;
            newState.jobId = 'Unemployed';
            toast({ title: '📚 Начал учиться!', description: `${edu.name} (${edu.studyTimeSec}с)` });
          }
          break;

        case 'job':
          newState.jobId = itemId;
          const job = JOB_TIERS.find((j) => j.id === itemId);
          toast({ title: '👔 Новая работа!', description: job?.name });
          break;

        case 'asset':
          const assetItem = REAL_ESTATE_ASSETS.find((a) => a.id === itemId);
          const existingAsset = newState.assets.find((a) => a.id === itemId);
          if (existingAsset) {
            existingAsset.count += 1;
          } else {
            newState.assets = [...prev.assets, { id: itemId, count: 1 }];
          }
          toast({ title: '🏡 Куплено!', description: assetItem?.name });
          break;
      }

      return newState;
    });
  };

  const checkAchievements = () => {
    ACHIEVEMENTS.forEach((achievement) => {
      if (!gameState.achievements.includes(achievement.id) && achievement.requirement(gameState)) {
        setGameState((prev) => ({
          ...prev,
          achievements: [...prev.achievements, achievement.id],
          cash: prev.cash + achievement.reward,
        }));
        toast({
          title: `🏆 Достижение разблокировано!`,
          description: `${achievement.icon} ${achievement.name} (+${formatMoney(achievement.reward)})`,
        });
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((prev) => {
        const newState = { ...prev };

        if (prev.studyEndTime > 0 && Date.now() >= prev.studyEndTime) {
          const currentIdx = EDUCATION_TIERS.findIndex((e) => e.id === prev.educationLevel);
          const nextEdu = EDUCATION_TIERS[currentIdx + 1];
          if (nextEdu) {
            newState.educationLevel = nextEdu.id;
            newState.studyEndTime = 0;
            toast({ title: '🎓 Обучение завершено!', description: nextEdu.name });
          }
        }

        const passiveIncome = getPassiveIncomePerSec();
        newState.cash = prev.cash + passiveIncome;
        newState.totalEarned = prev.totalEarned + passiveIncome;
        newState.netWorth = calculateNetWorth();

        return newState;
      });
    }, GAME_TICK_MS);

    return () => clearInterval(interval);
  }, [gameState.studyEndTime]);

  useEffect(() => {
    checkAchievements();
  }, [gameState.totalClicks, gameState.totalEarned, gameState.jobId, gameState.assets]);

  const getNextEducationTier = () => {
    const currentIdx = EDUCATION_TIERS.findIndex((e) => e.id === gameState.educationLevel);
    return EDUCATION_TIERS[currentIdx + 1] || null;
  };

  const isStudying = gameState.studyEndTime > 0;
  const remainingSec = isStudying ? Math.max(0, Math.floor((gameState.studyEndTime - Date.now()) / 1000)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] pb-20">
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD23F] to-[#4ECDC4] mb-2">
            The Ascent
          </h1>
          <p className="text-sm text-muted-foreground">От нуля до магната</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 bg-card/80 backdrop-blur border-[#FFD23F]/20">
            <p className="text-xs text-muted-foreground mb-1">Наличные</p>
            <p className="text-2xl font-bold text-[#FFD23F]">{formatMoney(gameState.cash)}</p>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur border-[#4ECDC4]/20">
            <p className="text-xs text-muted-foreground mb-1">Капитал</p>
            <p className="text-2xl font-bold text-[#4ECDC4]">{formatMoney(gameState.netWorth)}</p>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Пассивный доход</p>
            <p className="text-lg font-semibold text-primary">{formatMoney(getPassiveIncomePerSec())}/сек</p>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur border-secondary/20">
            <p className="text-xs text-muted-foreground mb-1">За клик</p>
            <p className="text-lg font-semibold text-secondary">{formatMoney(gameState.clickValue)}</p>
          </Card>
        </div>

        <div className="mb-6 relative">
          <Button
            onClick={handleClick}
            disabled={isStudying}
            className="w-full h-32 text-2xl font-bold bg-gradient-to-br from-[#FFD23F] to-[#FFA500] hover:from-[#FFC300] hover:to-[#FF8C00] text-[#1A1A2E] shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isStudying ? (
              <div className="flex flex-col items-center">
                <Icon name="BookOpen" size={40} className="mb-2 animate-pulse" />
                <span className="text-lg">Учусь... {remainingSec}с</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Icon name="MousePointerClick" size={40} className="mb-2" />
                <span>Клик!</span>
              </div>
            )}
          </Button>
          {clickAnimations.map((anim) => (
            <div
              key={anim.id}
              className="absolute pointer-events-none text-2xl font-bold text-[#FFD23F] animate-coin"
              style={{ left: anim.x, top: anim.y }}
            >
              +{formatMoney(gameState.clickValue)}
            </div>
          ))}
        </div>

        <Tabs defaultValue="career" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/50">
            <TabsTrigger value="career" className="text-xs">
              <Icon name="Briefcase" size={16} className="mr-1" />
              Карьера
            </TabsTrigger>
            <TabsTrigger value="assets" className="text-xs">
              <Icon name="Home" size={16} className="mr-1" />
              Активы
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs">
              <Icon name="BarChart3" size={16} className="mr-1" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs">
              <Icon name="Trophy" size={16} className="mr-1" />
              Награды
            </TabsTrigger>
          </TabsList>

          <TabsContent value="career" className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <Icon name="GraduationCap" size={24} className="mr-2 text-[#4ECDC4]" />
                Образование
              </h3>
              {getNextEducationTier() ? (
                <Card className="p-4 bg-card/80 backdrop-blur border-[#4ECDC4]/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg">{getNextEducationTier()?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Стоимость: {formatMoney(getNextEducationTier()!.cost)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Время: {getNextEducationTier()!.studyTimeSec}с
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        purchaseItem('education', getNextEducationTier()!.id, getNextEducationTier()!.cost)
                      }
                      disabled={gameState.cash < getNextEducationTier()!.cost || isStudying}
                      className="bg-[#4ECDC4] hover:bg-[#3DBCB3] text-[#1A1A2E]"
                    >
                      Учиться
                    </Button>
                  </div>
                  <Progress value={0} className="h-2" />
                </Card>
              ) : (
                <Card className="p-4 bg-card/80">
                  <p className="text-center text-green-400">🎓 Максимальное образование!</p>
                </Card>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <Icon name="Briefcase" size={24} className="mr-2 text-[#FFD23F]" />
                Карьерная лестница
              </h3>
              <div className="space-y-2">
                {JOB_TIERS.filter((job) => job.id !== gameState.jobId).map((job) => {
                  const requiredEdu = EDUCATION_TIERS.find((e) => e.id === job.requiredEducation);
                  const currentEduIdx = EDUCATION_TIERS.findIndex((e) => e.id === gameState.educationLevel);
                  const requiredEduIdx = EDUCATION_TIERS.findIndex((e) => e.id === job.requiredEducation);
                  const canApply = currentEduIdx >= requiredEduIdx;

                  return (
                    <Card key={job.id} className="p-3 bg-card/80 backdrop-blur">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold flex items-center">
                            <span className="mr-2 text-xl">{job.icon}</span>
                            {job.name}
                          </p>
                          <p className="text-sm text-[#FFD23F]">+{formatMoney(job.salary)}/сек</p>
                          {!canApply && (
                            <p className="text-xs text-destructive">Требуется: {requiredEdu?.name}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => purchaseItem('job', job.id, 0)}
                          disabled={!canApply}
                          size="sm"
                          className="bg-[#FFD23F] hover:bg-[#FFC300] text-[#1A1A2E]"
                        >
                          Устроиться
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <Icon name="Zap" size={24} className="mr-2 text-[#FF6B6B]" />
                Улучшения
              </h3>
              <div className="space-y-2">
                {HUSTLE_UPGRADES.map((upgrade) => {
                  const isPurchased = gameState.upgrades.includes(upgrade.id);
                  return (
                    <Card key={upgrade.id} className="p-3 bg-card/80 backdrop-blur">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold flex items-center">
                            <span className="mr-2 text-xl">{upgrade.icon}</span>
                            {upgrade.name}
                          </p>
                          <div className="flex gap-2 text-xs">
                            {upgrade.clickBoost > 0 && (
                              <Badge variant="outline" className="border-[#FFD23F] text-[#FFD23F]">
                                +{formatMoney(upgrade.clickBoost)} клик
                              </Badge>
                            )}
                            {upgrade.autoBoost > 0 && (
                              <Badge variant="outline" className="border-[#4ECDC4] text-[#4ECDC4]">
                                +{formatMoney(upgrade.autoBoost)}/сек
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => purchaseItem('upgrade', upgrade.id, upgrade.cost)}
                          disabled={isPurchased || gameState.cash < upgrade.cost}
                          size="sm"
                          className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
                        >
                          {isPurchased ? 'Куплено' : formatMoney(upgrade.cost)}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <Icon name="Home" size={24} className="mr-2 text-[#4ECDC4]" />
              Недвижимость
            </h3>
            <div className="space-y-2">
              {REAL_ESTATE_ASSETS.map((asset) => {
                const owned = gameState.assets.find((a) => a.id === asset.id);
                return (
                  <Card key={asset.id} className="p-3 bg-card/80 backdrop-blur">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold flex items-center">
                          <span className="mr-2 text-xl">{asset.icon}</span>
                          {asset.name}
                        </p>
                        <p className="text-sm text-[#4ECDC4]">+{formatMoney(asset.income)}/сек</p>
                        {owned && <p className="text-xs text-muted-foreground">В собственности: {owned.count}</p>}
                      </div>
                      <Button
                        onClick={() => purchaseItem('asset', asset.id, asset.cost)}
                        disabled={gameState.cash < asset.cost}
                        size="sm"
                        className="bg-[#4ECDC4] hover:bg-[#3DBCB3] text-[#1A1A2E]"
                      >
                        {formatMoney(asset.cost)}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <Icon name="BarChart3" size={24} className="mr-2 text-[#FFD23F]" />
              Статистика игрока
            </h3>
            <Card className="p-4 bg-card/80 backdrop-blur space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Текущая должность:</span>
                <span className="font-semibold">{getCurrentJob().icon} {getCurrentJob().name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Образование:</span>
                <span className="font-semibold">🎓 {getCurrentEducation().name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Всего кликов:</span>
                <span className="font-semibold text-[#FFD23F]">{gameState.totalClicks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Всего заработано:</span>
                <span className="font-semibold text-[#4ECDC4]">{formatMoney(gameState.totalEarned)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Объектов недвижимости:</span>
                <span className="font-semibold">
                  {gameState.assets.reduce((sum, a) => sum + a.count, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Улучшений куплено:</span>
                <span className="font-semibold">{gameState.upgrades.length}</span>
              </div>
            </Card>

            <Card className="p-4 bg-card/80 backdrop-blur">
              <h4 className="font-bold mb-3">Разбивка пассивного дохода</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Зарплата:</span>
                  <span className="text-[#FFD23F]">{formatMoney(getCurrentJob().salary)}/сек</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Недвижимость:</span>
                  <span className="text-[#4ECDC4]">
                    {formatMoney(
                      gameState.assets.reduce((sum, asset) => {
                        const item = REAL_ESTATE_ASSETS.find((a) => a.id === asset.id);
                        return sum + (item ? item.income * asset.count : 0);
                      }, 0)
                    )}
                    /сек
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Авто-кликер:</span>
                  <span className="text-secondary">{formatMoney(gameState.autoClickRate)}/сек</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Итого:</span>
                  <span className="text-primary">{formatMoney(getPassiveIncomePerSec())}/сек</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <Icon name="Trophy" size={24} className="mr-2 text-[#FFD23F]" />
              Достижения ({gameState.achievements.length}/{ACHIEVEMENTS.length})
            </h3>
            <div className="space-y-2">
              {ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = gameState.achievements.includes(achievement.id);
                return (
                  <Card
                    key={achievement.id}
                    className={`p-4 ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-[#FFD23F]/20 to-[#4ECDC4]/20 border-[#FFD23F]'
                        : 'bg-card/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold">{achievement.name}</p>
                          {isUnlocked && (
                            <Badge className="bg-[#FFD23F] text-[#1A1A2E]">
                              <Icon name="Check" size={12} className="mr-1" />
                              Получено
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        <p className="text-xs font-semibold text-[#4ECDC4]">
                          Награда: {formatMoney(achievement.reward)}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
