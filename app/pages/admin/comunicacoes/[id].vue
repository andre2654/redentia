<!--
  /admin/comunicacoes/[id] — editor type-aware com live preview.

  Layout: 2 colunas (desktop) ou stacked (mobile)
    - LEFT: form em sections collapsible
        1. Conteúdo (titulo / body / icone / link / imagem)
        2. Audiência (visual selector)
        3. Posicionamento (visual selector com mockup do app)
        4. Vigência (datas + prioridade)
        5. Específico (poll options, modal size, ...)
    - RIGHT: live preview que renderiza um MOCK fiel do componente
       user-side (TopBanner, CTASlot, ModalManager, ...) com os
       dados do form atual. Atualiza em tempo real.

  Header: status toggle (active/paused), back link, breadcrumb.
  Footer sticky: salvar / descartar.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="editor">
      <!-- ============ HEADER STICKY ============ -->
      <div class="editor__header">
        <NuxtLink to="/admin/comunicacoes" class="back-link">
          <UIcon name="i-lucide-chevron-left" class="size-3.5" />
          Comunicações
        </NuxtLink>

        <div v-if="!loading" class="editor__title-row">
          <span class="type-pill" :style="typeChipStyle(form.type)">
            <UIcon :name="typeIcon(form.type)" class="size-3" />
            {{ typeLabel(form.type) }}
          </span>
          <h1 class="editor__title">
            {{ form.title || 'Sem título' }}
          </h1>

          <span class="editor__status" :class="`editor__status--${form.status}`">
            <span class="editor__status-dot" />
            {{ statusLabel(form.status) }}
          </span>
        </div>

        <div v-if="!loading" class="editor__header-actions">
          <button
            type="button"
            class="ghost-btn"
            :disabled="saving || isNew"
            @click="onDuplicate"
          >
            <UIcon name="i-lucide-copy" class="size-3.5" />
            Duplicar
          </button>
          <button
            type="button"
            class="ghost-btn ghost-btn--danger"
            :disabled="saving || isNew"
            @click="onDelete"
          >
            <UIcon name="i-lucide-trash-2" class="size-3.5" />
            Apagar
          </button>
          <button
            type="button"
            class="primary-cta"
            :disabled="saving"
            @click="onSave"
          >
            <UIcon
              :name="saving ? 'i-lucide-loader-2' : 'i-lucide-check'"
              :class="['size-3.5', saving && 'motion-safe:animate-spin']"
            />
            {{ saving ? 'Salvando...' : 'Salvar alterações' }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <UIcon name="i-lucide-loader-2" class="size-6 motion-safe:animate-spin" />
      </div>

      <!-- ============ BRANCH ESPECÍFICO PARA EMAIL ============
           Email tem fluxo completamente diferente (recipient preview,
           test send, send now, delivery list) — renderizamos um
           componente dedicado em vez do editor genérico. -->
      <AdminComunicacoesEmailCampaignEditor
        v-else-if="form.type === 'email'"
        :form="form"
        :id="idParam"
      />

      <!-- ============ BRANCH ESPECÍFICO PARA BANNER ============
           Editor dedicado: sections pensadas pra banner (placement
           top vs sidebar com mockup, audience com user picker em
           lista live, vigência, status), preview ao vivo da barra,
           analytics. Os outros tipos seguem usando o editor abaixo
           até serem refatorados um a um. -->
      <AdminComunicacoesEditorBanner
        v-else-if="form.type === 'banner'"
        :form="form"
        :saving="saving"
        :analytics="analytics"
        :tenant-options="tenantOptions"
        v-model:selected-user-ids="selectedUserIds"
        @save="onSave"
      />

      <!-- ============ BRANCH ESPECÍFICO PARA ANNOUNCEMENT ============
           Editor editorial: body com TipTap level=basic (parágrafo,
           lista, citação, headings 3/4), suporte a imagem cover,
           placement feed/modal com mockup, mesma audiência+vigência
           do banner. Preview do card editorial ao vivo. -->
      <AdminComunicacoesEditorAnnouncement
        v-else-if="form.type === 'announcement'"
        :form="form"
        :saving="saving"
        :analytics="analytics"
        :tenant-options="tenantOptions"
        v-model:selected-user-ids="selectedUserIds"
        @save="onSave"
      />

      <!-- ============ BRANCH ESPECÍFICO PARA CTA ============
           Editor de CTA com toggle entre "Conteúdo + CTA"
           (título + corpo + ícone + botão) e "Imagem clicável"
           (criativo único + link). Suporta múltiplos placements
           (carteira, calculadoras, rankings, guias, etc). -->
      <AdminComunicacoesEditorCta
        v-else-if="form.type === 'cta'"
        :form="form"
        :saving="saving"
        :analytics="analytics"
        :tenant-options="tenantOptions"
        v-model:selected-user-ids="selectedUserIds"
        @save="onSave"
      />

      <!-- ============ BRANCH ESPECÍFICO PARA MODAL ============
           Editor de modal popup centralizado. placement = 'modal'
           sempre. Diferenças do CTA:
             - tem modal_size picker (sm/md/lg) com mockup visual
             - preview simula viewport com backdrop + card central
             - dismissible vira "Como o user fecha" (X vs obrigatorio)
             - sem placement picker (modal e um lugar so) -->
      <AdminComunicacoesEditorModal
        v-else-if="form.type === 'modal'"
        :form="form"
        :saving="saving"
        :analytics="analytics"
        :tenant-options="tenantOptions"
        v-model:selected-user-ids="selectedUserIds"
        @save="onSave"
      />

      <!-- Editor body (todos os outros tipos) -->
      <div v-else class="editor__body">
        <!-- ============ LEFT: FORM ============ -->
        <form class="editor__form" @submit.prevent="onSave">
          <!-- SECTION 1: STATUS QUICK -->
          <div class="quick-status">
            <span class="quick-status__label">Status da campanha</span>
            <div class="quick-status__buttons">
              <button
                v-for="s in ['draft', 'active', 'paused']"
                :key="s"
                type="button"
                class="status-chip"
                :class="{ 'status-chip--active': form.status === s }"
                @click="form.status = s as any"
              >
                <span class="status-chip__dot" :class="`status-chip__dot--${s}`" />
                {{ statusLabel(s as any) }}
              </button>
            </div>
          </div>

          <!-- SECTION: CONTENT -->
          <Section title="Conteúdo" icon="i-lucide-pen-line" :open="openSections.content" @toggle="toggleSection('content')">
            <FieldGroup>
              <Field label="Título *" hint="Aparece em destaque na campanha. Mantenha curto.">
                <UInput
                  v-model="form.title"
                  placeholder="Ex.: Conecte sua corretora"
                  size="md"
                  required
                />
              </Field>

              <Field
                :label="form.type === 'email' ? 'Corpo do email' : 'Corpo'"
                :hint="bodyHint"
              >
                <UTextarea
                  v-model="form.body"
                  :rows="form.type === 'email' ? 10 : 4"
                  :placeholder="bodyPlaceholder"
                  size="md"
                />
              </Field>

              <FieldGroup columns="2">
                <Field label="Ícone (lucide)" hint="Ex: i-lucide-sparkles">
                  <UInput v-model="form.icon" placeholder="i-lucide-..." size="md" />
                </Field>
                <Field
                  v-if="form.type === 'modal' || form.type === 'email' || form.type === 'announcement'"
                  label="Imagem (URL)"
                >
                  <UInput v-model="form.image_url" placeholder="https://..." size="md" />
                </Field>
              </FieldGroup>

              <FieldGroup columns="2">
                <Field label="Link (URL)" hint="Pra onde o botão leva">
                  <UInput v-model="form.link_url" placeholder="https://..." size="md" />
                </Field>
                <Field label="Texto do botão">
                  <UInput v-model="form.link_label" :placeholder="defaultLinkLabel" size="md" />
                </Field>
              </FieldGroup>
            </FieldGroup>
          </Section>

          <!-- SECTION: TYPE-SPECIFIC -->
          <Section
            v-if="needsTypeSection"
            :title="typeSectionTitle"
            :icon="typeSectionIcon"
            :open="openSections.specific"
            @toggle="toggleSection('specific')"
          >
            <!-- POLL OPTIONS -->
            <FieldGroup v-if="form.type === 'poll'">
              <Field label="Opções da enquete *" hint="Mínimo 2, máximo 10">
                <div class="poll-options">
                  <div
                    v-for="(opt, i) in form.poll_options"
                    :key="opt.id"
                    class="poll-option"
                  >
                    <span class="poll-option__index">{{ i + 1 }}</span>
                    <UInput
                      v-model="opt.label"
                      placeholder="Texto da opção"
                      size="md"
                      class="poll-option__input"
                    />
                    <button
                      v-if="form.poll_options.length > 2"
                      type="button"
                      class="ghost-btn ghost-btn--icon ghost-btn--danger"
                      @click="removePollOption(i)"
                    >
                      <UIcon name="i-lucide-x" class="size-3.5" />
                    </button>
                  </div>
                  <button
                    v-if="form.poll_options.length < 10"
                    type="button"
                    class="add-option-btn"
                    @click="addPollOption"
                  >
                    <UIcon name="i-lucide-plus" class="size-3.5" />
                    Adicionar opção
                  </button>
                </div>
              </Field>
              <FieldGroup columns="2">
                <Field label="Múltipla escolha" hint="Permite votar em várias opções">
                  <UCheckbox v-model="form.poll_multi_choice" label="Permitir várias opções" />
                </Field>
                <Field label="Mostrar resultados" hint="Resultados visíveis após o voto">
                  <UCheckbox v-model="form.poll_results_visible" label="Mostrar tally" />
                </Field>
              </FieldGroup>
            </FieldGroup>

            <!-- MODAL SIZE -->
            <FieldGroup v-if="form.type === 'modal' || form.type === 'poll'">
              <Field label="Tamanho do modal">
                <div class="size-picker">
                  <button
                    v-for="size in [
                      { value: 'sm', label: 'Pequeno', desc: '380px' },
                      { value: 'md', label: 'Médio', desc: '520px' },
                      { value: 'lg', label: 'Grande', desc: '720px' },
                    ]"
                    :key="size.value"
                    type="button"
                    class="size-option"
                    :class="{ 'size-option--active': form.modal_size === size.value }"
                    @click="form.modal_size = size.value as any"
                  >
                    <span :class="`size-mockup size-mockup--${size.value}`" />
                    <span class="size-option__label">{{ size.label }}</span>
                    <span class="size-option__desc">{{ size.desc }}</span>
                  </button>
                </div>
              </Field>
            </FieldGroup>
          </Section>

          <!-- SECTION: AUDIENCE -->
          <Section title="Quem vê" icon="i-lucide-users" :open="openSections.audience" @toggle="toggleSection('audience')">
            <Field label="Audiência alvo">
              <div class="audience-grid">
                <button
                  v-for="opt in audienceOptions"
                  :key="opt.value"
                  type="button"
                  class="audience-option"
                  :class="{ 'audience-option--active': form.target_audience === opt.value }"
                  @click="form.target_audience = opt.value as any"
                >
                  <UIcon :name="opt.icon" class="size-4" />
                  <span class="audience-option__label">{{ opt.label }}</span>
                  <span class="audience-option__desc">{{ opt.desc }}</span>
                </button>
              </div>
            </Field>

            <!-- USER PICKER (audience=specific) -->
            <Field
              v-if="form.target_audience === 'specific'"
              label="Selecionar usuários"
              hint="Busca por nome, email, login ou celular. Filtra pelo tenant selecionado abaixo."
            >
              <AdminUserPicker
                v-model="selectedUserIds"
                :tenant-id="form.tenant_id ?? null"
              />
            </Field>

            <FieldGroup columns="2">
              <Field label="Tenant" hint="Vazio = todos os tenants (global)">
                <USelect
                  v-model="form.tenant_id"
                  :items="tenantOptions"
                  placeholder="Global (todos)"
                  size="md"
                />
              </Field>
              <Field
                v-if="form.target_audience === 'authenticated' || form.target_audience === 'investors' || form.target_audience === 'advisors'"
                label="Open Finance conectado?"
                hint="Filtro extra (opcional)"
              >
                <USelect
                  v-model="form.target_has_connections"
                  :items="[
                    { label: 'Qualquer um', value: null },
                    { label: 'Só conectados', value: true },
                    { label: 'Só não-conectados', value: false },
                  ]"
                  size="md"
                />
              </Field>
            </FieldGroup>

            <Field
              v-if="form.target_audience === 'authenticated' || form.target_audience === 'investors'"
              label="AUM mínimo (R$)"
              hint="Patrimônio total da carteira maior que esse valor"
            >
              <UInput
                v-model.number="form.target_min_aum"
                type="number"
                placeholder="vazio = sem filtro"
                size="md"
              />
            </Field>
          </Section>

          <!-- SECTION: PLACEMENT (banner/cta) -->
          <Section
            v-if="needsPlacement"
            title="Onde aparece"
            icon="i-lucide-map-pin"
            :open="openSections.placement"
            @toggle="toggleSection('placement')"
          >
            <Field label="Posicionamento">
              <div class="placement-grid">
                <button
                  v-for="p in placementOptionsForType"
                  :key="p.value"
                  type="button"
                  class="placement-option"
                  :class="{ 'placement-option--active': form.placement === p.value }"
                  @click="form.placement = p.value as any"
                >
                  <div class="placement-mockup" :class="`placement-mockup--${p.value}`">
                    <div class="placement-mockup__sidebar" />
                    <div class="placement-mockup__main" />
                    <div class="placement-mockup__highlight" />
                  </div>
                  <span class="placement-option__label">{{ p.label }}</span>
                  <span class="placement-option__desc">{{ p.desc }}</span>
                </button>
              </div>
            </Field>
          </Section>

          <!-- SECTION: SCHEDULE -->
          <Section title="Vigência" icon="i-lucide-calendar" :open="openSections.schedule" @toggle="toggleSection('schedule')">
            <FieldGroup columns="2">
              <Field label="Início" hint="Vazio = vale a partir de já">
                <UInput v-model="form.starts_at" type="datetime-local" size="md" />
              </Field>
              <Field label="Fim" hint="Vazio = nunca expira">
                <UInput v-model="form.ends_at" type="datetime-local" size="md" />
              </Field>
            </FieldGroup>
            <FieldGroup columns="2">
              <Field label="Prioridade" hint="Maior = aparece primeiro">
                <UInput v-model.number="form.priority" type="number" size="md" />
              </Field>
              <Field label="Permitir dispensar" hint="Botão X para o usuário fechar">
                <UCheckbox v-model="form.dismissible" label="Dismissível" />
              </Field>
            </FieldGroup>
          </Section>
        </form>

        <!-- ============ RIGHT: LIVE PREVIEW ============ -->
        <aside class="editor__preview">
          <div class="preview-frame">
            <div class="preview-frame__header">
              <span class="preview-frame__eyebrow">Preview ao vivo</span>
              <span class="preview-frame__type">como o usuário vai ver</span>
            </div>

            <div class="preview-frame__stage" :class="`preview-frame__stage--${form.type}`">
              <!-- BANNER preview -->
              <div v-if="form.type === 'banner'" class="prev-banner">
                <div class="prev-banner__bar">
                  <UIcon
                    v-if="form.icon"
                    :name="form.icon"
                    class="size-4 shrink-0 prev-banner__icon"
                  />
                  <div class="prev-banner__content">
                    <span class="prev-banner__title">{{ form.title || '(Título)' }}</span>
                    <span v-if="form.body" class="prev-banner__body">{{ form.body }}</span>
                  </div>
                  <span v-if="form.link_label || form.link_url" class="prev-banner__cta">
                    {{ form.link_label || 'Saiba mais' }}
                    <UIcon name="i-lucide-arrow-right" class="size-3" />
                  </span>
                  <span v-if="form.dismissible" class="prev-banner__close">
                    <UIcon name="i-lucide-x" class="size-3.5" />
                  </span>
                </div>
                <div class="prev-banner__pagepart">
                  <span class="prev-page-line prev-page-line--w70" />
                  <span class="prev-page-line prev-page-line--w50" />
                  <span class="prev-page-line prev-page-line--w60" />
                </div>
              </div>

              <!-- ANNOUNCEMENT preview -->
              <div v-else-if="form.type === 'announcement'" class="prev-feed">
                <div class="prev-feed__head">
                  <span class="prev-feed__eyebrow">
                    <span class="prev-feed__pulse" />
                    1 novidade
                  </span>
                  <span class="prev-feed__title-link">{{ form.title || '(Título do comunicado)' }}</span>
                  <UIcon name="i-lucide-chevron-down" class="size-3.5 prev-feed__chevron" />
                </div>
                <div class="prev-feed__item">
                  <UIcon
                    v-if="form.icon"
                    :name="form.icon"
                    class="size-4 shrink-0 prev-feed__item-icon"
                  />
                  <div class="prev-feed__item-body">
                    <span class="prev-feed__item-title">{{ form.title || '(Título)' }}</span>
                    <p v-if="form.body" class="prev-feed__item-text">{{ form.body }}</p>
                    <a v-if="form.link_url" class="prev-feed__item-link">
                      {{ form.link_label || 'Ver mais' }}
                      <UIcon name="i-lucide-arrow-up-right" class="size-3" />
                    </a>
                  </div>
                </div>
              </div>

              <!-- CTA preview -->
              <div v-else-if="form.type === 'cta'" class="prev-cta">
                <span class="prev-cta__glow" />
                <header class="prev-cta__head">
                  <UIcon
                    v-if="form.icon"
                    :name="form.icon"
                    class="size-5 shrink-0 prev-cta__icon"
                  />
                  <h3 class="prev-cta__title">{{ form.title || '(Título do CTA)' }}</h3>
                  <span v-if="form.dismissible" class="prev-cta__close">
                    <UIcon name="i-lucide-x" class="size-3.5" />
                  </span>
                </header>
                <p v-if="form.body" class="prev-cta__body">{{ form.body }}</p>
                <span v-if="form.link_url || form.link_label" class="prev-cta__btn">
                  <UIcon name="i-lucide-sparkles" class="size-3.5" />
                  {{ form.link_label || 'Acessar' }}
                  <UIcon name="i-lucide-arrow-right" class="size-3.5" />
                </span>
              </div>

              <!-- MODAL preview -->
              <div v-else-if="form.type === 'modal' || form.type === 'poll'" class="prev-modal-wrap">
                <div class="prev-modal-backdrop" />
                <div class="prev-modal" :class="`prev-modal--${form.modal_size || 'md'}`">
                  <span v-if="form.dismissible" class="prev-modal__close">
                    <UIcon name="i-lucide-x" class="size-3.5" />
                  </span>
                  <img
                    v-if="form.image_url"
                    :src="form.image_url"
                    alt=""
                    class="prev-modal__img"
                    @error="($event.target as HTMLImageElement).style.display='none'"
                  >
                  <div class="prev-modal__inner">
                    <header class="prev-modal__head">
                      <UIcon
                        v-if="form.icon"
                        :name="form.icon"
                        class="size-5 shrink-0 prev-modal__icon"
                      />
                      <h2 class="prev-modal__title">{{ form.title || '(Título do modal)' }}</h2>
                    </header>
                    <p v-if="form.body" class="prev-modal__body">{{ form.body }}</p>

                    <!-- Poll options preview -->
                    <div v-if="form.type === 'poll'" class="prev-poll-opts">
                      <button
                        v-for="opt in form.poll_options || []"
                        :key="opt.id"
                        type="button"
                        class="prev-poll-opt"
                      >
                        <span class="prev-poll-check" />
                        <span>{{ opt.label || '(Opção sem texto)' }}</span>
                      </button>
                      <span v-if="form.poll_options?.length" class="prev-modal__btn">
                        <UIcon name="i-lucide-check" class="size-3.5" />
                        Votar
                      </span>
                    </div>

                    <!-- Modal CTA -->
                    <span v-else-if="form.link_url || form.link_label" class="prev-modal__btn">
                      <UIcon name="i-lucide-sparkles" class="size-3.5" />
                      {{ form.link_label || 'Continuar' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- EMAIL preview -->
              <div v-else-if="form.type === 'email'" class="prev-email">
                <div class="prev-email__client">
                  <div class="prev-email__client-bar">
                    <span class="prev-email__client-dot" />
                    <span class="prev-email__client-dot" />
                    <span class="prev-email__client-dot" />
                  </div>
                  <div class="prev-email__envelope">
                    <div class="prev-email__from">
                      <span class="prev-email__avatar">
                        <UIcon name="i-lucide-megaphone" class="size-3.5" />
                      </span>
                      <div class="prev-email__from-meta">
                        <span class="prev-email__sender">Redentia</span>
                        <span class="prev-email__address">noreply@redentia.com.br</span>
                      </div>
                    </div>
                    <h2 class="prev-email__subject">{{ form.title || '(Assunto do email)' }}</h2>
                    <img
                      v-if="form.image_url"
                      :src="form.image_url"
                      alt=""
                      class="prev-email__img"
                      @error="($event.target as HTMLImageElement).style.display='none'"
                    >
                    <p v-if="form.body" class="prev-email__body">{{ form.body }}</p>
                    <span v-if="form.link_url" class="prev-email__btn">
                      {{ form.link_label || 'Acessar' }}
                      <UIcon name="i-lucide-arrow-right" class="size-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Analytics card (só se já existe) -->
          <div v-if="!isNew && analytics" class="analytics-card">
            <span class="analytics-card__eyebrow">Analytics</span>
            <div class="analytics-grid">
              <div class="analytics-stat">
                <span class="analytics-stat__label">Impressões</span>
                <span class="analytics-stat__value">{{ analytics.impressions }}</span>
                <span class="analytics-stat__sub">{{ analytics.unique_seen }} únicos</span>
              </div>
              <div class="analytics-stat">
                <span class="analytics-stat__label">Cliques</span>
                <span class="analytics-stat__value">{{ analytics.clicks }}</span>
                <span class="analytics-stat__sub">{{ analytics.click_through_rate }}% CTR</span>
              </div>
              <div class="analytics-stat">
                <span class="analytics-stat__label">Dispensas</span>
                <span class="analytics-stat__value">{{ analytics.dismissals }}</span>
              </div>
              <div v-if="form.type === 'poll'" class="analytics-stat">
                <span class="analytics-stat__label">Votos</span>
                <span class="analytics-stat__value">{{ analytics.votes }}</span>
              </div>
            </div>
            <div v-if="analytics.poll_results && form.poll_options?.length" class="poll-results">
              <span class="poll-results__label">Resultados</span>
              <div v-for="opt in form.poll_options" :key="opt.id" class="poll-result-row">
                <span class="poll-result-row__name">{{ opt.label }}</span>
                <span class="poll-result-row__bar">
                  <span
                    class="poll-result-row__fill"
                    :style="{ width: pollResultPct(opt.id, analytics.poll_results) + '%' }"
                  />
                </span>
                <span class="poll-result-row__count">{{ analytics.poll_results[opt.id] || 0 }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { h } from 'vue'
import type { CommunicationAdminPayload, CommunicationAnalytics, CommunicationType, CommunicationStatus, PollOption } from '~/services/communications'

definePageMeta({ middleware: ['admin-panel'] })

const route = useRoute()
const router = useRouter()
const service = useAdminCommunicationsService()

const isNew = computed(() => false)
// Como temos new.vue separado pro type-picker, esta pagina sempre
// edita uma campanha existente. ID virá de route.params.
const idParam = computed(() => Number(route.params.id))

const loading = ref(true)
const saving = ref(false)
const analytics = ref<CommunicationAnalytics | null>(null)

const form = reactive<CommunicationAdminPayload & {
  poll_options: PollOption[];
  tenant_id: number | null;
  target_min_aum: number | null;
}>({
  tenant_id: null,
  type: 'banner' as CommunicationType,
  status: 'draft',
  title: '',
  body: '',
  icon: '',
  link_url: '',
  link_label: '',
  image_url: '',
  priority: 0,
  target_audience: 'authenticated',
  target_user_ids: null,
  target_min_aum: null,
  target_has_connections: null,
  starts_at: null,
  ends_at: null,
  dismissible: true,
  placement: 'top',
  placements: null,
  modal_size: 'md',
  poll_options: [],
  poll_multi_choice: false,
  poll_results_visible: false,
})

// Two-way binding pro user picker (audience=specific). target_user_ids
// no backend e jsonb (lista de ids); local convertemos pra array de
// numbers que o picker manipula. Sync via watcher abaixo.
//
// IMPORTANTE: equalArrays() guarda contra loop infinito. Vue compara
// arrays por reference — toda vez que um watcher cria um array novo
// (via .map/.filter/spread), o outro watcher dispara mesmo se o
// conteudo for igual, criando outro array novo, ciclando ate o limit
// "Maximum recursive updates exceeded". Comparamos elemento-a-elemento
// e so atribuimos se REALMENTE mudou.
const selectedUserIds = ref<number[]>([])

function equalArrays(a: number[] | null | undefined, b: number[] | null | undefined): boolean {
  const aa = a ?? []
  const bb = b ?? []
  if (aa.length !== bb.length) return false
  for (let i = 0; i < aa.length; i++) if (Number(aa[i]) !== Number(bb[i])) return false
  return true
}

watch(() => form.target_user_ids, (next) => {
  const normalized = Array.isArray(next)
    ? next.map((id: any) => Number(id)).filter(Number.isFinite)
    : []
  if (!equalArrays(selectedUserIds.value, normalized)) {
    selectedUserIds.value = normalized
  }
}, { immediate: true })

watch(selectedUserIds, (next) => {
  const desired = next.length ? next : null
  // Compara contra o valor atual em form pra evitar disparar watcher A
  if (!equalArrays(form.target_user_ids as number[] | null, desired)) {
    form.target_user_ids = desired
  }
})

// Tenant options carregados do backend
const tenantOptions = ref<{ label: string; value: number | null }[]>([
  { label: 'Global (todos os tenants)', value: null },
])

async function loadTenants() {
  try {
    const tenantsService = useTenantsService()
    const list = await tenantsService.list()
    const arr = Array.isArray(list) ? list : ((list as any)?.data || [])
    tenantOptions.value = [
      { label: 'Global (todos os tenants)', value: null },
      ...arr.map((t: any) => ({ label: `${t.name} (${t.slug})`, value: t.id })),
    ]
  } catch (e) {
    // OK falhar silently — fica so a opcao Global
    console.warn('[editor] failed to load tenants', e)
  }
}

// Sections collapsible state
const openSections = reactive({
  content: true,
  specific: true,
  audience: true,
  placement: true,
  schedule: false,
})

function toggleSection(key: keyof typeof openSections) {
  openSections[key] = !openSections[key]
}

// =================================================================
// Computeds — labels e configs por tipo
// =================================================================
const needsPlacement = computed(() => ['banner', 'cta'].includes(form.type))

const needsTypeSection = computed(
  () => ['poll', 'modal'].includes(form.type)
)

const typeSectionTitle = computed(() => {
  if (form.type === 'poll') return 'Opções da enquete'
  if (form.type === 'modal') return 'Configurações do modal'
  return 'Configurações específicas'
})

const typeSectionIcon = computed(() => {
  if (form.type === 'poll') return 'i-lucide-bar-chart-3'
  if (form.type === 'modal') return 'i-lucide-square-stack'
  return 'i-lucide-settings-2'
})

const bodyHint = computed(() => {
  return ({
    banner: 'Texto secundário, fica ao lado do título. Mantenha curto.',
    announcement: 'Conteúdo do comunicado. Markdown suportado.',
    cta: 'Descrição da chamada. 1-2 linhas funcionam melhor.',
    modal: 'Texto principal do modal. Markdown suportado.',
    poll: 'Pergunta ou contexto da enquete.',
    email: 'Conteúdo do email. Markdown suportado.',
  } as Record<string, string>)[form.type]
})

const bodyPlaceholder = computed(() => {
  return ({
    banner: 'Ex.: "Manutenção programada das 02:00 às 04:00"',
    announcement: 'Markdown suportado. Ex.: "Lançamos o **raio-x da carteira**..."',
    cta: 'Ex.: "Conecte sua corretora pra sincronizar automaticamente"',
    modal: 'Conteúdo do modal. Markdown suportado.',
    poll: 'Ex.: "Qual feature você gostaria de ver primeiro?"',
    email: 'Markdown suportado. Use \\n\\n para parágrafos.',
  } as Record<string, string>)[form.type]
})

const defaultLinkLabel = computed(() => {
  return ({
    banner: 'Saiba mais',
    announcement: 'Ver mais',
    cta: 'Acessar',
    modal: 'Continuar',
    poll: '',
    email: 'Acessar',
  } as Record<string, string>)[form.type]
})

const audienceOptions = [
  { value: 'all', label: 'Todos', icon: 'i-lucide-users', desc: 'Logados + visitantes' },
  { value: 'authenticated', label: 'Logados', icon: 'i-lucide-user-check', desc: 'Só usuários cadastrados' },
  { value: 'guests', label: 'Visitantes', icon: 'i-lucide-user', desc: 'Não autenticados' },
  { value: 'investors', label: 'Investidores', icon: 'i-lucide-trending-up', desc: 'role = investor' },
  { value: 'advisors', label: 'Assessores', icon: 'i-lucide-briefcase', desc: 'role = advisor' },
  { value: 'admins', label: 'Admins', icon: 'i-lucide-shield', desc: 'Só admins' },
  { value: 'specific', label: 'Específicos', icon: 'i-lucide-user-plus', desc: 'Lista manual de users' },
]

const placementOptionsForType = computed(() => {
  if (form.type === 'banner') {
    return [
      { value: 'top', label: 'Topo', desc: 'Sticky no topo de toda a app' },
      { value: 'sidebar', label: 'Sidebar', desc: 'Dentro da barra lateral' },
    ]
  }
  if (form.type === 'cta') {
    return [
      { value: 'wallet-hero', label: 'Wallet — abaixo do hero', desc: 'Card contextual na carteira' },
      { value: 'help-prompt', label: 'Chat vazio', desc: 'Quando o user abre o chat sem mensagens' },
      { value: 'home-cta', label: 'Home pública', desc: 'Em destaque na home' },
    ]
  }
  return []
})

// =================================================================
// Poll options helpers
// =================================================================
function addPollOption() {
  if (!form.poll_options) form.poll_options = []
  if (form.poll_options.length >= 10) return
  const id = `opt-${form.poll_options.length + 1}-${Math.random().toString(36).slice(2, 6)}`
  form.poll_options.push({ id, label: '' })
}

function removePollOption(i: number) {
  form.poll_options.splice(i, 1)
}

function pollResultPct(optId: string, results: Record<string, number>): number {
  const total = Object.values(results).reduce((s, v) => s + v, 0)
  if (!total) return 0
  return ((results[optId] || 0) / total) * 100
}

// =================================================================
// Load + save
// =================================================================
async function load() {
  loading.value = true
  try {
    const resp = await service.get(idParam.value)
    Object.assign(form, resp.data)
    if (form.starts_at) form.starts_at = toLocalDatetime(form.starts_at)
    if (form.ends_at) form.ends_at = toLocalDatetime(form.ends_at)
    if (!form.poll_options) form.poll_options = []
    analytics.value = resp.analytics
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? 'Falha ao carregar')
    router.push('/admin/comunicacoes')
  } finally {
    loading.value = false
  }
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function onSave() {
  saving.value = true
  try {
    const payload: any = { ...form }
    // Limpa empties → null
    for (const k of ['icon', 'link_url', 'link_label', 'image_url', 'body', 'starts_at', 'ends_at']) {
      if (payload[k] === '') payload[k] = null
    }
    if (payload.target_min_aum === '' || payload.target_min_aum === undefined) payload.target_min_aum = null
    if (payload.tenant_id === '' || payload.tenant_id === undefined) payload.tenant_id = null
    if (payload.type !== 'poll') {
      delete payload.poll_options
      delete payload.poll_multi_choice
      delete payload.poll_results_visible
    }

    await service.update(idParam.value, payload)
    showSuccessNotification('Salva', 'Alterações salvas')
    // Recarrega analytics se mudou impressions/clicks/etc.
    const resp = await service.get(idParam.value)
    analytics.value = resp.analytics
  } catch (e: any) {
    showErrorNotification('Erro ao salvar', e?.data?.message ?? 'Verifique os campos')
  } finally {
    saving.value = false
  }
}

async function onDuplicate() {
  try {
    const cloned = await service.duplicate(idParam.value)
    showSuccessNotification('Duplicada', 'Cópia criada como rascunho')
    router.push(`/admin/comunicacoes/${cloned.id}`)
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? 'Falha ao duplicar')
  }
}

async function onDelete() {
  if (!confirm(`Apagar "${form.title}"?`)) return
  try {
    await service.destroy(idParam.value)
    showSuccessNotification('Apagada', 'Campanha removida')
    router.push('/admin/comunicacoes')
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? 'Falha ao apagar')
  }
}

// =================================================================
// Helpers de label
// =================================================================
function typeLabel(t: CommunicationType): string {
  return ({ banner: 'Banner', announcement: 'Comunicado', cta: 'CTA', modal: 'Modal', poll: 'Enquete', email: 'Email' } as const)[t]
}
function typeIcon(t: CommunicationType): string {
  return ({ banner: 'i-lucide-flag', announcement: 'i-lucide-megaphone', cta: 'i-lucide-mouse-pointer-click', modal: 'i-lucide-square-stack', poll: 'i-lucide-bar-chart-3', email: 'i-lucide-mail' } as const)[t]
}
function typeChipStyle(t: CommunicationType) {
  const color = ({ banner: '#3b82f6', announcement: '#8b5cf6', cta: '#f59e0b', modal: '#06b6d4', poll: '#ec4899', email: '#10b981' } as const)[t]
  return { backgroundColor: `${color}1a`, color, borderColor: `${color}40` }
}
function statusLabel(s: CommunicationStatus): string {
  return ({ draft: 'Rascunho', scheduled: 'Agendada', active: 'Ativa', paused: 'Pausada', ended: 'Encerrada' } as const)[s]
}

// =================================================================
// Sub-components inline (Section, Field, FieldGroup) pra evitar
// criar 3 arquivos extras. Usados so aqui.
// =================================================================
const Section = defineComponent({
  props: {
    title: String,
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
        h('span', { class: 'form-section__title' }, props.title),
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

const FieldGroup = defineComponent({
  props: { columns: { type: String, default: '1' } },
  setup(props, { slots }) {
    return () => h('div', {
      class: ['field-group', `field-group--cols-${props.columns}`],
    }, slots.default?.())
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

onMounted(() => {
  loadTenants()
  load()
})
</script>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
}

/* ============ HEADER (sticky) ============ */
.editor__header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: color-mix(in srgb, var(--brand-surface) 85%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  transition: color 150ms;
}
.back-link:hover { color: color-mix(in srgb, var(--brand-text) 85%, transparent); }

.editor__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.type-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.editor__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.editor__status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.editor__status-dot {
  width: 6px; height: 6px; border-radius: 999px;
  background: currentColor;
}
.editor__status--active { color: #10b981; }
.editor__status--active .editor__status-dot {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  animation: status-pulse 2.4s ease-in-out infinite;
}
.editor__status--draft { color: color-mix(in srgb, var(--brand-text) 50%, transparent); }
.editor__status--paused { color: #f59e0b; }
.editor__status--scheduled { color: #06b6d4; }
.editor__status--ended { color: color-mix(in srgb, var(--brand-text) 40%, transparent); }
@keyframes status-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

.editor__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  cursor: pointer;
  transition: background 150ms, border-color 150ms;
}
.ghost-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
}
.ghost-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.ghost-btn--icon { padding: 7px; }
.ghost-btn--danger { color: #ef4444; border-color: rgba(220, 38, 38, 0.3); }
.ghost-btn--danger:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.08);
  border-color: rgba(220, 38, 38, 0.5);
}

.primary-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  border: 0;
  cursor: pointer;
  transition: filter 150ms, transform 120ms;
  box-shadow: 0 8px 18px -10px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}
.primary-cta:hover:not(:disabled) { filter: brightness(1.05); transform: translateY(-1px); }
.primary-cta:disabled { opacity: 0.6; cursor: not-allowed; }

.loading {
  display: flex; align-items: center; justify-content: center;
  padding: 80px 0;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* ============ BODY (2 col) ============ */
.editor__body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding: 24px;
  align-items: start;
}

@media (min-width: 1280px) {
  .editor__body {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 32px;
  }
}

/* ============ FORM ============ */
.editor__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* QUICK STATUS */
.quick-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.quick-status__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.quick-status__buttons {
  display: flex;
  gap: 6px;
}
.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 7px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  font-size: 12px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  cursor: pointer;
  transition: background 150ms, border-color 150ms, color 150ms;
}
.status-chip__dot {
  width: 7px; height: 7px; border-radius: 999px;
}
.status-chip__dot--draft { background: color-mix(in srgb, var(--brand-text) 40%, transparent); }
.status-chip__dot--active { background: #10b981; }
.status-chip__dot--paused { background: #f59e0b; }
.status-chip:hover {
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
}
.status-chip--active {
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  color: var(--brand-primary);
}

/* SECTIONS */
:deep(.form-section) {
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  overflow: hidden;
}
:deep(.form-section__head) {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 16px;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
}
:deep(.form-section__head:hover) {
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
}
:deep(.form-section__icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
}
:deep(.form-section__title) {
  flex: 1;
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: color-mix(in srgb, var(--brand-text) 92%, transparent);
}
:deep(.form-section__chevron) {
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
}
:deep(.form-section__body) {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* FIELDS */
:deep(.field-group) {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
:deep(.field-group--cols-2) {
  grid-template-columns: 1fr 1fr;
}
@media (max-width: 600px) {
  :deep(.field-group--cols-2) { grid-template-columns: 1fr; }
}

:deep(.field) {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
:deep(.field__label) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
:deep(.field__control) {
  display: block;
}
:deep(.field__hint) {
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
  line-height: 1.4;
}

/* AUDIENCE GRID */
.audience-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
@media (min-width: 768px) {
  .audience-grid { grid-template-columns: repeat(3, 1fr); }
}

.audience-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  text-align: left;
  cursor: pointer;
  transition: border-color 150ms, background 150ms;
}
.audience-option:hover {
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.audience-option--active {
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
}
.audience-option--active .audience-option__label {
  color: var(--brand-primary);
}
.audience-option__label {
  font-size: 12.5px;
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 92%, transparent);
}
.audience-option__desc {
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* PLACEMENT GRID with mockups */
.placement-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
@media (min-width: 600px) {
  .placement-grid { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 1280px) {
  .placement-grid { grid-template-columns: 1fr 1fr 1fr; }
}

.placement-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 10px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  text-align: left;
  cursor: pointer;
  transition: border-color 150ms, background 150ms;
}
.placement-option:hover {
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
}
.placement-option--active {
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
}

.placement-mockup {
  position: relative;
  width: 100%;
  height: 56px;
  border-radius: 5px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
}
.placement-mockup__sidebar {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 14px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.placement-mockup__main {
  position: absolute;
  left: 14px; right: 0; top: 0; bottom: 0;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
}
.placement-mockup__highlight {
  position: absolute;
  background: var(--brand-primary);
  border-radius: 2px;
  transition: all 200ms;
}

.placement-mockup--top .placement-mockup__highlight {
  top: 4px; left: 18px; right: 4px; height: 8px;
}
.placement-mockup--sidebar .placement-mockup__highlight {
  top: 8px; left: 1px; bottom: 8px; width: 12px;
  border-radius: 0;
}
.placement-mockup--wallet-hero .placement-mockup__highlight {
  top: 18px; left: 18px; right: 4px; height: 14px;
}
.placement-mockup--help-prompt .placement-mockup__highlight {
  bottom: 8px; left: 18px; right: 4px; height: 10px;
}
.placement-mockup--home-cta .placement-mockup__highlight {
  top: 30%; bottom: 30%; left: 30%; right: 4px;
}

.placement-option--active .placement-mockup {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
}

.placement-option__label {
  font-size: 12px;
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 92%, transparent);
}
.placement-option__desc {
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  line-height: 1.4;
}

/* SIZE PICKER (modal) */
.size-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.size-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  cursor: pointer;
  transition: border-color 150ms;
}
.size-option:hover { border-color: color-mix(in srgb, var(--brand-text) 18%, transparent); }
.size-option--active {
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
}
.size-option__label {
  font-size: 12px;
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 92%, transparent);
}
.size-option__desc {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
}
.size-mockup {
  width: 100%;
  height: 22px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  position: relative;
}
.size-mockup::before {
  content: '';
  position: absolute;
  background: var(--brand-primary);
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  border-radius: 2px;
  height: 60%;
}
.size-mockup--sm::before { width: 28%; }
.size-mockup--md::before { width: 50%; }
.size-mockup--lg::before { width: 75%; }

/* POLL OPTIONS */
.poll-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.poll-option {
  display: flex;
  align-items: center;
  gap: 8px;
}
.poll-option__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.poll-option__input { flex: 1; }
.add-option-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 7px;
  background: transparent;
  border: 1px dashed color-mix(in srgb, var(--brand-text) 18%, transparent);
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-start;
  transition: border-color 150ms, color 150ms;
}
.add-option-btn:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

/* ============ PREVIEW PANE ============ */
.editor__preview {
  position: sticky;
  top: 90px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-self: start;
}

.preview-frame {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  overflow: hidden;
}

.preview-frame__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
}
.preview-frame__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.preview-frame__type {
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}

.preview-frame__stage {
  padding: 24px;
  background:
    repeating-linear-gradient(45deg, color-mix(in srgb, var(--brand-text) 1.5%, transparent) 0, color-mix(in srgb, var(--brand-text) 1.5%, transparent) 10px, transparent 10px, transparent 20px),
    color-mix(in srgb, var(--brand-surface) 70%, transparent);
  min-height: 280px;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.preview-frame__stage--banner { padding: 0; align-items: stretch; }
.preview-frame__stage--modal,
.preview-frame__stage--poll { padding: 0; }

/* PREVIEW: BANNER */
.prev-banner {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.prev-banner__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--brand-primary) 14%, var(--brand-surface, rgba(40,44,52,0.9))) 0%,
    color-mix(in srgb, var(--brand-surface, rgba(40,44,52,0.9)) 90%, var(--brand-background, rgba(15,18,22,1))) 100%
  );
  border-bottom: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
}
.prev-banner__icon {
  color: var(--brand-primary);
}
.prev-banner__content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 12px;
  min-width: 0;
}
.prev-banner__title {
  font-size: 13px;
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
}
.prev-banner__body {
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.prev-banner__cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 7px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  font-size: 11.5px;
  font-weight: 600;
}
.prev-banner__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px; height: 24px;
  border-radius: 6px;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.prev-banner__pagepart {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  align-items: flex-start;
}
.prev-page-line {
  display: block;
  height: 8px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.prev-page-line--w70 { width: 70%; }
.prev-page-line--w50 { width: 50%; }
.prev-page-line--w60 { width: 60%; }

/* PREVIEW: ANNOUNCEMENT */
.prev-feed {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  overflow: hidden;
}
.prev-feed__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
}
.prev-feed__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.prev-feed__pulse {
  width: 6px; height: 6px; border-radius: 999px;
  background: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 25%, transparent);
}
.prev-feed__title-link {
  flex: 1;
  font-size: 12.5px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 90%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.prev-feed__chevron { color: color-mix(in srgb, var(--brand-text) 50%, transparent); }
.prev-feed__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.prev-feed__item-icon { color: var(--brand-primary); margin-top: 2px; }
.prev-feed__item-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.prev-feed__item-title {
  font-size: 12.5px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 90%, transparent);
}
.prev-feed__item-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  white-space: pre-line;
}
.prev-feed__item-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

