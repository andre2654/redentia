<!--
  EditorBanner — editor dedicado pra comunicações do tipo `banner`.

  Por que separado: banner tem semântica especifica (placement top
  vs sidebar, faixa contínua que fica ativa por dias/semanas, copy
  curta + CTA inline). O editor genérico antigo renderizava tudo em
  branches v-if e a UX ficava genérica demais. Aqui cada section é
  pensada pra esse tipo específico.

  Workflow: ongoing campaign — KEEPS active/paused (banner roda por
  dias/semanas, admin liga/desliga conforme estratégia). Em
  contraste, notificação e email são one-shot e não tem esse estado.

  Sections:
    1. Mensagem      — title + body curto + ícone
    2. Posicionamento — top (sticky) vs sidebar (lateral) com mockup
    3. Call-to-action — link_url + link_label + dismissible
    4. Audiência      — picker de tipo + tenant + AdminUserPicker (specific)
    5. Vigência       — starts_at, ends_at, prioridade
    6. Status         — draft/active/paused com state machine clara

  Aside (RIGHT): preview ao vivo da barra do banner em contexto, +
  analytics (impressions, clicks, CTR, dismissals).

  Parent owns: form (reactive), saving, analytics, tenantOptions,
  selectedUserIds (v-model). This component only renders + emits save.
