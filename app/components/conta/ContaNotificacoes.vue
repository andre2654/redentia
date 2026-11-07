<script setup lang="ts">
// Seção Notificações de /conta (PR4). Central onde a pessoa escolhe ONDE recebe
// (canais e-mail / WhatsApp) e O QUÊ. O resumo diário vive em useBriefingPrefs
// (cache local + o backend), compartilhado com o botão da home. Alternar salva
// na hora. Contato (e-mail/telefone) vem do /auth/me.
//
// "Avisos da carteira" (07/11/2026; plano, Parte 4.8): uma linha por tópico
// novo (a semana, os proventos do mês e o do dia, o relatório, o imposto e as
// ideias), com o exemplo da mensagem e os dois canais. É o mesmo lugar que o pé
// do modal de avisos da /carteira grava (usePreferenciasDaCarteira). O
// WhatsApp só liga com o aceite da pessoa; sem ele, fica desligado com a dica.
import { TOPICOS_CARTEIRA, type TopicoCarteira } from '~/utils/avisosCanais'

const { data: me } = await useMe()
const { prefs, save, hydrate } = useBriefingPrefs()
const carteira = usePreferenciasDaCarteira()

const u = computed(() => me.value?.user ?? null)
onMounted(() => {
  hydrate()
  void carteira.carregar({ user: u.value })
})
const carteiraPronta = computed(() => carteira.estado.value === 'pronto')
function mudarCarteira(t: TopicoCarteira, canal: 'email' | 'whatsapp', v: boolean) {
  void carteira.salvar(t, { ...carteira.prefs.value[t], [canal]: v })
}

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

      <div class="nt__topic nt__carteira">
        <h3 class="nt__topic-title">Avisos da carteira</h3>
        <p class="nt__topic-desc">O que a Redentia manda sobre a sua carteira, além da tela. Sem nada ligado, o aviso fica só na carteira.</p>

        <ul class="nt__avisos">
          <li v-for="t in TOPICOS_CARTEIRA" :key="t.id" class="nt__aviso">
            <div class="nt__aviso-txt">
              <span class="nt__aviso-n">{{ t.nome }}<span class="nt__aviso-q">{{ t.quando }}</span></span>
              <span class="nt__aviso-ex">“{{ t.exemplo }}”</span>
            </div>
            <div v-if="carteiraPronta" class="nt__aviso-ch">
              <label class="nt__aviso-c" :class="{ 'nt__aviso-c--off': !carteira.optIn.value }">
                <span>WhatsApp</span>
                <NuToggle :model-value="carteira.prefs.value[t.id].whatsapp" :disabled="!carteira.optIn.value" :aria-label="`${t.nome} por WhatsApp`" @update:model-value="(v: boolean) => mudarCarteira(t.id, 'whatsapp', v)" />
              </label>
              <label class="nt__aviso-c">
                <span>E-mail</span>
                <NuToggle :model-value="carteira.prefs.value[t.id].email" :aria-label="`${t.nome} por e-mail`" @update:model-value="(v: boolean) => mudarCarteira(t.id, 'email', v)" />
              </label>
            </div>
            <div v-else-if="carteira.estado.value !== 'erro'" class="nt__aviso-ch" aria-hidden="true">
              <NuSkeleton width="112px" height="30px" radius="pill" />
              <NuSkeleton width="96px" height="30px" radius="pill" />
            </div>
            <p v-if="carteira.erro.value?.topico === t.id" class="nt__erro nt__erro--linha" role="status">{{ carteira.erro.value.texto }}</p>
          </li>
        </ul>
        <p v-if="carteiraPronta && !carteira.optIn.value" class="nt__dica">O WhatsApp fica desligado até você aceitar receber a Redentia por lá.</p>
        <p v-if="carteira.estado.value === 'erro'" class="nt__erro">Não consegui ler estes avisos agora. Recarregue a página para tentar de novo.</p>
      </div>

      <p class="nt__note">Suas preferências são salvas automaticamente.</p>
    </div>
  </ContaSection>
</template>

<style scoped>
.nt__topic { background: var(--nu-cream); border-radius: var(--nu-r-card); padding: 22px 24px; }
.nt__topic-title { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -.2px; }
.nt__topic-desc { margin: 6px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }

.nt__channels { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.nt__ch {
  display: flex; align-items: center; gap: 14px;
  background: var(--nu-white); border-radius: var(--nu-r-input); padding: 14px 16px;
}
.nt__ch-ic { flex-shrink: 0; width: 40px; height: 40px; border-radius: 11px; display: inline-flex; align-items: center; justify-content: center; }
.nt__ch-ic--wa { background: var(--nu-green-bg); color: var(--nu-green); }
.nt__ch-ic--mail { background: var(--nu-blue-bg); color: var(--nu-blue); }
.nt__ch-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.nt__ch-name { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.nt__ch-meta { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.nt__note { margin: 16px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; }

/* avisos da carteira: o mesmo cartão, uma linha branca por tópico */
.nt__carteira { margin-top: 14px; }
.nt__avisos { list-style: none; display: flex; flex-direction: column; gap: 10px; margin: 20px 0 0; padding: 0; }
.nt__aviso { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px 20px; background: var(--nu-white); border-radius: var(--nu-r-input); padding: 14px 16px; }
.nt__erro--linha { flex-basis: 100%; margin: 0; }
.nt__aviso-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.nt__aviso-n { display: flex; align-items: baseline; flex-wrap: wrap; gap: 2px 8px; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.nt__aviso-q { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 600; }
.nt__aviso-ex { color: var(--nu-gray-2); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; }
.nt__aviso-ch { flex-shrink: 0; display: flex; align-items: center; gap: 16px; }
.nt__aviso-c { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; cursor: pointer; }
.nt__aviso-c--off { color: var(--nu-gray); cursor: not-allowed; }
.nt__dica { margin: 12px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.5; }
.nt__erro { margin: 12px 0 0; color: var(--nu-amber-text); font-size: var(--nu-fs-dense); font-weight: 600; line-height: 1.5; }
/* no celular, um canal por linha (o nome à esquerda, o interruptor à direita), como no resumo diário */
@media (max-width: 640px) {
  .nt__aviso { flex-direction: column; align-items: stretch; }
  .nt__aviso-ch { flex-direction: column; align-items: stretch; gap: 8px; }
  .nt__aviso-c { justify-content: space-between; }
}
</style>
