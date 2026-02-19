// app/components/dashboardmodule/StoreTab.tsx
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Loader2,
  Backpack,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "~/contexts/AuthContext";
import { toast } from "sonner";
import { POWER_UPS, processPurchase, type ShopItem } from "~/lib/store-logic";
import { SnowflakeIcon, BulbIcon, HeartIcon, IconStore } from "../ui/Icons";

export function StoreTab() {
  const { user, updateProfile } = useAuth();

  // Modal State
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const userCoins = user?.coins || 0;

  // Open Modal
  const openPurchaseModal = (item: ShopItem) => {
    setSelectedItem(item);
    setQuantity(1);
  };

  // Handle Quantity Change
  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta))); // Cap at 10
  };

  // Execute Purchase
  const handleConfirmPurchase = async () => {
    if (!user || !selectedItem) return;

    setIsProcessing(true);

    // 1. Call Logic
    const result = await processPurchase(
      user.uid,
      selectedItem,
      user,
      quantity,
    );

    if (result.success) {
      // 2. Optimistic Update (Update UI immediately while DB syncs)
      const totalCost = selectedItem.cost * quantity;
      const updates: any = { coins: userCoins - totalCost };

      if (selectedItem.id === "heart-refill") updates.hearts = 5;
      if (selectedItem.id === "streak-freeze")
        updates.streakFreezes = (user.streakFreezes || 0) + quantity;
      if (selectedItem.id === "hint-power")
        updates.hints = (user.hints || 0) + quantity;

      await updateProfile(updates);

      toast.success(result.message); // Show Success Toast
      setSelectedItem(null); // Close modal
    } else {
      toast.error(result.message); // Show Error Toast
    }

    setIsProcessing(false);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 font-sans">
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 dark:from-black dark:via-gray-900 dark:to-slate-950 rounded-b-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-12 mb-8 text-white">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />

        <div className="flex flex-col items-center justify-center gap-4 relative z-10 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight flex items-center justify-center gap-3">
              <IconStore className="w-10 h-10 sm:w-14 sm:h-14 text-yellow-400 drop-shadow-lg" />
              The Store
            </h1>
            <p className="text-indigo-200 text-sm sm:text-base max-w-md mx-auto">
              Spend your hard-earned coins on power-ups to boost your learning
              journey
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="px-4">
        <Tabs defaultValue="powerups" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full shadow-inner">
              <TabsTrigger
                value="powerups"
                className="rounded-full px-6 py-2.5 text-sm sm:text-base font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all"
              >
                <BulbIcon className="w-4 h-4 mr-2" />
                Power-Ups
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="rounded-full px-6 py-2.5 text-sm sm:text-base font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md transition-all"
              >
                <Backpack className="w-4 h-4 mr-2" />
                Inventory
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="powerups" className="space-y-8">
            {/* Featured Header (Optional) */}
            <div className="flex items-center gap-2 mb-4 px-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Featured Items
              </h3>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {POWER_UPS.map((item) => (
                <PowerUpCard
                  key={item.id}
                  item={item}
                  onPurchaseClick={() => openPurchaseModal(item)}
                  userCoins={userCoins}
                />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-8">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <InventoryCard
                name="Streak Freeze"
                count={user?.streakFreezes || 0}
                icon={SnowflakeIcon}
                color="text-blue-500 bg-blue-100 dark:bg-blue-900/40"
                description="Protect your streak"
              />
              <InventoryCard
                name="Hints"
                count={user?.hints || 0}
                icon={BulbIcon}
                image="/assets/icons/bulb.png"
                color="text-yellow-500 bg-yellow-100 dark:bg-yellow-900/40"
                description="Help on tough levels"
              />
              <InventoryCard
                name="Hearts"
                count={user?.hearts || 0}
                max={5}
                icon={HeartIcon}
                color="text-red-500 bg-red-100 dark:bg-red-900/40"
                description="Lives remaining"
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* --- PURCHASE CONFIRMATION MODAL --- */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl bg-white dark:bg-gray-900 p-0 overflow-hidden">
          {/* Modal Header with Color */}
          <div
            className={`h-24 ${
              selectedItem?.bgColor || "bg-gray-100"
            } relative flex items-center justify-center`}
          >
            <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />{" "}
            {/* Subtle overlay */}
            {selectedItem?.image ? (
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-16 h-16 object-contain relative z-10 drop-shadow-md"
              />
            ) : (
              selectedItem && (
                <selectedItem.icon
                  className={`w-12 h-12 ${selectedItem.color} relative z-10 drop-shadow-md`}
                />
              )
            )}
          </div>

          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black text-center text-gray-900 dark:text-white">
                {selectedItem?.name}
              </DialogTitle>
              <DialogDescription className="text-center text-gray-500">
                Are you sure you want to buy this item?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Quantity Selector */}
              {selectedItem?.allowQuantity && (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl px-4">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Quantity
                  </span>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => adjustQuantity(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-6 text-center font-black text-xl">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => adjustQuantity(1)}
                      disabled={quantity >= 10}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Total Cost & Validation */}
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                <span className="font-bold text-gray-500">Total Cost</span>
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/icons/coinv2.png"
                    alt="C"
                    className="w-6 h-6"
                  />
                  <span
                    className={`text-2xl font-black ${
                      selectedItem && userCoins < selectedItem.cost * quantity
                        ? "text-red-500"
                        : "text-indigo-600 dark:text-indigo-400"
                    }`}
                  >
                    {selectedItem &&
                      (selectedItem.cost * quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedItem && userCoins < selectedItem.cost * quantity && (
                <p className="text-red-500 text-sm text-center font-bold bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-100 dark:border-red-900/50">
                  Not enough coins! Need{" "}
                  {(selectedItem.cost * quantity - userCoins).toLocaleString()}{" "}
                  more.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 pt-0 gap-3 grid grid-cols-2">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl font-bold border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSelectedItem(null)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              disabled={
                !selectedItem ||
                userCoins < selectedItem.cost * quantity ||
                isProcessing
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full h-12 rounded-xl font-bold shadow-lg shadow-indigo-500/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- SUB-COMPONENTS with New Design ---

function PowerUpCard({ item, onPurchaseClick, userCoins }: any) {
  const { icon: Icon } = item;
  const canAffordOne = userCoins >= item.cost;

  return (
    <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
      <Card
        className="bg-white dark:bg-gray-900 border-none shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden cursor-pointer group h-full flex flex-col ring-1 ring-gray-100 dark:ring-gray-800"
        onClick={onPurchaseClick}
      >
        {/* Card Image Area with Gradient Background */}
        <div
          className={`h-32 ${item.bgColor} relative flex items-center justify-center overflow-hidden`}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 dark:bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 p-4 transition-transform duration-500 group-hover:scale-110">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-contain drop-shadow-xl"
              />
            ) : (
              <Icon className={`w-16 h-16 ${item.color} drop-shadow-xl`} />
            )}
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {item.name}
            </h3>
            <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              Lvl 1
            </Badge>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">
            {item.description}
          </p>

          <Button
            className={`w-full h-12 rounded-xl font-bold text-base shadow-md transition-all ${
              canAffordOne
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={canAffordOne ? "" : "line-through"}>
                {item.cost}
              </span>
              <img src="/assets/icons/coinv2.png" alt="C" className="w-5 h-5" />
            </div>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function InventoryCard({
  name,
  count,
  max,
  icon: Icon,
  color, // Expecting "text-color bg-color" string or similar
  description,
  image,
}: any) {
  return (
    <Card className="bg-white dark:bg-gray-900 border-none shadow-md rounded-2xl p-4 flex items-center gap-4 ring-1 ring-gray-100 dark:ring-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${color}`}
      >
        {image ? (
          <img src={image} alt={name} className="w-10 h-10 object-contain" />
        ) : (
          <Icon className="w-8 h-8 opacity-80" />
        )}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 dark:text-white text-base">
          {name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {description}
        </p>
        <div className="text-xl font-black text-gray-900 dark:text-white flex items-baseline gap-1">
          x{count}{" "}
          {max && (
            <span className="text-gray-400 text-sm font-medium">/ {max}</span>
          )}
        </div>
      </div>
    </Card>
  );
}

// Helper Badge Component (since original was not imported)
function Badge({ children, className }: any) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${className}`}>
      {children}
    </span>
  );
}
