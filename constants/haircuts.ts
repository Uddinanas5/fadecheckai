// FadeCheck 2.0 — Haircut catalog.
//
// The `id`, `name` and `category` here MUST stay in sync with
// scripts/generate-style-placeholders.js (which produces the bundled images).
// Reference images live at assets/styles/<id>/{thumb,ref_1..4}.png — swap the
// placeholders for real licensed/approved photos anytime (no code change).

import { Haircut } from '../types';

export const HAIRCUTS: Haircut[] = [
  {
    id: 'low-taper-fade',
    name: 'Low Taper Fade',
    category: 'taper',
    tagline: 'Clean and subtle — office-friendly',
    description:
      'A gentle fade that starts low, just above the ears and neckline, keeping length everywhere else. The most conservative, low-maintenance way to look sharp.',
    bestFaceShapes: ['oval', 'round', 'heart', 'oblong'],
    bestHairTypes: ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B'],
    maintenance: 'Every 3-4 weeks',
    difficulty: 'easy',
    barberInstructions: [
      'Low taper fade around the ears and neckline',
      'Keep the length on top, blended into the sides',
      'Natural hairline, not squared off',
    ],
    tryOnPrompt:
      'a low taper fade: hair gradually shortens just above the ears and along the neckline while keeping fuller length on top, subtle and clean',
    thumbnail: require('../assets/styles/low-taper-fade/thumb.png'),
    referenceImages: [
      require('../assets/styles/low-taper-fade/ref_1.png'),
      require('../assets/styles/low-taper-fade/ref_2.png'),
      require('../assets/styles/low-taper-fade/ref_3.png'),
      require('../assets/styles/low-taper-fade/ref_4.png'),
    ],
  },
  {
    id: 'mid-taper-fade',
    name: 'Mid Taper Fade',
    category: 'taper',
    tagline: 'The versatile all-rounder',
    description:
      'A balanced fade starting around the temples for a bit more contrast than a low taper, while staying easy to grow out. Works with almost any style on top.',
    bestFaceShapes: ['oval', 'square', 'round', 'diamond', 'heart'],
    bestHairTypes: ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C'],
    maintenance: 'Every 2-3 weeks',
    difficulty: 'easy',
    barberInstructions: [
      'Mid taper fade starting around the temples',
      'Blend cleanly into the top length',
      'Tighten the corners and neckline',
    ],
    tryOnPrompt:
      'a mid taper fade: hair fades from the temple area down to shorter length around the ears and neck, balanced contrast with textured length on top',
    thumbnail: require('../assets/styles/mid-taper-fade/thumb.png'),
    referenceImages: [
      require('../assets/styles/mid-taper-fade/ref_1.png'),
      require('../assets/styles/mid-taper-fade/ref_2.png'),
      require('../assets/styles/mid-taper-fade/ref_3.png'),
      require('../assets/styles/mid-taper-fade/ref_4.png'),
    ],
  },
  {
    id: 'high-taper-fade',
    name: 'High Taper Fade',
    category: 'taper',
    tagline: 'Bold contrast, sharp look',
    description:
      'A high-starting taper that creates strong contrast between the top and sides. Great for showing off texture and volume up top.',
    bestFaceShapes: ['oval', 'round', 'heart'],
    bestHairTypes: ['1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A'],
    maintenance: 'Every 2 weeks',
    difficulty: 'medium',
    barberInstructions: [
      'High taper starting above the temples',
      'Keep strong contrast with the length on top',
      'Sharp, clean neckline',
    ],
    tryOnPrompt:
      'a high taper fade: hair fades high above the temples creating strong contrast with fuller volume kept on top',
    thumbnail: require('../assets/styles/high-taper-fade/thumb.png'),
    referenceImages: [
      require('../assets/styles/high-taper-fade/ref_1.png'),
      require('../assets/styles/high-taper-fade/ref_2.png'),
      require('../assets/styles/high-taper-fade/ref_3.png'),
      require('../assets/styles/high-taper-fade/ref_4.png'),
    ],
  },
  {
    id: 'low-skin-fade',
    name: 'Low Skin Fade',
    category: 'fade',
    tagline: 'Skin-tight down low, clean up top',
    description:
      'Fades all the way down to bare skin near the ears and neckline for a crisp, modern finish, while keeping a subtle overall shape.',
    bestFaceShapes: ['oval', 'square', 'round', 'oblong', 'heart'],
    bestHairTypes: ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B'],
    maintenance: 'Every 1-2 weeks',
    difficulty: 'medium',
    barberInstructions: [
      'Low skin fade taken down to the skin near the ears',
      'Smooth, blurry blend with no harsh lines',
      'Keep length and shape on top',
    ],
    tryOnPrompt:
      'a low skin fade: hair blends down to bare skin near the ears and neckline with a smooth seamless gradient, length kept on top',
    thumbnail: require('../assets/styles/low-skin-fade/thumb.png'),
    referenceImages: [
      require('../assets/styles/low-skin-fade/ref_1.png'),
      require('../assets/styles/low-skin-fade/ref_2.png'),
      require('../assets/styles/low-skin-fade/ref_3.png'),
      require('../assets/styles/low-skin-fade/ref_4.png'),
    ],
  },
  {
    id: 'mid-skin-fade',
    name: 'Mid Skin Fade',
    category: 'fade',
    tagline: 'High-contrast and crisp',
    description:
      'A skin fade starting mid-way up the sides for a bold, clean gradient. A modern barbershop favorite that pairs with any top style.',
    bestFaceShapes: ['oval', 'square', 'diamond', 'round'],
    bestHairTypes: ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B'],
    maintenance: 'Every 1-2 weeks',
    difficulty: 'advanced',
    barberInstructions: [
      'Mid skin fade starting around the temples',
      'Blurry, seamless blend down to skin',
      'Define the top and lineup',
    ],
    tryOnPrompt:
      'a mid skin fade: a bold seamless gradient from the temple area down to bare skin, high contrast with styled length on top',
    thumbnail: require('../assets/styles/mid-skin-fade/thumb.png'),
    referenceImages: [
      require('../assets/styles/mid-skin-fade/ref_1.png'),
      require('../assets/styles/mid-skin-fade/ref_2.png'),
      require('../assets/styles/mid-skin-fade/ref_3.png'),
      require('../assets/styles/mid-skin-fade/ref_4.png'),
    ],
  },
  {
    id: 'high-skin-fade',
    name: 'High Skin Fade',
    category: 'fade',
    tagline: 'Maximum contrast, statement look',
    description:
      'The boldest skin fade — taken high up the sides for dramatic contrast. Best when you want the top to be the star.',
    bestFaceShapes: ['oval', 'round', 'heart'],
    bestHairTypes: ['1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C'],
    maintenance: 'Every 1-2 weeks',
    difficulty: 'advanced',
    barberInstructions: [
      'High skin fade taken well above the temples',
      'Keep a bold top-to-skin contrast',
      'Smooth blend, sharp lineup',
    ],
    tryOnPrompt:
      'a high skin fade: dramatic contrast with the sides faded high up to bare skin and full volume kept on top',
    thumbnail: require('../assets/styles/high-skin-fade/thumb.png'),
    referenceImages: [
      require('../assets/styles/high-skin-fade/ref_1.png'),
      require('../assets/styles/high-skin-fade/ref_2.png'),
      require('../assets/styles/high-skin-fade/ref_3.png'),
      require('../assets/styles/high-skin-fade/ref_4.png'),
    ],
  },
  {
    id: 'burst-fade',
    name: 'Burst Fade',
    category: 'fade',
    tagline: 'Curved fade around the ear',
    description:
      'A fade that curves in a semicircle around the ear, leaving weight at the back. Popular with textured and curly styles and mullets.',
    bestFaceShapes: ['oval', 'square', 'diamond'],
    bestHairTypes: ['2B', '2C', '3A', '3B', '3C', '4A', '4B'],
    maintenance: 'Every 2 weeks',
    difficulty: 'advanced',
    barberInstructions: [
      'Burst fade curving around the ears',
      'Keep length and weight toward the back',
      'Blend into the natural texture on top',
    ],
    tryOnPrompt:
      'a burst fade: the fade curves in a semicircle around the ears while keeping length at the back and textured hair on top',
    thumbnail: require('../assets/styles/burst-fade/thumb.png'),
    referenceImages: [
      require('../assets/styles/burst-fade/ref_1.png'),
      require('../assets/styles/burst-fade/ref_2.png'),
      require('../assets/styles/burst-fade/ref_3.png'),
      require('../assets/styles/burst-fade/ref_4.png'),
    ],
  },
  {
    id: 'drop-fade',
    name: 'Drop Fade',
    category: 'fade',
    tagline: 'Follows the head shape',
    description:
      'A fade that drops lower behind the ear, following the curve of the head for a rounded, modern silhouette.',
    bestFaceShapes: ['oval', 'square', 'oblong', 'diamond'],
    bestHairTypes: ['1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A'],
    maintenance: 'Every 2 weeks',
    difficulty: 'advanced',
    barberInstructions: [
      'Drop fade that arcs down behind the ears',
      'Follow the natural head shape',
      'Blend cleanly into the top',
    ],
    tryOnPrompt:
      'a drop fade: the fade line drops lower behind the ears following the curve of the head, blended into styled length on top',
    thumbnail: require('../assets/styles/drop-fade/thumb.png'),
    referenceImages: [
      require('../assets/styles/drop-fade/ref_1.png'),
      require('../assets/styles/drop-fade/ref_2.png'),
      require('../assets/styles/drop-fade/ref_3.png'),
      require('../assets/styles/drop-fade/ref_4.png'),
    ],
  },
  {
    id: 'textured-crop',
    name: 'Textured Crop',
    category: 'crop',
    tagline: 'Messy texture, low effort',
    description:
      'Short, textured length on top styled forward, usually with a fade on the sides. Modern, easy to style, and flattering on most people.',
    bestFaceShapes: ['oval', 'square', 'oblong', 'diamond'],
    bestHairTypes: ['1B', '1C', '2A', '2B', '2C', '3A', '3B'],
    maintenance: 'Every 3-4 weeks',
    difficulty: 'easy',
    barberInstructions: [
      'Textured crop, choppy length on top styled forward',
      'Fade or taper on the sides',
      'Optional short fringe at the front',
    ],
    tryOnPrompt:
      'a textured crop: short choppy textured hair on top styled forward with a small fringe, faded sides, modern and messy',
    thumbnail: require('../assets/styles/textured-crop/thumb.png'),
    referenceImages: [
      require('../assets/styles/textured-crop/ref_1.png'),
      require('../assets/styles/textured-crop/ref_2.png'),
      require('../assets/styles/textured-crop/ref_3.png'),
      require('../assets/styles/textured-crop/ref_4.png'),
    ],
  },
  {
    id: 'french-crop',
    name: 'French Crop',
    category: 'crop',
    tagline: 'Short fringe, clean lines',
    description:
      'A short cut with a blunt fringe across the forehead and faded or tapered sides. Timeless, tidy, and great for thinning or fine hair.',
    bestFaceShapes: ['oval', 'oblong', 'square', 'heart'],
    bestHairTypes: ['1A', '1B', '1C', '2A', '2B', '3A'],
    maintenance: 'Every 3-4 weeks',
    difficulty: 'easy',
    barberInstructions: [
      'French crop with a short blunt fringe',
      'Fade or taper the sides',
      'Keep the fringe forward and even',
    ],
    tryOnPrompt:
      'a French crop: short hair on top with a straight blunt fringe across the forehead and neatly faded sides',
    thumbnail: require('../assets/styles/french-crop/thumb.png'),
    referenceImages: [
      require('../assets/styles/french-crop/ref_1.png'),
      require('../assets/styles/french-crop/ref_2.png'),
      require('../assets/styles/french-crop/ref_3.png'),
      require('../assets/styles/french-crop/ref_4.png'),
    ],
  },
  {
    id: 'buzz-cut',
    name: 'Buzz Cut',
    category: 'buzz',
    tagline: 'Ultra low-maintenance',
    description:
      'One short length all over. The simplest, cleanest, most masculine cut there is — zero styling required.',
    bestFaceShapes: ['oval', 'square', 'diamond'],
    bestHairTypes: ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C'],
    maintenance: 'Every 2-3 weeks',
    difficulty: 'easy',
    barberInstructions: [
      'Buzz cut, one guard length all over (e.g. a #2)',
      'Optionally add a subtle taper at the edges',
      'Clean up the neckline and around the ears',
    ],
    tryOnPrompt:
      'a buzz cut: very short uniform hair all over the head, clean and even, low maintenance',
    thumbnail: require('../assets/styles/buzz-cut/thumb.png'),
    referenceImages: [
      require('../assets/styles/buzz-cut/ref_1.png'),
      require('../assets/styles/buzz-cut/ref_2.png'),
      require('../assets/styles/buzz-cut/ref_3.png'),
      require('../assets/styles/buzz-cut/ref_4.png'),
    ],
  },
  {
    id: 'crew-cut',
    name: 'Crew Cut',
    category: 'buzz',
    tagline: 'A touch more length than a buzz',
    description:
      'Short and tidy with slightly more length at the front than the back. Clean, classic, and effortless to maintain.',
    bestFaceShapes: ['oval', 'square', 'oblong', 'diamond'],
    bestHairTypes: ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B'],
    maintenance: 'Every 2-3 weeks',
    difficulty: 'easy',
    barberInstructions: [
      'Crew cut, short with slightly more length at the front',
      'Taper or fade the sides',
      'Keep it tidy and even',
    ],
    tryOnPrompt:
      'a crew cut: short neat hair, slightly longer at the front and tapering shorter toward the back and sides',
    thumbnail: require('../assets/styles/crew-cut/thumb.png'),
    referenceImages: [
      require('../assets/styles/crew-cut/ref_1.png'),
      require('../assets/styles/crew-cut/ref_2.png'),
      require('../assets/styles/crew-cut/ref_3.png'),
      require('../assets/styles/crew-cut/ref_4.png'),
    ],
  },
  {
    id: 'classic-side-part',
    name: 'Classic Side Part',
    category: 'classic',
    tagline: 'Timeless and professional',
    description:
      'A clean part with the hair combed neatly to one side. Sharp, professional, and never out of style.',
    bestFaceShapes: ['oval', 'round', 'square', 'heart'],
    bestHairTypes: ['1A', '1B', '1C', '2A', '2B'],
    maintenance: 'Every 3-4 weeks',
    difficulty: 'medium',
    barberInstructions: [
      'Classic side part with a defined parting line',
      'Length on top to comb over, tapered sides',
      'Optional hard part line',
    ],
    tryOnPrompt:
      'a classic side part: hair combed neatly to one side with a defined part line and tapered sides, polished and professional',
    thumbnail: require('../assets/styles/classic-side-part/thumb.png'),
    referenceImages: [
      require('../assets/styles/classic-side-part/ref_1.png'),
      require('../assets/styles/classic-side-part/ref_2.png'),
      require('../assets/styles/classic-side-part/ref_3.png'),
      require('../assets/styles/classic-side-part/ref_4.png'),
    ],
  },
  {
    id: 'modern-quiff',
    name: 'Modern Quiff',
    category: 'quiff',
    tagline: 'Volume swept up and back',
    description:
      'Length on top styled up and back for height and volume, with shorter faded sides. Adds presence and works great with fuller hair.',
    bestFaceShapes: ['oval', 'square', 'round', 'diamond'],
    bestHairTypes: ['1B', '1C', '2A', '2B', '2C', '3A'],
    maintenance: 'Every 3 weeks',
    difficulty: 'medium',
    barberInstructions: [
      'Modern quiff, keep length on top to style up and back',
      'Fade or taper the sides',
      'Point-cut the top for movement',
    ],
    tryOnPrompt:
      'a modern quiff: hair on top styled upward and back with volume and height at the front, faded sides',
    thumbnail: require('../assets/styles/modern-quiff/thumb.png'),
    referenceImages: [
      require('../assets/styles/modern-quiff/ref_1.png'),
      require('../assets/styles/modern-quiff/ref_2.png'),
      require('../assets/styles/modern-quiff/ref_3.png'),
      require('../assets/styles/modern-quiff/ref_4.png'),
    ],
  },
  {
    id: 'pompadour',
    name: 'Pompadour',
    category: 'pompadour',
    tagline: 'Bold vintage volume',
    description:
      'Big volume swept up and back off the forehead with shorter sides. A confident, retro-inspired statement look.',
    bestFaceShapes: ['oval', 'oblong', 'square', 'diamond'],
    bestHairTypes: ['1B', '1C', '2A', '2B', '2C'],
    maintenance: 'Every 2-3 weeks',
    difficulty: 'advanced',
    barberInstructions: [
      'Pompadour, keep significant length on top',
      'Fade or taper the sides for contrast',
      'Style with high volume swept up and back',
    ],
    tryOnPrompt:
      'a pompadour: high volume hair swept up and back off the forehead, shorter faded sides, bold and retro-inspired',
    thumbnail: require('../assets/styles/pompadour/thumb.png'),
    referenceImages: [
      require('../assets/styles/pompadour/ref_1.png'),
      require('../assets/styles/pompadour/ref_2.png'),
      require('../assets/styles/pompadour/ref_3.png'),
      require('../assets/styles/pompadour/ref_4.png'),
    ],
  },
  {
    id: 'textured-fringe',
    name: 'Textured Fringe',
    category: 'fringe',
    tagline: 'Forward flow, youthful',
    description:
      'Textured length styled forward into a soft fringe over the forehead, with faded or tapered sides. Fresh, casual, and easy.',
    bestFaceShapes: ['oval', 'oblong', 'square', 'heart'],
    bestHairTypes: ['1B', '1C', '2A', '2B', '2C', '3A', '3B'],
    maintenance: 'Every 3-4 weeks',
    difficulty: 'easy',
    barberInstructions: [
      'Textured fringe styled forward over the forehead',
      'Fade or taper the sides',
      'Add texture for a piecey, natural finish',
    ],
    tryOnPrompt:
      'a textured fringe: textured hair styled forward into a soft fringe across the forehead with faded sides',
    thumbnail: require('../assets/styles/textured-fringe/thumb.png'),
    referenceImages: [
      require('../assets/styles/textured-fringe/ref_1.png'),
      require('../assets/styles/textured-fringe/ref_2.png'),
      require('../assets/styles/textured-fringe/ref_3.png'),
      require('../assets/styles/textured-fringe/ref_4.png'),
    ],
  },
  {
    id: 'curly-top-fade',
    name: 'Curly Top + Fade',
    category: 'curly',
    tagline: 'Show off natural curls',
    description:
      'Keeps your natural curls with volume on top and a clean fade on the sides. Defined, modern, and made for textured hair.',
    bestFaceShapes: ['oval', 'square', 'diamond', 'heart'],
    bestHairTypes: ['3A', '3B', '3C', '4A', '4B'],
    maintenance: 'Every 2-3 weeks',
    difficulty: 'medium',
    barberInstructions: [
      'Keep the curls with volume on top',
      'Clean fade on the sides (mid or high)',
      'Define the curl pattern, avoid thinning it out',
    ],
    tryOnPrompt:
      'a curly top with a fade: natural curls kept with volume on top, sides cleanly faded, curl definition emphasized',
    thumbnail: require('../assets/styles/curly-top-fade/thumb.png'),
    referenceImages: [
      require('../assets/styles/curly-top-fade/ref_1.png'),
      require('../assets/styles/curly-top-fade/ref_2.png'),
      require('../assets/styles/curly-top-fade/ref_3.png'),
      require('../assets/styles/curly-top-fade/ref_4.png'),
    ],
  },
  {
    id: 'mid-length-flow',
    name: 'Mid-Length Flow',
    category: 'long',
    tagline: 'Relaxed, grown-out length',
    description:
      'Longer length swept back behind the ears for a relaxed, flowy look. Great if you want to grow it out with intention.',
    bestFaceShapes: ['oval', 'square', 'diamond'],
    bestHairTypes: ['1B', '1C', '2A', '2B', '2C', '3A', '3B'],
    maintenance: 'Every 5-8 weeks',
    difficulty: 'medium',
    barberInstructions: [
      'Mid-length flow, keep length to sweep back over the ears',
      'Light layering for movement',
      'Just tidy the neckline and ears, keep the length',
    ],
    tryOnPrompt:
      'a mid-length flow hairstyle: longer hair swept back behind the ears with natural movement and layers, relaxed and flowy',
    thumbnail: require('../assets/styles/mid-length-flow/thumb.png'),
    referenceImages: [
      require('../assets/styles/mid-length-flow/ref_1.png'),
      require('../assets/styles/mid-length-flow/ref_2.png'),
      require('../assets/styles/mid-length-flow/ref_3.png'),
      require('../assets/styles/mid-length-flow/ref_4.png'),
    ],
  },
];

export function getHaircutById(id: string): Haircut | undefined {
  return HAIRCUTS.find((h) => h.id === id);
}
