import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { formatMoney } from '@/lib/gameConstants';

interface ClickButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isStudying: boolean;
  remainingSec: number;
  clickValue: number;
  clickAnimations: { id: number; x: number; y: number }[];
}

export default function ClickButton({
  onClick,
  isStudying,
  remainingSec,
  clickValue,
  clickAnimations,
}: ClickButtonProps) {
  return (
    <div className="mb-6 relative">
      <Button
        onClick={onClick}
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
          +{formatMoney(clickValue)}
        </div>
      ))}
    </div>
  );
}
