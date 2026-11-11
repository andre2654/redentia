/**
 * PNG do gráfico no runtime da Vercel.
 *
 * O binário nativo de @resvg/resvg-js carregava, e a função quebrava no
 * passo seguinte: o bundle reescreve import.meta.url para o index da
 * função, e `../../public/fonts` aponta para `.vercel/output/public/fonts`,
 * pasta que não existe. A fonte pública mora em `static/fonts`, fora da
 * função. O WASM entra com o arquivo `.wasm` lido pelo nome do pacote
 * (traceInclude), e a Plus Jakarta Sans entra como server asset
 * (`assets:fonts`), sem caminho de disco relativo.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { initWasm, Resvg } from '@resvg/resvg-wasm'
import type { Grafico } from '../../app/utils/graficos.ts'
import { svgDoGrafico } from '../../app/utils/graficos-svg.ts'

const require = createRequire(import.meta.url)

let wasm: Promise<void> | null = null

function iniciarWasm(): Promise<void> {
  if (!wasm) {
    wasm = initWasm(readFileSync(require.resolve('@resvg/resvg-wasm/index_bg.wasm'))).catch((erro) => {
      wasm = null
      throw erro
    })
  }
  return wasm
}

function paraBytes(raw: unknown): Uint8Array | null {
  if (raw instanceof Uint8Array) return raw
  if (raw instanceof ArrayBuffer) return new Uint8Array(raw)
  return null
}

/** No Nitro, a fonte vem do server asset. No teste, do arquivo do repositório. */
export async function bytesDaFonte(): Promise<Uint8Array> {
  if (typeof useStorage === 'function') {
    const raw = await useStorage('assets:fonts').getItemRaw('plus-jakarta-sans-latin.woff2')
    const bytes = paraBytes(raw)
    if (bytes && bytes.byteLength > 0) return bytes
    throw new Error('fonte do gráfico ausente no bundle')
  }
  return new Uint8Array(readFileSync(fileURLToPath(new URL('../../public/fonts/plus-jakarta-sans-latin.woff2', import.meta.url))))
}

export async function pngDoGrafico(g: Grafico, fonte?: Uint8Array): Promise<Buffer> {
  await iniciarWasm()
  const bytes = fonte ?? await bytesDaFonte()
  const { svg } = svgDoGrafico(g)
  const resvg = new Resvg(svg, {
    font: {
      fontBuffers: [bytes],
      defaultFontFamily: 'Plus Jakarta Sans',
    },
    background: '#f5f1ea',
    fitTo: { mode: 'original' },
  })
  try {
    const imagem = resvg.render()
    try {
      return Buffer.from(imagem.asPng())
    } finally {
      imagem.free()
    }
  } finally {
    resvg.free()
  }
}
