/**
 * PNG do gráfico: o SVG vira bitmap com a Plus Jakarta Sans já publicada
 * em /fonts (woff2 → ttf na hora, uma vez por processo). Sem cookie e sem
 * fonte de terceiro: a resposta é o arquivo.
 */
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Grafico } from '../../app/utils/graficos.ts'
import { svgDoGrafico } from '../../app/utils/graficos-svg.ts'

const require = createRequire(import.meta.url)

let fontePronta: Promise<string> | null = null

function caminhoFonte(): Promise<string> {
  if (!fontePronta) {
    fontePronta = (async () => {
      const { decompress } = require('wawoff2') as { decompress: (b: Buffer) => Promise<Uint8Array> }
      const woff = readFileSync(fileURLToPath(new URL('../../public/fonts/plus-jakarta-sans-latin.woff2', import.meta.url)))
      const ttf = Buffer.from(await decompress(woff))
      const destino = join(tmpdir(), 'redentia-plus-jakarta-sans.ttf')
      writeFileSync(destino, ttf)
      return destino
    })()
  }
  return fontePronta
}

export async function pngDoGrafico(g: Grafico): Promise<Buffer> {
  const { Resvg } = require('@resvg/resvg-js') as typeof import('@resvg/resvg-js')
  const { svg } = svgDoGrafico(g)
  const fonte = await caminhoFonte()
  const resvg = new Resvg(svg, {
    font: {
      fontFiles: [fonte],
      loadSystemFonts: false,
      defaultFontFamily: 'Plus Jakarta Sans',
    },
    background: '#f5f1ea',
    fitTo: { mode: 'original' },
  })
  return resvg.render().asPng()
}
