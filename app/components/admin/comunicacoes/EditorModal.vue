<!--
  EditorModal — editor dedicado para comunicações do tipo `modal`.

  Diferente do CTA (card contextual em pagina-alvo) e do banner
  (faixa fina sticky no topo), o modal e um popup central com
  backdrop. Aparece UMA vez por sessao (sessionStorage gate via
  ModalManager) e bloqueia o foco ate o user fechar/clicar.

  Caracteristicas chave:
    - placement e SEMPRE 'modal' (auto-setado no save). Nao tem
      picker, nao tem multi-placement — modal e um lugar so:
      o centro da tela.
    - modal_size (sm/md/lg) controla largura do card. Cada tamanho
      tem um caso de uso diferente: sm = announcement curto, md =
      default editorial, lg = onboarding/promocao com imagem grande.
    - Pode ter imagem cover acima do titulo.
    - Body usa TipTap level=basic (mesmo do announcement).
    - CTA opcional (link_url + link_label) renderiza como botao
      primario abaixo do body.
    - Frequency: 1x/session. Quando user dismissa, fica invisivel
      ate ele fechar a aba/janela.

  Sections:
    1. Mensagem        — title + body + icon + image cover
    2. Aparencia       — modal_size picker (sm/md/lg)
    3. Call-to-action  — link_url + link_label (opcionais)
    4. Comportamento   — dismissible toggle
    5. Audiencia       — base + escopo + refinamentos
    6. Vigencia        — timeline + presets + priority
