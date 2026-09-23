// Redentia Nu — a nova Redentia. SSR-first (as superfícies públicas são o motor
// de aquisição/SEO). Arquitetura herdada dos dois apps anteriores:
//  - proxies em 3 camadas e routeRules de cache (Frontend)
//  - deploy git→Vercel e organização por feature (Atlas)
// Plano mestre: docs/redentia-nu/PLANO-REDENTIA-NU.md (repo raiz).
export default defineNuxtConfig({
  compatibilityDate: '2026-07-11',
  devtools: { enabled: false },
  ssr: true,

  css: ['~/assets/css/tokens.css', '~/assets/css/base.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      // titleTemplate NÃO pode viver aqui: função em app.head não serializa e
      // o SSR renderiza o title cru sem sufixo de marca (bug desde o PR0,
      // pego no verify do PR10). O template vive em app.vue via useHead.
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap',
        },
        { rel: 'icon', type: 'image/svg+xml', href: '/logo-azul.svg' },
      ],
      meta: [{ name: 'theme-color', content: '#2F6BFF' }],
    },
  },

  runtimeConfig: {
    // Server-only: URL direta do Laravel pros fetches SSR (evita loopback do
    // Nitro no próprio proxy). Override: NUXT_BACKEND_DIRECT_BASE.
    backendDirectBase: process.env.NUXT_BACKEND_URL ?? 'https://redentia-api.saraivada.com/api',
    // Server-only: chave compartilhada com o Laravel (FRONT_SHARED_KEY lá). Com
    // ela, o rate limit do backend conta cada VISITANTE em vez do IP de saída
    // da Vercel. Vazia = desligada. Ver server/plugins/backend-front-key.ts.
    // Override: NUXT_BACKEND_FRONT_KEY.
    backendFrontKey: '',
    public: {
      // Browser SEMPRE fala com same-origin (/api/backend, /api/chat) — zero CORS.
      // chatDirectUrl: escape hatch se o proxy Vercel bufferizar SSE (lição do Atlas).
      chatDirectUrl: process.env.NUXT_PUBLIC_CHAT_DIRECT_URL || '',
      // Origem CANÔNICA do site. É a fonte única de verdade pra canonical, og:url,
      // sitemap, robots e llms-full (ver useSiteOrigin / server/utils/site-origin).
      // Precisa do `www`: o apex 301a pra www em produção, e o Search Console
      // indexa www.redentia.com.br. Sem o www aqui, o canonical apontava pro
      // destino de um 301 — o Google resolve, mas gasta crawl e enfraquece o sinal.
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.redentia.com.br',
      // Google OAuth Web client ID (público por design — o browser precisa
      // dele pro Google Identity Services emitir o id_token; o secret vive
      // só no Laravel, que valida via tokeninfo + aud). ENV-ONLY, sem
      // fallback hardcoded (lição registrada em conventions.md). Sem a env,
      // o botão Google do /login se esconde sozinho (LoginGoogleButton
      // documenta o que falta pra ligar).
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      // Observabilidade (migrada do Frontend antigo no cutover). Plugins
      // client carregam lazy (requestIdleCallback) pra não competir com o
      // LCP. Pra desligar num env, basta setar a env correspondente vazia.
      gaId: process.env.NUXT_PUBLIC_GA_ID || 'G-F2QGZNWJTM', // Google Analytics 4
      clarityProjectId: process.env.NUXT_PUBLIC_CLARITY_PROJECT_ID || 'wmh9pyc3io', // Microsoft Clarity
      gtmId: process.env.NUXT_PUBLIC_GTM_ID || 'GTM-M9KBJN7Q', // Google Tag Manager
    },
  },

  routeRules: {
    // Proxies server-to-server (prod/Vercel).
    '/api/backend/**': {
      proxy: `${process.env.NUXT_BACKEND_URL ?? 'https://redentia-api.saraivada.com/api'}/**`,
    },
    '/api/chat/**': {
      proxy: `${process.env.NUXT_CHAT_SERVICE_URL ?? 'https://redentia-api.saraivada.com/chat'}/**`,
    },
    // Cache por rota. Regra dura (lição do Frontend): rota com variante
    // logada/deslogada = private/no-store — CDN não varia por cookie.
    '/': { headers: { 'cache-control': 'private, no-store' } },
    '/busca': { headers: { 'cache-control': 'private, no-store' } },
    // /login redireciona SSR-side quem já tem cookie de sessão e lê
    // ?redirect/?email — cachear seria servir o redirect de um user pro outro.
    '/login': { headers: { 'cache-control': 'private, no-store' } },
    // Home única (dono, 2026-07-13): o MERCADO é a home `/` pros dois casos
    // (anônimo e logado — só variam SEÇÕES); /mercado 301a pra raiz (regra
    // EXATA; '/' já é private/no-store acima). A carteira segue página
    // separada e privada — NÃO redireciona.
    '/mercado': { redirect: { to: '/', statusCode: 301 } },
    // Raio-X aposentado no Nu (existia no Frontend antigo): 301 pra home,
    // preserva o link equity e evita 404 das URLs indexadas. Regra exata +
    // curinga pra qualquer sub-path/variante que o Google tenha pego.
    '/raio-x': { redirect: { to: '/', statusCode: 301 } },
    '/raio-x/**': { redirect: { to: '/', statusCode: 301 } },
    '/carteira': { headers: { 'cache-control': 'private, no-store' } },
    // /simulacao: pessoal e atrás de login (guard inline na página). O
    // resultado é da carteira de quem pediu — não pode encostar em cache
    // compartilhado de CDN.
    '/simulacao': { headers: { 'cache-control': 'private, no-store' } },
    // Configurações: pessoal e atrás de login → private/no-store (a página já é
    // noindex). Página única com seções ancoradas (sem sub-rotas).
    '/conta': { headers: { 'cache-control': 'private, no-store' } },
    '/noticias': { headers: { 'cache-control': 'public, s-maxage=180, stale-while-revalidate=600' } },
    '/asset/**': { headers: { 'cache-control': 'public, s-maxage=120, stale-while-revalidate=600' } },
    // Tesouro e dividendos: páginas próprias (em construção em frentes
    // paralelas) — cache já configurado pra quando entrarem no ar.
    '/tesouro': { headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600' } },
    '/tesouro/**': { headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600' } },
    '/dividendos/**': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    // '/guias/**' não casa a base — o hub precisa da regra exata (PR4).
    '/guias': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    '/guias/**': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    // Glossário (KIT 2026-07-14): conteúdo estável (dicionário) → cache longo.
    // Hub /glossario e cada termo /glossario/{slug} cacheiam 24h na borda.
    '/glossario': { headers: { 'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
    '/glossario/**': { headers: { 'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
    '/tese/**': { headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    // /teses: SSR 100% público (seed do design; favoritos hidratam client-side).
    '/teses': { headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    '/calculadoras': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    // /mcp: docs públicas do servidor MCP — conteúdo estático (o CTA troca de
    // destino client-side pós-mount, o SSR é idêntico pra todo mundo).
    '/mcp': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    // /business: landing da Redentia for Business. Conteúdo estático e SEM
    // variante logada (o console é outro app, sem sessão compartilhada), então
    // pode ser público na borda. A página está noindex até o PR5 — ver a trava
    // no topo de components/business/RbSeguranca.vue.
    '/business': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    // PR-F do MVP B2B: cadastro e chaves VARIAM por cookie (cadastro redireciona
    // logado pra /business/chaves; chaves é autenticada) → private/no-store,
    // pela regra "CDN não varia por cookie". O guia de conexão é estático.
    '/business/cadastro': { headers: { 'cache-control': 'private, no-store' } },
    '/business/chaves': { headers: { 'cache-control': 'private, no-store' } },
    '/business/skills': { headers: { 'cache-control': 'private, no-store' } },
    // Convite de chave: página pública que mostra um SEGREDO uma vez (a chave
    // nasce na tela de quem abriu o link). Nunca na borda.
    '/business/convite/**': { headers: { 'cache-control': 'private, no-store' } },
    // O guia de conexão virou o modal do painel de chaves (dono 2026-08-25,
    // "menos é mais"): 301 exato, mesmo padrão do '/calculadora'.
    '/business/comecar': { redirect: { to: '/business/chaves', statusCode: 301 } },
    // PR10: hub mudou de /calculadora pro /calculadoras (301 preserva o link
    // equity do hub antigo); as calculadoras individuais MANTÊM o path antigo
    // /calculadora/<slug> — conteúdo estático + interação client-side, cache longo.
    '/calculadora': { redirect: { to: '/calculadoras', statusCode: 301 } },
    '/calculadora/**': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    // Rankings (kit PLANO-RANKINGS.md): hub novo /rankings + detalhe nos
    // slugs ANTIGOS /ranking/<slug> (equity de SEO). O 301 do hub antigo é
    // EXATO ('/ranking' não casa '/ranking/**' no Nitro — mesma lição do
    // '/calculadora' acima). Backend cacheia 15 min → s-maxage=900 na borda.
    '/ranking': { redirect: { to: '/rankings', statusCode: 301 } },
    '/ranking/**': { headers: { 'cache-control': 'public, s-maxage=900, stale-while-revalidate=3600' } },
    '/rankings': { headers: { 'cache-control': 'public, s-maxage=900, stale-while-revalidate=3600' } },
    // Rotas antigas por classe morrem (stub [classe].vue deletado): as 3 de
    // equity viram filtro do hub; renda-fixa vira o detalhe do tesouro.
    '/rankings/acoes': { redirect: { to: '/rankings?classe=acoes', statusCode: 301 } },
    '/rankings/fiis': { redirect: { to: '/rankings?classe=fiis', statusCode: 301 } },
    '/rankings/bdrs': { redirect: { to: '/rankings?classe=bdrs', statusCode: 301 } },
    '/rankings/renda-fixa': { redirect: { to: '/ranking/tesouro-direto', statusCode: 301 } },
    // Setores (SEO programático /setor): hub /setor + detalhe /setor/{ptSlug}.
    // Audit: os slugs ingleses do /setor antigo não tinham tráfego relevante →
    // sem 301. Backend (GET /sectors) cacheia igual aos rankings → s-maxage=900.
    '/setor': { headers: { 'cache-control': 'public, s-maxage=900, stale-while-revalidate=3600' } },
    '/setor/**': { headers: { 'cache-control': 'public, s-maxage=900, stale-while-revalidate=3600' } },
    // Páginas estáticas/legais (institucional + metodologia): conteúdo jurídico/
    // editorial que quase nunca muda — cache longo na borda + SWR de 1 dia.
    '/institucional/**': { headers: { 'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
    '/metodologia': { headers: { 'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },

    // ——— Migração redentia.com.br → Nu (PR-A do PLANO-REFINO-POS-ATLAS) ———
    // 301s dos paths da Redentia antiga; cobrem 100% do top-30 orgânico real.
    // Só produzem efeito pleno quando o domínio apontar pro Nu, mas ficam
    // prontos desde já (e valem pra quem chegar por link antigo no vercel.app).
    // /asset/{ticker} voltou a ser a URL canônica (equity de SEO da antiga);
    // /acao/** só existiu por dias no vercel.app e agora 301a de volta.
    '/acao/**': { redirect: { to: '/asset/**', statusCode: 301 } },
    '/help': { redirect: { to: '/busca', statusCode: 301 } },
    '/search': { redirect: { to: '/busca', statusCode: 301 } },
    '/auth/**': { redirect: { to: '/login', statusCode: 301 } },
    // /dividendos/{ticker}: página própria em construção (frente paralela) —
    // o wildcard de redirect saiu; ficam só os EXATOS: o hub /dividendos e o
    // /dividendos/calendario (calendário ainda não existe) vão pro ranking
    // de DY, destino topicamente honesto.
    '/dividendos/calendario': { redirect: { to: '/ranking/maiores-dividend-yield', statusCode: 301 } },
    '/dividendos': { redirect: { to: '/ranking/maiores-dividend-yield', statusCode: 301 } },
    // Guia antigo com slug diferente → guia real Nu (301 preserva o equity).
    // /guias/calculadora-de-dividendos e /guias/acoes-fiis-dividendos-todo-mes
    // deixaram de ser 301 provisórios: viraram páginas reais de guia (KIT).
    '/guias/open-finance-carteira-espalhada': { redirect: { to: '/guias/open-finance', statusCode: 301 } },
    // Hubs de categoria da antiga → filtros do hub de rankings.
    '/acoes': { redirect: { to: '/rankings?classe=acoes', statusCode: 301 } },
    '/fiis': { redirect: { to: '/rankings?classe=fiis', statusCode: 301 } },
    '/etfs': { redirect: { to: '/rankings', statusCode: 301 } },
    '/small-caps': { redirect: { to: '/rankings', statusCode: 301 } },
    // /tesouro e /tesouro/[slug]: páginas reais em construção (frente
    // paralela) — os redirects provisórios pro ranking saíram; as regras de
    // cache vivem no bloco de cache acima.
    //
    // Slugs FANTASMAS do StatusInvest, apagados do tesouro_direto_si em
    // 18/09/2026 quando o snapshot passou pro CSV do Tesouro Transparente, e
    // desde então 404 com URL já indexada (~140 impressões em 90 dias). Os 8
    // Renda+ são os MESMOS títulos do CSV com o ano +3 (o SI rotulava errado;
    // maturity_date idêntica, 2049-12-15…2084-12-15). O NTN-B 2028 nunca foi
    // ofertado no Tesouro Direto: vai pro degrau mais próximo da escada (2030).
    // O tesouro-reserva-2036 NÃO entra aqui: é título real (lançado em
    // 11/05/2026) e voltou pelo CSV de vendas no fundamentals-scraper.
    '/tesouro/tesouro-renda-aposentadoria-extra-2033': { redirect: { to: '/tesouro/tesouro-renda-aposentadoria-extra-2030', statusCode: 301 } },
    '/tesouro/tesouro-renda-aposentadoria-extra-2038': { redirect: { to: '/tesouro/tesouro-renda-aposentadoria-extra-2035', statusCode: 301 } },
    '/tesouro/tesouro-renda-aposentadoria-extra-2043': { redirect: { to: '/tesouro/tesouro-renda-aposentadoria-extra-2040', statusCode: 301 } },
    '/tesouro/tesouro-renda-aposentadoria-extra-2048': { redirect: { to: '/tesouro/tesouro-renda-aposentadoria-extra-2045', statusCode: 301 } },
    '/tesouro/tesouro-renda-aposentadoria-extra-2053': { redirect: { to: '/tesouro/tesouro-renda-aposentadoria-extra-2050', statusCode: 301 } },
    '/tesouro/tesouro-renda-aposentadoria-extra-2058': { redirect: { to: '/tesouro/tesouro-renda-aposentadoria-extra-2055', statusCode: 301 } },
    '/tesouro/tesouro-renda-aposentadoria-extra-2063': { redirect: { to: '/tesouro/tesouro-renda-aposentadoria-extra-2060', statusCode: 301 } },
    '/tesouro/tesouro-renda-aposentadoria-extra-2068': { redirect: { to: '/tesouro/tesouro-renda-aposentadoria-extra-2065', statusCode: 301 } },
    '/tesouro/tesouro-ipca-com-juros-semestrais-2028': { redirect: { to: '/tesouro/tesouro-ipca-com-juros-semestrais-2030', statusCode: 301 } },
    // direto pra raiz (o /mercado também 301a pra '/' — evita corrente de 301)
    '/mercado-completo': { redirect: { to: '/', statusCode: 301 } },
    // /legal/* → /institucional/* (mesmos 3 slugs; a antiga tinha ~471
    // 404s de /legal/* reportados no Search Console — não herdar isso).
    '/legal/terms': { redirect: { to: '/institucional/terms', statusCode: 301 } },
    '/legal/privacy': { redirect: { to: '/institucional/privacy', statusCode: 301 } },
    '/legal/cookies': { redirect: { to: '/institucional/cookies', statusCode: 301 } },

    // ——— Cutover Redentia antiga → Nu, 2ª leva (Search Console 03/08/2026) ———
    // O levantamento do PR-A cobriu o top-30 orgânico da ANTIGA e passou batido
    // pelos guias. Estes 9 paths estavam 404 ao vivo somando 11.314 impressões
    // no trimestre. Não é alavanca (renderam 39 cliques), é higiene: 404 herdado
    // é sinal de site abandonado, e o Search Console contava 751 deles.
    '/guias/melhores-fiis-para-investir-em-2026': { redirect: { to: '/guias/melhores-fiis-2026', statusCode: 301 } },
    '/guias/petr4-vs-vale3-vs-itub4': { redirect: { to: '/guias/como-analisar-uma-acao', statusCode: 301 } },
    '/guias/redent-score-0-100-explicado': { redirect: { to: '/metodologia', statusCode: 301 } },
    // Análise de UM papel → a página desse papel. Em 03/08 o destino foi o guia
    // de método porque /asset era página de cotação; hoje /asset/PETR4 tem tese,
    // riscos, pares, histórico e FAQ. As consultas da URL velha são todas de
    // PETR4 ("petr4 análise fundamentalista 2026", "petr4 vale a pena"), e o guia
    // de método não herdou o sinal: a URL fazia 120 a 330 impressões por semana,
    // caiu a 3 na semana de 24/08, e o guia ganhou 51 em sete semanas. Soft 404.
    '/guias/analise-petr4-vale-a-pena-investir': { redirect: { to: '/asset/PETR4', statusCode: 301 } },
    // Proteção da carteira na crise (estrutura, correlação, liquidez) é assunto do
    // guia de carteira. A home não é destino: 301 pra raiz o Google lê como soft 404.
    '/guias/raio-x-da-carteira-em-crise': { redirect: { to: '/guias/como-montar-carteira-de-investimentos', statusCode: 301 } },
    // /api-portal tinha o 2º melhor CTR do site (7,83%) e é docs de integração:
    // vai pro /mcp, que é a superfície equivalente no Nu E é indexável.
    // /whitelabel e /pricing vão pro /business, topicamente correto. Ele está
    // `noindex` por TRAVA DE COMPLIANCE (RbSeguranca.vue:11-13, some no PR5), então
    // hoje o 301 serve o usuário e consolida sinal; passa a ranquear quando a trava cair.
    '/api-portal': { redirect: { to: '/mcp', statusCode: 301 } },
    '/api-portal/**': { redirect: { to: '/mcp', statusCode: 301 } },
    '/whitelabel': { redirect: { to: '/business', statusCode: 301 } },
    '/pricing': { redirect: { to: '/business', statusCode: 301 } },
    '/download': { redirect: { to: '/', statusCode: 301 } },
    // Achado do cruzamento de Páginas.csv: 3 URLs de /embed/ ainda rankeiam em
    // posição 3,8 a 4,1 (77 impressões) e todas dão 404. O Nu não tem embed.
    '/embed/**': { redirect: { to: '/calculadoras', statusCode: 301 } },

    // ——— Cutover Redentia antiga → Nu, 3ª leva (Search Console 23/09/2026) ———
    // Guias da antiga que o Google ainda exibia e que respondiam 404 com noindex.
    // Critério: só vira 301 a URL cujo destino responde à MESMA pergunta, e a
    // home nunca é destino. Sem equivalente no Nu, seguem 404 de propósito:
    // widgets-financeiros-para-site (o Nu não tem embed), seus-agentes (não há
    // agente autônomo), alertas-watchlist (não há página de watchlist nem de
    // alerta), hora-certa-de-vender-acoes (nenhum guia trata de venda) e
    // como-baixar-cei (nenhum guia trata do CEI).
    '/guias/como-investir-em-acoes-para-iniciantes': { redirect: { to: '/guias/como-investir-em-acoes', statusCode: 301 } },
    '/guias/como-declarar-acoes-imposto-renda': { redirect: { to: '/guias/como-declarar-investimentos-no-ir', statusCode: 301 } },
    // Poupança x IPCA+ e a tese de ganho com marcação a mercado no IPCA+ longo:
    // o guia do Tesouro explica o IPCA+, a marcação e a comparação com a poupança.
    '/guias/poupanca-vs-tesouro-ipca-mais-2026': { redirect: { to: '/guias/tesouro-direto-para-iniciantes', statusCode: 301 } },
    '/guias/como-ganhar-40-60-renda-fixa-2026': { redirect: { to: '/guias/tesouro-direto-para-iniciantes', statusCode: 301 } },
    // Páginas de recurso da antiga → o recurso equivalente no Nu.
    '/guias/calculadoras': { redirect: { to: '/calculadoras', statusCode: 301 } },
    '/guias/tesouro-redentia': { redirect: { to: '/tesouro', statusCode: 301 } },
    // Comparar ativos, no Nu, é o simulador: vários papéis na mesma simulação,
    // com rentabilidade por ativo.
    '/guias/comparador-ativos': { redirect: { to: '/calculadora/acoes', statusCode: 301 } },
    // O assistente de IA da antiga (Redent.IA) é a Redentia AI, que mora na
    // /busca (mesmo destino do /help). A /busca é noindex: o 301 atende quem
    // chega pelo link, não carrega ranking.
    '/guias/pergunte-redentia': { redirect: { to: '/busca', statusCode: 301 } },
    // Calendário de proventos (data com e pagamento) → o guia das datas do
    // provento. Não '/dividendos': ele mesmo é 301, e o destino viraria corrente.
    '/guias/dividendos': { redirect: { to: '/guias/data-com-e-data-ex', statusCode: 301 } },
    // Os riscos que o Raio-X apontava (concentração, correlação, país) estão na
    // seção "Diversificação de verdade" do guia de carteira.
    '/guias/raio-x-carteira': { redirect: { to: '/guias/como-montar-carteira-de-investimentos', statusCode: 301 } },
  },

  nitro: {
    // useEvent() fora de handler: o server/plugins/backend-front-key.ts lê o
    // request em curso de dentro do $fetch do SSR pra carimbar o IP do visitante.
    experimental: { asyncContext: true },
    // Dev: browser fetches de /api/* vão pro VPS por default (dev funciona sem
    // backend local). Override: NUXT_BACKEND_URL / NUXT_CHAT_SERVICE_URL.
    devProxy: {
      '/api/backend': {
        target: process.env.NUXT_BACKEND_URL ?? 'https://redentia-api.saraivada.com/api',
        changeOrigin: true,
      },
      '/api/chat': {
        target: process.env.NUXT_CHAT_SERVICE_URL ?? 'https://redentia-api.saraivada.com/chat',
        changeOrigin: true,
        ws: true,
      },
    },
  },

  components: [{ path: '~/components', pathPrefix: false }],
  imports: { dirs: ['services'] },
})
