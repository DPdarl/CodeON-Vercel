// app/routes/api.avatar.tsx
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const body = url.searchParams.get("body") || "male";
  const eyes = url.searchParams.get("eyes") || "normal";
  const hair = url.searchParams.get("hair") || "default";
  const mouth = url.searchParams.get("mouth") || "smile";
  const top = url.searchParams.get("top") || "tshirt";
  const bottom = url.searchParams.get("bottom") || "pants";
  const shoes = url.searchParams.get("shoes") || "shoes";
  const accessory = url.searchParams.get("accessory") || "none";

  const isHeadOnly = url.searchParams.get("head") === "true";

  // Body
  const bodyPath =
    body === "female"
      ? "/assets/body/BaseBodyFemale.png"
      : "/assets/body/BaseBodyMale.png";

  // Eyes
  let eyesFile = `${eyes}.png`;
  if (eyes === "angry") {
    eyesFile = body === "female" ? "angryf.png" : "angrym.png";
  } else if (eyes === "normal") {
    eyesFile = body === "female" ? "normalf.png" : "normalm.png";
  }
  const eyesPath = `/assets/eyes/${eyesFile}`;

  // Hair
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

  // Mouth
  const mouthPath = `/assets/mouth/${mouth}.png`;

  // Tops
  let topPath = null;
  if (top !== "none") {
    const genderedTops = ["leatherjacket", "sando", "sweater", "tshirt"];
    let topFile = `${top}.png`;
    if (body === "female" && genderedTops.includes(top)) {
      topFile = `${top}f.png`;
    }
    topPath = `/assets/tops/${topFile}`;
  }

  // Bottoms
  let bottomPath = null;
  if (bottom !== "none") {
    bottomPath = `/assets/bottoms/${bottom}.png`;
  }

  // Shoes
  let shoesPath = null;
  if (shoes !== "none") {
    let shoesFile = `${shoes}.png`;
    if (shoes === "shoes" && body === "female") {
      shoesFile = "shoesf.png";
    }
    shoesPath = `/assets/shoes/${shoesFile}`;
  }

  // Accessory
  const accessoryPath =
    accessory !== "none" ? `/assets/accessories/${accessory}.png` : null;

  const viewBox = isHeadOnly ? "350 50 800 800" : "0 0 1500 2000";

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">
      <image href="${bodyPath}" x="0" y="0" width="100%" height="100%"/>
      <image href="${eyesPath}" x="0" y="0" width="100%" height="100%"/>
      <image href="${mouthPath}" x="0" y="0" width="100%" height="100%"/>
      ${
        bottomPath
          ? `<image href="${bottomPath}" x="0" y="0" width="100%" height="100%"/>`
          : ""
      }
      ${
        topPath
          ? `<image href="${topPath}" x="0" y="0" width="100%" height="100%"/>`
          : ""
      }
      ${
        shoesPath
          ? `<image href="${shoesPath}" x="0" y="0" width="100%" height="100%"/>`
          : ""
      }
      ${
        hairPath
          ? `<image href="${hairPath}" x="0" y="0" width="100%" height="100%"/>`
          : ""
      }
      ${
        accessoryPath
          ? `<image href="${accessoryPath}" x="0" y="0" width="100%" height="100%"/>`
          : ""
      }
    </svg>
  `;

  return new Response(svgContent, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
