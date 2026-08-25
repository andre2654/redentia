<script setup lang="ts">
/**
 * Banda A do painel de escritório: a abertura.
 *
 * O H1 É UM NÚMERO, não o nome da empresa. O nome vira eyebrow. A pergunta que
 * traz o escritório aqui é "quanto a casa está consumindo hoje", e é ela que
 * merece os 96px — o mesmo gesto do CarteiraHero, onde o patrimônio é o herói e
 * o resto é apoio. Quatro KPIs de peso igual não têm herói nenhum, e era isso
 * que a versão anterior fazia.
 *
 * O aside responde a segunda pergunta, que é "quem na casa está consumindo":
 * uma barra empilhada por chave, com legenda. É o recorte que só existe porque
 * a métrica é por chave.
 */
import type { BusinessAccountStatus } from '~/composables/useBusinessAccount'

const props = defineProps<{ conta: BusinessAccountStatus, janela: number }>()
defineEmits<{ (e: 'gerar'): void, (e: 'conectar'): void }>()

const num = (n: number | null | undefined) => (n ?? 0).toLocaleString('pt-BR')

/**
 * `calls_today` é OPCIONAL no contrato. Sem esta checagem explícita, o `?? 0`
 * do formatador imprime "0 de 5.000" em 96px numa conta que está queimando
 * quota — o número mais visível da tela seria o único inventado.
 */
const temHoje = computed(() => props.conta.usage.calls_today != null)
const semUso = computed(() => props.conta.usage.calls === 0)

const heroNum = computed(() => num(temHoje.value ? props.conta.usage.calls_today : props.conta.usage.calls))
// Plano sem limite diário manda quota.day null: o sufixo vira só "hoje" —
// imprimir "de 0 hoje" inventaria um teto que não existe.
const heroSufixo = computed(() => {
  if (!temHoje.value) return `chamadas em ${props.janela} dias`
  return props.conta.quota.day ? `de ${num(props.conta.quota.day)} hoje` : 'chamadas hoje'
})

/** Saturação da quota do dia. Sem quota declarada não há percentual honesto. */
const pct = computed(() => {
  const q = props.conta.quota.day
  if (!temHoje.value || !q || q <= 0) return null
  return Math.round(((props.conta.usage.calls_today ?? 0) / q) * 100)
})
// 80%, não 90%: em 90% já não sobra dia pra fazer nada a respeito.
const saturado = computed(() => (pct.value ?? 0) >= 80)

