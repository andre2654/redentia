<script setup lang="ts">
// Modal de opt-in do "resumo diário" (design do dono). Mesmo chrome dos modais
// Nu (NuDayModal): Teleport pro body, scrim+blur, Escape/click-fora/scroll-lock,
// foco, keyframes qmfade/qmrise. PR4: MOCK — salva canais (email/WhatsApp) em
// localStorage via useBriefingPrefs, sem backend ainda.
//
// LOGADO: dois canais com toggle (WhatsApp no número mascarado, E-mail na caixa)
// + preview + "Salvar preferências". DESLOGADO: vira CTA de cadastro (o contato
// vem da conta) → /login. Busca o contato só quando abre E logado (nunca dispara
// /auth/me pro anônimo → sem redirect indesejado na home pública).
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { isAuthenticated } = useAuthState()
const { authFetch } = useApi()
const { prefs, save, hydrate } = useBriefingPrefs()
const route = useRoute()
const loginTo = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`)

const cardRef = ref<HTMLElement | null>(null)
const titleId = useId()

// rascunho local (só grava no "Salvar")
const draft = reactive({ whatsapp: false, email: false })
const contact = ref<{ email: string | null, celular: string | null }>({ email: null, celular: null })
const saved = ref(false)

function maskPhone(raw: string | null): string {
  if (!raw) return ''
  const d = raw.replace(/\D/g, '')
  if (d.length < 8) return raw
  const last4 = d.slice(-4)
  const withCc = d.startsWith('55')
  const rest = withCc ? d.slice(2) : d
  const ddd = rest.slice(0, 2)
  return `${withCc ? '+55 ' : ''}${ddd} 9••••-${last4}`
}
const maskedPhone = computed(() => maskPhone(contact.value.celular))
const hasPhone = computed(() => !!contact.value.celular)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(() => props.open, async (open) => {
  if (import.meta.server) return
  document.documentElement.style.overflow = open ? 'hidden' : ''
  if (!open) {
    document.removeEventListener('keydown', onKey)
    return
  }
  hydrate()
  draft.whatsapp = prefs.value.whatsapp
  draft.email = prefs.value.email
  saved.value = false
  document.addEventListener('keydown', onKey)
  nextTick(() => cardRef.value?.focus())
  // contato do usuário só quando logado (evita /auth/me → redirect no anônimo)
  if (isAuthenticated.value && !contact.value.email && !contact.value.celular) {
    try {
      const r = await authFetch<{ user: { email: string | null, celular?: string | null } }>('/auth/me', {}, { redirectOnAuthError: false })
      contact.value = { email: r.user.email, celular: r.user.celular ?? null }
    }
    catch { /* sem contato → a UI cai no fallback */ }
  }
})

onBeforeUnmount(() => {
  if (import.meta.server) return
  document.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})

function submit() {
  save({ whatsapp: draft.whatsapp && hasPhone.value, email: draft.email })
  saved.value = true
  setTimeout(() => emit('close'), 650)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="nbm" @click="emit('close')">
      <div ref="cardRef" class="nbm__card" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1" @click.stop>
        <div class="nbm__head">
          <div>
            <div class="nbm__eyebrow">Redentia · Alertas</div>
            <h4 :id="titleId" class="nbm__title">Receba o resumo diário</h4>
            <div class="nbm__sub">Todo dia às 7h30 · cancele quando quiser</div>
          </div>
          <button type="button" class="nbm__close" aria-label="Fechar" @click="emit('close')">✕</button>
        </div>

        <!-- LOGADO: canais + preview + salvar -->
        <template v-if="isAuthenticated">
          <div class="nbm__channels">
            <div class="nbm__ch">
              <span class="nbm__ch-ic nbm__ch-ic--wa" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.3-.9-2.8-1.2-4.5-4-4.6-4.2-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.3.1.8-.1 1.3z" /></svg>
              </span>
              <div class="nbm__ch-txt">
                <span class="nbm__ch-name">WhatsApp</span>
                <span class="nbm__ch-meta">{{ hasPhone ? `No seu número · ${maskedPhone}` : 'Adicione um telefone no seu perfil' }}</span>
              </div>
              <NuToggle v-model="draft.whatsapp" :disabled="!hasPhone" aria-label="Receber por WhatsApp" />
            </div>

            <div class="nbm__ch">
              <span class="nbm__ch-ic nbm__ch-ic--mail" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
              </span>
              <div class="nbm__ch-txt">
                <span class="nbm__ch-name">E-mail</span>
                <span class="nbm__ch-meta">{{ contact.email ? `Na sua caixa · ${contact.email}` : 'Na sua caixa de entrada' }}</span>
              </div>
              <NuToggle v-model="draft.email" aria-label="Receber por e-mail" />
            </div>
          </div>

          <div class="nbm__preview">
            <span class="nbm__preview-ic" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2z" /></svg>
            </span>
            <div class="nbm__preview-txt">
              <span class="nbm__preview-from">Redentia · hoje 7h30</span>
              <p class="nbm__preview-body">Ibovespa +1,22% ontem, bancos puxaram, petróleo caiu. Sua carteira: +R$ 761 (0,91%). Abra pra ler o resumo completo.</p>
            </div>
          </div>

          <button type="button" class="nbm__save" @click="submit">{{ saved ? 'Preferências salvas' : 'Salvar preferências' }}</button>
        </template>

        <!-- DESLOGADO: vira CTA de cadastro -->
        <template v-else>
          <p class="nbm__anon">Crie sua conta grátis pra receber o resumo do mercado e da sua carteira todo dia às 7h30, no e-mail ou no WhatsApp. Cancele quando quiser.</p>
          <div class="nbm__anon-actions">
            <NuxtLink :to="loginTo" class="nbm__save nbm__save--link">Criar conta grátis</NuxtLink>
            <NuxtLink :to="loginTo" class="nbm__ghost">Já tenho conta</NuxtLink>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.nbm {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 32px;
  animation: qmfade .18s ease;
}
.nbm__card {
  width: min(560px, 92vw); max-height: 88vh; overflow: auto;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 38px 40px 36px; box-shadow: var(--nu-shadow-day-modal);
  animation: qmrise .24s cubic-bezier(.2, .8, .2, 1);
}
.nbm__card:focus { outline: none; }
.nbm__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.nbm__eyebrow { color: var(--nu-blue); font-size: 12px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; }
.nbm__title { margin: 9px 0 0; color: var(--nu-ink); font-size: clamp(26px, 3vw, 32px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
.nbm__sub { margin-top: 7px; color: var(--nu-gray); font-size: 14px; font-weight: 600; }
.nbm__close {
  flex: 0 0 auto; width: 40px; height: 40px; border-radius: 50%; border: none;
  background: var(--nu-day-close); color: var(--nu-ink); font-size: 15px; font-weight: 800;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.nbm__close:hover { background: var(--nu-day-close-hover); }

.nbm__channels { display: flex; flex-direction: column; gap: 12px; margin-top: 28px; }
.nbm__ch {
  display: flex; align-items: center; gap: 14px;
  background: var(--nu-white); border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-card);
  padding: 16px 18px;
}
.nbm__ch-ic { flex-shrink: 0; width: 42px; height: 42px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; }
.nbm__ch-ic--wa { background: var(--nu-green-bg); color: var(--nu-green); }
.nbm__ch-ic--mail { background: var(--nu-blue-bg); color: var(--nu-blue); }
.nbm__ch-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.nbm__ch-name { color: var(--nu-ink); font-size: 16px; font-weight: 800; }
.nbm__ch-meta { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.nbm__preview { display: flex; gap: 13px; background: var(--nu-green-bg); border-radius: var(--nu-r-card); padding: 18px 20px; margin-top: 18px; }
.nbm__preview-ic { flex-shrink: 0; width: 34px; height: 34px; border-radius: 50%; background: var(--nu-green); color: var(--nu-white); display: inline-flex; align-items: center; justify-content: center; }
.nbm__preview-txt { min-width: 0; }
.nbm__preview-from { color: var(--nu-green); font-size: 13px; font-weight: 800; }
.nbm__preview-body { margin: 5px 0 0; color: var(--nu-ink-75); font-size: 14.5px; font-weight: 500; line-height: 1.5; }

.nbm__save {
  display: block; width: 100%; margin-top: 24px; text-align: center;
  background: var(--nu-blue); color: var(--nu-white); border: none; border-radius: var(--nu-r-pill);
  padding: 16px 24px; font-family: var(--nu-font); font-size: 16px; font-weight: 800; cursor: pointer;
  transition: background .2s;
}
.nbm__save:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.nbm__save--link { text-decoration: none; }

.nbm__anon { margin: 26px 0 0; color: var(--nu-gray-2); font-size: 16px; font-weight: 500; line-height: 1.6; }
.nbm__anon-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 22px; }
.nbm__ghost {
  display: block; width: 100%; text-align: center; text-decoration: none;
  background: transparent; color: var(--nu-ink); border: 2px solid var(--nu-cream-2); border-radius: var(--nu-r-pill);
  padding: 13px 24px; font-size: 15px; font-weight: 800; transition: background .2s;
}
.nbm__ghost:hover { background: var(--nu-cream); }

@keyframes qmfade { from { opacity: 0; } to { opacity: 1; } }
@keyframes qmrise { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }

@media (max-width: 760px) {
  .nbm { padding: 0; align-items: flex-end; }
  .nbm__card { width: 100%; max-height: 92vh; border-radius: 26px 26px 0 0; padding: 30px 24px 28px; }
}
</style>
