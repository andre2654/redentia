<!--
  PanelDrawer — audit / "everything the AI has access to" workspace.

  Refactor goals (user feedback "experiência muito ruim, refazer
  toda a experiência ali"):
    - Wider canvas: 640px on desktop (was 480px) so cards can breathe.
    - Settings-panel layout: vertical nav on the left, focused content
      on the right. One section visible at a time — no more anchored-
      scroll where the next section bleeds into view.
    - Each tab is a standalone view with its own header (title +
      count + primary action), filter / search where it earns it,
      empty state with copy that tells the user how to populate it,
      and richer card density.
    - Mobile (< md): the nav collapses to horizontal scrollable tabs
      at the top, the body fills the rest of the height.

  Tabs (alerts moved to the dedicated NotificationsDrawer earlier):

    - Metas      → goal cards with status + progress + projected
    - Decisões   → status filter pills + hit-rate stat + thesis cards
    - Watch      → ticker cards with their condition list inline
    - Memória    → search + kind filter chips + pretty-printed values
    - Atividade  → day-relative grouping with kind filter

  Same Teleport + manual-rAF transition pattern as before (avoids
  the auto-close race we hit when nesting Vue Transitions inside
  Teleport on first open).
-->
<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="audit-mount fixed inset-0 z-[80]"
      @keydown.esc="onCloseRequest"
    >
      <button
        type="button"
        class="audit-backdrop fixed inset-0 transition-opacity duration-200"
        :style="{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: backdropMounted ? 1 : 0,
          pointerEvents: openGuard ? 'none' : 'auto',
        }"
        aria-label="Fechar auditoria"
        tabindex="-1"
        @click="onCloseRequest"
      />
      <aside
        ref="dialogRef"
        class="audit-panel fixed bottom-0 right-0 top-auto flex h-[92vh] w-full flex-col transition-transform duration-300 md:bottom-auto md:top-0 md:h-full md:max-w-[640px]"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :style="{
          ...panelStyle,
          transform: panelMounted ? 'translateY(0) translateX(0)' : panelOffsetTransform,
        }"
        tabindex="-1"
        @click.stop
      >
        <!-- Mobile drag handle -->
        <span
          class="mx-auto mt-3 inline-block h-1 w-12 rounded-full md:hidden"
          :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 18%, transparent)` }"
          aria-hidden="true"
        />

        <!-- Header -->
        <header
          class="flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-5 md:px-7 md:pt-6"
        >
          <div class="flex flex-col gap-1">
            <span
              class="font-mono-tab text-[10.5px] uppercase tracking-[0.2em]"
              :style="{ color: brand.colors.textMuted }"
            >Auditoria</span>
            <h2
              :id="titleId"
              class="font-display text-[22px] font-semibold leading-tight tracking-tight"
              :style="{ color: brand.colors.text }"
            >Tudo que a IA guarda</h2>
          </div>
          <button
            type="button"
            class="audit-close inline-flex size-8 items-center justify-center rounded-full transition-colors"
            :style="{ color: brand.colors.textMuted }"
            aria-label="Fechar auditoria"
            @click="onCloseRequest"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </header>

        <!-- Mobile tab strip -->
        <nav
          class="audit-mobilenav flex shrink-0 items-center gap-1 overflow-x-auto px-5 pb-2 md:hidden"
          aria-label="Seções da auditoria"
        >
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            :aria-current="activeTab === t.id ? 'page' : undefined"
            class="audit-mobilenav-btn shrink-0 rounded-full px-3 py-1.5 text-[12px] transition-colors"
            :style="mobileNavStyle(t.id)"
            @click="setTab(t.id)"
          >
            {{ t.label }}
            <span
              v-if="t.count > 0"
              class="font-mono-tab ml-1 tabular-nums text-[10px]"
              :style="{ color: 'inherit', opacity: 0.7 }"
            >{{ t.count }}</span>
          </button>
        </nav>

        <!-- Body — desktop has the sidebar + content split; mobile is
             content-only because the strip above already serves nav. -->
        <div
          class="audit-body flex min-h-0 flex-1"
          :style="{
            borderTop: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
          }"
        >
          <!-- Desktop sidebar nav -->
          <nav
            class="audit-sidenav hidden w-[150px] shrink-0 flex-col gap-px py-3 md:flex"
            :style="{
              borderRight: `1px solid color-mix(in srgb, ${brand.colors.border} 30%, transparent)`,
            }"
            aria-label="Seções da auditoria"
          >
            <button
              v-for="t in tabs"
              :key="t.id"
              type="button"
              :aria-current="activeTab === t.id ? 'page' : undefined"
              class="audit-sidenav-btn group flex items-center gap-2 px-4 py-2 text-left text-[12.5px] transition-colors"
              :style="sideNavStyle(t.id)"
              @click="setTab(t.id)"
            >
              <UIcon
                :name="t.icon"
                class="size-3.5 shrink-0"
                :style="{ color: 'currentColor', opacity: activeTab === t.id ? 1 : 0.7 }"
                aria-hidden="true"
              />
              <span class="min-w-0 flex-1 truncate">{{ t.label }}</span>
              <span
                v-if="t.count > 0"
                class="font-mono-tab text-[10.5px] tabular-nums"
                :style="{
                  color: 'inherit',
                  opacity: activeTab === t.id ? 0.85 : 0.55,
                }"
              >{{ t.count }}</span>
            </button>
          </nav>

          <!-- Section content -->
          <div
            ref="bodyRef"
            class="audit-content flex-1 overflow-y-auto px-5 py-5 md:px-6"
          >
            <!-- ============ Metas ============ -->
            <section v-if="activeTab === 'goals'" class="flex flex-col gap-4">
              <header class="flex items-baseline justify-between gap-3">
                <div class="flex flex-col gap-0.5">
                  <h3
                    class="text-[15px] font-semibold leading-tight"
                    :style="{ color: brand.colors.text }"
                  >Metas</h3>
                  <p
                    class="font-mono-tab text-[10.5px] uppercase tracking-[0.16em]"
                    :style="{ color: brand.colors.textMuted }"
                  >{{ goalsState.goals.value.length }} {{ goalsState.goals.value.length === 1 ? 'meta' : 'metas' }}</p>
                </div>
                <button
                  type="button"
                  class="text-[11.5px] transition-colors"
                  :style="primaryActionStyle"
                  @click="onNewGoal"
                >+ Nova meta</button>
              </header>
              <div
                v-if="goalsState.goals.value.length === 0"
                class="empty"
                :style="emptyStyle"
              >
                <UIcon name="i-lucide-target" class="size-7" :style="{ color: brand.colors.textMuted }" aria-hidden="true" />
                <p class="empty-title" :style="{ color: brand.colors.text }">Sem metas definidas</p>
                <p class="empty-body" :style="{ color: brand.colors.textMuted }">
                  Crie a primeira para que cada recomendação da IA passe a ser avaliada contra ela. Aposentadoria, FIRE, reserva de emergência — qualquer objetivo concreto.
                </p>
                <button type="button" class="empty-cta" :style="ctaStyle" @click="onNewGoal">
                  Definir primeira meta
                </button>
              </div>
              <ul v-else class="flex flex-col gap-2">
                <li v-for="g in goalsState.goals.value" :key="g.id">
                  <article
                    class="goal-card flex w-full flex-col gap-2 rounded-xl px-3.5 py-3"
                    :style="cardStyle"
                  >
                    <button
                      type="button"
                      class="goal-card-body flex w-full items-stretch gap-3 text-left"
                      @click="emit('select-goal', g)"
                    >
                      <span
                        class="flex size-9 shrink-0 items-center justify-center rounded-lg text-[16px]"
                        :style="{
                          backgroundColor: `color-mix(in srgb, ${goalStatusColor(g.status)} 12%, transparent)`,
                        }"
                        aria-hidden="true"
                      >{{ g.emoji ?? '🎯' }}</span>
                      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
                        <header class="flex items-baseline justify-between gap-3">
                          <span
                            class="truncate text-[14px] font-semibold leading-tight"
                            :style="{ color: brand.colors.text }"
                          >{{ g.name }}</span>
                          <span
                            class="font-mono-tab shrink-0 text-[12px] tabular-nums"
                            :style="{ color: brand.colors.text }"
                          >{{ goalProgress(g) }}%</span>
                        </header>
                        <div class="flex items-center gap-2">
                          <span
                            class="inline-flex size-1.5 shrink-0 rounded-full"
                            :style="{ backgroundColor: goalStatusColor(g.status) }"
                            aria-hidden="true"
                          />
                          <span
                            class="font-mono-tab text-[10.5px] uppercase tracking-[0.14em]"
                            :style="{ color: brand.colors.textMuted }"
                          >{{ goalStatusLabel(g.status) }}</span>
                          <span
                            class="text-[11px]"
                            :style="{ color: brand.colors.textMuted }"
                          >· até {{ formatDate(g.targetDate) }}</span>
                        </div>
                        <div
                          class="relative h-[3px] w-full overflow-hidden rounded-full"
                          :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 6%, transparent)` }"
                          aria-hidden="true"
                        >
                          <span
                            class="absolute inset-y-0 left-0 origin-left rounded-full transition-transform duration-500"
                            :style="{
                              backgroundColor: goalStatusColor(g.status),
                              width: '100%',
                              transform: `scaleX(${goalProgress(g) / 100})`,
                            }"
                          />
                        </div>
                      </div>
                    </button>
                    <!-- Smart actions — context-aware: an unfeasible
                         goal surfaces "Achar caminhos" front-and-
                         center; healthy goals just have "Conversar". -->
                    <footer
                      class="flex flex-wrap items-center gap-1.5 pt-1"
                      :style="{ borderTop: `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` }"
                    >
                      <button
                        v-if="g.status === 'unfeasible' || g.status === 'at_risk'"
                        type="button"
                        class="action-pill action-pill-primary"
                        :style="actionPillStyle(true)"
                        @click="findGoalSolutionsPrompt(g)"
                      >
                        <UIcon name="i-lucide-sparkles" class="size-3" aria-hidden="true" />
                        Achar caminhos
                      </button>
                      <button
                        type="button"
                        class="action-pill"
                        :style="actionPillStyle(false)"
                        @click="discussGoalPrompt(g)"
                      >
                        Conversar sobre
                      </button>
                      <button
                        type="button"
                        class="action-pill ml-auto"
                        :style="actionPillStyle(false)"
                        @click="emit('select-goal', g)"
                      >
                        Detalhes
                      </button>
                    </footer>
                  </article>
                </li>
              </ul>
            </section>

            <!-- ============ Decisões ============ -->
            <section v-else-if="activeTab === 'decisions'" class="flex flex-col gap-4">
              <header class="flex flex-wrap items-baseline justify-between gap-3">
                <div class="flex flex-col gap-0.5">
                  <h3
                    class="text-[15px] font-semibold leading-tight"
                    :style="{ color: brand.colors.text }"
                  >Decisões</h3>
                  <p
                    class="font-mono-tab text-[10.5px] uppercase tracking-[0.16em]"
                    :style="{ color: brand.colors.textMuted }"
                  >{{ decisionsState.decisions.value.length }} {{ decisionsState.decisions.value.length === 1 ? 'decisão' : 'decisões' }}</p>
                </div>
                <span
                  v-if="decisionsState.hitRate.value.total > 0"
                  :style="hitRatePillStyle"
                >
                  {{ Math.round((decisionsState.hitRate.value.rate ?? 0) * 100) }}% hit
                  <span :style="{ color: brand.colors.textMuted, marginLeft: '4px' }">
                    · {{ decisionsState.hitRate.value.hits }}/{{ decisionsState.hitRate.value.total }}
                  </span>
                </span>
              </header>

              <!-- Status filter pills -->
              <div
                v-if="decisionsState.decisions.value.length > 0"
                class="flex flex-wrap items-center gap-1.5"
                role="tablist"
                aria-label="Filtrar por status"
              >
                <button
                  v-for="f in decisionFilters"
                  :key="f.id"
                  type="button"
                  role="tab"
                  :aria-selected="decisionFilter === f.id"
                  class="filter-pill"
                  :style="filterPillStyle(decisionFilter === f.id)"
                  @click="decisionFilter = f.id"
                >
                  {{ f.label }}
                  <span class="font-mono-tab ml-1 tabular-nums text-[10px]" :style="{ opacity: 0.7 }">{{ f.count }}</span>
                </button>
              </div>

              <div
                v-if="filteredDecisions.length === 0"
                class="empty"
                :style="emptyStyle"
              >
                <UIcon name="i-lucide-check-square" class="size-7" :style="{ color: brand.colors.textMuted }" aria-hidden="true" />
                <p class="empty-title" :style="{ color: brand.colors.text }">
                  {{ decisionsState.decisions.value.length === 0 ? 'Sem decisões registradas' : 'Nenhuma decisão neste filtro' }}
                </p>
                <p class="empty-body" :style="{ color: brand.colors.textMuted }">
                  Decisões prescritivas (compra, venda, rebalance) que a IA registra ficam aqui — com tese, invalidador e revisita automática em +30/+90/+180 dias.
                </p>
              </div>
              <ul v-else class="flex flex-col gap-2">
                <li v-for="d in filteredDecisions" :key="d.id">
                  <article
                    class="decision-card flex w-full flex-col gap-2 rounded-xl px-3.5 py-3"
                    :style="cardStyle"
                  >
                    <button
                      type="button"
                      class="decision-card-body flex w-full flex-col gap-2 text-left"
                      @click="emit('select-decision', d)"
                    >
                      <header class="flex flex-wrap items-center gap-2">
                        <span
                          class="font-mono-tab text-[10.5px] uppercase tracking-[0.14em]"
                          :style="{ color: brand.colors.textMuted }"
                        >{{ decisionTypeLabel(d.type) }}</span>
                        <ChatV2TickerChip
                          v-if="d.ticker"
                          :ticker="d.ticker"
                          :price-when-mentioned="parseDecisionPrice(d.targetPrice)"
                          density="compact"
                        />
                        <span
                          class="font-mono-tab ml-auto text-[10px] uppercase tracking-[0.14em]"
                          :style="{ color: decisionStatusColor(d.status) }"
                        >{{ d.status }}</span>
                      </header>
                      <p
                        class="line-clamp-2 text-[12.5px] leading-snug"
                        :style="{ color: brand.colors.text }"
                      >{{ d.thesis }}</p>
                      <p
                        v-if="d.invalidator"
                        class="text-[11px] leading-snug"
                        :style="{ color: brand.colors.textMuted }"
                      >Invalidador: <span :style="{ color: brand.colors.text }">{{ d.invalidator }}</span></p>
                    </button>

                    <!-- Smart actions row -->
                    <footer
                      class="flex flex-wrap items-center gap-1.5 pt-1"
                      :style="{ borderTop: `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` }"
                    >
                      <button
                        type="button"
                        class="action-pill action-pill-primary"
                        :style="actionPillStyle(true)"
                        @click="rethinkDecisionPrompt(d)"
                      >
                        <UIcon name="i-lucide-refresh-ccw" class="size-3" aria-hidden="true" />
                        Repensar tese
                      </button>
                      <button
                        type="button"
                        class="action-pill"
                        :style="actionPillStyle(false)"
                        @click="counterProposalOpen = counterProposalOpen === d.id ? null : d.id"
                      >
                        <UIcon name="i-lucide-arrow-left-right" class="size-3" aria-hidden="true" />
                        Contraproposta
                      </button>
                      <button
                        type="button"
                        class="action-pill ml-auto"
                        :style="actionPillStyle(false)"
                        @click="emit('select-decision', d)"
                      >
                        Detalhes
                      </button>
                    </footer>

                    <!-- Inline counter-proposal mini-form -->
                    <div
                      v-if="counterProposalOpen === d.id"
                      class="counter-proposal flex flex-col gap-2 rounded-lg p-2.5"
                      :style="{
                        backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 6%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
                      }"
                    >
                      <label
                        class="font-mono-tab text-[10px] uppercase tracking-[0.16em]"
                        :style="{ color: brand.colors.textMuted }"
                      >Sua contraproposta</label>
                      <textarea
                        v-model="counterProposalDraft[d.id]"
                        rows="2"
                        placeholder="Ex.: ao invés de comprar PETR4 a 32, esperar 28 — risco/retorno melhora porque…"
                        class="counter-proposal-input min-w-0 resize-none border-0 bg-transparent text-[12.5px] leading-snug outline-none"
                        :style="{ color: brand.colors.text }"
                      />
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          class="action-pill"
                          :style="actionPillStyle(false)"
                          @click="counterProposalOpen = null"
                        >Cancelar</button>
                        <button
                          type="button"
                          class="action-pill action-pill-primary"
                          :style="actionPillStyle(true)"
                          :disabled="!counterProposalDraft[d.id]?.trim()"
                          @click="submitCounterProposal(d)"
                        >
                          <UIcon name="i-lucide-sparkles" class="size-3" aria-hidden="true" />
                          Enviar para Redentia MAX
                        </button>
                      </div>
                    </div>
                  </article>
                </li>
              </ul>
            </section>

            <!-- ============ Watchlist ============ -->
            <section v-else-if="activeTab === 'watchlist'" class="flex flex-col gap-4">
              <header class="flex items-baseline justify-between gap-3">
                <div class="flex flex-col gap-0.5">
                  <h3
                    class="text-[15px] font-semibold leading-tight"
                    :style="{ color: brand.colors.text }"
                  >Watchlist</h3>
                  <p
                    class="font-mono-tab text-[10.5px] uppercase tracking-[0.16em]"
                    :style="{ color: brand.colors.textMuted }"
                  >{{ watchlistState.watches.value.length }} {{ watchlistState.watches.value.length === 1 ? 'ativo' : 'ativos' }}</p>
                </div>
              </header>
              <div
                v-if="watchlistState.watches.value.length === 0"
                class="empty"
                :style="emptyStyle"
              >
                <UIcon name="i-lucide-eye" class="size-7" :style="{ color: brand.colors.textMuted }" aria-hidden="true" />
                <p class="empty-title" :style="{ color: brand.colors.text }">Watchlist proativa vazia</p>
                <p class="empty-body" :style="{ color: brand.colors.textMuted }">
                  Peça à IA para monitorar um ativo com condição: "monitora PETR4 e me avisa se cair 8%". O cron sweep avalia a cada 30 min.
                </p>
              </div>
              <ul v-else class="flex flex-col gap-2">
                <li v-for="w in watchlistState.watches.value" :key="w.id">
                  <article class="watch-card flex flex-col gap-2 rounded-xl px-3.5 py-3" :style="cardStyle">
                    <header class="flex items-center gap-2">
                      <ChatV2TickerChip
                        :ticker="w.ticker"
                        :price-when-mentioned="w.snapshotPrice ?? null"
                      />
                      <span
                        v-if="w.note"
                        class="truncate text-[11.5px]"
                        :style="{ color: brand.colors.textMuted }"
                      >{{ w.note }}</span>
                      <button
                        type="button"
                        class="watch-remove ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors"
                        :style="{ color: brand.colors.textMuted }"
                        :aria-label="`Remover ${w.ticker}`"
                        @click="watchlistState.remove(w.id)"
                      >
                        <UIcon name="i-lucide-x" class="size-3" />
                      </button>
                    </header>
                    <ul
                      v-if="w.conditions && w.conditions.length > 0"
                      class="flex flex-col gap-1 pt-1"
                      :style="{ borderTop: `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` }"
                    >
                      <li
                        v-for="(c, idx) in w.conditions"
                        :key="idx"
                        class="flex items-center gap-2 text-[11.5px]"
                      >
                        <span
                          class="inline-flex size-1 shrink-0 rounded-full"
                          :style="{ backgroundColor: brand.colors.primary }"
                          aria-hidden="true"
                        />
                        <span :style="{ color: brand.colors.text }">{{ describeWatchCondition(c) }}</span>
                      </li>
                    </ul>
                    <p
                      v-else
                      class="text-[11px] italic"
                      :style="{ color: brand.colors.textMuted }"
                    >Sem condições — não dispara alertas.</p>
                    <footer
                      class="flex items-center gap-1.5 pt-1"
                      :style="{ borderTop: `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` }"
                    >
                      <button
                        type="button"
                        class="action-pill"
                        :style="actionPillStyle(false)"
                        @click="reviewWatchPrompt(w.ticker)"
                      >
                        <UIcon name="i-lucide-search" class="size-3" aria-hidden="true" />
                        Revisar tese
                      </button>
                    </footer>
                  </article>
                </li>
              </ul>
            </section>

            <!-- ============ Memória ============ -->
            <section v-else-if="activeTab === 'memory'" class="flex flex-col gap-4">
              <header class="flex flex-wrap items-baseline justify-between gap-3">
                <div class="flex flex-col gap-0.5">
                  <h3
                    class="text-[15px] font-semibold leading-tight"
                    :style="{ color: brand.colors.text }"
                  >Memória de longo prazo</h3>
                  <p
                    class="font-mono-tab text-[10.5px] uppercase tracking-[0.16em]"
                    :style="{ color: brand.colors.textMuted }"
                  >{{ memoriesState.memories.value.length }} {{ memoriesState.memories.value.length === 1 ? 'fato' : 'fatos' }}</p>
                </div>
                <button
                  v-if="memoriesState.memories.value.length > 0"
                  type="button"
                  class="text-[10.5px] transition-colors"
                  :style="{
                    color: brand.colors.negative,
                    border: `1px solid color-mix(in srgb, ${brand.colors.negative} 28%, transparent)`,
                    borderRadius: '999px',
                    padding: '4px 10px',
                  }"
                  @click="confirmClearMemories"
                >{{ memoryClearStage === 'arm' ? 'Confirmar limpeza' : 'Limpar tudo' }}</button>
              </header>

              <p
                v-if="memoriesState.memories.value.length > 0"
                class="text-[11.5px] leading-snug"
                :style="{ color: brand.colors.textMuted }"
              >Tudo que a IA aprendeu sobre você. Esses fatos são injetados no prompt em toda nova mensagem — audite, edite ou remova o que não fizer sentido.</p>

              <!-- Search + filter -->
              <div
                v-if="memoriesState.memories.value.length > 4"
                class="flex flex-col gap-2"
              >
                <label
                  class="flex items-center gap-2 rounded-lg px-3 py-2"
                  :style="{
                    backgroundColor: `color-mix(in srgb, ${brand.colors.text} 4%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
                  }"
                >
                  <UIcon name="i-lucide-search" class="size-3.5 shrink-0" :style="{ color: brand.colors.textMuted }" />
                  <input
                    v-model="memorySearch"
                    type="text"
                    placeholder="Buscar memórias…"
                    autocomplete="off"
                    spellcheck="false"
                    class="min-w-0 flex-1 border-0 bg-transparent text-[12.5px] outline-none"
                    :style="{ color: brand.colors.text }"
                  />
                  <button
                    v-if="memorySearch"
                    type="button"
                    class="shrink-0 rounded-full p-0.5 transition-colors"
                    :style="{ color: brand.colors.textMuted }"
                    aria-label="Limpar busca"
                    @click="memorySearch = ''"
                  >
                    <UIcon name="i-lucide-x" class="size-3" />
                  </button>
                </label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="kind in memoryKindFilters"
                    :key="kind.id"
                    type="button"
                    class="filter-pill"
                    :style="filterPillStyle(memoryKindFilter === kind.id)"
                    @click="memoryKindFilter = kind.id"
                  >
                    {{ kind.label }}
                    <span class="font-mono-tab ml-1 tabular-nums text-[10px]" :style="{ opacity: 0.7 }">{{ kind.count }}</span>
                  </button>
                </div>
              </div>

              <div v-if="filteredMemories.length === 0" class="empty" :style="emptyStyle">
                <UIcon name="i-lucide-brain" class="size-7" :style="{ color: brand.colors.textMuted }" aria-hidden="true" />
                <p class="empty-title" :style="{ color: brand.colors.text }">
                  {{ memoriesState.memories.value.length === 0 ? 'Memória vazia' : 'Nada bate com a busca' }}
                </p>
                <p
                  v-if="memoriesState.memories.value.length === 0"
                  class="empty-body"
                  :style="{ color: brand.colors.textMuted }"
                >
                  Conforme você conversa, fatos relevantes (perfil, preferências, decisões, fatos) ficam guardados aqui e voltam a contextualizar a IA em conversas futuras.
                </p>
              </div>

              <div v-else class="flex flex-col gap-3">
                <article
                  v-for="[kind, rows] in filteredMemoryGroups"
                  :key="kind"
                  class="memory-group flex flex-col rounded-xl"
                  :style="memoryGroupStyle"
                >
                  <header class="flex items-baseline justify-between gap-2 px-3 pt-2.5">
                    <h4
                      class="font-mono-tab text-[10.5px] uppercase tracking-[0.18em]"
                      :style="{ color: brand.colors.textMuted }"
                    >{{ memoryKindLabel(kind) }}</h4>
                    <span
                      class="font-mono-tab text-[10.5px] tabular-nums"
                      :style="{ color: brand.colors.textMuted }"
                    >{{ rows.length }}</span>
                  </header>
                  <ul class="flex flex-col gap-px pb-1.5 pt-1">
                    <li
                      v-for="m in rows"
                      :key="m.id"
                      class="memory-row flex items-start gap-2 px-3 py-2"
                    >
                      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span
                          class="font-mono-tab truncate text-[10.5px]"
                          :style="{ color: brand.colors.text }"
                        >{{ humanizeKey(m.key) }}</span>
                        <span
                          class="break-words text-[12.5px] leading-snug"
                          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 88%, transparent)` }"
                        >{{ formatMemoryValue(m.value) }}</span>
                        <span
                          class="font-mono-tab pt-0.5 text-[10px] tabular-nums"
                          :style="{ color: brand.colors.textMuted }"
                        >{{ formatDate(m.updatedAt) }} · conf {{ m.confidence }}</span>
                      </div>
                      <button
                        type="button"
                        class="memory-delete inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors"
                        :style="{ color: brand.colors.textMuted }"
                        :aria-label="`Esquecer ${m.key}`"
                        @click="memoriesState.remove(m.id)"
                      >
                        <UIcon name="i-lucide-trash-2" class="size-3" />
                      </button>
                    </li>
                  </ul>
                </article>
              </div>
            </section>

            <!-- ============ Atividade ============ -->
            <section v-else-if="activeTab === 'activity'" class="flex flex-col gap-4">
              <header class="flex items-baseline justify-between gap-3">
                <div class="flex flex-col gap-0.5">
                  <h3
                    class="text-[15px] font-semibold leading-tight"
                    :style="{ color: brand.colors.text }"
                  >Atividade recente</h3>
                  <p
                    class="font-mono-tab text-[10.5px] uppercase tracking-[0.16em]"
                    :style="{ color: brand.colors.textMuted }"
                  >{{ activityState.events.value.length }} {{ activityState.events.value.length === 1 ? 'evento' : 'eventos' }}</p>
                </div>
              </header>

              <div
                v-if="activityState.events.value.length === 0 && !activityState.loading.value"
                class="empty"
                :style="emptyStyle"
              >
                <UIcon name="i-lucide-activity" class="size-7" :style="{ color: brand.colors.textMuted }" aria-hidden="true" />
                <p class="empty-title" :style="{ color: brand.colors.text }">Sem atividade recente</p>
                <p class="empty-body" :style="{ color: brand.colors.textMuted }">
                  Eventos da IA — tools rodadas, mudanças de status de decisão, alertas disparados, novas memórias — aparecem aqui em ordem cronológica.
                </p>
              </div>

              <p
                v-else-if="activityState.loading.value && activityState.events.value.length === 0"
                class="text-[12px]"
                :style="{ color: brand.colors.textMuted }"
              >Carregando…</p>

              <div v-else class="flex flex-col gap-4">
                <div
                  v-for="group in activityGroups"
                  :key="group.label"
                  class="flex flex-col gap-1"
                >
                  <h4
                    class="font-mono-tab px-2 text-[10.5px] uppercase tracking-[0.18em]"
                    :style="{ color: brand.colors.textMuted }"
                  >{{ group.label }} · {{ group.events.length }}</h4>
                  <ul class="flex flex-col gap-px">
                    <li v-for="e in group.events" :key="e.id">
                      <div class="activity-row flex items-start gap-2.5 rounded-md px-2 py-1.5">
                        <span
                          class="mt-1 inline-flex size-1.5 shrink-0 rounded-full"
                          :style="{ backgroundColor: activityKindColor(e.kind) }"
                          aria-hidden="true"
                        />
                        <div class="flex min-w-0 flex-1 flex-col">
                          <div class="flex items-baseline gap-2">
                            <span
                              class="truncate text-[12.5px]"
                              :style="{ color: brand.colors.text }"
                            >{{ e.summary }}</span>
                            <span
                              v-if="e.detail"
                              class="font-mono-tab truncate text-[10.5px]"
                              :style="{ color: brand.colors.textMuted }"
                            >{{ e.detail }}</span>
                          </div>
                          <span
                            class="font-mono-tab text-[10px] tabular-nums"
                            :style="{ color: brand.colors.textMuted }"
                          >{{ formatRelative(e.at) }}</span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import type { GoalStatus, ChatGoal } from '~/composables/useGoals'
