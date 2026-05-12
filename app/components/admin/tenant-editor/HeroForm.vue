<template>
  <div class="hero-form">
    <label class="hero-form__field">
      <span class="hero-form__label">Variant</span>
      <select :value="hero?.variant || 'centered'" class="admin-input" @change="onSelectChange('hero.variant', $event)">
        <option value="centered">Centered (manifesto generico)</option>
        <option value="radiograph">Radiograph (input + score demo, B2C self-directed)</option>
        <option value="quiet">Quiet (premium / lightness as luxury)</option>
        <option value="terminal">Terminal (Bloomberg-reimagined)</option>
        <option value="mentor">Mentor (book-cover orange chunky, Primo Rico)</option>
        <option value="split">Split (founder + quote, Me Poupe)</option>
        <option value="minimal">Minimal (data-first, Sardinha)</option>
        <option value="institutional">Institutional (sobrio, assessoria)</option>
      </select>
    </label>

    <div class="hero-form__grid">
      <label class="hero-form__field">
        <span class="hero-form__label">Eyebrow</span>
        <input
          type="text"
          :value="hero?.eyebrow || ''"
          placeholder="PLATAFORMA DE IA PARA SUA CARTEIRA"
          class="admin-input"
          @input="onTextChange('hero.eyebrow', $event)"
        />
        <span class="hero-form__hint">Pequeno texto acima do title (caps).</span>
      </label>

      <label class="hero-form__field">
        <span class="hero-form__label">Badge</span>
        <input
          type="text"
          :value="hero?.badge || ''"
          placeholder="[CARTEIRA.LIVE]"
          class="admin-input"
          @input="onTextChange('hero.badge', $event)"
        />
        <span class="hero-form__hint">Live status indicator (terminal/radiograph).</span>
      </label>
    </div>

    <label class="hero-form__field">
      <span class="hero-form__label">Title</span>
      <textarea
        :value="hero?.title || ''"
        rows="2"
        placeholder="Descubra os riscos escondidos da sua {em}carteira{/em} em 2 minutos."
        class="admin-input hero-form__textarea"
        @input="onTextChange('hero.title', $event)"
      />
      <span class="hero-form__hint">
        Use <code>{em}…{/em}</code> pra italic accent (radiograph).
      </span>
    </label>

    <label class="hero-form__field">
      <span class="hero-form__label">Subtitle</span>
      <textarea
        :value="hero?.subtitle || ''"
        rows="3"
        class="admin-input hero-form__textarea"
        @input="onTextChange('hero.subtitle', $event)"
      />
    </label>

    <div class="hero-form__grid">
      <label class="hero-form__field">
        <span class="hero-form__label">CTA principal (label)</span>
        <input
          type="text"
          :value="hero?.ctaLabel || ''"
          placeholder="Começar 7 dias grátis"
          class="admin-input"
          @input="onTextChange('hero.ctaLabel', $event)"
        />
      </label>

      <label class="hero-form__field">
        <span class="hero-form__label">CTA principal (icon)</span>
        <input
          type="text"
          :value="hero?.ctaIcon || ''"
          placeholder="i-lucide-sparkles"
          class="admin-input"
          style="font-family: 'JetBrains Mono', monospace;"
          @input="onTextChange('hero.ctaIcon', $event)"
        />
        <span class="hero-form__hint">Iconify name (lucide).</span>
      </label>

      <label class="hero-form__field">
        <span class="hero-form__label">CTA secundario (label)</span>
        <input
          type="text"
          :value="hero?.ctaSecondaryLabel || ''"
          placeholder="Já tenho conta"
          class="admin-input"
          @input="onTextChange('hero.ctaSecondaryLabel', $event)"
        />
      </label>
    </div>

    <!-- Trust indicators (array of strings) -->
    <div class="hero-form__field">
      <span class="hero-form__label">Trust indicators</span>
      <div class="hero-form__trust">
        <div
          v-for="(item, idx) in trustIndicators"
          :key="`trust-${idx}`"
          class="hero-form__trust-row"
        >
          <input
            type="text"
            :value="item"
            placeholder="Sem cartao pra começar"
            class="admin-input"
            @input="onTrustChange(idx, ($event.target as HTMLInputElement).value)"
          />
          <button
            type="button"
            class="admin-btn admin-btn--ghost admin-btn--sm hero-form__trust-remove"
            @click="onTrustRemove(idx)"
          >
            <UIcon name="i-lucide-x" class="size-3.5" />
          </button>
        </div>
        <button
          type="button"
          class="admin-btn admin-btn--ghost admin-btn--sm"
          @click="onTrustAdd"
        >
          <UIcon name="i-lucide-plus" class="size-3.5" />
          Adicionar
        </button>
      </div>
      <span class="hero-form__hint">3 itens curtos abaixo do CTA (radiograph).</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  hero: any
}>()

const emit = defineEmits<{
  (e: 'change', path: string, value: any): void
}>()

const trustIndicators = computed(() =>
  Array.isArray(props.hero?.trustIndicators) ? props.hero.trustIndicators : [],
)

function onSelectChange(path: string, ev: Event) {
  emit('change', path, (ev.target as HTMLSelectElement).value)
}

function onTextChange(path: string, ev: Event) {
  emit('change', path, (ev.target as HTMLInputElement | HTMLTextAreaElement).value)
}

function onTrustChange(idx: number, value: string) {
  const next = [...trustIndicators.value]
  next[idx] = value
  emit('change', 'hero.trustIndicators', next)
}

function onTrustAdd() {
  emit('change', 'hero.trustIndicators', [...trustIndicators.value, ''])
}

function onTrustRemove(idx: number) {
  const next = trustIndicators.value.filter((_: any, i: number) => i !== idx)
  emit('change', 'hero.trustIndicators', next)
}
</script>

<style scoped>
.hero-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hero-form__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.hero-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hero-form__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.hero-form__hint {
  font-size: 11.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.hero-form__hint code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.hero-form__textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.hero-form__trust {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hero-form__trust-row {
  display: flex;
  gap: 6px;
}
.hero-form__trust-row .admin-input {
  flex: 1 1 auto;
}
.hero-form__trust-remove {
  flex: 0 0 auto;
  color: var(--brand-negative, #ef4444);
}
</style>
