/**
 * Hover só onde há mouse.
 *
 * No toque (celular, tablet), o navegador aplica o :hover no toque e ele fica
 * preso até tocar em outro lugar: o cartão continuava erguido, a linha da
 * tabela acesa, a seta do botão adiantada, depois de usados. Este plugin do
 * PostCSS põe toda regra com :hover dentro de @media (hover: hover), no mesmo
 * lugar em que ela estava, para a ordem da cascata não mudar (o estado
 * escolhido continua vencendo o hover como antes). Numa lista de seletores, só
 * os que têm :hover vão para dentro; os outros (:focus-visible, por exemplo)
 * continuam valendo no toque. Regra que já está num @media de hover fica como
 * está, e nada dentro de @keyframes é tocado.
 *
 * Vale para todo CSS do site: os arquivos de assets/css e o <style> dos
 * componentes (ligado no nuxt.config.ts). Mesmo plugin do app B2B.
 */
export default function hoverComMouse() {
  return {
    postcssPlugin: 'hover-com-mouse',
    Rule(rule, { AtRule }) {
      if (!rule.selector.includes(':hover')) return
      for (let p = rule.parent; p; p = p.parent) {
        if (p.type === 'atrule' && (/\bhover\b/.test(p.params) || /keyframes$/i.test(p.name))) return
      }
      const com = rule.selectors.filter(s => s.includes(':hover'))
      const sem = rule.selectors.filter(s => !s.includes(':hover'))
      const media = new AtRule({ name: 'media', params: '(hover: hover)' })
      if (sem.length) {
        media.append(rule.clone({ selectors: com }))
        rule.selectors = sem
        rule.after(media)
      } else {
        rule.replaceWith(media)
        media.append(rule)
      }
    },
  }
}
hoverComMouse.postcss = true
