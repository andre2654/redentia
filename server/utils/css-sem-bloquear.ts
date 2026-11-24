/**
 * O Nuxt embute o CSS usado na página e ainda emite <link rel="stylesheet">
 * para o mesmo arquivo. No laboratório (Lighthouse mobile) a primeira pintura
 * espera cada link: nas calculadoras isso era ~2 s do LCP, com o CSS já
 * dentro de <style>. O link continua no HTML (o navegador guarda o arquivo),
 * mas não segura a pintura. Sem JavaScript a página fica com o CSS embutido.
 */
export function cssSemBloquear(html: string): string {
  return html.replace(/<link\b[^>]*\brel="stylesheet"[^>]*>/gi, (tag) => {
    if (/\smedia=/.test(tag) || /\sonload=/.test(tag)) return tag
    return tag.replace(/>$/, ' media="print" onload="this.media=\'all\'">')
  })
}
