const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
})

export function useFormat() {
  function brl(value: number | string | null | undefined): string {
    const n = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(n)) return '—'
    return brlFormatter.format(n).replace(/\s/g, '\u00A0')
  }

  function brlCompact(value: number | string | null | undefined, unit = ''): string {
    const n = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(n)) return '—'
    const formatted = numberFormatter.format(n).replace(/\s/g, '\u00A0')
    return unit ? `R$\u00A0${formatted}\u00A0${unit}` : `R$\u00A0${formatted}`
  }

  function number(value: number | string | null | undefined): string {
    const n = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(n)) return '—'
    return numberFormatter.format(n)
  }

  function percent(value: number | string | null | undefined): string {
    const n = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(n)) return '—'
    return `${percentFormatter.format(n)}%`.replace('-', '−')
  }

  return { brl, brlCompact, number, percent }
}
