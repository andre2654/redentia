/**
 * GET /graficos/{id}.png — o bitmap do gráfico, gerado no servidor.
 * Cache de no máximo 24 h. 404 não entra nesse cache: uma falha da fonte
 * não pode ficar o dia inteiro no lugar da imagem.
 * Sem cookie e sem script. A imagem pode ser incorporada em outro site.
 */
import { ehGraficoId } from '../../../app/utils/graficos'
import { carregarGrafico } from '../../utils/graficos-dados'
import { pngDoGrafico } from '../../utils/graficos-png'

export default defineEventHandler(async (event) => {
  const arquivo = String(getRouterParam(event, 'arquivo') ?? '')
  const id = arquivo.endsWith('.png') ? arquivo.slice(0, -4) : ''
  if (!ehGraficoId(id)) {
    setHeader(event, 'cache-control', 'no-store')
    throw createError({ statusCode: 404, statusMessage: 'Gráfico não encontrado' })
  }
  const grafico = await carregarGrafico(id)
  if (!grafico) {
    setHeader(event, 'cache-control', 'no-store')
    throw createError({ statusCode: 404, statusMessage: 'Gráfico indisponível' })
  }
  const png = await pngDoGrafico(grafico)
  setHeader(event, 'content-type', 'image/png')
  setHeader(event, 'cache-control', 'public, max-age=86400, s-maxage=86400')
  setHeader(event, 'content-disposition', `inline; filename="${id}.png"`)
  setHeader(event, 'x-content-type-options', 'nosniff')
  setHeader(event, 'cross-origin-resource-policy', 'cross-origin')
  return png
})