import type { ChatDecision, DecisionType } from '~/composables/useDecisions'
import type { ActivityEvent, ActivityKind } from '~/composables/useActivity'
import type { WatchCondition } from '~/composables/useWatchlist'

type SectionId = 'goals' | 'decisions' | 'watchlist' | 'memory' | 'activity'

const props = defineProps<{
  open: boolean
  initialSection?: SectionId
}>()

const emit = defineEmits<{
  close: []
  'new-goal': []
  'select-goal': [goal: ChatGoal]
  'select-decision': [decision: ChatDecision]
  /**
   * Smart-action shortcut: each card surfaces opinionated CTAs that
   * send a pre-built prompt to the chat ("repensar tese", "achar
   * solução para meta inviável", etc.). The parent (help.vue) closes
   * the drawer and dispatches the prompt through the regular
   * `chat.send(...)` path so the response shows up as a normal turn.
   */
  'chat-prompt': [text: string]
}>()

const brand = useBrand()
const goalsState = useGoals()
const decisionsState = useDecisions()
const watchlistState = useWatchlist()
const memoriesState = useMemories()
const activityState = useActivity()

const titleId = `audit-title-${Math.random().toString(36).slice(2, 8)}`
const dialogRef = ref<HTMLElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const activeTab = ref<SectionId>('goals')

