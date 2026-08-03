<script setup lang="ts">
/**
 * Banda B: o gráfico de uso, em navy full-bleed.
 *
 * É a única superfície escura da página, e ela existe por dois motivos. O
 * primeiro é ritmo: sem banda escura a tela lê como formulário de admin, e não
 * como página da Redentia. O segundo é hierarquia: o gráfico é o conteúdo mais
 * denso da tela e ganha a banda inteira, como o de 12 meses da /asset.
 *
 * AS BARRAS NASCEM DO CHÃO DA BANDA. O padding inferior é zero e a emenda com
 * a banda creme seguinte é a linha de base do gráfico. Por isso o full-bleed
 * lateral: a margem negativa TEM que ser o mesmo clamp do gutter, senão sobra
 * estouro horizontal que o `overflow-x: clip` do shell esconde no desktop e
 * revela como corte no celular.
 */
import type { BusinessAccountStatus } from '~/composables/useBusinessAccount'

const props = defineProps<{ conta: BusinessAccountStatus, janela: number, resumo: string }>()

const num = (n: number | null | undefined) => (n ?? 0).toLocaleString('pt-BR')

/** Arredonda pra cima num número "redondo" (1/2/2,5/5/10 × 10ⁿ). */
function tetoRedondo(v: number): number {
  if (v <= 0) return 1
  const exp = Math.floor(Math.log10(v))
  const base = 10 ** exp
  const m = v / base
  const passo = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10
  return passo * base
}

/**
 * UM teto governa barra, grade e linha da quota. Se as três escalas
 * divergirem, a barra do pico atravessa a linha do topo e o rótulo mente.
 */
const geometria = computed(() => {
  const dias = props.conta.usage.days ?? []
  const pico = Math.max(0, ...dias.map(d => d.calls))
  const quota = props.conta.quota.day
  // A linha da quota só entra quando o consumo chega perto dela; senão ela
  // achata todas as barras contra o chão e o gráfico perde a leitura.
  const mostraQuota = quota > 0 && pico >= quota * 0.5
  const teto = tetoRedondo(mostraQuota ? Math.max(pico, quota) : pico)

  const quotaTop = mostraQuota ? (quota / teto) * 100 : 0
  // Quando o teto É a quota, a linha de grade do topo e a linha da quota caem
  // no mesmo lugar e a tela mostra duas réguas dizendo a mesma coisa, uma de
  // cada lado. A da quota diz melhor, então a de grade sai.
  const colide = (f: number) => mostraQuota && Math.abs(quotaTop - f * 100) < 3

  return {
    teto,
    mostraQuota,
    quotaTop,
    grade: [1, 0.5, 0]
      .filter(f => !colide(f))
      .map(f => ({ pct: f * 100, rotulo: compacto(teto * f) })),
    barras: dias.map((d) => {
      // T12:00:00 e não a data crua: `new Date('2026-08-03')` é meia-noite
      // UTC, que em Brasília é o dia anterior, e o fim de semana anda um dia.
      const dt = new Date(`${d.day}T12:00:00`)
      const dow = dt.getDay()
      return {
        ...d,
        alt: d.calls === 0 ? 0 : Math.max(2, (d.calls / teto) * 100),
        fds: dow === 0 || dow === 6,
        rotulo: dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      }
    }),
  }
})

