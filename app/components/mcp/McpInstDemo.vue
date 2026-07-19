<script setup lang="ts">
// Demo animada do seletor de instituições (direção do dono 2026-07-18): o
// "filme" do Open Finance — uma janela tipo widget de conexão com a lista de
// bancos/corretoras (logos oficiais dos conectores), o cursor entra, marca
// XP, rola a lista, marca Nubank, clica em Conectar e fecha com o selo
// "somente leitura". Mesma disciplina do McpHeroDemo/NuMarketReading: frame
// inicial no SSR, timers só no client, reduced-motion = cena final estática.

type Phase = 'idle' | 'to-xp' | 'click-xp' | 'scroll' | 'to-nu' | 'click-nu' | 'to-btn' | 'click-btn' | 'done'

const LIST = [
  { slug: 'xp', name: 'XP Investimentos' },
  { slug: 'nubank', name: 'Nubank' },
  { slug: 'itau', name: 'Itaú' },
  { slug: 'btg', name: 'BTG Pactual' },
  { slug: 'rico', name: 'Rico' },
  { slug: 'inter', name: 'Inter' },
  { slug: 'bradesco', name: 'Bradesco' },
  { slug: 'c6', name: 'C6 Bank' },
  { slug: 'santander', name: 'Santander' },
  { slug: 'bb', name: 'Banco do Brasil' },
]

const phase = ref<Phase>('idle')
const picked = ref<Record<string, boolean>>({})
const scrolled = computed(() => ['scroll', 'to-nu', 'click-nu', 'to-btn', 'click-btn', 'done'].includes(phase.value))
const nPicked = computed(() => Object.keys(picked.value).length)
const done = computed(() => phase.value === 'done')
const cursorGone = computed(() => phase.value === 'done')

let timers: ReturnType<typeof setTimeout>[] = []
function later(ms: number, fn: () => void) { timers.push(setTimeout(fn, ms)) }
function clearAll() { timers.forEach(clearTimeout); timers = [] }

function play() {
  clearAll()
  phase.value = 'idle'
  picked.value = {}

  later(600, () => { phase.value = 'to-xp' })
  later(1700, () => { phase.value = 'click-xp'; picked.value = { ...picked.value, xp: true } })
  later(2400, () => { phase.value = 'scroll' })
  later(3100, () => { phase.value = 'to-nu' })
  later(4000, () => { phase.value = 'click-nu'; picked.value = { ...picked.value, nubank: true } })
  later(4800, () => { phase.value = 'to-btn' })
  later(5800, () => { phase.value = 'click-btn' })
  later(6300, () => { phase.value = 'done' })
  later(10300, play)
}

onMounted(() => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    phase.value = 'done'
    picked.value = { xp: true, nubank: true }
    return
  }
  play()
})
onBeforeUnmount(clearAll)
</script>

<template>
  <div class="mid" aria-hidden="true">
    <div class="mid__win">
      <div class="mid__bar">
        <span class="mid__dots"><i /><i /><i /></span>
        <span class="mid__title">Conectar conta</span>
        <span class="mid__of">Open Finance</span>
      </div>

      <div class="mid__search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        Busque seu banco ou corretora
      </div>

      <div class="mid__list-clip">
        <div class="mid__list" :class="{ 'mid__list--scrolled': scrolled }">
          <div
            v-for="i in LIST" :key="i.slug"
            class="mid__row"
            :class="{
              'mid__row--hover': (phase === 'to-xp' && i.slug === 'xp') || (phase === 'to-nu' && i.slug === 'nubank'),
              'mid__row--on': picked[i.slug],
            }"
          >
            <img :src="`/instituicoes/${i.slug}.svg`" :alt="i.name" class="mid__logo" width="26" height="26" loading="lazy">
            <span class="mid__name">{{ i.name }}</span>
            <span class="mid__check" :class="{ 'mid__check--on': picked[i.slug] }">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg>
            </span>
          </div>
        </div>
      </div>

      <button type="button" tabindex="-1" class="mid__btn" :class="{ 'mid__btn--ready': nPicked > 0, 'mid__btn--pressed': phase === 'click-btn' }">
        {{ nPicked > 0 ? `Conectar ${nPicked} ${nPicked === 1 ? 'conta' : 'contas'}` : 'Selecione uma conta' }}
      </button>

      <!-- selo final: conectado, somente leitura -->
      <div class="mid__done" :class="{ 'mid__done--on': done }">
        <span class="mid__done-ic">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg>
        </span>
        <div class="mid__done-t">2 contas conectadas</div>
        <div class="mid__done-p">Somente leitura · você desconecta quando quiser</div>
      </div>
    </div>

    <svg
      class="mid__cursor" :class="[`mid__cursor--${phase}`, { 'mid__cursor--gone': cursorGone }]"
      width="22" height="22" viewBox="0 0 24 24" fill="none"
    >
      <path d="M5 3l14 8-6.5 1.5L9 19z" fill="#0A0A0C" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" />
    </svg>
  </div>
