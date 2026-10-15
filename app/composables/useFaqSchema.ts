import type { NuFaqItem } from '~/types/market'

/**
 * JSON-LD FAQPage de uma lista de perguntas (rich snippet). Regra da casa:
 * uma página, um bloco FAQPage, com todas as perguntas dela.
 *
 * O NuFaqAccordion chama isto sozinho, e é o caso de quase toda página. Quem
 * divide o mesmo FAQ em vários accordions (o /business, um por aba) passa
 * `:schema="false"` em cada um e chama isto UMA vez com a lista inteira;
 * senão sairia um FAQPage por accordion.
 */
export function useFaqSchema(items: NuFaqItem[]) {
  useHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }),
    }],
  })
}
