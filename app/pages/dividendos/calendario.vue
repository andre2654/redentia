<!--
  /dividendos/calendario — Big calendar view for upcoming + recent
  dividend payments.

  Surface: month grid (7 × 5-6) with one cell per day. Each cell shows
  the dividend payments scheduled (up to 3 ticker chips visible, "+N"
  truncation badge for the rest). Clicking a day opens a drawer with
  the full list for that date.

  Layout: SEMPRE default (sidebar + header da plataforma) tanto autenticado
  quanto visitante. O default layout ja delega pra `unauthenticated` quando
  `!authStore.isAuthenticated` (ver layouts/default.vue), entao o visitante
  ainda ve o header publico de marketing — sem branching aqui.

  Data: pulls /api/dividends/upcoming + /api/dividends/recent at the
  full 180-day window each, then buckets the results into a Map keyed
  by ISO date so the grid lookup per cell is O(1).
-->
<template>
  <NuxtLayout name="default" title="Calendário de Dividendos">
    <RankingUiShell
      back-to="/dividendos"
      back-label="Voltar para Dividendos"
      status-meta="Próximos pagamentos · B3"
    >
      <template #hero>
        <RankingUiHero eyebrow="Calendário · B3 2026" :chips="heroChips">
          <template #title>
            Calendário de <em>Dividendos:</em> Próximos Pagamentos da B3 2026
          </template>
          <template #lead>
            Todos os próximos pagamentos de dividendos, juros sobre capital próprio e rendimentos anunciados pelas empresas listadas na B3. Atualizado diariamente.
          </template>
        </RankingUiHero>
      </template>

      <section class="cal-content">
        <!-- ============ Month nav ============ -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="cal-nav-btn"
            :style="navBtnStyle"
            aria-label="Mês anterior"
            @click="goPrev"
          >
            <UIcon name="i-lucide-chevron-left" class="size-4" />
          </button>
          <h2
            class="min-w-[180px] text-xl font-medium tabular-nums"
            :style="{ color: 'var(--brand-text)', letterSpacing: '-0.01em' }"
          >
            {{ monthLabel }}
          </h2>
          <button
            type="button"
            class="cal-nav-btn"
            :style="navBtnStyle"
            aria-label="Próximo mês"
            @click="goNext"
          >
            <UIcon name="i-lucide-chevron-right" class="size-4" />
          </button>
          <button
            v-if="!isCurrentMonth"
            type="button"
            class="ml-2 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,color]"
            :style="{
              backgroundColor: `color-mix(in srgb, var(--brand-primary) 14%, transparent)`,
              borderColor: `color-mix(in srgb, var(--brand-primary) 40%, transparent)`,
              color: 'var(--brand-primary)',
            }"
            title="Voltar para o mês atual"
            aria-label="Voltar para o mês atual"
            @click="goToday"
          >
            <UIcon name="i-lucide-rotate-ccw" class="size-3.5" />
            <span>Voltar pra hoje</span>
          </button>
        </div>

        <div class="flex items-center gap-3 text-xs" :style="{ color: 'var(--brand-text-muted)' }">
          <span class="inline-flex items-center gap-1.5">
            <span class="size-2 rounded-full" :style="{ backgroundColor: rateAccent }" />
            Pagamento
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="size-2 rounded-full" :style="{ backgroundColor: 'var(--brand-warning, #f59e0b)' }" />
            JCP
          </span>
          <span class="font-medium tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ monthCount }} {{ monthCount === 1 ? 'pagamento' : 'pagamentos' }}
          </span>
        </div>
      </div>

      <!-- ============ Calendar grid ============ -->
      <div
        class="overflow-hidden rounded-2xl border"
        :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
      >
        <!-- Weekday header -->
        <div
          class="grid grid-cols-7 border-b"
          :style="{
            borderColor: 'var(--brand-border)',
            backgroundColor: `color-mix(in srgb, var(--brand-border) 18%, var(--brand-surface))`,
          }"
        >
          <div
            v-for="d in weekdayLabels"
            :key="d"
            class="px-2 py-2 text-center font-mono-tab text-[10px] font-medium uppercase tracking-[0.16em]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >{{ d }}</div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="pending" class="grid grid-cols-7">
          <div
            v-for="n in 35"
            :key="n"
            class="cal-cell-skeleton border-b border-r"
            :style="{ borderColor: 'var(--brand-border)' }"
          />
        </div>

        <!-- Days grid -->
        <div v-else class="grid grid-cols-7">
          <button
            v-for="cell in calendarCells"
            :key="cell.iso"
            type="button"
            class="cal-cell relative flex min-h-[110px] flex-col items-stretch gap-1 border-b border-r p-2 text-left transition-[background-color]"
            :class="[
              cell.inMonth ? '' : 'cal-cell-out',
              cell.isToday ? 'cal-cell-today' : '',
              cell.items.length === 0 ? 'cal-cell-empty' : 'cal-cell-has',
            ]"
            :style="{
              borderColor: 'var(--brand-border)',
              backgroundColor: cell.isToday
                ? `color-mix(in srgb, var(--brand-primary) 7%, transparent)`
                : 'transparent',
            }"
            :disabled="cell.items.length === 0"
            @click="openDay(cell)"
          >
            <!-- Date number row -->
            <div class="flex items-center justify-between">
              <span
                class="font-mono-tab text-[12px] font-semibold tabular-nums"
                :style="{
                  color: cell.isToday
                    ? 'var(--brand-primary)'
                    : cell.inMonth
                      ? 'var(--brand-text)'
                      : 'color-mix(in srgb, var(--brand-text) 30%, transparent)',
                }"
              >{{ cell.day }}</span>
              <span
                v-if="cell.items.length > 0"
                class="rounded-full px-1.5 py-0.5 font-mono-tab text-[9px] font-medium tabular-nums"
                :style="{
                  backgroundColor: `color-mix(in srgb, var(--brand-primary) 14%, transparent)`,
                  color: 'var(--brand-primary)',
                }"
              >{{ cell.items.length }}</span>
            </div>

            <!-- Ticker chips: up to 3 visible -->
            <div v-if="cell.items.length > 0" class="flex flex-col gap-0.5">
              <div
                v-for="item in cell.items.slice(0, 3)"
                :key="`${item.ticker}-${item.label}`"
                class="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10.5px]"
                :style="{
                  backgroundColor: `color-mix(in srgb, ${labelColor(item.label)} 12%, transparent)`,
                  color: cell.inMonth
                    ? 'var(--brand-text)'
                    : 'color-mix(in srgb, var(--brand-text) 50%, transparent)',
                }"
              >
                <span
                  class="size-1.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: labelColor(item.label) }"
                />
                <span class="truncate font-medium">{{ item.ticker }}</span>
              </div>
              <div
                v-if="cell.items.length > 3"
                class="px-1 font-mono-tab text-[10px]"
                :style="{ color: 'var(--brand-text-muted)' }"
              >+{{ cell.items.length - 3 }} mais</div>
            </div>
          </button>
        </div>
      </div>

      <!-- ============ Empty hint when month is empty ============ -->
      <p
        v-if="!pending && monthCount === 0"
        class="text-center text-sm"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        Nenhum pagamento de dividendos para {{ monthLabel.toLowerCase() }}.
      </p>

      <!-- ============ Answer-first paragraph (abaixo do calendário, centralizado) ============ -->
      <p class="cal-answer-first">
        O calendário de dividendos lista os próximos pagamentos de dividendos, JCP (Juros sobre Capital Próprio) e rendimentos anunciados pelas empresas da B3 (ações) e fundos imobiliários (FIIs). Cada pagamento tem 3 datas-chave: data-com (último dia pra estar com a ação e ter direito ao provento), data-ex (dia em que a ação passa a ser negociada SEM o provento), e data de pagamento. Para receber, basta ter a ação na carteira até a data-com.
      </p>

      <!-- ============ Editorial copy (Stripe-style) ============
           Two sections: "Entendendo as datas" (3-card grid, primary
           reading) and "Tipos de proventos" (definition list, glossary).
           Typography follows the stripe-style skin: weight 300 on the
           section heading, eyebrow with mono tabular + 0.18em tracking,
           body 18px line-height 1.5, no prose-default styles.
      -->
      <div
        class="mt-8 flex flex-col gap-14 border-t pt-12"
        :style="{ borderColor: `color-mix(in srgb, var(--brand-border) 60%, transparent)` }"
      >
        <!-- Section A: Entendendo as datas -->
        <section class="flex flex-col gap-8">
          <header class="flex max-w-2xl flex-col gap-3">
            <span
              class="font-mono-tab text-[11px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: 'var(--brand-primary)' }"
            >Documentação</span>
            <h2
              class="font-light"
              :style="{
                color: 'var(--brand-text)',
                fontSize: 'clamp(28px, 4vw, 36px)',
                lineHeight: 1.1,
                letterSpacing: '-0.7px',
              }"
            >Entendendo as datas</h2>
            <p
              class="max-w-2xl"
              :style="{
                fontSize: '17px',
                lineHeight: 1.55,
                color: `color-mix(in srgb, var(--brand-text) 72%, transparent)`,
              }"
            >Três datas comandam o fluxo de qualquer provento: a aprovação no conselho, a data-com (último pregão pra garantir o direito) e a data de pagamento. Entender a sequência é o que separa quem recebe de quem perde por um dia.</p>
          </header>

          <!-- Date cards: 3-up on desktop, stacked on mobile -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <article
              v-for="(d, idx) in dateInfo"
              :key="d.key"
              class="flex flex-col gap-3 rounded-xl border p-5 transition-[border-color,background-color]"
              :style="{
                backgroundColor: `color-mix(in srgb, var(--brand-surface) 60%, transparent)`,
                borderColor: `color-mix(in srgb, var(--brand-border) 55%, transparent)`,
                boxShadow: `0 1px 0 0 color-mix(in srgb, var(--brand-border) 30%, transparent) inset`,
              }"
            >
              <div class="flex items-center gap-2">
                <span
                  class="size-1.5 rounded-full"
                  :style="{ backgroundColor: d.dot }"
                />
                <span
                  class="font-mono-tab text-[10.5px] font-medium uppercase tabular-nums"
                  :style="{
                    letterSpacing: '0.18em',
                    color: `color-mix(in srgb, var(--brand-text) 50%, transparent)`,
                  }"
                >0{{ idx + 1 }} · {{ d.eyebrow }}</span>
              </div>
              <h3
                class="text-[18px] font-medium"
                :style="{
                  color: 'var(--brand-text)',
                  lineHeight: 1.25,
                  letterSpacing: '-0.22px',
                }"
              >{{ d.title }}</h3>
              <p
                class="text-[14px]"
                :style="{
                  lineHeight: 1.55,
                  color: `color-mix(in srgb, var(--brand-text) 68%, transparent)`,
                }"
              >{{ d.body }}</p>
            </article>
          </div>
        </section>

        <!-- Section B: Tipos de proventos (glossary) -->
        <section class="flex flex-col gap-6">
          <header class="flex max-w-2xl flex-col gap-2">
            <span
              class="font-mono-tab text-[11px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: 'var(--brand-primary)' }"
            >Glossário</span>
            <h2
              class="font-light"
              :style="{
                color: 'var(--brand-text)',
                fontSize: 'clamp(22px, 3vw, 26px)',
                lineHeight: 1.2,
                letterSpacing: '-0.4px',
              }"
            >Tipos de proventos</h2>
          </header>

          <dl
            class="flex flex-col divide-y"
            :style="{
              ['--tw-divide-opacity' as string]: 1,
              borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
            }"
          >
            <div
              v-for="t in proventoTypes"
              :key="t.key"
              class="grid grid-cols-1 gap-1.5 py-4 md:grid-cols-[220px_1fr] md:gap-8 md:py-5"
              :style="{
                borderColor: `color-mix(in srgb, var(--brand-border) 40%, transparent)`,
              }"
            >
              <dt
                class="flex items-baseline gap-2"
                :style="{ color: 'var(--brand-text)' }"
              >
                <span
                  class="size-1 shrink-0 rounded-full"
                  :style="{ backgroundColor: 'var(--brand-primary)' }"
                />
                <span
                  class="text-[14.5px] font-medium"
                  :style="{ letterSpacing: '-0.005em' }"
                >{{ t.term }}</span>
              </dt>
              <dd
                class="text-[15px]"
                :style="{
                  lineHeight: 1.55,
                  color: `color-mix(in srgb, var(--brand-text) 72%, transparent)`,
                }"
              >{{ t.def }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <!-- ============ MASSIVE EDUCATIONAL SECTION ============ -->
      <div class="mt-4 flex max-w-4xl flex-col gap-12 border-t pt-12"
        :style="{ borderColor: `color-mix(in srgb, var(--brand-border) 60%, transparent)` }"
      >

        <!-- H2: Como funcionam as datas dos dividendos -->
        <section class="flex flex-col gap-5">
          <h2
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(24px, 3vw, 30px)',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
            }"
          >Como Funcionam as Datas dos Dividendos</h2>
          <p class="text-base leading-relaxed" :style="{ color: 'var(--brand-text)' }">
            Quatro datas comandam todo provento pago no Brasil. Saber a sequência delas é o que separa quem recebe do dividendo de quem perde por uma sessão. Toda empresa de capital aberto segue esse fluxo, regulado pela CVM e operacionalizado pela B3.
          </p>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div
              v-for="block in dateExplained"
              :key="block.title"
              class="brand-card flex flex-col gap-2 border p-5"
              :style="{
                backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))`,
                borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
              }"
            >
              <h3
                class="text-base font-medium"
                :style="{ color: 'var(--brand-primary)' }"
              >{{ block.title }}</h3>
              <p class="text-sm leading-relaxed" :style="{ color: 'var(--brand-text)' }">
                {{ block.body }}
              </p>
            </div>
          </div>
        </section>

        <!-- H2: Próximos Dividendos por Mês -->
        <section class="flex flex-col gap-5">
          <h2
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(24px, 3vw, 30px)',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
            }"
          >Próximos Dividendos por Mês</h2>
          <p class="text-base leading-relaxed" :style="{ color: 'var(--brand-text)' }">
            O fluxo de dividendos no Brasil segue padrão sazonal previsível. Empresas concentram pagamentos anuais entre março e maio (após divulgação de resultados anuais), enquanto FIIs distribuem rendimentos todos os meses, geralmente até o dia 25. JCPs aparecem com força em dezembro, quando empresas otimizam dedução fiscal antes do fechamento do ano.
          </p>

          <div class="flex flex-col divide-y" :style="{ borderColor: `color-mix(in srgb, var(--brand-border) 40%, transparent)` }">
            <div
              v-for="month in monthlyPattern"
              :key="month.label"
              class="grid grid-cols-1 gap-2 py-4 md:grid-cols-[180px_1fr] md:gap-6"
              :style="{ borderColor: `color-mix(in srgb, var(--brand-border) 40%, transparent)` }"
            >
              <span
                class="text-sm font-medium"
                :style="{ color: 'var(--brand-primary)' }"
              >{{ month.label }}</span>
              <span class="text-sm leading-relaxed" :style="{ color: 'var(--brand-text)' }">
                {{ month.desc }}
              </span>
            </div>
          </div>
        </section>

        <!-- H2: Maiores Pagadores de Dividendos da B3 -->
        <section class="flex flex-col gap-5">
          <h2
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(24px, 3vw, 30px)',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
            }"
          >Maiores Pagadores de Dividendos da B3 (Histórico)</h2>
          <p class="text-base leading-relaxed" :style="{ color: 'var(--brand-text)' }">
            Histórico consistente de 5+ anos é o filtro mais importante na hora de escolher ações pagadoras. Empresas listadas abaixo combinam payout estável, lucro recorrente e setor menos cíclico (bancos, seguros, transmissão de energia). Não confunda DY alto pontual (que pode vir de queda no preço) com track record real de distribuição.
          </p>

          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <NuxtLink
              v-for="payer in topPayers"
              :key="payer.ticker"
              :to="`/dividendos/${payer.ticker.toLowerCase()}`"
              class="brand-card group flex flex-col gap-1.5 border p-4 transition hover:border-secondary/40"
              :style="{
                backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))`,
                borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
              }"
            >
              <div class="flex items-center justify-between">
                <span class="font-mono-tab text-sm font-semibold" :style="{ color: 'var(--brand-primary)' }">
                  {{ payer.ticker }}
                </span>
                <UIcon name="i-lucide-arrow-up-right" class="size-4 opacity-50 transition group-hover:opacity-100" />
              </div>
              <span class="text-sm font-medium" :style="{ color: 'var(--brand-text)' }">{{ payer.name }}</span>
              <span class="text-xs leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">{{ payer.desc }}</span>
            </NuxtLink>
          </div>
        </section>

        <!-- H2: FIIs com Dividendos Mensais -->
        <section class="flex flex-col gap-5">
          <h2
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(24px, 3vw, 30px)',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
            }"
          >FIIs com Dividendos Mensais</h2>
          <p class="text-base leading-relaxed" :style="{ color: 'var(--brand-text)' }">
            Todos os fundos imobiliários listados em bolsa pagam rendimentos mensais (obrigação legal, no mínimo 95% do lucro semestral distribuído). Diferente das ações, o pagamento é mensal e isento de IR para pessoa física, o que torna FIIs a base de carteira de quem busca renda passiva regular. Diversificar entre segmentos (logística, shoppings, lajes corporativas, papel, fundo de fundos) reduz risco específico.
          </p>

          <div class="flex flex-col gap-4">
            <div
              v-for="cat in fiiCategories"
              :key="cat.label"
              class="flex flex-col gap-2 rounded-xl border p-4"
              :style="{
                backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))`,
                borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
              }"
            >
              <div class="flex items-baseline justify-between gap-3 flex-wrap">
                <h3 class="text-sm font-medium" :style="{ color: 'var(--brand-primary)' }">{{ cat.label }}</h3>
                <span class="font-mono-tab text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">{{ cat.tag }}</span>
              </div>
              <p class="text-sm leading-relaxed" :style="{ color: 'var(--brand-text)' }">
                {{ cat.desc }}
              </p>
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span
                  v-for="ticker in cat.tickers"
                  :key="ticker"
                  class="rounded-md px-2 py-0.5 font-mono-tab text-[11px] font-medium"
                  :style="{
                    backgroundColor: `color-mix(in srgb, var(--brand-primary) 14%, transparent)`,
                    color: 'var(--brand-primary)',
                  }"
                >{{ ticker }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- H2: Dividendos vs JCP -->
        <section class="flex flex-col gap-5">
          <h2
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(24px, 3vw, 30px)',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
            }"
          >Dividendos vs JCP (Juros sobre Capital Próprio)</h2>
          <p class="text-base leading-relaxed" :style="{ color: 'var(--brand-text)' }">
            Brasil é um dos poucos países com dois mecanismos paralelos de remuneração de acionistas. A diferença é puramente fiscal: o dividendo paga o investidor com lucro líquido (depois do IR corporativo) e por isso é isento na ponta da pessoa física. Já o JCP é deduzível do IR da empresa antes da apuração, mas o investidor paga 15% retido na fonte. Empresas combinam os dois para minimizar carga tributária total.
          </p>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div
              class="brand-card flex flex-col gap-2 border p-5"
              :style="{
                backgroundColor: `color-mix(in srgb, var(--brand-positive) 8%, var(--brand-surface))`,
                borderColor: `color-mix(in srgb, var(--brand-positive) 30%, var(--brand-border))`,
              }"
            >
              <h3 class="text-base font-semibold" :style="{ color: 'var(--brand-positive)' }">Dividendos</h3>
              <ul class="flex flex-col gap-1 text-sm leading-relaxed" :style="{ color: 'var(--brand-text)' }">
                <li>Distribuição direta do lucro líquido</li>
                <li>Isentos de IR para pessoa física (regra atual)</li>
                <li>Empresa não tem benefício fiscal</li>
                <li>Mais comum em empresas maduras com lucro estável</li>
              </ul>
            </div>
            <div
              class="brand-card flex flex-col gap-2 border p-5"
              :style="{
                backgroundColor: `color-mix(in srgb, var(--brand-warning, #f59e0b) 8%, var(--brand-surface))`,
                borderColor: `color-mix(in srgb, var(--brand-warning, #f59e0b) 30%, var(--brand-border))`,
              }"
            >
              <h3 class="text-base font-semibold" :style="{ color: 'var(--brand-warning, #f59e0b)' }">JCP (Juros sobre Capital Próprio)</h3>
              <ul class="flex flex-col gap-1 text-sm leading-relaxed" :style="{ color: 'var(--brand-text)' }">
                <li>Pago como remuneração do capital investido</li>
                <li>15% de IR retido na fonte</li>
                <li>Empresa deduz o valor do IR corporativo</li>
                <li>Comum em bancos e empresas com alto patrimônio líquido</li>
              </ul>
            </div>
          </div>

          <p class="text-sm leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
            Em 2026, o PL 1.087/2025 propõe taxar dividendos acima de R$ 50 mil por mês em 10% retidos na fonte (em apreciação no Senado). FIIs continuam isentos no texto atual do projeto, mas a discussão fiscal segue aberta. Acompanhar a tramitação é parte do planejamento de quem vive ou pretende viver de proventos.
          </p>
        </section>

        <!-- H2: Como receber dividendos passo a passo -->
        <section class="flex flex-col gap-5">
          <h2
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(24px, 3vw, 30px)',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
            }"
          >Como Receber Dividendos: Passo a Passo</h2>
          <p class="text-base leading-relaxed" :style="{ color: 'var(--brand-text)' }">
            Receber dividendos é processo automático para quem está com a ação na carteira até a data-com. O dinheiro cai direto na conta da corretora, sem necessidade de pedir, sacar ou preencher formulário. O ciclo completo, da compra ao pagamento, leva entre 30 e 60 dias após a aprovação em assembleia.
          </p>

          <ol class="flex flex-col gap-3">
            <li
              v-for="(step, idx) in receiveSteps"
              :key="step.title"
              class="flex gap-4 rounded-xl border p-4"
              :style="{
                backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))`,
                borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
              }"
            >
              <div
                class="flex size-8 shrink-0 items-center justify-center rounded-full font-mono-tab text-sm font-semibold"
                :style="{
                  backgroundColor: `color-mix(in srgb, var(--brand-primary) 18%, transparent)`,
                  color: 'var(--brand-primary)',
                }"
              >{{ idx + 1 }}</div>
              <div class="flex flex-col gap-1">
                <h3 class="text-base font-medium" :style="{ color: 'var(--brand-text)' }">{{ step.title }}</h3>
                <p class="text-sm leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">{{ step.body }}</p>
              </div>
            </li>
          </ol>
        </section>

        <!-- H2: Dividendos por Ticker (cross-link cards) -->
        <section class="flex flex-col gap-5">
          <h2
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(24px, 3vw, 30px)',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
            }"
          >Dividendos por Ticker</h2>
          <p class="text-base leading-relaxed" :style="{ color: 'var(--brand-text)' }">
            Cada ticker tem seu próprio padrão de pagamento, calendário, DY típico e histórico. Acesse páginas dedicadas com histórico completo, próximos eventos esperados e análise específica de cada ação ou FII pagador de dividendos.
          </p>

          <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            <NuxtLink
              v-for="t in tickerLinks"
              :key="t.ticker"
              :to="`/dividendos/${t.ticker.toLowerCase()}`"
              class="group flex flex-col gap-1 rounded-xl border px-3 py-3 transition hover:border-secondary/40"
              :style="{
                backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))`,
                borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
              }"
            >
              <span class="font-mono-tab text-sm font-semibold" :style="{ color: 'var(--brand-primary)' }">
                {{ t.ticker }}
              </span>
              <span class="text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">{{ t.name }}</span>
            </NuxtLink>
          </div>
        </section>

        <!-- H2: FAQ -->
        <section class="flex flex-col gap-4">
          <h2
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(24px, 3vw, 30px)',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
            }"
          >Perguntas Frequentes</h2>

          <div class="flex flex-col gap-3">
            <details
              v-for="item in faqItems"
              :key="item.q"
              class="group brand-card border p-4"
              :style="{
                backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))`,
                borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
              }"
            >
              <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-medium" :style="{ color: 'var(--brand-text)' }">
                {{ item.q }}
                <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
              </summary>
              <p class="mt-3 text-sm leading-relaxed" :style="{ color: 'var(--brand-text-muted)' }">
                {{ item.a }}
              </p>
            </details>
          </div>
        </section>
      </div>
      </section>
    </RankingUiShell>

    <!-- ============ Day drawer (modal) ============ -->
    <Teleport to="body">
      <Transition name="cal-drawer">
        <div
          v-if="openCell"
          class="fixed inset-0 z-50 flex items-end justify-center md:items-center"
          @click="openCell = null"
        >
          <div
            class="absolute inset-0"
            style="background-color: rgba(0,0,0,0.55); backdrop-filter: blur(2px);"
          />
          <div
            class="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border md:rounded-2xl"
            :style="{
              backgroundColor: 'var(--brand-surface)',
              borderColor: 'var(--brand-border)',
              boxShadow: `0 30px 80px -20px rgba(0,0,0,0.5), 0 12px 30px -12px color-mix(in srgb, var(--brand-primary) 22%, transparent)`,
            }"
            @click.stop
          >
            <!-- Drawer header -->
            <header
              class="flex items-baseline justify-between gap-3 border-b px-5 py-4"
              :style="{ borderColor: 'var(--brand-border)' }"
            >
              <div class="flex flex-col">
                <span
                  class="font-mono-tab text-[10px] font-medium uppercase tracking-[0.18em]"
                  :style="{ color: 'var(--brand-text-muted)' }"
                >Pagamentos do dia</span>
                <h3
                  class="mt-0.5 text-xl font-medium"
                  :style="{ color: 'var(--brand-text)', letterSpacing: '-0.01em' }"
                >{{ formatDateLong(openCell.iso) }}</h3>
              </div>
              <button
                type="button"
                class="flex size-8 items-center justify-center rounded-md transition-[background-color]"
                :style="{
                  color: `color-mix(in srgb, var(--brand-text) 60%, transparent)`,
                }"
                aria-label="Fechar"
                @click="openCell = null"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </header>

            <!-- Drawer body -->
            <ul class="flex-1 overflow-y-auto">
              <li
                v-for="item in openCell.items"
                :key="`${item.ticker}-${item.label}`"
                class="border-b last:border-b-0"
                :style="{ borderColor: 'var(--brand-border)' }"
              >
                <NuxtLink
                  :to="`/asset/${item.ticker.toLowerCase()}`"
                  class="flex items-center gap-3 px-5 py-3 transition hover:bg-white/5"
                  @click="openCell = null"
                >
                  <div
                    class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
                    :style="{
                      borderColor: 'var(--brand-border)',
                      backgroundColor: 'var(--brand-background)',
                    }"
                  >
                    <img
                      v-if="item.logo"
                      :src="item.logo"
                      :alt="item.name"
                      class="size-full object-cover"
                      loading="lazy"
                      @error="($event.target as HTMLImageElement).style.display='none'"
                    >
                    <span
                      v-else
                      class="text-[10px] font-bold"
                      :style="{ color: 'var(--brand-text-muted)' }"
                    >{{ item.ticker.slice(0, 2) }}</span>
                  </div>
                  <div class="flex min-w-0 flex-1 flex-col">
                    <div class="flex items-center gap-2">
                      <span
                        class="text-sm font-semibold"
                        :style="{ color: 'var(--brand-text)' }"
                      >{{ item.ticker }}</span>
                      <span
                        class="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase"
                        :style="{
                          backgroundColor: labelColor(item.label) + '22',
                          color: labelColor(item.label),
                        }"
                      >{{ item.label }}</span>
                    </div>
                    <span
                      class="truncate text-[11px]"
                      :style="{ color: 'var(--brand-text-muted)' }"
                    >{{ item.name }}</span>
                  </div>
                  <div class="flex flex-col items-end gap-0.5">
                    <span
                      class="text-sm font-semibold tabular-nums"
                      :style="{ color: rateAccent }"
                    >R$ {{ formatRate(item.rate) }}</span>
                    <span
                      v-if="item.last_date_prior"
                      class="font-mono-tab text-[10px] tabular-nums"
                      :style="{ color: 'var(--brand-text-muted)' }"
                    >data-com {{ formatDateShort(item.last_date_prior) }}</span>
                  </div>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { RankingHeroChip } from '~/components/ranking-ui/Hero.vue'

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

import { dividendAccent, readableOn } from '~/utils/color'

const brand = useBrand()
const service = useAssetsService()

// Chips do hero (V5)
const heroChips: RankingHeroChip[] = [
  { label: 'Próximos 180 dias', tone: 'positive' },
  { label: 'Data-com + data-ex' },
  { label: 'Ações e FIIs' },
  { label: 'Atualizado diário' },
]

// Layout: usa `default` em todos os casos. O proprio layouts/default.vue ja
// delega pra `unauthenticated` quando `!authStore.isAuthenticated`, entao
// nao precisamos branchar aqui — visitante ve header publico, autenticado
// ve sidebar de plataforma. Sem ramificar layoutName, sem `static`.

const rateAccent = computed(() =>
  dividendAccent('var(--brand-primary)', 'var(--brand-negative)', 'var(--brand-positive)'),
)

// FAQ data — populated below before usePageSeo runs.
const faqItems = [
  {
    q: 'O que é data-com?',
    a: 'Data-com (data com direito) é o último pregão em que você precisa estar com a ação na carteira para ter direito ao dividendo anunciado. Comprou na data-com? Recebe. Comprou no dia seguinte (data-ex)? Não recebe daquela rodada de proventos.',
  },
  {
    q: 'O que é data-ex?',
    a: 'Data-ex (ex-direito) é o pregão seguinte à data-com. A ação passa a ser negociada SEM o direito ao provento anunciado. Tipicamente o preço cai aproximadamente o valor do dividendo nesse dia (ajuste técnico do mercado), o que é normal e esperado.',
  },
  {
    q: 'Quanto tempo após a data-com recebo o dividendo?',
    a: 'Geralmente 30 a 60 dias após a aprovação em assembleia. A empresa anuncia ao mesmo tempo a data-com (corte de quem tem direito) e a data de pagamento (quando o dinheiro cai). FIIs costumam ser mais rápidos (10 a 15 dias), enquanto ações podem levar até 90 dias.',
  },
  {
    q: 'Tenho que ter a ação no dia do pagamento?',
    a: 'Não. Basta ter a ação na carteira até a data-com. Você pode vender na data-ex e ainda assim receber o provento na data de pagamento, sem nenhuma obrigação de manter a ação até lá. O direito ao dividendo é gerado na data-com e não pode ser revertido.',
  },
  {
    q: 'Quando é pago o dividendo do ITUB4?',
    a: 'O Itaú Unibanco (ITUB4) paga proventos trimestralmente, combinando dividendos e JCP. As datas-com costumam cair no final de março, junho, setembro e dezembro, com pagamento entre 30 e 60 dias depois. Para datas exatas do próximo pagamento, consulte o calendário acima ou a página dedicada do ITUB4.',
  },
  {
    q: 'Quais FIIs pagam dividendos mensais?',
    a: 'Todos os FIIs negociados em bolsa pagam rendimentos mensais por obrigação legal (mínimo de 95% do lucro semestral distribuído). Exemplos populares: HGLG11, MXRF11, KNCR11, KNRI11, XPLG11, BTLG11, VISC11, HGRE11, BCFF11. O pagamento sai geralmente até o dia 15 de cada mês.',
  },
  {
    q: 'Dividendos têm IR?',
    a: 'Atualmente, dividendos de ações e rendimentos de FIIs são isentos de imposto de renda para pessoa física no Brasil. JCP tem 15% retido na fonte. O PL 1.087/2025 propõe taxar dividendos acima de R$ 50 mil por mês em 10% retidos, mas ainda está em apreciação no Senado e não vigora.',
  },
  {
    q: 'Qual a diferença entre dividendos e JCP?',
    a: 'Dividendos são distribuição direta do lucro líquido, isentos de IR para pessoa física. JCP (Juros sobre Capital Próprio) é uma remuneração calculada sobre o patrimônio líquido da empresa, dedutível do IR corporativo, mas com 15% retido na fonte para o investidor. Empresas combinam os dois para otimizar a carga fiscal total.',
  },
  {
    q: 'Como reinvestir dividendos automaticamente?',
    a: 'Corretoras brasileiras geralmente não oferecem reinvestimento automático (DRIP) como nos EUA. O dinheiro cai na sua conta da corretora e você precisa comprar manualmente novas ações ou cotas. Algumas plataformas começam a oferecer ordens recorrentes ou compras programadas que ajudam a manter a disciplina de reinvestimento.',
  },
  {
    q: 'Onde declarar dividendos no IRPF?',
    a: 'Dividendos de ações e rendimentos de FIIs vão na ficha "Rendimentos Isentos e Não Tributáveis", linha 9 ("Lucros e dividendos recebidos"). JCP entra em "Rendimentos Sujeitos à Tributação Exclusiva", linha 6. A corretora envia informe de rendimentos anual com os valores prontos para copiar.',
  },
] as const

usePageSeo({
  title: 'Calendário de Dividendos B3 2026 | Redentia',
  description:
    'Calendário de dividendos da B3 2026: data-com, data-ex, próximos pagamentos por ticker. ITUB4, PETR4, VALE3 + 100+ FIIs com pagamento mensal. Grátis.',
  path: '/dividendos/calendario',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Dividendos', path: '/dividendos' },
    { name: 'Calendário', path: '/dividendos/calendario' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Calendário de Dividendos B3 2026 - Redentia',
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Calendário de proventos',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      description:
        'Calendário visual de dividendos da B3, com data-com, data-ex e data de pagamento de ações e FIIs. Atualizado diariamente.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
})

interface DividendItem {
  ticker: string
  name: string
  logo: string | null
  type: string
  label: string
  rate: number
  payment_date: string
  last_date_prior: string | null
}

interface DividendGroup {
  date: string
  count: number
  items: DividendItem[]
}

interface CalendarCell {
  iso: string
  day: number
  inMonth: boolean
  isToday: boolean
  items: DividendItem[]
}

// ---------- Date helpers ----------

function isoOf(d: Date): string {
  // YYYY-MM-DD in local TZ — matches the API's payment_date field,
  // which is also a date-only ISO string.
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)
const TODAY_ISO = isoOf(TODAY)

const cursor = ref(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))

const monthLabel = computed(() =>
  cursor.value
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^./, (c) => c.toUpperCase()),
)

const isCurrentMonth = computed(() =>
  cursor.value.getFullYear() === TODAY.getFullYear()
  && cursor.value.getMonth() === TODAY.getMonth(),
)

function goPrev() {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() - 1, 1)
}
function goNext() {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 1)
}
function goToday() {
  cursor.value = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
}

// ---------- Data fetching ----------

// Fetch upcoming + recent at the API's max window (180d each side).
// Both calls go through the same useAsyncData so SSR + hydration are
// well-behaved. Each returns a list of date-grouped buckets.
const { data: upcomingGroups, pending: pendingUpcoming } = await useAsyncData<DividendGroup[]>(
  'dividends-upcoming-180',
  async () => {
    const data = await service.getUpcomingDividends(180, 500)
    return (data as DividendGroup[]) || []
  },
  { default: () => [] },
)
const { data: recentGroups, pending: pendingRecent } = await useAsyncData<DividendGroup[]>(
  'dividends-recent-180',
  async () => {
    const data = await service.getRecentDividends(180, 500)
    return (data as DividendGroup[]) || []
  },
  { default: () => [] },
)

const pending = computed(() => pendingUpcoming.value || pendingRecent.value)

// Single Map<iso-date, items[]> for O(1) lookup per calendar cell.
const dateMap = computed(() => {
  const map = new Map<string, DividendItem[]>()
  const merge = (groups: DividendGroup[] | null) => {
    for (const g of groups || []) {
      const existing = map.get(g.date)
      if (existing) {
        existing.push(...g.items)
      } else {
        map.set(g.date, [...g.items])
      }
    }
  }
  merge(upcomingGroups.value)
  merge(recentGroups.value)
  return map
})

// ---------- Calendar grid ----------

// Brazil starts the week on Sunday — same as JS getDay() === 0.
const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Build the 7-col grid: pad the start with leading days from the
// previous month so the first row begins on Sunday, then fill until
// the last day of the cursor month, then pad the tail with trailing
// days from the next month so the grid is rectangular (5 or 6 rows
// of 7 cols each).
const calendarCells = computed<CalendarCell[]>(() => {
  const year = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)

  // Leading pad: days from previous month to fill up to Sunday.
  const lead = firstOfMonth.getDay() // 0 (Sun) .. 6 (Sat)
  const start = new Date(firstOfMonth)
  start.setDate(start.getDate() - lead)

  // Trailing pad: enough days to make total cells a multiple of 7,
  // and ensure at least 6 weeks for visual stability when the month
  // happens to fit in 5.
  const totalSoFar = lead + lastOfMonth.getDate()
  const totalRows = Math.ceil(totalSoFar / 7)
  const totalCells = Math.max(35, totalRows * 7)

  const cells: CalendarCell[] = []
  const lookup = dateMap.value
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = isoOf(d)
    cells.push({
      iso,
      day: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: iso === TODAY_ISO,
      items: lookup.get(iso) || [],
    })
  }
  return cells
})

const monthCount = computed(() =>
  calendarCells.value
    .filter((c) => c.inMonth)
    .reduce((sum, c) => sum + c.items.length, 0),
)

// ---------- Drawer ----------

const openCell = ref<CalendarCell | null>(null)
function openDay(cell: CalendarCell) {
  if (cell.items.length === 0) return
  openCell.value = cell
}

// ESC closes the drawer.
onMounted(() => {
  if (!import.meta.client) return
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') openCell.value = null
  }
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
})

// ---------- Style helpers ----------

const navBtnStyle = computed(() => ({
  borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
  backgroundColor: `color-mix(in srgb, var(--brand-surface) 60%, transparent)`,
  color: 'var(--brand-text)',
}))

// ---------- Formatting helpers ----------

function formatDateLong(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d
      .toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
      .replace(/^./, (c) => c.toUpperCase())
  } catch {
    return dateStr
  }
}

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return dateStr
  }
}

function formatRate(value: number | string): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '-'
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  })
}

function labelColor(label: string): string {
  const normalized = (label || '').toUpperCase()
  if (normalized.includes('JCP') || normalized.includes('JUROS')) {
    return brand.colors.warning || '#f59e0b'
  }
  if (normalized.includes('BONIF')) {
    return brand.colors.secondary
  }
  return rateAccent.value
}

// ---------- Editorial copy data ----------
// Pulled out of the template so the JSX stays readable. Each entry
// keeps its own dot color so the cards read as a sequence (calm
// muted → primary amber → positive green = "money lands").

const dateInfo = computed(() => [
  {
    key: 'aprovacao',
    eyebrow: 'Aprovação',
    title: 'Data de aprovação',
    body: 'Quando o conselho da empresa aprova o pagamento. É o ponto zero, sem essa decisão, nada começa a contar.',
    dot: `color-mix(in srgb, var(--brand-text) 35%, transparent)`,
  },
  {
    key: 'datacom',
    eyebrow: 'Data-com',
    title: 'Última data com direito',
    body: 'Último dia útil em que é preciso ter as ações pra receber o provento. Quem compra a partir do dia seguinte fica de fora.',
    dot: 'var(--brand-primary)',
  },
  {
    key: 'pagamento',
    eyebrow: 'Pagamento',
    title: 'Data de pagamento',
    body: 'Quando o dinheiro efetivamente cai na conta do investidor. Pode levar de dias a semanas após a data-com.',
    dot: 'var(--brand-positive)',
  },
])

const proventoTypes = [
  {
    key: 'div',
    term: 'Dividendos',
    def: 'Distribuição de lucros aos acionistas. Isenta de imposto de renda para pessoa física.',
  },
  {
    key: 'jcp',
    term: 'JCP, Juros sobre Capital Próprio',
    def: 'Tributado em 15% na fonte, mas vantajoso pra empresa por ser dedutível do imposto sobre lucros.',
  },
  {
    key: 'rend',
    term: 'Rendimentos (FIIs)',
    def: 'Distribuição mensal dos fundos imobiliários. Isentos de IR para pessoa física, com regras específicas de elegibilidade.',
  },
  {
    key: 'bonif',
    term: 'Bonificação',
    def: 'Distribuição de novas ações aos acionistas existentes, em vez de pagamento em dinheiro. Não muda o valor patrimonial.',
  },
] as const

// ====================================================================
// Educational content data
// ====================================================================

const dateExplained = [
  {
    title: 'Data-com (com direito)',
    body: 'Último dia em que você precisa estar com a ação na carteira pra ter direito ao dividendo anunciado. Compras feitas até esta data garantem o provento, mesmo que você venda no dia seguinte.',
  },
  {
    title: 'Data-ex (ex direito)',
    body: 'Dia seguinte à data-com. A ação começa a ser negociada SEM o provento. O preço da ação cai aproximadamente o valor do dividendo nesse dia, é apenas ajuste técnico, não perda real para quem já tinha direito.',
  },
  {
    title: 'Data de pagamento',
    body: 'Dia em que o dinheiro entra na sua conta da corretora. Geralmente 30 a 60 dias após a aprovação em assembleia. Em FIIs, o prazo é mais curto, costuma sair em 10 a 15 dias após a data-com.',
  },
  {
    title: 'Data de aprovação em assembleia',
    body: 'AGE ou AGO que aprova o pagamento. Antes dessa aprovação formal, qualquer valor anunciado é apenas previsão da diretoria, sem obrigação contratual. Empresas podem revisar valores até a aprovação final.',
  },
] as const

const monthlyPattern = [
  {
    label: 'Janeiro/Fevereiro',
    desc: 'Pagamentos de FIIs do mês anterior. Algumas ações antecipam JCP do ano novo, raros dividendos extraordinários remanescentes do ano anterior.',
  },
  {
    label: 'Março/Abril/Maio',
    desc: 'Pico anual de dividendos. Empresas divulgam resultados do quarto trimestre e ano fechado, aprovando distribuição de lucros em assembleia. Maior concentração de pagamentos do calendário B3.',
  },
  {
    label: 'Junho/Julho',
    desc: 'Pagamentos remanescentes da temporada anual. Empresas com balanço semestral começam a anunciar JCP referente ao primeiro semestre.',
  },
  {
    label: 'Agosto/Setembro',
    desc: 'Pagamentos semestrais de algumas empresas (bancos costumam pagar JCP intermediário). Resultados do segundo trimestre divulgados.',
  },
  {
    label: 'Outubro/Novembro',
    desc: 'Calmaria relativa. Empresas começam a calcular projeção de fechamento do ano para anunciar JCP final em dezembro.',
  },
  {
    label: 'Dezembro',
    desc: 'Pagamentos extraordinários de fim de ano e JCP. Empresas otimizam dedução fiscal antes do balanço anual, gerando segundo pico do calendário (menor que o de março/abril).',
  },
  {
    label: 'FIIs (todos os meses)',
    desc: 'Pagamento mensal obrigatório por lei (mínimo 95% do lucro semestral). Datas-com costumam cair entre os dias 28 e 30, com pagamento até o dia 15 do mês seguinte.',
  },
] as const

const topPayers = [
  {
    ticker: 'ITUB4',
    name: 'Itaú Unibanco',
    desc: 'Payout 50-60% do lucro líquido. Combina dividendos e JCP trimestrais. Mais de 30 anos de pagamentos consistentes.',
  },
  {
    ticker: 'ITSA4',
    name: 'Itaúsa',
    desc: 'Holding controladora do Itaú. Recebe dividendos do banco e repassa aos acionistas. Histórico igualmente sólido.',
  },
  {
    ticker: 'TAEE11',
    name: 'Taesa',
    desc: 'Transmissão elétrica. Payout 95%+ por exigência legal do setor. DY histórico entre 8% e 12% ao ano.',
  },
  {
    ticker: 'BBSE3',
    name: 'BB Seguridade',
    desc: 'Seguradora ligada ao Banco do Brasil. Lucro recorrente, payout próximo de 90%. Pagamentos semestrais.',
  },
  {
    ticker: 'BBAS3',
    name: 'Banco do Brasil',
    desc: 'Payout 30-40% estável. DY tipicamente entre 7% e 10%. JCP trimestral é pilar da distribuição.',
  },
  {
    ticker: 'BBDC4',
    name: 'Bradesco',
    desc: 'Distribui majoritariamente via JCP mensal pequeno + dividendos extraordinários no fim do ano.',
  },
  {
    ticker: 'ABEV3',
    name: 'Ambev',
    desc: 'Defensiva clássica. Dividendos pequenos mas consistentes, payout entre 60% e 80% do lucro líquido.',
  },
] as const

const fiiCategories = [
  {
    label: 'Logística',
    tag: 'Galpões e centros de distribuição',
    desc: 'FIIs de galpões logísticos alugados para grandes operadores (Mercado Livre, Amazon, transportadoras). Contratos longos atípicos, baixa vacância histórica.',
    tickers: ['HGLG11', 'XPLG11', 'GGRC11', 'BTLG11', 'LVBI11'],
  },
  {
    label: 'Shoppings',
    tag: 'Varejo físico',
    desc: 'FIIs proprietários de shoppings centers. Receita atrelada a faturamento dos lojistas, mais cíclico que logística mas com upside em recuperação econômica.',
    tickers: ['VISC11', 'HSML11', 'XPML11', 'MALL11'],
  },
  {
    label: 'Lajes Corporativas',
    tag: 'Escritórios premium',
    desc: 'Andares de prédios corporativos AAA em São Paulo e Rio. Setor pressionado por home office mas com sinais de retomada em 2025-2026.',
    tickers: ['HGRE11', 'BRCR11', 'PVBI11', 'RCRB11'],
  },
  {
    label: 'Híbridos',
    tag: 'Multi-segmento',
    desc: 'Mistura de tijolo (lajes, shoppings, logística) e papel (CRIs). Diversificação interna ao FII, ideal para quem quer simplicidade.',
    tickers: ['KNRI11', 'HGRU11', 'BRCO11'],
  },
  {
    label: 'Papel (CRIs e Debêntures)',
    tag: 'Dívida imobiliária',
    desc: 'FIIs que investem em CRIs (Certificados de Recebíveis Imobiliários) e debêntures. Rentabilidade indexada a CDI ou IPCA. Volatilidade de cota baixa.',
    tickers: ['MXRF11', 'KNCR11', 'KNIP11', 'DIVD11', 'SNLG11', 'RBRY11'],
  },
  {
    label: 'Fundo de Fundos (FoFs)',
    tag: 'FII que compra FII',
    desc: 'Carteira diversificada de outros FIIs. Gestor profissional faz alocação entre segmentos. Camada extra de taxa, mas simplicidade operacional.',
    tickers: ['BCFF11', 'FOFT11', 'HFOF11', 'BPFF11'],
  },
] as const

const receiveSteps = [
  {
    title: 'Abrir conta em corretora',
    body: 'Escolha uma corretora regulada pela CVM. Opções populares: XP, BTG Pactual, Toro, Inter, Clear, Rico, Modal, NuInvest, Avenue. A maioria não cobra mais corretagem em ações ou FIIs negociados na B3.',
  },
  {
    title: 'Comprar a ação ou FII pelo home broker',
    body: 'Use a plataforma da corretora ou aplicativo para emitir ordem de compra. O lote padrão é 1 ação no Brasil (não precisa comprar 100 como nos EUA). Para FIIs, o lote também é 1 cota.',
  },
  {
    title: 'Manter a ação até a data-com',
    body: 'Você precisa estar com a ação na carteira no fechamento do pregão da data-com. Pode vender no dia seguinte (data-ex), o direito ao provento já foi gerado e não pode ser revertido.',
  },
  {
    title: 'Aguardar o pagamento na conta da corretora',
    body: 'O dinheiro cai automaticamente na sua conta de investimento entre 30 e 60 dias após a aprovação em assembleia (10 a 15 dias para FIIs). Você não precisa solicitar nem assinar nada.',
  },
  {
    title: 'Reinvestir ou sacar',
    body: 'O recomendado é reinvestir comprando mais ações ou cotas (efeito bola de neve dos dividendos). Quem precisa de renda passiva pode transferir o valor para a conta corrente via TED ou PIX.',
  },
] as const

const tickerLinks = [
  { ticker: 'PETR4', name: 'Petrobras' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco' },
  { ticker: 'VALE3', name: 'Vale' },
  { ticker: 'ITSA4', name: 'Itaúsa' },
  { ticker: 'BBAS3', name: 'Banco do Brasil' },
  { ticker: 'BBDC4', name: 'Bradesco' },
  { ticker: 'BBSE3', name: 'BB Seguridade' },
  { ticker: 'TAEE11', name: 'Taesa' },
  { ticker: 'ABEV3', name: 'Ambev' },
  { ticker: 'MXRF11', name: 'Maxi Renda FII' },
  { ticker: 'KNCR11', name: 'Kinea Rendimentos FII' },
  { ticker: 'HGLG11', name: 'CSHG Logística FII' },
] as const
</script>

<style scoped>
/* ============ V5 content wrapper ============ */
.cal-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 24px 64px;
  max-width: 1200px;
  margin: 0 auto;
  border-top: 1px solid var(--border-subtle);
}
@media (min-width: 768px) {
  .cal-content { padding: 64px 32px 96px; }
}
@media (min-width: 1024px) {
  .cal-content { padding: 80px 56px 120px; }
}

.cal-answer-first {
  font-size: 15px;
  line-height: 1.7;
  color: var(--brand-text-muted);
  text-align: center;
  max-width: 68ch;
  margin: 8px auto 0;
}

/* ============ Month nav buttons ============ */
.cal-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: background-color 140ms ease-out;
}
.cal-nav-btn:hover {
  background-color: color-mix(in srgb, var(--brand-text) 7%, transparent);
}

/* ============ Calendar cells ============ */
.cal-cell:not(:disabled) {
  cursor: pointer;
}
.cal-cell:not(:disabled):hover {
  background-color: color-mix(in srgb, var(--brand-primary) 5%, transparent) !important;
}
.cal-cell-out {
  background-color: color-mix(in srgb, var(--brand-border) 8%, transparent);
}
.cal-cell-skeleton {
  min-height: 110px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--brand-text) 4%, transparent) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: cal-shimmer 1.4s linear infinite;
}
@keyframes cal-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

/* Cells in the last column / last visible row don't need an extra
   border to avoid double lines on the container's bottom/right. */
.cal-cell:nth-child(7n),
.cal-cell-skeleton:nth-child(7n) {
  border-right: 0;
}

/* ============ Drawer transition ============ */
.cal-drawer-enter-active,
.cal-drawer-leave-active {
  transition: opacity 200ms ease-out;
}
.cal-drawer-enter-from,
.cal-drawer-leave-to {
  opacity: 0;
}
.cal-drawer-enter-active > div:last-child,
.cal-drawer-leave-active > div:last-child {
  transition: transform 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.cal-drawer-enter-from > div:last-child,
.cal-drawer-leave-to > div:last-child {
  transform: translateY(40px);
}

@media (prefers-reduced-motion: reduce) {
  .cal-cell-skeleton { animation: none; }
  .cal-drawer-enter-active > div:last-child,
  .cal-drawer-leave-active > div:last-child {
    transition: none;
  }
}
</style>
