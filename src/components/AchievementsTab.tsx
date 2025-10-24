import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { formatMoney, GameState, ACHIEVEMENTS } from '@/lib/gameConstants';

interface AchievementsTabProps {
  gameState: GameState;
}

export default function AchievementsTab({ gameState }: AchievementsTabProps) {
  return (
    <div className="space-y-4">
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
    </div>
  );
}
