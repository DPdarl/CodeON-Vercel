// app/lib/store-logic.ts
import { supabase } from "./supabase";
import { UserData } from "~/contexts/AuthContext";
import { Heart, Snowflake, Lightbulb } from "lucide-react";

// --- ITEM DEFINITIONS ---
export const POWER_UPS = [
  {
    id: "heart-refill",
    name: "Heart Refill",
    description: "Refill your hearts to max (5).",
    icon: Heart,
    image: "/assets/icons/heart.png",
    cost: 250,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    allowQuantity: false, // One-time use
  },
  {
    id: "streak-freeze",
    name: "Streak Freeze",
    description: "Protect your streak for one missed day.",
    icon: Snowflake,
    image: "/assets/icons/snowflake.png",
    cost: 500,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    allowQuantity: true, // Can buy multiple
  },
  {
    id: "hint-power",
    name: "Hint",
    description: "Get a hint on a tough challenge.",
    icon: Lightbulb,
    image: "/assets/icons/bulb.png",
    cost: 100,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    allowQuantity: true, // Can buy multiple
  },
];

export type ShopItem = (typeof POWER_UPS)[0];

/**
 * Handles the purchase transaction with Quantity support.
 */
export async function processPurchase(
  userId: string,
  item: ShopItem,
  currentUserData: UserData,
  quantity: number = 1
) {
  const { coins, hearts, streakFreezes, hints } = currentUserData;
  const totalCost = item.cost * quantity;

  // 1. Validation
  if ((coins || 0) < totalCost) {
    return {
      success: false,
      message: `Not enough coins! You need ${totalCost}.`,
    };
  }

  const updates: any = {
    coins: (coins || 0) - totalCost,
  };

  // 2. Item Specific Logic
  switch (item.id) {
    case "heart-refill":
      if ((hearts || 0) >= 5) {
        return { success: false, message: "Hearts are already full!" };
      }
      updates.hearts = 5;
      break;

    case "streak-freeze":
      updates.streak_freezes = (streakFreezes || 0) + quantity;
      break;

    case "hint-power":
      updates.hints = (hints || 0) + quantity;
      break;

    default:
      return { success: false, message: "Unknown item type." };
  }

  // 3. Execute Database Update
  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("Purchase Transaction Failed:", error);
    return { success: false, message: "Transaction failed. Please try again." };
  }

  return {
    success: true,
    message: `Successfully purchased ${quantity} ${item.name}${
      quantity > 1 ? "s" : ""
    }!`,
  };
}
