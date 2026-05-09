<!--
  EmailCampaignEditor — dashboard de campanha de email.

  Email e fundamentalmente diferente dos outros tipos:
    - One-shot: depois de enviado, nao pode ser desfeito
    - Sai do app (cai na inbox), nao tem placement/render in-app
    - Tem historico: deliveries individuais com status (pending/queued/
      sent/failed/bounced) e timestamps de open/click
    - Test send + Send now sao acoes destrutivas, com confirmacao
    - Pode ser agendado (starts_at vira data de disparo)

  Por isso o editor adota formato dashboard:
    1. CAMPAIGN HEADER  — titulo + status big + quick actions (test/send/duplicate)
    2. COMPOSICAO       — assunto + corpo (markdown) + imagem + CTA
    3. AUDIENCIA        — builder em camadas + preview de destinatarios
    4. DISPARO          — test send + agendamento + send now
    5. PERFORMANCE      — stats cards + funnel + open/click rates
    6. HISTORICO        — tabela de deliveries com search/filter/pagination

  Sticky right: live preview do email renderizado como inbox.

  Diferencas desse editor pros outros (banner/cta/modal/etc):
    - sem timeline/vigencia tradicional (email so usa starts_at = quando enviar)
    - sem status active/paused (status real e draft -> sent, com analytics)
    - sem priority slider (cada email e unico, nao competindo por slot)
    - tem block de "send actions" como section dedicada