-->
<template>
  <div class="banner-editor">
    <!-- LEFT: form -->
    <form class="banner-editor__form" @submit.prevent="$emit('save')">
      <!-- =================== STATUS ROW =================== -->
      <div class="status-row">
        <div class="status-row__intro">
          <span class="status-row__eyebrow">Status atual</span>
          <span class="status-row__hint">Banner é uma campanha contínua. Liga e desliga conforme estratégia.</span>
        </div>
        <div class="status-row__chips">
          <button
            v-for="s in statusChoices"
            :key="s.value"
            type="button"
            class="status-chip"
            :class="{ 'status-chip--active': form.status === s.value }"
            :title="s.help"
            @click="form.status = s.value"
          >
            <span class="status-chip__dot" :class="`status-chip__dot--${s.value}`" />
            <span class="status-chip__label">{{ s.label }}</span>
          </button>
        </div>
      </div>

      <!-- =================== SECTION 1: MENSAGEM =================== -->
      <Section
        title="Mensagem"
        eyebrow="Conteúdo"
        icon="i-lucide-pen-line"
        :open="open.message"
        @toggle="open.message = !open.message"
      >
        <Field label="Título *" hint="Aparece em destaque. Mantenha curto, ideal até 60 caracteres.">
          <UInput
            v-model="form.title"
            placeholder="Ex.: Manutenção programada das 02:00 às 04:00"
            size="md"
            required
          />
          <span class="field-counter" :class="{ 'field-counter--warn': (form.title || '').length > 60 }">
            {{ (form.title || '').length }}/60
          </span>
        </Field>

        <Field
          label="Texto secundário"
          hint="Opcional. Aparece ao lado do título. Use a toolbar (ou Ctrl+B / Ctrl+I / Ctrl+K) pra destacar pontos chave."
        >
          <AdminFormsRichTextField
            v-model="form.body"
            level="inline"
            :max-length="140"
            placeholder='Ex.: "Reabriremos automaticamente quando o sistema voltar."'
          />
        </Field>

        <Field label="Ícone" hint="Pictograma Lucide ao lado do título. Pode buscar por palavra-chave em pt-br (ex: 'alerta', 'dinheiro', 'novidade').">
          <AdminFormsIconPicker v-model="form.icon" />
        </Field>
      </Section>

      <!-- =================== SECTION 2: POSICIONAMENTO =================== -->
      <Section
        title="Onde aparece"
        eyebrow="Posicionamento"
        icon="i-lucide-map-pin"
        :open="open.placement"
        @toggle="open.placement = !open.placement"
      >
        <span class="section-lead">
          Escolha onde a barra do banner vai aparecer pro usuário. O preview ao lado mostra o efeito.
        </span>

        <div class="placement-grid">
          <button
            v-for="p in placementChoices"
            :key="p.value"
            type="button"
            class="placement-card"
            :class="{ 'placement-card--active': form.placement === p.value }"
            @click="form.placement = p.value"
          >
            <div class="placement-mockup" :class="`placement-mockup--${p.value}`">
              <div class="placement-mockup__sidebar" />
              <div class="placement-mockup__main">
                <span class="placement-mockup__line" />
                <span class="placement-mockup__line placement-mockup__line--short" />
              </div>
              <div class="placement-mockup__highlight" />
            </div>
            <div class="placement-card__meta">
              <span class="placement-card__label">{{ p.label }}</span>
              <span class="placement-card__desc">{{ p.desc }}</span>
            </div>
            <span v-if="form.placement === p.value" class="placement-card__check">
              <UIcon name="i-lucide-check" class="size-3" />
            </span>
          </button>
        </div>
      </Section>

      <!-- =================== SECTION 3: CALL-TO-ACTION =================== -->
      <Section
        title="Call-to-action"
        eyebrow="Ação"
        icon="i-lucide-mouse-pointer-click"
        :open="open.cta"
        @toggle="open.cta = !open.cta"
      >
        <span class="section-lead">
          Adicione um botão clicável pro banner. Sem isso, o banner é apenas informativo.
        </span>

        <!-- LIVE BUTTON PREVIEW — mostra como o CTA vai parecer no banner real -->
        <div class="cta-preview" :class="{ 'cta-preview--empty': !hasCta }">
          <div class="cta-preview__shell">
            <span class="cta-preview__eyebrow">Preview do botão</span>
            <div class="cta-preview__stage">
              <span v-if="!hasCta" class="cta-preview__placeholder">
                <UIcon name="i-lucide-link-2-off" class="size-4" />
                Sem botão configurado
              </span>
              <span v-else class="cta-preview__btn">
                <UIcon name="i-lucide-sparkles" class="size-3.5" />
                {{ form.link_label || defaultCtaLabel }}
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </span>
            </div>
            <div v-if="hasCta && form.link_url" class="cta-preview__destination">
              <UIcon :name="linkType.icon" class="size-3" />
              <span class="cta-preview__destination-label">leva pra</span>
              <code class="cta-preview__destination-url">{{ form.link_url }}</code>
              <span class="cta-preview__destination-badge" :data-type="linkType.kind">
                {{ linkType.label }}
              </span>
            </div>
          </div>
        </div>

        <!-- LABEL: texto do botão com indicador visual de tamanho ideal -->
        <Field
          label="Texto do botão"
          hint="Curto e direto. 16 caracteres ou menos converte melhor."
        >
          <div class="cta-label-input">
            <UIcon name="i-lucide-type" class="size-4 cta-label-input__icon" />
            <UInput
              v-model="form.link_label"
              :placeholder="`Ex.: ${defaultCtaLabel}`"
              size="md"
              class="cta-label-input__field"
            />
            <div class="cta-label-input__meter" :data-state="labelState">
              <span class="cta-label-input__count">{{ (form.link_label || '').length }}</span>
              <span class="cta-label-input__sep">/</span>
              <span class="cta-label-input__limit">16</span>
            </div>
          </div>
          <span v-if="labelState !== 'idle'" class="cta-label-input__hint" :data-state="labelState">
            <UIcon :name="labelStateMeta.icon" class="size-3" />
            {{ labelStateMeta.text }}
          </span>
        </Field>

        <!-- URL: input + sugestões clicáveis pra acelerar -->
        <Field
          label="Link de destino"
          hint="URL absoluta ou path interno. Detectamos automaticamente o tipo."
        >
          <div class="cta-url-input">
            <UIcon :name="linkType.icon" class="size-4 cta-url-input__icon" :data-type="linkType.kind" />
            <UInput
              v-model="form.link_url"
              placeholder="/pricing, https://..., mailto:..., tel:..."
              size="md"
              class="cta-url-input__field"
            />
            <span v-if="form.link_url" class="cta-url-input__badge" :data-type="linkType.kind">
              {{ linkType.label }}
            </span>
          </div>

          <div class="cta-url-suggestions">
            <span class="cta-url-suggestions__label">Sugestões:</span>
            <button
              v-for="s in urlSuggestions"
              :key="s.value"
              type="button"
              class="cta-url-suggestion"
              :class="{ 'cta-url-suggestion--active': form.link_url === s.value }"
              :title="s.desc"
              @click="form.link_url = s.value"
            >
              <UIcon :name="s.icon" class="size-3" />
              <code>{{ s.label }}</code>
            </button>
          </div>
        </Field>

        <!-- COMPORTAMENTO: 2 cards (persistente vs dispensável) — padrão visual igual ao placement -->
        <Field label="Comportamento" hint="Define se o usuário pode fechar o banner.">
          <div class="cta-behavior-grid">
            <button
              type="button"
              class="cta-behavior-card"
              :class="{ 'cta-behavior-card--active': !form.dismissible }"
              @click="form.dismissible = false"
            >
              <span class="cta-behavior-card__icon">
                <UIcon name="i-lucide-anchor" class="size-4" />
              </span>
              <div class="cta-behavior-card__meta">
                <span class="cta-behavior-card__title">Persistente</span>
                <span class="cta-behavior-card__desc">Banner fixo, sem botão de fechar.</span>
              </div>
              <span v-if="!form.dismissible" class="cta-behavior-card__check">
                <UIcon name="i-lucide-check" class="size-3" />
              </span>
            </button>
            <button
              type="button"
              class="cta-behavior-card"
              :class="{ 'cta-behavior-card--active': form.dismissible }"
              @click="form.dismissible = true"
            >
              <span class="cta-behavior-card__icon">
                <UIcon name="i-lucide-x-circle" class="size-4" />
              </span>
              <div class="cta-behavior-card__meta">
                <span class="cta-behavior-card__title">Dispensável</span>
                <span class="cta-behavior-card__desc">Usuário pode fechar com X. Não volta pra ele.</span>
              </div>
              <span v-if="form.dismissible" class="cta-behavior-card__check">
                <UIcon name="i-lucide-check" class="size-3" />
              </span>
            </button>
          </div>
        </Field>
      </Section>

      <!-- =================== SECTION 4: AUDIÊNCIA =================== -->
      <Section
        title="Quem vê"
        eyebrow="Audiência"
        icon="i-lucide-users"
        :open="open.audience"
        @toggle="open.audience = !open.audience"
      >
        <span class="section-lead">
          Defina quem recebe a campanha. Cada camada refina o conjunto: <strong>base</strong> →
          <strong>escopo</strong> → <strong>refinamentos</strong>.
        </span>

        <!-- ============ LAYER 1: BASE AUDIENCE ============ -->
        <div class="aud-layer">
          <div class="aud-layer__head">
            <span class="aud-layer__step">01</span>
            <div>
              <span class="aud-layer__title">Base</span>
              <span class="aud-layer__sub">Quem é o público inicial?</span>
            </div>
          </div>
          <div class="aud-base-grid">
            <button
              v-for="a in audienceChoices"
              :key="a.value"
              type="button"
              class="aud-base-card"
              :class="{ 'aud-base-card--active': form.target_audience === a.value }"
              @click="form.target_audience = a.value"
            >
              <span class="aud-base-card__icon">
                <UIcon :name="a.icon" class="size-5" />
              </span>
              <div class="aud-base-card__meta">
                <span class="aud-base-card__label">{{ a.label }}</span>
                <span class="aud-base-card__desc">{{ a.desc }}</span>
              </div>
              <span v-if="form.target_audience === a.value" class="aud-base-card__check">
                <UIcon name="i-lucide-check" class="size-3" />
              </span>
            </button>
          </div>
        </div>

        <!-- ============ LAYER 2: TENANT SCOPE ============ -->
        <div class="aud-layer">
          <div class="aud-layer__head">
            <span class="aud-layer__step">02</span>
            <div>
              <span class="aud-layer__title">Escopo</span>
              <span class="aud-layer__sub">Vale pra todas marcas ou só uma?</span>
            </div>
          </div>
          <div class="aud-scope-grid">
            <button
              type="button"
              class="aud-scope-card"
              :class="{ 'aud-scope-card--active': tenantMode === 'global' }"
              @click="setTenantMode('global')"
            >
              <span class="aud-scope-card__icon">
                <UIcon name="i-lucide-globe" class="size-4" />
              </span>
              <div class="aud-scope-card__meta">
                <span class="aud-scope-card__label">Global</span>
                <span class="aud-scope-card__desc">Todas as white-labels da plataforma.</span>
              </div>
              <span v-if="tenantMode === 'global'" class="aud-scope-card__check">
                <UIcon name="i-lucide-check" class="size-3" />
              </span>
            </button>
            <button
              type="button"
              class="aud-scope-card"
              :class="{ 'aud-scope-card--active': tenantMode === 'specific' }"
              @click="setTenantMode('specific')"
            >
              <span class="aud-scope-card__icon">
                <UIcon name="i-lucide-building-2" class="size-4" />
              </span>
              <div class="aud-scope-card__meta">
                <span class="aud-scope-card__label">Tenant específico</span>
                <span class="aud-scope-card__desc">Restringe a uma marca white-label.</span>
              </div>
              <span v-if="tenantMode === 'specific'" class="aud-scope-card__check">
                <UIcon name="i-lucide-check" class="size-3" />
              </span>
            </button>
          </div>
          <Transition name="aud-expand">
            <div v-if="tenantMode === 'specific'" class="aud-tenant-select">
              <USelect
                v-model="form.tenant_id"
                :items="tenantOptions.filter(t => t.value !== null)"
                placeholder="Selecione uma marca"
                size="md"
              />
            </div>
          </Transition>
        </div>

        <!-- ============ LAYER 3: SPECIFIC USER PICKER (audience=specific) ============ -->
        <Transition name="aud-expand">
          <div v-if="form.target_audience === 'specific'" class="aud-layer aud-layer--accent">
            <div class="aud-layer__head">
              <span class="aud-layer__step">03</span>
              <div>
                <span class="aud-layer__title">Alvo preciso</span>
                <span class="aud-layer__sub">Lista manual de usuários que recebem o banner.</span>
              </div>
              <span class="aud-layer__count" :data-state="selectedUserIds.length ? 'filled' : 'empty'">
                {{ selectedUserIds.length }}
                <span class="aud-layer__count-label">{{ selectedUserIds.length === 1 ? 'usuário' : 'usuários' }}</span>
              </span>
              <button
                v-if="selectedUserIds.length"
                type="button"
                class="aud-layer__action"
                @click="$emit('update:selectedUserIds', [])"
              >
                <UIcon name="i-lucide-x" class="size-3" />
                Limpar
              </button>
            </div>
            <AdminUserPicker
              :model-value="selectedUserIds"
              :tenant-id="form.tenant_id ?? null"
              @update:model-value="$emit('update:selectedUserIds', $event)"
            />
            <div v-if="!selectedUserIds.length" class="aud-warn">
              <UIcon name="i-lucide-alert-triangle" class="size-3.5" />
              Sem usuários selecionados, ninguém vai ver esse banner.
            </div>
          </div>
        </Transition>

        <!-- ============ LAYER 3 (alt): REFINEMENT FILTERS ============ -->
        <Transition name="aud-expand">
          <div
            v-if="showRefinementFilters"
            class="aud-layer"
          >
            <div class="aud-layer__head">
              <span class="aud-layer__step">03</span>
              <div>
                <span class="aud-layer__title">Refinamentos</span>
                <span class="aud-layer__sub">Filtros opcionais sobre a base. Deixe sem alterar pra incluir todos.</span>
              </div>
              <button
                v-if="hasActiveRefinements"
                type="button"
                class="aud-layer__action"
                @click="clearRefinements"
              >
                <UIcon name="i-lucide-x" class="size-3" />
                Limpar
              </button>
            </div>

            <!-- Open Finance: segmented control 3-way -->
            <div class="aud-filter">
              <div class="aud-filter__head">
                <UIcon name="i-lucide-link" class="aud-filter__icon size-4" />
                <div class="aud-filter__meta">
                  <span class="aud-filter__title">Open Finance</span>
                  <span class="aud-filter__desc">Filtra por usuários com corretora conectada via Belvo.</span>
                </div>
              </div>
              <div class="aud-segmented">
                <button
                  v-for="opt in connectionsOptions"
                  :key="String(opt.value)"
                  type="button"
                  class="aud-segmented__btn"
                  :class="{ 'aud-segmented__btn--active': form.target_has_connections === opt.value }"
                  @click="form.target_has_connections = opt.value"
                >
                  <UIcon v-if="opt.icon" :name="opt.icon" class="size-3" />
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <!-- AUM mínimo (só pra audiences que têm AUM) -->
            <div
              v-if="['authenticated', 'investors'].includes(form.target_audience)"
              class="aud-filter"
            >
              <div class="aud-filter__head">
                <UIcon name="i-lucide-coins" class="aud-filter__icon size-4" />
                <div class="aud-filter__meta">
                  <span class="aud-filter__title">AUM mínimo</span>
                  <span class="aud-filter__desc">Patrimônio total da carteira maior ou igual ao valor.</span>
                </div>
              </div>
              <div class="aud-currency-input">
                <span class="aud-currency-input__prefix">R$</span>
                <input
                  ref="aumInputEl"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  :value="aumDisplay"
                  placeholder="0"
                  class="aud-currency-input__field"
                  @input="onAumInput"
                  @paste.prevent="onAumPaste"
                />
                <span class="aud-currency-input__suffix">,00</span>
                <button
                  v-if="form.target_min_aum"
                  type="button"
                  class="aud-currency-input__clear"
                  aria-label="Limpar valor"
                  @click="form.target_min_aum = null"
                >
                  <UIcon name="i-lucide-x" class="size-3" />
                </button>
              </div>
              <div v-if="form.target_min_aum" class="aud-currency-input__chips">
                <span class="aud-currency-input__chips-label">Atalhos:</span>
                <button
                  v-for="v in [10000, 50000, 100000, 500000, 1000000]"
                  :key="v"
                  type="button"
                  class="aud-currency-input__chip"
                  :class="{ 'aud-currency-input__chip--active': form.target_min_aum === v }"
                  @click="form.target_min_aum = v"
                >
                  R$ {{ formatBRL(v) }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Section>

      <!-- =================== SECTION 5: VIGÊNCIA =================== -->
      <Section
        title="Vigência"
        eyebrow="Programação"
        icon="i-lucide-calendar"
        :open="open.schedule"
        @toggle="open.schedule = !open.schedule"
      >
        <span class="section-lead">
          Quando a campanha deve <strong>começar</strong> e <strong>terminar</strong>. Vazio significa sem limite.
        </span>

        <!-- ============ STATUS + TIMELINE VISUAL ============ -->
        <div class="vig-status-card" :data-state="schedStatus.kind">
          <div class="vig-status-card__head">
            <span class="vig-status-card__badge">
              <UIcon :name="schedStatus.icon" class="size-3" />
              {{ schedStatus.label }}
            </span>
            <span class="vig-status-card__duration">
              <UIcon name="i-lucide-timer" class="size-3" />
              {{ durationLabel }}
            </span>
          </div>

          <div class="vig-timeline">
            <div class="vig-timeline__node vig-timeline__node--start" :class="{ 'vig-timeline__node--unset': !form.starts_at }">
              <span class="vig-timeline__dot" />
              <span class="vig-timeline__label">Início</span>
              <span class="vig-timeline__when">{{ formatDateTime(form.starts_at) || 'imediato' }}</span>
            </div>
            <div class="vig-timeline__bar" :class="`vig-timeline__bar--${schedStatus.kind}`" />
            <div class="vig-timeline__node vig-timeline__node--end" :class="{ 'vig-timeline__node--unset': !form.ends_at }">
              <span class="vig-timeline__dot" />
              <span class="vig-timeline__label">Fim</span>
              <span class="vig-timeline__when">{{ formatDateTime(form.ends_at) || 'sem limite' }}</span>
            </div>
          </div>
        </div>

        <!-- ============ ATALHOS ============ -->
        <div class="vig-presets">
          <span class="vig-presets__label">Atalhos:</span>
          <button
            v-for="p in schedulePresets"
            :key="p.id"
            type="button"
            class="vig-preset"
            :class="{ 'vig-preset--active': activePreset === p.id }"
            :title="p.desc"
            @click="applySchedulePreset(p.id)"
          >
            <UIcon :name="p.icon" class="size-3" />
            {{ p.label }}
          </button>
        </div>

        <!-- ============ DATETIME INPUTS ============ -->
        <div class="grid-2">
          <Field label="Início" hint="Quando o banner começa a aparecer. Vazio = imediato (assim que ativar).">
            <div class="vig-input">
              <UIcon name="i-lucide-play" class="size-3.5 vig-input__icon" />
              <UInput v-model="form.starts_at" type="datetime-local" size="md" class="vig-input__field" />
              <button
                v-if="form.starts_at"
                type="button"
                class="vig-input__clear"
                aria-label="Limpar início"
                @click="form.starts_at = null"
              >
                <UIcon name="i-lucide-x" class="size-3" />
              </button>
            </div>
          </Field>
          <Field label="Fim" hint="Quando o banner para de aparecer. Vazio = roda indefinidamente.">
            <div class="vig-input">
              <UIcon name="i-lucide-square" class="size-3.5 vig-input__icon" />
              <UInput v-model="form.ends_at" type="datetime-local" size="md" class="vig-input__field" />
              <button
                v-if="form.ends_at"
                type="button"
                class="vig-input__clear"
                aria-label="Limpar fim"
                @click="form.ends_at = null"
              >
                <UIcon name="i-lucide-x" class="size-3" />
              </button>
            </div>
          </Field>
        </div>

        <!-- ============ PRIORIDADE ============ -->
        <Field
          label="Prioridade"
          hint="Quando há vários banners ativos pra mesma audiência+placement, o de maior prioridade aparece primeiro."
        >
          <div class="vig-priority">
            <div class="vig-priority__row">
              <input
                v-model.number="priorityValue"
                type="range"
                min="0"
                max="1000"
                step="10"
                class="vig-priority__slider"
                :style="{ '--pct': `${(priorityValue / 1000) * 100}%` }"
              />
              <span class="vig-priority__value" :data-tier="priorityTier.kind">
                {{ priorityValue }}
              </span>
            </div>
            <div class="vig-priority__presets">
              <button
                v-for="p in priorityPresets"
                :key="p.value"
                type="button"
                class="vig-priority__preset"
                :class="{ 'vig-priority__preset--active': priorityTier.kind === p.kind }"
                :data-tier="p.kind"
                :title="p.desc"
                @click="form.priority = p.value"
              >
                {{ p.label }}
              </button>
            </div>
          </div>
        </Field>
      </Section>
    </form>

    <!-- =================== RIGHT: PREVIEW + ANALYTICS =================== -->
    <aside class="banner-editor__aside">
      <!-- PREVIEW CARD -->
      <div class="preview-card">
        <header class="preview-card__head">
          <span class="preview-card__eyebrow">Preview ao vivo</span>
          <span class="preview-card__hint">{{ form.placement === 'top' ? 'Topo da app' : 'Dentro da sidebar' }}</span>
        </header>

        <div class="preview-stage" :class="`preview-stage--${form.placement || 'top'}`">
          <!-- TOP placement: barra full-width sticky -->
          <div v-if="form.placement === 'top'" class="prev-top">
            <div class="prev-top__bar">
              <UIcon
                v-if="form.icon"
                :name="form.icon"
                class="prev-top__icon size-4 shrink-0"
              />
              <div class="prev-top__content">
                <span class="prev-top__title">{{ form.title || '(Título do banner)' }}</span>
                <span v-if="form.body" class="prev-top__body" v-html="renderedBody" />
              </div>
              <span v-if="form.link_label || form.link_url" class="prev-top__cta">
                {{ form.link_label || 'Saiba mais' }}
                <UIcon name="i-lucide-arrow-right" class="size-3" />
              </span>
              <span v-if="form.dismissible" class="prev-top__close">
                <UIcon name="i-lucide-x" class="size-3.5" />
              </span>
            </div>
            <div class="prev-app">
              <span class="prev-line prev-line--w70" />
              <span class="prev-line prev-line--w50" />
              <span class="prev-line prev-line--w60" />
              <span class="prev-line prev-line--w40" />
            </div>
          </div>

          <!-- SIDEBAR placement: card vertical na barra lateral -->
          <div v-else-if="form.placement === 'sidebar'" class="prev-sidebar">
            <div class="prev-sidebar__shell">
              <div class="prev-sidebar__nav">
                <span class="prev-sidebar__nav-item" />
                <span class="prev-sidebar__nav-item" />
                <span class="prev-sidebar__nav-item prev-sidebar__nav-item--active" />
                <span class="prev-sidebar__nav-item" />
              </div>
              <div class="prev-sidebar__banner">
                <UIcon
                  v-if="form.icon"
                  :name="form.icon"
                  class="size-4 prev-sidebar__icon"
                />
                <span class="prev-sidebar__title">{{ form.title || '(Título)' }}</span>
                <span v-if="form.body" class="prev-sidebar__body" v-html="renderedBody" />
                <span v-if="form.link_label || form.link_url" class="prev-sidebar__cta">
                  {{ form.link_label || 'Saiba mais' }}
                  <UIcon name="i-lucide-arrow-right" class="size-3" />
                </span>
                <span v-if="form.dismissible" class="prev-sidebar__close">
                  <UIcon name="i-lucide-x" class="size-3" />
                </span>
              </div>
            </div>
            <div class="prev-sidebar__main">
              <span class="prev-line prev-line--w70" />
              <span class="prev-line prev-line--w50" />
              <span class="prev-line prev-line--w60" />
            </div>
          </div>
        </div>
      </div>

      <!-- AUDIENCE PREVIEW CARD (live, calls audience-preview endpoint) -->
      <AdminComunicacoesAudiencePreview
        :type="form.type"
        :tenant-id="form.tenant_id ?? null"
        :audience="form.target_audience as any"
        :user-ids="selectedUserIds"
        :min-aum="form.target_min_aum ?? null"
        :has-connections="form.target_has_connections ?? null"
      />

      <!-- ANALYTICS CARD -->
      <div v-if="analytics" class="analytics-card">
        <header class="analytics-card__head">
          <span class="analytics-card__eyebrow">Analytics</span>
          <span class="analytics-card__hint">Desde a criação</span>
        </header>
        <div class="analytics-grid">
          <div class="analytics-stat">
            <span class="analytics-stat__label">Impressões</span>
            <span class="analytics-stat__value">{{ analytics.impressions }}</span>
            <span class="analytics-stat__sub">{{ analytics.unique_seen }} únicos</span>
          </div>
          <div class="analytics-stat">
            <span class="analytics-stat__label">Cliques</span>
            <span class="analytics-stat__value">{{ analytics.clicks }}</span>
            <span class="analytics-stat__sub">{{ analytics.unique_clicked }} únicos</span>
          </div>
          <div class="analytics-stat">
            <span class="analytics-stat__label">CTR</span>
            <span class="analytics-stat__value">{{ analytics.click_through_rate }}<small>%</small></span>
            <span class="analytics-stat__sub">click-through rate</span>
          </div>
          <div class="analytics-stat">
            <span class="analytics-stat__label">Dispensas</span>
            <span class="analytics-stat__value">{{ analytics.dismissals }}</span>
            <span class="analytics-stat__sub">{{ analytics.unique_dismissed }} únicos</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, defineComponent, resolveComponent } from 'vue'
