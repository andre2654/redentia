/**
 * POST /api/newsletter {email, origem, site} — inscreve na newsletter semanal,
 * que mora no beehiiv (21/10/2026). A chave fica só no servidor
 * (runtimeConfig.beehiivApiKey); o navegador fala com esta rota.
 *
 *  - `site` é a isca para robô do formulário: veio preenchido, responde ok e
 *    não inscreve ninguém (robô que recebe erro tenta de novo);
 *  - `origem` vira utm_campaign ('preco-teto'), para saber de onde veio cada
 *    assinante (meta do plano: 300 até jan/2027, com a origem de cada um);
 *  - double opt-in, boas-vindas e descadastro ficam com o beehiiv (a
 *    confirmação segue o padrão da publicação).
 *
 * Respostas: 200 {ok:true}; 400 e-mail inválido; 503 sem a conta ligada
 * (NUXT_BEEHIIV_API_KEY e NUXT_BEEHIIV_PUBLICATION_ID); 502 o beehiiv recusou.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'private, no-store')
  const body = (await readBody<{ email?: unknown; origem?: unknown; site?: unknown }>(event).catch(() => null)) ?? {}
  if (typeof body.site === 'string' && body.site.trim() !== '') return { ok: true }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (email.length > 254 || !EMAIL.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'E-mail inválido' })
  }
  const origem = typeof body.origem === 'string' && /^[a-z0-9-]{1,40}$/.test(body.origem) ? body.origem : 'site'

  const { beehiivApiKey, beehiivPublicationId } = useRuntimeConfig()
  if (!beehiivApiKey || !beehiivPublicationId) {
    throw createError({ statusCode: 503, statusMessage: 'Newsletter desligada' })
  }

  try {
    await $fetch(`https://api.beehiiv.com/v2/publications/${encodeURIComponent(String(beehiivPublicationId))}/subscriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${beehiivApiKey}`, Accept: 'application/json' },
      body: {
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: 'redentia',
        utm_medium: 'site',
        utm_campaign: origem,
        referring_site: 'https://www.redentia.com.br',
      },
      timeout: 10_000,
    })
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'Não deu para inscrever agora' })
  }
  return { ok: true }
})