-->
<template>
  <div class="email-dash">
    <!-- ============ COL ESQUERDA: SECTIONS ============ -->
    <div class="email-dash__main">
      <!-- =================== CAMPAIGN HEADER =================== -->
      <header class="campaign-header" :data-state="campaignState">
        <div class="campaign-header__top">
          <div class="campaign-header__intro">
            <span class="campaign-header__eyebrow">
              <UIcon name="i-lucide-mail" class="size-3" />
              Campanha de email
            </span>
            <h1 class="campaign-header__title">{{ form.title || 'Nova campanha' }}</h1>
            <span class="campaign-header__sub">
              {{ campaignSubtitle }}
            </span>
          </div>

          <span class="campaign-header__state-pill" :data-state="campaignState">
            <span class="campaign-header__state-dot" />
            {{ campaignStateLabel }}
          </span>
        </div>

        <div class="campaign-header__actions">
          <button
            type="button"
            class="campaign-action campaign-action--test"
            :disabled="testing || !canSend"
            :title="canSend ? 'Envia uma cópia pro seu próprio email' : 'Preencha assunto + corpo antes'"
            @click="onTestSend"
          >
            <UIcon
              :name="testing ? 'i-lucide-loader-2' : 'i-lucide-send-horizontal'"
              :class="['size-3.5', testing && 'motion-safe:animate-spin']"
            />
            {{ testing ? 'Enviando teste...' : 'Enviar teste pra mim' }}
          </button>

          <button
            type="button"
            class="campaign-action campaign-action--save"
            :disabled="saving"
            @click="$emit('save')"
          >
            <UIcon
              :name="saving ? 'i-lucide-loader-2' : 'i-lucide-save'"
              :class="['size-3.5', saving && 'motion-safe:animate-spin']"
            />
            {{ saving ? 'Salvando...' : 'Salvar rascunho' }}
          </button>

          <button
            type="button"
            class="campaign-action campaign-action--send"
            :disabled="sending || !canSendNow"
            :title="canSendNow ? `Dispara pra ${recipientCount ?? '?'} destinatários` : 'Preencha assunto, corpo e tenha audiência'"
            @click="onSendNow"
          >
            <UIcon
              :name="sending ? 'i-lucide-loader-2' : 'i-lucide-rocket'"
              :class="['size-4', sending && 'motion-safe:animate-spin']"
            />
            <span>
              {{ sending ? 'Disparando...' : 'Enviar agora' }}
              <span v-if="recipientCount !== null && recipientCount > 0 && !sending" class="campaign-action__count">
                · {{ recipientCount }}
              </span>
            </span>
          </button>
        </div>
      </header>

      <!-- =================== SECTION 1: COMPOSIÇÃO =================== -->
      <Section
        title="Composição"
        eyebrow="Conteúdo do email"
        icon="i-lucide-pen-line"
        :open="open.compose"
        @toggle="open.compose = !open.compose"
      >
        <Field
          label="Assunto *"
          hint="Aparece como Subject na inbox. Funciona melhor com 30-50 caracteres, claro e específico."
        >
          <UInput
            v-model="form.title"
            placeholder='Ex.: "Lançamos o Stress Test da carteira"'
            size="md"
            required
          />
          <span class="field-counter" :data-state="subjectMeter">
            {{ (form.title || '').length }} caracteres · {{ subjectMeterLabel }}
          </span>
        </Field>

        <Field
          label="Corpo do email *"
          hint="Markdown completo. Use **negrito**, [link](url), listas, citações. 100-300 palavras + 1 CTA claro funciona melhor."
        >
          <AdminFormsRichTextField
            v-model="form.body"
            level="full"
            :max-length="20000"
            placeholder="Comece com uma linha que abre a conversa…"
          />
        </Field>

        <div class="grid-2">
          <Field
            label="Imagem do email (opcional)"
            hint="Aparece após o título. Largura máx ~600px no rendering."
          >
            <AdminFormsImageUploadField v-model="form.image_url" :alt="form.title || ''" />
          </Field>

          <div class="email-cta-pair">
            <Field label="Link do botão CTA" hint="URL absoluta. Vazio = sem botão.">
              <UInput v-model="form.link_url" placeholder="https://..." size="md" />
            </Field>
            <Field label="Texto do botão" hint='Imperativo curto. Ex.: "Acessar agora".'>
              <UInput v-model="form.link_label" placeholder="Ex.: Acessar agora" size="md" />
            </Field>
          </div>
        </div>
      </Section>

      <!-- =================== SECTION 2: AUDIÊNCIA =================== -->
      <Section
        :title="`Audiência${recipientCount !== null ? ` (${recipientCount} destinatários)` : ''}`"
        eyebrow="Quem recebe"
        icon="i-lucide-users"
        :open="open.audience"
        @toggle="open.audience = !open.audience"
      >
        <span class="section-lead">
          Define quem recebe a campanha. Cada camada refina o conjunto.
          Email só vai pra users <strong>autenticados com email cadastrado</strong> — visitantes nunca recebem.
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
                <span class="aud-layer__title">Lista manual</span>
                <span class="aud-layer__sub">Usuários específicos.</span>
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
          </div>
        </Transition>

        <Transition name="aud-expand">
          <div v-if="showRefinementFilters" class="aud-layer">
            <div class="aud-layer__head">
              <span class="aud-layer__step">03</span>
              <div>
                <span class="aud-layer__title">Refinamentos</span>
                <span class="aud-layer__sub">Filtros opcionais.</span>
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
                  <span class="aud-filter__desc">Só users com corretora conectada via Pluggy.</span>
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

        <!-- Recipients sample (preview) — auto-atualiza ao mudar filtro -->
        <div class="recipients-sample">
          <header class="recipients-sample__head">
            <span class="recipients-sample__count">
              <UIcon name="i-lucide-users" class="size-3.5" />
              <strong>{{ recipientCount ?? '—' }}</strong>
              destinatários
              <span v-if="loadingRecipients" class="recipients-sample__pulse">
                <UIcon name="i-lucide-loader-2" class="size-3 motion-safe:animate-spin" />
                atualizando
              </span>
            </span>
            <button
              type="button"
              class="recipients-sample__refresh"
              :disabled="loadingRecipients"
              @click="loadRecipients"
            >
              <UIcon
                :name="loadingRecipients ? 'i-lucide-loader-2' : 'i-lucide-refresh-cw'"
                :class="['size-3', loadingRecipients && 'motion-safe:animate-spin']"
              />
              Atualizar
            </button>
          </header>

          <div v-if="recipients?.sample?.length" class="recipients-sample__list">
            <div
              v-for="r in recipients.sample"
              :key="r.id"
              class="recipients-sample__row"
            >
              <UIcon :name="roleIcon(r.role)" class="size-3.5 recipients-sample__row-icon" />
              <span class="recipients-sample__row-name">{{ r.name || '(sem nome)' }}</span>
              <span class="recipients-sample__row-email">{{ r.email || '—' }}</span>
              <span class="recipients-sample__row-role">{{ roleLabel(r.role) }}</span>
            </div>
            <div v-if="recipientCount !== null && recipientCount > recipients.sample.length" class="recipients-sample__more">
              + {{ recipientCount - recipients.sample.length }} outros…
            </div>
          </div>
          <div v-else-if="!loadingRecipients && recipients" class="recipients-sample__empty">
            <UIcon name="i-lucide-users" class="size-4" />
            Sem destinatários no filtro atual. Ajuste a base/escopo acima.
          </div>
        </div>
      </Section>

      <!-- =================== SECTION 3: DISPARO =================== -->
      <Section
        title="Quando enviar"
        eyebrow="Disparo"
        icon="i-lucide-rocket"
        :open="open.send"
        @toggle="open.send = !open.send"
      >
        <span class="section-lead">
          Email é <strong>one-shot</strong> — uma vez disparado, não pode voltar atrás.
          Use "Enviar teste" antes pra validar o conteúdo na sua própria inbox.
        </span>

        <div class="send-grid">
          <!-- Card: Test send -->
          <div class="send-card send-card--test">
            <span class="send-card__icon">
              <UIcon name="i-lucide-send-horizontal" class="size-4" />
            </span>
            <div class="send-card__meta">
              <span class="send-card__label">Enviar teste</span>
              <span class="send-card__desc">
                Manda uma cópia pro seu próprio email cadastrado. Use pra revisar formatação e links antes do disparo final.
              </span>
            </div>
            <button
              type="button"
              class="send-card__action"
              :disabled="testing || !canSend"
              @click="onTestSend"
            >
              <UIcon
                :name="testing ? 'i-lucide-loader-2' : 'i-lucide-send-horizontal'"
                :class="['size-3', testing && 'motion-safe:animate-spin']"
              />
              {{ testing ? 'Enviando...' : 'Testar' }}
            </button>
          </div>

          <!-- Card: Schedule -->
          <div class="send-card send-card--schedule" :class="{ 'send-card--filled': form.starts_at }">
            <span class="send-card__icon">
              <UIcon name="i-lucide-calendar-clock" class="size-4" />
            </span>
            <div class="send-card__meta">
              <span class="send-card__label">Agendar disparo</span>
              <span class="send-card__desc">
                <template v-if="form.starts_at">
                  Programado pra <strong>{{ formatDateTime(form.starts_at) }}</strong>.
                  Quando salvar como ativo, entra na fila no horário marcado.
                </template>
                <template v-else>
                  Vazio = disparar manualmente via "Enviar agora". Preenchido = entra na fila no horário definido.
                </template>
              </span>
            </div>
            <div class="send-card__actions">
              <UInput
                v-model="form.starts_at"
                type="datetime-local"
                size="sm"
                class="send-card__date"
              />
              <button
                v-if="form.starts_at"
                type="button"
                class="send-card__clear"
                @click="form.starts_at = null"
              >
                <UIcon name="i-lucide-x" class="size-3" />
              </button>
            </div>
          </div>

          <!-- Card: Send now -->
          <div class="send-card send-card--now">
            <span class="send-card__icon">
              <UIcon name="i-lucide-rocket" class="size-4" />
            </span>
            <div class="send-card__meta">
              <span class="send-card__label">Disparar agora</span>
              <span class="send-card__desc">
                Coloca todos os <strong>{{ recipientCount ?? '?' }}</strong> emails na fila imediatamente.
                Confirma uma segunda vez no clique. <strong>Não pode ser desfeito.</strong>
              </span>
            </div>
            <button
              type="button"
              class="send-card__action send-card__action--primary"
              :disabled="sending || !canSendNow"
              @click="onSendNow"
            >
              <UIcon
                :name="sending ? 'i-lucide-loader-2' : 'i-lucide-rocket'"
                :class="['size-3.5', sending && 'motion-safe:animate-spin']"
              />
              {{ sending ? 'Disparando...' : 'Disparar' }}
            </button>
          </div>
        </div>
      </Section>

      <!-- =================== SECTION 4: PERFORMANCE =================== -->
      <Section
        v-if="stats && stats.total > 0"
        title="Performance"
        eyebrow="Métricas de entrega"
        icon="i-lucide-bar-chart-3"
        :open="open.performance"
        @toggle="open.performance = !open.performance"
      >
        <div class="perf-headline">
          <div class="perf-headline__stat">
            <span class="perf-headline__label">Entregues</span>
            <span class="perf-headline__value">{{ stats.sent }}</span>
            <span class="perf-headline__sub">de {{ stats.total }} ({{ pct(stats.sent, stats.total) }}%)</span>
          </div>
          <div class="perf-headline__stat">
            <span class="perf-headline__label">Open rate</span>
            <span class="perf-headline__value">{{ stats.open_rate }}<small>%</small></span>
            <span class="perf-headline__sub">{{ stats.opened }} abriram · {{ stats.total_opens }} aberturas</span>
          </div>
          <div class="perf-headline__stat">
            <span class="perf-headline__label">Click rate</span>
            <span class="perf-headline__value">{{ stats.click_rate }}<small>%</small></span>
            <span class="perf-headline__sub">{{ stats.clicked }} clicaram · {{ stats.total_clicks }} cliques</span>
          </div>
        </div>

        <!-- Funnel: queued > sent > opened > clicked -->
        <div class="perf-funnel">
          <span class="perf-funnel__label">Funil de entrega</span>
          <div class="perf-funnel__steps">
            <div class="perf-funnel__step">
              <span class="perf-funnel__bar perf-funnel__bar--queued" :style="{ width: '100%' }">
                <span class="perf-funnel__bar-label">{{ stats.total }}</span>
              </span>
              <span class="perf-funnel__step-label">Total</span>
            </div>
            <div class="perf-funnel__step">
              <span class="perf-funnel__bar perf-funnel__bar--sent" :style="{ width: pct(stats.sent, stats.total) + '%' }">
                <span class="perf-funnel__bar-label">{{ stats.sent }}</span>
              </span>
              <span class="perf-funnel__step-label">Entregues · {{ pct(stats.sent, stats.total) }}%</span>
            </div>
            <div class="perf-funnel__step">
              <span class="perf-funnel__bar perf-funnel__bar--opened" :style="{ width: pct(stats.opened, stats.total) + '%' }">
                <span class="perf-funnel__bar-label">{{ stats.opened }}</span>
              </span>
              <span class="perf-funnel__step-label">Abriram · {{ pct(stats.opened, stats.total) }}%</span>
            </div>
            <div class="perf-funnel__step">
              <span class="perf-funnel__bar perf-funnel__bar--clicked" :style="{ width: pct(stats.clicked, stats.total) + '%' }">
                <span class="perf-funnel__bar-label">{{ stats.clicked }}</span>
              </span>
              <span class="perf-funnel__step-label">Clicaram · {{ pct(stats.clicked, stats.total) }}%</span>
            </div>
          </div>
        </div>

        <!-- Detalhes secundarios -->
        <div class="perf-secondary">
          <div class="perf-secondary__pill" data-state="queued">
            <UIcon name="i-lucide-clock" class="size-3" />
            <span>{{ stats.queued + stats.pending }}</span>
            <span class="perf-secondary__pill-label">Em fila</span>
          </div>
          <div class="perf-secondary__pill" data-state="failed">
            <UIcon name="i-lucide-alert-triangle" class="size-3" />
            <span>{{ stats.failed }}</span>
            <span class="perf-secondary__pill-label">Falharam</span>
          </div>
          <div class="perf-secondary__pill" data-state="bounced">
            <UIcon name="i-lucide-x-circle" class="size-3" />
            <span>{{ stats.bounced }}</span>
            <span class="perf-secondary__pill-label">Bounce</span>
          </div>
        </div>
      </Section>

      <!-- =================== SECTION 5: HISTÓRICO =================== -->
      <Section
        v-if="(stats?.total ?? 0) > 0 || deliveries.length > 0"
        :title="`Histórico (${deliveriesTotal} entregas)`"
        eyebrow="Auditoria de envios"
        icon="i-lucide-history"
        :open="open.history"
        @toggle="open.history = !open.history"
      >
        <div class="history-toolbar">
          <div class="history-toolbar__search">
            <UIcon name="i-lucide-search" class="size-3.5 history-toolbar__search-icon" />
            <input
              v-model="deliverySearch"
              type="search"
              placeholder="Email, nome..."
              class="history-toolbar__search-input"
              @input="onDeliverySearchChange"
            />
          </div>

          <div class="history-toolbar__filters">
            <button
              v-for="f in statusFilters"
              :key="f.value"
              type="button"
              class="history-toolbar__filter"
              :class="{ 'history-toolbar__filter--active': deliveryStatusFilter === f.value }"
              @click="setStatusFilter(f.value)"
            >
              <UIcon v-if="f.icon" :name="f.icon" class="size-3" />
              {{ f.label }}
              <span v-if="f.count !== null" class="history-toolbar__filter-count">{{ f.count }}</span>
            </button>
          </div>
        </div>

        <div class="history-table">
          <div class="history-row history-row--head">
            <span class="history-cell history-cell--user">Destinatário</span>
            <span class="history-cell history-cell--status">Status</span>
            <span class="history-cell history-cell--time">Enviado</span>
            <span class="history-cell history-cell--engagement">Engajamento</span>
          </div>

          <div v-if="!deliveries.length" class="history-empty">
            <UIcon name="i-lucide-inbox" class="size-5" />
            <span>{{ stats?.total ? 'Nenhum delivery bate com o filtro' : 'Nada disparado ainda' }}</span>
          </div>

          <div
            v-for="d in deliveries"
            :key="d.id"
            class="history-row"
            :data-status="d.status"
          >
            <div class="history-cell history-cell--user">
              <span class="history-user__name">{{ d.name || '(sem nome)' }}</span>
              <span class="history-user__email">{{ d.email }}</span>
            </div>
            <div class="history-cell history-cell--status">
              <span class="history-status" :data-status="d.status">
                <UIcon :name="statusIcon(d.status)" class="size-3" />
                {{ statusLabel(d.status) }}
              </span>
              <span v-if="d.last_error" class="history-status__error" :title="d.last_error">
                {{ truncate(d.last_error, 40) }}
              </span>
            </div>
            <div class="history-cell history-cell--time">
              <span v-if="d.sent_at" class="history-time">{{ formatRelative(d.sent_at) }}</span>
              <span v-else-if="d.queued_at" class="history-time history-time--pending">na fila</span>
              <span v-else class="history-time history-time--pending">aguardando</span>
              <span v-if="d.delivery_attempts > 1" class="history-time__sub">
                {{ d.delivery_attempts }} tentativas
              </span>
            </div>
            <div class="history-cell history-cell--engagement">
              <span class="history-eng" :class="{ 'history-eng--on': d.opened_at }" :title="d.opened_at ? `Aberto ${formatDateTime(d.opened_at)}` : 'Não abriu'">
                <UIcon name="i-lucide-eye" class="size-3" />
                {{ d.open_count }}
              </span>
              <span class="history-eng" :class="{ 'history-eng--on': d.clicked_at }" :title="d.clicked_at ? `Clicou ${formatDateTime(d.clicked_at)}` : 'Não clicou'">
                <UIcon name="i-lucide-mouse-pointer-click" class="size-3" />
                {{ d.click_count }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="deliveriesLastPage > 1" class="history-pagination">
          <button
            type="button"
            class="history-page-btn"
            :disabled="deliveriesPage <= 1"
            @click="changePage(deliveriesPage - 1)"
          >
            <UIcon name="i-lucide-chevron-left" class="size-3.5" />
          </button>
          <span class="history-pagination__label">
            Página {{ deliveriesPage }} de {{ deliveriesLastPage }}
          </span>
          <button
            type="button"
            class="history-page-btn"
            :disabled="deliveriesPage >= deliveriesLastPage"
            @click="changePage(deliveriesPage + 1)"
          >
            <UIcon name="i-lucide-chevron-right" class="size-3.5" />
          </button>
        </div>
      </Section>
    </div>

    <!-- ============ COL DIREITA: PREVIEW EMAIL ============ -->
    <aside class="email-dash__aside">
      <div class="email-preview">
        <header class="email-preview__head">
          <span class="email-preview__eyebrow">Preview no inbox</span>
          <span class="email-preview__hint">Como o destinatário vai ver</span>
        </header>

        <!-- Inbox row preview (lista) -->
        <div class="inbox-row">
          <span class="inbox-row__avatar">
            <UIcon name="i-lucide-mail" class="size-3.5" />
          </span>
          <div class="inbox-row__meta">
            <span class="inbox-row__sender">Redentia</span>
            <span class="inbox-row__subject">{{ form.title || '(Assunto)' }}</span>
            <span class="inbox-row__preview">{{ bodyPreview }}</span>
          </div>
          <span class="inbox-row__time">agora</span>
        </div>

        <!-- Email body render -->
        <article class="email-render">
          <header class="email-render__head">
            <h1 class="email-render__title">{{ form.title || '(Assunto)' }}</h1>
          </header>
          <img
            v-if="form.image_url"
            :src="form.image_url"
            alt=""
            class="email-render__image"
            @error="onImgError"
          />
          <div v-if="form.body" class="email-render__body" v-html="renderedBody" />
          <div v-else class="email-render__placeholder">
            <UIcon name="i-lucide-pen-line" class="size-5" />
            <span>Escreva o corpo do email na seção acima</span>
          </div>
          <a
            v-if="form.link_url || form.link_label"
            :href="form.link_url || '#'"
            class="email-render__btn"
            target="_blank"
            rel="noopener"
          >
            {{ form.link_label || 'Acessar' }}
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </a>
          <footer class="email-render__footer">
            <span>Você está recebendo este email porque tem cadastro na Redentia.</span>
            <span>· Cancelar inscrição</span>
          </footer>
        </article>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onMounted, reactive, ref, resolveComponent, watch } from 'vue'
