<!--
  EditorPoll — editor dedicado para comunicações do tipo `poll`.

  Poll e renderizado pelo MESMO ModalManager dos modals (placement
  ='modal'), mas com UI especifica: pergunta + lista de opcoes
  clickaveis + botao de voto, opcionalmente seguido por tally de
  resultados se admin liberou.

  Caracteristicas:
    - placement = 'modal' sempre (auto-set, sem picker)
    - poll_options: 2-10 opcoes, cada uma com id + label
    - poll_multi_choice: usuario pode selecionar varias respostas
    - poll_results_visible: mostra os resultados apos votar
    - modal_size (sm/md/lg) controla largura do card
    - CTA URL/label NAO usado em poll (o botao "Votar" e
      auto-renderizado pelo ModalManager)
    - Frequency: 1x/sessao, igual modal

  Sections:
    1. Pergunta       — title + body (rich text basic)
    2. Opcoes         — builder de respostas (2-10)
    3. Aparencia      — modal_size picker
    4. Comportamento  — multi_choice + results_visible
    5. Audiencia      — base + escopo + refinamentos
    6. Vigencia       — timeline + presets + priority
-->
<template>
  <div class="poll-editor">
    <!-- LEFT: form -->
    <form class="poll-editor__form" @submit.prevent="$emit('save')">
      <!-- =================== STATUS ROW =================== -->
      <div class="status-row">
        <div class="status-row__intro">
          <span class="status-row__eyebrow">Status atual</span>
          <span class="status-row__hint">
            Enquete aparece como <strong>modal popup</strong>, 1× por sessão. Coleta voto e (opcionalmente) revela tally.
          </span>
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

      <!-- =================== SECTION 1: PERGUNTA =================== -->
      <Section
        title="Pergunta"
        eyebrow="Conteúdo"
        icon="i-lucide-help-circle"
        :open="open.content"
        @toggle="open.content = !open.content"
      >
        <Field label="Título da enquete *" hint="Pergunta principal. Curta e direta.">
          <UInput
            v-model="form.title"
            placeholder='Ex.: "Qual classe de ativos você mais investe?"'
            size="md"
            required
          />
          <span class="field-counter" :class="{ 'field-counter--warn': (form.title || '').length > 80 }">
            {{ (form.title || '').length }}/80
          </span>
        </Field>

        <Field
          label="Contexto (opcional)"
          hint="Texto de apoio antes das opções. Use pra explicar a pergunta ou dar contexto."
        >
          <AdminFormsRichTextField
            v-model="form.body"
            level="basic"
            :max-length="800"
            placeholder='Ex.: "Estamos planejando o próximo conteúdo. Sua resposta nos ajuda a priorizar."'
          />
        </Field>

        <div class="grid-2">
          <Field label="Ícone" hint="Pictograma ao lado do título (opcional).">
            <AdminFormsIconPicker v-model="form.icon" />
          </Field>
          <Field label="Imagem cover (opcional)" hint="Aparece no topo do modal (16:9).">
            <AdminFormsImageUploadField v-model="form.image_url" :alt="form.title || ''" />
          </Field>
        </div>
      </Section>

      <!-- =================== SECTION 2: OPÇÕES =================== -->
      <Section
        :title="`Opções de resposta (${(form.poll_options || []).length})`"
        eyebrow="Respostas"
        icon="i-lucide-list-checks"
        :open="open.options"
        @toggle="open.options = !open.options"
      >
        <span class="section-lead">
          Adicione entre <strong>2 e 10 opções</strong>. Cada opção tem um id auto-gerado pra
          rastreamento e analytics. Reordene arrastando.
        </span>

        <div class="poll-options-list">
          <div
            v-for="(opt, i) in (form.poll_options || [])"
            :key="opt.id"
            class="poll-option-row"
          >
            <span class="poll-option-row__index">{{ i + 1 }}</span>
            <UInput
              v-model="opt.label"
              :placeholder="`Opção ${i + 1}`"
              size="md"
              class="poll-option-row__input"
            />
            <button
              v-if="(form.poll_options || []).length > 2"
              type="button"
              class="poll-option-row__remove"
              :title="`Remover opção ${i + 1}`"
              @click="removeOption(i)"
            >
              <UIcon name="i-lucide-x" class="size-3.5" />
            </button>
          </div>

          <button
            v-if="(form.poll_options || []).length < 10"
            type="button"
            class="poll-option-row__add"
            @click="addOption"
          >
            <UIcon name="i-lucide-plus" class="size-3.5" />
            Adicionar opção ({{ 10 - (form.poll_options || []).length }} restantes)
          </button>
        </div>

        <div v-if="optionsValidation" class="poll-options-warn">
          <UIcon name="i-lucide-alert-triangle" class="size-3.5" />
          {{ optionsValidation }}
        </div>
      </Section>

      <!-- =================== SECTION 3: APARÊNCIA =================== -->
      <Section
        title="Tamanho do modal"
        eyebrow="Aparência"
        icon="i-lucide-maximize-2"
        :open="open.size"
        @toggle="open.size = !open.size"
      >
        <span class="section-lead">
          Largura do card. <strong>Pequeno</strong> pra enquetes binárias,
          <strong>Médio</strong> default, <strong>Grande</strong> pra perguntas com 6+ opções ou contexto extenso.
        </span>

        <div class="modal-size-grid">
          <button
            v-for="s in sizeChoices"
            :key="s.value"
            type="button"
            class="modal-size-card"
            :class="{ 'modal-size-card--active': form.modal_size === s.value }"
            :title="s.desc"
            @click="form.modal_size = s.value"
          >
            <div class="modal-size-card__mockup" :class="`modal-size-card__mockup--${s.value}`">
              <span class="modal-size-card__mockup-backdrop" />
              <span class="modal-size-card__mockup-card" />
            </div>
            <div class="modal-size-card__meta">
              <span class="modal-size-card__label">{{ s.label }}</span>
              <span class="modal-size-card__width">{{ s.width }}</span>
              <span class="modal-size-card__desc">{{ s.desc }}</span>
            </div>
            <span v-if="form.modal_size === s.value" class="modal-size-card__check">
              <UIcon name="i-lucide-check" class="size-3" />
            </span>
          </button>
        </div>
      </Section>

      <!-- =================== SECTION 4: COMPORTAMENTO =================== -->
      <Section
        title="Como o user vota"
        eyebrow="Comportamento"
        icon="i-lucide-settings-2"
        :open="open.behavior"
        @toggle="open.behavior = !open.behavior"
      >
        <div class="poll-behavior-grid">
          <button
            type="button"
            class="poll-behavior-card"
            :class="{ 'poll-behavior-card--active': !form.poll_multi_choice }"
            @click="form.poll_multi_choice = false"
          >
            <span class="poll-behavior-card__icon">
              <UIcon name="i-lucide-circle-dot" class="size-4" />
            </span>
            <div class="poll-behavior-card__meta">
              <span class="poll-behavior-card__label">Escolha única</span>
              <span class="poll-behavior-card__desc">User seleciona 1 opção. Padrão pra perguntas com resposta exclusiva.</span>
            </div>
            <span v-if="!form.poll_multi_choice" class="poll-behavior-card__check">
              <UIcon name="i-lucide-check" class="size-3" />
            </span>
          </button>
          <button
            type="button"
            class="poll-behavior-card"
            :class="{ 'poll-behavior-card--active': form.poll_multi_choice }"
            @click="form.poll_multi_choice = true"
          >
            <span class="poll-behavior-card__icon">
              <UIcon name="i-lucide-check-square" class="size-4" />
            </span>
            <div class="poll-behavior-card__meta">
              <span class="poll-behavior-card__label">Múltipla escolha</span>
              <span class="poll-behavior-card__desc">User pode marcar várias opções. Pra "quais ativos você tem", "quais formatos prefere".</span>
            </div>
            <span v-if="form.poll_multi_choice" class="poll-behavior-card__check">
              <UIcon name="i-lucide-check" class="size-3" />
            </span>
          </button>
        </div>

        <div class="poll-results-toggle">
          <div class="poll-results-toggle__head">
            <UIcon name="i-lucide-bar-chart-3" class="size-4 poll-results-toggle__icon" />
            <div class="poll-results-toggle__meta">
              <span class="poll-results-toggle__label">Mostrar resultados após votar</span>
              <span class="poll-results-toggle__desc">
                Quando ligado, o user vê o tally (% por opção) imediatamente após enviar o voto.
                Quando desligado, o modal só agradece e fecha, admin vê via analytics.
              </span>
            </div>
          </div>
          <label class="switch">
            <input v-model="form.poll_results_visible" type="checkbox" />
            <span class="switch__track" />
            <span class="switch__label">{{ form.poll_results_visible ? 'Visível' : 'Privado' }}</span>
          </label>
        </div>
      </Section>

      <!-- =================== SECTION 5: AUDIÊNCIA =================== -->
      <Section
        title="Quem vê"
        eyebrow="Audiência"
        icon="i-lucide-users"
        :open="open.audience"
        @toggle="open.audience = !open.audience"
      >
        <span class="section-lead">
          Base + escopo + refinamentos. Mesma audiência dos outros tipos.
        </span>

        <div class="aud-layer">
          <div class="aud-layer__head">
            <span class="aud-layer__step">01</span>
            <div>
              <span class="aud-layer__title">Base</span>
              <span class="aud-layer__sub">Quem responde à enquete?</span>
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

        <div class="aud-layer">
          <div class="aud-layer__head">
            <span class="aud-layer__step">02</span>
            <div>
              <span class="aud-layer__title">Escopo</span>
              <span class="aud-layer__sub">Vale pra todas as marcas ou só uma?</span>
            </div>
          </div>
          <div class="aud-scope-grid">
            <button
              type="button"
              class="aud-scope-card"
              :class="{ 'aud-scope-card--active': tenantMode === 'global' }"
              @click="setTenantMode('global')"
            >
              <span class="aud-scope-card__icon"><UIcon name="i-lucide-globe" class="size-4" /></span>
              <div class="aud-scope-card__meta">
                <span class="aud-scope-card__label">Global</span>
                <span class="aud-scope-card__desc">Todas as white-labels.</span>
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
              <span class="aud-scope-card__icon"><UIcon name="i-lucide-building-2" class="size-4" /></span>
              <div class="aud-scope-card__meta">
                <span class="aud-scope-card__label">Tenant específico</span>
                <span class="aud-scope-card__desc">Restringe a uma marca.</span>
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

        <Transition name="aud-expand">
          <div v-if="form.target_audience === 'specific'" class="aud-layer aud-layer--accent">
            <div class="aud-layer__head">
              <span class="aud-layer__step">03</span>
              <div>
                <span class="aud-layer__title">Alvo preciso</span>
                <span class="aud-layer__sub">Lista manual de respondentes.</span>
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
              Sem usuários selecionados, ninguém vai votar.
            </div>
          </div>
        </Transition>

        <Transition name="aud-expand">
          <div v-if="showRefinementFilters" class="aud-layer">
            <div class="aud-layer__head">
              <span class="aud-layer__step">03</span>
              <div>
                <span class="aud-layer__title">Refinamentos</span>
                <span class="aud-layer__sub">Filtros opcionais sobre a base.</span>
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

            <div class="aud-filter">
              <div class="aud-filter__head">
                <UIcon name="i-lucide-link" class="aud-filter__icon size-4" />
                <div class="aud-filter__meta">
                  <span class="aud-filter__title">Open Finance</span>
                  <span class="aud-filter__desc">Filtra por usuários com corretora conectada.</span>
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

            <div
              v-if="['authenticated', 'investors'].includes(form.target_audience)"
              class="aud-filter"
            >
              <div class="aud-filter__head">
                <UIcon name="i-lucide-coins" class="aud-filter__icon size-4" />
                <div class="aud-filter__meta">
                  <span class="aud-filter__title">AUM mínimo</span>
                  <span class="aud-filter__desc">Patrimônio mínimo do user.</span>
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
                  @click="form.target_min_aum = null"
                >
                  <UIcon name="i-lucide-x" class="size-3" />
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Section>

      <!-- =================== SECTION 6: VIGÊNCIA =================== -->
      <Section
        title="Vigência"
        eyebrow="Programação"
        icon="i-lucide-calendar"
        :open="open.schedule"
        @toggle="open.schedule = !open.schedule"
      >
        <span class="section-lead">
          Quando a enquete deve <strong>começar</strong> e <strong>terminar</strong>. Vazio = sem limite.
        </span>

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

        <div class="grid-2">
          <Field label="Início" hint="Vazio = imediato.">
            <div class="vig-input">
              <UIcon name="i-lucide-play" class="size-3.5 vig-input__icon" />
              <UInput v-model="form.starts_at" type="datetime-local" size="md" class="vig-input__field" />
              <button v-if="form.starts_at" type="button" class="vig-input__clear" @click="form.starts_at = null">
                <UIcon name="i-lucide-x" class="size-3" />
              </button>
            </div>
          </Field>
          <Field label="Fim" hint="Vazio = roda indefinidamente.">
            <div class="vig-input">
              <UIcon name="i-lucide-square" class="size-3.5 vig-input__icon" />
              <UInput v-model="form.ends_at" type="datetime-local" size="md" class="vig-input__field" />
              <button v-if="form.ends_at" type="button" class="vig-input__clear" @click="form.ends_at = null">
                <UIcon name="i-lucide-x" class="size-3" />
              </button>
            </div>
          </Field>
        </div>

        <Field label="Prioridade" hint="Quando vários popups estão ativos pra mesma audiência, o de maior prioridade aparece.">
          <div class="vig-priority">
            <div class="vig-priority__row">
              <input
                v-model.number="priorityValue"
                type="range" min="0" max="1000" step="10"
                class="vig-priority__slider"
                :style="{ '--pct': `${(priorityValue / 1000) * 100}%` }"
              />
              <span class="vig-priority__value" :data-tier="priorityTier.kind">{{ priorityValue }}</span>
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

    <!-- =================== RIGHT: PREVIEW + AUDIENCE + ANALYTICS =================== -->
    <aside class="poll-editor__aside">
      <div class="preview-card">
        <header class="preview-card__head">
          <span class="preview-card__eyebrow">Preview ao vivo</span>
          <span class="preview-card__hint">{{ sizeHint }} · {{ (form.poll_options || []).length }} opções</span>
        </header>

        <div class="preview-stage preview-stage--modal">
          <div class="prev-modal-stage">
            <span class="prev-modal-stage__backdrop" />
            <div class="prev-modal-stage__viewport">
              <span class="prev-modal-stage__line prev-modal-stage__line--w70" />
              <span class="prev-modal-stage__line prev-modal-stage__line--w50" />
              <span class="prev-modal-stage__line prev-modal-stage__line--w60" />
              <span class="prev-modal-stage__line prev-modal-stage__line--w40" />
            </div>

            <div class="prev-poll-card" :class="`prev-poll-card--${form.modal_size || 'md'}`">
              <img
                v-if="form.image_url && !imgErrored"
                :src="form.image_url"
                alt=""
                class="prev-poll-card__image"
                @error="onImgError"
              />
              <div class="prev-poll-card__inner">
                <header class="prev-poll-card__head">
                  <UIcon
                    v-if="form.icon"
                    :name="form.icon"
                    class="prev-poll-card__icon size-5"
                  />
                  <h3 class="prev-poll-card__title">{{ form.title || '(Pergunta da enquete)' }}</h3>
                </header>
                <div v-if="form.body" class="prev-poll-card__body" v-html="renderedBody" />

                <div class="prev-poll-card__opts">
                  <div
                    v-for="(opt, i) in (form.poll_options || [])"
                    :key="opt.id"
                    class="prev-poll-opt"
                    :class="{ 'prev-poll-opt--selected': i === 0 }"
                  >
                    <span
                      class="prev-poll-opt__check"
                      :class="{ 'prev-poll-opt__check--multi': form.poll_multi_choice }"
                    >
                      <UIcon v-if="i === 0" name="i-lucide-check" class="size-3" />
                    </span>
                    <span class="prev-poll-opt__label">
                      {{ opt.label || `(Opção ${i + 1} sem texto)` }}
                    </span>
                  </div>
                  <div v-if="!(form.poll_options || []).length" class="prev-poll-card__empty">
                    <UIcon name="i-lucide-list-plus" class="size-4" />
                    Adicione pelo menos 2 opções na seção acima
                  </div>
                </div>

                <span class="prev-poll-card__btn">
                  <UIcon name="i-lucide-check" class="size-3.5" />
                  Votar
                </span>
                <span v-if="form.poll_results_visible" class="prev-poll-card__hint">
                  Resultados aparecem depois do voto
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdminComunicacoesAudiencePreview
        :type="form.type"
        :tenant-id="form.tenant_id ?? null"
        :audience="form.target_audience as any"
        :user-ids="selectedUserIds"
        :min-aum="form.target_min_aum ?? null"
        :has-connections="form.target_has_connections ?? null"
      />

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
            <span class="analytics-stat__label">Votos</span>
            <span class="analytics-stat__value">{{ analytics.votes ?? 0 }}</span>
            <span class="analytics-stat__sub">{{ analytics.unique_voters ?? 0 }} pessoas</span>
          </div>
          <div class="analytics-stat">
            <span class="analytics-stat__label">Taxa de voto</span>
            <span class="analytics-stat__value">{{ voteRate }}<small>%</small></span>
            <span class="analytics-stat__sub">votos / impressões</span>
          </div>
          <div class="analytics-stat">
            <span class="analytics-stat__label">Dispensas</span>
            <span class="analytics-stat__value">{{ analytics.dismissals }}</span>
            <span class="analytics-stat__sub">fecharam sem votar</span>
          </div>
        </div>

        <!-- Tally por opcao (se houver dados) -->
        <div v-if="pollResults.length" class="poll-tally">
          <span class="poll-tally__label">Distribuição dos votos</span>
          <div v-for="r in pollResults" :key="r.id" class="poll-tally__row">
            <span class="poll-tally__opt">{{ r.label }}</span>
            <span class="poll-tally__bar">
              <span class="poll-tally__fill" :style="{ width: r.pct + '%' }" />
            </span>
            <span class="poll-tally__pct">{{ r.pct }}%</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, reactive, ref, resolveComponent, watch } from 'vue'
