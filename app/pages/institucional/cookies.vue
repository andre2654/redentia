<script setup lang="ts">
// /institucional/cookies — Política de Cookies e Privacidade (portada VERBATIM de
// Frontend/app/pages/institucional/cookies.vue). Placeholders resolvidos:
// brand.name = "Redentia", suporte/privacidade = suporte@redentia.com.br.
// Path e SEO preservados de propósito (mesma URL). Segue o GABARITO privacy.vue:
// conteúdo é árvore tipada (LegalDocData); LegalHero + LegalDoc renderizam.
import type { LegalDocData } from '~/types/legal'

const doc: LegalDocData = {
  eyebrow: 'Jurídico',
  title: 'Política de Cookies e Privacidade',
  intro: [
    { kind: 'p', text: [
      { text: 'Esta Política de Cookies complementa nossa Política de Privacidade e explica como a ' },
      { text: 'Redentia', bold: true },
      { text: ' utiliza cookies e tecnologias similares em nossa plataforma para melhorar sua experiência de usuário, personalizar conteúdo e garantir o funcionamento adequado de nossos serviços.' },
    ] },
  ],
  sections: [
    {
      id: 'o-que-sao-cookies',
      title: 'O que são Cookies?',
      blocks: [
        { kind: 'p', text: 'Cookies são pequenos arquivos de texto que são armazenados em seu dispositivo (computador, tablet ou smartphone) quando você visita um site. Eles contêm informações que permitem que o site "lembre" de suas preferências e ações durante sua navegação, melhorando sua experiência de uso.' },
        { kind: 'list', items: [
          { text: [{ text: 'Identificação de sessão', bold: true }, { text: ': Permitem que o site reconheça você durante sua visita' }] },
          { text: [{ text: 'Armazenamento de preferências', bold: true }, { text: ': Salvam suas configurações e escolhas pessoais' }] },
          { text: [{ text: 'Melhoria da experiência', bold: true }, { text: ': Facilitam a navegação e personalizam o conteúdo' }] },
          { text: [{ text: 'Análise de uso', bold: true }, { text: ': Ajudam a entender como os usuários interagem com a plataforma' }] },
        ] },
      ],
    },
    {
      id: 'tipos-de-cookies',
      title: 'Tipos de Cookies que Utilizamos',
      blocks: [
        { kind: 'subsection', id: 'cookies-essenciais', title: '1. Cookies Essenciais (Necessários)', blocks: [
          { kind: 'p', text: 'Estes cookies são fundamentais para o funcionamento básico da plataforma e não podem ser desativados:' },
          { kind: 'list', items: [
            { text: [{ text: 'Cookies de autenticação', bold: true }, { text: ': Mantêm você logado durante sua sessão na plataforma' }] },
            { text: [{ text: 'Cookies de segurança', bold: true }, { text: ': Protegem contra atividades maliciosas e garantem a integridade dos dados' }] },
            { text: [{ text: 'Cookies de navegação', bold: true }, { text: ': Permitem a navegação entre as páginas da plataforma' }] },
            { text: [{ text: 'Cookies de preferências técnicas', bold: true }, { text: ': Armazenam configurações essenciais para o funcionamento correto' }] },
          ] },
        ] },
        { kind: 'subsection', id: 'cookies-funcionalidade', title: '2. Cookies de Funcionalidade', blocks: [
          { kind: 'p', text: 'Estes cookies melhoram a funcionalidade da plataforma e podem ser controlados por você:' },
          { kind: 'list', items: [
            { text: [{ text: 'Cookies de personalização', bold: true }, { text: ': Lembram suas preferências de idioma, moeda e configurações de interface' }] },
            { text: [{ text: 'Cookies de conteúdo', bold: true }, { text: ': Armazenam escolhas sobre visualização de gráficos e relatórios' }] },
            { text: [{ text: 'Cookies de interface', bold: true }, { text: ': Mantêm configurações de layout e aparência da plataforma' }] },
            { text: [{ text: 'Cookies de acessibilidade', bold: true }, { text: ': Preservam configurações de acessibilidade e tamanho de fonte' }] },
          ] },
        ] },
        { kind: 'subsection', id: 'cookies-performance', title: '3. Cookies de Performance e Análise', blocks: [
          { kind: 'p', text: 'Estes cookies nos ajudam a entender como você usa a plataforma para melhorarmos nossos serviços:' },
          { kind: 'list', items: [
            { text: [{ text: 'Cookies de analytics', bold: true }, { text: ': Coletam informações sobre como você navega e usa a plataforma' }] },
            { text: [{ text: 'Cookies de performance', bold: true }, { text: ': Monitoram a velocidade e desempenho das páginas' }] },
            { text: [{ text: 'Cookies de teste', bold: true }, { text: ': Ajudam a testar novas funcionalidades e melhorias' }] },
            { text: [{ text: 'Cookies de erro', bold: true }, { text: ': Identificam problemas técnicos para resolução rápida' }] },
          ] },
        ] },
        { kind: 'subsection', id: 'cookies-marketing', title: '4. Cookies de Marketing e Publicidade', blocks: [
          { kind: 'p', text: 'Estes cookies são usados para personalizar o conteúdo promocional e medir a eficácia de nossas campanhas:' },
          { kind: 'list', items: [
            { text: [{ text: 'Cookies de segmentação', bold: true }, { text: ': Personalizam ofertas e conteúdo baseados em seu perfil de investidor' }] },
            { text: [{ text: 'Cookies de remarketing', bold: true }, { text: ': Exibem anúncios relevantes em outros sites que você visita' }] },
            { text: [{ text: 'Cookies de conversão', bold: true }, { text: ': Medem a eficácia de nossas campanhas de marketing' }] },
            { text: [{ text: 'Cookies de redes sociais', bold: true }, { text: ': Facilitam o compartilhamento de conteúdo em redes sociais' }] },
          ] },
        ] },
      ],
    },
    {
      id: 'tecnologias-similares',
      title: 'Tecnologias Similares aos Cookies',
      blocks: [
        { kind: 'p', text: 'Além dos cookies tradicionais, utilizamos outras tecnologias similares:' },
        { kind: 'list', items: [
          { text: [{ text: 'Local Storage', bold: true }, { text: ': Armazena informações localmente em seu navegador para melhor performance' }] },
          { text: [{ text: 'Session Storage', bold: true }, { text: ': Mantém dados temporários durante sua sessão na plataforma' }] },
          { text: [{ text: 'Web Beacons', bold: true }, { text: ': Pequenas imagens invisíveis que nos ajudam a entender o uso da plataforma' }] },
          { text: [{ text: 'Pixel Tags', bold: true }, { text: ': Coletam informações sobre visualizações de página e interações' }] },
        ] },
      ],
    },
    {
      id: 'cookies-terceiros',
      title: 'Cookies de Terceiros',
      blocks: [
        { kind: 'p', text: 'Utilizamos serviços de terceiros confiáveis que podem definir seus próprios cookies:' },
        { kind: 'list', items: [
          { text: [{ text: 'Google Analytics', bold: true }, { text: ': Para análise detalhada do comportamento dos usuários' }] },
          { text: [{ text: 'Provedores de dados financeiros', bold: true }, { text: ': Para obter informações atualizadas do mercado' }] },
          { text: [{ text: 'Serviços de autenticação', bold: true }, { text: ': Para login seguro via Google, Facebook, etc.' }] },
          { text: [{ text: 'Plataformas de suporte', bold: true }, { text: ': Para chat de atendimento e helpdesk' }] },
        ] },
      ],
    },
    {
      id: 'duracao-dos-cookies',
      title: 'Duração dos Cookies',
      blocks: [
        { kind: 'p', text: 'Os cookies têm diferentes períodos de duração:' },
        { kind: 'list', items: [
          { text: [{ text: 'Cookies de sessão', bold: true }, { text: ': Expiram quando você fecha o navegador' }] },
          { text: [{ text: 'Cookies persistentes', bold: true }, { text: ': Permanecem por um período determinado (de dias a anos)' }] },
          { text: [{ text: 'Cookies de funcionalidade', bold: true }, { text: ': Geralmente duram de 30 dias a 2 anos' }] },
          { text: [{ text: 'Cookies de analytics', bold: true }, { text: ': Podem durar até 2 anos para análises históricas' }] },
        ] },
      ],
    },
    {
      id: 'como-gerenciar',
      title: 'Como Gerenciar Cookies',
      blocks: [
        { kind: 'p', text: 'Você tem controle total sobre os cookies e pode gerenciá-los de várias formas:' },
        { kind: 'subsection', id: 'config-plataforma', title: 'Configurações da Plataforma', blocks: [
          { kind: 'list', items: [
            { text: 'Acesse as "Configurações de Privacidade" em sua conta para personalizar suas preferências de cookies' },
            { text: 'Escolha quais tipos de cookies aceitar ou rejeitar (exceto os essenciais)' },
            { text: 'Altere suas preferências a qualquer momento nas configurações do seu perfil' },
          ] },
        ] },
        { kind: 'subsection', id: 'config-navegador', title: 'Configurações do Navegador', blocks: [
          { kind: 'list', items: [
            { text: [{ text: 'Chrome', bold: true }, { text: ': Configurações > Privacidade e segurança > Cookies e outros dados do site' }] },
            { text: [{ text: 'Firefox', bold: true }, { text: ': Opções > Privacidade e Segurança > Cookies e dados do site' }] },
            { text: [{ text: 'Safari', bold: true }, { text: ': Preferências > Privacidade > Gerenciar dados do site' }] },
            { text: [{ text: 'Edge', bold: true }, { text: ': Configurações > Cookies e permissões do site > Cookies' }] },
          ] },
        ] },
      ],
    },
    {
      id: 'impacto-desativacao',
      title: 'Impacto da Desativação de Cookies',
      blocks: [
        { kind: 'p', text: 'A desativação de certos tipos de cookies pode afetar sua experiência na plataforma:' },
        { kind: 'list', items: [
          { text: [{ text: 'Cookies essenciais', bold: true }, { text: ': A desativação pode impedir o funcionamento básico da plataforma' }] },
          { text: [{ text: 'Cookies de funcionalidade', bold: true }, { text: ': Você pode perder personalizações e preferências salvas' }] },
          { text: [{ text: 'Cookies de performance', bold: true }, { text: ': Pode resultar em carregamento mais lento das páginas' }] },
          { text: [{ text: 'Cookies de marketing', bold: true }, { text: ': Você pode receber conteúdo menos relevante' }] },
        ] },
      ],
    },
    {
      id: 'protecao-dados',
      title: 'Proteção de Dados e Privacidade',
      blocks: [
        { kind: 'p', text: 'Levamos sua privacidade a sério e seguimos rigorosas medidas de proteção:' },
        { kind: 'list', items: [
          { text: [{ text: 'Conformidade LGPD', bold: true }, { text: ': Todos os cookies seguem as diretrizes da Lei Geral de Proteção de Dados' }] },
          { text: [{ text: 'Minimização de dados', bold: true }, { text: ': Coletamos apenas as informações necessárias para os propósitos declarados' }] },
          { text: [{ text: 'Criptografia', bold: true }, { text: ': Dados sensíveis em cookies são criptografados' }] },
          { text: [{ text: 'Transparência', bold: true }, { text: ': Informamos claramente sobre todos os cookies utilizados' }] },
        ] },
      ],
    },
    {
      id: 'atualizacoes',
      title: 'Atualizações desta Política',
      blocks: [
        { kind: 'list', items: [
          { text: 'Esta Política de Cookies pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou requisitos legais' },
          { text: 'Notificaremos sobre alterações significativas através da plataforma ou por e-mail' },
          { text: 'A versão mais atual estará sempre disponível em nossa plataforma' },
          { text: 'Recomendamos a leitura periódica desta política para manter-se informado' },
        ] },
      ],
    },
    {
      id: 'contato-duvidas',
      title: 'Contato e Dúvidas',
      blocks: [
        { kind: 'p', text: 'Se você tiver dúvidas sobre nossa Política de Cookies ou como gerenciamos suas informações:' },
        { kind: 'list', items: [
          { text: [
            { text: 'Entre em contato conosco pelo e-mail: ' },
            { text: 'suporte@redentia.com.br', href: 'mailto:suporte@redentia.com.br' },
          ] },
          { text: 'Use o chat de suporte disponível em nossa plataforma' },
          { text: 'Acesse nossa Central de Ajuda para mais informações sobre privacidade e cookies' },
          { text: 'Nossa equipe de privacidade está disponível para esclarecer qualquer dúvida' },
        ] },
        { kind: 'p', text: [
          { text: 'Ao continuar usando nossa plataforma, você concorda com o uso de cookies conforme descrito nesta política.', bold: true },
        ] },
      ],
    },
  ],
}

usePageSeo({
  // title BARE: o app.vue já sufixa "· Redentia" em todo title (house style Nu).
  // A página antiga era "Política de Cookies | Redentia" — mesmas palavras.
  title: 'Política de Cookies',
  description: 'Entenda quais cookies utilizamos, por que eles são importantes e como personalizar suas preferências na plataforma Redentia.',
  path: '/institucional/cookies',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Cookies', path: '/institucional/cookies' },
  ],
})
</script>

<template>
  <div>
    <LegalHero :eyebrow="doc.eyebrow" :title="doc.title" :updated="doc.updated" />
    <LegalDoc :intro="doc.intro" :sections="doc.sections" toc />
  </div>
</template>
