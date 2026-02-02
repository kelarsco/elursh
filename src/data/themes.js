/**
 * Theme list: prices $80–$300, mockup image URLs.
 * Many themes use local assets; others use Picsum.
 */
import zealImage from "@/assets/zeal.png";
import forceImage from "@/assets/force.jpg";
import zenithImage from "@/assets/Zenith.jpg";
import broadcastImage from "@/assets/broadcast.png";
import igniteImage from "@/assets/ignite.jpg";
import shapesImage from "@/assets/shapes.png";
import releaseImage from "@/assets/release.jpg";
import pipelineImage from "@/assets/pipeline.jpg";
import conceptImage from "@/assets/concept.jpg";
import xtraImage from "@/assets/xtra.png";
import impulseImage from "@/assets/impulse.png";
import prestigeImage from "@/assets/prestige.jpg";
import symmetryImage from "@/assets/Symmetry.png";
import wonderImage from "@/assets/wonder.jpg";
import localImage from "@/assets/local.jpg";
import motionImage from "@/assets/motion.png";
import craftImage from "@/assets/craft.png";
import blazeImage from "@/assets/blaze.png";
import strideImage from "@/assets/stride.jpg";
import groveImage from "@/assets/grove.png";
import clarityImage from "@/assets/clarity.png";
import auraImage from "@/assets/aura.png";
import emberImage from "@/assets/ember.jpg";
import forgeImage from "@/assets/forge.jpg";
import catalystImage from "@/assets/catalyst.png";
import prismImage from "@/assets/prism.jpg";
import vertexImage from "@/assets/vertex.jpg";
import pulseImage from "@/assets/pulse.jpg";
import novaImage from "@/assets/nova.jpg";
import vogueImage from "@/assets/vogue.jpg";
import minimalImage from "@/assets/minimal.jpg";
import boldImage from "@/assets/bold.jpg";
import horizonImage from "@/assets/horizon.jpg";

const FEATURE_POOL = [
  "Premium Design",
  "Mobile Optimized",
  "Speed Focused",
  "SEO Ready",
  "Lookbook Layouts",
  "Quick View",
  "Mega Menu",
  "Product Filters",
  "Sticky Header",
  "Color Swatches",
  "Countdown Timer",
  "Infinite Scroll",
  "Quick Order List",
  "EU Translations",
  "Right-to-Left",
  "Stock Counter",
  "Age Verifier",
  "Breadcrumbs",
  "Back-to-top",
  "Before/After Slider",
];

const THEME_NAMES = [
  "Zeal",
  "Force",
  "Zenith",
  "Focal",
  "Broadcast",
  "Ignite",
  "Shapes",
  "Xclusive",
  "Enterprise",
  "Sleek",
  "Release",
  "Pipeline",
  "Concept",
  "Xtra",
  "Impulse",
  "Prestige",
  "Symmetry",
  "Wonder",
  "Local",
  "Motion",
  "Craft",
  "Frost",
  "Blaze",
  "Stride",
  "Grove",
  "Clarity",
  "Aura",
  "Ember",
  "Haven",
  "Forge",
  "Catalyst",
  "Prism",
  "Vertex",
  "Pulse",
  "Drift",
  "Flux",
  "Nova",
  "Vogue",
  "Minimal",
  "Bold",
  "Horizon",
];

function pickFeatures(themeId, n = 4) {
  const pool = [...FEATURE_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = (themeId + i) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

/** Theme name → asset image URL (for API themes and static list). */
const LOCAL_IMAGES_BY_INDEX = {
  0: zealImage,
  1: forceImage,
  2: zenithImage,
  4: broadcastImage,
  5: igniteImage,
  6: shapesImage,
  10: releaseImage,
  11: pipelineImage,
  12: conceptImage,
  13: xtraImage,
  14: impulseImage,
  15: prestigeImage,
  16: symmetryImage,
  17: wonderImage,
  18: localImage,
  19: motionImage,
  20: craftImage,
  22: blazeImage,
  23: strideImage,
  24: groveImage,
  25: clarityImage,
  26: auraImage,
  27: emberImage,
  29: forgeImage,
  30: catalystImage,
  31: prismImage,
  32: vertexImage,
  33: pulseImage,
  36: novaImage,
  37: vogueImage,
  38: minimalImage,
  39: boldImage,
  40: horizonImage,
};

function buildThemes() {
  const prices = [80, 89, 99, 100, 109, 119, 129, 139, 149, 159, 169, 179, 189, 199, 209, 219, 229, 239, 249, 259, 269, 279, 289, 299, 300];
  const themes = [];
  for (let i = 0; i < THEME_NAMES.length; i++) {
    themes.push({
      id: i + 1,
      name: THEME_NAMES[i],
      price: prices[i % prices.length],
      priceLabel: `$${prices[i % prices.length]}`,
      features: pickFeatures(i + 1, 4),
      image: LOCAL_IMAGES_BY_INDEX[i] ?? `https://picsum.photos/seed/theme-${i + 1}/400/300`,
    });
  }
  return themes;
}

const themes = buildThemes();

export const THEME_NAME_TO_IMAGE = {};
THEME_NAMES.forEach((name, i) => {
  if (LOCAL_IMAGES_BY_INDEX[i]) THEME_NAME_TO_IMAGE[name] = LOCAL_IMAGES_BY_INDEX[i];
});

export default themes;