const decisionFilter = ref<'all' | 'pending' | 'accepted' | 'executed' | 'reviewed'>('all')
const memorySearch = ref('')
const memoryKindFilter = ref<string>('all')
const memoryClearStage = ref<'idle' | 'arm'>('idle')

/**
 * Per-decision counter-proposal state. Map keyed by decision id —
 * stores the pending text + an `open` flag so the inline mini-form
 * only appears for the row the user clicked, and persists their
 * draft across drawer open/close cycles.
 */
const counterProposalDraft = reactive<Record<string, string>>({})
const counterProposalOpen = ref<string | null>(null)

const backdropMounted = ref(false)
const panelMounted = ref(false)
const openGuard = ref(false)
let openGuardTimer: ReturnType<typeof setTimeout> | null = null

const panelOffsetTransform = computed(() => {
  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
    return 'translateX(100%)'
  }
  return 'translateY(100%)'
})

function onCloseRequest() {
  if (openGuard.value) return
  emit('close')
}
function onNewGoal() {
  emit('new-goal')
}

interface Tab {
  id: SectionId
  label: string
  icon: string
  count: number
}

const tabs = computed<Tab[]>(() => [
  { id: 'goals', label: 'Metas', icon: 'i-lucide-target', count: goalsState.goals.value.length },
  {
    id: 'decisions',
    label: 'Decisões',
    icon: 'i-lucide-check-square',
    count: decisionsState.decisions.value.length,
  },
  { id: 'watchlist', label: 'Watch', icon: 'i-lucide-eye', count: watchlistState.watches.value.length },
  { id: 'memory', label: 'Memória', icon: 'i-lucide-brain', count: memoriesState.memories.value.length },
  { id: 'activity', label: 'Atividade', icon: 'i-lucide-activity', count: activityState.events.value.length },
])

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      memoryClearStage.value = 'idle'
      backdropMounted.value = false
      panelMounted.value = false
      openGuard.value = false
      if (openGuardTimer) {
        clearTimeout(openGuardTimer)
        openGuardTimer = null
      }
      return
    }
    openGuard.value = true
    if (openGuardTimer) clearTimeout(openGuardTimer)
    openGuardTimer = setTimeout(() => {
      openGuard.value = false
      openGuardTimer = null
    }, 320)

    void goalsState.refresh()
    void decisionsState.refresh()
    void watchlistState.refresh()
    void memoriesState.refresh()
    void activityState.refresh()
    await nextTick()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        backdropMounted.value = true
        panelMounted.value = true
        dialogRef.value?.focus()
        if (props.initialSection) activeTab.value = props.initialSection
        else activeTab.value = 'goals'
      })
    })
  },
)

