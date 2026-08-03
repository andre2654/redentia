<script setup lang="ts">
/**
 * Banda D: o que a chave alcança, e o que ela não alcança.
 *
 * MESMA ANATOMIA DO "O dia no mercado." da home (direção do dono 2026-08-03:
 * "deixe igual a essa seção na home"): banda de cor chapada, cabeçalho
 * centralizado, quatro cards escuros com ícone de contorno no topo, o primeiro
 * carregando um número, e dois gatilhos embaixo. Os valores vêm do
 * `NuDaySection` verbatim (card `--nu-day-card-navy`, raio `--nu-r-card-lg`,
 * padding 34/30/32, min-height 300, ícone de 34px, stat de 38 a 44px, blurb
 * 16,5px em `--nu-white-75`) — é o mesmo desenho, não uma imitação.
 *
 * A banda é AZUL e não navy porque a navy já é a banda do gráfico: duas bandas
 * escuras idênticas na mesma página apagariam a diferença entre "o consumo" e
 * "o contrato". O `NuDaySection` existe justamente nos dois tons pelo mesmo
 * motivo.
 *
 * O MODAL é o `NuDayModal`, reusado sem fork: ele é burro e recebe blocos
 * `{label, color, html}` prontos. O card resume, o modal nomeia as ferramentas
 * uma a uma — que é o detalhe que o escritório pede quando vai conectar.
 */
import type { BusinessAccountStatus } from '~/composables/useBusinessAccount'

const props = defineProps<{ conta: BusinessAccountStatus }>()

const num = (n: number | null | undefined) => (n ?? 0).toLocaleString('pt-BR')
const escopos = computed(() => props.conta.scopes ?? [])

/**
 * Os escopos chegam com o nome que o servidor usa (`news`), e ele aparece no
 * log e no runbook. Na tela ele vira o nome em português, sem deixar de ser o
 * mesmo escopo. Um slug desconhecido passa direto, em vez de sumir.
 */
const NOMES: Record<string, string> = { mercado: 'Mercado', teses: 'Teses', news: 'Notícias', carteira: 'Carteira' }
const escoposLegiveis = computed(() => escopos.value.map(s => NOMES[s] ?? s).join(', '))

const aberto = ref(false)
const gatilho = ref<HTMLButtonElement | null>(null)

function abrir() { aberto.value = true }
function fechar() {
  aberto.value = false
  nextTick(() => gatilho.value?.focus())
}

/**
 * Os quatro cards. O primeiro leva o número, como na home; os outros três são
 * título editorial curto com ponto final. Cada um responde uma pergunta que o
 * escritório faz de verdade na hora de distribuir a chave.
 */
const CARDS = computed(() => [
  {
    icon: 'trend',
    stat: `${escopos.value.length || 3} escopos`,
    titulo: null,
    blurb: 'Mercado, teses e notícias. É o catálogo da Redentia inteiro, em modo somente leitura.',
  },
  {
    icon: 'lock',
    stat: null,
    titulo: 'Carteira, não.',
    blurb: 'O servidor recusa dado de carteira nessas chaves. Não é um botão que alguém possa ligar.',
  },
  {
    icon: 'gauge',
    stat: null,
    titulo: `${num(props.conta.quota.day)} por dia.`,
    blurb: `A quota é do escritório inteiro, somando as chaves. O limite por minuto é de ${num(props.conta.quota.minute)}.`,
  },
  {
    icon: 'clock',
    stat: null,
    titulo: 'Um minuto.',
    blurb: 'É o que demora para desligar ou revogar valer, porque o servidor guarda a validação por sessenta segundos.',
  },
])

/**
 * Os blocos do modal. Aqui as ferramentas são NOMEADAS: é a pergunta que
 * aparece na hora de conectar o assistente, e a página não tinha resposta.
 * Todas foram exercitadas contra o servidor de produção antes de entrar aqui.
 */
const BLOCOS = computed(() => [
  {
    label: 'Mercado',
    color: 'var(--nu-blue)',
    html: 'Cotação de ação, FII, ETF e BDR pelo ticker, com a data do preço junto. '
      + 'Busca de ativo por nome ou pedaço do nome. Resumo do dia com os índices e o dólar. '
      + 'E o briefing de fechamento, o mesmo texto que a Redentia publica.',
  },
  {
    label: 'Teses',
    color: 'var(--nu-blue)',
    html: 'A lista das teses de investimento publicadas e o conteúdo de cada uma pelo identificador. '
      + 'É o material editorial da casa, não recomendação: quem assina a opinião para o cliente final é o seu escritório.',
  },
  {
    label: 'Notícias',
    color: 'var(--nu-blue)',
    html: 'As notícias que a Redentia acompanha, com os ativos citados em cada uma. '
      + 'Serve para o assistente responder "o que aconteceu com esse papel" sem sair da conversa.',
  },
  {
    label: 'O que fica de fora',
    color: 'var(--nu-red-2)',
    html: '<strong>Carteira.</strong> Se o assistente tentar, a resposta é "o plano para escritórios não inclui dados de carteira". '
      + 'A recusa acontece no servidor, e ela não consome a sua quota do dia. '
      + 'Consolidação de carteira dos clientes é o que a implantação constrói, e ainda não existe.',
  },
  {
    label: 'Quota e revogação',
    color: 'var(--nu-gray)',
    html: `São ${num(props.conta.quota.day)} chamadas por dia e ${num(props.conta.quota.minute)} por minuto, `
      + 'para o escritório inteiro somando todas as chaves. Cinco chaves não são cinco planos. '
      + 'Desligar, renomear ou revogar acontece no painel, e vale em até um minuto.',
  },
])
</script>

