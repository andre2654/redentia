#!/usr/bin/env node
/**
 * Gera o set completo de ícones PWA a partir do logo do brand.
 *
 * Saídas (em Frontend/public/icons/):
 *   - 192.png, 384.png, 512.png, 1024.png   (purpose=any)
 *   - maskable-192.png, maskable-512.png    (purpose=maskable, safe-zone 80%)
 *   - apple-touch-icon.png (180x180, sem alpha, bg=background_color)
 *   - shortcut-{today,wallet,chat,scan}.png (96x96, gradients de cor por contexto)
 *   - badge-72.png (72x72, monocromático pra notification badge)
 *
 * Também copia ícone 256 pra Frontend/public/widgets/icon-256.png (Win 11 widgets).
 *
 * Run: `node scripts/generate-pwa-icons.mjs`
 * Dependencies: sharp (já em node_modules via Nuxt)
 */
import sharp from 'sharp'
import { mkdir, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const SOURCE_PNG = resolve(root, 'public/brand/icon-512.png')          // 512x512 RGBA do brand
const SOURCE_SVG = resolve(root, 'public/brand/logo-icon.svg')         // vector fallback
const OUT_DIR = resolve(root, 'public/icons')
const WIDGETS_DIR = resolve(root, 'public/widgets')

const THEME_PRIMARY = '#D8881A'         // brand-primary (Redentia)
const BACKGROUND_COLOR = '#FAF8F4'       // brand-bg light (legado, mantido pra widget icon)
// Fundo dos ícones principais. O logo Redentia é monocromático branco
// (fill="white" no SVG), então precisa de fundo escuro pra contraste.
// `#0a0a0c` é o preto deep da identity v3 — mesmo do iPhone bezel no
// hero da /download. Evita preto puro 100% que fica "morto" no AMOLED.
const ICON_BACKGROUND = '#0a0a0c'

// Cores dos shortcuts — cada um tem um tom semântico
const SHORTCUT_COLORS = {
  today:  { bg: '#D8881A', icon: '#FFFFFF' },  // amber (brand primary)
  wallet: { bg: '#0A8E5C', icon: '#FFFFFF' },  // green (positive)
  chat:   { bg: '#2C5BFF', icon: '#FFFFFF' },  // blue (AI)
  scan:   { bg: '#7C3AED', icon: '#FFFFFF' },  // purple (analysis)
}

async function ensureDir(d) {
  if (!existsSync(d)) await mkdir(d, { recursive: true })
}

function pickSource() {
  if (existsSync(SOURCE_SVG)) return { path: SOURCE_SVG, type: 'svg' }
  if (existsSync(SOURCE_PNG)) return { path: SOURCE_PNG, type: 'png' }
  throw new Error(`No source found at ${SOURCE_SVG} or ${SOURCE_PNG}`)
}

async function generateMainIcons(source) {
  // Ícone principal: logo branco SOBRE fundo escuro sólido, com padding
  // generoso (estilo Instagram/Twitter — "chip" reconhecível na grid de
  // apps em vez de logo flutuando solto).
  //
  // Padding 22% de cada lado = inner 56% do canvas. Funciona bem porque:
  //   - No app drawer do Android, ícones "chip" não-maskable ficam com
  //     este padding consistente com o resto do sistema.
  //   - Em maskable separado (gerador abaixo) o OS pode croppar com
  //     safe-zone, então maskable usa um inner maior.
  const sizes = [192, 384, 512, 1024]
  for (const size of sizes) {
    const out = resolve(OUT_DIR, `${size}.png`)
    const inner = Math.round(size * 0.56)
    const padding = Math.round((size - inner) / 2)

    const innerBuffer = await (source.type === 'svg'
      ? sharp(source.path, { density: Math.max(72, Math.round(inner / 2)) })
      : sharp(source.path))
      .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()

    await sharp({
      create: { width: size, height: size, channels: 4, background: ICON_BACKGROUND },
    })
      .composite([{ input: innerBuffer, top: padding, left: padding }])
      .png({ compressionLevel: 9, palette: false })
      .toFile(out)
    console.log(`  ✓ ${size}.png`)
  }
}

async function generateMaskable(source) {
  // Maskable safe-zone: logo dentro de 80% (padding 10% de cada lado).
  // Background sólido (não transparente) pra OS croppar limpo.
  const sizes = [192, 512]
  for (const size of sizes) {
    const inner = Math.round(size * 0.7)  // safe-zone 70% (mais conservador)
    const padding = Math.round((size - inner) / 2)
    const out = resolve(OUT_DIR, `maskable-${size}.png`)

    const innerBuffer = await (source.type === 'svg'
      ? sharp(source.path, { density: Math.max(72, inner / 2) })
      : sharp(source.path))
      .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: ICON_BACKGROUND,
      },
    })
      .composite([{ input: innerBuffer, top: padding, left: padding }])
      .png({ compressionLevel: 9 })
      .toFile(out)
    console.log(`  ✓ maskable-${size}.png`)
  }
}

