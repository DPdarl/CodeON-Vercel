import React from "react";
import { Heart, Clock, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MAX_HEARTS, HEART_COST } from "~/hooks/useHeartSystem";

interface HeartDropdownProps {
  hearts: number;
  timeRemaining: string;
  buyHearts: () => Promise<void>;
}

export const HeartDropdown: React.FC<HeartDropdownProps> = ({
  hearts,
  timeRemaining,
  buyHearts,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 p-0 rounded-full hover:bg-slate-100"
        >
          <Heart
            className={`w-6 h-6 transition-all ${
              hearts > 0 ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`}
          />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-background">
            {hearts}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 fill-red-500 text-red-500" />
              <span className="font-bold text-xl">{hearts}</span>
            </div>
            {hearts < MAX_HEARTS && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" />
                <span>{timeRemaining}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-foreground">Hearts</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You have {hearts} hearts. They automatically regenerate every 20
              minutes.
            </p>
          </div>

          {hearts < MAX_HEARTS ? (
            <Button
              onClick={buyHearts}
              className="w-full gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-sm"
            >
              <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              <span className="font-bold">Refill for {HEART_COST}</span>
            </Button>
          ) : (
            <div className="text-center text-xs font-medium text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              Hearts are full!
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
