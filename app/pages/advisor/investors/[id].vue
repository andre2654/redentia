<template>
  <NuxtLayout title="Detalhe do investidor">
    <div class="flex h-full flex-col gap-6 p-6">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/advisor"
          class="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <UIcon name="i-lucide-arrow-left" class="h-5 w-5" />
        </NuxtLink>
        <div class="flex flex-col gap-1">
          <h2 class="text-[18px] font-bold">{{ investorName }}</h2>
          <p class="text-xs text-white/50">{{ investorEmail }}</p>
        </div>
        <NuxtLink
          :to="`/help?advisor_chat=${route.params.id}`"
          class="ml-auto"
        >
          <UButton color="primary" size="sm" icon="i-lucide-message-circle" label="Enviar mensagem" />
        </NuxtLink>
      </div>

      <!-- Sugestão de mensagem -->
      <div class="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
        <h3 class="mb-2 text-sm font-semibold text-white">Sugerir mensagem</h3>
        <p class="mb-3 text-xs text-white/60">Gere um rascunho personalizado com base no perfil e na carteira do investidor.</p>
        <UButton
          color="secondary"
          size="sm"
          :loading="suggestLoading"
          label="Sugerir mensagem"
          @click="loadSuggestedMessage"
        />
        <div v-if="suggestedDraft" class="mt-4">
          <UTextarea
            v-model="suggestedDraft"
            :rows="5"
            class="w-full"
            :ui="{ base: 'rounded-xl border-white/10 bg-white/5 text-white' }"
          />
          <UButton
            class="mt-2"
            color="primary"
            size="sm"
            :loading="sendingDraft"
            label="Enviar esta mensagem"
            @click="sendDraftMessage"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <UButton
          :color="tab === 'profile' ? 'primary' : 'neutral'"
          variant="soft"
          size="sm"
          label="Perfil"
          @click="tab = 'profile'"
        />
        <UButton
          :color="tab === 'notes' ? 'primary' : 'neutral'"
          variant="soft"
          size="sm"
          label="Anotações"
          @click="tab = 'notes'"
        />
        <UButton
          :color="tab === 'portfolio' ? 'primary' : 'neutral'"
          variant="soft"
          size="sm"
          label="Carteira"
          @click="tab = 'portfolio'; loadPortfolio()"
        />
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-secondary" />
      </div>

      <div v-else-if="tab === 'profile'" class="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 class="mb-4 text-sm font-semibold text-white">Perfil do investidor</h3>
        <UForm :state="profileState" class="flex flex-col gap-4" @submit="saveProfile">
          <UFormField label="Tolerância a risco">
            <UInput
              v-model="profileState.risk_tolerance"
              placeholder="Ex: Conservador, Moderado, Agressivo"
              class="w-full max-w-md"
              :ui="{ base: 'rounded-xl border-white/10 bg-white/5' }"
            />
          </UFormField>
          <UFormField label="Objetivos">
            <UTextarea
              v-model="profileState.objectives"
              placeholder="Objetivos de investimento..."
              :rows="3"
              class="w-full max-w-md"
              :ui="{ base: 'rounded-xl border-white/10 bg-white/5' }"
            />
          </UFormField>
          <UFormField label="Eventos de vida (um por linha)">
            <UTextarea
              v-model="profileState.life_events_text"
              placeholder="Ex: Viagem à Inglaterra&#10;Mudança de emprego"
              :rows="3"
              class="w-full max-w-md"
              :ui="{ base: 'rounded-xl border-white/10 bg-white/5' }"
            />
          </UFormField>
          <UButton type="submit" color="primary" size="lg" :loading="savingProfile" label="Salvar perfil" />
        </UForm>
      </div>

      <div v-else-if="tab === 'notes'" class="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 class="mb-4 text-sm font-semibold text-white">Anotações</h3>
        <form class="mb-6 flex gap-2" @submit.prevent="addNote">
          <UTextarea
            v-model="newNoteContent"
            placeholder="Nova anotação..."
            :rows="2"
            class="min-w-0 flex-1"
            :ui="{ base: 'rounded-xl border-white/10 bg-white/5' }"
          />
          <UButton type="submit" color="primary" :disabled="!newNoteContent.trim() || savingNote" :loading="savingNote" icon="i-lucide-plus" />
        </form>
        <div class="space-y-3">
          <div
            v-for="note in notes"
            :key="note.id"
            class="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/90"
          >
            <p class="whitespace-pre-wrap">{{ note.content }}</p>
            <p class="mt-2 text-[11px] text-white/40">{{ formatDate(note.created_at) }}</p>
          </div>
          <p v-if="!notes.length && !loading" class="text-sm text-white/50">Nenhuma anotação ainda.</p>
        </div>
      </div>

      <div v-else-if="tab === 'portfolio'" class="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 class="mb-4 text-sm font-semibold text-white">Carteira do investidor</h3>
        <div v-if="portfolioLoading" class="flex justify-center py-8">
          <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-secondary" />
        </div>
        <div v-else-if="!portfolioPositions.length" class="py-6 text-center text-sm text-white/50">
          O investidor ainda não importou nenhuma carteira.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-white/10">
              <tr>
                <th class="px-3 py-2 font-medium text-white">Ticker</th>
                <th class="px-3 py-2 font-medium text-white">Quantidade</th>
                <th class="px-3 py-2 font-medium text-white">Preço médio</th>
                <th class="px-3 py-2 font-medium text-white">Valor total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr v-for="p in portfolioPositions" :key="p.ticker" class="text-white/80">
                <td class="px-3 py-2">{{ p.ticker }}</td>
                <td class="px-3 py-2">{{ formatNumber(p.quantity) }}</td>
                <td class="px-3 py-2">{{ formatBRL(p.average_price) }}</td>
                <td class="px-3 py-2">{{ formatBRL(p.quantity * p.average_price) }}</td>
              </tr>
            </tbody>
            <tfoot class="border-t border-white/10 font-medium">
              <tr>
                <td colspan="3" class="px-3 py-2 text-white">Total</td>
                <td class="px-3 py-2 text-white">{{ formatBRL(portfolioTotal) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const id = computed(() => Number(route.params.id))
const { getInvestorProfile, updateInvestorProfile, getInvestorNotes, storeInvestorNote, getInvestorPortfolio, suggestMessage } = useAdvisorService()
const { send } = useMessagesService()

const tab = ref<'profile' | 'notes' | 'portfolio'>('profile')
const loading = ref(true)
const savingProfile = ref(false)
const savingNote = ref(false)
const investorName = ref('')
const investorEmail = ref('')
const profileState = reactive({
  risk_tolerance: '',
  objectives: '',
  life_events_text: '',
})
const notes = ref<Array<{ id: number; content: string; created_at: string }>>([])
const newNoteContent = ref('')
const portfolioPositions = ref<Array<{ ticker: string; quantity: number; average_price: number }>>([])
const portfolioLoading = ref(false)
const suggestLoading = ref(false)
const suggestedDraft = ref('')
const sendingDraft = ref(false)

async function loadProfile() {
  try {
    const resp = await getInvestorProfile(id.value)
    const p = resp.profile
    profileState.risk_tolerance = p.risk_tolerance ?? ''
    profileState.objectives = p.objectives ?? ''
    profileState.life_events_text = Array.isArray(p.life_events) ? p.life_events.join('\n') : ''
  } catch {
    //
  }
}

async function loadNotes() {
  try {
    const resp = await getInvestorNotes(id.value)
    notes.value = resp.notes ?? []
  } catch {
    notes.value = []
  }
}

async function loadInvestorInfo() {
  const { getInvestors } = useAdvisorService()
  const resp = await getInvestors()
  const inv = resp.investors?.find((i) => Number(i.id) === id.value)
  if (inv) {
    investorName.value = inv.name ?? ''
    investorEmail.value = inv.email ?? ''
  }
}

async function saveProfile() {
  savingProfile.value = true
  try {
    const life_events = profileState.life_events_text
      ? profileState.life_events_text.split('\n').map((s) => s.trim()).filter(Boolean)
      : []
    await updateInvestorProfile(id.value, {
      risk_tolerance: profileState.risk_tolerance || undefined,
      objectives: profileState.objectives || undefined,
      life_events,
    })
    showSuccessNotification('Perfil salvo', 'Alterações gravadas.')
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? 'Não foi possível salvar.')
  } finally {
    savingProfile.value = false
  }
}

async function addNote() {
  const content = newNoteContent.value.trim()
  if (!content || savingNote.value) return
  savingNote.value = true
  try {
    const resp = await storeInvestorNote(id.value, content)
    notes.value = [resp.note, ...notes.value]
    newNoteContent.value = ''
    showSuccessNotification('Anotação adicionada', '')
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? 'Não foi possível adicionar.')
  } finally {
    savingNote.value = false
  }
}

