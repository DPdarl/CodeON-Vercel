// app/components/dashboardmodule/AvatarDisplay.tsx
import { getAvatarAssets } from "~/lib/avatar-logic";
import { cn } from "~/lib/utils";

interface AvatarDisplayProps {
  config: any;
  className?: string;
  headOnly?: boolean;
}

export function AvatarDisplay({
  config,
  className,
  headOnly = false,
}: AvatarDisplayProps) {
  const assets = getAvatarAssets(config);

  // Define layers (Back to Front)
  // ▼▼▼ FIX: Conditionally add layers ONLY if path exists ▼▼▼
  const layers = [
    { src: assets.bodyPath, z: 0, name: "Body" },
    { src: assets.eyesPath, z: 10, name: "Eyes" },
    { src: assets.mouthPath, z: 10, name: "Mouth" },
    // Only add these if they are not null
    assets.bottomPath
      ? { src: assets.bottomPath, z: 20, name: "Bottoms" }
      : null,
    assets.shoesPath ? { src: assets.shoesPath, z: 20, name: "Shoes" } : null,
    assets.topPath ? { src: assets.topPath, z: 30, name: "Top" } : null,
    assets.hairPath ? { src: assets.hairPath, z: 40, name: "Hair" } : null,
    assets.accessoryPath
      ? { src: assets.accessoryPath, z: 50, name: "Accessory" }
      : null,
  ].filter(Boolean); // Remove all null entries

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-300 ease-in-out",
          headOnly ? "scale-[1.7] origin-[50%_10%]" : "scale-100 origin-center"
        )}
      >
        {layers.map((layer: any) => (
          <img
            key={layer.name}
            src={layer.src}
            alt={layer.name}
            className="absolute inset-0 w-full h-full object-contain"
            style={{ zIndex: layer.z }}
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ))}
      </div>
    </div>
  );
}
