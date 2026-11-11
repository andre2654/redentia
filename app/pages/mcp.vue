<script setup lang="ts">
// /mcp — documentação pública do Aportou MCP (até 11/11/2026, Redentia MCP). REBUILD guiado pelo dono
// (2026-07-17): a 1ª versão saiu do padrão visual; esta é reconstruída
// componente a componente, cada um aprovado antes do próximo. Régua de
// design: a gramática EXATA dos hubs (calculadoras/teses) — hero creme com
// eyebrow + H1 gigante + sub (valores copiados verbatim do chb__hero) — e a
// identidade MCP do ContaMcp só onde for a banda azul.
//
// CTA auth-aware sem variar o SSR (regra do repo: CDN não varia por cookie):
// servidor sempre renderiza o destino anônimo (/login?redirect=/conta#mcp,
// que pra quem já está logado repassa na hora); pós-mount troca pra direto.
const { isAuthenticated } = useAuthState()
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const ctaTo = computed(() => (mounted.value && isAuthenticated.value ? '/conta#mcp' : '/login?redirect=%2Fconta%23mcp'))

/* O wizard de conexão é o RbConexaoModal (origem="mcp"). */
const conexaoAberta = ref(false)

/* ——— tabela comparativa (referência do dono 2026-07-18, perguntas de
       INVESTIDOR): o que muda quando a IA ganha os dados da Redentia ——— */
type Cell = 'yes' | 'no' | 'partial' | 'na'
const COMPARE_COLS = ['App da corretora', 'App de carteira', 'IA sem conexão']
const COMPARE: { q: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  { q: 'Ver a carteira consolidada de várias corretoras', cells: ['no', 'yes', 'no', 'yes'] },
  { q: 'Perguntar em linguagem natural sobre a MINHA carteira', cells: ['no', 'no', 'partial', 'yes'] },
  { q: '"Quanto recebi de dividendos este ano?"', cells: ['partial', 'yes', 'no', 'yes'] },
  { q: 'Cruzar a carteira com uma tese de investimento', cells: ['no', 'no', 'no', 'yes'] },
  { q: 'Cotações e fundamentos da B3 na conversa, sem alucinação', cells: ['na', 'na', 'no', 'yes'] },
  { q: 'Enxergar concentração e risco antes de aportar', cells: ['no', 'partial', 'no', 'yes'] },
  { q: 'Funcionar dentro do Claude e do Cursor', cells: ['no', 'no', 'na', 'yes'] },
  { q: 'Notícias do dia com leitura de IA sobre os seus ativos', cells: ['no', 'no', 'partial', 'yes'] },
  { q: '"E se o dólar for a R$ 7?" com a faixa em reais de hoje, por ativo', cells: ['no', 'no', 'no', 'yes'] },
  { q: 'Somente leitura, revogável em um clique', cells: ['na', 'yes', 'na', 'yes'] },
]

