import { motion } from "framer-motion";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground overflow-hidden">
      {/* Background Ambient Glow - Optimized for smoothness */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/40 rounded-full blur-[100px] md:blur-[140px]"
        initial={{ opacity: 0.2 }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut", // Sine wave like ease
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8">
        {/* Logo / Icon Animation */}
        <div className="relative">
          {/* Static Glow Object - Animates Opacity instead of BoxShadow for performance */}
          <motion.div
            className="absolute inset-0 bg-primary rounded-2xl blur-xl"
            initial={{ opacity: 0.2 }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Central Logo Box - Static visual, no heavy animation properties */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-2xl flex items-center justify-center relative shadow-2xl shadow-primary/20 z-20">
            {/* Coin Icon */}
            <img
              src="/assets/icons/coinv2.png"
              alt="Loading"
              className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* Text Loading */}
        <div className="flex flex-col items-center gap-3 md:gap-4">
          <motion.div
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-10 md:h-12 flex items-center justify-center p-2"
          >
            {/* Light Mode Logo */}
            <img
              src="/assets/icons/CodeONTextLogo.png"
              alt="CodeON"
              className="h-full object-contain dark:hidden block"
            />
            {/* Dark Mode Logo */}
            <img
              src="/assets/icons/CodeONTextLogoDark.png"
              alt="CodeON"
              className="h-full object-contain hidden dark:block"
            />
          </motion.div>

          {/* Dots */}
          <div className="flex items-center gap-1 h-4">
            <span className="text-[10px] md:text-xs text-muted-foreground font-mono uppercase tracking-widest">
              Initializing
            </span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.2 }}
              className="text-primary text-[10px] md:text-xs font-bold"
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.4 }}
              className="text-primary text-[10px] md:text-xs font-bold"
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.6 }}
              className="text-primary text-[10px] md:text-xs font-bold"
            >
              .
            </motion.span>
          </div>
        </div>
      </div>

      {/* Bottom Light Haze */}
      <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
    </div>
  );
};
