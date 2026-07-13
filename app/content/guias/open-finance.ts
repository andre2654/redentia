/**
 * Guia: Open Finance (o exemplar do PR4).
 * TODO o conteúdo veio verbatim do contrato de UX:
 * docs/redentia-nu/designs/Redentia Guia Open Finance.dc.html — títulos,
 * parágrafos, stats, passos, checklist, CTA e FAQ. Nada de copy em componente.
 * HTML dos blocos é local e confiável (só <strong>).
 */
import type { GuideDoc } from '~/types/guias'

export const OPEN_FINANCE_GUIDE: GuideDoc = {
  slug: 'open-finance',
  tag: 'Guia Redentia',
  title: 'Open Finance: sua carteira está espalhada?',
  dek: 'Como consolidar seus investimentos em 2 minutos, com consentimento regulado pelo Banco Central, sem planilha e sem compartilhar senhas.',
  description:
    'O que é Open Finance, como conectar suas contas em 2 minutos e por que é seguro: consentimento regulado pelo Banco Central, acesso somente leitura e carteira consolidada na Redentia, sincronizada todos os dias.',
  summary:
    'O Brasil passou de 100 milhões de clientes no Open Finance. Veja como consolidar tudo em 2 minutos, com consentimento regulado pelo BCB, sem planilha e sem senha.',
  minutes: 13,
  author: 'Equipe Redentia',
  datePublished: '2026-07-08',
  dateModified: '2026-07-08',
  updatedLine: 'Atualizado em 8 jul 2026 · 13 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'O que é Open Finance',
      blocks: [
        {
          kind: 'p',
          html: 'O Open Finance é o sistema do Banco Central que permite compartilhar seus dados financeiros entre instituições, <strong>com o seu consentimento explícito</strong>. Na prática: a corretora onde estão suas ações pode enviar suas posições para a Redentia, e você vê tudo em um lugar só.',
        },
        {
          kind: 'p',
          html: 'Quem investe em mais de uma instituição conhece o problema: ações na corretora A, FIIs na B, renda fixa no banco. O patrimônio existe, mas nenhuma tela mostra ele inteiro.',
        },
        {
          kind: 'stats',
          items: [
            { value: '100M+', label: 'clientes ativos no Brasil' },
            { value: '2 min', label: 'para conectar uma conta' },
            { value: '0', label: 'senhas compartilhadas' },
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Como funciona a conexão',
      blocks: [
        {
          kind: 'steps',
          items: [
            'Você escolhe a instituição e autoriza o compartilhamento, definindo exatamente o quê (só posições, por exemplo) e por quanto tempo.',
            'A autenticação acontece <strong>no app da própria instituição</strong>: sua senha nunca passa pela Redentia.',
            'A instituição envia os dados pelas APIs padronizadas do Banco Central, criptografados de ponta a ponta.',
            'Sua carteira aparece consolidada na Redentia e sincroniza sozinha todos os dias, sem planilha, sem digitação.',
          ],
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'É seguro?',
      blocks: [
        {
          kind: 'p',
          html: 'Sim, e mais seguro do que os métodos que ele substitui, como compartilhar senhas com agregadores ou manter planilhas desatualizadas. Quatro garantias importam:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Regulado pelo Banco Central</strong>: regras únicas de segurança e responsabilidade para todas as instituições participantes.',
            '<strong>Somente leitura</strong>: a Redentia enxerga posições e proventos; ninguém consegue movimentar seu dinheiro.',
            '<strong>Criptografia de ponta a ponta</strong>: os dados trafegam pelas APIs oficiais, nunca por telas ou robôs que imitam você.',
            '<strong>Consentimento revogável</strong>: você cancela o compartilhamento quando quiser, em um toque.',
          ],
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'O que muda na prática',
      blocks: [
        { kind: 'p', html: 'Com a carteira consolidada, três coisas destravam de uma vez:' },
        {
          kind: 'p',
          html: '<strong>1. Seu patrimônio de verdade.</strong> Rentabilidade, alocação e risco calculados sobre o todo, não sobre o pedaço que está em cada app.',
        },
        {
          kind: 'p',
          html: '<strong>2. Proventos em um calendário só.</strong> Dividendos de todas as contas, com o mês recorde e a previsão dos próximos pagamentos.',
        },
        {
          kind: 'p',
          html: '<strong>3. Uma IA que enxerga o conjunto.</strong> Concentração setorial, sobreposição de fundos e oportunidades aparecem quando os dados estão juntos.',
        },
      ],
    },
  ],
  // No design o banner aponta pra tela placeholder; na implementação o destino
  // é o funil de conexão da carteira (mapeamento do PLANO §4: Guias → /carteira).
  cta: {
    title: 'Conecte sua carteira em 2 minutos',
    subtitle: 'Grátis para começar · consentimento revogável · só leitura',
    to: '/',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Preciso pagar para usar o Open Finance?',
      a: 'Não. O compartilhamento de dados é gratuito por regulação. Na Redentia, conectar contas está incluído no plano gratuito.',
    },
    {
      q: 'Posso desconectar quando quiser?',
      a: 'Sim. O consentimento tem prazo definido e pode ser revogado a qualquer momento, tanto na Redentia quanto na instituição de origem.',
    },
    {
      q: 'Quais instituições posso conectar?',
      a: 'Todas as grandes corretoras e bancos participam do Open Finance por obrigação regulatória, incluindo XP, BTG, Rico, Inter, Itaú, Nubank e outras dezenas.',
    },
    {
      q: 'A Redentia vê minha senha ou movimenta meu dinheiro?',
      a: 'Nunca. A autenticação acontece no app da sua instituição e o acesso é somente leitura: posições e proventos, nada de transações.',
    },
  ],
  related: ['Como investir em ações', 'Tesouro Direto para iniciantes', 'Dividendos todo mês'],
}