function compacto(v: number): string {
  if (v >= 1000) {
    const mil = v / 1000
    return `${mil.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
  }
  return Math.round(v).toLocaleString('pt-BR')
}

const primeiro = computed(() => geometria.value.barras[0]?.rotulo ?? '')
const ultimo = computed(() => geometria.value.barras[geometria.value.barras.length - 1]?.rotulo ?? '')
</script>

<template>
  <section class="rbku">
    <div class="rbku__in">
      <NuSectionHeading dark eyebrow="Consumo">
        {{ janela }} dias de<br>chamadas.
        <template #dek>
          A quota de {{ num(conta.quota.day) }} chamadas por dia vale para o escritório inteiro,
          somando todas as chaves. O limite por minuto é de {{ num(conta.quota.minute) }}.
        </template>
      </NuSectionHeading>

      <dl class="rbku__leg">
        <div>
          <dt>Total</dt>
          <dd>{{ num(conta.usage.calls) }}</dd>
        </div>
        <div>
          <dt>Maior dia</dt>
          <dd>{{ num(Math.max(0, ...geometria.barras.map(b => b.calls))) }}</dd>
        </div>
        <div>
          <dt>Recusas</dt>
          <dd>{{ num(conta.usage.denials) }}</dd>
        </div>
      </dl>

      <div class="rbku__chart-head">
        <span>Chamadas por dia</span>
        <span>{{ primeiro }} a {{ ultimo }}</span>
      </div>
    </div>

    <div class="rbku__chart">
      <div class="rbku__grid" aria-hidden="true">
        <template v-for="g in geometria.grade" :key="g.pct">
          <i :style="{ bottom: `${g.pct}%` }" />
          <b :style="{ bottom: `${g.pct}%` }">{{ g.rotulo }}</b>
        </template>
        <template v-if="geometria.mostraQuota">
          <span class="rbku__quota-line" :style="{ bottom: `${geometria.quotaTop}%` }" />
          <span class="rbku__quota-lab" :style="{ bottom: `${geometria.quotaTop}%` }">quota {{ num(conta.quota.day) }}</span>
        </template>
      </div>

      <!-- role=img no conjunto: 30 barras de 8px não são alvo de toque nem
           são anunciadas uma a uma por leitor de tela -->
      <div class="rbku__bars" role="img" :aria-label="resumo">
        <div v-for="b in geometria.barras" :key="b.day" class="rbku__bar" :class="{ 'rbku__bar--fds': b.fds }">
          <span class="rbku__fill" :style="{ height: `${b.alt}%` }" />
          <span class="rbku__tip">
            <span class="rbku__tip-l">{{ b.rotulo }}</span>
            <span class="rbku__tip-v">{{ num(b.calls) }} chamadas</span>
          </span>
        </div>
      </div>
    </div>

    <!-- a mesma frase do aria-label, visível no estreito: com barras de 5px o
         texto é a única leitura possível do gráfico -->
    <p class="rbku__alt">{{ resumo }}</p>
  </section>
</template>

<style scoped>
.rbku {
  background: var(--nu-navy);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px) 0;
  animation: nu-fade .5s ease both;
}
.rbku__in { max-width: 1120px; }

.rbku__leg { display: flex; gap: clamp(22px, 3vw, 44px); flex-wrap: wrap; margin: clamp(28px, 3.2vw, 36px) 0 0; }
.rbku__leg dt { color: var(--nu-cream-text-50); font-size: 14px; font-weight: 700; }
.rbku__leg dd { margin: 5px 0 0; color: var(--nu-cream-text-85); font-size: 22px; font-weight: 800; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }

.rbku__chart-head {
  display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  margin: clamp(28px, 3.2vw, 38px) 0 12px;
  color: var(--nu-cream-text-50);
  font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px;
  font-variant-numeric: tabular-nums;
}

/* sangria lateral: o valor NEGATIVO é exatamente o gutter da banda */
.rbku__chart {
  position: relative;
  height: clamp(160px, 20vw, 240px);
  margin: 0 calc(clamp(22px, 5.5vw, 80px) * -1);
  padding: 0 clamp(22px, 5.5vw, 80px);
}
.rbku__grid { position: absolute; inset: 0; pointer-events: none; }
.rbku__grid i { position: absolute; left: 0; right: 0; height: 1px; background: var(--nu-cream-text-08); }
.rbku__grid b {
  position: absolute; right: clamp(22px, 5.5vw, 80px); padding-bottom: 4px;
  color: var(--nu-cream-text-35); font-size: 11.5px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.rbku__quota-line {
  position: absolute; left: 0; right: 0; height: 1px;
  background-image: repeating-linear-gradient(90deg, var(--nu-cream-text-18) 0 6px, transparent 6px 12px);
}
/* pendura ABAIXO da linha: com o teto igual à quota a linha fica no topo do
   gráfico, e uma etiqueta acima dela invadia o cabeçalho da seção */
.rbku__quota-lab {
  position: absolute; left: clamp(22px, 5.5vw, 80px); transform: translateY(100%); padding-top: 5px;
  color: var(--nu-cream-text-50); font-size: 11.5px; font-weight: 800; letter-spacing: .4px;
  font-variant-numeric: tabular-nums;
}

.rbku__bars { position: relative; display: flex; align-items: flex-end; gap: clamp(2px, .5vw, 4px); height: 100%; }
.rbku__bar { position: relative; flex: 1 1 0; min-width: 0; height: 100%; display: flex; align-items: flex-end; }
.rbku__fill {
  display: block; width: 100%; border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, var(--nu-blue-soft) 0%, var(--nu-blue) 78%, var(--nu-blue-deep) 100%);
  transition: height .3s ease, filter .18s ease;
}
/* sábado e domingo em cinza: 8 barras baixas por mês são calendário, não queda */
.rbku__bar--fds .rbku__fill { background: var(--nu-cream-text-14); }
.rbku__bar:hover .rbku__fill { filter: brightness(1.15); }

.rbku__tip {
  position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
  background: var(--nu-cream); border-radius: 14px; padding: 9px 12px; white-space: nowrap;
  box-shadow: var(--nu-shadow-chart-tip); opacity: 0; pointer-events: none; transition: opacity .15s ease; z-index: 2;
}
.rbku__tip-l { display: block; color: var(--nu-navy-55); font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; }
.rbku__tip-v { display: block; color: var(--nu-navy); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
.rbku__bar:hover .rbku__tip { opacity: 1; }
/* as pontas ancoram na borda pra não vazar do gráfico */
.rbku__bar:first-child .rbku__tip { left: 0; transform: none; }
.rbku__bar:last-child .rbku__tip { left: auto; right: 0; transform: none; }
@media (hover: none) { .rbku__tip { display: none; } }

.rbku__alt { display: none; }
@media (max-width: 760px) {
  .rbku__chart { height: 140px; }
  .rbku__alt {
    display: block; margin: 0; padding: 18px 0 clamp(28px, 5vw, 40px);
    color: var(--nu-cream-text-70); font-size: 15px; font-weight: 600; line-height: 1.55; max-width: 560px;
  }
}
</style>
