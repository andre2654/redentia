/**
 * Leva a página até uma seção e a deixa em destaque por alguns segundos: as
 * seções vizinhas escurecem e depois voltam (10/11/2026, o dono: ao tocar em
 * "Quanto vai cair?" no topo da /carteira, ir para os proventos "com a parte
 * atual meio destacada e as outras meio escurecidas por alguns segundos").
 *
 * Só marca: o alvo ganha data-destaque="on" e os irmãos, "off"; o estilo é de
 * quem monta a página (CarteiraVisao: `.cvi > [data-destaque='off']`). Um
 * destaque novo cancela o anterior. Só no cliente.
 */
let relogio: ReturnType<typeof setTimeout> | undefined

function limpar() {
  if (relogio) clearTimeout(relogio)
  relogio = undefined
  document.querySelectorAll<HTMLElement>('[data-destaque]').forEach((el) => { delete el.dataset.destaque })
}

export function destacarSecao(id: string, ms = 3200): void {
  if (typeof document === 'undefined') return
  const alvo = document.getElementById(id)
  const pai = alvo?.parentElement
  if (!alvo || !pai) return
  limpar()
  for (const el of Array.from(pai.children) as HTMLElement[]) el.dataset.destaque = el === alvo ? 'on' : 'off'
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  alvo.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'start' })
  relogio = setTimeout(limpar, ms)
}
