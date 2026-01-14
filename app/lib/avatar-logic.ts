// app/lib/avatar-logic.ts

export const getAvatarAssets = (config: any) => {
  // Default safe values
  const {
    body = "male",
    eyes = "normal",
    hair = "default",
    mouth = "smile",
    top = "tshirt",
    bottom = "pants",
    shoes = "shoes",
    accessory = "none",
  } = config || {};

  // 1. Body
  const bodyPath =
    body === "female"
      ? "/assets/body/BaseBodyFemale.png"
      : "/assets/body/BaseBodyMale.png";

  // 2. Eyes
  let eyesFile = `${eyes}.png`;
  if (eyes === "angry") {
    eyesFile = body === "female" ? "angryf.png" : "angrym.png";
  } else if (eyes === "normal") {
    eyesFile = body === "female" ? "normalf.png" : "normalm.png";
  }
  const eyesPath = `/assets/eyes/${eyesFile}`;

  // 3. Hair (Handles "none")
  let hairPath = null;
  if (hair !== "none") {
    let hairFile = "HairDefaultM1.png";
    if (body === "female") {
      if (hair === "default") hairFile = "HairDefaultF2.png";
      else if (hair === "style1") hairFile = "HairStyleF1.png";
      else if (hair === "style2") hairFile = "HairStyleF3.png";
      else hairFile = "HairDefaultF2.png";
    } else {
      if (hair === "default") hairFile = "HairDefaultM1.png";
      else if (hair === "style1") hairFile = "HairStyleM2.png";
      else if (hair === "style2") hairFile = "HairStyleM3.png";
      else hairFile = "HairDefaultM1.png";
    }
    hairPath = `/assets/hair/${hairFile}`;
  }

  // 4. Mouth
  const mouthPath = `/assets/mouth/${mouth}.png`;

  // 5. Tops (Handles "none")
  let topPath = null;
  if (top !== "none") {
    const genderedTops = ["leatherjacket", "sando", "sweater", "tshirt"];
    let topFile = `${top}.png`;
    if (body === "female" && genderedTops.includes(top)) {
      topFile = `${top}f.png`;
    }
    topPath = `/assets/tops/${topFile}`;
  }

  // 6. Bottoms (Handles "none")
  let bottomPath = null;
  if (bottom !== "none") {
    bottomPath = `/assets/bottoms/${bottom}.png`;
  }

  // 7. Shoes (Handles "none")
  let shoesPath = null;
  if (shoes !== "none") {
    let shoesFile = `${shoes}.png`;
    if (shoes === "shoes" && body === "female") {
      shoesFile = "shoesf.png";
    }
    shoesPath = `/assets/shoes/${shoesFile}`;
  }

  // 8. Accessory (Handles "none")
  const accessoryPath =
    accessory !== "none" ? `/assets/accessories/${accessory}.png` : null;

  return {
    bodyPath,
    eyesPath,
    hairPath,
    mouthPath,
    topPath,
    bottomPath,
    shoesPath,
    accessoryPath,
  };
};