import type {
  AudiencePreview,
  CommunicationAdminPayload,
  CommunicationAnalytics,
  CommunicationAudience,
  EmailDelivery,
  EmailStats,
} from '~/services/communications'
import { sanitizeHtml } from '~/utils/sanitizeHtml'

const props = defineProps<{
  form: CommunicationAdminPayload & { tenant_id: number | null; target_min_aum: number | null }
  saving: boolean
  analytics: CommunicationAnalytics | null
  tenantOptions: { label: string; value: number | null }[]
  selectedUserIds: number[]
  id: number
}>()

defineEmits<{
  save: []
  'update:selectedUserIds': [number[]]
}>()

const service = useAdminCommunicationsService()
const showSuccessNotification = (window as any).showSuccessNotification ?? ((t: string, m: string) => alert(`${t}: ${m}`))
const showErrorNotification = (window as any).showErrorNotification ?? ((t: string, m: string) => alert(`${t}: ${m}`))

// =================================================================
// Sections open state
// =================================================================
const open = reactive({
  compose: true,
  audience: true,
  send: true,
  performance: true,
  history: true,
})

// =================================================================
// Campaign state derivation — drive UI baseado no status + stats
// =================================================================
type CampaignState = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
const campaignState = computed<CampaignState>(() => {
  const total = stats.value?.total ?? 0
  const queued = (stats.value?.queued ?? 0) + (stats.value?.pending ?? 0)
  const sent = stats.value?.sent ?? 0
  const failed = stats.value?.failed ?? 0
  if (total === 0) {
    if (props.form.starts_at && new Date(props.form.starts_at).getTime() > Date.now()) return 'scheduled'
    return 'draft'
  }
  if (queued > 0) return 'sending'
  if (failed > 0 && sent === 0) return 'failed'
  return 'sent'
})
const campaignStateLabel = computed(() => ({
  draft: 'Rascunho',
  scheduled: 'Agendado',
  sending: 'Disparando…',
  sent: 'Enviado',
  failed: 'Falhou',
}[campaignState.value]))
const campaignSubtitle = computed(() => {
  if (campaignState.value === 'sent') return `${stats.value?.sent} entregues · ${stats.value?.opened} abriram`
  if (campaignState.value === 'sending') return `${stats.value?.queued ?? 0} na fila · ${stats.value?.sent ?? 0} entregues`
  if (campaignState.value === 'failed') return `${stats.value?.failed} falhas detectadas`
  if (campaignState.value === 'scheduled') return `Programado pra ${formatDateTime(props.form.starts_at)}`
  return 'Rascunho — pronto pra disparar quando estiver bom'
})

