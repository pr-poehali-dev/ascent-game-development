import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import GameStats from '@/components/GameStats';
import ClickButton from '@/components/ClickButton';
import CareerTab from '@/components/CareerTab';
import AssetsTab from '@/components/AssetsTab';
import StatsTab from '@/components/StatsTab';
import AchievementsTab from '@/components/AchievementsTab';
import {
  GameState,
  GAME_TICK_MS,
  EDUCATION_TIERS,
  JOB_TIERS,
  REAL_ESTATE_ASSETS,
  HUSTLE_UPGRADES,
  ACHIEVEMENTS,
  formatMoney,
} from '@/lib/gameConstants';

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

  const getCurrentJob = () => JOB_TIERS.find((job) => job.id === gameState.jobId) || JOB_TIERS[0];
  const getCurrentEducation = () =>
    EDUCATION_TIERS.find((edu) => edu.id === gameState.educationLevel) || EDUCATION_TIERS[0];

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

        <GameStats gameState={gameState} passiveIncome={getPassiveIncomePerSec()} />

        <ClickButton
          onClick={handleClick}
          isStudying={isStudying}
          remainingSec={remainingSec}
          clickValue={gameState.clickValue}
          clickAnimations={clickAnimations}
        />

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

          <TabsContent value="career">
            <CareerTab
              gameState={gameState}
              isStudying={isStudying}
              purchaseItem={purchaseItem}
              getNextEducationTier={getNextEducationTier}
            />
          </TabsContent>

          <TabsContent value="assets">
            <AssetsTab gameState={gameState} purchaseItem={purchaseItem} />
          </TabsContent>

          <TabsContent value="stats">
            <StatsTab gameState={gameState} passiveIncome={getPassiveIncomePerSec()} />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsTab gameState={gameState} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
