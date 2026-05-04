const sharp = require('sharp')
const path  = require('path')
const fs    = require('fs')

const SVG_PATH = path.join(__dirname, '../public/icon.svg')
const OUT_DIR  = path.join(__dirname, '../public')

const svg = fs.readFileSync(SVG_PATH)

async function generate() {
  for (const size of [192, 512]) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(OUT_DIR, `icon-${size}.png`))
    console.log(`✓ icon-${size}.png`)
  }
  // Apple touch icon 180x180
  await sharp(svg).resize(180, 180).png().toFile(path.join(OUT_DIR, 'apple-touch-icon.png'))
  console.log('✓ apple-touch-icon.png')
}

generate().catch(console.error)
