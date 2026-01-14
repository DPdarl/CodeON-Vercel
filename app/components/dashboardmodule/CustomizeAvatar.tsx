import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Wand2, User, Shirt, Smile, Glasses, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AvatarDisplay } from "./AvatarDisplay";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";

// --- CATEGORIES CONFIGURATION ---
const CATEGORIES = [
  { id: "body", label: "Body", icon: User },
  { id: "hair", label: "Hair", icon: Sparkles },
  { id: "face", label: "Face", icon: Smile },
  { id: "outfit", label: "Outfit", icon: Shirt },
  { id: "gear", label: "Gear", icon: Glasses },
];

// --- OPTIONS DATA ---
const options = {
  body: ["male", "female"],
  hair: ["none", "default", "style1", "style2"],
  eyes: [
    "normal",
    "angry",
    "disgust",
    "eepy",
    "nonchalant",
    "shock",
    "sideeye",
  ],
  mouth: ["smile", "small", "sad", "kissy", "cat", "nonchalant"],
  top: ["none", "tshirt", "sweater", "sando", "leatherjacket"],
  bottom: ["none", "pants", "short", "skirt"],
  shoes: ["none", "shoes", "shoesf", "boots", "slides", "fp"],
  accessory: [
    "none",
    "glassesfull",
    "glassesround",
    "glassessquare",
    "semisquaredglasses",
    "bowtie",
    "scarf1",
    "scarf2",
    "scarf3",
  ],
};

const defaultConfig = {
  body: "male",
  hair: "default",
  eyes: "normal",
  mouth: "smile",
  top: "tshirt",
  bottom: "pants",
  shoes: "shoes",
  accessory: "none",
};

interface CustomizeAvatarProps {
  initialConfig?: any;
  onSave: (config: any) => Promise<void>;
  user?: any;
  saveLabel?: string;
}

