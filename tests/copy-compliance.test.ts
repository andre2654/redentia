/**
 * Copy de compliance de /business e /cliente, conferida contra o que o código
 * faz (revisão de 07/10/2026). Cada caso trava uma frase que afirmava algo
 * falso e a troca que a deixou verdadeira. Lê os arquivos como texto: não
 * depende do Nuxt.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const APP = fileURLToPath(new URL('../app/', import.meta.url))
const ler = (f: string) => readFileSync(new URL(`../app/${f}`, import.meta.url), 'utf8')
// Junta quebras de linha do template para a frase não escapar do grep.
const plano = (f: string) => ler(f).replace(/\s+/g, ' ')

/*
 * CV-01 mudou em 11/10/2026. Antes travava a promessa "só entra depois de um
 * banco separado", que era o plano (pg-biz) e não o produto: o dado de cliente
 * mora no PostgreSQL da Redentia, em tabelas próprias, isolado por escritório
 * na aplicação. A seção de segurança passou a afirmar só o que o código faz, e
 * o teste trava a volta da promessa. Pelo mesmo motivo, a prova do aceite não
 * cita o IP: ele só é gravado quando o Laravel prova a origem
 * (FrontOrigin::visitorIp, que depende da FRONT_SHARED_KEY nos dois lados), e
 * em 11/10 a prova deu negativo em produção. Ligada a chave, o IP pode voltar
 * para a frase, e esta asserção muda junto.
 */
test('CV-01: banco separado não é afirmado (não existe), a prova do aceite é a gravada, e "nenhum dado real" não volta', () => {
  const visivel = (f: string) => semComentarios(ler(f)).replace(/\s+/g, ' ')
  for (const f of ['components/business/RbSeguranca.vue', 'content/business/faq.ts'])
    assert.doesNotMatch(visivel(f), /banco separado/i, f)
  const seg = visivel('components/business/RbSeguranca.vue')
  assert.match(seg, /a data, a versão do termo, o hash do texto que o cliente leu e o navegador/)
  assert.doesNotMatch(seg, /\bIP\b/)
  for (const f of ['components/business/RbSeguranca.vue', 'content/business/faq.ts', 'pages/business/clientes.vue'])
    assert.doesNotMatch(plano(f), /nenhum dado real/i, f)
})

test('CV-09: ao cliente final, "nenhum dado seu" não volta; IP e navegador do aceite são declarados', () => {
  for (const f of ['pages/cliente/convite/[token].vue', 'pages/cliente/acesso/[token].vue'])
    assert.doesNotMatch(plano(f), /nenhum dado (seu|dele)/i, f)
  // A página de gestão é onde o cliente confere o que fica guardado. (A linha
  // da tela de sucesso do convite, que também declarava isso, saiu com a marca
  // de demonstração; o termo, que vem do servidor, segue declarando.)
  assert.match(plano('pages/cliente/acesso/[token].vue'), /prova do aceite \(data, IP e navegador\)/)
})

test('CV-06: o FAQ não diz que nenhuma ferramenta cancela; o link novo cancela o pendente', () => {
  const faq = plano('content/business/faq.ts')
  assert.doesNotMatch(faq, /revoga, reatribui ou cancela/)
  assert.match(faq, /Um link novo para o mesmo cliente cancela o link pendente anterior/)
})

/*
 * CV-10 travava a copy do pop-up de anúncio (NuMcpPromo). O pop-up saiu de vez
 * em 15/10/2026, a pedido do dono, e a trava passou a ser a ausência dele.
 */
test('CV-10: o pop-up de anúncio não volta ao layout', () => {
  assert.equal(existsSync(new URL('../app/components/nu/NuMcpPromo.vue', import.meta.url)), false)
  for (const f of ['layouts/default.vue', 'layouts/business.vue'])
    assert.doesNotMatch(semComentarios(ler(f)), /<NuMcpPromo/, f)
})

/*
 * CV-11 (o aviso de demonstração repetido pelo assistente) saiu: a marca de
 * demonstração deixou de existir em toda a experiência (decisão do dono,
 * 07/10/2026). O CV-18 trava a ausência.
 */

/**
 * Texto do arquivo sem os comentários (bloco, HTML e linha inteira de //):
 * comentário de código pode citar o modo interno; o que a pessoa lê, não.
 */
function semComentarios(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .split('\n').filter(l => !l.trim().startsWith('//')).join('\n')
}

/** Todos os .vue/.ts de uma pasta de app/, recursivo. */
function arquivos(dir: string): string[] {
  const raiz = `${APP}${dir}`
  return readdirSync(raiz).flatMap((n) => {
    const rel = `${dir}/${n}`
    if (statSync(`${APP}${rel}`).isDirectory()) return arquivos(rel)
    return /\.(vue|ts)$/.test(n) ? [rel] : []
  })
}