function setTab(id: SectionId) {
  activeTab.value = id
  bodyRef.value?.scrollTo({ top: 0 })
}

// ---- Style helpers ----------------------------------------------

const panelStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  color: brand.colors.text,
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  borderLeft: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
  boxShadow: '-16px 0 40px -16px rgba(0, 0, 0, 0.45)',
}))

function sideNavStyle(id: SectionId): Record<string, string> {
  const isActive = activeTab.value === id
  return {
    color: isActive ? brand.colors.text : brand.colors.textMuted,
    backgroundColor: isActive
      ? `color-mix(in srgb, ${brand.colors.primary} 8%, transparent)`
      : 'transparent',
    borderLeft: isActive ? `2px solid ${brand.colors.primary}` : '2px solid transparent',
    fontWeight: isActive ? '500' : '400',
  }
}

function mobileNavStyle(id: SectionId): Record<string, string> {
  const isActive = activeTab.value === id
  return {
    color: isActive ? brand.colors.text : brand.colors.textMuted,
    backgroundColor: isActive
      ? `color-mix(in srgb, ${brand.colors.primary} 12%, transparent)`
      : 'transparent',
    border: `1px solid color-mix(in srgb, ${brand.colors.border} ${isActive ? 50 : 30}%, transparent)`,
    fontWeight: isActive ? '500' : '400',
  }
}

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.text} 3%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
  color: brand.colors.text,
}))

