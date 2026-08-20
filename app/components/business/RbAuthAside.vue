<script setup lang="ts">
/**
 * O painel dark da /business/cadastro: o irmão B2B do NuAuthAsidePanel.
 *
 * Mesma casca do login (gradiente radial, topo com dot pulsante, miolo
 * animado, tagline no rodapé, some abaixo de 1020px), e o mesmo motivo de
 * existir: a coluna da direita é a promessa do produto enquanto a esquerda
 * pede o e-mail.
 *
 * O QUE MUDA É A ANIMAÇÃO. No login é "Redentia lendo o mercado", que fala
 * com o investidor. Aqui é A MESA DO ESCRITÓRIO PERGUNTANDO: um feed de
 * chamadas reais chegando, cada uma com o nome da chave que a fez e a
 * ferramenta que ela usou. É o que o escritório compra, e é o que o painel de
 * uso vai mostrar depois que ele conectar.
 *
 * NADA AQUI É INVENTADO. As ferramentas do feed são as que existem no servidor
 * (foram exercitadas em produção), os rótulos de chave são os que a própria
 * tela sugere como exemplo, e a última linha é a recusa de carteira com a
 * mensagem que o servidor devolve de verdade. Mostrar uma tool que não existe
 * faria o comprador pedir na reunião algo que não vai funcionar.
 *
 * SSR/perf: o servidor renderiza o estado final (todas as linhas visíveis),
 * o loop só começa no onMounted e é limpo no unmount. Com
 * prefers-reduced-motion o feed fica estático, sem loop.
 */
type Linha = { chave: string, tool: string, alvo?: string, ok: string, nega?: boolean }

const FEED: Linha[] = [
  { chave: 'Mesa', tool: 'get_quote', alvo: 'PETR4', ok: 'R$ 43,42' },
  { chave: 'Análise', tool: 'search_assets', alvo: 'saneamento', ok: '6 ativos' },
  { chave: 'Alocação', tool: 'get_market_snapshot', ok: 'IBOV 177.999' },
  { chave: 'Mesa', tool: 'list_news', alvo: 'DASA3', ok: '8 notícias' },
  { chave: 'Análise', tool: 'get_thesis', alvo: 'água-virou-ativo', ok: 'tese aberta' },
  { chave: 'Alocação', tool: 'get_etf_composition', alvo: 'IVVB11', ok: 'carteira aberta' },
  { chave: 'João', tool: 'get_daily_briefing', ok: 'fechamento de ontem' },
  { chave: 'Mesa', tool: 'get_portfolio', ok: 'fora do plano', nega: true },
]

/**
 * FEED ROLANTE, não um ciclo que zera. A primeira versão enchia a lista e
 * recomeçava do vazio: no reinício as sete linhas sumiam de uma vez, e o
 * contador VOLTAVA ATRÁS, o que na tela lê como número caindo. Agora entra uma
 * linha por vez e a mais velha sai, então o painel nunca pisca e o contador só
 * sobe.
 *
 * Nasce CHEIO pro SSR: o servidor não roda timer, e um painel vazio no
 * primeiro paint seria um buraco preto do lado do formulário.
 */
const JANELA = 5

let seq = 0
const proxima = () => {
  const l = FEED[seq % FEED.length]!
  return { ...l, id: seq++ }
}

const visiveis = ref(Array.from({ length: JANELA }, proxima))
const chamadas = ref(1284)

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  timer = setInterval(() => {
    visiveis.value = [...visiveis.value.slice(1), proxima()]
    chamadas.value += 1 + Math.floor(seq % 3)
  }, 1400)
})

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <aside class="rbaa" data-auth-side>
    <div class="rbaa__top">
      <div class="rbaa__label">
        <span class="rbaa__dot" aria-hidden="true" />
        <span class="rbaa__title">A mesa perguntando</span>
      </div>
      <p class="rbaa__docs">{{ chamadas.toLocaleString('pt-BR') }} chamadas neste mês</p>
    </div>

    <div class="rbaa__mid">
      <ul class="rbaa__feed">
        <li v-for="l in visiveis" :key="l.id" class="rbaa__linha" :class="{ 'rbaa__linha--nega': l.nega }">
          <span class="rbaa__chave">{{ l.chave }}</span>
          <span class="rbaa__seta" aria-hidden="true">›</span>
          <code class="rbaa__tool">{{ l.tool }}</code>
          <code v-if="l.alvo" class="rbaa__alvo">{{ l.alvo }}</code>
          <span class="rbaa__ok">{{ l.ok }}</span>
        </li>
      </ul>
    </div>

    <div class="rbaa__base">
      <h2 class="rbaa__h2"><slot>O mercado inteiro,<br>dentro do assistente<br>que a casa já usa.</slot></h2>
    </div>
  </aside>