/** A UI do recurso Clientes do escritório e a copy do /business que fala dele. */
const UI_CLIENTES = [
  ...arquivos('components/cliente'),
  ...arquivos('pages/cliente'),
  ...arquivos('components/business'),
  ...arquivos('content/business'),
  // as páginas do /business, menos a de skills (copy de outro fluxo)
  ...arquivos('pages/business').filter(f => !f.endsWith('/skills.vue')),
  'utils/clientes.ts',
  'composables/useClienteConexao.ts',
]

test('CV-18: nenhuma marca de demonstração ou de teste na experiência de Clientes do escritório', () => {
  assert.ok(UI_CLIENTES.includes('pages/business/clientes.vue'))
  assert.ok(UI_CLIENTES.includes('pages/cliente/convite/[token].vue'))
  assert.ok(UI_CLIENTES.includes('pages/cliente/acesso/[token].vue'))
  assert.ok(UI_CLIENTES.includes('components/cliente/ClienteConnect.vue'))
  for (const f of UI_CLIENTES)
    assert.doesNotMatch(semComentarios(ler(f)), /demonstra|fictíci|ficticia|\bteste\b|simulad/i, f)
})

test('CV-19: Clientes do escritório é apresentado como liberado escritório a escritório, sem afirmar carteira real', () => {
  assert.match(plano('pages/business/clientes.vue'), /liberado por convite, escritório a escritório/)
  assert.match(plano('content/business/faq.ts'), /liberado por convite, escritório a escritório/)
  for (const f of ['content/business/faq.ts', 'components/business/RbSeguranca.vue'])
    assert.match(plano(f), /habilitada escritório a escritório, na implantação/, f)
  // Omitir a marca não autoriza afirmar o contrário dela.
  for (const f of UI_CLIENTES)
    assert.doesNotMatch(semComentarios(ler(f)), /carteira real|conectad[ao] de verdade|seus investimentos reais/i, f)
})

test('CV-14: sem "quota do dia" num plano sem teto diário; Clientes é ligado pela Redentia', () => {
  const src = plano('components/business/RbKeysScope.vue')
  assert.doesNotMatch(src, /quota do dia/)
  assert.doesNotMatch(src, /não é uma configuração que alguém pode ligar/)
  assert.match(src, /conta só no limite por minuto/)
  assert.match(src, /ligado pela Redentia/)
})

test('CV-16: o FAQ de limites cita o teto global do motor (limiter mcp-simulate)', () => {
  assert.match(plano('content/business/faq.ts'), /teto compartilhado entre todos os usuários/)
})

test('CV-17: o guia de MCP restringe o "somente leitura" à chave pessoal', () => {
  const g = plano('content/guias/mcp-para-investimentos.ts')
  assert.doesNotMatch(g, /O Redentia MCP é <strong>somente leitura<\/strong>\./)
  assert.match(g, /Na chave pessoal, o Redentia MCP é <strong>somente leitura<\/strong>/)
})

/*
 * CV-20 (revisão de 11/10/2026). A carteira colada em simulate_scenario NÃO
 * passa no_cache: o ScenarioEngineService guarda o resultado do motor (ticker
 * e valor) no cache do Laravel, por hash do pedido, sem chave nem conta. Só a
 * carteira de cliente (C4) é no_cache. Então "não fica guardada" / "nada
 * guardado" é falso; o verdadeiro é "não fica salva na conta". E a contagem de
 * 15 ferramentas só vale na conta com Clientes ligado (sem ele são 11), então o
 * card do hero não pode dizer "15 ferramentas no Claude" sem a condição.
 * Se o mcp-service passar no_cache no simulate_scenario, esta trava pode cair.
 */
test('CV-20: a landing não afirma que a carteira colada não fica guardada, e não promete 15 ferramentas a toda chave', () => {
  const visivel = (f: string) => semComentarios(ler(f)).replace(/\s+/g, ' ')
  const landing = ['RbHero', 'RbDivisao', 'RbJornada', 'RbJornadaCard', 'RbFilosofia', 'RbRegras', 'RbSeguranca', 'RbProva', 'RbCapacidade']
    .map(c => `components/business/${c}.vue`).concat('content/business/faq.ts')
  for (const f of landing) {
    assert.doesNotMatch(visivel(f), /n[aã]o fica guardad|nada guardado|nada da carteira colada fica guardado|servidor n[aã]o guarda/i, f)
    assert.doesNotMatch(visivel(f), /Sem slide/i, f)
  }
  assert.doesNotMatch(visivel('components/business/RbHero.vue'), /ferramentas no Claude ou no ChatGPT: cotação, notícia com leitura, tese, cenário sobre a carteira e clientes/)
  assert.match(visivel('content/business/faq.ts'), /cache técnico, sem nome e sem chave/)
})
