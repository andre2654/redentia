/**
 * Os plugins de analytics e o consentimento: GA4, Clarity, GTM e a Insight Tag
 * só depois do aceite; a Vercel (anônima, sem cookie) entra sem ele.
 *
 * Até 12/11/2026 este teste também travava as rotas com token no caminho
 * (SEC-01, 07/10/2026: o convite e o acesso do cliente do escritório e o
 * convite de chave), em que nenhum script de terceiro podia carregar. Essas
 * rotas eram do B2B e saíram com ele (redirecionam para redentia.com.br, ver
 * tests/destino-b2b.test.ts); a guarda saiu junto.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('os plugins de analytics esperam o consentimento, menos o da Vercel', () => {
  // Vercel Web Analytics não grava cookie e não identifica a pessoa: entra
  // sem o aceite. GA4, Clarity, GTM e a Insight Tag continuam no portão.
  const vercel = readFileSync(new URL('../app/plugins/vercel-analytics.client.ts', import.meta.url), 'utf8')
  assert.match(vercel, /\n  instalar\(\)/, 'o script da Vercel não é chamado direto')
  assert.doesNotMatch(vercel, /agendarComConsentimento\(/, 'o script da Vercel voltou a esperar o consentimento')
  assert.doesNotMatch(vercel, /lerConsentimento\(/, 'o script da Vercel voltou a checar o consentimento')
  for (const f of [
    'google-analytics.client.ts',
    'clarity.client.ts',
    'google-tag-manager.ts',
    'linkedin-insight.client.ts',
  ]) {
    const src = readFileSync(new URL(`../app/plugins/${f}`, import.meta.url), 'utf8')
    assert.match(src, /agendarComConsentimento\(/, `${f} não espera o consentimento`)
    assert.match(src, /lerConsentimento\(\)/, `${f} não relê a escolha na hora de injetar`)
  }
  const gtm = readFileSync(new URL('../app/plugins/google-tag-manager.ts', import.meta.url), 'utf8')
  assert.match(gtm, /consentimentoNoCookie\([^)]*\) === 'granted'/, 'o noscript do GTM precisa do cookie de aceite')
  assert.match(gtm, /pagoNaHora:\s*true/, 'visita paga deixa de entrar na hora depois do aceite')

  const linkedin = readFileSync(new URL('../app/plugins/linkedin-insight.client.ts', import.meta.url), 'utf8')
  assert.match(linkedin, /if \(!partnerId/, 'sem Partner ID a Insight Tag não pode carregar')
  assert.match(linkedin, /snap\.licdn\.com/)
  assert.doesNotMatch(linkedin, /src\s*=\s*['"]https:\/\/px\.ads\.linkedin\.com/, 'o pixel noscript não pode estar no HTML')
  const cfg = readFileSync(new URL('../nuxt.config.ts', import.meta.url), 'utf8')
  assert.match(cfg, /linkedinPartnerId:[\s\S]*?'11192545'/)
})

test('a política de cookies declara a medição da Vercel fora do aceite', () => {
  const src = readFileSync(new URL('../app/pages/institucional/cookies.vue', import.meta.url), 'utf8')
  assert.match(src, /updated: '2026-10-29'/)
  assert.match(src, /A medição anônima e agregada de audiência é feita pela Vercel \(Vercel Web Analytics\)/)
  assert.match(src, /Ela não usa cookies e não identifica a pessoa/)
  assert.match(src, /Roda sem o aceite, com base no legítimo interesse \(LGPD, art\. 7º, IX\)/)
  assert.match(src, /Google Analytics, Microsoft Clarity, Google Tag Manager e LinkedIn Insight\) só rodam após o aceite/)
  assert.doesNotMatch(src, /só carrega depois do Aceitar/)
})

test('a chave na tela vai mascarada para o Clarity', () => {
  for (const f of [
    'components/conta/ContaMcp.vue',
  ]) {
    const src = readFileSync(new URL(`../app/${f}`, import.meta.url), 'utf8')
    const codes = src.match(/<code class="[^"]*(?:__code|__link-code|__key)"[^>]*>/g) ?? []
    assert.ok(codes.length > 0, `${f}: nenhum <code> de segredo achado`)
    for (const c of codes) assert.match(c, /data-clarity-mask="true"/, `${f}: ${c}`)
  }
  // o wizard de conexão (a /mcp e a /conta) mostra a chave recém-gerada no passo 4
  const wizard = readFileSync(new URL('../app/components/mcp/McpConexaoModal.vue', import.meta.url), 'utf8')
  assert.match(wizard, /<pre class="rbcx__code rbcx__code--wrap" data-clarity-mask="true"><code>\{\{ plainKey \}\}<\/code><\/pre>/)
})