import type {
  CommunicationAdminPayload,
  CommunicationAnalytics,
  CommunicationStatus,
  CommunicationPlacement,
  CommunicationAudience,
} from '~/services/communications'
import { sanitizeHtml } from '~/utils/sanitizeHtml'

const props = defineProps<{
  form: CommunicationAdminPayload & { tenant_id: number | null; target_min_aum: number | null }
  saving: boolean
  analytics: CommunicationAnalytics | null
  tenantOptions: { label: string; value: number | null }[]
  selectedUserIds: number[]
}>()

defineEmits<{
  save: []
  'update:selectedUserIds': [number[]]
}>()

// Sections collapsible state
const open = reactive({
  message: true,
  placement: true,
  cta: true,
  audience: true,
  schedule: false,
})

// =================================================================
// Choices
// =================================================================
const statusChoices: { value: CommunicationStatus; label: string; help: string }[] = [
  { value: 'draft', label: 'Rascunho', help: 'Não aparece pra ninguém. Use enquanto edita.' },
  { value: 'active', label: 'Ativo', help: 'Liga o banner pra audiência configurada.' },
  { value: 'paused', label: 'Pausado', help: 'Temporariamente fora do ar (sem perder analytics).' },
]

const placementChoices: { value: CommunicationPlacement; label: string; desc: string }[] = [
  { value: 'top', label: 'Topo', desc: 'Sticky no topo de toda a app. Máxima visibilidade.' },
  { value: 'sidebar', label: 'Sidebar', desc: 'Card dentro da barra lateral. Menos invasivo.' },
]