/* ——— FAQ (accordion padrão do site + FAQPage no JSON-LD) ——— */
const FAQS = [
  { q: 'O que é o Aportou MCP?', a: 'MCP (Model Context Protocol) é o padrão aberto que conecta assistentes de IA a fontes de dados externas. O Aportou MCP é o servidor oficial da Aportou nesse padrão: com ele, o Claude, o Cursor e outros clientes compatíveis respondem sobre a sua carteira, cotações da B3, teses e notícias com dados reais, não genéricos, e rodam o motor de projeções da Aportou sobre uma carteira.' },
  { q: 'O que são os cenários e projeções?', a: 'É o motor de projeções da Aportou dentro da sua IA, em duas ferramentas: list_scenarios lista os cenários estudados pela Aportou, com fontes, e simulate_scenario aplica um cenário (ou um choque de dólar, Selic, bolsa, petróleo ou inflação montado na hora) sobre a carteira que você descreve na conversa e devolve a faixa do patrimônio em reais de hoje, com quem mais sente o choque e por quê. O escopo vem desligado: ligue em Configurações, seção MCP, em Cenários e projeções.' },
  { q: 'A Aportou prevê o mercado?', a: 'Não. Ela mostra a faixa do que pode acontecer com uma carteira num cenário, da ponta de baixo (p10) à de cima (p90), em reais de hoje e com as premissas abertas. Cenário estudado pela Aportou vem com fontes; cenário montado na hora vem rotulado assim, sem precedente histórico que o ancore. É faixa estatística, não previsão nem promessa de retorno, e não é recomendação.' },
  { q: 'Quanto custa?', a: 'Nada. A chave é gratuita: basta ter uma conta na Aportou, gerar a chave em Configurações e colar a configuração no seu assistente.' },
  { q: 'Existe limite de uso?', a: 'Sim, um limite de uso justo: 50 consultas por dia e 60 por minuto por chave, que renovam sozinhos. A simulação de cenário é cálculo pesado e tem um sub-limite próprio, de 10 por dia e 3 por minuto, que também conta nas 50 do dia. É bem mais do que uma conversa sobre a sua carteira consome, e existe para manter a chave gratuita de pé para todo mundo. Escritório que usa o MCP como ferramenta de trabalho tem plano próprio no Redentia For Business, o produto da mesma empresa para escritórios, com limite muito maior: redentia.com.br/business.' },
  { q: 'A IA consegue mexer na minha carteira?', a: 'Não. O acesso é somente leitura por design: o MCP responde consultas (posições, proventos, cotações, teses, notícias) e não executa nenhuma ação. Não existe ferramenta de compra, venda ou alteração de dados.' },
  { q: 'Quais assistentes funcionam hoje?', a: 'O claude.ai conecta como conector personalizado: cole a URL, clique em Connect e autorize com a sua chave. O ChatGPT conecta pelo modo desenvolvedor da OpenAI, do mesmo jeito. Cursor, Claude Code e Raycast conectam direto com a chave; o Claude Desktop, pela ponte mcp-remote.' },
  { q: 'De onde vem a minha carteira?', a: 'Do Open Finance, a conexão oficial regulada pelo Banco Central. Você conecta corretoras e bancos (XP, Nubank, Itaú, BTG e mais de 100 instituições) e a Aportou importa suas posições automaticamente, sempre somente leitura.' },
  { q: 'Como revogo o acesso?', a: 'Em Configurações, seção MCP: desligue o interruptor, gere uma nova chave (a antiga para de valer) ou desligue escopos individuais, como carteira ou cenários, mantendo o resto. A mudança vale em até um minuto, porque o servidor guarda a validação da chave por sessenta segundos.' },
]

usePageSeo({
  title: `${MARCA.nome} MCP: sua carteira da B3 no Claude e no Cursor`,
  description: `Servidor MCP oficial da ${MARCA.nome}: conecte sua carteira, cotações da B3, teses e notícias ao seu assistente de IA. Chave gratuita, acesso somente leitura.`,
  path: '/mcp',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: `${MARCA.nome} MCP`, path: '/mcp' },
  ],
  structuredData: [
    {
      '@type': 'SoftwareApplication',
      'name': `${MARCA.nome} MCP`,
      'applicationCategory': 'FinanceApplication',
      'operatingSystem': 'Web',
      'description': `Servidor MCP (Model Context Protocol) da ${MARCA.nome}: carteira da B3 via Open Finance, cotações, teses de investimento e notícias para assistentes de IA.`,
    },
    {
      '@type': 'FAQPage',
      'mainEntity': FAQS.map((f) => ({
        '@type': 'Question',
        'name': f.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
      })),
    },
  ],
})
</script>