<template>
  <section class="rbks">
    <div class="rbks__head">
      <h2 class="rbks__title">O que a chave alcança.</h2>
      <p class="rbks__sub">
        Três escopos, e nada além deles. O resto o servidor recusa, não é uma configuração que alguém pode ligar.
      </p>
    </div>

    <div class="rbks__grid">
      <div v-for="(c, i) in CARDS" :key="i" class="rbks__card">
        <span class="rbks__icon">
          <svg v-if="c.icon === 'trend'" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>
          <svg v-else-if="c.icon === 'lock'" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10.5" rx="2.5" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></svg>
          <svg v-else-if="c.icon === 'gauge'" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 18a9 9 0 1 1 17 0" /><path d="M12 18l4.2-5" /></svg>
          <svg v-else width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5.3l3.4 2" /></svg>
        </span>
        <div class="rbks__body" :class="{ 'rbks__body--stat': c.stat }">
          <div v-if="c.stat" class="rbks__stat">{{ c.stat }}</div>
          <div v-else class="rbks__card-title">{{ c.titulo }}</div>
          <p class="rbks__blurb">{{ c.blurb }}</p>
        </div>
      </div>
    </div>

    <div class="rbks__cta">
      <button ref="gatilho" type="button" class="rbks__btn" aria-haspopup="dialog" :aria-expanded="aberto" @click="abrir">
        Ver o que cada escopo faz<span class="rbks__btn-arrow">→</span>
      </button>

      <NuxtLink to="/business/comecar" class="rbks__btn2">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4.5 13H11l-1 9 8.5-11H12z" /></svg>
        Conectar ao assistente
      </NuxtLink>
    </div>

    <NuDayModal
      :open="aberto"
      eyebrow="Plano para escritórios"
      title="O que a chave alcança"
      :date-line="`${escoposLegiveis} · somente leitura`"
      :blocks="BLOCOS"
      @close="fechar"
    />
  </section>
</template>

<style scoped>
/* Azul e não navy: a navy já é a banda do gráfico, e duas bandas escuras
   iguais apagariam a diferença entre "o consumo" e "o contrato". */
.rbks { background: var(--nu-blue); padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }

.rbks__head { text-align: center; max-width: 760px; margin: 0 auto; }
.rbks__title { margin: 0; color: var(--nu-cream-text); font-size: clamp(40px, 4.8vw, 56px); font-weight: 800; letter-spacing: -0.04em; line-height: 0.98; }
.rbks__sub { margin: 16px auto 0; max-width: 640px; color: var(--nu-cream-text-72); font-size: 15px; font-weight: 700; letter-spacing: 0.2px; line-height: 1.55; }

.rbks__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; margin-top: clamp(40px, 4.5vw, 52px); }
.rbks__card { background: var(--nu-day-card-navy); border-radius: var(--nu-r-card-lg); padding: 34px 30px 32px; min-height: 300px; display: flex; flex-direction: column; }
.rbks__icon { color: var(--nu-cream-text); height: 34px; }
.rbks__icon svg { display: block; }
.rbks__body { margin-top: 38px; }
.rbks__stat { color: var(--nu-white); font-size: clamp(38px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.045em; line-height: 0.95; font-variant-numeric: tabular-nums; }
.rbks__card-title { color: var(--nu-white); font-size: clamp(26px, 2.5vw, 30px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.04; font-variant-numeric: tabular-nums; }
.rbks__blurb { margin: 14px 0 0; color: var(--nu-white-75); font-size: 16.5px; font-weight: 600; line-height: 1.5; text-wrap: pretty; }
.rbks__body--stat .rbks__blurb { margin-top: 16px; }

.rbks__cta { display: flex; justify-content: center; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: clamp(36px, 4vw, 44px); }
.rbks__btn {
  display: inline-flex; align-items: center; gap: 11px; background: var(--nu-cream); color: var(--nu-day-btn-ink);
  border: none; border-radius: var(--nu-r-pill); padding: 18px 32px; font-size: 17px; font-weight: 800;
  letter-spacing: -0.01em; cursor: pointer; transition: transform .15s ease, background .15s ease;
}
.rbks__btn:hover { background: var(--nu-white); transform: translateY(-1px); }
.rbks__btn:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 3px; }
.rbks__btn-arrow { font-size: 19px; line-height: 1; }

.rbks__btn2 {
  display: inline-flex; align-items: center; gap: 9px;
  background: transparent; color: var(--nu-cream-text); border: 1.5px solid var(--nu-cream-text-22);
  border-radius: var(--nu-r-pill); padding: 17px 26px; font-size: 15.5px; font-weight: 800;
  transition: background .15s, border-color .15s;
}
.rbks__btn2:hover { background: var(--nu-cream-text-12); border-color: var(--nu-cream-text-45); color: var(--nu-cream-text); }
.rbks__btn2:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 3px; }
.rbks__btn2 svg { flex-shrink: 0; }
</style>
