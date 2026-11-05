/**
 * A /business (05/11/2026, a variação 1 do print do dono com o scroll dos
 * quatro passos): o preço por faixa, a fila de aprovação contra o elenco da
 * conta interna das calls e a coerência entre a fila e os passos.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import {
  ATENDIMENTO, CARTEIRAS, CLIENTES_FORA, FILA, HERO, LOGOS_CLIENTES, NAV_BIZ_NOVA, PASSOS, PAUTA, PARA_QUEM, SEGURANCA,
  SEGURANCA_CLIENTE, SEGURANCA_IAS, SEGURANCA_LENTE, SEGURANCA_PERGUNTAS, SEGURANCA_PERMISSOES, SEGURANCA_REGISTRO,
  precoDaMesa, reaisCurtos, totalFora,
} from '../app/content/business/landing.ts'
import { clientActionLabel } from '../app/utils/clientes.ts'

const ler = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')

test('o preço da mesa reproduz os exemplos do contrato de 13/10', () => {
  assert.equal(precoDaMesa(1).total, 500)
  assert.equal(precoDaMesa(5).total, 2500)
  assert.equal(precoDaMesa(10).total, 5000)
  assert.equal(precoDaMesa(25).total, 9500)
  assert.equal(precoDaMesa(50).total, 14500)
  assert.equal(precoDaMesa(51).total, 14650)
})

test('a captação é a soma do elenco fora do BTG, e a fila diz o mesmo que o passo', () => {
  // Mariana (Nubank), Helena (Bradesco), Lucas (Itaú), Carolina (XP): elenco-calls.json.
  // O Backend é outro repositório: com ele ao lado (a máquina do dono), confere
  // valor a valor; sem ele (CI), vale a soma fixa abaixo.
  const arq = new URL('../../Backend/database/data/business/elenco-calls.json', import.meta.url)
  if (existsSync(arq)) {
    const elenco = JSON.parse(readFileSync(arq, 'utf8'))
    for (const c of elenco.clientes.filter((x: { instituicao: string }) => x.instituicao !== 'btg')) {
      const aqui = CLIENTES_FORA.find((f) => f.nome === c.nome)
      assert.ok(aqui, c.nome)
      assert.equal(aqui!.valor, c.patrimonio, c.nome)
    }
  }
  assert.equal(totalFora(), 525_000 + 1_284_330 + 842_615 + 2_317_940)
  assert.equal(reaisCurtos(totalFora()), 'R$ 4,97 mi')
  assert.equal(reaisCurtos(842_615), 'R$ 843 mil')
  const cap = FILA.itens.find((i) => i.id === 'captacao')!
  assert.equal(cap.titulo, 'R$ 4,97 mi fora do escritório, em 4 clientes')
  assert.equal(cap.linha, 'Maior: R$ 2,32 mi da Carolina na XP, 75% ligado ao dólar.')
  // a lista do passo vem do maior para o menor, e o maior é o da linha da fila
  const valores = CLIENTES_FORA.map((c) => c.valor)
  assert.deepEqual(valores, [...valores].sort((a, b) => b - a))
})

test('o fechamento da fila é a contagem das carteiras do passo, com uma faltando e o motivo', () => {
  const f = FILA.itens.find((i) => i.id === 'fechamento')!
  assert.equal(f.total, 7)
  assert.equal(f.feito, CARTEIRAS.filter((c) => c.ok).length)
  assert.equal(f.feito, 6)
  const falta = CARTEIRAS.filter((c) => !c.ok)
  assert.equal(falta.length, 1)
  assert.ok(falta[0]!.motivo && falta[0]!.motivo.length > 10)
})

test('reunião e atendimento: os nomes da fila são os dos passos', () => {
  const r = FILA.itens.find((i) => i.id === 'reuniao')!
  assert.ok(r.titulo.startsWith(PAUTA.cliente.split(' ')[0]!))
  assert.equal(PAUTA.itens.length, 3)
  const a = FILA.itens.find((i) => i.id === 'atendimento')!
  assert.equal(a.titulo, `“${ATENDIMENTO.pergunta}”`)
  assert.ok(a.linha!.startsWith(ATENDIMENTO.cliente.split(' ')[0]!))
})

test('um passo por item da fila, na mesma ordem, com uma frase de apoio só', () => {
  assert.deepEqual(PASSOS.map((p) => p.id), FILA.itens.map((i) => i.id))
  for (const p of PASSOS) {
    assert.equal(p.apoio.split(/[.!?](\s|$)/).filter((s) => s && s.trim()).length, 1, p.id)
    assert.ok(p.titulo.length <= 26, `${p.id}: título de uma linha`)
  }
  // o botão de cada item da fila é um link para o passo dele
  const fila = ler('app/components/business/nova/BizFila.vue')
  assert.match(fila, /:href="`#passo-\$\{it\.id\}`"/)
  assert.match(ler('app/components/business/nova/BizPassosCamera.vue'), /:id="`passo-\$\{p\.id\}`"/)
})

test('a página não diz demonstração, teste nem "sem comissão", e não promete resultado', () => {
  const tudo = JSON.stringify({ FILA, HERO, PASSOS, CLIENTES_FORA, CARTEIRAS, PAUTA, ATENDIMENTO, PARA_QUEM, SEGURANCA })
  assert.doesNotMatch(tudo, /demonstra|\bteste\b|exemplo|fictíci|simulad|sem comiss/i)
  assert.doesNotMatch(tudo, /economi[zs]e|horas? (a menos|por semana)|\d+% mais/i)
})

test('a nav aponta só para as âncoras da página e os logos começam ocultos', () => {
  assert.deepEqual(NAV_BIZ_NOVA.map((n) => n.to.split('#')[1]), ['agentes', 'para-quem', 'seguranca', 'prova'])
  const pagina = ler('app/components/business/nova/BizLanding.vue')
  for (const id of ['agentes', 'para-quem', 'seguranca', 'prova']) assert.match(pagina, new RegExp(`id="${id}"`), id)
  assert.equal(LOGOS_CLIENTES.length, 0)
})

test('o hero guarda a frase da implantação (CV-19)', () => {
  assert.equal(HERO.implantacao, 'Conexão habilitada escritório a escritório, na implantação.')
})

test('a página de antes e as variações do dev saíram', () => {
  for (const f of ['RbHero', 'RbDivisao', 'RbJornada', 'RbJornadaCard', 'RbSeguranca', 'RbProva'])
    assert.equal(existsSync(new URL(`../app/components/business/${f}.vue`, import.meta.url)), false, f)
  assert.equal(existsSync(new URL('../app/composables/useBizVariacao.ts', import.meta.url)), false)
  const pagina = ler('app/pages/business/index.vue').replace(/\/\*[\s\S]*?\*\//g, '')
  assert.doesNotMatch(pagina, /useBizVariacao|import\.meta\.dev|\bRb[A-Z]/)
  // a variante padrão do topo não lê a rota da /business
  assert.match(ler('app/components/nu/NuHeader.vue'), /business\.value && route\.path === '\/business'/)
})

test('os passos são a câmera dentro do produto, sem switch do dev, e as outras variações saíram', () => {
  const landing = ler('app/components/business/nova/BizLanding.vue')
  assert.match(landing, /<BizPassosCamera \/>/)
  assert.doesNotMatch(landing, /LazyBizPassos|variacaoDosPassos|route\.query\.passos/)
  for (const f of ['BizPassos', 'BizPassosDinheiro', 'BizPassosConversa'])
    assert.equal(existsSync(new URL(`../app/components/business/nova/${f}.vue`, import.meta.url)), false, f)
  assert.equal(existsSync(new URL('../public/business-hero/lounge.webp', import.meta.url)), false)
  const src = ler('app/components/business/nova/BizPassosCamera.vue')
  // cada passo é a âncora do botão da fila, e a mecânica (bzj:ir, régua, teclado) é a comum
  assert.match(src, /usePassosTravados\(/)
  assert.match(src, /<BizPassosRegua /)
  // o FLIP lê o item da fila pelo seletor da classe dele
  assert.match(src, /\.bfl__item--/)
  // nada em loop, e o reduzir movimento cai no estado final empilhado
  assert.doesNotMatch(src, /\binfinite\b/)
  assert.match(src, /@media \(scripting: enabled\) and \(prefers-reduced-motion: no-preference\)/)
  assert.match(ler('app/composables/usePassosTravados.ts'), /addEventListener\('bzj:ir'/)
})

test('as três variações da segurança (?seguranca=1|2|3) só existem no dev, e sem o parâmetro ficam os cartões', () => {
  const landing = ler('app/components/business/nova/BizLanding.vue')
  assert.match(landing, /const variacaoDaSeguranca = computed\(\(\) => \{\n  if \(!import\.meta\.dev\) return ''/)
  assert.match(landing, /route\.query\.seguranca/)
  assert.match(landing, /<LazyBizSegurancaPerguntas v-if="variacaoDaSeguranca === '1'" \/>/)
  assert.match(landing, /<LazyBizSegurancaLente v-else-if="variacaoDaSeguranca === '2'" \/>/)
  assert.match(landing, /<LazyBizSegurancaRegistro v-else-if="variacaoDaSeguranca === '3'" \/>/)
  assert.match(landing, /<ol v-else class="bzs__cards">/)
  for (const f of ['BizSegurancaPerguntas', 'BizSegurancaLente', 'BizSegurancaRegistro']) {
    const src = ler(`app/components/business/nova/${f}.vue`)
    // nada em loop, e o reduzir movimento tem a regra dele
    assert.doesNotMatch(src, /\binfinite\b|setInterval/, f)
    assert.match(src, /prefers-reduced-motion: reduce/, f)
  }
})

test('o registro da variação 3 só mostra eventos que o produto grava, com o rótulo do produto', () => {
  const eventos = R_LINHAS()
  for (const l of eventos.filter((x) => !x.futura)) {
    const rotulo = clientActionLabel(l.acao)
    assert.notEqual(rotulo, l.acao, `${l.acao}: evento que o produto grava`)
    assert.ok(l.texto === rotulo || l.texto.startsWith(`${rotulo}: `), `${l.acao}: o texto é o rótulo do produto`)
  }
  // a linha futura é a validade do consentimento: 12 meses depois do aceite
  const fut = eventos.filter((x) => x.futura)
  assert.equal(fut.length, 1)
  assert.equal(fut[0]!.quando, SEGURANCA_CLIENTE.ate)
  assert.ok(eventos[0]!.quando.startsWith(SEGURANCA_CLIENTE.desde))
  const [d, m, a] = SEGURANCA_CLIENTE.desde.split('/').map(Number)
  assert.equal(SEGURANCA_CLIENTE.ate, `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${a! + 1}`)
  // a conexão é a do elenco (Mariana no Nubank), e cada frase aponta para linhas que existem
  assert.match(eventos[1]!.texto, new RegExp(SEGURANCA_CLIENTE.banco))
  assert.ok(CLIENTES_FORA.some((c) => c.nome === SEGURANCA_CLIENTE.nome && c.banco === SEGURANCA_CLIENTE.banco))
  for (const f of SEGURANCA_REGISTRO.frases) for (const i of f.linhas) assert.ok(eventos[i], `${f.id}: linha ${i}`)
  // ninguém do elenco que está na fila ou nos passos aparece revogando
  assert.ok(!eventos.some((l) => /revoked|purged/.test(l.acao)))
})
function R_LINHAS() { return SEGURANCA_REGISTRO.linhas }

test('a copy da segurança nova não tem termo técnico, não diz demonstração e não diz "sem comissão"', () => {
  const tudo = JSON.stringify({ SEGURANCA_PERGUNTAS, SEGURANCA_PERMISSOES, SEGURANCA_IAS, SEGURANCA_LENTE, SEGURANCA_REGISTRO, SEGURANCA_CLIENTE })
  assert.doesNotMatch(tudo, /demonstra|\bteste\b|exemplo|fictíci|simulad|sem comiss/i)
  assert.doesNotMatch(tudo, /\btoken\b|\bAPI\b|\bMCP\b|OAuth|escopo|servidor|ferramenta|\bskill|\bchave\b|\bhash\b/i)
  for (const f of ['BizSegurancaPerguntas', 'BizSegurancaLente', 'BizSegurancaRegistro']) {
    const tpl = ler(`app/components/business/nova/${f}.vue`).split('<template>')[1]!.split('</template>\n\n<style')[0]!.replace(/<!--[\s\S]*?-->/g, '')
    assert.doesNotMatch(tpl, /\btoken\b|\bAPI\b|\bMCP\b|OAuth|escopo|servidor|ferramenta|\bchave\b/i, f)
  }
})
