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
import { Loader2, Backpack, Minus, Plus, ShoppingBag } from "lucide-react";
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
      quantity
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
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <IconStore className="w-8 h-8 text-indigo-500" />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              The Store
            </h1>
          </div>
          {/* Coin Balance */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full p-2 pr-6 shadow-md flex items-center gap-3">
            <img
              src="/assets/icons/coinv2.png"
              alt="Coins"
              className="w-8 h-8"
            />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-none">
                Your Coins
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                {userCoins.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="powerups" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12 rounded-xl">
          <TabsTrigger value="powerups" className="h-10 rounded-lg">
            <BulbIcon className="w-4 h-4 mr-2" />
            Power-Ups
          </TabsTrigger>
          <TabsTrigger value="inventory" className="h-10 rounded-lg">
            <Backpack className="w-4 h-4 mr-2" />
            Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="powerups">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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

        <TabsContent value="inventory">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <InventoryCard
              name="Streak Freeze"
              count={user?.streakFreezes || 0}
              icon={SnowflakeIcon}
              color="text-blue-500"
              description="Protect your streak for a day."
            />
            <InventoryCard
              name="Hints"
              count={user?.hints || 0}
              icon={BulbIcon}
              image="/assets/icons/bulb.png"
              color="text-yellow-500"
              description="Get help on tough challenges."
            />
            <InventoryCard
              name="Hearts"
              count={user?.hearts || 0}
              max={5}
              icon={HeartIcon}
              color="text-red-500"
              description="Lives remaining."
            />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* --- PURCHASE CONFIRMATION MODAL --- */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-500" />
              Confirm Purchase
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to buy this item?
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="py-4 space-y-6">
              {/* Item Preview */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div
                  className={`w-16 h-16 rounded-xl ${selectedItem.bgColor} flex items-center justify-center shrink-0`}
                >
                  {selectedItem.image ? (
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <selectedItem.icon
                      className={`w-8 h-8 ${selectedItem.color}`}
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{selectedItem.name}</h4>
                  <div className="flex items-center gap-1 text-gray-500">
                    <img
                      src="/assets/icons/coinv2.png"
                      alt="C"
                      className="w-4 h-4"
                    />
                    <span className="font-mono font-bold">
                      {selectedItem.cost}
                    </span>{" "}
                    each
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              {selectedItem.allowQuantity && (
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-gray-500">
                    Quantity
                  </span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => adjustQuantity(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-bold text-lg">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => adjustQuantity(1)}
                      disabled={quantity >= 10}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Total Cost & Validation */}
              <div className="flex items-center justify-between border-t pt-4 mt-4">
                <span className="font-bold text-gray-900 dark:text-white">
                  Total Cost
                </span>
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/icons/coinv2.png"
                    alt="C"
                    className="w-5 h-5"
                  />
                  <span
                    className={`text-xl font-black ${
                      userCoins < selectedItem.cost * quantity
                        ? "text-red-500"
                        : "text-indigo-600 dark:text-indigo-400"
                    }`}
                  >
                    {(selectedItem.cost * quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {userCoins < selectedItem.cost * quantity && (
                <p className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-950/30 p-2 rounded-lg">
                  You need{" "}
                  {(selectedItem.cost * quantity - userCoins).toLocaleString()}{" "}
                  more coins!
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto font-bold"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Processing...
                </>
              ) : (
                "Confirm Purchase"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PowerUpCard({ item, onPurchaseClick, userCoins }: any) {
  const { icon: Icon } = item;
  // Visual hint if they can't afford even one
  const canAffordOne = userCoins >= item.cost;

  return (
    <Card
      className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl flex flex-col overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
      onClick={onPurchaseClick}
    >
      <CardHeader className="flex-col items-center text-center pb-2">
        <div
          className={`w-20 h-20 rounded-3xl ${item.bgColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <Icon className={`w-10 h-10 ${item.color}`} />
          )}
        </div>
        <CardTitle className="text-xl font-bold">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 text-center px-6">
        <CardDescription className="text-sm">
          {item.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="pt-2 pb-6">
        <Button
          className="w-full h-12 rounded-xl text-base font-bold"
          variant={canAffordOne ? "default" : "secondary"}
        >
          <div className="flex items-center gap-2">
            <span>Buy</span>
            <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-lg">
              <img src="/assets/icons/coinv2.png" alt="C" className="w-4 h-4" />
              <span>{item.cost}</span>
            </div>
          </div>
        </Button>
      </CardFooter>
    </Card>
  );
}

function InventoryCard({
  name,
  count,
  max,
  icon: Icon,
  color,
  description,
  image,
}: any) {
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl flex items-center p-4 gap-4">
      <div
        className={`w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0`}
      >
        {image ? (
          <img src={image} alt={name} className="w-9 h-9 object-contain" />
        ) : (
          <Icon className={`w-7 h-7 ${color}`} />
        )}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {name}
        </div>
        <div className="text-2xl font-black text-gray-900 dark:text-white">
          x{count}{" "}
          {max && <span className="text-gray-400 text-lg">/ {max}</span>}
        </div>
      </div>
    </Card>
  );
}
