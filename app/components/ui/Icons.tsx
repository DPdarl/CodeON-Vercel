// app/components/ui/Icons.tsx
import React from "react";
import { cn } from "~/lib/utils";

interface IconProps {
  className?: string;
}

// --- INTERNAL HELPER COMPONENT ---
// This handles the logic for all icons, keeping the file clean.
function PngIcon({
  src,
  darkSrc,
  alt,
  className,
}: IconProps & { src: string; darkSrc?: string; alt: string }) {
  // If no dark mode specific image is provided, or it's the same, render just one image.
  if (!darkSrc || src === darkSrc) {
    return (
      <img src={src} alt={alt} className={cn("object-contain", className)} />
    );
  }

  // If different images are needed for light/dark modes
  return (
    <>
      <img
        src={src}
        alt={alt}
        className={cn("block dark:hidden object-contain", className)}
      />
      <img
        src={darkSrc}
        alt={alt}
        className={cn("hidden dark:block object-contain", className)}
      />
    </>
  );
}

// --- EXPORTED ICONS ---

export function CodeOnLogo({ className }: IconProps) {
  return (
    <PngIcon
      src="/logo/CodeON_LOGO.png"
      darkSrc="/logo/CodeON_LOGODark.png"
      alt="CodeON Logo"
      className={cn("h-8 w-8", className)}
    />
  );
}

export function FlameIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/flame.png"
      alt="Streak Flame"
      className={cn("h-8 w-8", className)}
    />
  );
}

export function StreakBreakIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/streakbreak.png"
      alt="Streak Break"
      className={cn("h-8 w-8", className)}
    />
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/heart.png"
      alt="Heart"
      className={cn("h-8 w-8", className)}
    />
  );
}

export function SnowflakeIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/snowflake.png"
      alt="Snowflake"
      // Default size was h-10 w-10 in your snippet
      className={cn("h-10 w-10", className)}
    />
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/star.png"
      darkSrc="/assets/icons/stardark.png"
      alt="Star"
      // Default size was h-10 w-10 in your snippet
      className={cn("h-10 w-10", className)}
    />
  );
}

export function TrophyIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/trophy.png"
      alt="Trophy"
      className={cn("h-8 w-8", className)}
    />
  );
}

export function BulbIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/bulb.png"
      alt="Bulb"
      className={cn("h-8 w-8", className)}
    />
  );
}

export function CrownIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/crown.png"
      alt="Crown"
      className={cn("h-8 w-8", className)}
    />
  );
}

export function CoinIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/coinv2.png"
      alt="Coin"
      className={cn("h-8 w-8", className)}
    />
  );
}

export function IconStore({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/store.png"
      alt="Store"
      className={cn("h-8 w-8", className)}
    />
  );
}

//MEDALS

export function MedalGold({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/medalgold.png"
      alt="Gold Medal"
      className={cn("h-8 w-8", className)}
    />
  );
}

export function MedalSilver({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/medalsilver.png"
      alt="Silver Medal"
      className={cn("h-8 w-8", className)}
    />
  );
}

export function MedalBronze({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/medalbronze.png"
      alt="Bronze Medal"
      className={cn("h-8 w-8", className)}
    />
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/home.png"
      alt="Home"
      className={cn("h-8 w-8", className)}
    />
  );
}

export function ControllerIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/controller.png"
      alt="Controller"
      className={cn("h-8 w-8", className)}
    />
  );
}
export function ScrollQuestIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/scrollquest.png"
      alt="ScrollQuest"
      className={cn("h-8 w-8", className)}
    />
  );
}
export function TogaIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/toga.png"
      alt="Toga"
      className={cn("h-8 w-8", className)}
    />
  );
}
export function InstructorIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/instructor.png"
      alt="Instructor"
      className={cn("h-8 w-8", className)}
    />
  );
}
export function ProfileIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/profile.png"
      alt="Profile"
      className={cn("h-8 w-8", className)}
    />
  );
}
export function AdminIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/admin.png"
      alt="Admin"
      className={cn("h-8 w-8", className)}
    />
  );
}
export function ReportIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/report.png"
      alt="Report"
      className={cn("h-8 w-8", className)}
    />
  );
}
export function MapIcon({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/map.png"
      alt="Adventure Map"
      className={cn("h-8 w-8", className)}
    />
  );
}

// Example of a single GIF for both modes
export function XpOrb({ className }: IconProps) {
  return (
    <PngIcon
      src="/assets/icons/experience-orb.gif" // Path to your GIF
      alt="XP Orb"
      className={className} // Pass sizing classes here or use defaults
    />
  );
}
