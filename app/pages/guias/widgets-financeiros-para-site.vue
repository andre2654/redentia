<script setup lang="ts">
const brand = useBrand()

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const CONTENT_VERSION = '2026-04-20'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString()

const widgets = [
  {
    slug: 'ticker/small',
    nome: 'Ticker Small',
    descricao: 'Card compacto com logo, cotação e variação do dia',
    quando: 'Sidebars de blogs, menções rápidas em textos, callouts',
  },
  {
    slug: 'ticker/big',
    nome: 'Ticker Big',
    descricao: 'Card grande com cotação, DY, P/L e setor',
    quando: 'Posts de análise fundamentalista, destaque em guias',
  },
  {
    slug: 'carousel',
    nome: 'Carrossel de Tickers',
    descricao: 'Barra horizontal com vários tickers atualizando',
    quando: 'Headers de dashboard, tickers de newsletter, cabeçalhos editoriais',
  },
  {
    slug: 'grafico',
    nome: 'Gráfico de Valorização',
    descricao: 'Gráfico histórico com períodos de 1M a 5A',
    quando: 'Posts comparativos, relatórios recorrentes, análise de cenário',
  },
  {
    slug: 'ranking/altas',
    nome: 'Top Maiores Altas',
    descricao: 'Ranking diário das ações que mais subiram',
    quando: 'Posts diários sobre o mercado, newsletters matinais',
  },
  {
    slug: 'ranking/baixas',
    nome: 'Top Maiores Baixas',
    descricao: 'Ranking diário das ações que mais caíram',
    quando: 'Complementa post de altas, análise de cenário de baixa',
  },
  {
    slug: 'mapa-calor',
    nome: 'Mapa de Calor da Bolsa',
    descricao: 'Treemap colorido por variação do dia',
    quando: 'Newsletters de fim de pregão, posts de resumo diário',
  },
  {
    slug: 'calculadora/juros-compostos',
    nome: 'Calculadoras Financeiras',
    descricao: '7 calculadoras: juros compostos, DY, preço-teto, IR, etc',
    quando: 'Guias educacionais, cursos online, consultoria',
  },
]

usePageSeo({
  title: `Como Usar Widgets Financeiros Grátis no Seu Site (Guia 2026) | ${brand.name}`,
  description:
    'Guia completo para adicionar widgets de cotação da B3, calculadoras e mapas de calor no seu blog, newsletter ou site. Exemplos em WordPress, Webflow, Medium e Notion. Sem cadastro e sem mensalidade.',
  path: '/guias/widgets-financeiros-para-site',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Guias', path: '/guias' },
    { name: 'Widgets Financeiros', path: '/guias/widgets-financeiros-para-site' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline:
        'Como Usar Widgets Financeiros Grátis no Seu Site: Guia Completo 2026',
      description:
        'Passo a passo para adicionar widgets de cotação, calculadoras e mapas de calor do mercado brasileiro em qualquer site.',
      datePublished: lastUpdatedISO,
      dateModified: lastUpdatedISO,
      author: {
        '@type': 'Organization',
        name: brand.name,
        url: brand.url,
      },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: {
          '@type': 'ImageObject',
          url: `${brand.url}/512x512.png`,
        },
      },
    },
  ],
})
</script>

