import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  formatMoney,
  GameState,
  JOB_TIERS,
  EDUCATION_TIERS,
  REAL_ESTATE_ASSETS,
} from '@/lib/gameConstants';

interface StatsTabProps {
  gameState: GameState;
  passiveIncome: number;
}

export default function StatsTab({ gameState, passiveIncome }: StatsTabProps) {
  const getCurrentJob = () => JOB_TIERS.find((job) => job.id === gameState.jobId) || JOB_TIERS[0];
  const getCurrentEducation = () =>
    EDUCATION_TIERS.find((edu) => edu.id === gameState.educationLevel) || EDUCATION_TIERS[0];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-3 flex items-center">
        <Icon name="BarChart3" size={24} className="mr-2 text-[#FFD23F]" />
        Статистика игрока
      </h3>
      <Card className="p-4 bg-card/80 backdrop-blur space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Текущая должность:</span>
          <span className="font-semibold">
            {getCurrentJob().icon} {getCurrentJob().name}
          </span>
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
          <span className="font-semibold">{gameState.assets.reduce((sum, a) => sum + a.count, 0)}</span>
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
            <span className="text-primary">{formatMoney(passiveIncome)}/сек</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
