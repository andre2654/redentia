/**
 * useAuthorSchema, fonte unica do schema autor/revisor pra paginas YMYL.
 *
 * Por ora retorna a Organization como autor (fallback Google-aceito quando
 * nao ha pessoa fisica responsavel publicamente identificada). A pagina
 * /metodologia carrega isso e o Google interpreta como "conteudo curado
 * pela organizacao", mantendo JSON-LD valido sem quebrar rich results.
 *
 * Quando a Redentia tiver editor-chefe ou analista CNPI/CPA-20 publicamente
 * atribuido como responsavel editorial, swap pra `'@type': 'Person'` aqui
 * com `name`, `jobTitle`, `hasCredential` (apontando pra ANBIMA/CVM) e
 * `sameAs[]` (LinkedIn, Portal ANBIMA). Toda pagina que usa o composable
 * herda a melhoria automaticamente.
 */
export function useAuthorSchema() {
  const brand = useBrand()
  return computed(() => ({
    '@type': 'Organization',
    name: brand.name,
    url: brand.url,
    logo: {
      '@type': 'ImageObject',
      url: `${brand.url}/512x512.png`,
    },
  }))
}