const audienceChoices: { value: CommunicationAudience; label: string; icon: string; desc: string }[] = [
  { value: 'all', label: 'Todos', icon: 'i-lucide-users', desc: 'Logados + visitantes' },
  { value: 'authenticated', label: 'Logados', icon: 'i-lucide-user-check', desc: 'Só usuários cadastrados' },
  { value: 'guests', label: 'Visitantes', icon: 'i-lucide-user', desc: 'Não autenticados (anônimos)' },
  { value: 'investors', label: 'Investidores', icon: 'i-lucide-trending-up', desc: 'role = investor' },
  { value: 'advisors', label: 'Assessores', icon: 'i-lucide-briefcase', desc: 'role = advisor' },
  { value: 'admins', label: 'Admins', icon: 'i-lucide-shield', desc: 'Só staff' },
  { value: 'specific', label: 'Específicos', icon: 'i-lucide-target', desc: 'Lista manual de users' },
]

// =================================================================
// Computeds
// =================================================================

/**
 * Body sanitizado pra renderizar via v-html no preview ao vivo. O
 * RichTextField devolve HTML cru do TipTap; sanitizeHtml com level
 * 'inline' garante que so b/i/em/strong/a passam.
 */
const renderedBody = computed(() => sanitizeHtml(props.form.body || '', 'inline'))

// =================================================================
// CTA helpers
// =================================================================

/** Default label que mostramos no preview quando admin nao definiu. */
const defaultCtaLabel = 'Saiba mais'

/** True se o admin configurou ALGUMA coisa de CTA (label ou URL). */
const hasCta = computed(() => !!(props.form.link_url || props.form.link_label))

/**
 * Detecta automaticamente o tipo de link a partir da URL — informa
 * o user com badge + ícone apropriado.
 */
type LinkKind = 'internal' | 'external' | 'email' | 'tel' | 'anchor' | 'unknown'
interface LinkTypeMeta { kind: LinkKind; label: string; icon: string }

const linkType = computed<LinkTypeMeta>(() => {
  const url = (props.form.link_url || '').trim()
  if (!url) return { kind: 'unknown', label: '—', icon: 'i-lucide-link' }
  if (url.startsWith('mailto:')) return { kind: 'email', label: 'EMAIL', icon: 'i-lucide-mail' }
  if (url.startsWith('tel:')) return { kind: 'tel', label: 'TEL', icon: 'i-lucide-phone' }
  if (url.startsWith('#')) return { kind: 'anchor', label: 'ÂNCORA', icon: 'i-lucide-anchor' }
  if (url.startsWith('/')) return { kind: 'internal', label: 'INTERNO', icon: 'i-lucide-arrow-right-circle' }
  if (/^https?:\/\//i.test(url)) return { kind: 'external', label: 'EXTERNO', icon: 'i-lucide-external-link' }
  return { kind: 'unknown', label: 'INVÁLIDO', icon: 'i-lucide-alert-circle' }
})

/**
 * Estado do label do botão pra feedback visual:
 *   - idle:    vazio (sem feedback)
 *   - optimal: 1-16 chars (sweet spot)
 *   - long:    17-24 chars (limite tolerável)
 *   - too-long: 25+ chars (vai quebrar visual)
 */
type LabelState = 'idle' | 'optimal' | 'long' | 'too-long'

const labelState = computed<LabelState>(() => {
  const len = (props.form.link_label || '').length
  if (!len) return 'idle'
  if (len <= 16) return 'optimal'
  if (len <= 24) return 'long'
  return 'too-long'
})

const labelStateMeta = computed(() => {
  const map: Record<LabelState, { icon: string; text: string }> = {
    idle: { icon: 'i-lucide-info', text: '' },
    optimal: { icon: 'i-lucide-check-circle-2', text: 'Tamanho ideal, converte bem.' },
    long: { icon: 'i-lucide-alert-triangle', text: 'Pode encurtar pra ter mais impacto.' },
    'too-long': { icon: 'i-lucide-alert-circle', text: 'Muito longo. Banner é faixa estreita, vai quebrar.' },
  }
  return map[labelState.value]
})

/** URLs sugeridas comuns no contexto Redentia — clicar preenche. */
const urlSuggestions = [
  { value: '/pricing', label: '/pricing', icon: 'i-lucide-credit-card', desc: 'Página de planos' },
  { value: '/raio-x', label: '/raio-x', icon: 'i-lucide-scan-line', desc: 'Raio-X da carteira' },
  { value: '/help', label: '/help', icon: 'i-lucide-message-circle', desc: 'Chat com IA' },
  { value: '/wallet', label: '/wallet', icon: 'i-lucide-wallet', desc: 'Carteira do user' },
  { value: 'https://', label: 'https://', icon: 'i-lucide-external-link', desc: 'URL externa (preencha o resto)' },
]

// =================================================================
// Audience helpers
// =================================================================

/**
 * Modo do tenant scope: 'global' = sem filtro de tenant (form.tenant_id = null);
 * 'specific' = restringe a uma white-label (admin escolhe qual no select que
 * aparece em baixo).
 *
 * Por que ref local em vez de computed: clicar em "Específico" antes de
 * escolher um tenant precisa abrir o select — mas form.tenant_id ainda
 * é null nesse momento. Computed derivado de form.tenant_id ficaria
 * preso em 'global'. Local ref preserva a intenção do user.
 *
 * Sync bidirecional:
 *   - Ao montar (campanha existente): se tenant_id ja tem valor, init = 'specific'
 *   - User clica 'global': zera tenant_id
 *   - User seleciona tenant no dropdown: mode auto-vira 'specific' (caso ainda nao tenha)
 */
const tenantMode = ref<'global' | 'specific'>(props.form.tenant_id ? 'specific' : 'global')

function setTenantMode(mode: 'global' | 'specific') {
  tenantMode.value = mode
  if (mode === 'global') {
    props.form.tenant_id = null
  }
  // 'specific': mantém tenant_id como está (null ou valor existente).
  // O dropdown abaixo permite o admin selecionar o tenant.
}

// Auto-promove pra 'specific' se admin selecionar tenant pelo select e
// estado inicial era 'global' (raro, mas possivel se a UI carregar com
// tenant_id pre-populado de outra forma).
watch(() => props.form.tenant_id, (next) => {
  if (next && tenantMode.value !== 'specific') tenantMode.value = 'specific'
})

/** Mostra section de refinamentos só pra audiences que têm campos relevantes. */
const showRefinementFilters = computed(() =>
  ['authenticated', 'investors', 'advisors'].includes(props.form.target_audience as string),
)

/** Algum filtro foi configurado? Controla a visibilidade do botão "Limpar". */
const hasActiveRefinements = computed(() =>
  props.form.target_has_connections !== null
  || (props.form.target_min_aum !== null && props.form.target_min_aum !== undefined),
)

function clearRefinements() {
  props.form.target_has_connections = null
  props.form.target_min_aum = null
}

/** Opções do segmented control de Open Finance — 3 estados explícitos. */
const connectionsOptions: { value: boolean | null; label: string; icon?: string }[] = [
  { value: null, label: 'Qualquer um' },
  { value: true, label: 'Conectados', icon: 'i-lucide-link' },
  { value: false, label: 'Sem conexão', icon: 'i-lucide-unlink' },
]

/** Formata BRL sem decimais — usado nos chips de AUM. */
function formatBRL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
  if (n >= 1_000) return `${(n / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`
  return n.toLocaleString('pt-BR')
}

// =================================================================
// Currency input — formatter financeiro pro AUM com separador BR
// =================================================================

const aumInputEl = ref<HTMLInputElement | null>(null)

/**
 * Display value: numero raw → string formatada com separador de
 * milhar BR (1.500.000). Mostra '' quando null/undefined pra placeholder
 * do input aparecer.
 *
 * Sem decimais: AUM e' tipicamente em reais cheios (poucos admins
 * vao filtrar por R$ 12.345,67). Pra centavos, precisariamos
 * mascara com decimal — overkill aqui.
 */
const aumDisplay = computed<string>(() => {
  const v = props.form.target_min_aum
  if (v === null || v === undefined || Number.isNaN(v)) return ''
  return Math.round(v).toLocaleString('pt-BR')
})

/**
 * Parse: extrai dígitos da string formatada → number. Ignora qualquer
 * char não-numérico (ponto, virgula, espaço, etc).
 */
function parseAumString(s: string): number | null {
  const digits = (s || '').replace(/\D/g, '')
  if (!digits) return null
  return Number(digits)
}

/**
 * Handler de input — faz parse, atualiza form, e preserva cursor
 * relativo aos DIGITOS originais (não aos chars). Sem isso, o cursor
 * pula pro fim toda vez que o formatador insere um ponto novo.
 */
