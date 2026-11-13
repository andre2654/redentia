/**
 * A home nova (31/10/2026): as frases do Agora no site e o relógio da B3.
 * Cada caso trava uma regra de produto: frase só com número de verdade, o
 * tempo do verbo certo (ao vivo, fechou hoje, último pregão), o feriado da B3
 * contando como bolsa fechada, a chamada única levando ao /assinar e os apps
 * com link de loja só quando estão na loja (desde 02/11/2026, o do iPhone).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fraseDaBolsa, fraseDaCarteira } from '../app/utils/homeAgora.ts'
import { momentoDaBolsa } from '../app/utils/pregaoB3.ts'
import { APPS_REDENTIA, emBreveDosApps, fraseDosApps, seloDoApp } from '../app/utils/appsRedentia.ts'

const ler = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')

test('o relógio da B3: aberta das 10h às 17h em dia de pregão, fechada no fim de semana e no feriado', () => {
  // horários em Brasília (UTC−3, sem horário de verão em 2026)
  assert.deepEqual(momentoDaBolsa(new Date('2026-10-30T14:20:00-03:00')), { estado: 'aberta', rotulo: 'Bolsa aberta', numerosDeHoje: true })
  assert.deepEqual(momentoDaBolsa(new Date('2026-10-30T09:30:00-03:00')), { estado: 'antes', rotulo: 'A bolsa abre às 10h', numerosDeHoje: false })
  assert.deepEqual(momentoDaBolsa(new Date('2026-10-30T18:05:00-03:00')), { estado: 'fechada', rotulo: 'Bolsa fechada', numerosDeHoje: true })
  // sábado e Finados (segunda, 02/11, feriado da B3)
  assert.equal(momentoDaBolsa(new Date('2026-10-31T11:00:00-03:00')).numerosDeHoje, false)
  assert.equal(momentoDaBolsa(new Date('2026-11-02T11:00:00-03:00')).estado, 'fechada')
  // o servidor roda em UTC: 23h de Brasília já é o dia seguinte lá, e a conta segue em São Paulo
  assert.equal(momentoDaBolsa(new Date('2026-10-31T02:00:00Z')).rotulo, 'Bolsa fechada') // 30/10 23h BRT
  assert.equal(momentoDaBolsa(new Date('2026-11-03T13:30:00Z')).estado, 'aberta') // 03/11 10h30 BRT
})

test('a frase da bolsa sai do Ibovespa de verdade; sem número, sem frase', () => {
  assert.equal(fraseDaBolsa(1.22), 'Bolsa em alta.')
  assert.equal(fraseDaBolsa(-0.75), 'Bolsa em queda.')
  assert.equal(fraseDaBolsa(0.1), 'Bolsa estável.')
  assert.equal(fraseDaBolsa(null), null)
  assert.equal(fraseDaBolsa(Number.NaN), null)
})

test('a carteira contra a bolsa: cada uma com o seu verbo, no tempo certo', () => {
  const aoVivo = { estado: 'aberta' as const, numerosDeHoje: true }
  const fechouHoje = { estado: 'fechada' as const, numerosDeHoje: true }
  const fimDeSemana = { estado: 'fechada' as const, numerosDeHoje: false }
  assert.equal(fraseDaCarteira(0.91, -0.4, aoVivo), 'Sua carteira sobe 0,91% hoje e a bolsa cai 0,40%.')
  assert.equal(fraseDaCarteira(-0.77, -1.06, fechouHoje), 'Sua carteira caiu 0,77% hoje e a bolsa caiu 1,06%.')
  assert.equal(fraseDaCarteira(0.58, -0.75, fimDeSemana), 'No último pregão, sua carteira subiu 0,58% e a bolsa caiu 0,75%.')
  assert.equal(fraseDaCarteira(0, 1.2, aoVivo), 'Sua carteira fica estável hoje e a bolsa sobe 1,20%.')
  assert.equal(fraseDaCarteira(0.5, null, aoVivo), 'Sua carteira sobe 0,50% hoje.')
  assert.equal(fraseDaCarteira(null, 1, aoVivo), null)
})

test('a chamada única abre o quiz do /assinar e não fala de preço', () => {
  const chamada = ler('app/components/home/HomeChamada.vue')
  // abre o quiz direto (01/11/2026): sem o segundo toque na página do plano
  assert.match(chamada, /to="\/assinar\?quiz=1&de=home"/)
  // a entrada não fala de preço (decisão do dono, 01/11/2026): ele vem no fim do quiz
  assert.doesNotMatch(chamada.slice(chamada.indexOf('<template>')), /19,99|dias grátis/)
  assert.match(chamada, /Qualquer banco ou corretora\./)
  // a linha dos aparelhos sai da fonte única, e o link da loja não mora na chamada
  assert.match(chamada, /fraseDosApps\(\)/)
  assert.doesNotMatch(chamada, /apps\.apple\.com/)
})

test('os apps: só o que está na App Store vira link; o resto diz "em breve" (02/11/2026)', () => {
  // conferido na API do iTunes em 02/11/2026: só o iPhone publicado
  assert.equal(APPS_REDENTIA.iphone.loja, 'https://apps.apple.com/br/app/id6823992050')
  assert.equal(APPS_REDENTIA.mac.loja, null)
  assert.equal(APPS_REDENTIA.watch.loja, null)
  assert.equal(fraseDosApps(), 'No site e no iPhone. Em breve no Mac e no Apple\u00a0Watch.')
  assert.equal(emBreveDosApps(), 'Em breve no Mac e no Apple\u00a0Watch')
  assert.deepEqual(seloDoApp('iphone'), { rotulo: 'Baixar na App Store', url: 'https://apps.apple.com/br/app/id6823992050' })
  assert.deepEqual(seloDoApp('mac'), { rotulo: 'Em breve no Mac', url: null })
  // quando a Apple aprovar, é uma linha: a frase e o selo acompanham sozinhos
  const todos = { ...APPS_REDENTIA, mac: { nome: 'Mac', loja: 'https://apps.apple.com/br/app/id1' }, watch: { nome: 'Apple\u00a0Watch', loja: 'https://apps.apple.com/br/app/id6823992050' } }
  assert.equal(fraseDosApps(todos), 'No site, no iPhone, no Mac e no Apple\u00a0Watch.')
  assert.equal(emBreveDosApps(todos), null)
  assert.equal(seloDoApp('mac', todos).url, 'https://apps.apple.com/br/app/id1')
  // a URL da loja só existe na fonte única: o herói e a chamada não a escrevem à mão
  for (const f of ['app/components/home/HomeChamada.vue', 'app/components/home/HomeHeroVisitante.vue', 'app/composables/useMercado.ts'])
    assert.doesNotMatch(ler(f), /apps\.apple\.com|Disponível na App Store/i, f)
  // o herói do visitante não fala de app nem de loja (11/11/2026, pedido do dono: "uma hero
  // melhor, que não fale de apps e que seja boa para trabalhar como CTA"): a ação é uma só, e
  // a chamada vai sem a linha dos aparelhos. A prova era o leque; desde 13/11/2026 é o filme de
  // lançamento, na largura da tela ("vamos trocar a hero ... para mostrar o nosso vídeo em full")
  const heroi = ler('app/components/home/HomeHeroVisitante.vue')
  const tela = heroi.slice(heroi.indexOf('<template>'), heroi.lastIndexOf('</template>'))
  assert.doesNotMatch(tela, /iPhone|Apple|App Store|\bMac\b|Watch|fraseDosApps|seloDoApp/)
  assert.match(tela, /<HomeChamada[^>]*sem-apps/)
  assert.match(tela, /<HomeFilme class="hhv__filme" @descer="descer" \/>/)
  assert.doesNotMatch(tela, /<HomeLeque\b/)
  assert.equal((tela.match(/<HomeChamada\b/g) ?? []).length, 1)
  // o filme vem antes do título: ele abre a página, e o H1 segue logo depois dele no HTML
  assert.ok(tela.indexOf('<HomeFilme') < tela.indexOf('<h1 '), 'o filme abre o herói')
  // a linha de luz acende com a rolagem da PÁGINA: o herói recorta com `clip` (com `hidden` ele virava a caixa de
  // rolagem do horizonte, e a linha ficava travada a meia-luz)
  assert.match(heroi, /\.hhv__horizonte \{ animation: hhv-acende linear both; animation-timeline: view\(\);/)
  assert.match(heroi, /position: relative; isolation: isolate; overflow: hidden; overflow: clip;/)
})

test('a home tem um H1 por variante e as três seções que o dono tirou não voltam', () => {
  const visitante = ler('app/components/home/HomeHeroVisitante.vue')
  assert.equal((visitante.match(/<h1\b/g) ?? []).length, 1)
  // o número vai num <span> (cobalto): a frase é conferida sem as tags
  assert.match(visitante.replace(/<[^>]+>/g, ''), /Simulamos a sua carteira em 2\.000 cenários para ver se ela é boa\./)
  const conteudo = ler('app/components/home/HomeContent.vue')
  for (const saiu of ['MercadoHeroPergunta', 'MercadoCarteiraConectada', 'NuTeseStrip'])
    assert.doesNotMatch(conteudo, new RegExp(`<${saiu}\\b`), saiu)
  assert.match(ler('app/pages/index.vue'), /<HomeContent \/>/)
})

test('a home fala Aportou: nenhum texto visível diz Redentia e nenhuma peça escreve cor em hex (11/11/2026)', () => {
  // o contrato da marca (docs/aportou/contrato.md): o produto do investidor se chama Aportou, e
  // componente só usa var(--nu-*). O HomeLosango é o desenho da marca antiga (segue no dev e na
  // /carteira antiga, fora da home) e não entra na conta.
  const pecas = ['HomeAgoraFrase', 'HomeBolsa', 'HomeBolsaMercados', 'HomeChamada', 'HomeComoFunciona', 'HomeContent', 'HomeFecho', 'HomeFilme', 'HomeHeroVisitante', 'HomeLeque', 'HomeMais', 'HomeOQueNaoE', 'HomeRankings', 'HomeTermo']
  for (const p of pecas) {
    const sfc = ler(`app/components/home/${p}.vue`)
    const tela = sfc.slice(sfc.indexOf('<template>'), sfc.lastIndexOf('</template>')).replace(/<!--[\s\S]*?-->/g, '')
    assert.doesNotMatch(tela, /Redentia/, `${p}: texto de tela`)
    const estilo = sfc.slice(sfc.lastIndexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '')
    assert.doesNotMatch(estilo, /#[0-9a-f]{3,8}\b/i, `${p}: cor em hex`)
  }
  // as perguntas da home e a linha do fechamento (useMercado) e a assinatura da leitura (bolsaDoDia)
  const mercado = ler('app/composables/useMercado.ts')
  assert.doesNotMatch(mercado.slice(mercado.indexOf('export const MERCADO_FAQS')), /Redentia/)
  assert.match(mercado, /q: 'Quanto custa a Aportou\?'/)
  assert.match(mercado, /a IA da Aportou escreve o fechamento/)
  assert.match(ler('app/utils/bolsaDoDia.ts'), /`IA da Aportou · /)
  // o head da página não escreve a marca à mão: o nome vem de MARCA
  const pagina = ler('app/pages/index.vue')
  assert.match(pagina, /name: MARCA\.nome/)
  assert.doesNotMatch(pagina.slice(pagina.indexOf('usePageSeo(')), /Redentia|'Aportou'/)
  // o cartão "Seus dados" só afirma o que o site sustenta: a exclusão de conta ficou de fora
  const naoE = ler('app/components/home/HomeOQueNaoE.vue')
  assert.doesNotMatch(naoE.slice(naoE.indexOf('<template>')), /apaga a conta/)
})