async function generateAppleTouchIcon(source) {
  // Apple Touch Icon: 180×180, SEM ALPHA, bg=ICON_BACKGROUND (preto deep).
  // Apple sobrepoe um background branco se houver alpha → fica feio com
  // logo claro. Por isso channels:3 (RGB sem canal alpha).
  const out = resolve(OUT_DIR, 'apple-touch-icon.png')
  const innerSize = Math.round(180 * 0.56)
  const padding = Math.round((180 - innerSize) / 2)
  const innerBuffer = await (source.type === 'svg'
    ? sharp(source.path, { density: 100 })
    : sharp(source.path))
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 3,
      background: ICON_BACKGROUND,
    },
  })
    .composite([{ input: innerBuffer, top: padding, left: padding }])
    .png({ compressionLevel: 9 })
    .toFile(out)
  console.log('  ✓ apple-touch-icon.png')
}

/**
 * Shortcut icons. Usa um quadrado sólido com cor da categoria como fundo
 * e o logo Redentia no centro. Resultado visual: chip colorido com letra
 * R no meio. Pra produção pode ser substituído por ícones lucide específicos
 * (today/wallet/chat/scan) com mesma cor de bg.
 */
async function generateShortcutIcons(source) {
  for (const [key, color] of Object.entries(SHORTCUT_COLORS)) {
    const out = resolve(OUT_DIR, `shortcut-${key}.png`)
    const inner = Math.round(96 * 0.6)
    const padding = Math.round((96 - inner) / 2)

    const innerBuffer = await (source.type === 'svg'
      ? sharp(source.path, { density: 100 })
      : sharp(source.path))
      .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()

    await sharp({
      create: { width: 96, height: 96, channels: 3, background: color.bg },
    })
      .composite([{ input: innerBuffer, top: padding, left: padding }])
      .png({ compressionLevel: 9 })
      .toFile(out)
    console.log(`  ✓ shortcut-${key}.png`)
  }
}

async function generateBadge(source) {
  // Badge: monocromático branco sobre fundo transparente, 72×72.
  // OSs (Win 11, Android) tingem automaticamente.
  const out = resolve(OUT_DIR, 'badge-72.png')
  await (source.type === 'svg'
    ? sharp(source.path, { density: 80 })
    : sharp(source.path))
    .resize(72, 72, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    // Monochrome via grayscale + threshold (preto vira branco em flag)
    .grayscale()
    .threshold(128)
    .negate({ alpha: false })
    .png()
    .toFile(out)
  console.log('  ✓ badge-72.png')
}

async function generateWidgetIcon(source) {
  // 256x256 PNG pra Adaptive Cards (Win 11 widget icon).
  await ensureDir(WIDGETS_DIR)
  const out = resolve(WIDGETS_DIR, 'icon-256.png')
  await (source.type === 'svg'
    ? sharp(source.path, { density: 150 })
    : sharp(source.path))
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(out)
  console.log(`  ✓ widgets/icon-256.png`)
}

async function main() {
  await ensureDir(OUT_DIR)
  const source = pickSource()
  console.log(`📌 source: ${source.path} (${source.type})\n`)

  console.log('🎨 Main icons (purpose=any)')
  await generateMainIcons(source)

  console.log('\n🎭 Maskable icons (safe-zone 70%)')
  await generateMaskable(source)

  console.log('\n🍎 Apple Touch Icon (no alpha)')
  await generateAppleTouchIcon(source)

  console.log('\n🔗 Shortcut icons (4 categorias)')
  await generateShortcutIcons(source)

  console.log('\n🔔 Notification badge')
  await generateBadge(source)

  console.log('\n🪟 Widget icon (Win 11)')
  await generateWidgetIcon(source)

  console.log('\n✅ Tudo gerado em', OUT_DIR)
}

main().catch((err) => {
  console.error('💥', err)
  process.exit(1)
})