-->
<template>
  <div class="modal-editor">
    <!-- LEFT: form -->
    <form class="modal-editor__form" @submit.prevent="$emit('save')">
      <!-- =================== STATUS ROW =================== -->
      <div class="status-row">
        <div class="status-row__intro">
          <span class="status-row__eyebrow">Status atual</span>
          <span class="status-row__hint">
            Modal aparece <strong>1× por sessão</strong>. Quando user fecha, só volta na próxima sessão.
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

      <!-- =================== SECTION 1: MENSAGEM =================== -->
      <Section
        title="Mensagem"
        eyebrow="Conteúdo"
        icon="i-lucide-pen-line"
        :open="open.content"
        @toggle="open.content = !open.content"
      >
        <Field label="Título *" hint="Manchete do modal. Curto e direto.">
          <UInput
            v-model="form.title"
            placeholder='Ex.: "Ative sua conta MAX"'
            size="md"
            required
          />
          <span class="field-counter" :class="{ 'field-counter--warn': (form.title || '').length > 80 }">
            {{ (form.title || '').length }}/80
          </span>
        </Field>

        <Field
          label="Corpo"
          hint="Texto principal — 2 a 5 linhas funciona bem. Suporta listas, citação, headings 3/4 e formatação inline."
        >
          <AdminFormsRichTextField
            v-model="form.body"
            level="basic"
            :max-length="2000"
            placeholder="Explique a oferta, benefício ou anúncio. Use parágrafos curtos."
          />
        </Field>

        <div class="grid-2">
          <Field label="Ícone" hint="Pictograma ao lado do título (opcional).">
            <AdminFormsIconPicker v-model="form.icon" />
          </Field>
          <Field label="Imagem cover (opcional)" hint="Aparece no topo do modal. Use 16:9 (banner widescreen).">
            <AdminFormsImageUploadField v-model="form.image_url" :alt="form.title || ''" />
          </Field>
        </div>
      </Section>

      <!-- =================== SECTION 2: APARÊNCIA =================== -->
      <Section
        title="Tamanho do modal"
        eyebrow="Aparência"
        icon="i-lucide-maximize-2"
        :open="open.size"
        @toggle="open.size = !open.size"
      >
        <span class="section-lead">
          Largura do card. <strong>Pequeno</strong> pra anúncios curtos,
          <strong>Médio</strong> default editorial, <strong>Grande</strong> pra onboarding/promo com imagem.
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

      <!-- =================== SECTION 3: CTA =================== -->
      <Section
        title="Botão de ação"
        eyebrow="Call-to-action"
        icon="i-lucide-mouse-pointer-click"
        :open="open.cta"
        @toggle="open.cta = !open.cta"
      >
        <span class="section-lead">
          Botão primário abaixo do corpo. Opcional — modais sem CTA viram avisos puros (só fecham).
        </span>

        <Field label="Link de destino" hint="URL absoluta ou path interno.">
          <div class="cta-url-input">
            <UIcon :name="linkType.icon" class="size-4 cta-url-input__icon" :data-type="linkType.kind" />
            <UInput
              v-model="form.link_url"
              placeholder="/raio-x, /pricing, https://..."
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

        <Field label="Texto do botão" hint="Imperativo curto. Vazio = mostra 'Ir agora'.">
          <UInput
            v-model="form.link_label"
            placeholder='Ex.: "Ativar agora", "Ver detalhes"'
            size="md"
          />
        </Field>
      </Section>

      <!-- =================== SECTION 4: COMPORTAMENTO =================== -->
      <Section
        title="Como o user fecha"
        eyebrow="Comportamento"
        icon="i-lucide-settings-2"
        :open="open.behavior"
        @toggle="open.behavior = !open.behavior"
      >
        <span class="section-lead">
          Modal sempre aparece <strong>1× por sessão</strong>. Esse toggle controla se o user pode fechar manualmente.
        </span>

        <div class="modal-behavior-grid">
          <button
            type="button"
            class="modal-behavior-card"
            :class="{ 'modal-behavior-card--active': form.dismissible }"
            @click="form.dismissible = true"
          >
            <span class="modal-behavior-card__icon">
              <UIcon name="i-lucide-x" class="size-4" />
            </span>
            <div class="modal-behavior-card__meta">
              <span class="modal-behavior-card__label">Dispensável</span>
              <span class="modal-behavior-card__desc">
                Mostra X no canto + clique no backdrop fecha. Recomendado pra promo, anúncio.
              </span>
            </div>
            <span v-if="form.dismissible" class="modal-behavior-card__check">
              <UIcon name="i-lucide-check" class="size-3" />
            </span>
          </button>
          <button
            type="button"
            class="modal-behavior-card"
            :class="{ 'modal-behavior-card--active': !form.dismissible }"
            @click="form.dismissible = false"
          >
            <span class="modal-behavior-card__icon">
              <UIcon name="i-lucide-lock" class="size-4" />
            </span>
            <div class="modal-behavior-card__meta">
              <span class="modal-behavior-card__label">Obrigatório</span>
              <span class="modal-behavior-card__desc">
                Sem X. Só fecha clicando no botão CTA. Pra termos, atualizações importantes.
              </span>
            </div>
            <span v-if="!form.dismissible" class="modal-behavior-card__check">
              <UIcon name="i-lucide-check" class="size-3" />
            </span>
          </button>
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
          Defina quem recebe o modal. Cada camada refina o conjunto: <strong>base</strong> →
          <strong>escopo</strong> → <strong>refinamentos</strong>.
        </span>

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
                <span class="aud-layer__sub">Lista manual de usuários que recebem o modal.</span>
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
              Sem usuários selecionados, ninguém vai ver esse modal.
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
                  <span class="aud-filter__desc">Filtra por usuários com corretora conectada via Pluggy.</span>
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

      <!-- =================== SECTION 6: VIGÊNCIA =================== -->
      <Section
        title="Vigência"
        eyebrow="Programação"
        icon="i-lucide-calendar"
        :open="open.schedule"
        @toggle="open.schedule = !open.schedule"
      >
        <span class="section-lead">
          Quando o modal deve <strong>começar</strong> e <strong>terminar</strong>. Vazio = sem limite.
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

        <Field label="Prioridade" hint="Quando vários modais estão ativos pra mesma audiência, o de maior prioridade aparece.">
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
    <aside class="modal-editor__aside">
      <!-- PREVIEW: simulação de viewport com modal centralizado -->
      <div class="preview-card">
        <header class="preview-card__head">
          <span class="preview-card__eyebrow">Preview ao vivo</span>
          <span class="preview-card__hint">{{ sizeHint }}</span>
        </header>

        <div class="preview-stage preview-stage--modal">
          <!-- Backdrop simulado -->
          <div class="prev-modal-stage">
            <span class="prev-modal-stage__backdrop" />
            <div class="prev-modal-stage__viewport">
              <!-- Linhas placeholder de "página por baixo" -->
              <span class="prev-modal-stage__line prev-modal-stage__line--w70" />
              <span class="prev-modal-stage__line prev-modal-stage__line--w50" />
              <span class="prev-modal-stage__line prev-modal-stage__line--w60" />
              <span class="prev-modal-stage__line prev-modal-stage__line--w40" />
            </div>

            <!-- Modal card -->
            <div class="prev-modal-card" :class="`prev-modal-card--${form.modal_size || 'md'}`">
              <button v-if="form.dismissible" type="button" class="prev-modal-card__close" tabindex="-1">
                <UIcon name="i-lucide-x" class="size-3" />
              </button>
              <img
                v-if="form.image_url && !imgErrored"
                :src="form.image_url"
                alt=""
                class="prev-modal-card__image"
                @error="onImgError"
              />
              <div class="prev-modal-card__inner">
                <header class="prev-modal-card__head">
                  <UIcon
                    v-if="form.icon"
                    :name="form.icon"
                    class="prev-modal-card__icon size-5"
                  />
                  <h3 class="prev-modal-card__title">{{ form.title || '(Título do modal)' }}</h3>
                </header>
                <div v-if="form.body" class="prev-modal-card__body" v-html="renderedBody" />
                <span v-if="form.link_url || form.link_label" class="prev-modal-card__btn">
                  <UIcon name="i-lucide-sparkles" class="size-3.5" />
                  {{ form.link_label || 'Ir agora' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AUDIENCE PREVIEW (live count) -->
      <AdminComunicacoesAudiencePreview
        :type="form.type"
        :tenant-id="form.tenant_id ?? null"
        :audience="form.target_audience as any"
        :user-ids="selectedUserIds"
        :min-aum="form.target_min_aum ?? null"
        :has-connections="form.target_has_connections ?? null"
      />

      <!-- ANALYTICS -->
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
import { computed, defineComponent, h, nextTick, reactive, ref, resolveComponent, watch } from 'vue'
import type {
  CommunicationAdminPayload,
  CommunicationAnalytics,
  CommunicationStatus,
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

const open = reactive({
  content: true,
  size: true,
  cta: true,
  behavior: true,
  audience: true,
  schedule: false,
})

// Modal sempre tem placement='modal'. Auto-set se vazio (compat com
// rascunhos criados pelo type-picker antes do editor dedicado).
watch(() => props.form.placement, (next) => {
  if (next !== 'modal') props.form.placement = 'modal'
}, { immediate: true })

// =================================================================
// Choices
// =================================================================
const statusChoices: { value: CommunicationStatus; label: string; help: string }[] = [
  { value: 'draft', label: 'Rascunho', help: 'Não aparece pra ninguém. Use enquanto edita.' },
  { value: 'active', label: 'Ativo', help: 'Modal entra em rotação pra audiência configurada.' },
  { value: 'paused', label: 'Pausado', help: 'Removido temporariamente (sem perder analytics).' },
]

const sizeChoices: { value: 'sm' | 'md' | 'lg'; label: string; width: string; desc: string }[] = [
  { value: 'sm', label: 'Pequeno', width: '380px',  desc: 'Compacto. Pra avisos curtos.' },
  { value: 'md', label: 'Médio',   width: '520px',  desc: 'Default. Editorial padrão.' },
  { value: 'lg', label: 'Grande',  width: '720px',  desc: 'Imersivo. Pra onboarding/promo.' },
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
// CTA helpers (link detector)
// =================================================================
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

const urlSuggestions = [
  { value: '/raio-x', label: '/raio-x', icon: 'i-lucide-scan-line', desc: 'Raio-X da carteira' },
  { value: '/pricing', label: '/pricing', icon: 'i-lucide-credit-card', desc: 'Página de planos' },
  { value: '/help', label: '/help', icon: 'i-lucide-message-circle', desc: 'Chat com IA' },
  { value: '/wallet', label: '/wallet', icon: 'i-lucide-wallet', desc: 'Carteira do user' },
  { value: 'https://', label: 'https://', icon: 'i-lucide-external-link', desc: 'URL externa' },
]

const sizeHint = computed(() => {
  const s = sizeChoices.find(c => c.value === (props.form.modal_size || 'md'))
  return s ? `${s.label} (${s.width})` : 'Médio'
})

// =================================================================
// Audience helpers
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

function formatBRL(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
  if (n >= 1_000) return `${(n / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`
  return n.toLocaleString('pt-BR')
}

// =================================================================
// Currency input (AUM)
// =================================================================
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
    const beforeDecimal = t.split(',')[0]
    parsed = parseAumString(beforeDecimal)
  }
  props.form.target_min_aum = parsed
  nextTick(() => {
    if (!aumInputEl.value) return
    const len = aumInputEl.value.value.length
    aumInputEl.value.setSelectionRange(len, len)
  })
}

// =================================================================
// Vigência (status + duration + presets + priority)
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
      day: '2-digit', month: 'short',
      year: sameYear ? undefined : 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
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
  { value: 0, kind: 'low', label: 'Baixa', desc: 'Cede vez pra outros modais' },
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

<style scoped>
/* =========================================================
   Layout: 2 colunas (desktop) ou stacked (mobile).
   Mesmo grid do EditorBanner/Announcement/CTA.
   ========================================================= */
.modal-editor {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding: 24px;
  align-items: start;
}
@media (min-width: 1280px) {
  .modal-editor {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 32px;
  }
}
.modal-editor__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}
.modal-editor__aside {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 80px;
}

/* =========================================================
   Status row
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
.status-row__intro { display: flex; flex-direction: column; gap: 2px; }
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
.status-row__hint strong { color: var(--brand-text); font-weight: 600; }
.status-row__chips { display: flex; gap: 4px; }
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
  width: 7px; height: 7px; border-radius: 999px; background: currentColor;
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
:deep(.field__control) { position: relative; }
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
.field-counter--warn { color: var(--brand-warning); }

.section-lead {
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  line-height: 1.5;
}
.section-lead strong {
  color: var(--brand-text);
  font-weight: 600;
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
   Modal-specific: image input
   ========================================================= */
.modal-image-input {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 6px 0 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  transition: border-color 150ms, box-shadow 150ms;
}
.modal-image-input:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.modal-image-input__icon { color: color-mix(in srgb, var(--brand-text) 50%, transparent); flex-shrink: 0; }
.modal-image-input__field { flex: 1; }
.modal-image-input__field :deep(input) {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  padding-left: 0 !important;
}
.modal-image-input__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.modal-image-input__clear:hover {
  background: color-mix(in srgb, var(--brand-negative) 12%, transparent);
  color: var(--brand-negative);
}

/* =========================================================
   Modal size picker (sm / md / lg) — cada card mostra um
   mini-mockup com proporções reais da largura final.
   ========================================================= */
.modal-size-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
@media (min-width: 640px) {
  .modal-size-grid { grid-template-columns: 1fr 1fr 1fr; }
}
.modal-size-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  padding: 12px 12px 14px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  cursor: pointer;
  text-align: left;
  transition: border-color 150ms, background 150ms, transform 150ms;
}
.modal-size-card:hover {
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.modal-size-card--active {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
}
.modal-size-card__mockup {
  position: relative;
  height: 70px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-size-card__mockup-backdrop {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      45deg,
      color-mix(in srgb, var(--brand-text) 4%, transparent) 0,
      color-mix(in srgb, var(--brand-text) 4%, transparent) 6px,
      transparent 6px,
      transparent 12px
    );
  opacity: 0.7;
}
.modal-size-card__mockup-card {
  position: relative;
  height: 38px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--brand-primary) 30%, color-mix(in srgb, var(--brand-text) 5%, transparent));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 50%, transparent);
}
.modal-size-card__mockup--sm .modal-size-card__mockup-card { width: 36%; }
.modal-size-card__mockup--md .modal-size-card__mockup-card { width: 56%; }
.modal-size-card__mockup--lg .modal-size-card__mockup-card { width: 78%; }
.modal-size-card__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.modal-size-card__label {
  font-family: var(--brand-font);
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-text);
}
.modal-size-card__width {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--brand-primary);
}
.modal-size-card__desc {
  font-size: 11px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.modal-size-card__check {
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
   Behavior cards (dispensavel vs obrigatorio)
   ========================================================= */
.modal-behavior-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
@media (min-width: 640px) {
  .modal-behavior-grid { grid-template-columns: 1fr 1fr; }
}
.modal-behavior-card {
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
.modal-behavior-card:hover {
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.modal-behavior-card--active {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
}
.modal-behavior-card__icon {
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
.modal-behavior-card--active .modal-behavior-card__icon {
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary);
}
.modal-behavior-card__meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.modal-behavior-card__label {
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--brand-text);
}
.modal-behavior-card__desc {
  font-size: 11.5px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.modal-behavior-card__check {
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
   CTA url input + suggestions (mesma pattern do EditorCta)
   ========================================================= */
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
.cta-url-input__field { flex: 1; }
.cta-url-input__field :deep(input) {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  padding-left: 0 !important;
}
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
.cta-url-input__badge[data-type='internal'] {
  color: var(--brand-primary);
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
}
.cta-url-input__badge[data-type='external'] {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.35);
  background: rgba(56, 189, 248, 0.1);
}
.cta-url-input__badge[data-type='email'] {
  color: #a78bfa;
  border-color: rgba(167, 139, 250, 0.35);
  background: rgba(167, 139, 250, 0.1);
}
.cta-url-input__badge[data-type='tel'] {
  color: var(--brand-positive);
  border-color: rgba(52, 211, 153, 0.35);
  background: rgba(52, 211, 153, 0.1);
}
.cta-url-input__badge[data-type='anchor'] {
  color: var(--brand-warning);
  border-color: color-mix(in srgb, var(--brand-warning) 35%, transparent);
  background: color-mix(in srgb, var(--brand-warning) 10%, transparent);
}
.cta-url-input__badge[data-type='unknown'] {
  color: var(--brand-negative);
  border-color: color-mix(in srgb, var(--brand-negative) 35%, transparent);
  background: color-mix(in srgb, var(--brand-negative) 10%, transparent);
}
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

/* =========================================================
   Audience layered builder (compartilhado com outros editors)
   ========================================================= */
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
.aud-tenant-select { margin-top: 4px; }
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
   Vigência (mesma pattern dos outros editors)
   ========================================================= */
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
.vig-timeline__node--end { text-align: right; }
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
  background: linear-gradient(90deg, color-mix(in srgb, var(--brand-text) 18%, transparent), var(--brand-primary));
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
.vig-input__field { flex: 1; }
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
.vig-priority__value[data-tier='low'] { color: color-mix(in srgb, var(--brand-text) 70%, transparent); }
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
.vig-priority__presets { display: flex; gap: 4px; }
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
.vig-priority__preset:hover { background: color-mix(in srgb, var(--brand-text) 5%, transparent); }
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
   Aside cards (preview + analytics)
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
  font-family: 'JetBrains Mono', monospace;
}

.preview-stage {
  padding: 14px;
  background: rgba(0, 0, 0, 0.25);
  min-height: 320px;
}
.preview-stage--modal { padding: 0; }

/* Preview do modal: fundo simulando viewport + backdrop blur + card central */
.prev-modal-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  min-height: 320px;
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
.prev-modal-card {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: var(--brand-surface, var(--brand-background));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
  box-shadow:
    0 24px 48px -16px rgba(0, 0, 0, 0.45),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 8%, transparent);
  overflow: hidden;
  transition: max-width 200ms cubic-bezier(0.2, 0.7, 0.3, 1);
  width: 100%;
}
.prev-modal-card--sm { max-width: 70%; }
.prev-modal-card--md { max-width: 82%; }
.prev-modal-card--lg { max-width: 94%; }

.prev-modal-card__close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.85);
  cursor: default;
}
.prev-modal-card__image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-primary) 15%, transparent);
}
.prev-modal-card__inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px 16px;
}
.prev-modal-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.prev-modal-card__icon { color: var(--brand-primary); }
.prev-modal-card__title {
  flex: 1;
  margin: 0;
  font-family: var(--brand-font);
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--brand-text);
}
.prev-modal-card__body {
  font-size: 12px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}
.prev-modal-card__body :deep(p) { margin: 0 0 6px; }
.prev-modal-card__body :deep(p:last-child) { margin-bottom: 0; }
.prev-modal-card__body :deep(strong) { font-weight: 600; color: var(--brand-text); }
.prev-modal-card__body :deep(em) {
  font-style: italic;
  font-family: 'Instrument Serif', Georgia, serif;
}
.prev-modal-card__body :deep(a) {
  color: var(--brand-primary);
  text-decoration: underline;
}
.prev-modal-card__body :deep(ul),
.prev-modal-card__body :deep(ol) { margin: 4px 0; padding-left: 18px; }
.prev-modal-card__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  margin-top: 4px;
  padding: 8px 14px;
  border-radius: 9px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  font-family: var(--brand-font);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  box-shadow:
    0 1px 0 0 color-mix(in srgb, white 25%, transparent) inset,
    0 6px 14px -6px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}

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
