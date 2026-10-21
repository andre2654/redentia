#!/usr/bin/env node
/**
 * newsletter-enviar — manda a newsletter de sexta ("O mercado da semana") que o
 * scripts/newsletter-semana.mjs montou e o dono revisou. Nada é agendado: só
 * roda quando o dono manda, e manda o rascunho.html como está, com as edições
 * à mão que ele tiver feito.
 *
 * Quem envia é o Backend. O script sobe o HTML para dentro do container do
 * Laravel na VPS pelo stdin do ssh (scp para a redentia-vps não funciona) e
 * chama o newsletter:enviar, que põe o rodapé de cada assinante com o
 * descadastro e não manda a mesma edição duas vezes para ninguém.
 *
 * USO (a edição é a pasta newsletter-rascunhos/<sexta>; sem --semana, a mais recente)
 *   node scripts/newsletter-enviar.mjs --teste voce@exemplo.com    # só para você, com [Teste] no assunto
 *   node scripts/newsletter-enviar.mjs --contagem                  # quantos assinantes receberiam
 *   node scripts/newsletter-enviar.mjs --todos                     # para os assinantes, depois de digitar "enviar"
 *   node scripts/newsletter-enviar.mjs --semana 2026-10-23 --teste voce@exemplo.com
 *   acrescente --mostrar para ver o comando sem rodar nada
 *
 * O assunto é o <title> do rascunho.html (o assunto sugerido pelo script).
 * Para trocar, edite o <title> antes de enviar. Se o --todos falhar no meio,
 * rodar de novo manda só para quem faltou.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PASTA = path.join(RAIZ, 'newsletter-rascunhos')
const HOST = 'redentia-vps'
const CONTAINER = 'php-fpm-redentia'
const SSH_OPCOES = ['-o', 'ConnectTimeout=15', '-o', 'ServerAliveInterval=10']
/** Onde o newsletter:enviar põe o rodapé de cada assinante (NewsletterMail::MARCA_RODAPE). */
const MARCA_RODAPE = '<!--rodape-assinante-->'

/** A sexta da semana (segunda a sexta) que contém o dia, como no newsletter-semana.mjs. */
export function sextaDe(isoDia) {
  const d = new Date(`${isoDia}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) + 4)
  return d.toISOString().slice(0, 10)
}

/** Só letras, números e . _ % + -: o e-mail entra numa linha de shell na VPS. */
export function emailValido(email) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
}

/** O <title> do HTML, sem tags e com as entidades resolvidas. */
export function assuntoDe(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)
  if (!m) return ''
  return m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, ' ').trim()
}

/**
 * O que roda na VPS: o stdin do ssh vira o arquivo dentro do container, o
 * artisan manda, e o arquivo sai de lá com qualquer resultado. `edicao` e
 * `para` chegam validados (AAAA-MM-DD e emailValido), sem aspas nem espaço.
 */
export function comandoRemoto({ edicao, modo, para }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(edicao)) throw new Error(`edição inválida: ${edicao}`)
  if (modo === 'teste' && !emailValido(para ?? '')) throw new Error(`e-mail inválido: ${para}`)
  const opcao = { teste: `--teste=${para}`, contagem: '--dry-run', todos: '--confirmar' }[modo]
  if (!opcao) throw new Error(`modo inválido: ${modo}`)
  const arquivo = `/tmp/newsletter-${edicao}.html`
  return `docker exec -i -u www-data ${CONTAINER} sh -c 'cat > ${arquivo} && php artisan newsletter:enviar ${arquivo} --edicao=${edicao} ${opcao}; s=$?; rm -f ${arquivo}; exit $s'`
}

function fatal(msg) {
  console.error(`\nERRO: ${msg}\n`)
  process.exit(1)
}

/** Aspas simples de shell, para o --mostrar sair pronto para colar. */
const citar = (s) => `'${s.replace(/'/g, `'\\''`)}'`