const emptyStyle = computed(() => ({
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  textAlign: 'center' as const,
  gap: '10px',
  padding: '40px 24px 36px',
  borderRadius: '16px',
  backgroundColor: `color-mix(in srgb, ${brand.colors.text} 2%, transparent)`,
  border: `1px dashed color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

const ctaStyle = computed(() => ({
  marginTop: '4px',
  padding: '8px 18px',
  borderRadius: '999px',
  backgroundColor: brand.colors.primary,
  color: brand.colors.background,
  fontSize: '12.5px',
  fontWeight: '500',
  border: 'none',
  cursor: 'pointer',
}))

const memoryGroupStyle = computed(() => ({
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 30%, transparent)`,
  backgroundColor: `color-mix(in srgb, ${brand.colors.text} 2%, transparent)`,
}))

const hitRatePillStyle = computed(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '11px',
  fontFamily: 'var(--font-mono-tab, monospace)',
  fontVariantNumeric: 'tabular-nums',
  color: brand.colors.text,
  padding: '4px 10px',
  borderRadius: '999px',
  backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 10%, transparent)`,
}))

const primaryActionStyle = computed(() => ({
  color: brand.colors.primary,
  border: `1px solid color-mix(in srgb, ${brand.colors.primary} 35%, transparent)`,
  borderRadius: '999px',
  padding: '4px 10px',
  backgroundColor: 'transparent',
  cursor: 'pointer',
}))

function actionPillStyle(primary: boolean): Record<string, string> {
  // Pill button used in the smart-action footers. Primary = brand-
  // tinted background + brand text; default = neutral border-only.
  if (primary) {
    return {
      backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
      border: `1px solid color-mix(in srgb, ${brand.colors.primary} 30%, transparent)`,
      color: brand.colors.primary,
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: '500',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      cursor: 'pointer',
    }
  }
  return {
    backgroundColor: 'transparent',
    border: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
    color: brand.colors.textMuted,
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
  }
}

function filterPillStyle(active: boolean): Record<string, string> {
  return {
    backgroundColor: active
      ? `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`
      : 'transparent',
    border: `1px solid color-mix(in srgb, ${brand.colors.border} ${active ? 55 : 35}%, transparent)`,
    color: active ? brand.colors.text : brand.colors.textMuted,
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11.5px',
    transition: 'background-color 160ms ease, border-color 160ms ease',
    cursor: 'pointer',
  }
}

// ---- Goals helpers ----------------------------------------------

function goalStatusColor(status: GoalStatus | null | string): string {
  if (status === 'hit') return brand.colors.positive ?? brand.colors.primary
  if (status === 'on_track') return brand.colors.primary
  if (status === 'at_risk') return brand.colors.warning ?? brand.colors.primary
  if (status === 'unfeasible') return brand.colors.negative
  return brand.colors.textMuted
}
function goalStatusLabel(status: GoalStatus | null | string): string {
  if (status === 'hit') return 'Atingida'
  if (status === 'on_track') return 'No caminho'
  if (status === 'at_risk') return 'Em risco'
  if (status === 'unfeasible') return 'Inviável'
  return '—'
}
function goalProgress(g: ChatGoal): number {
  const target = parseFloat(g.targetAmount)
  const current = parseFloat(g.currentAmount)
  return Math.round(Math.min(1, Math.max(0, current / Math.max(1, target))) * 100)
}

// ---- Decisions helpers ------------------------------------------

const decisionFilters = computed(() => {
  const all = decisionsState.decisions.value
  return [
    { id: 'all' as const, label: 'Todas', count: all.length },
    {
      id: 'pending' as const,
      label: 'Pendentes',
      count: all.filter((d) => d.status === 'pending').length,
    },
    {
      id: 'accepted' as const,
      label: 'Aceitas',
      count: all.filter((d) => d.status === 'accepted').length,
    },
    {
      id: 'executed' as const,
      label: 'Executadas',
      count: all.filter((d) => d.status === 'executed').length,
    },
    {
      id: 'reviewed' as const,
      label: 'Revisadas',
      count: all.filter((d) => d.status === 'reviewed').length,
    },
  ]
})

const filteredDecisions = computed(() => {
  const f = decisionFilter.value
  if (f === 'all') return decisionsState.decisions.value
  return decisionsState.decisions.value.filter((d) => d.status === f)
})

function decisionTypeLabel(t: DecisionType): string {
  return (
    {
      buy: 'Comprar',
      sell: 'Vender',
      rebalance: 'Rebalance',
      hold: 'Manter',
      allocate: 'Alocar',
    } as Record<string, string>
  )[t] ?? t
}

function decisionStatusColor(status: string): string {
  if (status === 'pending') return brand.colors.primary
  if (status === 'executed') return brand.colors.positive ?? brand.colors.primary
  if (status === 'cancelled' || status === 'expired') return brand.colors.negative
  return brand.colors.textMuted
}

function parseDecisionPrice(raw: string | null | undefined): number | null {
  if (raw == null) return null
  const n = typeof raw === 'string' ? parseFloat(raw) : (raw as number)
  return Number.isFinite(n) && n > 0 ? n : null
}

// ---- Watchlist helpers ------------------------------------------

function describeWatchCondition(c: WatchCondition): string {
  switch (c.kind) {
    case 'price_drop_pct':
      return `Cai ${c.pct}% em ${c.window ?? '7d'}`
    case 'price_rise_pct':
      return `Sobe ${c.pct}% em ${c.window ?? '7d'}`
    case 'price_below':
      return `Preço abaixo de R$ ${c.value?.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`
    case 'price_above':
      return `Preço acima de R$ ${c.value?.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`
    case 'dy_above':
      return `DY acima de ${(c.value ?? 0) * 100}%`
    case 'pe_below':
      return `P/L abaixo de ${c.value}`
    case 'news_material':
      return 'Notícia material'
    default:
      return c.kind
  }
}

// ---- Memory helpers ---------------------------------------------

const memoryKindFilters = computed(() => {
  const counts = new Map<string, number>()
  for (const m of memoriesState.memories.value) {
    counts.set(m.kind, (counts.get(m.kind) ?? 0) + 1)
  }
  const all = memoriesState.memories.value.length
  const out: Array<{ id: string; label: string; count: number }> = [
    { id: 'all', label: 'Todas', count: all },
  ]
  for (const kind of MEMORY_KIND_ORDER) {
    const count = counts.get(kind) ?? 0
    if (count > 0) out.push({ id: kind, label: memoryKindLabel(kind), count })
  }
  return out
})

const filteredMemories = computed(() => {
  const q = memorySearch.value.trim().toLowerCase()
  return memoriesState.memories.value.filter((m) => {
    if (memoryKindFilter.value !== 'all' && m.kind !== memoryKindFilter.value) return false
    if (!q) return true
    if (m.key.toLowerCase().includes(q)) return true
    return formatMemoryValue(m.value).toLowerCase().includes(q)
  })
})

const filteredMemoryGroups = computed(() => {
  const groups = new Map<string, typeof filteredMemories.value>()
  for (const m of filteredMemories.value) {
    const list = groups.get(m.kind) ?? []
    list.push(m)
    groups.set(m.kind, list)
  }
  return Array.from(groups.entries()).sort(
    ([a], [b]) => MEMORY_KIND_ORDER.indexOf(a) - MEMORY_KIND_ORDER.indexOf(b),
  )
})

const MEMORY_KIND_ORDER = ['profile', 'preference', 'goal', 'decision', 'open_thread', 'fact']

function memoryKindLabel(kind: string): string {
  return (
    {
      profile: 'Perfil',
      preference: 'Preferências',
      goal: 'Metas',
      decision: 'Decisões',
      open_thread: 'Conversas em aberto',
      fact: 'Fatos',
    } as Record<string, string>
  )[kind] ?? kind
}

function formatMemoryValue(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'string') return v.length > 240 ? v.slice(0, 240) + '…' : v
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toLocaleString('pt-BR')
  if (typeof v === 'boolean') return v ? 'sim' : 'não'
  if (Array.isArray(v)) {
    return v.length === 0 ? '[ vazio ]' : `[ ${v.length} ${v.length === 1 ? 'item' : 'itens'} ]`
  }
  if (typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>)
    if (entries.length === 0) return '{ vazio }'
    return entries
      .slice(0, 3)
      .map(([k, val]) => `${humanizeKey(k)}: ${formatScalar(val)}`)
      .join(' · ')
  }
  return '—'
}

function formatScalar(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'string') return v.length > 60 ? v.slice(0, 60) + '…' : v
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toLocaleString('pt-BR')
  if (typeof v === 'boolean') return v ? 'sim' : 'não'
  if (Array.isArray(v)) return `[${v.length}]`
  if (typeof v === 'object') return '{…}'
  return String(v)
}

function humanizeKey(key: string): string {
  return key.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function confirmClearMemories() {
  if (memoryClearStage.value === 'idle') {
    memoryClearStage.value = 'arm'
    setTimeout(() => {
      if (memoryClearStage.value === 'arm') memoryClearStage.value = 'idle'
    }, 4000)
    return
  }
  void memoriesState.clearAll()
  memoryClearStage.value = 'idle'
}

// ---- Activity helpers -------------------------------------------

interface ActivityGroup {
  label: string
  events: ActivityEvent[]
}

const activityGroups = computed<ActivityGroup[]>(() => {
  const buckets: Record<string, ActivityEvent[]> = {
    Hoje: [],
    Ontem: [],
    'Esta semana': [],
    'Mais antigos': [],
  }
  const now = new Date()
  const todayKey = now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = yesterday.toDateString()
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000

  for (const e of activityState.events.value) {
    const at = new Date(e.at)
    const key = at.toDateString()
    if (key === todayKey) buckets.Hoje!.push(e)
    else if (key === yesterdayKey) buckets.Ontem!.push(e)
    else if (at.getTime() >= weekAgo) buckets['Esta semana']!.push(e)
    else buckets['Mais antigos']!.push(e)
  }
  return (['Hoje', 'Ontem', 'Esta semana', 'Mais antigos'] as const)
    .filter((label) => buckets[label]!.length > 0)
    .map((label) => ({ label, events: buckets[label]! }))
})

function activityKindColor(k: ActivityKind): string {
  if (k === 'alert_fired') return brand.colors.primary
  if (k === 'decision_created' || k === 'decision_updated') return brand.colors.primary
  return brand.colors.textMuted
}

// ---- Smart-action prompts ---------------------------------------
//
// Each card surfaces 1-2 opinionated CTAs that send a structured
// message to the chat. The agent picks them up as a regular user
// turn and runs the appropriate tools (simulate_scenario,
// validate_goal, recalculate_goal, etc.). The drawer closes so
// the user lands on the conversation watching the answer stream.

function dispatchPrompt(text: string): void {
  emit('chat-prompt', text)
}

function rethinkDecisionPrompt(d: ChatDecision): void {
  const tickerStr = d.ticker ? ` ${d.ticker}` : ''
  const text =
    `Repensa essa decisão: ${decisionTypeLabel(d.type)}${tickerStr}. ` +
    `A tese registrada foi "${d.thesis}"` +
    (d.invalidator ? ` e o invalidador "${d.invalidator}". ` : '. ') +
    `O cenário mudou desde então? Cheque preço atual, fundamentos, macro e me diga se mantenho, ajusto o gatilho ou cancelo. Roda simulate_scenario se a meta tiver sido afetada.`
  dispatchPrompt(text)
}

function submitCounterProposal(d: ChatDecision): void {
  const draft = counterProposalDraft[d.id]?.trim()
  if (!draft) return
  const tickerStr = d.ticker ? ` (${d.ticker})` : ''
  const text =
    `Tenho uma contraproposta para a decisão de ${decisionTypeLabel(d.type)}${tickerStr}. ` +
    `Tese original: "${d.thesis}". ` +
    `Minha contraproposta: ${draft}. ` +
    `Avalie: o que é mais robusto, qual o trade-off em risco/retorno, e me dê uma recomendação clara.`
  dispatchPrompt(text)
  delete counterProposalDraft[d.id]
  counterProposalOpen.value = null
}

function findGoalSolutionsPrompt(g: ChatGoal): void {
  const text =
    `A meta "${g.name}" está classificada como ${goalStatusLabel(g.status)}. ` +
    `Liste os 3-4 caminhos viáveis pra fechar (aumentar aporte mensal, estender prazo, reduzir alvo, aceitar mais risco/equity, perfil empreendedor, etc.) ` +
    `e simule simulate_scenario para CADA um pra mostrar o impacto. Recomenda o mais realista pro meu perfil.`
  dispatchPrompt(text)
}

function discussGoalPrompt(g: ChatGoal): void {
  const text =
    `Conversemos sobre a meta "${g.name}". Status atual: ${goalStatusLabel(g.status)}, progresso ${goalProgress(g)}%. ` +
    `Faz uma análise do plano: o aporte está correto, o CAGR realista bate com a alocação, há ajustes de curto prazo necessários?`
  dispatchPrompt(text)
}

function reviewWatchPrompt(ticker: string): void {
  const text =
    `Revise minha watchlist em ${ticker}. Preço atual, mudanças desde que adicionei, eventos materiais recentes. ` +
    `As condições que defini ainda fazem sentido ou devo ajustar?`
  dispatchPrompt(text)
}

// ---- Date helpers -----------------------------------------------

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    }).format(new Date(iso))
  } catch {
    return typeof iso === 'string' ? iso.slice(0, 10) : '—'
  }
}

const RELATIVE_DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]
const RTF = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto', style: 'short' })

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—'
  const time = new Date(iso).getTime()
  if (!Number.isFinite(time)) return '—'
  const seconds = (Date.now() - time) / 1000
  if (seconds < 5) return 'agora'
  let duration = seconds
  for (const d of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < d.amount) return RTF.format(-Math.round(duration), d.unit)
    duration /= d.amount
  }
  return RTF.format(-Math.round(duration), 'year')
}
</script>

<style scoped>
.audit-backdrop {
  backdrop-filter: blur(2px);
}
.audit-panel {
  isolation: isolate;
}
.audit-close,
.audit-sidenav-btn,
.audit-mobilenav-btn,
.goal-card,
.goal-card-body,
.decision-card,
.decision-card-body,
.watch-remove,
.memory-delete,
.activity-row,
.empty-cta,
.filter-pill,
.action-pill {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.action-pill:hover:not(:disabled) {
  filter: brightness(1.06);
  background-color: color-mix(in srgb, currentColor 6%, transparent);
}
.action-pill-primary:hover:not(:disabled) {
  filter: brightness(1.04);
}
.action-pill:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.counter-proposal-input::placeholder {
  color: color-mix(in srgb, currentColor 50%, transparent);
}
.audit-close:hover,
.watch-remove:hover,
.memory-delete:hover {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}
.goal-card:hover,
.decision-card:hover,
.activity-row:hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent) !important;
}
.audit-sidenav-btn:hover {
  background-color: color-mix(in srgb, currentColor 5%, transparent);
}
.empty-cta:hover {
  filter: brightness(1.06);
}
.audit-close:focus-visible,
.audit-sidenav-btn:focus-visible,
.audit-mobilenav-btn:focus-visible,
.goal-card:focus-visible,
.decision-card:focus-visible,
.watch-remove:focus-visible,
.memory-delete:focus-visible,
.empty-cta:focus-visible,
.filter-pill:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
  border-radius: 8px;
}

.empty .empty-title {
  font-size: 13.5px;
  font-weight: 500;
}
.empty .empty-body {
  font-size: 12px;
  line-height: 1.5;
  max-width: 320px;
}

.audit-content {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, currentColor 14%, transparent) transparent;
  overscroll-behavior: contain;
}
.audit-content::-webkit-scrollbar {
  width: 6px;
}
.audit-content::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .audit-backdrop,
  .audit-panel {
    transition: none !important;
  }
}
</style>