function onAumInput(e: Event): void {
  const input = e.target as HTMLInputElement
  const rawTyped = input.value
  const oldCursor = input.selectionStart ?? rawTyped.length

  // Conta quantos dígitos existem antes do cursor (referência estável)
  const digitsBeforeCursor = rawTyped.slice(0, oldCursor).replace(/\D/g, '').length

  // Atualiza model (Vue vai re-renderizar com formato novo)
  props.form.target_min_aum = parseAumString(rawTyped)

  // Restaura posição do cursor depois do re-render
  nextTick(() => {
    if (!aumInputEl.value) return
    const newValue = aumInputEl.value.value
    let pos = 0
    let count = 0
    for (let i = 0; i < newValue.length; i++) {
      if (count === digitsBeforeCursor) break
      if (/\d/.test(newValue[i])) count++
      pos = i + 1
    }
    aumInputEl.value.setSelectionRange(pos, pos)
  })
}

/**
 * Handler de paste — limpa qualquer formatação (R$, espaços, vírgulas,
 * abreviações tipo "1M" ou "100k") e converte pra número raw.
 */
function onAumPaste(e: ClipboardEvent): void {
  const text = e.clipboardData?.getData('text') ?? ''
  // Suporta "1.5M" / "100k" / "R$ 1.234.567,89" / "1.234,56"
  let parsed: number | null = null
  const t = text.trim().toLowerCase()

  // Abreviação k / M / B
  const abbrev = t.match(/^([\d.,]+)\s*([kmb])\b/i)
  if (abbrev) {
    const numStr = abbrev[1].replace(/\./g, '').replace(',', '.')
    const num = Number(numStr)
    const mult = abbrev[2].toLowerCase() === 'b' ? 1_000_000_000
      : abbrev[2].toLowerCase() === 'm' ? 1_000_000
      : 1_000
    if (Number.isFinite(num)) parsed = Math.round(num * mult)
  } else {
    // Numero BR puro: extrai digitos antes da virgula (ignora centavos)
    const beforeDecimal = t.split(',')[0]
    parsed = parseAumString(beforeDecimal)
  }

  props.form.target_min_aum = parsed

  // Posiciona cursor no fim
  nextTick(() => {
    if (!aumInputEl.value) return
    const len = aumInputEl.value.value.length
    aumInputEl.value.setSelectionRange(len, len)
  })
}

// =================================================================
// Vigência (schedule) helpers
// =================================================================

/**
 * Status semântico da vigência calculado em tempo real.
 *   - always: sem datas → roda indefinidamente
 *   - scheduled: starts_at no futuro
 *   - active: starts_at já passou e ends_at no futuro (ou null)
 *   - expired: ends_at já passou
 */
type SchedKind = 'always' | 'scheduled' | 'active' | 'expired'
interface SchedStatus { kind: SchedKind; label: string; icon: string }

const schedStatus = computed<SchedStatus>(() => {
  const now = Date.now()
  const start = props.form.starts_at ? new Date(props.form.starts_at).getTime() : null
  const end = props.form.ends_at ? new Date(props.form.ends_at).getTime() : null

  if (end && end < now) return { kind: 'expired', label: 'Expirou', icon: 'i-lucide-x-circle' }
  if (start && start > now) return { kind: 'scheduled', label: 'Agendado', icon: 'i-lucide-clock' }
  if (!start && !end) return { kind: 'always', label: 'Sem limite', icon: 'i-lucide-infinity' }
  return { kind: 'active', label: 'Vai rodar agora', icon: 'i-lucide-check-circle-2' }
})

/**
 * Texto humanizado de duração: "Roda por 7 dias 4h", "Indefinido",
 * "Expirou há 2 dias", "Começa em 3 horas".
 */
const durationLabel = computed<string>(() => {
  const now = Date.now()
  const start = props.form.starts_at ? new Date(props.form.starts_at).getTime() : null
  const end = props.form.ends_at ? new Date(props.form.ends_at).getTime() : null

  if (!start && !end) return 'Roda indefinidamente'
  if (end && end < now) {
    const diff = now - end
    return `Expirou há ${humanizeDuration(diff)}`
  }
  if (start && start > now) {
    const diff = start - now
    return `Começa em ${humanizeDuration(diff)}`
  }
  // Active
  if (end) {
    const diff = end - now
    return `Termina em ${humanizeDuration(diff)}`
  }
  return 'Sem fim definido'
})

function humanizeDuration(ms: number): string {
  const sec = Math.floor(ms / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (day >= 7) return `${day} dias`
  if (day >= 1) {
    const remHr = hr - day * 24
    return remHr > 0 ? `${day}d ${remHr}h` : `${day} ${day === 1 ? 'dia' : 'dias'}`
  }
  if (hr >= 1) {
    const remMin = min - hr * 60
    return remMin > 0 ? `${hr}h ${remMin}m` : `${hr} ${hr === 1 ? 'hora' : 'horas'}`
  }
  if (min >= 1) return `${min} min`
  return 'menos de 1 min'
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const sameYear = d.getFullYear() === new Date().getFullYear()
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: sameYear ? undefined : 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/**
 * Atalhos: agora, +24h, +7d, +30d, indefinido. Setam starts_at e
 * ends_at relativos ao "agora" no formato datetime-local (sem fuso).
 */
type SchedPresetId = 'now-24h' | 'now-7d' | 'now-30d' | 'tomorrow' | 'unlimited'
interface SchedPreset {
  id: SchedPresetId
  label: string
  icon: string
  desc: string
}

const schedulePresets: SchedPreset[] = [
  { id: 'now-24h', label: 'Próximas 24h', icon: 'i-lucide-clock', desc: 'Inicia agora, termina em 24 horas' },
  { id: 'now-7d', label: '7 dias', icon: 'i-lucide-calendar', desc: 'Inicia agora, termina em 7 dias' },
  { id: 'now-30d', label: '30 dias', icon: 'i-lucide-calendar-days', desc: 'Inicia agora, termina em 30 dias' },
  { id: 'tomorrow', label: 'Amanhã 9h', icon: 'i-lucide-sunrise', desc: 'Programa pra começar amanhã às 9h' },
  { id: 'unlimited', label: 'Indefinido', icon: 'i-lucide-infinity', desc: 'Roda indefinidamente até admin pausar' },
]

/**
 * Formata Date pra string aceitavel pelo <input type="datetime-local">
 * (formato: YYYY-MM-DDTHH:MM, sem timezone, no fuso local).
 */
function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function applySchedulePreset(id: SchedPresetId) {
  const now = new Date()
  switch (id) {
    case 'now-24h':
      props.form.starts_at = toDatetimeLocal(now)
      props.form.ends_at = toDatetimeLocal(new Date(now.getTime() + 24 * 60 * 60 * 1000))
      break
    case 'now-7d':
      props.form.starts_at = toDatetimeLocal(now)
      props.form.ends_at = toDatetimeLocal(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))
      break
    case 'now-30d':
      props.form.starts_at = toDatetimeLocal(now)
      props.form.ends_at = toDatetimeLocal(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))
      break
    case 'tomorrow': {
      const t = new Date(now)
      t.setDate(t.getDate() + 1)
      t.setHours(9, 0, 0, 0)
      props.form.starts_at = toDatetimeLocal(t)
      props.form.ends_at = null as any
      break
    }
    case 'unlimited':
      props.form.starts_at = null as any
      props.form.ends_at = null as any
      break
  }
}

/**
 * Detecta qual preset está ativo comparando datas atuais. Acerto
 * tolerante (~5 min de skew) pra UX não ficar perdendo o highlight
 * porque clicou há 30s e o "agora" já passou.
 */
const activePreset = computed<SchedPresetId | null>(() => {
  const start = props.form.starts_at ? new Date(props.form.starts_at).getTime() : null
  const end = props.form.ends_at ? new Date(props.form.ends_at).getTime() : null

  if (!start && !end) return 'unlimited'
  if (start && !end) return null  // só início preenchido (custom)
  if (start && end) {
    const dur = end - start
    const day = 24 * 60 * 60 * 1000
    const startMatchNow = Math.abs(start - Date.now()) < 10 * 60 * 1000  // 10 min tolerance
    if (!startMatchNow) return null
    if (Math.abs(dur - day) < 60 * 60 * 1000) return 'now-24h'
    if (Math.abs(dur - 7 * day) < 60 * 60 * 1000) return 'now-7d'
    if (Math.abs(dur - 30 * day) < 60 * 60 * 1000) return 'now-30d'
  }
  return null
})

// Two-way binding pra slider (form.priority pode ser undefined inicialmente)
const priorityValue = computed<number>({
  get: () => props.form.priority ?? 0,
  set: (v) => { props.form.priority = v },
})

interface PriorityPreset { value: number; label: string; kind: 'low' | 'medium' | 'high' | 'urgent'; desc: string }
const priorityPresets: PriorityPreset[] = [
  { value: 0, kind: 'low', label: 'Baixa', desc: 'Cede vez pra outros banners' },
  { value: 100, kind: 'medium', label: 'Média', desc: 'Default, fila normal' },
  { value: 500, kind: 'high', label: 'Alta', desc: 'Sobre quase todos os outros' },
  { value: 1000, kind: 'urgent', label: 'Urgente', desc: 'Override total, usar com moderação' },
]

const priorityTier = computed<PriorityPreset>(() => {
  const v = priorityValue.value
  if (v >= 800) return priorityPresets[3]
  if (v >= 250) return priorityPresets[2]
  if (v >= 50) return priorityPresets[1]
  return priorityPresets[0]
})

