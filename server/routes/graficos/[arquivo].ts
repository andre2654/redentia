/**
 * GET /graficos/{id}.png — o bitmap do gráfico.
 * Sucesso: image/png, cache público de no máximo 24 h, sem cookie.
 * Falha de dado ou de raster: texto puro com no-store. Não devolve a página
 * HTML de erro (isso cachearia um 500 no lugar da imagem) e não quebra
 * /graficos, que não passa por aqui.
 */
import type { H3Event } from 'h3'
import { defineEventHandler, getRouterParam, setHeader, setResponseStatus } from 'h3'
import { ehGraficoId, type Grafico } from '../../../app/utils/graficos.ts'
import { carregarGrafico } from '../../utils/graficos-dados.ts'
import { pngDoGrafico } from '../../utils/graficos-png.ts'

const CACHE_PNG = 'public, max-age=86400, s-maxage=86400'

function texto(event: H3Event, status: number, mensagem: string) {
  setResponseStatus(event, status)
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'no-store')
  setHeader(event, 'x-content-type-options', 'nosniff')
  return mensagem
}

export async function responderGraficoPng(
  event: H3Event,
  grafico: Grafico | null,
  raster: (g: Grafico) => Promise<Buffer> = pngDoGrafico,
): Promise<Buffer | string> {
  if (!grafico) return texto(event, 404, 'Gráfico indisponível')
  let png: Buffer
  try {
    png = await raster(grafico)
  } catch {
    return texto(event, 503, 'Gráfico indisponível')
  }
  if (png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    return texto(event, 503, 'Gráfico indisponível')
  }
  setResponseStatus(event, 200)
  setHeader(event, 'content-type', 'image/png')
  setHeader(event, 'cache-control', CACHE_PNG)
  setHeader(event, 'content-disposition', `inline; filename="${grafico.id}.png"`)
  setHeader(event, 'x-content-type-options', 'nosniff')
  setHeader(event, 'cross-origin-resource-policy', 'cross-origin')
  return png
}

export default defineEventHandler(async (event) => {
  try {
    const arquivo = String(getRouterParam(event, 'arquivo') ?? '')
    const id = arquivo.endsWith('.png') ? arquivo.slice(0, -4) : ''
    if (!ehGraficoId(id)) return texto(event, 404, 'Gráfico não encontrado')
    const grafico = await carregarGrafico(id)
    return await responderGraficoPng(event, grafico)
  } catch {
    return texto(event, 503, 'Gráfico indisponível')
  }
})
