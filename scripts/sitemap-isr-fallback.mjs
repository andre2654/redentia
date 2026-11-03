/**
 * Depois do `nuxt build` na Vercel: cada rota ISR de sitemap (o índice e
 * todos os /sitemaps/{tipo}.xml) ganha um fallback estático com a semente
 * do build.
 *
 * O primeiro acesso (cache da deployment ainda vazio) sai da borda, sem
 * esperar a função. A função, quando roda, também devolve essa cópia na hora
 * e renova no waitUntil. Sem o diretório da Vercel (build local) não faz nada.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FUNCOES = join(ROOT, '.vercel/output/functions')

function acharConfigs(dir, alvos, achados = []) {
  if (!existsSync(dir)) return achados
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    const st = statSync(caminho)
    if (st.isDirectory()) {
      if (nome.endsWith('.func')) continue
      acharConfigs(caminho, alvos, achados)
      continue
    }
    if (!nome.endsWith('.prerender-config.json')) continue
    // Só o xml. O _payload.json da mesma rota não leva o XML.
    if (alvos.has(nome)) achados.push(caminho)
  }
  return achados
}

async function main() {
  const jiti = createJiti(import.meta.url, { interopDefault: true })
  const xml = await jiti.import('../server/utils/sitemap-xml.ts')
  const alvos = new Map(
    [...xml.SITEMAP_ORDEM, xml.SITEMAP_INDICE].map((tipo) => [
      `${xml.arquivoDoSitemap(tipo)}-isr.prerender-config.json`,
      tipo,
    ]),
  )
  const configs = acharConfigs(FUNCOES, alvos)
  if (!configs.length) {
    console.log('sitemap ISR: sem prerender-config da Vercel, nada a fazer')
    return
  }
  const { SEMENTES_SITEMAP } = await jiti.import('../server/data/sitemap-semente.ts')
  const { configIsrComFallback } = await jiti.import('../server/utils/sitemap-cache.ts')
  for (const configPath of configs) {
    const nome = basename(configPath)
    const tipo = alvos.get(nome)
    const semente = SEMENTES_SITEMAP?.[tipo]
    if (!semente?.xml?.includes('<loc>')) {
      console.warn(`sitemap ISR: sem semente para ${configPath}`)
      continue
    }
    const arquivo = `${xml.arquivoDoSitemap(tipo)}-isr.prerender-fallback.xml`
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