// =================================================================
// Sub-components inline (Section, Field) — específicos pra esse editor.
// Mesma pattern do [id].vue antigo, mas mais enxuto.
// =================================================================
const Section = defineComponent({
  props: {
    title: String,
    eyebrow: String,
    icon: String,
    open: Boolean,
  },
  emits: ['toggle'],
  setup(props, { slots, emit }) {
    return () => h('section', { class: ['form-section', props.open ? 'form-section--open' : ''] }, [
      h('button', {
        type: 'button',
        class: 'form-section__head',
        onClick: () => emit('toggle'),
      }, [
        h('span', { class: 'form-section__icon' }, [
          h(resolveComponent('UIcon'), { name: props.icon, class: 'size-4' }),
        ]),
        h('div', { class: 'form-section__head-text' }, [
          props.eyebrow ? h('span', { class: 'form-section__eyebrow' }, props.eyebrow) : null,
          h('span', { class: 'form-section__title' }, props.title),
        ]),
        h(resolveComponent('UIcon'), {
          name: props.open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down',
          class: 'size-3.5 form-section__chevron',
        }),
      ]),
      props.open
        ? h('div', { class: 'form-section__body' }, slots.default?.())
        : null,
    ])
  },
})

const Field = defineComponent({
  props: { label: String, hint: String },
  setup(props, { slots }) {
    return () => h('label', { class: 'field' }, [
      props.label ? h('span', { class: 'field__label' }, props.label) : null,
      h('div', { class: 'field__control' }, slots.default?.()),
      props.hint ? h('span', { class: 'field__hint' }, props.hint) : null,
    ])
  },
})
</script>

<style scoped>
/* =========================================================
   Layout: 2 colunas (desktop) ou stacked (mobile)
   ========================================================= */
.banner-editor {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding: 24px;
  align-items: start;
}

@media (min-width: 1280px) {
  .banner-editor {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 32px;
  }
}

.banner-editor__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.banner-editor__aside {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 80px;
}

/* =========================================================
   Status row (top of form)
   ========================================================= */
.status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  padding: 14px 16px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.status-row__intro {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.status-row__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.status-row__hint {
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  max-width: 360px;
}
.status-row__chips {
  display: flex;
  gap: 4px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  cursor: pointer;
  transition: background 150ms, border-color 150ms, color 150ms;
}
.status-chip:hover {
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  color: color-mix(in srgb, var(--brand-text) 90%, transparent);
}
.status-chip--active {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
}
.status-chip__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}
.status-chip__dot--draft { color: color-mix(in srgb, var(--brand-text) 50%, transparent); }
.status-chip__dot--active { color: var(--brand-positive); }
.status-chip__dot--paused { color: var(--brand-warning); }
.status-chip--active .status-chip__dot--active {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-positive) 20%, transparent);
}

/* =========================================================
   Section primitive
   ========================================================= */
:deep(.form-section) {
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  overflow: hidden;
}
:deep(.form-section__head) {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  transition: background 150ms;
}
:deep(.form-section__head:hover) {
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
}
:deep(.form-section__icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
}
:deep(.form-section__head-text) {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}
:deep(.form-section__eyebrow) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
:deep(.form-section__title) {
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
}
:deep(.form-section__chevron) {
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
  flex-shrink: 0;
}
:deep(.form-section__body) {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 16px 18px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 5%, transparent);
}

/* =========================================================
   Field primitive
   ========================================================= */
:deep(.field) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}
:deep(.field__label) {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: color-mix(in srgb, var(--brand-text) 85%, transparent);
}
:deep(.field__control) {
  position: relative;
}
:deep(.field__hint) {
  font-size: 11px;
  line-height: 1.45;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.field-counter {
  position: absolute;
  bottom: -16px;
  right: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
}
.field-counter--warn {
  color: var(--brand-warning);
}

.section-lead {
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  line-height: 1.5;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 640px) {
  .grid-2 { grid-template-columns: 1fr 1fr; }
}

/* =========================================================
   Placement cards
   ========================================================= */
.placement-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.placement-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 12px 14px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  cursor: pointer;
  text-align: left;
  transition: border-color 150ms, background 150ms, transform 150ms;
}
.placement-card:hover {
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.placement-card--active {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
}

.placement-mockup {
  position: relative;
  height: 80px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
  display: grid;
  grid-template-columns: 22px 1fr;
}
.placement-mockup__sidebar {
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.placement-mockup__main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 8px 6px;
}
.placement-mockup__line {
  height: 4px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--brand-text) 10%, transparent);
  width: 60%;
}
.placement-mockup__line--short { width: 40%; }
.placement-mockup__highlight {
  position: absolute;
  background: var(--brand-primary);
  border-radius: 2px;
}
.placement-mockup--top .placement-mockup__highlight {
  top: 4px;
  left: 4px;
  right: 4px;
  height: 6px;
}
.placement-mockup--sidebar .placement-mockup__highlight {
  bottom: 4px;
  left: 2px;
  width: 18px;
  height: 22px;
}

.placement-card__meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.placement-card__label {
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
}
.placement-card__desc {
  font-size: 11px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.placement-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
}

/* =========================================================
   CTA section — preview + smart inputs + behavior cards
   ========================================================= */

/* Live button preview no topo */
.cta-preview {
  position: relative;
  padding: 14px 14px 16px;
  border-radius: 12px;
  background:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--brand-primary) 12%, transparent), transparent 60%),
    color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.cta-preview--empty {
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border-style: dashed;
  border-color: color-mix(in srgb, var(--brand-text) 12%, transparent);
}
.cta-preview__shell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cta-preview__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.cta-preview__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  padding: 8px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.cta-preview__placeholder {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
.cta-preview__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  box-shadow:
    0 14px 28px -16px color-mix(in srgb, var(--brand-primary) 60%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--brand-text) 18%, transparent);
}
.cta-preview__destination {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 5%, transparent);
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}
.cta-preview__destination-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
.cta-preview__destination-url {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--brand-text);
  word-break: break-all;
  max-width: 100%;
}

/* Badge de tipo de link (interno/externo/email/etc) — usado no preview e no input */
.cta-preview__destination-badge,
.cta-url-input__badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid;
  white-space: nowrap;
  flex-shrink: 0;
}
.cta-preview__destination-badge[data-type='internal'],
.cta-url-input__badge[data-type='internal'] {
  color: var(--brand-primary);
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
}
.cta-preview__destination-badge[data-type='external'],
.cta-url-input__badge[data-type='external'] {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.35);
  background: rgba(56, 189, 248, 0.1);
}
.cta-preview__destination-badge[data-type='email'],
.cta-url-input__badge[data-type='email'] {
  color: #a78bfa;
  border-color: rgba(167, 139, 250, 0.35);
  background: rgba(167, 139, 250, 0.1);
}
.cta-preview__destination-badge[data-type='tel'],
.cta-url-input__badge[data-type='tel'] {
  color: var(--brand-positive);
  border-color: rgba(52, 211, 153, 0.35);
  background: rgba(52, 211, 153, 0.1);
}
.cta-preview__destination-badge[data-type='anchor'],
.cta-url-input__badge[data-type='anchor'] {
  color: var(--brand-warning);
  border-color: color-mix(in srgb, var(--brand-warning) 35%, transparent);
  background: color-mix(in srgb, var(--brand-warning) 10%, transparent);
}
.cta-preview__destination-badge[data-type='unknown'],
.cta-url-input__badge[data-type='unknown'] {
  color: var(--brand-negative);
  border-color: color-mix(in srgb, var(--brand-negative) 35%, transparent);
  background: color-mix(in srgb, var(--brand-negative) 10%, transparent);
}

/* Label input — input + medidor */
.cta-label-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px 0 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  transition: border-color 150ms, box-shadow 150ms;
}
.cta-label-input:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.cta-label-input__icon {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  flex-shrink: 0;
}
.cta-label-input__field {
  flex: 1;
}
.cta-label-input__field :deep(input),
.cta-label-input__field :deep(.iconify) {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  padding-left: 0 !important;
}
.cta-label-input__meter {
  display: inline-flex;
  align-items: baseline;
  gap: 1px;
  padding: 4px 8px;
  border-radius: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 600;
  flex-shrink: 0;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.cta-label-input__meter[data-state='idle'] {
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
.cta-label-input__meter[data-state='optimal'] {
  background: color-mix(in srgb, var(--brand-positive) 15%, transparent);
  color: var(--brand-positive);
}
.cta-label-input__meter[data-state='long'] {
  background: color-mix(in srgb, var(--brand-warning) 15%, transparent);
  color: var(--brand-warning);
}
.cta-label-input__meter[data-state='too-long'] {
  background: color-mix(in srgb, var(--brand-negative) 18%, transparent);
  color: var(--brand-negative);
}
.cta-label-input__count { font-weight: 700; }
.cta-label-input__sep {
  opacity: 0.4;
  margin: 0 1px;
}
.cta-label-input__limit {
  opacity: 0.6;
}

.cta-label-input__hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 500;
}
.cta-label-input__hint[data-state='optimal'] { color: var(--brand-positive); }
.cta-label-input__hint[data-state='long'] { color: var(--brand-warning); }
.cta-label-input__hint[data-state='too-long'] { color: var(--brand-negative); }

/* URL input — input + badge auto-detectado */
.cta-url-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px 0 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  transition: border-color 150ms, box-shadow 150ms;
}
.cta-url-input:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.cta-url-input__icon {
  flex-shrink: 0;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  transition: color 150ms;
}
.cta-url-input__icon[data-type='internal'] { color: var(--brand-primary); }
.cta-url-input__icon[data-type='external'] { color: #38bdf8; }
.cta-url-input__icon[data-type='email'] { color: #a78bfa; }
.cta-url-input__icon[data-type='tel'] { color: var(--brand-positive); }
.cta-url-input__icon[data-type='anchor'] { color: var(--brand-warning); }
.cta-url-input__icon[data-type='unknown'] { color: var(--brand-negative); }
.cta-url-input__field {
  flex: 1;
}
.cta-url-input__field :deep(input),
.cta-url-input__field :deep(.iconify) {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  padding-left: 0 !important;
}

/* URL suggestions — chips clicáveis */
.cta-url-suggestions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}
.cta-url-suggestions__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
  margin-right: 2px;
}
.cta-url-suggestion {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  cursor: pointer;
  transition: background 150ms, border-color 150ms, color 150ms, transform 100ms;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}
