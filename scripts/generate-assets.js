const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BACKGROUND_COLOR = '#0D0D0D';
const ACCENT_COLOR = '#00D4AA';

const assets = [
  { name: 'icon.png', width: 1024, height: 1024 },
  { name: 'adaptive-icon.png', width: 1024, height: 1024 },
  { name: 'splash.png', width: 1284, height: 2778 },
  { name: 'favicon.png', width: 48, height: 48 },
];

const outputDir = path.join(__dirname, '..', 'assets', 'images');

async function generateAssets() {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const asset of assets) {
    const outputPath = path.join(outputDir, asset.name);

    // Create a solid color image
    const svg = `
      <svg width="${asset.width}" height="${asset.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BACKGROUND_COLOR}"/>
        ${asset.name.includes('icon') || asset.name.includes('favicon') ? `
          <text
            x="50%"
            y="50%"
            font-family="Arial, sans-serif"
            font-size="${Math.floor(asset.width * 0.4)}"
            font-weight="bold"
            fill="${ACCENT_COLOR}"
            text-anchor="middle"
            dominant-baseline="middle"
          >FC</text>
        ` : `
          <text
            x="50%"
            y="50%"
            font-family="Arial, sans-serif"
            font-size="${Math.floor(asset.width * 0.15)}"
            font-weight="bold"
            fill="${ACCENT_COLOR}"
            text-anchor="middle"
            dominant-baseline="middle"
          >FadeCheck</text>
        `}
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`Generated: ${asset.name}`);
  }

  console.log('All assets generated successfully!');
}

generateAssets().catch(console.error);