function rodarNaVps(html, remoto) {
  const r = spawnSync('ssh', [...SSH_OPCOES, HOST, remoto], { input: html, stdio: ['pipe', 'inherit', 'inherit'] })
  if (r.error) fatal(`o ssh não rodou: ${r.error.message}`)
  return r.status ?? 1
}

async function principal() {
  const args = process.argv.slice(2)
  const flag = (n) => args.includes(`--${n}`)
  const val = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined }
  if (flag('help') || flag('h')) {
    console.log('uso: node scripts/newsletter-enviar.mjs [--semana AAAA-MM-DD] (--teste <e-mail> | --contagem | --todos) [--mostrar]')
    return
  }

  const modos = ['teste', 'contagem', 'todos'].filter(flag)
  if (modos.length !== 1) fatal('escolha um: --teste <e-mail>, --contagem ou --todos')
  const modo = modos[0]
  const para = modo === 'teste' ? (val('teste') ?? '').trim() : undefined
  if (modo === 'teste' && !emailValido(para)) fatal('--teste espera o seu e-mail (só letras, números e . _ % + -)')

  const semana = val('semana')
  if (semana && !/^\d{4}-\d{2}-\d{2}$/.test(semana)) fatal('--semana espera AAAA-MM-DD')
  const edicoes = existsSync(PASTA)
    ? readdirSync(PASTA).filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n) && existsSync(path.join(PASTA, n, 'rascunho.html'))).sort()
    : []
  const edicao = semana ? sextaDe(semana) : edicoes.at(-1)
  if (!edicao || !edicoes.includes(edicao)) {
    fatal(`não achei newsletter-rascunhos/${edicao ?? '<sexta>'}/rascunho.html. Rode antes: node scripts/newsletter-semana.mjs${semana ? ` --semana ${semana}` : ''}`)
  }
  const arquivo = path.join(PASTA, edicao, 'rascunho.html')
  const html = readFileSync(arquivo, 'utf8')
  const assunto = assuntoDe(html)
  if (!/<body/i.test(html) || !assunto) fatal(`${path.relative(process.cwd(), arquivo)} não parece a edição (sem <body> ou sem <title>)`)

  console.error(`Edição ${edicao}: ${path.relative(process.cwd(), arquivo)}`)
  console.error(`Assunto: ${assunto}`)
  // A mesma varredura do fim do newsletter-semana.mjs, agora sobre o arquivo
  // que vai sair (o dono pode ter editado). Importado só aqui: o módulo lê os
  // argumentos de linha de comando quando carrega.
  const { varrer } = await import('./newsletter-semana.mjs')
  const achados = varrer(html)
  if (!html.includes(MARCA_RODAPE)) achados.push('O rascunho é de antes do rodapé do assinante: o descadastro vai no fim do e-mail, fora do rodapé da edição.')
  for (const a of achados) console.error(`ATENÇÃO: ${a}`)

  const comando = (m) => comandoRemoto({ edicao, modo: m, para })
  if (flag('mostrar')) {
    const passos = modo === 'todos' ? ['contagem', 'todos'] : [modo]
    for (const m of passos) console.log(`ssh ${[...SSH_OPCOES, HOST].join(' ')} ${citar(comando(m))} < ${citar(path.relative(process.cwd(), arquivo))}`)
    return
  }

  if (modo !== 'todos') {
    process.exitCode = rodarNaVps(html, comando(modo))
    return
  }

  // --todos: a contagem primeiro, e só manda com "enviar" digitado.
  if (rodarNaVps(html, comando('contagem')) !== 0) fatal('a contagem falhou; nada foi enviado')
  if (!process.stdin.isTTY) fatal('o --todos pede confirmação no terminal; nada foi enviado')
  const rl = createInterface({ input: process.stdin, output: process.stderr })
  const resposta = (await rl.question(`\nMandar "${assunto}" para os assinantes? Digite enviar para confirmar: `)).trim().toLowerCase()
  rl.close()
  if (resposta !== 'enviar') fatal('nada foi enviado')
  process.exitCode = rodarNaVps(html, comando('todos'))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await principal()