// =================================================================
// Subject meter — feedback de tamanho ideal
// =================================================================
type SubjectMeterState = 'short' | 'optimal' | 'long' | 'too-long' | 'idle'
const subjectMeter = computed<SubjectMeterState>(() => {
  const len = (props.form.title || '').length
  if (len === 0) return 'idle'
  if (len < 25) return 'short'
  if (len <= 50) return 'optimal'
  if (len <= 70) return 'long'
  return 'too-long'
})
const subjectMeterLabel = computed(() => ({
  idle: 'comece a digitar',
  short: 'curto demais — adicione contexto',
  optimal: 'tamanho ideal',
  long: 'um pouco longo — vai cortar em mobile',
  'too-long': 'muito longo — corta em quase todos clientes',
}[subjectMeter.value]))

// =================================================================
// Body rendering (markdown via TipTap level=full -> HTML sanitizado)
// =================================================================
const renderedBody = computed(() => sanitizeHtml(props.form.body || '', 'full'))
const bodyPreview = computed(() => {
  const stripped = (props.form.body || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return stripped.slice(0, 100) || 'Sem texto ainda…'
})
const imgErrored = ref(false)
function onImgError() { imgErrored.value = true }
watch(() => props.form.image_url, () => { imgErrored.value = false })

// =================================================================
// Audience helpers
// =================================================================
const audienceChoices: { value: CommunicationAudience; label: string; icon: string; desc: string }[] = [
  { value: 'all', label: 'Todos', icon: 'i-lucide-users', desc: 'Logados (visitantes não recebem email)' },
  { value: 'authenticated', label: 'Logados', icon: 'i-lucide-user-check', desc: 'Todos os cadastrados' },
  { value: 'investors', label: 'Investidores', icon: 'i-lucide-trending-up', desc: 'role = investor' },
  { value: 'advisors', label: 'Assessores', icon: 'i-lucide-briefcase', desc: 'role = advisor' },
  { value: 'admins', label: 'Admins', icon: 'i-lucide-shield', desc: 'Só staff' },
  { value: 'specific', label: 'Específicos', icon: 'i-lucide-target', desc: 'Lista manual' },
]

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
function onAumInput(e: Event): void {
  const input = e.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '')
  props.form.target_min_aum = digits ? Number(digits) : null
}

