/**
 * SVG do PNG. O mesmo layout serve o teste de sobreposição: cada texto e
 * cada barra ocupam uma caixa, e as caixas não se cruzam.
 */
import { AVISO, type Grafico } from './graficos.ts'

export const PNG_LARGURA = 1200

const PAD = 56
const LABEL_W = 280
const GAP = 18
const VALUE_W = 150
const TRACK_X = PAD + LABEL_W + GAP
const TRACK_W = PNG_LARGURA - PAD - VALUE_W - GAP - TRACK_X
const VALUE_X = TRACK_X + TRACK_W + GAP
const ROW = 72
const BAR_H = 22
const CREME = '#f5f1ea'
const AZUL = '#2f6aff'
const NAVY = '#0c1524'

export interface Caixa {
  x: number
  y: number
  w: number
  h: number
  tipo: 'texto' | 'barra'
  texto?: string
}

export interface SvgGrafico {
  svg: string
  width: number
  height: number
  caixas: Caixa[]
}

/** Largura folgada, de propósito: se cabe nesta conta, o glifo cabe na caixa. */
export function larguraTexto(texto: string, fontSize: number): number {
  let w = 0
  for (const ch of texto) {
    if (ch === ' ') w += fontSize * 0.34
    else if (/[A-Z0-9%MW]/.test(ch)) w += fontSize * 0.72
    else if (/[ilj.,:;'!|]/.test(ch)) w += fontSize * 0.34
    else w += fontSize * 0.58
  }
  return w
}

export function quebrar(texto: string, maxPx: number, fontSize: number): string[] {
  const palavras = texto.split(/\s+/).filter(Boolean)
  const linhas: string[] = []
  let atual = ''
  for (const palavra of palavras) {
    const candidato = atual ? `${atual} ${palavra}` : palavra
    if (atual && larguraTexto(candidato, fontSize) > maxPx) {
      linhas.push(atual)
      atual = palavra
    } else {
      atual = candidato
    }
  }
  if (atual) linhas.push(atual)
  return linhas.length ? linhas : ['']
}

function xml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface Texto {
  texto: string
  x: number
  baseline: number
  fontSize: number
  weight: number
  anchor: 'start' | 'end'
  maxW: number
}

function caixaTexto(t: Texto): Caixa {
  const w = Math.min(t.maxW, larguraTexto(t.texto, t.fontSize))
  const x = t.anchor === 'end' ? t.x - w : t.x
  const asc = t.fontSize * 0.82
  const desc = t.fontSize * 0.28
  return { x, y: t.baseline - asc, w, h: asc + desc, tipo: 'texto', texto: t.texto }
}

function cruza(a: Caixa, b: Caixa): boolean {
  return a.x < b.x + b.w - 0.5
    && a.x + a.w > b.x + 0.5
    && a.y < b.y + b.h - 0.5
    && a.y + a.h > b.y + 0.5
}

export function svgDoGrafico(g: Grafico): SvgGrafico {
  const conteudo = PNG_LARGURA - PAD * 2
  const textos: Texto[] = []
  const caixas: Caixa[] = []
  let y = PAD

  const tituloLinhas = quebrar(g.titulo, conteudo, 32)
  for (const linha of tituloLinhas) {
    const baseline = y + 32
    textos.push({ texto: linha, x: PAD, baseline, fontSize: 32, weight: 800, anchor: 'start', maxW: conteudo })
    y = baseline + 14
  }
  y += 6
  for (const linha of quebrar(g.linha, conteudo, 18)) {
    const baseline = y + 18
    textos.push({ texto: linha, x: PAD, baseline, fontSize: 18, weight: 500, anchor: 'start', maxW: conteudo })
    y = baseline + 10
  }
  y += 18

  for (const barra of g.barras) {
    const rowTop = y
    const baseline = rowTop + 46
    const rotulo: Texto = {
      texto: barra.rotulo,
      x: TRACK_X - GAP,
      baseline,
      fontSize: 18,
      weight: 700,
      anchor: 'end',
      maxW: LABEL_W,
    }
    const valor: Texto = {
      texto: barra.valorTexto,
      x: VALUE_X,
      baseline,
      fontSize: 18,
      weight: 800,
      anchor: 'start',
      maxW: VALUE_W,
    }
    textos.push(rotulo, valor)
    const fillW = Math.max(0, Math.min(1, barra.preenchimento)) * TRACK_W
    if (fillW > 0) {
      caixas.push({
        x: TRACK_X,
        y: baseline - BAR_H / 2,
        w: fillW,
        h: BAR_H,
        tipo: 'barra',
      })
    }
    y = rowTop + ROW
  }

  y += 12
  const rodape = [ 'redentia.com.br', g.fonte, g.dataTexto, AVISO ]
  for (const bloco of rodape) {
    const linhas = quebrar(bloco, conteudo, bloco === 'redentia.com.br' ? 20 : 16)
    const size = bloco === 'redentia.com.br' ? 20 : 16
    for (const linha of linhas) {
      const baseline = y + size
      textos.push({ texto: linha, x: PAD, baseline, fontSize: size, weight: bloco === AVISO || bloco === 'redentia.com.br' ? 800 : 500, anchor: 'start', maxW: conteudo })
      y = baseline + 12
    }
    y += 4
  }
  y += PAD - 12

  for (const t of textos) {
    if (larguraTexto(t.texto, t.fontSize) > t.maxW + 0.5) {
      throw new Error(`Texto não cabe no gráfico: ${t.texto}`)
    }
    caixas.push(caixaTexto(t))
  }

  for (let i = 0; i < caixas.length; i++) {
    for (let j = i + 1; j < caixas.length; j++) {
      const a = caixas[i]!
      const b = caixas[j]!
      if (a.tipo === 'barra' && b.tipo === 'barra') continue
      if (cruza(a, b)) {
        throw new Error(`Sobreposição no gráfico: ${a.texto ?? 'barra'} × ${b.texto ?? 'barra'}`)
      }
    }
  }

  const height = Math.ceil(y)
  const partes: string[] = []
  partes.push(`<?xml version="1.0" encoding="UTF-8"?>`)
  partes.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${PNG_LARGURA}" height="${height}" viewBox="0 0 ${PNG_LARGURA} ${height}">`)
  partes.push(`<rect width="${PNG_LARGURA}" height="${height}" fill="${CREME}"/>`)
  let cursor = PAD
  for (const linha of tituloLinhas) cursor += 32 + 14
  cursor += 6
  for (const _ of quebrar(g.linha, conteudo, 18)) cursor += 18 + 10
  cursor += 18
  for (const barra of g.barras) {
    const baseline = cursor + 46
    const by = baseline - BAR_H / 2
    partes.push(`<rect x="${TRACK_X}" y="${by}" width="${TRACK_W}" height="${BAR_H}" rx="11" fill="${NAVY}" fill-opacity="0.08"/>`)
    const fillW = Math.max(0, Math.min(1, barra.preenchimento)) * TRACK_W
    if (fillW > 0) {
      partes.push(`<rect x="${TRACK_X}" y="${by}" width="${fillW.toFixed(2)}" height="${BAR_H}" rx="11" fill="${AZUL}"/>`)
    }
    cursor += ROW
  }
  for (const t of textos) {
    partes.push(
      `<text x="${t.x}" y="${t.baseline}" fill="${NAVY}" font-family="Plus Jakarta Sans" font-size="${t.fontSize}" font-weight="${t.weight}" text-anchor="${t.anchor}">${xml(t.texto)}</text>`,
    )
  }
  partes.push(`</svg>`)

  return { svg: partes.join(''), width: PNG_LARGURA, height, caixas }
}

export function alturaDoGrafico(g: Grafico): number {
  return svgDoGrafico(g).height
}
