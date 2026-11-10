/**
 * GET /api/cron/indexnow — o modo diário do scripts/indexnow.mjs.
 *
 * A Vercel chama isto todo dia (vercel.json, AGENDA_CRON = 17 11 * * * UTC,
 * 08:17 em São Paulo). O GitHub Actions não serve: o schedule só dispara se
 * o workflow estiver no branch padrão (main), e a produção sai de redentia-v2.
 * Cron diário está incluído em todos os planos da Vercel; não é serviço novo.
 *
 * Segredo: se CRON_SECRET existir no projeto (Production), a Vercel manda
 * Authorization: Bearer <valor> e só isso passa. A env fica na Vercel, nunca
 * no repo. Sem ela, aceita a chamada do cron (x-vercel-cron-schedule igual à
 * expressão). A rota não aceita --tudo.
 */
import { AGENDA_CRON, cronAutorizado, executar } from '../../../scripts/indexnow.mjs'

export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'private, no-store')
  const ok = cronAutorizado({
    authorization: getHeader(event, 'authorization') ?? '',
    cronSchedule: getHeader(event, 'x-vercel-cron-schedule') ?? '',
    segredo: process.env.CRON_SECRET ?? '',
    agendaEsperada: AGENDA_CRON,
  })
  if (!ok) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  try {
    return await executar({ diario: true })
  } catch (e) {
    throw createError({
      statusCode: 502,
      statusMessage: e instanceof Error ? e.message : 'IndexNow falhou',
    })
  }
})