// =================================================================
// Recipients preview — usa audiencePreview (LIVE, com filtros do form)
// em vez de recipientsPreview (que le do registro salvo). Assim
// qualquer mudanca no audience builder reflete na hora, sem precisar
// salvar primeiro. Mesma abordagem dos outros editors.
// =================================================================
const recipients = ref<AudiencePreview | null>(null)
const loadingRecipients = ref(false)
let recipAbort = 0
async function loadRecipients() {
  // Validacao basica antes de bater
  if (!props.form.target_audience) return

  const myToken = ++recipAbort
  loadingRecipients.value = true
  try {
    const resp = await service.audiencePreview({
      type: props.form.type,
      tenant_id: props.form.tenant_id ?? null,
      target_audience: props.form.target_audience,
      target_user_ids: (props.selectedUserIds || []).length ? props.selectedUserIds : null,
      target_min_aum: props.form.target_min_aum ?? null,
      target_has_connections: props.form.target_has_connections ?? null,
    })
    // Race-protection: ignora se outro request foi disparado depois
    if (myToken !== recipAbort) return
    recipients.value = resp
  } catch (e) {
    if (myToken !== recipAbort) return
    console.warn('[email-editor] failed to load recipients', e)
  } finally {
    if (myToken === recipAbort) loadingRecipients.value = false
  }
}

// Auto-refresh recipients quando muda audiencia/escopo (debounced).
// Defensivo contra `selectedUserIds` undefined no primeiro mount —
// o parent passa o array DEPOIS do load() inicial completar.
let recipDebounce: ReturnType<typeof setTimeout> | null = null
watch(() => [
  props.form.target_audience,
  props.form.tenant_id,
  props.form.target_has_connections,
  props.form.target_min_aum,
  Array.isArray(props.selectedUserIds) ? props.selectedUserIds.length : 0,
], () => {
  if (recipDebounce) clearTimeout(recipDebounce)
  recipDebounce = setTimeout(() => {
    void loadRecipients()
  }, 600)
})

// =================================================================
// Send actions
// =================================================================
const testing = ref(false)
const sending = ref(false)

// Helper computed pra count seguro (audiencePreview pode retornar null
// pra audience='guests' = anonimo). Pra email, guests sao excluidos
// no backend mesmo, mas mantemos defensivo.
const recipientCount = computed<number | null>(() => recipients.value?.count ?? null)
const canSend = computed(() => Boolean(props.form.title && props.form.body))
const canSendNow = computed(() => canSend.value && (recipientCount.value ?? 0) > 0)

async function onTestSend() {
  if (testing.value || !canSend.value) return
  testing.value = true
  try {
    await service.update(props.id, props.form as any)
    const resp = await service.testSend(props.id)
    showSuccessNotification('Teste enviado', `Foi pra ${resp.sent_to}. Confira sua inbox.`)
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? e?.data?.error ?? 'Falha ao enviar teste')
  } finally {
    testing.value = false
  }
}

async function onSendNow() {
  if (sending.value || !canSendNow.value) return
  const count = recipientCount.value ?? 0
  if (!confirm(`Disparar pra ${count} destinatários agora? Esta ação NÃO pode ser desfeita.`)) return
  sending.value = true
  try {
    await service.update(props.id, props.form as any)
    const resp = await service.sendNow(props.id)
    showSuccessNotification(
      'Disparado!',
      `${resp.queued} emails entraram na fila${resp.skipped ? ` · ${resp.skipped} já receberam antes` : ''}.`,
    )
    await Promise.all([loadStats(), loadDeliveries()])
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? e?.data?.error ?? 'Falha ao disparar')
  } finally {
    sending.value = false
  }
}

