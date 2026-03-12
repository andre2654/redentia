/**
 * Exports all brand configs from brand.ts to JSON files.
 * Run: npx tsx scripts/export-brands.ts
 *
 * Output: ../Backend/storage/data/tenants/{slug}.json
 */
import { brands } from '../app/config/brand'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../../Backend/storage/data/tenants')
mkdirSync(outDir, { recursive: true })

for (const [slug, config] of Object.entries(brands)) {
  const filePath = resolve(outDir, `${slug}.json`)
  writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8')
  console.log(`Exported: ${slug} → ${filePath}`)
}

console.log(`\nDone! ${Object.keys(brands).length} tenants exported.`)
console.log('Now run: php artisan tenant:import')
