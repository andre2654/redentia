<script setup lang="ts">
// Seção Segurança de /conta (PR2). Trocar senha via PUT /auth/password (já
// existe e valida current_password + Password::min(8) letters/numbers/mixedCase
// + confirmed). "Sessão atual" é honesta: o modelo do backend é sessão única
// (todo login apaga os tokens antigos), então mostramos só o dispositivo atual
// (derivado do user-agent no cliente), sem lista falsa de dispositivos.
//
// "Senha alterada há X" é CONDICIONAL: depende da coluna password_changed_at,
// que ainda não está em prod (drift git↔backend a reconciliar). O v-if deixa a
// linha aparecer sozinha e em segurança quando o backend passar a devolvê-la.
const { data: me } = await useMe()
const { authFetch } = useApi()

const u = computed(() => me.value?.user ?? null)

const form = reactive({ current: '', next: '', confirm: '' })
const saving = ref(false)
const done = ref(false)
const errorMsg = ref('')

const canSubmit = computed(() =>
  form.current.length >= 1 && form.next.length >= 8 && form.confirm.length >= 1 && !saving.value)

async function changePassword() {
  if (!canSubmit.value) return
  if (form.next !== form.confirm) {
    errorMsg.value = 'A confirmação da nova senha não corresponde.'
    return
  }
  saving.value = true
  done.value = false
  errorMsg.value = ''
  try {
    await authFetch('/auth/password', {
      method: 'PUT',
      body: { current_password: form.current, password: form.next, password_confirmation: form.confirm },
    })
    form.current = ''
    form.next = ''
    form.confirm = ''
    done.value = true
    setTimeout(() => (done.value = false), 3200)
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string; errors?: Record<string, string[]> } }
    errorMsg.value = err?.data?.errors?.password?.[0]
      || err?.data?.errors?.current_password?.[0]
      || err?.data?.message
      || 'Não foi possível alterar a senha agora. Tente de novo.'
  }
  finally {
    saving.value = false
  }
}

// "senha alterada há X" — só quando o backend devolver password_changed_at
const changedLabel = ref('')
// dispositivo da sessão atual (client-only: navigator só existe no cliente)
const device = ref('')
onMounted(() => {
  const iso = u.value?.password_changed_at
  if (iso) changedLabel.value = relativeTimePt(iso)
  device.value = describeDevice(navigator.userAgent)
})

function describeDevice(ua: string): string {
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Navegador'
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : ''
  return os ? `${browser} no ${os}` : browser
}
function relativeTimePt(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const min = Math.floor(Math.max(0, Date.now() - then) / 60000)
  if (min < 1) return 'agora mesmo'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.floor(h / 24)
  if (d < 30) return `há ${d} ${d === 1 ? 'dia' : 'dias'}`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `há ${mo} ${mo === 1 ? 'mês' : 'meses'}`
  const y = Math.floor(mo / 12)
  return `há ${y} ${y === 1 ? 'ano' : 'anos'}`
}
</script>

<template>
  <ContaSection title="Segurança" subtitle="Senha e acesso da sua conta.">
    <!-- Senha -->
    <div class="sg-block">
      <div class="sg-block__head">
        <h3 class="sg-block__title">Senha</h3>
        <span v-if="changedLabel" class="sg-block__meta">Alterada {{ changedLabel }}</span>
      </div>
      <form class="sg-form" @submit.prevent="changePassword">
        <ContaField v-model="form.current" type="password" label="Senha atual" autocomplete="current-password" placeholder="Sua senha atual" />
        <div class="sg-grid">
          <ContaField
            v-model="form.next"
            type="password"
            label="Nova senha"
            autocomplete="new-password"
            placeholder="Nova senha"
            hint="Mín. 8 caracteres, com letras, números e maiúsculas e minúsculas."
          />
          <ContaField v-model="form.confirm" type="password" label="Confirmar nova senha" autocomplete="new-password" placeholder="Repita a nova senha" />
        </div>

        <p v-if="errorMsg" class="sg-err">{{ errorMsg }}</p>

        <div class="sg-actions">
          <button type="submit" class="sg-save" :disabled="!canSubmit">
            {{ saving ? 'Alterando...' : done ? 'Senha alterada' : 'Alterar senha' }}
          </button>
        </div>
      </form>
    </div>

    <div class="sg-div" />

    <!-- Sessão atual -->
    <div class="sg-block">
      <h3 class="sg-block__title">Sessão atual</h3>
      <div class="sg-session">
        <span class="sg-session__ic" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
        </span>
        <div class="sg-session__txt">
          <span class="sg-session__dev">{{ device || 'Este dispositivo' }}</span>
          <span class="sg-session__sub">Ativo agora, este dispositivo</span>
        </div>
      </div>
    </div>
  </ContaSection>
</template>

<style scoped>
.sg-block__head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.sg-block__title { margin: 0; color: var(--nu-ink); font-size: 19px; font-weight: 800; letter-spacing: -.2px; }
.sg-block__meta { color: var(--nu-gray); font-size: 14px; font-weight: 500; }
.sg-form { margin-top: 18px; display: flex; flex-direction: column; gap: clamp(16px, 2.2vw, 22px); }
.sg-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(16px, 2.2vw, 22px); }
.sg-err { margin: 0; color: var(--nu-red); font-size: 14px; font-weight: 600; }
.sg-actions { display: flex; }
.sg-save {
  background: var(--nu-blue); color: var(--nu-white); border: none; cursor: pointer;
  border-radius: var(--nu-r-pill); padding: 14px 28px;
  font-family: var(--nu-font); font-size: 15.5px; font-weight: 800; letter-spacing: -.1px;
  transition: background .18s, opacity .18s;
}
.sg-save:hover:not(:disabled) { background: var(--nu-blue-hover); }
.sg-save:disabled { opacity: .5; cursor: default; }

.sg-div { height: 1px; background: var(--nu-cream-2); margin: clamp(26px, 3.4vw, 38px) 0; }

.sg-session { display: flex; align-items: center; gap: 14px; margin-top: 16px; background: var(--nu-cream); border-radius: var(--nu-r-card); padding: 18px 20px; }
.sg-session__ic {
  flex-shrink: 0; width: 42px; height: 42px; border-radius: 12px;
  background: var(--nu-white); color: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center;
}
.sg-session__txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.sg-session__dev { color: var(--nu-ink); font-size: 16px; font-weight: 800; }
.sg-session__sub { color: var(--nu-gray-2); font-size: 13.5px; font-weight: 500; }

@media (max-width: 620px) {
  .sg-grid { grid-template-columns: 1fr; }
}
</style>
