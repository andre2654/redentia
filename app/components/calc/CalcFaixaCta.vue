<script setup lang="ts">
// A faixa do fim das calculadoras, de ponta a ponta da tela (dono, 21/10/2026:
// "nas telas da calculadora deixe esse card ocupando toda a largura" e "deixe
// esse CTA mais impressionante"). Antes era um cartão azul de 1080 px dentro
// da última faixa de texto, repetido em cada página com o próprio CSS.
// Agora é uma faixa no azul da Redentia (o dono testou o fundo escuro e pediu
// o azul de volta), com luz branca e azul-clara que se mexe devagar atrás do
// título, o botão principal em branco e, embaixo, quatro cápsulas de vidro com
// o que a conta dá. Tudo isso existe: contas guardadas, o resumo das 7h30, a
// carteira pelo Open Finance (no /carteira) e o chat. A preço-teto segue com o
// cartão dela (veto do dono).
defineProps<{
  titulo: string
  texto: string
  /** o botão branco, o principal */
  primario: { label: string; to: string }
  /** o botão de contorno */
  secundario: { label: string; to: string }
}>()

// a entrada (título, texto, botões e cápsulas subindo do desfoque) acontece
// quando a faixa aparece na tela, não ao carregar a página, lá no topo. Sem
// JavaScript, ou com movimento reduzido, a faixa só aparece pronta.
const raiz = ref<HTMLElement | null>(null)
const entrada = ref<'' | 'espera' | 'entra'>('')
let olho: IntersectionObserver | null = null
onMounted(() => {
  const el = raiz.value
  if (!el || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (el.getBoundingClientRect().top < window.innerHeight) return
  entrada.value = 'espera'
  olho = new IntersectionObserver((vistos) => {
    if (!vistos.some((v) => v.isIntersecting)) return
    entrada.value = 'entra'
    olho?.disconnect()
  }, { threshold: 0.25 })
  olho.observe(el)
})
onBeforeUnmount(() => olho?.disconnect())

const BENEFICIOS = [
  { texto: 'Contas guardadas', d: ['M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4-6.5 4v-16a1 1 0 0 1 1-1z'] },
  { texto: 'Resumo das 7h30', d: ['M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z', 'M12 7.5V12l3 2'] },
  { texto: 'Carteira conectada', d: ['M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z', 'M15 3.8A8.5 8.5 0 0 1 20.2 9H15z'] },
  { texto: 'Pergunte à Redentia', d: ['M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z'] },
]
</script>

<template>
  <section ref="raiz" class="cft" :class="entrada && `cft--${entrada}`">
    <div class="cft__aurora" aria-hidden="true">
      <span class="cft__luz cft__luz--azul" />
      <span class="cft__luz cft__luz--violeta" />
      <span class="cft__luz cft__luz--rosa" />
    </div>
    <span class="cft__fio" aria-hidden="true" />
    <div class="cft__miolo">
      <h2 class="cft__titulo">{{ titulo }}</h2>
      <p class="cft__texto">{{ texto }}</p>
      <div class="cft__acoes">
        <NuxtLink :to="primario.to" class="cft__pill cft__pill--claro">
          {{ primario.label }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </NuxtLink>
        <NuxtLink :to="secundario.to" class="cft__pill cft__pill--contorno">{{ secundario.label }}</NuxtLink>
      </div>
      <ul class="cft__beneficios" aria-label="O que a conta dá">
        <li v-for="(b, i) in BENEFICIOS" :key="b.texto" class="cft__beneficio" :style="{ '--i': i }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path v-for="d in b.d" :key="d" :d="d" /></svg>
          {{ b.texto }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.cft {
  position: relative; isolation: isolate; overflow: hidden; text-align: center;
  padding: clamp(72px, 9vw, 132px) clamp(22px, 5.5vw, 80px) clamp(64px, 8vw, 112px);
  background: var(--nu-blue);
  color: var(--nu-white);
}

/* a luz: três manchas borradas, branca e azul-clara, que andam devagar atrás do título */
.cft__aurora { position: absolute; inset: 0; z-index: -1; pointer-events: none; }
.cft__luz { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .5; will-change: transform; }
.cft__luz--azul { width: 520px; height: 360px; left: calc(50% - 470px); top: -120px; background: var(--nu-blue-soft); animation: cft-anda-1 18s ease-in-out infinite alternate; }
.cft__luz--violeta { width: 460px; height: 340px; left: calc(50% - 120px); top: -150px; background: var(--nu-serie-5); opacity: .3; animation: cft-anda-2 22s ease-in-out infinite alternate; }
.cft__luz--rosa { width: 360px; height: 280px; left: calc(50% + 160px); top: -90px; background: var(--nu-white); opacity: .28; animation: cft-anda-3 20s ease-in-out infinite alternate; }
@keyframes cft-anda-1 { to { transform: translate(120px, 40px) scale(1.12); } }
@keyframes cft-anda-2 { to { transform: translate(-140px, 60px) scale(.92); } }
@keyframes cft-anda-3 { to { transform: translate(-90px, 30px) scale(1.18); } }
/* o fio de luz no alto da faixa */
.cft__fio {
  position: absolute; left: 0; right: 0; top: 0; height: 1px; opacity: .7;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.85), transparent);
}

.cft__miolo { position: relative; max-width: 980px; margin: 0 auto; }
.cft__titulo {
  margin: 0 auto; max-width: 900px; color: var(--nu-white);
  font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.045em; line-height: 1.04; text-wrap: balance;
}
.cft__texto {
  margin: 18px auto 0; max-width: 560px; color: var(--nu-white-75);
  font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.55; text-wrap: balance;
}
.cft__acoes { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 34px; }
.cft__pill {
  display: inline-flex; align-items: center; gap: 10px; height: 56px; padding: 0 28px; border-radius: var(--nu-r-pill);
  font-size: var(--nu-fs-md); font-weight: 700; transition: transform .2s ease, box-shadow .25s ease, background .2s ease;
}
.cft__pill--claro {
  background: var(--nu-white); color: var(--nu-blue);
  box-shadow: 0 14px 40px -12px rgba(10, 16, 48, 0.45);
}
.cft__pill--claro svg { transition: transform .2s ease; }
.cft__pill--claro:hover { color: var(--nu-blue-hover); transform: translateY(-1px); box-shadow: 0 18px 48px -12px rgba(10, 16, 48, 0.55); }
.cft__pill--claro:hover svg { transform: translateX(3px); }
.cft__pill--contorno { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.cft__pill--contorno:hover { background: var(--nu-white-14); color: var(--nu-white); }
.cft__pill:focus-visible { outline: 3px solid var(--nu-white); outline-offset: 3px; }

/* o que a conta dá: cápsulas de vidro */
.cft__beneficios { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 44px 0 0; padding: 0; list-style: none; }
.cft__beneficio {
  display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: var(--nu-r-pill);
  background: rgba(255, 255, 255, 0.12); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.22);
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
  color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: 500; white-space: nowrap;
}
.cft__beneficio svg { color: var(--nu-white); opacity: .9; }

/* a entrada, quando a faixa aparece na tela */
.cft--espera :is(.cft__titulo, .cft__texto, .cft__acoes, .cft__beneficio) { opacity: 0; transform: translateY(12px); }
.cft--entra .cft__titulo { animation: cft-entra .9s cubic-bezier(.22, 1, .36, 1) both; }
.cft--entra .cft__texto { animation: cft-entra .9s cubic-bezier(.22, 1, .36, 1) .08s both; }
.cft--entra .cft__acoes { animation: cft-entra .9s cubic-bezier(.22, 1, .36, 1) .16s both; }
.cft--entra .cft__beneficio { animation: cft-entra .8s cubic-bezier(.22, 1, .36, 1) both; animation-delay: calc(.3s + var(--i) * 80ms); }
@keyframes cft-entra { from { opacity: 0; transform: translateY(12px); filter: blur(6px); } }

@media (max-width: 640px) {
  .cft { text-align: left; }
  .cft__titulo, .cft__texto { margin-left: 0; }
  .cft__acoes, .cft__beneficios { justify-content: flex-start; }
  .cft__pill { flex: 1 1 auto; justify-content: center; }
  .cft__beneficios { gap: 8px; margin-top: 34px; }
  .cft__beneficio { padding: 7px 12px; gap: 6px; font-size: var(--nu-fs-dense); }
  .cft__luz { filter: blur(54px); }
  .cft__luz--azul { width: 320px; height: 240px; left: -80px; }
  .cft__luz--violeta { width: 300px; height: 220px; left: 90px; }
  .cft__luz--rosa { width: 220px; height: 180px; left: 220px; }
}
@media (prefers-reduced-motion: reduce) {
  .cft__luz { animation: none; }
}
</style>