/* PREVIEW: CTA */
.prev-cta {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 22px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
  background:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--brand-primary) 14%, transparent) 0%, transparent 55%),
    rgba(40, 44, 52, 0.95);
  position: relative;
  overflow: hidden;
}
.prev-cta__glow {
  position: absolute;
  top: -40px; right: -40px;
  width: 180px; height: 180px;
  border-radius: 999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 18%, transparent) 0%, transparent 70%);
  pointer-events: none;
  filter: blur(8px);
}
.prev-cta__head {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}
.prev-cta__icon { color: var(--brand-primary); }
.prev-cta__title {
  flex: 1;
  margin: 0;
  font-family: var(--brand-font);
  font-size: 16px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
}
.prev-cta__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px; height: 24px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.prev-cta__body {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  white-space: pre-line;
  position: relative;
}
.prev-cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  align-self: flex-start;
  padding: 9px 16px;
  border-radius: 11px;
  background: linear-gradient(135deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 80%, white) 100%);
  color: var(--text-on-primary, #1a0a2e);
  font-size: 13px;
  font-weight: 600;
  position: relative;
}

/* PREVIEW: MODAL */
.prev-modal-wrap {
  position: relative;
  width: 100%;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.prev-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.prev-modal {
  position: relative;
  border-radius: 14px;
  background: rgba(40, 44, 52, 0.98);
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
  max-height: 280px;
  overflow-y: auto;
  width: 90%;
}
.prev-modal--sm { max-width: 240px; }
.prev-modal--md { max-width: 340px; }
.prev-modal--lg { max-width: 440px; }
.prev-modal__close {
  position: absolute;
  top: 10px; right: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px; height: 24px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  z-index: 1;
}
.prev-modal__img {
  width: 100%;
  max-height: 120px;
  object-fit: cover;
  display: block;
}
.prev-modal__inner {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.prev-modal__head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.prev-modal__icon { color: var(--brand-primary); }
.prev-modal__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 16px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
}
.prev-modal__body {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  white-space: pre-line;
}
.prev-modal__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 8px 14px;
  border-radius: 9px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}

