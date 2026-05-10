<template>
  <div class="seo-form">
    <div class="seo-form__group">
      <h3 class="seo-form__group-title">Identidade extendida</h3>
      <div class="seo-form__grid">
        <label class="seo-form__field">
          <span class="seo-form__label">Short name</span>
          <input
            type="text"
            :value="config?.shortName || ''"
            placeholder="Redentia"
            class="admin-input"
            @input="onChange('shortName', $event)"
          />
          <span class="seo-form__hint">Versao curta pra mobile / nav.</span>
        </label>
        <label class="seo-form__field">
          <span class="seo-form__label">Tagline</span>
          <input
            type="text"
            :value="config?.tagline || ''"
            placeholder="Investir com inteligencia."
            class="admin-input"
            @input="onChange('tagline', $event)"
          />
        </label>
      </div>
      <label class="seo-form__field">
        <span class="seo-form__label">Description</span>
        <textarea
          :value="config?.description || ''"
          rows="2"
          class="admin-input seo-form__textarea"
          @input="onChange('description', $event)"
        />
      </label>
    </div>

    <div class="seo-form__group">
      <h3 class="seo-form__group-title">SEO + meta tags</h3>
      <div class="seo-form__grid">
        <label class="seo-form__field">
          <span class="seo-form__label">Title (browser tab)</span>
          <input
            type="text"
            :value="config?.seo?.title || ''"
            class="admin-input"
            @input="onChange('seo.title', $event)"
          />
        </label>
        <label class="seo-form__field">
          <span class="seo-form__label">Theme color</span>
          <input
            type="color"
            :value="config?.seo?.themeColor || '#000000'"
            class="seo-form__color-input"
            @input="onChange('seo.themeColor', $event)"
          />
          <span class="seo-form__hint">Browser chrome color (PWA + mobile bar).</span>
        </label>
      </div>
      <label class="seo-form__field">
        <span class="seo-form__label">Description (meta)</span>
        <textarea
          :value="config?.seo?.description || ''"
          rows="2"
          class="admin-input seo-form__textarea"
          @input="onChange('seo.description', $event)"
        />
      </label>
      <div class="seo-form__grid">
        <label class="seo-form__field">
          <span class="seo-form__label">Locale</span>
          <input
            type="text"
            :value="config?.seo?.locale || 'pt_BR'"
            class="admin-input"
            style="font-family: 'JetBrains Mono', monospace;"
            @input="onChange('seo.locale', $event)"
          />
        </label>
        <label class="seo-form__field">
          <span class="seo-form__label">Lang</span>
          <input
            type="text"
            :value="config?.seo?.lang || 'pt-BR'"
            class="admin-input"
            style="font-family: 'JetBrains Mono', monospace;"
            @input="onChange('seo.lang', $event)"
          />
        </label>
      </div>
    </div>

    <div class="seo-form__group">
      <h3 class="seo-form__group-title">Suporte + empresa</h3>
      <div class="seo-form__grid">
        <label class="seo-form__field">
          <span class="seo-form__label">Email suporte</span>
          <input
            type="email"
            :value="config?.support?.email || ''"
            placeholder="contato@..."
            class="admin-input"
            @input="onChange('support.email', $event)"
          />
        </label>
        <label class="seo-form__field">
          <span class="seo-form__label">WhatsApp (E.164 sem +)</span>
          <input
            type="text"
            :value="config?.support?.whatsapp || ''"
            placeholder="551153042570"
            class="admin-input"
            style="font-family: 'JetBrains Mono', monospace;"
            @input="onChange('support.whatsapp', $event)"
          />
        </label>
      </div>
      <div class="seo-form__grid">
        <label class="seo-form__field">
          <span class="seo-form__label">Razao social</span>
          <input
            type="text"
            :value="config?.company?.legalName || ''"
            class="admin-input"
            @input="onChange('company.legalName', $event)"
          />
        </label>
        <label class="seo-form__field">
          <span class="seo-form__label">CNPJ</span>
          <input
            type="text"
            :value="config?.company?.cnpj || ''"
            placeholder="00.000.000/0000-00"
            class="admin-input"
            style="font-family: 'JetBrains Mono', monospace;"
            @input="onChange('company.cnpj', $event)"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  config: Record<string, any> | undefined
}>()

const emit = defineEmits<{
  (e: 'change', path: string, value: any): void
}>()

function onChange(path: string, ev: Event) {
  emit('change', path, (ev.target as HTMLInputElement | HTMLTextAreaElement).value)
}
</script>

<style scoped>
.seo-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.seo-form__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.seo-form__group-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--brand-text);
  padding-bottom: 6px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.seo-form__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.seo-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.seo-form__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.seo-form__hint {
  font-size: 11.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.seo-form__textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}
.seo-form__color-input {
  width: 60px;
  height: 30px;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
}
</style>