<template>
  <NuxtLayout name="static" title="Widgets Financeiros para Site">
    <article class="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12 md:py-16">
      <!-- Back-link to parent listing -->
      <NuxtLink
        to="/guias"
        class="flex items-center gap-1 text-xs transition hover:opacity-80"
        :style="{ color: brand.colors.textMuted }"
      >
        <UIcon name="i-lucide-chevron-left" class="size-3" />
        Todos os guias
      </NuxtLink>

      <!-- Header -->
      <header class="flex flex-col gap-4">
        <h1 class="text-3xl md:text-5xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">
          Widgets Financeiros Grátis para Seu Site: Guia Completo 2026
        </h1>
        <p class="text-lg">
          Como adicionar cotações da B3, calculadoras, mapas de calor e rankings em qualquer blog, newsletter ou site, sem cadastro, sem mensalidade, em 2 minutos.
        </p>
        <p class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">
          Publicado e atualizado em {{ lastUpdatedText }} · Leitura de 8 minutos
        </p>
      </header>

      <!-- Intro -->
      <section class="flex flex-col gap-8">
        <h2>Por que usar widgets financeiros no seu site?</h2>
        <p>
          Se você escreve sobre finanças, num blog, numa newsletter, num curso online ou na página de uma consultoria, colocar dados ao vivo no seu conteúdo resolve três problemas ao mesmo tempo:
        </p>
        <ul>
          <li>
            <strong>Conteúdo que envelhece sozinho:</strong> um post de 2024 mencionando "PETR4 a R$ 28" envelhece em dias. Um widget mostra sempre o preço atual.
          </li>
          <li>
            <strong>Autoridade visual:</strong> leitor clica na cotação ao vivo e volta. Tempo na página sobe, taxa de rejeição cai.
          </li>
          <li>
            <strong>Atualização zero:</strong> você escreve uma vez, o widget atualiza todo dia. Ideal pra quem publica uma vez e não quer voltar no post.
          </li>
        </ul>

        <h2>O que são os widgets da Redentia?</h2>
        <p>
          São iframes HTML gratuitos que exibem dados do mercado brasileiro em tempo real. Você cola um pedaço de código no seu site e pronto, WordPress, Webflow, Medium, Ghost, Substack, Notion, tudo funciona. O iframe puxa os dados direto da B3 (Brasil, Bolsa, Balcão) via infra da Redentia, então você não precisa criar conta, gerenciar API keys nem se preocupar com limite de requisições.
        </p>

        <h2>Os 8 widgets disponíveis</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            v-for="w in widgets"
            :key="w.slug"
            :to="`/embed/${w.slug}`"
            class="normal-static-link group flex flex-col gap-2 rounded-xl border p-5 transition hover:border-secondary/50"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          >
            <div class="flex items-center justify-between">
              <h3 :style="{ color: brand.colors.text }">{{ w.nome }}</h3>
              <UIcon name="i-lucide-arrow-up-right" class="size-4 opacity-40 transition group-hover:opacity-100" />
            </div>
            <p class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">{{ w.descricao }}</p>
            <p class="text-xs" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 50%, transparent)' }"><strong>Quando usar:</strong> {{ w.quando }}</p>
          </NuxtLink>
        </div>

        <h2>Como instalar um widget em 3 passos</h2>
        <h3>Passo 1: Escolha o widget na página de embeds</h3>
        <p>
          Abra <NuxtLink to="/embed">redentia.com.br/embed</NuxtLink> e clique no widget que combina com o seu conteúdo. Se você tá fazendo um post sobre uma ação específica, o Ticker Big resolve. Se é um post sobre o pregão do dia, o Mapa de Calor ou Top Altas funcionam melhor.
        </p>

        <h3>Passo 2: Customize e copie o código</h3>
        <p>
          Cada widget tem um playground com opções: ticker, tema (claro/escuro), dimensões e, em alguns casos, período e filtros. Ajuste no painel à esquerda, veja a pré-visualização à direita, e clique em "Copiar código iframe".
        </p>

        <h3>Passo 3: Cole no seu site</h3>
        <p>
          Aqui depende da sua plataforma. Veja os casos mais comuns:
        </p>

        <h4>WordPress</h4>
        <p>
          No editor Gutenberg, adicione um bloco "HTML customizado" e cole o iframe. No editor clássico, vá em "Texto" (não "Visual") e cole. Não precisa de plugin.
        </p>

        <h4>Webflow</h4>
        <p>
          Arraste um elemento "Embed" pra onde quer o widget e cole o código. O Webflow renderiza automaticamente.
        </p>

        <h4>Medium / Substack</h4>
        <p>
          Medium suporta embed via URL direta, cole a URL do iframe (só o `src`, sem as tags) e ele transforma em embed. Substack aceita HTML custom em planos pagos; no gratuito, use uma imagem linkada pro widget.
        </p>

        <h4>Ghost</h4>
        <p>
          Adicione o card "HTML" e cole o iframe. Funciona em posts e pages.
        </p>

        <h4>Notion (páginas públicas)</h4>
        <p>
          Cole a URL do iframe como /embed e o Notion renderiza. Funciona melhor em páginas públicas publicadas.
        </p>

        <h2>Exemplos de uso por persona</h2>
        <h3>Blogueiro de finanças</h3>
        <p>
          Num post "PETR4 vale a pena em 2026?", use o Ticker Big no início (cotação + DY + P/L) e o Gráfico de Valorização no meio pra mostrar histórico. O post sobrevive à volatilidade sem precisar editar.
        </p>

        <h3>Newsletter diária</h3>
        <p>
          No topo, o Carrossel de Tickers com IBOV, dólar e juros. No corpo, o Mapa de Calor pra mostrar o dia da bolsa. No rodapé, o Top Altas e Top Baixas. Pronto, conteúdo que atualiza sozinho.
        </p>

        <h3>Consultoria / Assessoria</h3>
        <p>
          Na página do serviço, embede as Calculadoras Financeiras como demonstração do valor que você entrega. No blog, use Ticker Big nos posts de análise. No formulário de captação, Mapa de Calor como "hero visual".
        </p>

        <h3>Curso / Educador</h3>
        <p>
          Na aula sobre juros compostos, embede a Calculadora de Juros Compostos. O aluno simula direto na aula. Sem downloads, sem Excel, sem instalação.
        </p>

        <h2>Perguntas frequentes</h2>
        <h3>Os widgets são realmente gratuitos?</h3>
        <p>
          Sim, 100%. Sem limite de visualizações para uso em blogs/sites de conteúdo. A única condição é manter o link "powered by Redentia" visível no rodapé de cada widget (isso vem no próprio código do iframe, você não precisa adicionar nada). Para uso corporativo com alto volume (>100k views/mês), fale com a gente.
        </p>

        <h3>Os dados são em tempo real?</h3>
        <p>
          Cotações atualizam durante o pregão da B3 (dias úteis, 10h às 17h30). Fora do horário, mostramos o último fechamento. Mapa de calor e rankings atualizam a cada 15 minutos durante o pregão.
        </p>

        <h3>Posso customizar cores pra combinar com meu site?</h3>
        <p>
          Tema claro e escuro hoje. Customização total de cores está no roadmap do Redentia White-label, que é o plano pago pra quem quer a marca própria.
        </p>

        <h3>E se eu quiser mais do que widgets, acesso programático?</h3>
        <p>
          A <NuxtLink to="/api-portal">Redentia API</NuxtLink> tem 50+ endpoints REST com os mesmos dados em JSON. Plano free disponível para testar.
        </p>
      </section>

      <!-- CTA -->
      <div class="rounded-3xl border p-8 text-center" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <h2 class="mb-3" :style="{ color: brand.colors.text }">
          Pronto pra instalar o primeiro widget?
        </h2>
        <p class="mx-auto mb-5 max-w-xl" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">
          Abra a página de embeds, escolha um widget e cole o código. Em 2 minutos seu conteúdo tá com dados ao vivo da B3.
        </p>
        <UButton to="/embed" size="lg" color="primary">Abrir lista de widgets</UButton>
      </div>
    </article>
  </NuxtLayout>
</template>