.prev-poll-opts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.prev-poll-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 11px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  color: color-mix(in srgb, var(--brand-text) 85%, transparent);
  font-size: 11.5px;
  text-align: left;
}
.prev-poll-check {
  display: inline-block;
  width: 14px; height: 14px;
  border-radius: 4px;
  border: 2px solid var(--brand-primary);
  flex-shrink: 0;
}

/* PREVIEW: EMAIL */
.prev-email {
  width: 100%;
  display: flex;
  justify-content: center;
}
.prev-email__client {
  width: 100%;
  max-width: 380px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  overflow: hidden;
}
.prev-email__client-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.prev-email__client-dot {
  width: 8px; height: 8px; border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 18%, transparent);
}
.prev-email__envelope {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.prev-email__from {
  display: flex;
  align-items: center;
  gap: 10px;
}
.prev-email__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary);
}
.prev-email__from-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.prev-email__sender {
  font-size: 12.5px;
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 92%, transparent);
}
.prev-email__address {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
.prev-email__subject {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 16px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
}
.prev-email__img {
  width: 100%;
  max-height: 100px;
  object-fit: cover;
  border-radius: 5px;
}
.prev-email__body {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  white-space: pre-line;
}
.prev-email__btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  padding: 8px 14px;
  border-radius: 7px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  font-size: 12px;
  font-weight: 600;
}

/* ============ ANALYTICS CARD ============ */
.analytics-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.analytics-card__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
@media (min-width: 480px) {
  .analytics-grid { grid-template-columns: repeat(4, 1fr); }
}
.analytics-stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.analytics-stat__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
.analytics-stat__value {
  font-family: var(--brand-font);
  font-weight: 200;
  font-size: 22px;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
}
.analytics-stat__sub {
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.poll-results {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.poll-results__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
  margin-bottom: 4px;
}
.poll-result-row {
  display: grid;
  grid-template-columns: 1fr 60px 30px;
  align-items: center;
  gap: 10px;
}
.poll-result-row__name {
  font-size: 11.5px;
  color: color-mix(in srgb, var(--brand-text) 85%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.poll-result-row__bar {
  display: block;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  overflow: hidden;
}
.poll-result-row__fill {
  display: block;
  height: 100%;
  background: var(--brand-primary);
  border-radius: 999px;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
}
.poll-result-row__count {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  font-weight: 600;
  text-align: right;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}
</style>
