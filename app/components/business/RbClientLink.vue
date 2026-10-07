<script setup lang="ts">
/**
 * O link de convite de um cliente, no único instante em que ele existe (a
 * resposta do POST que o criou). Artefato navy, igual ao segredo da chave em
 * RbKeysTable: o mesmo gesto para "isto é segredo e não volta".
 * Usado em /business/clientes no topo (cliente novo) e dentro da linha do
 * cliente (novo link para quem já existe).
 */
import type { LinkGerado } from '~/composables/useBusinessClients'

defineProps<{ link: LinkGerado, copiado: boolean }>()
defineEmits<{ (e: 'copiar'): void }>()
</script>

<template>
  <div class="rbcln" role="status">
    <span class="rbcln__l">Link de convite · {{ link.clientName }}</span>
    <code class="rbcln__code" data-clarity-mask="true">{{ link.url }}</code>
    <button type="button" class="rbcln__copy" @click="$emit('copiar')">{{ copiado ? 'Copiado' : 'Copiar link' }}</button>
    <p class="rbcln__warn">
      Ele aparece só agora. Vale uma vez<template v-if="link.expiresAt">, até {{ dataCurta(link.expiresAt) }}</template>.
      Se perder, gere outro no cliente.
    </p>
  </div>
</template>

<style scoped>
.rbcln {
  margin-top: 20px; background: var(--nu-navy); border-radius: var(--nu-r-card-lg);
  padding: clamp(20px, 2.6vw, 28px); animation: nu-fade .45s ease both;
}
.rbcln__l { display: block; color: var(--nu-cream-text-50); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; overflow-wrap: anywhere; }
.rbcln__code {
  display: block; margin-top: 12px; background: var(--nu-navy-2); border: 1px solid var(--nu-cream-text-12);
  border-radius: var(--nu-r-input); padding: 14px 16px; color: var(--nu-cream-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.5; word-break: break-all;
}
.rbcln__copy {
  margin-top: 12px; min-height: 44px; padding: 0 22px; border: none; cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  font-size: 14px; font-weight: 800; font-family: inherit;
}
.rbcln__copy:hover { background: var(--nu-blue-hover); }
.rbcln__copy:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 2px; }
.rbcln__warn { margin: 12px 0 0; color: var(--nu-cream-text-70); font-size: 13.5px; font-weight: 600; line-height: 1.55; }
</style>