const portfolioTotal = computed(() =>
  portfolioPositions.value.reduce((s, p) => s + p.quantity * p.average_price, 0)
)

function formatBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(n)
}

async function loadSuggestedMessage() {
  suggestLoading.value = true
  suggestedDraft.value = ''
  try {
    const resp = await suggestMessage(id.value)
    suggestedDraft.value = resp.suggested_message ?? ''
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? 'Não foi possível gerar a sugestão.')
  } finally {
    suggestLoading.value = false
  }
}

async function sendDraftMessage() {
  const text = suggestedDraft.value.trim()
  if (!text || sendingDraft.value) return
  sendingDraft.value = true
  try {
    await send(id.value, text)
    showSuccessNotification('Mensagem enviada', '')
    suggestedDraft.value = ''
  } catch (e: any) {
    showErrorNotification('Erro ao enviar', e?.data?.message ?? 'Tente novamente.')
  } finally {
    sendingDraft.value = false
  }
}

async function loadPortfolio() {
  portfolioLoading.value = true
  try {
    const resp = await getInvestorPortfolio(id.value)
    portfolioPositions.value = resp.positions ?? []
  } catch {
    portfolioPositions.value = []
  } finally {
    portfolioLoading.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  if (authStore.me?.role !== 'advisor') {
    navigateTo('/settings')
    return
  }
  loading.value = true
  try {
    await Promise.all([loadInvestorInfo(), loadProfile(), loadNotes()])
  } finally {
    loading.value = false
  }
})
</script>
