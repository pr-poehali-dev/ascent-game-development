import { Card } from '@/components/ui/card';
import { formatMoney, GameState } from '@/lib/gameConstants';

interface GameStatsProps {
  gameState: GameState;
  passiveIncome: number;
}

export default function GameStats({ gameState, passiveIncome }: GameStatsProps) {
  return (
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
        <p className="text-lg font-semibold text-primary">{formatMoney(passiveIncome)}/сек</p>
      </Card>
      <Card className="p-4 bg-card/80 backdrop-blur border-secondary/20">
        <p className="text-xs text-muted-foreground mb-1">За клик</p>
        <p className="text-lg font-semibold text-secondary">{formatMoney(gameState.clickValue)}</p>
      </Card>
    </div>
  );
}