import type {
  CommunicationAdminPayload,
  CommunicationAnalytics,
  CommunicationStatus,
  CommunicationAudience,
  PollOption,
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

const open = reactive({
  content: true,
  options: true,
  size: false,
  behavior: true,
  audience: true,
  schedule: false,
})

// Auto-set placement = 'modal' (poll usa o ModalManager pra renderizar).
watch(() => props.form.placement, (next) => {
  if (next !== 'modal') props.form.placement = 'modal'
}, { immediate: true })

// Garantir 2 opcoes iniciais se vier vazio (poll precisa minimo de 2).
watch(() => props.form.poll_options, (opts) => {
  if (!opts || !Array.isArray(opts) || opts.length < 2) {
    props.form.poll_options = [
      { id: makeOptionId(1), label: '' },
      { id: makeOptionId(2), label: '' },
    ]
  }
}, { immediate: true })

// =================================================================
// Choices
// =================================================================
const statusChoices: { value: CommunicationStatus; label: string; help: string }[] = [
  { value: 'draft', label: 'Rascunho', help: 'Não aparece pra ninguém. Use enquanto edita.' },
  { value: 'active', label: 'Ativo', help: 'Enquete entra em rotação pra audiência configurada.' },
  { value: 'paused', label: 'Pausado', help: 'Removido temporariamente (sem perder votos coletados).' },
]

const sizeChoices: { value: 'sm' | 'md' | 'lg'; label: string; width: string; desc: string }[] = [
  { value: 'sm', label: 'Pequeno', width: '380px',  desc: 'Pra enquetes binárias (sim/não).' },
  { value: 'md', label: 'Médio',   width: '520px',  desc: 'Default. 2-5 opções confortavelmente.' },
  { value: 'lg', label: 'Grande',  width: '720px',  desc: 'Pra 6+ opções ou contexto extenso.' },
]

const audienceChoices: { value: CommunicationAudience; label: string; icon: string; desc: string }[] = [
  { value: 'all', label: 'Todos', icon: 'i-lucide-users', desc: 'Logados + visitantes' },
  { value: 'authenticated', label: 'Logados', icon: 'i-lucide-user-check', desc: 'Só usuários cadastrados' },
  { value: 'guests', label: 'Visitantes', icon: 'i-lucide-user', desc: 'Não autenticados' },
  { value: 'investors', label: 'Investidores', icon: 'i-lucide-trending-up', desc: 'role = investor' },
  { value: 'advisors', label: 'Assessores', icon: 'i-lucide-briefcase', desc: 'role = advisor' },
  { value: 'admins', label: 'Admins', icon: 'i-lucide-shield', desc: 'Só staff' },
  { value: 'specific', label: 'Específicos', icon: 'i-lucide-target', desc: 'Lista manual' },
]

// =================================================================
// Body rendering + image error
// =================================================================
const renderedBody = computed(() => sanitizeHtml(props.form.body || '', 'basic'))
const imgErrored = ref(false)
function onImgError(e: Event) {
  imgErrored.value = true
  const img = e.target as HTMLImageElement
  if (img) img.style.display = 'none'
}
watch(() => props.form.image_url, () => { imgErrored.value = false })

// =================================================================
// Poll options helpers
// =================================================================
function makeOptionId(seq: number): string {
  return `opt-${seq}-${Math.random().toString(36).slice(2, 6)}`
}

function addOption(): void {
  const opts = props.form.poll_options || []
  if (opts.length >= 10) return
  if (!Array.isArray(props.form.poll_options)) props.form.poll_options = []
  props.form.poll_options!.push({ id: makeOptionId(opts.length + 1), label: '' } as PollOption)
}

function removeOption(i: number): void {
  if (!props.form.poll_options) return
  if (props.form.poll_options.length <= 2) return
  props.form.poll_options.splice(i, 1)
}

const optionsValidation = computed<string | null>(() => {
  const opts = props.form.poll_options || []
  if (opts.length < 2) return 'Mínimo 2 opções pra enquete funcionar.'
  const empty = opts.filter((o) => !o.label || !o.label.trim()).length
  if (empty > 0) return `${empty} ${empty === 1 ? 'opção sem texto' : 'opções sem texto'}, preencha antes de publicar.`
  // Detecta duplicatas (case-insensitive)
  const labels = opts.map((o) => (o.label || '').trim().toLowerCase())
  const dupes = labels.filter((l, i) => l && labels.indexOf(l) !== i)
  if (dupes.length) return 'Há opções duplicadas, use textos únicos pra cada uma.'
  return null
})

// =================================================================
// Tally results (se analytics tem poll_results)
// =================================================================
const pollResults = computed(() => {
  const res = (props.analytics as any)?.poll_results
  if (!res || typeof res !== 'object') return []
  const opts = props.form.poll_options || []
  const total = Object.values(res).reduce((s: number, v: any) => s + Number(v || 0), 0)
  if (!total) return []
  return opts.map((o) => ({
    id: o.id,
    label: o.label || '(sem texto)',
    pct: Math.round(((Number(res[o.id] || 0) / total) * 100)),
  }))
})

const voteRate = computed<string>(() => {
  if (!props.analytics) return '0'
  const imp = props.analytics.impressions || 0
  if (!imp) return '0'
  const v = (props.analytics as any).votes || 0
  return ((v / imp) * 100).toFixed(1)
})

const sizeHint = computed(() => {
  const s = sizeChoices.find(c => c.value === (props.form.modal_size || 'md'))
  return s ? `${s.label} (${s.width})` : 'Médio'
})

// =================================================================
// Audience helpers (mesma pattern dos outros editors)
// =================================================================
const tenantMode = ref<'global' | 'specific'>(props.form.tenant_id ? 'specific' : 'global')
function setTenantMode(m: 'global' | 'specific') {
  tenantMode.value = m
  if (m === 'global') props.form.tenant_id = null
}
watch(() => props.form.tenant_id, (next) => {
  if (next && tenantMode.value !== 'specific') tenantMode.value = 'specific'
})

const showRefinementFilters = computed(() =>
  ['authenticated', 'investors', 'advisors'].includes(props.form.target_audience as string),
)
const hasActiveRefinements = computed(() =>
  props.form.target_has_connections !== null
  || (props.form.target_min_aum !== null && props.form.target_min_aum !== undefined),
)
function clearRefinements() {
  props.form.target_has_connections = null
  props.form.target_min_aum = null
}
const connectionsOptions: { value: boolean | null; label: string; icon?: string }[] = [
  { value: null, label: 'Qualquer um' },
  { value: true, label: 'Conectados', icon: 'i-lucide-link' },
  { value: false, label: 'Sem conexão', icon: 'i-lucide-unlink' },
]

const aumInputEl = ref<HTMLInputElement | null>(null)
const aumDisplay = computed<string>(() => {
  const v = props.form.target_min_aum
  if (v === null || v === undefined || Number.isNaN(v)) return ''
  return Math.round(v).toLocaleString('pt-BR')
})
function parseAumString(s: string): number | null {
  const digits = (s || '').replace(/\D/g, '')
  if (!digits) return null
  return Number(digits)
}
function onAumInput(e: Event): void {
  const input = e.target as HTMLInputElement
  const rawTyped = input.value
  const oldCursor = input.selectionStart ?? rawTyped.length
  const digitsBeforeCursor = rawTyped.slice(0, oldCursor).replace(/\D/g, '').length
  props.form.target_min_aum = parseAumString(rawTyped)
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
function onAumPaste(e: ClipboardEvent): void {
  const text = e.clipboardData?.getData('text') ?? ''
  let parsed: number | null = null
  const t = text.trim().toLowerCase()
  const abbrev = t.match(/^([\d.,]+)\s*([kmb])\b/i)
  if (abbrev) {
    const numStr = abbrev[1].replace(/\./g, '').replace(',', '.')
    const num = Number(numStr)
    const mult = abbrev[2].toLowerCase() === 'b' ? 1_000_000_000
      : abbrev[2].toLowerCase() === 'm' ? 1_000_000 : 1_000
    if (Number.isFinite(num)) parsed = Math.round(num * mult)
  } else {
    parsed = parseAumString(t.split(',')[0])
  }
  props.form.target_min_aum = parsed
  nextTick(() => {
    if (!aumInputEl.value) return
    const len = aumInputEl.value.value.length
    aumInputEl.value.setSelectionRange(len, len)
  })
}

// =================================================================
// Vigência (mesma pattern)
// =================================================================
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
const durationLabel = computed<string>(() => {
  const now = Date.now()
  const start = props.form.starts_at ? new Date(props.form.starts_at).getTime() : null
  const end = props.form.ends_at ? new Date(props.form.ends_at).getTime() : null
  if (!start && !end) return 'Roda indefinidamente'
  if (end && end < now) return `Expirou há ${humanizeDuration(now - end)}`
  if (start && start > now) return `Começa em ${humanizeDuration(start - now)}`
  if (end) return `Termina em ${humanizeDuration(end - now)}`
  return 'Sem fim definido'
})
function humanizeDuration(ms: number): string {
  const sec = Math.floor(ms / 1000), min = Math.floor(sec / 60), hr = Math.floor(min / 60), day = Math.floor(hr / 24)
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
    return d.toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: sameYear ? undefined : 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

type SchedPresetId = 'now-24h' | 'now-7d' | 'now-30d' | 'tomorrow' | 'unlimited'
interface SchedPreset { id: SchedPresetId; label: string; icon: string; desc: string }
const schedulePresets: SchedPreset[] = [
  { id: 'now-24h', label: 'Próximas 24h', icon: 'i-lucide-clock', desc: 'Inicia agora, termina em 24 horas' },
  { id: 'now-7d', label: '7 dias', icon: 'i-lucide-calendar', desc: 'Inicia agora, termina em 7 dias' },
  { id: 'now-30d', label: '30 dias', icon: 'i-lucide-calendar-days', desc: 'Inicia agora, termina em 30 dias' },
  { id: 'tomorrow', label: 'Amanhã 9h', icon: 'i-lucide-sunrise', desc: 'Programa pra começar amanhã às 9h' },
  { id: 'unlimited', label: 'Indefinido', icon: 'i-lucide-infinity', desc: 'Roda indefinidamente até admin pausar' },
]
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
const activePreset = computed<SchedPresetId | null>(() => {
  const start = props.form.starts_at ? new Date(props.form.starts_at).getTime() : null
  const end = props.form.ends_at ? new Date(props.form.ends_at).getTime() : null
  if (!start && !end) return 'unlimited'
  if (start && !end) return null
  if (start && end) {
    const dur = end - start
    const day = 24 * 60 * 60 * 1000
    const startMatchNow = Math.abs(start - Date.now()) < 10 * 60 * 1000
    if (!startMatchNow) return null
    if (Math.abs(dur - day) < 60 * 60 * 1000) return 'now-24h'
    if (Math.abs(dur - 7 * day) < 60 * 60 * 1000) return 'now-7d'
    if (Math.abs(dur - 30 * day) < 60 * 60 * 1000) return 'now-30d'
  }
  return null
})

const priorityValue = computed<number>({
  get: () => props.form.priority ?? 0,
  set: (v) => { props.form.priority = v },
})
interface PriorityPreset { value: number; label: string; kind: 'low' | 'medium' | 'high' | 'urgent'; desc: string }
const priorityPresets: PriorityPreset[] = [
  { value: 0, kind: 'low', label: 'Baixa', desc: 'Cede vez pra outros popups' },
  { value: 100, kind: 'medium', label: 'Média', desc: 'Default' },
  { value: 500, kind: 'high', label: 'Alta', desc: 'Sobre quase todos' },
  { value: 1000, kind: 'urgent', label: 'Urgente', desc: 'Override total' },
]
const priorityTier = computed<PriorityPreset>(() => {
  const v = priorityValue.value
  if (v >= 800) return priorityPresets[3]
  if (v >= 250) return priorityPresets[2]
  if (v >= 50) return priorityPresets[1]
  return priorityPresets[0]
})

// =================================================================
// Sub-components Section + Field (mesma pattern dos outros editors)
// =================================================================
const Section = defineComponent({
  props: { title: String, eyebrow: String, icon: String, open: Boolean },
  emits: ['toggle'],
  setup(props, { slots, emit }) {
    return () => h('section', { class: ['form-section', props.open ? 'form-section--open' : ''] }, [
      h('button', { type: 'button', class: 'form-section__head', onClick: () => emit('toggle') }, [
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
      props.open ? h('div', { class: 'form-section__body' }, slots.default?.()) : null,
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

<style scoped src="./_editor-shared.css"></style>

<style scoped>
/* =========================================================
   Layout container (mesmo do EditorModal)
   ========================================================= */
.poll-editor {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding: 24px;
  align-items: start;
}
@media (min-width: 1280px) {
  .poll-editor {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 32px;
  }
}
.poll-editor__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}
.poll-editor__aside {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 80px;
}

/* =========================================================
   Poll-specific: options builder
   ========================================================= */
.poll-options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.poll-option-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.poll-option-row__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.poll-option-row__input { flex: 1; }
.poll-option-row__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  border-radius: 6px;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
  flex-shrink: 0;
}
.poll-option-row__remove:hover {
  background: color-mix(in srgb, var(--brand-negative) 12%, transparent);
  color: var(--brand-negative);
  border-color: color-mix(in srgb, var(--brand-negative) 35%, transparent);
}
.poll-option-row__add {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 7px;
  border: 1px dashed color-mix(in srgb, var(--brand-text) 18%, transparent);
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
  margin-top: 2px;
}
.poll-option-row__add:hover {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  color: var(--brand-primary);
}

.poll-options-warn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-warning) 12%, transparent);
  color: var(--brand-warning);
  font-size: 11.5px;
  margin-top: 8px;
}

/* =========================================================
   Poll behavior cards (single vs multi)
   ========================================================= */
.poll-behavior-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 14px;
}
@media (min-width: 640px) {
  .poll-behavior-grid { grid-template-columns: 1fr 1fr; }
}
.poll-behavior-card {
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
  transition: border-color 150ms, background 150ms;
}
.poll-behavior-card:hover {
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.poll-behavior-card--active {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
}
.poll-behavior-card__icon {
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
.poll-behavior-card--active .poll-behavior-card__icon {
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary);
}
.poll-behavior-card__meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.poll-behavior-card__label {
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--brand-text);
}
.poll-behavior-card__desc {
  font-size: 11.5px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.poll-behavior-card__check {
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

/* Results visibility toggle row */
.poll-results-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.poll-results-toggle__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.poll-results-toggle__icon {
  margin-top: 2px;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  flex-shrink: 0;
}
.poll-results-toggle__meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}
.poll-results-toggle__label {
  font-family: var(--brand-font);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--brand-text);
}
.poll-results-toggle__desc {
  font-size: 11px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

/* =========================================================
   Preview (mesma estrutura do EditorModal mas com poll opts)
   ========================================================= */
.preview-stage {
  padding: 14px;
  background: rgba(0, 0, 0, 0.25);
  min-height: 320px;
}
.preview-stage--modal { padding: 0; }

.prev-modal-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  min-height: 360px;
  overflow: hidden;
  background:
    radial-gradient(circle at 30% 0%, color-mix(in srgb, var(--brand-primary) 8%, transparent) 0%, transparent 50%),
    rgba(0, 0, 0, 0.32);
}
.prev-modal-stage__viewport {
  position: absolute;
  inset: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.prev-modal-stage__line {
  height: 6px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--brand-text) 7%, transparent);
}
.prev-modal-stage__line--w70 { width: 70%; }
.prev-modal-stage__line--w60 { width: 60%; }
.prev-modal-stage__line--w50 { width: 50%; }
.prev-modal-stage__line--w40 { width: 40%; }
.prev-modal-stage__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 1;
}

.prev-poll-card {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: var(--brand-surface, var(--brand-background));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
  box-shadow: 0 24px 48px -16px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  width: 100%;
  transition: max-width 200ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.prev-poll-card--sm { max-width: 70%; }
.prev-poll-card--md { max-width: 82%; }
.prev-poll-card--lg { max-width: 94%; }
.prev-poll-card__image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}
.prev-poll-card__inner {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px 16px;
}
.prev-poll-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.prev-poll-card__icon { color: var(--brand-primary); }
.prev-poll-card__title {
  flex: 1;
  margin: 0;
  font-family: var(--brand-font);
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--brand-text);
}
.prev-poll-card__body {
  font-size: 11.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}
.prev-poll-card__body :deep(p) { margin: 0 0 4px; }
.prev-poll-card__body :deep(p:last-child) { margin-bottom: 0; }
.prev-poll-card__body :deep(strong) { font-weight: 600; color: var(--brand-text); }

.prev-poll-card__opts {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}
.prev-poll-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 7px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 80%, transparent);
}
.prev-poll-opt--selected {
  border-color: color-mix(in srgb, var(--brand-primary) 45%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
}
.prev-poll-opt__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 1.5px solid color-mix(in srgb, var(--brand-text) 25%, transparent);
  flex-shrink: 0;
  color: var(--text-on-primary, #1a0a2e);
}
.prev-poll-opt__check--multi {
  border-radius: 4px;
}
.prev-poll-opt--selected .prev-poll-opt__check {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
}
.prev-poll-opt__label {
  font-family: var(--brand-font);
  letter-spacing: -0.005em;
}
.prev-poll-card__empty {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px;
  border-radius: 7px;
  border: 1px dashed color-mix(in srgb, var(--brand-text) 14%, transparent);
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  font-size: 11.5px;
  font-style: italic;
}

.prev-poll-card__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 8px 14px;
  border-radius: 9px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  font-family: var(--brand-font);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  margin-top: 2px;
}
.prev-poll-card__hint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}

/* Tally (no analytics card) */
.poll-tally {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px 16px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.poll-tally__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  margin-bottom: 2px;
}
.poll-tally__row {
  display: grid;
  grid-template-columns: 1fr 60px 36px;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
}
.poll-tally__opt {
  color: color-mix(in srgb, var(--brand-text) 80%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.poll-tally__bar {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  overflow: hidden;
}
.poll-tally__fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--brand-primary);
}
.poll-tally__pct {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--brand-text);
  text-align: right;
}
</style>