<template>
  <div class="mdoc">
    <!-- HERÓI — duas colunas (texto à esquerda, demo à direita) sobre o creme
         da página, com o eyebrow da marca e a pílula da seta (11/11/2026) -->
    <section class="mdoc__hero">
      <div class="mdoc__cols">
        <div class="mdoc__left">
          <NuEyebrow como="p">Aportou MCP</NuEyebrow>
          <h1 class="mdoc__h1">Sua carteira,<br>dentro da sua IA.</h1>
          <p class="mdoc__sub">
            Conecte a Aportou ao Claude, ao Cursor e a outros assistentes compatíveis.
            Sua IA passa a responder com a sua carteira, cotações da B3, teses e notícias,
            e a rodar cenários sobre ela. Grátis, somente leitura e revogável a qualquer momento.
          </p>
          <NuBotaoSeta :to="ctaTo" class="mdoc__cta">Gerar minha chave</NuBotaoSeta>
        </div>
        <div class="mdoc__right">
          <McpHeroDemo />
        </div>
      </div>
    </section>

    <!-- PAINEL AZUL — os três passos sobre o gradiente cobalto da marca, com o
         corte gigante no canto; os cartões são carvão translúcido e o número
         leva o verde claro (o acento do MCP) -->
    <section class="mdoc__band">
      <div class="mdoc__painel">
        <MarcaCorte class="mdoc__painel-corte nu-corte-fundo" :largura="520" cor="var(--nu-white)" />
        <div class="mdoc__band-in">
          <NuEyebrow como="p" sobre="azul">Como funciona</NuEyebrow>
          <h2 class="mdoc__band-title">Três passos e a sua IA<br>fica do lado de dentro.</h2>
          <ol class="mdoc__steps">
            <li class="mdoc__step">
              <span class="mdoc__step-n">1</span>
              <div>
                <div class="mdoc__step-t">Gere a chave</div>
                <p class="mdoc__step-p">Em Configurações, seção MCP. A chave aparece uma única vez, copie na hora.</p>
              </div>
            </li>
            <li class="mdoc__step">
              <span class="mdoc__step-n">2</span>
              <div>
                <div class="mdoc__step-t">Conecte no assistente</div>
                <p class="mdoc__step-p">O passo a passo abre logo abaixo, no formato do Claude ou do ChatGPT.</p>
              </div>
            </li>
            <li class="mdoc__step">
              <span class="mdoc__step-n">3</span>
              <div>
                <div class="mdoc__step-t">Pergunte</div>
                <p class="mdoc__step-p">"Como está a minha carteira hoje?" e a resposta vem com os seus dados reais.</p>
              </div>
            </li>
          </ol>
          <div class="mdoc__endpoint">
            <span class="mdoc__endpoint-label">Endpoint</span>
            <code class="mdoc__endpoint-url">https://redentia-api.saraivada.com/mcp</code>
            <span class="mdoc__endpoint-note">streamable HTTP · <code>Authorization: Bearer rdt_mcp_…</code></span>
          </div>
        </div>
      </div>
    </section>

    <!-- COMO CONECTAR — o passo a passo virou o wizard (o mesmo modal do
         /business/chaves, origem="mcp"): uma pergunta por tela, Claude ou
         ChatGPT. A seção só abre a porta; os prints e as configs por
         assistente saíram com ela (decisão do dono 2026-08-25). -->
    <section id="como-conectar" class="mdoc__sec mdoc__sec--band">
      <div class="mdoc__in">
        <NuEyebrow como="p">Passo a passo</NuEyebrow>
        <h2 class="mdoc__h2">Como conectar</h2>
        <p class="mdoc__lead">
          Um passo a passo de um minuto, no formato do seu assistente: Claude ou ChatGPT.
          A chave fica em <NuxtLink :to="ctaTo" class="mdoc__link">Configurações → MCP</NuxtLink>.
        </p>
        <NuBotaoSeta variante="carvao" tamanho="m" class="mdoc__cta" @click="conexaoAberta = true">Ver o passo a passo</NuBotaoSeta>
      </div>
    </section>

    <!-- CORRETORAS — animada (dono 2026-07-18): o filme do seletor Open
         Finance à direita, "Bancos e corretoras suportadas" ao lado -->
    <section class="mdoc__sec">
      <div class="mdoc__in">
        <div class="mdoc__cols">
          <div class="mdoc__left">
            <NuEyebrow como="p">Open Finance</NuEyebrow>
            <h2 class="mdoc__h2">Bancos e corretoras<br>suportadas.</h2>
            <p class="mdoc__lead">
              A carteira que a sua IA lê chega na Aportou pelo <strong>Open Finance</strong>, a conexão oficial
              regulada pelo Banco Central. XP, Nubank, Itaú, BTG Pactual, Rico, Clear, Inter, C6, Bradesco,
              Santander, Banco do Brasil, Toro, Avenue, Ágora e mais de 100 outras instituições.
            </p>
            <p class="mdoc__insts-note">
              Sempre somente leitura: você escolhe o que compartilhar e desconecta quando quiser.
            </p>
          </div>
          <div class="mdoc__right">
            <McpInstDemo />
          </div>
        </div>

        <!-- faixa central: avatares das instituições + círculo de contagem -->
        <div class="mdoc__strip" aria-label="Instituições suportadas">
          <span v-for="s in ['xp', 'nubank', 'itau', 'btg', 'bradesco', 'santander', 'bb', 'inter', 'rico', 'c6']" :key="s" class="mdoc__ava">
            <img :src="`/instituicoes/${s}.svg`" :alt="s" width="30" height="30" loading="lazy">
          </span>
          <span class="mdoc__ava mdoc__ava--more">+100</span>
        </div>
      </div>
    </section>

    <!-- COMPARATIVO — o que muda quando você conecta (perguntas de investidor) -->
    <section class="mdoc__sec mdoc__sec--band">
      <div class="mdoc__in">
        <div class="mdoc__cmp-head">
          <NuEyebrow como="p" class="mdoc__eyebrow-centro">O que muda quando você conecta</NuEyebrow>
          <h2 class="mdoc__h2 mdoc__h2--center">O app da corretora <em>mostra</em> a carteira.<br>A sua IA com a Aportou <em>entende</em>.</h2>
          <p class="mdoc__lead mdoc__lead--center">
            Compare o que você consegue fazer hoje com o que passa a conseguir depois de colar uma configuração no seu assistente.
          </p>
        </div>
        <div class="mdoc__cmp-card">
          <div class="mdoc__cmp-scroll">
            <table class="mdoc__cmp">
              <thead>
                <tr>
                  <th class="mdoc__cmp-q">Quero…</th>
                  <th v-for="c in COMPARE_COLS" :key="c">{{ c }}</th>
                  <th class="mdoc__cmp-us">Aportou MCP</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in COMPARE" :key="row.q">
                  <td class="mdoc__cmp-q">{{ row.q }}</td>
                  <td v-for="(cell, i) in row.cells" :key="i" :class="{ 'mdoc__cmp-us': i === 3 }">
                    <svg v-if="cell === 'yes'" class="mdoc__yes" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg>
                    <svg v-else-if="cell === 'no'" class="mdoc__no" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    <span v-else class="mdoc__cell-txt">{{ cell === 'partial' ? 'parcial' : 'n/a' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ — accordion padrão do site, sobre o creme da página -->
    <section class="mdoc__sec">
      <div class="mdoc__faq">
        <NuEyebrow como="p" class="mdoc__eyebrow-centro">Dúvidas</NuEyebrow>
        <h2 class="mdoc__h2 mdoc__h2--center">Perguntas frequentes</h2>
        <div class="mdoc__faq-list">
          <NuFaqAccordion :items="FAQS.map((f) => ({ q: f.q, a: f.a }))" :default-open="-1" />
        </div>
      </div>
    </section>

    <RbConexaoModal :open="conexaoAberta" :plain-key="null" origem="mcp" @close="conexaoAberta = false" />

    <!-- CHAMADA FINAL — faixa sálvia (o rodapé logo abaixo é carvão), com o
         corte em carvão no eyebrow, como no quadro da home -->
    <section class="mdoc__final">
      <p class="nu-eyebrow mdoc__eyebrow-centro"><MarcaCorte cor="var(--nu-ink)" /><span>Aportou MCP</span></p>
      <h2 class="mdoc__final-t">Dois minutos e a sua IA<br>fica do lado de dentro.</h2>
      <p class="mdoc__final-p">Gere a chave grátis e conecte a Aportou ao seu assistente hoje.</p>
      <NuBotaoSeta :to="ctaTo" variante="carvao" class="mdoc__cta">Gerar minha chave</NuBotaoSeta>
    </section>
  </div>
</template>

<style scoped>
/* A página na personalidade da Aportou (11/11/2026): creme da página, faixas
   --nu-band, o painel cobalto dos passos, carvão no fecho. Nenhuma faixa
   branca de ponta a ponta: branco é só cartão. Cor só por token. */
.mdoc { --g: clamp(20px, 5.5vw, 80px); background: var(--nu-page); }
.mdoc__in { max-width: 1240px; margin: 0 auto; }

/* ——— herói ——— */
.mdoc__hero {
  padding: clamp(56px, 8vw, 104px) var(--g) clamp(52px, 7vw, 84px);
  animation: nu-fade .5s ease both;
}
/* duas colunas na anatomia do herói da home: texto + demo */
.mdoc__cols { display: flex; gap: clamp(28px, 5vw, 72px); align-items: center; flex-wrap: wrap; max-width: 1240px; margin: 0 auto; }
.mdoc__left { flex: 1.1 1 460px; min-width: min(320px, 100%); }
.mdoc__right { flex: 1 1 380px; min-width: min(320px, 100%); display: flex; justify-content: center; }
/* H1 no clamp do herói de duas colunas: divide a largura com a demo */
.mdoc__h1 {
  margin: 18px 0 0; color: var(--nu-ink);
  font-size: clamp(44px, 5.4vw, 84px); font-weight: 800;
  letter-spacing: -0.04em; line-height: .98; text-wrap: balance;
}
.mdoc__sub {
  color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500;
  line-height: 1.45; margin: 22px 0 0; max-width: 600px;
}
.mdoc__cta { margin-top: 30px; }

/* ——— painel azul: o gradiente cobalto da marca, raio de seção, o corte
       gigante a 8% no canto; cartões de passo em carvão translúcido ——— */
.mdoc__band { padding: 0 var(--g) clamp(52px, 6.5vw, 84px); }
.mdoc__painel {
  position: relative; overflow: hidden; max-width: 1240px; margin: 0 auto;
  background: var(--nu-grad-cobalto); border-radius: var(--nu-r-secao);
  padding: clamp(36px, 5.2vw, 72px) clamp(22px, 5vw, 64px);
  animation: nu-fade .5s ease .08s both;
}
.mdoc__painel-corte { position: absolute; right: -90px; bottom: -150px; opacity: .08; pointer-events: none; }
.mdoc__band-in { position: relative; }
.mdoc__band-title {
  margin: 18px 0 0; color: var(--nu-white);
  font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02;
}
.mdoc__steps {
  list-style: none; margin: clamp(28px, 3.5vw, 40px) 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: 16px;
}
.mdoc__step {
  display: flex; gap: 14px; align-items: flex-start;
  background: color-mix(in srgb, var(--nu-ink) 46%, transparent);
  box-shadow: inset 0 0 0 1.5px var(--nu-white-14);
  border-radius: var(--nu-r-panel); padding: 22px 20px;
  animation: nu-fade .5s ease both;
}
.mdoc__step:nth-child(2) { animation-delay: .06s; }
.mdoc__step:nth-child(3) { animation-delay: .12s; }
.mdoc__step-n {
  width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: var(--nu-green-soft); color: var(--nu-ink); border-radius: 50%; font-size: var(--nu-fs-md); font-weight: 800;
}
.mdoc__step-t { color: var(--nu-white); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; }
.mdoc__step-p { margin: 6px 0 0; color: var(--nu-blue-on-blue); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.mdoc__endpoint { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: clamp(24px, 3vw, 32px); }
.mdoc__endpoint-label { color: var(--nu-blue-on-blue); font-size: var(--nu-fs-marca); font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
.mdoc__endpoint-url {
  background: color-mix(in srgb, var(--nu-ink) 60%, transparent); color: var(--nu-green-soft);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: var(--nu-fs-sm); font-weight: 500;
  padding: 11px 15px; border-radius: var(--nu-r-chip); overflow-x: auto; white-space: nowrap; max-width: 100%;
}
.mdoc__endpoint-note { color: var(--nu-blue-on-blue-2); font-size: var(--nu-fs-dense); font-weight: 500; }
.mdoc__endpoint-note code { color: var(--nu-white); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

/* ——— seções: página e faixa quente se alternam ——— */
.mdoc__sec { padding: clamp(64px, 7vw, 100px) var(--g); }
.mdoc__sec--band { background: var(--nu-band); }
.mdoc__h2 { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; text-wrap: balance; }
.mdoc__lead { color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.5; margin: 18px 0 0; max-width: 720px; }
.mdoc__link { color: var(--nu-blue-text); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }

/* ——— corretoras ——— */
.mdoc__insts-note { margin: 20px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.6; max-width: 720px; }
/* faixa central de avatares sobrepostos + círculo de contagem */
.mdoc__strip { display: flex; justify-content: center; align-items: center; margin-top: clamp(36px, 4.5vw, 56px); }
.mdoc__ava {
  width: 48px; height: 48px; border-radius: 50%; background: var(--nu-white);
  border: 2.5px solid var(--nu-page); box-shadow: var(--nu-shadow-quente);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  margin-left: -10px;
}
.mdoc__ava:first-child { margin-left: 0; }
.mdoc__ava img { width: 28px; height: 28px; object-fit: contain; }
.mdoc__ava--more {
  background: var(--nu-ink); color: var(--nu-white);
  font-size: var(--nu-fs-dense); font-weight: 800; letter-spacing: -0.02em;
}

/* ——— comparativo: cartão branco dentro da faixa quente ——— */
.mdoc__cmp-head { text-align: center; max-width: 820px; margin: 0 auto; }
.mdoc__eyebrow-centro { justify-content: center; }
.mdoc__h2 em { color: var(--nu-blue-text); font-style: normal; }
.mdoc__lead--center { margin-left: auto; margin-right: auto; }
.mdoc__cmp-card {
  background: var(--nu-white); border-radius: var(--nu-r-panel);
  box-shadow: var(--nu-shadow-branco); margin: 36px auto 0; max-width: 1080px;
  overflow: hidden;
}
.mdoc__cmp-scroll { overflow-x: auto; }
.mdoc__cmp { width: 100%; min-width: 720px; border-collapse: collapse; }
.mdoc__cmp th {
  color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  text-align: center; padding: 18px 14px; border-bottom: 1.5px solid var(--nu-line-2);
}
.mdoc__cmp th.mdoc__cmp-q { text-align: left; padding-left: 24px; }
.mdoc__cmp td { text-align: center; padding: 15px 14px; border-bottom: 1.5px solid var(--nu-line-2); }
.mdoc__cmp tbody tr:last-child td { border-bottom: 0; }
.mdoc__cmp td.mdoc__cmp-q { text-align: left; padding-left: 24px; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; line-height: 1.4; }
.mdoc__cmp th.mdoc__cmp-us { color: var(--nu-blue-text); }
.mdoc__cmp .mdoc__cmp-us { background: var(--nu-blue-bg); }
.mdoc__yes { color: var(--nu-blue); display: inline-block; vertical-align: middle; }
.mdoc__no { color: var(--nu-sand); display: inline-block; vertical-align: middle; }
.mdoc__cell-txt { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 600; }

/* ——— FAQ + chamada final ——— */
.mdoc__faq { max-width: 860px; margin: 0 auto; text-align: center; }
.mdoc__faq-list { margin-top: clamp(28px, 3.5vw, 40px); text-align: left; }
.mdoc__final {
  background: var(--nu-sage); padding: clamp(64px, 8vw, 104px) var(--g); text-align: center;
  display: flex; flex-direction: column; align-items: center;
}
.mdoc__final-t { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; text-wrap: balance; }
.mdoc__final-p { margin: 18px 0 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; }

@media (max-width: 640px) {
  .mdoc__band { padding-left: 12px; padding-right: 12px; }
  .mdoc__painel { border-radius: var(--nu-r-card-lg); }
  .mdoc__painel-corte { width: 280px; height: auto; right: -70px; bottom: -80px; }
}
@media (prefers-reduced-motion: reduce) {
  .mdoc__hero, .mdoc__painel, .mdoc__step { animation: none; }
}
</style>