export function CustomizeAvatar({
  initialConfig,
  onSave,
  saveLabel = "Save Avatar",
}: CustomizeAvatarProps) {
  const [avatarConfig, setAvatarConfig] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState("body");
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvatarConfig({ ...defaultConfig, ...initialConfig });
  }, [initialConfig]);

  // --- SNAPPY AUTO-SCROLL ---
  useEffect(() => {
    // requestAnimationFrame ensures we run immediately after the DOM paint
    // preventing the "laggy" feel of setTimeout
    const handleScroll = () => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start", // Aligns top of card to top of view (respecting scroll-margin)
        });
      }
    };

    // Run it on the next frame
    requestAnimationFrame(() => {
      // Double rAF is a common trick to ensure React has fully committed the layout
      requestAnimationFrame(handleScroll);
    });
  }, []);

  if (!avatarConfig) return <CustomizeAvatarSkeleton />;

  const setConfigValue = (key: string, value: string) => {
    setAvatarConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(avatarConfig);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save avatar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      ref={containerRef}
      // scroll-mt-24 gives breathing room from the top (header) when scrolling
      className="bg-white dark:bg-gray-900 shadow-xl border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden scroll-mt-24"
    >
      <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <CardTitle className="text-2xl font-black flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <Wand2 className="w-6 h-6 text-indigo-500" />
          Avatar Studio
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row h-[800px] lg:h-[650px]">
          {/* --- LEFT: PREVIEW (55%) --- */}
          <div className="w-full lg:w-[55%] bg-gray-100/50 dark:bg-gray-900/50 p-6 flex flex-col justify-between border-r border-gray-100 dark:border-gray-800">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-[450px] aspect-square rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border-4 border-white dark:border-gray-700 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 opacity-50" />
                <div className="relative z-10 h-full">
                  <AvatarDisplay config={avatarConfig} />
                </div>
              </div>
            </div>

            <div className="mt-6 max-w-[450px] mx-auto w-full">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className={cn(
                  "w-full h-14 rounded-2xl font-black text-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all",
                  "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98]",
                  isLoading && "opacity-80 cursor-wait"
                )}
              >
                {isLoading ? "Saving..." : saveLabel}
              </Button>
            </div>
          </div>

          {/* --- RIGHT: OPTIONS (45%) --- */}
          <div className="w-full lg:w-[45%] flex flex-col bg-white dark:bg-gray-900">
            {/* PILL TABS */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap snap-start border-b-4",
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-500"
                          : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isActive ? "fill-current" : "stroke-current"
                        )}
                      />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SCROLLABLE OPTIONS */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }} // Faster transition
                  className="space-y-8"
                >
                  {activeCategory === "body" && (
                    <OptionGroup title="Body Base">
                      <div className="grid grid-cols-2 gap-4">
                        {options.body.map((item) => (
                          <ItemSwatch
                            key={item}
                            label={item}
                            isSelected={avatarConfig.body === item}
                            onClick={() => setConfigValue("body", item)}
                          />
                        ))}
                      </div>
                    </OptionGroup>
                  )}

                  {activeCategory === "hair" && (
                    <OptionGroup title="Hairstyles">
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                        {options.hair.map((item) => (
                          <ItemSwatch
                            key={item}
                            label={item}
                            isSelected={avatarConfig.hair === item}
                            onClick={() => setConfigValue("hair", item)}
                          />
                        ))}
                      </div>
                    </OptionGroup>
                  )}

                  {activeCategory === "face" && (
                    <>
                      <OptionGroup title="Eyes">
                        <div className="grid grid-cols-2 gap-4">
                          {options.eyes.map((item) => (
                            <ItemSwatch
                              key={item}
                              label={item}
                              isSelected={avatarConfig.eyes === item}
                              onClick={() => setConfigValue("eyes", item)}
                            />
                          ))}
                        </div>
                      </OptionGroup>
                      <OptionGroup title="Mouth">
                        <div className="grid grid-cols-2 gap-4">
                          {options.mouth.map((item) => (
                            <ItemSwatch
                              key={item}
                              label={item}
                              isSelected={avatarConfig.mouth === item}
                              onClick={() => setConfigValue("mouth", item)}
                            />
                          ))}
                        </div>
                      </OptionGroup>
                    </>
                  )}

                  {activeCategory === "outfit" && (
                    <>
                      <OptionGroup title="Tops">
                        <div className="grid grid-cols-2 gap-4">
                          {options.top.map((item) => (
                            <ItemSwatch
                              key={item}
                              label={item}
                              isSelected={avatarConfig.top === item}
                              onClick={() => setConfigValue("top", item)}
                            />
                          ))}
                        </div>
                      </OptionGroup>
                      <OptionGroup title="Bottoms">
                        <div className="grid grid-cols-2 gap-4">
                          {options.bottom.map((item) => (
                            <ItemSwatch
                              key={item}
                              label={item}
                              isSelected={avatarConfig.bottom === item}
                              onClick={() => setConfigValue("bottom", item)}
                            />
                          ))}
                        </div>
                      </OptionGroup>
                      <OptionGroup title="Shoes">
                        <div className="grid grid-cols-2 gap-4">
                          {options.shoes.map((item) => (
                            <ItemSwatch
                              key={item}
                              label={item}
                              isSelected={avatarConfig.shoes === item}
                              onClick={() => setConfigValue("shoes", item)}
                            />
                          ))}
                        </div>
                      </OptionGroup>
                    </>
                  )}

                  {activeCategory === "gear" && (
                    <OptionGroup title="Accessories">
                      <div className="grid grid-cols-2 gap-4">
                        {options.accessory.map((item) => (
                          <ItemSwatch
                            key={item}
                            label={item}
                            isSelected={avatarConfig.accessory === item}
                            onClick={() => setConfigValue("accessory", item)}
                          />
                        ))}
                      </div>
                    </OptionGroup>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- SUB COMPONENTS ---
function OptionGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 ml-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ItemSwatch({ label, isSelected, onClick }: any) {
  const displayLabel = label
    .replace(/([A-Z])/g, " $1")
    .replace(/(\d+)/g, " $1")
    .trim();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-16 rounded-2xl border-2 transition-all flex items-center justify-center px-2 text-center relative overflow-hidden group",
        isSelected
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
      )}
      title={displayLabel}
    >
      <span
        className={cn(
          "text-xs font-bold uppercase tracking-tight truncate w-full z-10 transition-colors",
          isSelected
            ? "text-indigo-600 dark:text-indigo-300"
            : "text-gray-600 dark:text-gray-400 group-hover:text-indigo-500"
        )}
      >
        {displayLabel}
      </span>
    </button>
  );
}

function CustomizeAvatarSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-xl rounded-3xl h-[650px] overflow-hidden">
      <div className="flex flex-col lg:flex-row h-full">
        <div className="w-full lg:w-[55%] p-6 flex flex-col gap-6 bg-gray-50 dark:bg-gray-800/50">
          <Skeleton className="w-full max-w-[450px] aspect-square rounded-3xl mx-auto" />
          <Skeleton className="w-full max-w-[450px] h-14 rounded-2xl mx-auto" />
        </div>
        <div className="w-full lg:w-[45%] p-6 space-y-6">
          <div className="flex gap-3 overflow-hidden">
            <Skeleton className="w-20 h-10 rounded-2xl flex-shrink-0" />
            <Skeleton className="w-20 h-10 rounded-2xl flex-shrink-0" />
            <Skeleton className="w-20 h-10 rounded-2xl flex-shrink-0" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