// =================================================================
// Stats
// =================================================================
const stats = ref<EmailStats | null>(null)
async function loadStats() {
  try {
    stats.value = await service.emailStats(props.id)
  } catch (e) {
    console.warn('[email-editor] failed to load stats', e)
  }
}

// =================================================================
// Deliveries (historico)
// =================================================================
const deliveries = ref<EmailDelivery[]>([])
const deliveriesTotal = ref(0)
const deliveriesPage = ref(1)
const deliveriesLastPage = ref(1)
const deliveryStatusFilter = ref('')
const deliverySearch = ref('')

const statusFilters = computed(() => [
  { value: '', label: 'Todos', icon: '', count: stats.value?.total ?? null },
  { value: 'sent', label: 'Entregues', icon: 'i-lucide-check', count: stats.value?.sent ?? null },
  { value: 'queued', label: 'Em fila', icon: 'i-lucide-clock', count: (stats.value?.queued ?? 0) + (stats.value?.pending ?? 0) },
  { value: 'failed', label: 'Falharam', icon: 'i-lucide-alert-triangle', count: stats.value?.failed ?? null },
  { value: 'bounced', label: 'Bounce', icon: 'i-lucide-x-circle', count: stats.value?.bounced ?? null },
])

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onDeliverySearchChange() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    deliveriesPage.value = 1
    void loadDeliveries()
  }, 300)
}
function setStatusFilter(value: string) {
  deliveryStatusFilter.value = value
  deliveriesPage.value = 1
  void loadDeliveries()
}
function changePage(p: number) {
  if (p < 1 || p > deliveriesLastPage.value) return
  deliveriesPage.value = p
  void loadDeliveries()
}

async function loadDeliveries() {
  try {
    const resp = await service.deliveries(props.id, {
      page: deliveriesPage.value,
      per_page: 20,
      status: deliveryStatusFilter.value || undefined,
      search: deliverySearch.value || undefined,
    })
    deliveries.value = resp.data
    deliveriesTotal.value = resp.total
    deliveriesLastPage.value = resp.last_page
  } catch (e) {
    console.warn('[email-editor] failed to load deliveries', e)
  }
}

