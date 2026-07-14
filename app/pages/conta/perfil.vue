<script setup lang="ts">
// /conta/perfil — dados de identificação (PR1). Nome e telefone editáveis via
// PUT /auth/profile (aceita name + celular direto, sem PIN). E-mail read-only:
// a troca passa pela verificação por código (fluxo separado, fora deste PR).
// CPF fica de fora: o backend não tem (decisão do dono 2026-07-14).
const { data: me, refresh } = await useMe()
const { authFetch } = useApi()
const { setSession, token } = useAuthState()

const u = computed(() => me.value?.user ?? null)

const form = reactive({ name: '', celular: '' })
const baseline = reactive({ name: '', celular: '' })
watchEffect(() => {
  if (!u.value) return
  const n = u.value.name ?? ''
  const c = (u.value.celular as string | null) ?? ''
  form.name = n
  form.celular = c
  baseline.name = n
  baseline.celular = c
})
const email = computed(() => u.value?.email ?? '')

const dirty = computed(() => form.name.trim() !== baseline.name || form.celular.trim() !== baseline.celular)
const saving = ref(false)
const saved = ref(false)
const errorMsg = ref('')

async function save() {
  if (!dirty.value || saving.value || !u.value) return
  saving.value = true
  saved.value = false
  errorMsg.value = ''

  const body: Record<string, string> = {}
  if (form.name.trim() && form.name.trim() !== baseline.name) body.name = form.name.trim()
  // celular só vai se mudou E não está vazio: mandar '' apagaria o número
  // (coluna unique) por engano — pra remover, seria um fluxo próprio.
  if (form.celular.trim() && form.celular.trim() !== baseline.celular) body.celular = form.celular.trim()
  if (!Object.keys(body).length) { saving.value = false; return }

  try {
    await authFetch('/auth/profile', { method: 'PUT', body })
    await refresh()
    // mantém a saudação global ("Olá, Nome") em sincronia
    if (body.name && token.value) {
      setSession(token.value, { id: Number(u.value.id), name: body.name, email: email.value || undefined })
    }
    saved.value = true
    setTimeout(() => (saved.value = false), 2600)
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    errorMsg.value = err?.data?.message || 'Não foi possível salvar agora. Tente de novo.'
  }
  finally {
    saving.value = false
  }
}

// "Última atualização" relativa — client-only pra não divergir na hidratação
// (depende do "agora"). Fica vazia no SSR e aparece após montar.
const updatedLabel = ref('')
onMounted(() => {
  const iso = u.value?.updated_at
  if (iso) updatedLabel.value = relativeTimePt(iso)
})
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
  <ContaSection title="Perfil" subtitle="Seus dados de identificação na Redentia.">
    <form class="pf" @submit.prevent="save">
      <div class="pf__grid">
        <ContaField v-model="form.name" label="Nome completo" autocomplete="name" placeholder="Seu nome" />
        <ContaField
          label="E-mail"
          :model-value="email"
          readonly
          hint="Para trocar o e-mail usamos verificação por código."
        />
        <ContaField v-model="form.celular" label="Telefone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 90000-0000" />
      </div>

      <p v-if="errorMsg" class="pf__err">{{ errorMsg }}</p>

      <div class="pf__actions">
        <button type="submit" class="pf__save" :disabled="!dirty || saving">
          {{ saving ? 'Salvando...' : saved ? 'Salvo' : 'Salvar alterações' }}
        </button>
        <span v-if="updatedLabel" class="pf__meta">Última atualização {{ updatedLabel }}</span>
      </div>
    </form>
  </ContaSection>
</template>

<style scoped>
.pf__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(18px, 2.5vw, 26px); }
.pf__err { margin: 18px 0 0; color: var(--nu-red); font-size: 14px; font-weight: 600; }
.pf__actions { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; margin-top: clamp(24px, 3vw, 34px); }
.pf__save {
  background: var(--nu-blue); color: var(--nu-white); border: none; cursor: pointer;
  border-radius: var(--nu-r-pill); padding: 15px 30px;
  font-family: var(--nu-font); font-size: 16px; font-weight: 800; letter-spacing: -.1px;
  transition: background .18s, opacity .18s;
}
.pf__save:hover:not(:disabled) { background: var(--nu-blue-hover); }
.pf__save:disabled { opacity: .5; cursor: default; }
.pf__meta { color: var(--nu-gray); font-size: 14px; font-weight: 500; }

@media (max-width: 620px) {
  .pf__grid { grid-template-columns: 1fr; }
}
</style>
