<script setup lang="ts">
// /institucional/privacy — Política de Privacidade (portada VERBATIM de
// Frontend/app/pages/institucional/privacy.vue). Placeholders resolvidos:
// brand.name = "Redentia", suporte/privacidade = suporte@redentia.com.br,
// site = redentia.com.br. Path e SEO preservados de propósito (mesma URL).
//
// GABARITO das páginas legais Nu: o conteúdo é uma árvore tipada (LegalDocData);
// LegalHero renderiza a banda creme (eyebrow + H1 + data opcional) e LegalDoc a
// coluna de artigo em branco (h2/h3/p/ol/li/strong/a) com TOC sticky opcional.
// Header/ticker/footer vêm do layout default. Nada hardcodado em componente.
import type { LegalDocData } from '~/types/legal'

const doc: LegalDocData = {
  eyebrow: 'Jurídico',
  title: 'Política de Privacidade',
  intro: [
    { kind: 'p', text: [
      { text: 'Esta Política de Privacidade (“Política”), juntamente com os Termos de Uso, descreve as políticas e condições aplicáveis aos serviços prestados pela ' },
      { text: 'Redentia', bold: true },
      { text: ' por meio da Plataforma e seu aplicativo.' },
    ] },
    { kind: 'p', text: 'Esta política descreve as formas como coletamos, armazenamos e protegemos os Dados Pessoais dos usuários da Plataforma e do aplicativo.' },
    { kind: 'p', text: [
      { text: 'O usuário dos nossos serviços pode a qualquer momento deixar de receber comunicações da nossa Plataforma. Para tanto, basta clicar nos links “remover” ou “descadastramento”, contidos ao final de cada e-mail enviado aos Usuários ou enviar um e-mail para o nosso suporte ' },
      { text: 'suporte@redentia.com.br', href: 'mailto:suporte@redentia.com.br' },
      { text: ' indicando o seu desejo de não mais receber comunicações.' },
    ] },
  ],
  sections: [
    {
      id: 'definicoes',
      title: 'Definições',
      blocks: [
        { kind: 'list', items: [
          { text: [
            { text: 'Dados Pessoais', bold: true },
            { text: ' – toda informação relacionada a pessoa natural identificada ou identificável. Exemplos: nome, endereço, telefone, CPF, número da carteira de habilitação e detalhes de transações comerciais pessoais.' },
          ] },
          { text: [
            { text: 'LGPD', bold: true },
            { text: ' – Lei nº 13.709, de 14 de agosto de 2018, conforme alterada.' },
          ] },
          { text: [
            { text: 'Plataforma', bold: true },
            { text: ' – o Site, bem como os seus diversos ambientes que o Usuário terá acesso após o cadastro ou contratação de um Plano.' },
          ] },
          { text: [
            { text: 'Política de Privacidade', bold: true },
            { text: ' – a presente política de privacidade da ' },
            { text: 'Redentia', bold: true },
            { text: ', disponível em seu Site.' },
          ] },
          { text: [
            { text: 'Site', bold: true },
            { text: ' – endereço da rede mundial de computadores denominado ' },
            { text: 'redentia.com.br', href: 'https://redentia.com.br', external: true },
            { text: '.' },
          ] },
          { text: [
            { text: 'Usuário', bold: true },
            { text: ' – toda pessoa física que acessa a Plataforma, a quem os Dados Pessoais se referem.' },
          ] },
        ] },
      ],
    },
    {
      id: 'como-coletamos',
      title: 'Como coletamos informações',
      blocks: [
        { kind: 'list', items: [
          { text: 'Coletamos seu endereço IP e informações padrão de acesso à web, como o tipo do seu navegador e as páginas acessadas em nosso Site.' },
          { text: 'Ao realizar cadastro, coletamos informações de contato como nome, endereço, telefone e e-mail.' },
          { text: 'Ao aceitar esta Política, você concorda em receber periodicamente e-mails com conteúdo relevante e ofertas. Você pode cancelar a qualquer momento clicando no link no final do e-mail.' },
          { text: 'Podemos coletar informações adicionais por meio do contato com nossa equipe de suporte ao cliente.' },
        ] },
      ],
    },
    {
      id: 'cookies',
      title: 'Coleta Automática de Dados - Cookies',
      blocks: [
        { kind: 'list', items: [
          { text: 'Utilizamos cookies e tecnologias semelhantes para coletar informações como tipo de navegador, tempo no site, páginas visitadas, preferências de idioma e outros dados de tráfego anônimos.' },
          { text: 'Tipos de cookies utilizados:', children: [
            { text: [{ text: 'Cookies de sessão', bold: true }, { text: ': reconhecem o usuário durante a mesma sessão.' }] },
            { text: [{ text: 'Cookies de segurança', bold: true }, { text: ': coletam informações essenciais para autenticação e proteção de dados.' }] },
            { text: [{ text: 'Cookies de funcionalidade', bold: true }, { text: ': aprimoram a experiência do usuário, armazenando preferências.' }] },
            { text: [{ text: 'Cookies para publicidade', bold: true }, { text: ': personalizam campanhas publicitárias.' }] },
            { text: [{ text: 'Cookies de desempenho', bold: true }, { text: ': agregam informações anônimas para melhoria da plataforma.' }] },
          ] },
          { text: 'Você pode rejeitar cookies nas configurações do seu navegador, mas isso pode afetar a experiência de navegação.' },
        ] },
      ],
    },
    {
      id: 'armazenamento',
      title: 'Armazenamento',
      blocks: [
        { kind: 'list', items: [
          { text: 'Armazenamos informações:', children: [
            { text: 'Pelo tempo exigido por lei;' },
            { text: 'Pelo tempo necessário para preservar interesses legítimos ou direitos em processos;' },
            { text: 'Até o término do tratamento dos Dados Pessoais, conforme situações previstas nesta Política.' },
          ] },
          { text: 'Ao término do tratamento, os Dados Pessoais serão eliminados, salvo hipóteses legais.' },
        ] },
      ],
    },
    {
      id: 'seguranca',
      title: 'Segurança',
      blocks: [
        { kind: 'list', items: [
          { text: 'Adotamos medidas técnicas, físicas e organizacionais para proteger seus Dados Pessoais, como criptografia, firewalls e monitoramento de rede.' },
          { text: 'Todos os funcionários e prestadores de serviços são obrigados a manter sigilo e cumprir políticas internas de segurança.' },
          { text: 'Terceiros com acesso aos dados também devem garantir a segurança e cumprir esta Política.' },
        ] },
      ],
    },
    {
      id: 'finalidades',
      title: 'Finalidades',
      blocks: [
        { kind: 'list', items: [
          { text: 'Fornecer serviços e suporte ao cliente;' },
          { text: 'Contato para assuntos relacionados à prestação dos serviços;' },
          { text: 'Personalizar, avaliar e melhorar nossos serviços e conteúdo;' },
          { text: 'Enviar materiais de marketing e ofertas promocionais;' },
          { text: 'Realizar pesquisas de satisfação;' },
          { text: 'Faturamento e cobrança;' },
          { text: 'Impedir atividades proibidas ou ilegais;' },
          { text: 'Cumprir obrigações legais, regulatórias ou ordens judiciais;' },
          { text: [{ text: 'Proteger interesses da ' }, { text: 'Redentia', bold: true }, { text: ' e de seus clientes;' }] },
          { text: 'Detectar e prevenir fraudes;' },
          { text: 'Exercer direitos em processos judiciais, administrativos ou arbitrais.' },
        ] },
      ],
    },
    {
      id: 'compartilhamento',
      title: 'Compartilhamento',
      blocks: [
        { kind: 'list', items: [
          { text: 'Compartilhamos Dados Pessoais com:', children: [
            { text: 'Provedores de serviços de sistemas e tecnologia;' },
            { text: [{ text: 'Sociedades do grupo econômico da ' }, { text: 'Redentia', bold: true }, { text: ';' }] },
            { text: 'Prestadores de serviços administrativos, financeiros, legais, entre outros;' },
            { text: 'Autoridades administrativas e judiciais, quando necessário.' },
          ] },
          { text: 'Terceiros devem observar a LGPD e esta Política de Privacidade.' },
          { text: 'Parceiros em promoções conjuntas podem receber informações pessoais apenas para avaliação dos resultados da promoção.' },
        ] },
      ],
    },
    {
      id: 'links',
      title: 'Links e Redirecionamentos',
      blocks: [
        { kind: 'list', items: [
          { text: [{ text: 'Nossa Plataforma pode conter links para sites de terceiros, sem gerência da ' }, { text: 'Redentia', bold: true }, { text: '.' }] },
          { text: 'Recomendamos que o Usuário leia as políticas do novo site antes de compartilhar seus Dados Pessoais.' },
          { text: 'Não nos responsabilizamos por políticas, termos ou práticas de terceiros.' },
        ] },
      ],
    },
    {
      id: 'software-garantias',
      title: 'Software Update e Garantias',
      blocks: [
        { kind: 'list', items: [
          { text: 'O Usuário deve manter seus softwares e aplicativos atualizados para garantir o correto funcionamento da Plataforma.' },
          { text: 'A Plataforma é fornecida no estado em que se encontra, podendo conter erros e imprecisões.' },
          { text: 'Não garantimos operação ininterrupta ou ausência de períodos de instabilidade.' },
        ] },
      ],
    },
    {
      id: 'veiculacao',
      title: 'Veiculação',
      blocks: [
        { kind: 'list', items: [
          { text: 'Poderemos divulgar na Plataforma ou aplicativo materiais publicitários e serviços de parceiros.' },
          { text: 'A divulgação não autoriza o compartilhamento de dados além das hipóteses permitidas nesta Política.' },
          { text: 'Não nos responsabilizamos por contratações ou dados compartilhados em serviços de terceiros.' },
        ] },
      ],
    },
    {
      id: 'dados-mercado',
      title: 'Divulgação de informações de mercado',
      blocks: [
        { kind: 'list', items: [
          { text: [{ text: 'A ' }, { text: 'Redentia', bold: true }, { text: ' pode utilizar dados de mercado fornecidos por terceiros, como a B3.' }] },
          { text: 'O Usuário não deve utilizar ou difundir tais dados para criar cálculos, índices ou gráficos sem autorização.' },
          { text: 'A B3 é a única detentora dos direitos de divulgação desses dados.' },
          { text: 'A Plataforma não se responsabiliza por exatidão, pontualidade ou integralidade desses dados.' },
        ] },
      ],
    },
    {
      id: 'alteracoes',
      title: 'Alterações à Política de Privacidade',
      blocks: [
        { kind: 'list', items: [
          { text: 'Esta Política pode ser revisada ou atualizada periodicamente.' },
          { text: 'Alterações significativas serão comunicadas de forma consistente.' },
          { text: 'Recomendamos a leitura frequente desta Política.' },
        ] },
      ],
    },
    {
      id: 'contatos',
      title: 'Canais de Atendimento e Contatos',
      blocks: [
        { kind: 'list', items: [
          { text: [
            { text: 'O Usuário pode deixar de receber comunicações a qualquer momento clicando em “remover” ou “descadastro” nos e-mails, ou enviando e-mail para ' },
            { text: 'suporte@redentia.com.br', href: 'mailto:suporte@redentia.com.br' },
            { text: '.' },
          ] },
          { text: [
            { text: 'Para dúvidas ou solicitações sobre Dados Pessoais ou esta Política, entre em contato com nosso Encarregado pelo endereço ' },
            { text: 'suporte@redentia.com.br', href: 'mailto:suporte@redentia.com.br' },
            { text: '.' },
          ] },
          { text: 'Todas as empresas do Grupo Redentia são controladoras e responsáveis pelos Dados Pessoais dos Usuários.' },
        ] },
      ],
    },
  ],
}

usePageSeo({
  // title BARE: o app.vue já sufixa "· Redentia" em todo title (house style Nu).
  // A página antiga era "Política de Privacidade | Redentia" — mesmas palavras.
  title: 'Política de Privacidade',
  description: 'Saiba como a Redentia coleta, utiliza e protege seus dados pessoais e financeiros de acordo com a LGPD.',
  path: '/institucional/privacy',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Privacidade', path: '/institucional/privacy' },
  ],
})
</script>

<template>
  <div>
    <LegalHero :eyebrow="doc.eyebrow" :title="doc.title" :updated="doc.updated" />
    <LegalDoc :intro="doc.intro" :sections="doc.sections" toc />
  </div>
</template>