// =================================================================
// Helpers
// =================================================================
function pct(n: number, total: number): number {
  if (!total) return 0
  return Math.round((n / total) * 100)
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
function formatRelative(iso: string): string {
  const d = new Date(iso).getTime()
  const diff = Date.now() - d
  const min = Math.floor(diff / 60000)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (day >= 1) return `há ${day}d`
  if (hr >= 1) return `há ${hr}h`
  if (min >= 1) return `há ${min}min`
  return 'agora'
}
function statusIcon(s: string): string {
  return ({
    pending:      'i-lucide-clock',
    queued:       'i-lucide-clock',
    sent:         'i-lucide-check',
    failed:       'i-lucide-alert-triangle',
    bounced:      'i-lucide-x-circle',
    unsubscribed: 'i-lucide-user-x',
  } as Record<string, string>)[s] || 'i-lucide-mail'
}
function statusLabel(s: string): string {
  return ({
    pending: 'Pendente', queued: 'Em fila', sent: 'Entregue',
    failed: 'Falhou', bounced: 'Bounce', unsubscribed: 'Saiu',
  } as Record<string, string>)[s] || s
}
function roleLabel(r: string): string {
  return ({ investor: 'investidor', advisor: 'assessor', admin: 'admin' } as Record<string, string>)[r] || r
}
function roleIcon(r: string): string {
  return ({
    investor: 'i-lucide-trending-up',
    advisor: 'i-lucide-briefcase',
    admin: 'i-lucide-shield',
  } as Record<string, string>)[r] || 'i-lucide-user'
}
function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

// =================================================================
// Lifecycle: loads ao montar
// =================================================================
onMounted(() => {
  void loadRecipients()
  void loadStats()
  void loadDeliveries()
})

// =================================================================
// Sub-components Section + Field
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
   Layout do dashboard
   ========================================================= */
.email-dash {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding: 24px;
  align-items: start;
}
@media (min-width: 1280px) {
  .email-dash {
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
    gap: 32px;
  }
}
.email-dash__main {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}
.email-dash__aside {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 80px;
}

/* =========================================================
   Campaign header
   ========================================================= */
.campaign-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 14px;
  background:
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--brand-primary) 14%, transparent) 0%, transparent 55%),
    color-mix(in srgb, var(--brand-text) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.campaign-header[data-state='sent'] {
  background:
    radial-gradient(circle at 100% 0%, color-mix(in srgb, #10b981 14%, transparent) 0%, transparent 55%),
    color-mix(in srgb, var(--brand-text) 3%, transparent);
  border-color: color-mix(in srgb, #10b981 25%, transparent);
}
.campaign-header[data-state='failed'] {
  border-color: color-mix(in srgb, #ef4444 30%, transparent);
}
.campaign-header[data-state='sending'] {
  border-color: color-mix(in srgb, #06b6d4 30%, transparent);
}
.campaign-header__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.campaign-header__intro {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.campaign-header__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
  align-self: flex-start;
}
.campaign-header__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.018em;
  color: var(--brand-text);
  line-height: 1.2;
  word-break: break-word;
}
.campaign-header__sub {
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  margin-top: 2px;
}
.campaign-header__state-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  flex-shrink: 0;
}
.campaign-header__state-pill[data-state='draft'] {
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}
.campaign-header__state-pill[data-state='scheduled'] {
  border-color: color-mix(in srgb, #06b6d4 35%, transparent);
  background: color-mix(in srgb, #06b6d4 14%, transparent);
  color: #67e8f9;
}
.campaign-header__state-pill[data-state='sending'] {
  border-color: color-mix(in srgb, #06b6d4 35%, transparent);
  background: color-mix(in srgb, #06b6d4 14%, transparent);
  color: #67e8f9;
}
.campaign-header__state-pill[data-state='sent'] {
  border-color: color-mix(in srgb, #10b981 35%, transparent);
  background: color-mix(in srgb, #10b981 14%, transparent);
  color: #34d399;
}
.campaign-header__state-pill[data-state='failed'] {
  border-color: color-mix(in srgb, #ef4444 35%, transparent);
  background: color-mix(in srgb, #ef4444 14%, transparent);
  color: #fca5a5;
}
.campaign-header__state-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
}
.campaign-header__state-pill[data-state='sending'] .campaign-header__state-dot {
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(0.8); }
}

.campaign-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.campaign-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border-radius: 9px;
  font-family: var(--brand-font);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  cursor: pointer;
  border: 1px solid;
  transition: background 150ms, border-color 150ms, color 150ms, transform 100ms;
}
.campaign-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.campaign-action--test {
  background: transparent;
  border-color: color-mix(in srgb, var(--brand-text) 14%, transparent);
  color: color-mix(in srgb, var(--brand-text) 80%, transparent);
}
.campaign-action--test:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  border-color: color-mix(in srgb, var(--brand-text) 25%, transparent);
  color: var(--brand-text);
}
.campaign-action--save {
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  border-color: color-mix(in srgb, var(--brand-text) 12%, transparent);
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}
.campaign-action--save:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.campaign-action--send {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  font-weight: 600;
  font-size: 13px;
  padding: 9px 16px;
  box-shadow:
    0 1px 0 0 color-mix(in srgb, white 25%, transparent) inset,
    0 8px 18px -8px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}
.campaign-action--send:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 1px 0 0 color-mix(in srgb, white 25%, transparent) inset,
    0 12px 24px -8px color-mix(in srgb, var(--brand-primary) 70%, transparent);
}
.campaign-action__count {
  font-family: 'JetBrains Mono', monospace;
  opacity: 0.85;
  font-weight: 700;
  margin-left: 2px;
}

/* =========================================================
   Subject meter
   ========================================================= */
.field-counter[data-state='idle']      { color: color-mix(in srgb, var(--brand-text) 40%, transparent); }
.field-counter[data-state='short']     { color: #fcd34d; }
.field-counter[data-state='optimal']   { color: #34d399; }
.field-counter[data-state='long']      { color: #fcd34d; }
.field-counter[data-state='too-long']  { color: #fca5a5; }

/* =========================================================
   Compose: CTA pair (link + label) compacto
   ========================================================= */
.email-cta-pair {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* =========================================================
   Recipients sample (lista de destinatarios)
   ========================================================= */
.recipients-sample {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.recipients-sample__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.recipients-sample__count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}
.recipients-sample__count strong {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  color: var(--brand-primary);
  font-variant-numeric: tabular-nums;
}
.recipients-sample__pulse {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.recipients-sample__refresh {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 5px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  font-size: 10.5px;
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.recipients-sample__refresh:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  color: var(--brand-primary);
}
.recipients-sample__list {
  display: flex;
  flex-direction: column;
}
.recipients-sample__row {
  display: grid;
  grid-template-columns: 16px minmax(0, 1.4fr) minmax(0, 2fr) auto;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 11.5px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.recipients-sample__row:last-child { border-bottom: 0; }
.recipients-sample__row-icon {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.recipients-sample__row-name {
  color: var(--brand-text);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.recipients-sample__row-email {
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.recipients-sample__row-role {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.recipients-sample__more {
  padding: 8px 0 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.recipients-sample__empty {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px;
  border-radius: 7px;
  background: color-mix(in srgb, #f59e0b 8%, transparent);
  color: #fcd34d;
  font-size: 11.5px;
}

/* =========================================================
   Send section: cards de acoes
   ========================================================= */
.send-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.send-card {
  display: grid;
  grid-template-columns: 32px 1fr;
  grid-template-rows: auto auto;
  gap: 8px 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.send-card--filled {
  background: color-mix(in srgb, var(--brand-primary) 7%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
}
.send-card--now {
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 20%, transparent);
}
.send-card__icon {
  grid-column: 1;
  grid-row: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}
.send-card__meta {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.send-card__label {
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--brand-text);
}
.send-card__desc {
  font-size: 11.5px;
  line-height: 1.45;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}
.send-card__desc strong { color: var(--brand-text); font-weight: 600; }
.send-card__action,
.send-card__actions {
  grid-column: 2;
  grid-row: 2;
}
.send-card__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 7px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 14%, transparent);
  background: transparent;
  color: var(--brand-text);
  font-family: var(--brand-font);
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms, border-color 150ms;
  align-self: flex-start;
}
.send-card__action:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  color: var(--brand-primary);
}
.send-card__action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.send-card__action--primary {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  font-weight: 600;
}
.send-card__action--primary:hover:not(:disabled) {
  filter: brightness(1.05);
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
}
.send-card__actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
.send-card__date {
  flex: 1;
}
.send-card__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 5px;
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  cursor: pointer;
  transition: background 150ms;
}
.send-card__clear:hover {
  background: color-mix(in srgb, #ef4444 12%, transparent);
  color: #fca5a5;
}

/* =========================================================
   Performance: headline stats + funnel + secondary pills
   ========================================================= */
.perf-headline {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
@media (min-width: 720px) {
  .perf-headline { grid-template-columns: 1fr 1fr 1fr; }
}
.perf-headline__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: var(--brand-background);
}
.perf-headline__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.perf-headline__value {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 28px;
  font-weight: 600;
  color: var(--brand-text);
  letter-spacing: -0.012em;
}
.perf-headline__value small {
  font-size: 16px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  margin-left: 2px;
}
.perf-headline__sub {
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.perf-funnel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.perf-funnel__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.perf-funnel__steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.perf-funnel__step {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.perf-funnel__bar {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 22px;
  border-radius: 5px;
  padding: 0 8px;
  min-width: 36px;
  transition: width 250ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.perf-funnel__bar--queued  { background: color-mix(in srgb, var(--brand-text) 15%, transparent); }
.perf-funnel__bar--sent    { background: color-mix(in srgb, #10b981 35%, transparent); }
.perf-funnel__bar--opened  { background: color-mix(in srgb, #06b6d4 35%, transparent); }
.perf-funnel__bar--clicked { background: color-mix(in srgb, var(--brand-primary) 50%, transparent); }
.perf-funnel__bar-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--brand-text);
  font-variant-numeric: tabular-nums;
}
.perf-funnel__step-label {
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.perf-secondary {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.perf-secondary__pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.perf-secondary__pill[data-state='queued'] {
  border-color: color-mix(in srgb, #06b6d4 30%, transparent);
  background: color-mix(in srgb, #06b6d4 10%, transparent);
  color: #67e8f9;
}
.perf-secondary__pill[data-state='failed'] {
  border-color: color-mix(in srgb, #f59e0b 30%, transparent);
  background: color-mix(in srgb, #f59e0b 10%, transparent);
  color: #fcd34d;
}
.perf-secondary__pill[data-state='bounced'] {
  border-color: color-mix(in srgb, #ef4444 30%, transparent);
  background: color-mix(in srgb, #ef4444 10%, transparent);
  color: #fca5a5;
}
.perf-secondary__pill-label {
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 9px;
}

/* =========================================================
   Histórico: toolbar + tabela
   ========================================================= */
.history-toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.history-toolbar__search {
  position: relative;
  display: flex;
  align-items: center;
}
.history-toolbar__search-icon {
  position: absolute;
  left: 12px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.history-toolbar__search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  color: var(--brand-text);
  font-size: 12.5px;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}
.history-toolbar__search-input:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.history-toolbar__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.history-toolbar__filter {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms, border-color 150ms, color 150ms;
}
.history-toolbar__filter:hover {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  color: var(--brand-text);
}
.history-toolbar__filter--active {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  color: var(--brand-primary);
}
.history-toolbar__filter-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.history-toolbar__filter--active .history-toolbar__filter-count {
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.history-table {
  display: flex;
  flex-direction: column;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
}
.history-row {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  padding: 10px 14px;
  font-size: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.history-row:last-child { border-bottom: 0; }
.history-row--head {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
}
.history-row[data-status='failed'],
.history-row[data-status='bounced'] {
  background: color-mix(in srgb, #ef4444 5%, transparent);
}
.history-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.history-user__name {
  color: var(--brand-text);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.history-user__email {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.history-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  align-self: flex-start;
}
.history-status[data-status='sent'] {
  border-color: color-mix(in srgb, #10b981 35%, transparent);
  background: color-mix(in srgb, #10b981 12%, transparent);
  color: #34d399;
}
.history-status[data-status='queued'],
.history-status[data-status='pending'] {
  border-color: color-mix(in srgb, #06b6d4 35%, transparent);
  background: color-mix(in srgb, #06b6d4 12%, transparent);
  color: #67e8f9;
}
.history-status[data-status='failed'] {
  border-color: color-mix(in srgb, #f59e0b 35%, transparent);
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  color: #fcd34d;
}
.history-status[data-status='bounced'] {
  border-color: color-mix(in srgb, #ef4444 35%, transparent);
  background: color-mix(in srgb, #ef4444 12%, transparent);
  color: #fca5a5;
}
.history-status[data-status='unsubscribed'] {
  border-color: color-mix(in srgb, var(--brand-text) 25%, transparent);
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}
.history-status__error {
  font-size: 10.5px;
  color: #fca5a5;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.history-time {
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}
.history-time--pending {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  font-style: italic;
}
.history-time__sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
.history-cell--engagement {
  flex-direction: row;
  gap: 8px;
  align-items: center;
}
.history-eng {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 600;
}
.history-eng--on {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}
.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 14px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  font-size: 11.5px;
  font-style: italic;
}

.history-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 0;
}
.history-pagination__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.history-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: transparent;
  color: var(--brand-text);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.history-page-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  color: var(--brand-primary);
}
.history-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* =========================================================
   Email preview (aside)
   ========================================================= */
.email-preview {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  overflow: hidden;
}
.email-preview__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.email-preview__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.email-preview__hint {
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* Inbox row (lista preview) */
.inbox-row {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 16px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.inbox-row__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-primary) 15%, transparent);
  color: var(--brand-primary);
}
.inbox-row__meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.inbox-row__sender {
  font-family: var(--brand-font);
  font-size: 12px;
  font-weight: 600;
  color: var(--brand-text);
  letter-spacing: -0.005em;
}
.inbox-row__subject {
  font-size: 11.5px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 85%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.inbox-row__preview {
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.inbox-row__time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}

/* Email rendered body */
.email-render {
  background: var(--brand-surface, #fff);
  color: #1f2937;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.email-render__head {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 10px;
}
.email-render__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.01em;
}
.email-render__image {
  width: 100%;
  border-radius: 6px;
  display: block;
}
.email-render__body {
  font-size: 13.5px;
  line-height: 1.6;
  color: #374151;
}
.email-render__body :deep(h1),
.email-render__body :deep(h2),
.email-render__body :deep(h3),
.email-render__body :deep(h4) {
  margin: 12px 0 6px;
  color: #111827;
  font-weight: 600;
}
.email-render__body :deep(h1) { font-size: 18px; }
.email-render__body :deep(h2) { font-size: 16px; }
.email-render__body :deep(h3) { font-size: 14.5px; }
.email-render__body :deep(p) { margin: 0 0 10px; }
.email-render__body :deep(p:last-child) { margin-bottom: 0; }
.email-render__body :deep(strong) { font-weight: 700; color: #111827; }
.email-render__body :deep(em) { font-style: italic; }
.email-render__body :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}
.email-render__body :deep(ul),
.email-render__body :deep(ol) {
  margin: 6px 0 10px;
  padding-left: 22px;
}
.email-render__body :deep(li) { margin: 3px 0; }
.email-render__body :deep(blockquote) {
  margin: 8px 0;
  padding: 6px 12px;
  border-left: 3px solid #e5e7eb;
  color: #6b7280;
  font-style: italic;
}
.email-render__body :deep(code) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  padding: 1px 5px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}
.email-render__body :deep(hr) {
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 14px 0;
}
.email-render__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 16px;
  border: 1px dashed rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  color: #9ca3af;
  font-size: 12.5px;
  font-style: italic;
}
.email-render__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 10px 18px;
  border-radius: 6px;
  background: var(--brand-primary, #f59e0b);
  color: var(--text-on-primary, #fff);
  font-weight: 600;
  font-size: 13.5px;
  text-decoration: none;
}
.email-render__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-top: 14px;
  margin-top: 6px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 10.5px;
  color: #9ca3af;
}
</style>
