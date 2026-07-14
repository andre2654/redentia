<script setup lang="ts">
// Seção Notificações de /conta (PR4). Central onde a pessoa escolhe ONDE recebe
// (canais e-mail / WhatsApp) e O QUÊ — por enquanto só o resumo diário. MOCK
// (decisão do dono): as preferências vivem em localStorage via useBriefingPrefs,
// compartilhadas com o botão da home; a entrega real por canal é iniciativa
// futura. Alternar salva na hora. Contato (e-mail/telefone) vem do /auth/me.
const { data: me } = await useMe()
const { prefs, save, hydrate } = useBriefingPrefs()

const u = computed(() => me.value?.user ?? null)
onMounted(hydrate)

const hasPhone = computed(() => !!u.value?.celular)

function maskPhone(raw?: string | null): string {
  if (!raw) return ''
  const d = raw.replace(/\D/g, '')
  if (d.length < 8) return raw
  const last4 = d.slice(-4)
  const withCc = d.startsWith('55')
  const rest = withCc ? d.slice(2) : d
  return `${withCc ? '+55 ' : ''}${rest.slice(0, 2)} 9••••-${last4}`
}
const maskedPhone = computed(() => maskPhone(u.value?.celular as string | null))

// toggles com auto-save (grava localStorage na hora)
const wa = computed({
  get: () => prefs.value.whatsapp,
  set: v => save({ whatsapp: v && hasPhone.value, email: prefs.value.email }),
})
const em = computed({
  get: () => prefs.value.email,
  set: v => save({ whatsapp: prefs.value.whatsapp, email: v }),
})
</script>

<template>
  <ContaSection title="Notificações" subtitle="Escolha onde e o que você recebe da Redentia.">
    <div class="nt">
      <div class="nt__topic">
        <div class="nt__topic-head">
          <div>
            <h3 class="nt__topic-title">Resumo diário</h3>
            <p class="nt__topic-desc">O mercado e a sua carteira, todo dia às 7h30. Cancele quando quiser.</p>
          </div>
        </div>

        <div class="nt__channels">
          <div class="nt__ch">
            <span class="nt__ch-ic nt__ch-ic--wa" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.3-.9-2.8-1.2-4.5-4-4.6-4.2-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.3.1.8-.1 1.3z" /></svg>
            </span>
            <div class="nt__ch-txt">
              <span class="nt__ch-name">WhatsApp</span>
              <span class="nt__ch-meta">{{ hasPhone ? `No seu número · ${maskedPhone}` : 'Adicione um telefone no seu perfil' }}</span>
            </div>
            <NuToggle v-model="wa" :disabled="!hasPhone" aria-label="Resumo diário por WhatsApp" />
          </div>

          <div class="nt__ch">
            <span class="nt__ch-ic nt__ch-ic--mail" aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            </span>
            <div class="nt__ch-txt">
              <span class="nt__ch-name">E-mail</span>
              <span class="nt__ch-meta">{{ u?.email ? `Na sua caixa · ${u.email}` : 'Na sua caixa de entrada' }}</span>
            </div>
            <NuToggle v-model="em" aria-label="Resumo diário por e-mail" />
          </div>
        </div>
      </div>

      <p class="nt__note">Suas preferências são salvas automaticamente.</p>
    </div>
  </ContaSection>
</template>

<style scoped>
.nt__topic { background: var(--nu-cream); border-radius: var(--nu-r-card); padding: 22px 24px; }
.nt__topic-title { margin: 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.2px; }
.nt__topic-desc { margin: 6px 0 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.5; }

.nt__channels { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.nt__ch {
  display: flex; align-items: center; gap: 14px;
  background: var(--nu-white); border-radius: var(--nu-r-input); padding: 14px 16px;
}
.nt__ch-ic { flex-shrink: 0; width: 40px; height: 40px; border-radius: 11px; display: inline-flex; align-items: center; justify-content: center; }
.nt__ch-ic--wa { background: var(--nu-green-bg); color: var(--nu-green); }
.nt__ch-ic--mail { background: var(--nu-blue-bg); color: var(--nu-blue); }
.nt__ch-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.nt__ch-name { color: var(--nu-ink); font-size: 15.5px; font-weight: 800; }
.nt__ch-meta { color: var(--nu-gray); font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.nt__note { margin: 16px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: 500; }
</style>
