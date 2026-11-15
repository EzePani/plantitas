// Genera los íconos PNG de la PWA a partir de public/favicon.svg
import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const svg = readFileSync('public/favicon.svg')
const cuadrado = Buffer.from(svg.toString().replace('rx="112"', 'rx="0"'))

await sharp(svg).resize(192, 192).png().toFile('public/pwa-192.png')
await sharp(svg).resize(512, 512).png().toFile('public/pwa-512.png')
await sharp(cuadrado).resize(180, 180).png().toFile('public/apple-touch-icon.png')
// Maskable: el dibujo ocupa la zona segura (80%) sobre fondo pleno
const interior = await sharp(cuadrado).resize(400, 400).png().toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#2f7d4a' } })
  .composite([{ input: interior, gravity: 'center' }])
  .png()
  .toFile('public/pwa-maskable-512.png')
console.log('Íconos generados en public/')