.cta-url-suggestion:hover {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
  color: var(--brand-text);
  transform: translateY(-1px);
}
.cta-url-suggestion--active {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  color: var(--brand-primary);
}
.cta-url-suggestion code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 500;
}

/* Behavior cards — persistente vs dispensável */
.cta-behavior-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
@media (min-width: 640px) {
  .cta-behavior-grid { grid-template-columns: 1fr 1fr; }
}
.cta-behavior-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  cursor: pointer;
  text-align: left;
  transition: border-color 150ms, background 150ms, transform 100ms;
}
.cta-behavior-card:hover {
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.cta-behavior-card--active {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
}
.cta-behavior-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: color-mix(in srgb, var(--brand-text) 80%, transparent);
  flex-shrink: 0;
}
.cta-behavior-card--active .cta-behavior-card__icon {
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary);
}
.cta-behavior-card__meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.cta-behavior-card__title {
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--brand-text);
}
.cta-behavior-card__desc {
  font-size: 11.5px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.cta-behavior-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
}

/* =========================================================
   Audience section — layered targeting (base → escopo → refinamentos)
   ========================================================= */

/* Section lead reforça hierarquia */
.section-lead strong {
  color: var(--brand-text);
  font-weight: 600;
}

/* Layer container — cada camada vira um bloco com numeração e regra visual */
.aud-layer {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px 16px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.aud-layer--accent {
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.aud-layer__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}
.aud-layer__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
.aud-layer__head > div {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.aud-layer__title {
  font-family: var(--brand-font);
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-text);
}
.aud-layer__sub {
  font-size: 11.5px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.aud-layer__count {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}
.aud-layer__count[data-state='empty'] {
  border-color: color-mix(in srgb, var(--brand-warning) 35%, transparent);
  background: color-mix(in srgb, var(--brand-warning) 12%, transparent);
  color: var(--brand-warning);
}
.aud-layer__count-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-top: 2px;
  opacity: 0.75;
}
.aud-layer__action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  font-size: 11px;
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
}
.aud-layer__action:hover {
  background: color-mix(in srgb, var(--brand-negative) 10%, transparent);
  color: var(--brand-negative);
  border-color: color-mix(in srgb, var(--brand-negative) 35%, transparent);
}

/* ---- Layer 1: Base audience grid (3 cols) ---- */
.aud-base-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
@media (min-width: 720px) {
  .aud-base-grid { grid-template-columns: repeat(3, 1fr); }
}

.aud-base-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
  cursor: pointer;
  text-align: left;
  transition: border-color 150ms, background 150ms, transform 100ms;
  min-width: 0;
}
.aud-base-card:hover {
  border-color: color-mix(in srgb, var(--brand-text) 16%, transparent);
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.aud-base-card--active {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
}
.aud-base-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: color-mix(in srgb, var(--brand-text) 80%, transparent);
  flex-shrink: 0;
}
.aud-base-card--active .aud-base-card__icon {
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  color: var(--brand-primary);
}
.aud-base-card__meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}
.aud-base-card__label {
  font-family: var(--brand-font);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--brand-text);
}
.aud-base-card__desc {
  font-size: 10.5px;
  line-height: 1.35;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.aud-base-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  flex-shrink: 0;
}

/* ---- Layer 2: Tenant scope (2 cards horizontal) ---- */
.aud-scope-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
@media (min-width: 640px) {
  .aud-scope-grid { grid-template-columns: 1fr 1fr; }
}

.aud-scope-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  cursor: pointer;
  text-align: left;
  transition: border-color 150ms, background 150ms;
}
.aud-scope-card:hover {
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.aud-scope-card--active {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
}
.aud-scope-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: color-mix(in srgb, var(--brand-text) 80%, transparent);
  flex-shrink: 0;
}
.aud-scope-card--active .aud-scope-card__icon {
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary);
}
.aud-scope-card__meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.aud-scope-card__label {
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--brand-text);
}
.aud-scope-card__desc {
  font-size: 11.5px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.aud-scope-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
}

.aud-tenant-select {
  margin-top: 4px;
}

/* ---- Filter card (within refinements layer) ---- */
.aud-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.aud-filter__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.aud-filter__icon {
  margin-top: 2px;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  flex-shrink: 0;
}
.aud-filter__meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}
.aud-filter__title {
  font-family: var(--brand-font);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--brand-text);
}
.aud-filter__desc {
  font-size: 11px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

/* Segmented control 3-way (Open Finance) */
.aud-segmented {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.aud-segmented__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  font-family: var(--brand-font);
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.aud-segmented__btn:hover:not(.aud-segmented__btn--active) {
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  color: var(--brand-text);
}
.aud-segmented__btn--active {
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  box-shadow: 0 4px 10px -4px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}

/* Currency input (R$ prefix) */
.aud-currency-input {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 6px 0 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  transition: border-color 150ms, box-shadow 150ms;
}
.aud-currency-input:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.aud-currency-input__prefix {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-primary);
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

/* Native input (substitui UInput pra ter controle total da formatação) */
.aud-currency-input__field {
  flex: 1;
  min-width: 0;
  padding: 9px 4px;
  border: 0;
  background: transparent;
  outline: none;
  color: var(--brand-text);
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-variant-numeric: tabular-nums;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: right;
}
.aud-currency-input__field::placeholder {
  color: color-mix(in srgb, var(--brand-text) 30%, transparent);
  font-weight: 500;
}
/* Remove spinners do type=number caso o browser ignore type=text */
.aud-currency-input__field::-webkit-outer-spin-button,
.aud-currency-input__field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.aud-currency-input__suffix {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
  letter-spacing: 0.02em;
  flex-shrink: 0;
  margin-right: 4px;
}
.aud-currency-input__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.aud-currency-input__clear:hover {
  background: color-mix(in srgb, var(--brand-negative) 10%, transparent);
  color: var(--brand-negative);
}

.aud-currency-input__chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}
.aud-currency-input__chips-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
.aud-currency-input__chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 5px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms, border-color 150ms, color 150ms;
}
.aud-currency-input__chip:hover {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
  color: var(--brand-text);
}
.aud-currency-input__chip--active {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  color: var(--brand-primary);
}

/* Warn box (audience=specific sem usuários) */
.aud-warn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-warning) 12%, transparent);
  color: var(--brand-warning);
  font-size: 11.5px;
}

/* Expand transition pra layers que aparecem condicionalmente */
.aud-expand-enter-active,
.aud-expand-leave-active {
  transition: opacity 200ms, transform 200ms, max-height 220ms;
  overflow: hidden;
}
.aud-expand-enter-from,
.aud-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}
.aud-expand-enter-to,
.aud-expand-leave-from {
  opacity: 1;
  max-height: 800px;
}

/* =========================================================
   Vigência section — status + timeline + presets + slider
   ========================================================= */

