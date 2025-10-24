import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  formatMoney,
  GameState,
  EDUCATION_TIERS,
  JOB_TIERS,
  HUSTLE_UPGRADES,
} from '@/lib/gameConstants';

interface CareerTabProps {
  gameState: GameState;
  isStudying: boolean;
  purchaseItem: (type: string, itemId: string, cost: number) => void;
  getNextEducationTier: () => typeof EDUCATION_TIERS[0] | null;
}

export default function CareerTab({
  gameState,
  isStudying,
  purchaseItem,
  getNextEducationTier,
}: CareerTabProps) {
  const nextEdu = getNextEducationTier();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold mb-3 flex items-center">
          <Icon name="GraduationCap" size={24} className="mr-2 text-[#4ECDC4]" />
          Образование
        </h3>
        {nextEdu ? (
          <Card className="p-4 bg-card/80 backdrop-blur border-[#4ECDC4]/20">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-lg">{nextEdu.name}</p>
                <p className="text-sm text-muted-foreground">Стоимость: {formatMoney(nextEdu.cost)}</p>
                <p className="text-xs text-muted-foreground">Время: {nextEdu.studyTimeSec}с</p>
              </div>
              <Button
                onClick={() => purchaseItem('education', nextEdu.id, nextEdu.cost)}
                disabled={gameState.cash < nextEdu.cost || isStudying}
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
                    {!canApply && <p className="text-xs text-destructive">Требуется: {requiredEdu?.name}</p>}
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
    </div>
  );
}
