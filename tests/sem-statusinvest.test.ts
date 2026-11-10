/**
 * Nenhum texto que a página renderiza cita StatusInvest. Comentário de
 * código fica de fora: o que vale é string, template e o resumo montado.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { montarResumoAtivo, type ResumoAtivoInput, type ResumoNumeros } from '../app/utils/assetResumo.ts'

const APP = fileURLToPath(new URL('../app', import.meta.url))
const MARCA = /status\s*invest/i

function semComentario(src: string): string {
  return src
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function arquivos(dir: string): string[] {
  const out: string[] = []
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) out.push(...arquivos(caminho))
    else if (/\.(vue|ts|js|mjs)$/.test(nome)) out.push(caminho)
  }
  return out
}

const VAZIOS: ResumoNumeros = {
  dy: null, pl: null, pvp: null, roe: null, margem: null, valorMercado: null,
  vpCota: null, rendaMedia24m: null, ifix: null, cotistas: null,
}

function entrada(over: Partial<ResumoAtivoInput> = {}): ResumoAtivoInput {
  return {
    ticker: 'ZZZZ3',
    nome: 'Empresa',
    kind: 'stock',
    setor: 'Energia',
    moeda: 'BRL',
    preco: 10,
    variacaoDia: 1,
    data: '2026-10-28',
    numeros: VAZIOS,
    fonteIndicadores: null,
    fonteDy: null,
    min52: 8,
    max52: 12,
    serie: { de: '2025-10-28', ate: '2026-10-28', variacao: 10, ibov: 4 },
    setorMedia: null,
    proventos: {
      unidade: 'ação',
      renda12: 1,
      eventos12: 2,
      capital12: 0,
      frequencia: 'Semestral',
      proximo: '1 dez 2026',
      anos: [{ ano: '2026', valor: 1, corrente: true }],
      tipo: 'renda',
    },
    etf: null,
    cripto: null,
    links: [{ href: '/dividendos/ZZZZ3', label: 'Dividendos de ZZZZ3' }],
    ...over,
    numeros: { ...VAZIOS, ...over.numeros },
  }
}

function textoDe(r: NonNullable<ReturnType<typeof montarResumoAtivo>>): string {
  return [r.h1, r.title, r.description, ...r.paragrafos, r.faqTitulo ?? '', ...r.faq.flatMap((f) => [f.q, f.a])].join('\n')
}

test('app/ sem comentário não cita StatusInvest', () => {
  const hits: string[] = []
  for (const arquivo of arquivos(APP)) {
    const limpo = semComentario(readFileSync(arquivo, 'utf8'))
    if (MARCA.test(limpo)) hits.push(arquivo.slice(APP.length + 1))
  }
  assert.deepEqual(hits, [])
})

test('o resumo renderizado não cita StatusInvest', () => {
  const casos: Partial<ResumoAtivoInput>[] = [
    {
      numeros: { ...VAZIOS, dy: 6.96, pl: 5.07, pvp: 1.4, roe: 30.3, margem: 24.3, valorMercado: 718e9 },
    },
    {
      kind: 'fii',
      ticker: 'HGLG11',
      nome: 'Pátria Log',
      numeros: { ...VAZIOS, dy: 9.09, pvp: 0.89, vpCota: 165, rendaMedia24m: 1.1, ifix: 4.18, cotistas: 1000 },
      proventos: {
        unidade: 'cota', renda12: 12, eventos12: 12, capital12: 0,
        frequencia: 'Mensal', proximo: null, anos: [], tipo: 'renda',
      },
    },
    {
      kind: 'bdr',
      ticker: 'AAPL34',
      nome: 'Apple',
      moeda: 'USD',
      numeros: { ...VAZIOS, dy: 0.5, pl: 28, pvp: 40, roe: 150, margem: 25 },
    },
    {
      kind: 'etf',
      ticker: 'BOVA11',
      nome: 'Ibovespa',
      etf: { taxaAdm: 0.1, posicoes: 86, maiorNome: 'Vale', maiorPeso: 12, fonte: 'CVM', competencia: '2026-09-30' },
    },
    {
      kind: 'crypto',
      ticker: 'BTC',
      nome: 'Bitcoin',
      preco: 350000,
      serie: null,
      proventos: null,
    },
    {
      numeros: { ...VAZIOS, dy: 0, pl: 4 },
      fonteDy: 'Fonte: avisos de proventos da B3, até 9 nov 2026.',
    },
  ]
  for (const over of casos) {
    const r = montarResumoAtivo(entrada(over))
    assert.ok(r, over.ticker ?? over.kind)
    const texto = textoDe(r)
    assert.doesNotMatch(texto, MARCA, texto)
    assert.doesNotMatch(texto, /Fonte:\s*\./)
    assert.doesNotMatch(texto, /Fonte:\s*$/m)
    assert.doesNotMatch(texto, /\(\s*\)/)
  }
})