/* Status card com timeline visual */
.vig-status-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  transition: border-color 200ms, background 200ms;
}
.vig-status-card[data-state='active'] {
  border-color: color-mix(in srgb, var(--brand-positive) 35%, transparent);
  background: color-mix(in srgb, var(--brand-positive) 6%, transparent);
}
.vig-status-card[data-state='scheduled'] {
  border-color: color-mix(in srgb, #06b6d4 35%, transparent);
  background: color-mix(in srgb, #06b6d4 6%, transparent);
}
.vig-status-card[data-state='expired'] {
  border-color: color-mix(in srgb, var(--brand-negative) 35%, transparent);
  background: color-mix(in srgb, var(--brand-negative) 6%, transparent);
}
.vig-status-card[data-state='always'] {
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
}

.vig-status-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.vig-status-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  color: var(--brand-text);
}
.vig-status-card[data-state='active'] .vig-status-card__badge {
  background: color-mix(in srgb, var(--brand-positive) 18%, transparent);
  color: var(--brand-positive);
}
.vig-status-card[data-state='scheduled'] .vig-status-card__badge {
  background: color-mix(in srgb, #06b6d4 18%, transparent);
  color: #67e8f9;
}
.vig-status-card[data-state='expired'] .vig-status-card__badge {
  background: color-mix(in srgb, var(--brand-negative) 18%, transparent);
  color: var(--brand-negative);
}
.vig-status-card[data-state='always'] .vig-status-card__badge {
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary);
}
.vig-status-card__duration {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}

/* Timeline visual */
.vig-timeline {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
}
.vig-timeline__node {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  position: relative;
}
.vig-timeline__node--unset {
  background: transparent;
  border-style: dashed;
  border-color: color-mix(in srgb, var(--brand-text) 14%, transparent);
}
.vig-timeline__node--end {
  text-align: right;
}
.vig-timeline__dot {
  position: absolute;
  top: 8px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--brand-primary);
}
.vig-timeline__node--start .vig-timeline__dot { left: 8px; }
.vig-timeline__node--end .vig-timeline__dot { right: 8px; }
.vig-timeline__node--unset .vig-timeline__dot {
  background: color-mix(in srgb, var(--brand-text) 30%, transparent);
}
.vig-timeline__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  padding: 0 12px;
}
.vig-timeline__when {
  font-family: var(--brand-font);
  font-size: 12px;
  font-weight: 500;
  color: var(--brand-text);
  padding: 0 12px;
}
.vig-timeline__node--unset .vig-timeline__when {
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
  font-style: italic;
}
.vig-timeline__bar {
  height: 2px;
  width: 36px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--brand-text) 18%, transparent),
    var(--brand-primary)
  );
  border-radius: 999px;
}
.vig-timeline__bar--expired {
  background: linear-gradient(90deg, transparent, var(--brand-negative));
  opacity: 0.5;
}
.vig-timeline__bar--scheduled {
  background: linear-gradient(90deg, transparent, #06b6d4);
}
.vig-timeline__bar--always {
  background: linear-gradient(90deg, var(--brand-primary), var(--brand-primary));
  opacity: 0.4;
}

/* Atalhos */
.vig-presets {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}
.vig-presets__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
  margin-right: 2px;
}
.vig-preset {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  font-family: var(--brand-font);
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms, border-color 150ms, color 150ms, transform 100ms;
}
.vig-preset:hover {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
  color: var(--brand-text);
  transform: translateY(-1px);
}
.vig-preset--active {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  color: var(--brand-primary);
}

/* Datetime input com X clear */
.vig-input {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 6px 0 10px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  transition: border-color 150ms, box-shadow 150ms;
}
.vig-input:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.vig-input__icon {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  flex-shrink: 0;
}
.vig-input__field {
  flex: 1;
}
.vig-input__field :deep(input) {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  padding-left: 0 !important;
}
.vig-input__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  border-radius: 4px;
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.vig-input__clear:hover {
  background: color-mix(in srgb, var(--brand-negative) 12%, transparent);
  color: var(--brand-negative);
}

/* Priority slider + presets */
.vig-priority {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.vig-priority__row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.vig-priority__slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--brand-primary) 0%,
    var(--brand-primary) var(--pct, 0%),
    color-mix(in srgb, var(--brand-text) 12%, transparent) var(--pct, 0%),
    color-mix(in srgb, var(--brand-text) 12%, transparent) 100%
  );
  outline: none;
  cursor: pointer;
}
.vig-priority__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--brand-primary);
  border: 3px solid var(--brand-surface);
  box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--brand-primary) 50%, transparent);
  cursor: grab;
  transition: transform 100ms;
}
.vig-priority__slider::-webkit-slider-thumb:active {
  transform: scale(1.15);
  cursor: grabbing;
}
.vig-priority__slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--brand-primary);
  border: 3px solid var(--brand-surface);
  cursor: grab;
}
.vig-priority__value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  padding: 5px 10px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  font-weight: 700;
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  color: var(--brand-text);
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
}
.vig-priority__value[data-tier='low'] {
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}
.vig-priority__value[data-tier='medium'] {
  color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
}
.vig-priority__value[data-tier='high'] {
  color: var(--brand-warning);
  background: color-mix(in srgb, var(--brand-warning) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-warning) 40%, transparent);
}
.vig-priority__value[data-tier='urgent'] {
  color: var(--brand-negative);
  background: color-mix(in srgb, var(--brand-negative) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-negative) 40%, transparent);
}

.vig-priority__presets {
  display: flex;
  gap: 4px;
}
.vig-priority__preset {
  flex: 1;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  cursor: pointer;
  transition: background 150ms, border-color 150ms, color 150ms;
}
.vig-priority__preset:hover {
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.vig-priority__preset--active[data-tier='low'] {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: var(--brand-text);
}
.vig-priority__preset--active[data-tier='medium'] {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  color: var(--brand-primary);
}
.vig-priority__preset--active[data-tier='high'] {
  background: color-mix(in srgb, var(--brand-warning) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-warning) 40%, transparent);
  color: var(--brand-warning);
}
.vig-priority__preset--active[data-tier='urgent'] {
  background: color-mix(in srgb, var(--brand-negative) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-negative) 40%, transparent);
  color: var(--brand-negative);
}

/* =========================================================
   Switch (legacy — pode ser removido depois)
   ========================================================= */
.switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}
.switch input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.switch__track {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 12%, transparent);
  transition: background 180ms;
}
.switch__track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 85%, transparent);
  transition: transform 180ms, background 180ms;
}
.switch input:checked + .switch__track {
  background: var(--brand-primary);
}
.switch input:checked + .switch__track::after {
  transform: translateX(16px);
  background: var(--text-on-primary, #fff);
}
.switch__label {
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 85%, transparent);
}

/* =========================================================
   Audience grid
   ========================================================= */
.audience-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
@media (min-width: 768px) {
  .audience-grid { grid-template-columns: repeat(4, 1fr); }
}

.audience-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  cursor: pointer;
  text-align: left;
  transition: border-color 150ms, background 150ms;
}
.audience-card:hover {
  border-color: color-mix(in srgb, var(--brand-text) 16%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.audience-card--active {
  border-color: color-mix(in srgb, var(--brand-primary) 45%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
}
.audience-card__icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  color: color-mix(in srgb, var(--brand-text) 85%, transparent);
  margin-bottom: 4px;
}
.audience-card--active .audience-card__icon {
  background: color-mix(in srgb, var(--brand-primary) 20%, transparent);
  color: var(--brand-primary);
}
.audience-card__label {
  font-family: var(--brand-font);
  font-size: 12.5px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
}
.audience-card__desc {
  font-size: 10.5px;
  line-height: 1.35;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* =========================================================
   User picker block (live list)
   ========================================================= */
.picker-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.picker-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.picker-block__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 90%, transparent);
}
.picker-block__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  color: var(--brand-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 600;
}
.picker-block__clear {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  font-size: 11px;
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.picker-block__clear:hover {
  background: rgba(220, 38, 38, 0.1);
  color: var(--brand-negative);
  border-color: rgba(220, 38, 38, 0.4);
}
.picker-block__warn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-warning) 12%, transparent);
  color: var(--brand-warning);
  font-size: 11.5px;
  margin: 0;
}

/* =========================================================
   Aside: Preview card
   ========================================================= */
.preview-card {
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  overflow: hidden;
}
.preview-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.preview-card__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.preview-card__hint {
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.preview-stage {
  padding: 14px;
  background: rgba(0, 0, 0, 0.25);
  min-height: 220px;
}

/* TOP placement preview */
.prev-top {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.prev-top__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-primary) 18%, color-mix(in srgb, var(--brand-text) 4%, transparent));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 40%, transparent);
}
.prev-top__icon { color: var(--brand-primary); }
.prev-top__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.prev-top__title {
  font-size: 12px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.prev-top__body {
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.prev-top__cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.prev-top__close {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  flex-shrink: 0;
}

/* SIDEBAR placement preview */
.prev-sidebar {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 8px;
}
.prev-sidebar__shell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 8px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
  min-height: 180px;
}
.prev-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 4px;
}
.prev-sidebar__nav-item {
  height: 18px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.prev-sidebar__nav-item--active {
  background: color-mix(in srgb, var(--brand-text) 12%, transparent);
}
.prev-sidebar__banner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-primary) 18%, color-mix(in srgb, var(--brand-text) 4%, transparent));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 40%, transparent);
  margin-top: auto;
}
.prev-sidebar__icon { color: var(--brand-primary); }
.prev-sidebar__title {
  font-size: 11px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
  line-height: 1.3;
}
.prev-sidebar__body {
  font-size: 10px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  line-height: 1.4;
}
.prev-sidebar__cta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 4px;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--brand-primary);
}
.prev-sidebar__close {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
.prev-sidebar__main {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
}

/* App body lines (placeholder content under banner) */
.prev-app {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
}
.prev-line {
  height: 5px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--brand-text) 7%, transparent);
}
.prev-line--w70 { width: 70%; }
.prev-line--w60 { width: 60%; }
.prev-line--w50 { width: 50%; }
.prev-line--w40 { width: 40%; }

/* =========================================================
   Inline markdown rendering inside live preview (top + sidebar
   banner body). Same styling as the public TopBanner so the
   admin preview is fiel.
   ========================================================= */
.prev-top__body :deep(strong),
.prev-sidebar__body :deep(strong) {
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 92%, transparent);
}
.prev-top__body :deep(em),
.prev-sidebar__body :deep(em) {
  font-style: italic;
  font-family: 'Instrument Serif', Georgia, serif;
}
.prev-top__body :deep(a),
.prev-sidebar__body :deep(a) {
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
}

/* =========================================================
   Aside: Analytics card
   ========================================================= */
.analytics-card {
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  overflow: hidden;
}
.analytics-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.analytics-card__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.analytics-card__hint {
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
}
.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.analytics-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  background: var(--brand-background);
}
.analytics-stat__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
.analytics-stat__value {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 22px;
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
  letter-spacing: -0.01em;
}
.analytics-stat__value small {
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  margin-left: 1px;
}
.analytics-stat__sub {
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
</style>