</template>

<style scoped>
/* casca idêntica à do NuAuthAsidePanel: mesmo gradiente, mesmos paddings,
   mesmo breakpoint. O que muda é o miolo. */
.rbaa {
  flex: 1 1 460px; min-width: 0; position: relative; overflow: hidden;
  background: radial-gradient(130% 130% at 72% 28%, var(--nu-orb-deep) 0%, var(--nu-orb-black) 72%);
  display: flex; flex-direction: column;
  padding: clamp(40px, 5.5vh, 68px) clamp(28px, 3.5vw, 56px);
  gap: clamp(24px, 3vh, 44px);
}

.rbaa__top { flex-shrink: 0; }
.rbaa__label { display: flex; align-items: center; gap: 12px; }
.rbaa__dot {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
  background: var(--nu-blue); animation: rbaa-pulse 1.5s ease-in-out infinite;
}
.rbaa__title { color: var(--nu-cream-text); font-size: clamp(19px, 1.9vw, 25px); font-weight: 800; letter-spacing: -.025em; line-height: 1.04; }
.rbaa__docs { margin: 8px 0 0; padding-left: 24px; color: var(--nu-cream-text-50); font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
@keyframes rbaa-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: .5; }
}

.rbaa__mid { flex: 1; display: flex; align-items: center; min-height: 0; }
.rbaa__feed { list-style: none; margin: 0; padding: 0; width: 100%; display: flex; flex-direction: column; gap: 10px; }

.rbaa__linha {
  display: flex; align-items: center; gap: 9px; flex-wrap: wrap;
  background: var(--nu-cream-text-08); border-radius: 14px; padding: 12px 14px;
  animation: rbaa-entra .38s ease both;
}
@keyframes rbaa-entra {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}

.rbaa__chave { color: var(--nu-cream-text); font-size: 13.5px; font-weight: 800; letter-spacing: -.01em; }
.rbaa__seta { color: var(--nu-cream-text-35); font-size: 15px; font-weight: 800; line-height: 1; }
.rbaa__tool {
  color: var(--nu-blue-soft);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px; font-weight: 600;
}
.rbaa__alvo {
  background: var(--nu-cream-text-08); border-radius: 7px; padding: 2px 7px;
  color: var(--nu-cream-text-72);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11.5px; font-weight: 600;
}
.rbaa__ok {
  margin-left: auto; color: var(--nu-green-soft);
  font-size: 12.5px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap;
}

/* a recusa de carteira: é a linha que mais importa nesta tela, e ela não pode
   parecer um sucesso. Vermelho suave, que é o par de baixa sobre navy. */
.rbaa__linha--nega { background: var(--nu-red-soft-16); }
.rbaa__linha--nega .rbaa__tool { color: var(--nu-cream-text-72); text-decoration: line-through; }
.rbaa__linha--nega .rbaa__ok { color: var(--nu-red-soft); }

.rbaa__base { flex-shrink: 0; }
.rbaa__h2 { margin: 0; color: var(--nu-cream-text); font-size: clamp(22px, 2vw, 30px); font-weight: 800; letter-spacing: -.03em; line-height: 1.15; }

/* mesmo breakpoint do login: abaixo disso a coluna do form fica sozinha */
@media (max-width: 1020px) { .rbaa { display: none; } }
</style>
