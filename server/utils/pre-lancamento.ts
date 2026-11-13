/**
 * O pré-lançamento da Aportou (13/11/2026; docs/aportou/virada-de-dominio.md, seção 4.1): o site no ar em
 * aportou.com.br antes da troca, fora do índice. Sem import do Nitro de propósito: o teste importa direto.
 */

/** O robots.txt. No pré-lançamento, sem o sitemap e sem o guia para LLMs: o rastreio segue liberado para o Google
 *  LER o noindex de cada página (URL bloqueada no robots pode entrar no índice sem conteúdo, a partir de link). */
export function textoDoRobots(origin: string, preLancamento: boolean): string {
  if (preLancamento) {
    return [
      'User-agent: *',
      'Allow: /',
      '',
      '# Pré-lançamento: as páginas saem com X-Robots-Tag noindex até a virada de domínio.',
      '',
    ].join('\n')
  }
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
    '# Guia curado para LLMs (prioridades de citação e política de uso):',
    `# ${origin}/llms.txt`,
    `# Inventário completo: ${origin}/llms-full.txt`,
    '',
  ].join('\n')
}

/** O valor da variável (vem como texto da Vercel, ou já convertido pelo Nuxt). */
export function preLancamentoLigado(valor: unknown): boolean {
  return valor === true || valor === 'true' || valor === '1'
}
