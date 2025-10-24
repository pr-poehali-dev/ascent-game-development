import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { formatMoney, GameState, REAL_ESTATE_ASSETS } from '@/lib/gameConstants';

interface AssetsTabProps {
  gameState: GameState;
  purchaseItem: (type: string, itemId: string, cost: number) => void;
}

export default function AssetsTab({ gameState, purchaseItem }: AssetsTabProps) {
  return (
    <div className="space-y-4">
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
    </div>
  );
}
