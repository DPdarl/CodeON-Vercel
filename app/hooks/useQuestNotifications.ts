import { useEffect, useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { supabase } from "~/lib/supabase";

export function useQuestNotifications() {
  const { user } = useAuth();
  const [hasUnclaimedQuests, setHasUnclaimedQuests] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkQuests = async () => {
      // 1. Fetch Quest Definitions (Lightweight)
      const { data: quests, error } = await supabase
        .from("quests")
        .select("id, metric_key, target_quantity, category");

      if (error || !quests) return;

      // 2. Check for at least ONE ready-to-claim quest
      const hasClaimable = quests.some((q) => {
        // If already claimed, skip
        if (user.claimedQuests?.includes(q.id)) return false;

        // Calculate progress
        let progress = 0;
        const stats = user.questStats || {};

        switch (q.metric_key) {
          case "streaks":
            progress = user.streaks || 0;
            break;
          case "completed_chapters_count":
            progress = user.completedChapters?.length || 0;
            break;
          case "total_coins_earned":
            progress = stats.total_coins_earned || 0;
            break;
          case "badges_earned_count":
            progress = user.badges?.length || 0;
            break;
          default:
            progress = stats[q.metric_key] || 0;
        }

        return progress >= q.target_quantity;
      });

      setHasUnclaimedQuests(hasClaimable);
    };

    checkQuests();

    // Optional: could add an interval here or listen to specific events
  }, [user]); // Re-run when user object changes (which happens on stats update)

  return { hasUnclaimedQuests };
}
