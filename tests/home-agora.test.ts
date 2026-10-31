/**
 * A home nova (31/10/2026): as frases do Agora no site e o relógio da B3.
 * Cada caso trava uma regra de produto: frase só com número de verdade, o
 * tempo do verbo certo (ao vivo, fechou hoje, último pregão), o feriado da B3
 * contando como bolsa fechada, e a chamada única levando ao /assinar sem
 * link de App Store (os apps ainda não estão na loja).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fraseDaAmplitude, fraseDaBolsa, fraseDaCarteira, numeroDoPct, pctDoResumo } from '../app/utils/homeAgora.ts'
import { momentoDaBolsa } from '../app/utils/pregaoB3.ts'

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
  assert.equal(numeroDoPct('+0,91%'), 0.91)
  assert.equal(numeroDoPct('-1,06%'), -1.06)
  assert.equal(numeroDoPct('−1,06%'), -1.06)
  assert.equal(numeroDoPct('—'), null)
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
  // o texto do resumo da carteira (loadCarteiraResumo) vira número com sinal
  assert.equal(pctDoResumo('+R$ 761,20 (0,91%) hoje'), 0.91)
  assert.equal(pctDoResumo('−R$ 1.243,60 (1,83%) hoje'), -1.83)
  assert.equal(pctDoResumo('R$ 10'), null)
  assert.equal(pctDoResumo(null), null)
})

test('a amplitude diz de quando é, e some sem contagem', () => {
  assert.equal(fraseDaAmplitude(17, 58), '17 ações do Ibovespa subiram e 58 caíram.')
  assert.equal(fraseDaAmplitude(1, 1), '1 ação do Ibovespa subiu e 1 caiu.')
  assert.equal(fraseDaAmplitude(17, 58, { numerosDeHoje: false }), 'No último pregão, 17 ações do Ibovespa subiram e 58 caíram.')
  assert.equal(fraseDaAmplitude(0, 0), null)
  assert.equal(fraseDaAmplitude(null, 3), null)
})

test('a chamada única leva ao /assinar e não promete App Store que ainda não existe', () => {
  const chamada = ler('app/components/home/HomeChamada.vue')
  assert.match(chamada, /to="\/assinar"/)
  assert.match(chamada, /3 dias grátis, depois R\$ 19,99 por mês\./)
  assert.match(chamada, /Em breve no iPhone, no Mac e no Apple&nbsp;Watch\./)
  for (const f of ['app/components/home/HomeChamada.vue', 'app/components/home/HomeAparelhos.vue', 'app/components/home/HomeHeroVisitante.vue', 'app/composables/useMercado.ts'])
    assert.doesNotMatch(ler(f), /apps\.apple\.com|Baixar na App Store|Disponível na App Store/i, f)
})

test('a home tem um H1 por variante e as três seções que o dono tirou não voltam', () => {
  const visitante = ler('app/components/home/HomeHeroVisitante.vue')
  assert.equal((visitante.match(/<h1\b/g) ?? []).length, 1)
  assert.match(visitante, /Simulamos a sua carteira em 2\.000 cenários para ver se ela é boa\./)
  const conteudo = ler('app/components/home/HomeContent.vue')
  for (const saiu of ['MercadoHeroPergunta', 'MercadoCarteiraConectada', 'NuTeseStrip'])
    assert.doesNotMatch(conteudo, new RegExp(`<${saiu}\\b`), saiu)
  assert.match(ler('app/pages/index.vue'), /<HomeContent \/>/)
})
