/**
 * Depois do `nuxt build` na Vercel: a rota ISR de dividendos.xml e
 * quanto-rende.xml ganha um fallback estático com a semente do build.
 *
 * O primeiro acesso (cache da deployment ainda vazio) sai da borda, sem
 * esperar a função. A função, quando roda, também devolve essa cópia na hora
 * e renova no waitUntil. Sem o diretório da Vercel (build local) não faz nada.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FUNCOES = join(ROOT, '.vercel/output/functions')
const TIPOS = ['dividendos', 'quanto-rende']

function acharConfigs(dir, achados = []) {
  if (!existsSync(dir)) return achados
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    const st = statSync(caminho)
    if (st.isDirectory()) {
      if (nome.endsWith('.func')) continue
      acharConfigs(caminho, achados)
      continue
    }
    if (!nome.endsWith('.prerender-config.json')) continue
    // Só o urlset. O _payload.json da mesma rota não leva o XML.
    if (TIPOS.some((tipo) => nome === `${tipo}.xml-isr.prerender-config.json`)) achados.push(caminho)
  }
  return achados
}

async function main() {
  const configs = acharConfigs(FUNCOES)
  if (!configs.length) {
    console.log('sitemap ISR: sem prerender-config da Vercel, nada a fazer')
    return
  }
  const jiti = createJiti(import.meta.url, { interopDefault: true })
  const { SEMENTES_SITEMAP } = await jiti.import('../server/data/sitemap-semente.ts')
  const { configIsrComFallback } = await jiti.import('../server/utils/sitemap-cache.ts')
  for (const configPath of configs) {
    const tipo = TIPOS.find((t) => configPath.includes(`${t}.xml`))
    const semente = SEMENTES_SITEMAP?.[tipo]
    if (!semente?.xml?.includes('<loc>')) {
      console.warn(`sitemap ISR: sem semente para ${configPath}`)
      continue
    }
    const arquivo = `${tipo}.xml-isr.prerender-fallback.xml`
    writeFileSync(join(dirname(configPath), arquivo), semente.xml)
    const config = JSON.parse(readFileSync(configPath, 'utf8'))
    writeFileSync(configPath, JSON.stringify(configIsrComFallback(config, arquivo), null, 2) + '\n')
    console.log(`sitemap ISR: fallback ${arquivo} (${semente.urls} urls)`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