/** O maior dia da janela. Some quando não houve uso: dado que falta some. */
const pico = computed(() => {
  const dias = props.conta.usage.days ?? []
  if (!dias.length) return null
  const p = dias.reduce((a, b) => (b.calls > a.calls ? b : a))
  if (p.calls === 0) return null
  return { calls: p.calls, dia: new Date(`${p.day}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }
})

/* ——— barra empilhada por chave ———
   Rampa de azuis do próprio sistema, do mais forte pro mais claro, na ordem
   decrescente de uso: a chave que mais consome fica com a tinta mais cheia. */
const RAMPA = ['var(--nu-blue)', 'var(--nu-blue-deep)', 'var(--nu-grad-blue-1)', 'var(--nu-grad-blue-2)', 'var(--nu-blue-soft)']

const porChave = computed(() => {
  const total = props.conta.keys.reduce((s, k) => s + k.calls_period, 0)
  return [...props.conta.keys]
    .sort((a, b) => b.calls_period - a.calls_period)
    .map((k, i) => ({
      id: k.id,
      label: k.label,
      calls: k.calls_period,
      pct: total > 0 ? Math.round((k.calls_period / total) * 100) : 0,
      cor: RAMPA[i % RAMPA.length],
    }))
})
const totalChaves = computed(() => porChave.value.reduce((s, k) => s + k.calls, 0))

const PASSOS = [
  '<strong>Gere uma chave</strong> com o nome de quem vai usar, ou da mesa',
  '<strong>Conecte no assistente</strong> em um minuto, com o passo a passo pronto',
  '<strong>O uso aparece aqui</strong> por dia e por chave, sem configurar nada',
]
</script>

<template>
  <section class="rbkh">
    <div class="rbkh__cols">
      <div class="rbkh__main">
        <span class="rbkh__eyebrow">{{ conta.company_name }}</span>

        <!-- conta liberada e ainda sem uso: o herói vira frase, como o estado
             connect do CarteiraHero. Número zero em 96px não informa nada. -->
        <template v-if="semUso">
          <h1 class="rbkh__frase">Sua conta está<br>liberada.</h1>
          <p class="rbkh__meta-line rbkh__meta-line--solta">
            Gere a primeira chave e o número aparece aqui no minuto seguinte ao primeiro uso.
          </p>
        </template>

        <template v-else>
          <h1 class="rbkh__num">
            {{ heroNum }}<span class="rbkh__unit">{{ heroSufixo }}</span>
          </h1>

          <div class="rbkh__meta">
            <span v-if="pct !== null" class="rbkh__pill" :class="{ 'rbkh__pill--alta': saturado }">
              {{ pct }}% da quota do dia
            </span>
            <span class="rbkh__meta-line">A quota é do escritório inteiro, não de cada chave.</span>
          </div>

          <dl class="rbkh__stats">
            <div class="rbkh__stat">
              <dt class="rbkh__stat-label">Últimos {{ janela }} dias</dt>
              <dd class="rbkh__stat-value">{{ num(conta.usage.calls) }}</dd>
            </div>
            <div v-if="pico" class="rbkh__stat">
              <dt class="rbkh__stat-label">Maior dia</dt>
              <dd class="rbkh__stat-value">
                {{ num(pico.calls) }}
                <span class="rbkh__stat-sub">{{ pico.dia }}</span>
              </dd>
            </div>
            <div class="rbkh__stat">
              <dt class="rbkh__stat-label">Recusas em {{ janela }} dias</dt>
              <dd class="rbkh__stat-value">{{ num(conta.usage.denials) }}</dd>
            </div>
          </dl>
        </template>

        <div class="rbkh__ctas">
          <button v-if="(conta.remaining_keys ?? 0) > 0" type="button" class="rbkh__cta" @click="$emit('gerar')">
            Gerar chave
          </button>
          <!-- era link pra /business/comecar; a página morreu, o guia é o modal -->
          <button type="button" class="rbkh__cta-outline" @click="$emit('conectar')">Conectar ao assistente</button>
        </div>
      </div>

      <div class="rbkh__aside">
        <div class="rbkh__card">
          <div class="rbkh__card-head">
            <h2 class="rbkh__card-title">Consumo por chave</h2>
            <span class="rbkh__card-count">{{ conta.keys.length }} de {{ conta.max_keys }}</span>
          </div>

          <!-- sem chave gerada ainda: o card explica o caminho em vez de
               desenhar uma barra vazia -->
          <NuCheckList v-if="!conta.keys.length" :items="PASSOS" class="rbkh__passos" />

          <template v-else>
            <div class="rbkh__bar">
              <span
                v-for="k in porChave"
                :key="k.id"
                class="rbkh__bar-seg"
                :style="{ width: `${totalChaves > 0 ? Math.max(2, k.pct) : 100 / porChave.length}%`, background: totalChaves > 0 ? k.cor : 'var(--nu-cream-3)' }"
              />
            </div>
            <dl class="rbkh__legend">
              <div v-for="k in porChave" :key="k.id" class="rbkh__legend-row">
                <span class="rbkh__legend-dot" :style="{ background: totalChaves > 0 ? k.cor : 'var(--nu-cream-3)' }" />
                <dt class="rbkh__legend-name">{{ k.label }}</dt>
                <dd class="rbkh__legend-val">{{ num(k.calls) }}</dd>
                <dd class="rbkh__legend-pct">{{ k.pct }}%</dd>
              </div>
            </dl>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbkh {
  background: var(--nu-cream);
  padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 88px);
  animation: nu-fade .5s ease both;
}
.rbkh__cols { display: flex; gap: clamp(28px, 5vw, 72px); align-items: center; flex-wrap: wrap; max-width: 1120px; }
.rbkh__main { flex: 1.2 1 460px; min-width: min(320px, 100%); }
.rbkh__aside { flex: 1 1 380px; min-width: min(320px, 100%); max-width: 520px; }

.rbkh__eyebrow { display: block; color: var(--nu-blue); font-size: clamp(17px, 1.6vw, 21px); font-weight: 800; letter-spacing: -.2px; }

/* o número da tela */
.rbkh__num {
  margin: 14px 0 0; display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap;
  color: var(--nu-ink); font-size: clamp(50px, 7vw, 96px); font-weight: 800;
  letter-spacing: -0.045em; line-height: .98; font-variant-numeric: tabular-nums;
}
.rbkh__unit { color: var(--nu-gray); font-size: clamp(17px, 1.8vw, 22px); font-weight: 700; letter-spacing: -.01em; }
/* mesma escala do número, pra troca de estado não mexer no ritmo da página */
.rbkh__frase {
  margin: 14px 0 0; color: var(--nu-ink); font-size: clamp(38px, 5.4vw, 68px);
  font-weight: 800; letter-spacing: -.04em; line-height: 1.02;
}

.rbkh__meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 24px; }
.rbkh__pill {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--nu-white); color: var(--nu-ink);
  border-radius: var(--nu-r-pill); padding: 9px 17px;
  font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.rbkh__pill--alta { background: var(--nu-red-pill-bg); color: var(--nu-red-2); }
.rbkh__meta-line { color: var(--nu-gray); font-size: 15px; font-weight: 600; }
.rbkh__meta-line--solta { display: block; margin: 22px 0 0; max-width: 30ch; line-height: 1.55; }

.rbkh__stats { display: flex; align-items: flex-start; gap: clamp(22px, 3vw, 40px); flex-wrap: wrap; margin: 28px 0 0; }
.rbkh__stat-label { display: block; color: var(--nu-gray); font-size: 14px; font-weight: 700; }
.rbkh__stat-value { display: block; margin: 4px 0 0; color: var(--nu-ink); font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; }
.rbkh__stat-sub { display: block; margin-top: 2px; color: var(--nu-gray); font-size: 13px; font-weight: 600; }

.rbkh__ctas { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 38px; }
.rbkh__cta {
  display: inline-flex; align-items: center; gap: 10px; border: none; cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 16px 28px; font-size: 16.5px; font-weight: 700; font-family: inherit;
  transition: background .2s, transform .15s;
}
.rbkh__cta:hover { background: var(--nu-blue-hover); transform: translateY(-2px); }
.rbkh__cta-outline {
  display: inline-flex; align-items: center; gap: 10px; cursor: pointer; font-family: inherit;
  background: transparent; color: var(--nu-blue); border: 2px solid var(--nu-blue);
  border-radius: var(--nu-r-pill); padding: 14px 26px; font-size: 16.5px; font-weight: 700;
  transition: background .2s;
}
.rbkh__cta-outline:hover { background: var(--nu-blue-tint-2); color: var(--nu-blue); }
.rbkh__cta:focus-visible, .rbkh__cta-outline:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }

/* o artefato: elevação de verdade, raio de card do app, sem hairline */
.rbkh__card { background: var(--nu-white); border-radius: var(--nu-r-card); padding: 28px; box-shadow: var(--nu-shadow-card); }
.rbkh__card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.rbkh__card-title { margin: 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.02em; }
.rbkh__card-count { color: var(--nu-gray); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.rbkh__passos { margin-top: 20px; }

.rbkh__bar { display: flex; height: 14px; border-radius: var(--nu-r-pill); overflow: hidden; gap: 3px; margin-top: 22px; background: var(--nu-cream-3); }
.rbkh__bar-seg { height: 100%; }
.rbkh__legend { margin: 16px 0 0; }
.rbkh__legend-row { display: flex; align-items: center; gap: 11px; padding: 11px 0; border-top: 1px solid var(--nu-cream-2); }
.rbkh__legend-dot { width: 11px; height: 11px; border-radius: 4px; flex-shrink: 0; }
.rbkh__legend-name { flex: 1; min-width: 0; color: var(--nu-ink); font-size: 15px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rbkh__legend-val { margin: 0; color: var(--nu-gray); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.rbkh__legend-pct { margin: 0; color: var(--nu-ink); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; min-width: 44px; text-align: right; }
</style>