</template>

<style scoped>
.mid { position: relative; width: min(440px, 100%); }

.mid__win {
  position: relative; overflow: hidden;
  background: var(--nu-white); border-radius: var(--nu-r-card);
  box-shadow: var(--nu-shadow-card);
  display: flex; flex-direction: column;
}
.mid__bar { display: flex; align-items: center; gap: 10px; padding: 13px 16px; border-bottom: 1.5px solid var(--nu-cream-2); }
.mid__dots { display: flex; gap: 5px; }
.mid__dots i { width: 9px; height: 9px; border-radius: 50%; background: var(--nu-cream-2); }
.mid__title { color: var(--nu-ink); font-size: 13.5px; font-weight: 800; }
.mid__of { margin-left: auto; background: var(--nu-green-bg, rgba(31, 156, 88, .1)); color: var(--nu-green-2); font-size: 11px; font-weight: 800; padding: 4px 9px; border-radius: 999px; }

.mid__search {
  display: flex; align-items: center; gap: 9px; margin: 12px 14px 0;
  background: var(--nu-cream); color: var(--nu-gray);
  font-size: 13px; font-weight: 600; padding: 11px 14px; border-radius: 12px;
}

.mid__list-clip { height: 236px; overflow: hidden; margin-top: 6px; }
.mid__list { transition: transform .8s cubic-bezier(.45, 0, .2, 1); }
.mid__list--scrolled { transform: translateY(-47px); }
.mid__row {
  display: flex; align-items: center; gap: 11px;
  padding: 10px 16px; transition: background .25s ease;
}
.mid__row--hover { background: var(--nu-cream); }
.mid__row--on { background: var(--nu-tile-blue-bg, rgba(47, 107, 255, .08)); }
.mid__logo { width: 26px; height: 26px; flex-shrink: 0; border-radius: 7px; object-fit: contain; background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-cream-2); padding: 2px; }
.mid__name { flex: 1; color: var(--nu-ink); font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mid__check {
  width: 20px; height: 20px; flex-shrink: 0; border-radius: 50%;
  border: 1.5px solid var(--nu-cream-2); color: transparent;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s ease, border-color .2s ease, color .2s ease, transform .2s ease;
}
.mid__check--on { background: #8FF0B5; border-color: #8FF0B5; color: #0A2050; transform: scale(1.08); }

.mid__btn {
  margin: 10px 14px 14px; border: 0; cursor: default;
  background: var(--nu-cream-2); color: var(--nu-gray);
  border-radius: var(--nu-r-pill); padding: 13px 18px; font-size: 14px; font-weight: 800;
  transition: background .25s ease, color .25s ease, transform .15s ease;
}
.mid__btn--ready { background: var(--nu-blue); color: var(--nu-white); }
.mid__btn--pressed { transform: scale(.96); }

.mid__done {
  position: absolute; inset: 0; z-index: 2;
  background: rgba(255, 255, 255, .96); backdrop-filter: blur(4px);
  display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
  opacity: 0; transition: opacity .45s ease; pointer-events: none; padding: 20px;
}
.mid__done--on { opacity: 1; }
.mid__done-ic {
  width: 54px; height: 54px; border-radius: 50%; background: #8FF0B5; color: #0A2050;
  display: flex; align-items: center; justify-content: center;
}
.mid__done-t { margin-top: 14px; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
.mid__done-p { margin-top: 6px; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }

/* cursor: coreografia por fase (posições em % da janela) */
.mid__cursor {
  position: absolute; z-index: 3; left: 85%; top: 92%;
  transition: left .95s cubic-bezier(.45, 0, .2, 1), top .95s cubic-bezier(.45, 0, .2, 1), transform .16s ease, opacity .4s ease;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, .3));
}
.mid__cursor--to-xp, .mid__cursor--click-xp { left: 72%; top: 34%; }
.mid__cursor--click-xp { transform: scale(.82); }
.mid__cursor--scroll { left: 72%; top: 40%; }
.mid__cursor--to-nu, .mid__cursor--click-nu { left: 72%; top: 32%; }
.mid__cursor--click-nu { transform: scale(.82); }
.mid__cursor--to-btn, .mid__cursor--click-btn { left: 55%; top: 87%; }
.mid__cursor--click-btn { transform: scale(.82); }
.mid__cursor--gone { opacity: 0; }
</style>
