/**
 * JSON-LD de /business e /jantar.
 *
 * Só o que a página já diz. Sem preço, nota, avaliação ou número que a
 * página não publica. O provider/organizer é o @id da Organization; outro
 * PR coloca esse nó em app.vue.
 */
export const ORGANIZACAO_ID = 'https://www.redentia.com.br/#organization'

export const TITULO_BUSINESS = 'Redentia: plataforma para assessorias e family offices'

export const DESCRICAO_BUSINESS = 'Para assessorias e family offices. O cliente autoriza pelo Open Finance e as posições chegam juntas, no Claude ou no ChatGPT da mesa.'

/** Rótulos do select "Tipo de casa", na ordem do formulário, sem o "Outro". */
export const PUBLICO_BUSINESS = [
  'Assessoria ou escritório AAI',
  'Multi family office',
  'Family office',
  'Gestora',
  'Consultoria',
] as const

/**
 * Frases literais da landing (hero, divisão, segurança, plano). O texto
 * estruturado só junta estas — não reescreve a oferta.
 */
export const FRASES_BUSINESS = [
  'O cliente autoriza pelo Open Finance e as posições dos bancos dele chegam juntas, no Claude ou no ChatGPT da sua mesa.',
  'Conexão habilitada escritório a escritório, na implantação.',
  'Lê o mercado o dia inteiro',
  'Testa a carteira em segundos',
  'Explica cada movimento, com fonte',
  'Deixa a pauta da reunião pronta',
  'Nada compra, vende ou transfere.',
  'O preço é por pessoa da mesa e não muda com o que o seu cliente compra.',
  'Um acesso por pessoa da mesa',
  'Cenários para toda a mesa',
  'Sete rotinas prontas no Claude',
  'Funciona sem dado de cliente',
  'Garantia de 30 dias',
  'A carteira de cada cliente conectada por Open Finance, com o consentimento dele.',
  'O cenário roda sobre ela, e o relatório sai com a marca da casa.',
] as const

const descricaoOferta = FRASES_BUSINESS.map((f) => /[.!?]$/.test(f) ? f : `${f}.`).join(' ')

const publico = {
  '@type': 'BusinessAudience',
  audienceType: PUBLICO_BUSINESS.join(', '),
}

export const jsonLdBusiness: Record<string, unknown>[] = [
  {
    '@type': 'SoftwareApplication',
    name: 'Redentia For Business',
    applicationCategory: 'FinanceApplication',
    url: 'https://www.redentia.com.br/business',
    inLanguage: 'pt-BR',
    description: descricaoOferta,
    featureList: [...FRASES_BUSINESS],
    provider: { '@id': ORGANIZACAO_ID },
    audience: publico,
  },
  {
    '@type': 'Service',
    name: 'Redentia For Business',
    url: 'https://www.redentia.com.br/business',
    description: descricaoOferta,
    provider: { '@id': ORGANIZACAO_ID },
    audience: publico,
  },
]

/** Fatos travados do jantar. Sem oferta, sem preço, sem dia, sem casa. */
export const jsonLdJantar: Record<string, unknown>[] = [
  {
    '@type': 'Event',
    name: 'Redentia Wealth Intelligence Dinner',
    startDate: '2026-12',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    maximumAttendeeCapacity: 10,
    description: '10 cadeiras, uma mesa, nenhuma palestra. Sócios, diretores e C-level de assessorias, family offices, bancos e gestoras.',
    url: 'https://www.redentia.com.br/jantar',
    organizer: { '@id': ORGANIZACAO_ID },
    location: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'São Paulo',
        addressCountry: 'BR',
      },
    },
  },
]
