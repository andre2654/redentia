<script setup lang="ts">
/**
 * VARIAÇÃO 2 DA SEGURANÇA (?seguranca=2, só no dev): "A LENTE" (05/11/2026).
 * Uma peça só, desenhada, no painel navy (o Venn escuro com a lente hachurada
 * da Decade, traduzido): o dinheiro fica no cofre do banco; a Redentia é uma
 * lente hachurada que só lê através do vidro; as setas de comprar, vender e
 * transferir voltam para o cofre e batem na parede; a leitura segue para a IA
 * da casa, que fica fora do cofre. O consentimento é a chave com a data: girar
 * desliga a lente (o feixe apaga e a IA para de receber). É um desenho, não um
 * controle do produto: quem revoga de verdade é o cliente, pelo link dele.
 *
 * Calma de propósito (o momento assinatura da página são os passos): um gesto
 * só ao entrar na tela (o feixe acende e as setas batem na parede, uma vez), o
 * giro da chave no clique e o realce da legenda no hover. Nada em loop.
 *
 * SSR: o desenho e a legenda estão no HTML, no estado final (lente ligada).
 * Sem JS, e com reduzir movimento, nada se mexe e a chave não gira.
 */
import { SEGURANCA_CLIENTE, SEGURANCA_LENTE } from '~/content/business/landing'

const ligada = ref(true)
/** a parte da peça em realce: a da legenda em hover, ou a da peça em hover */
const foco = ref<'' | 'le' | 'giro' | 'ia'>('')
const raiz = ref<HTMLElement | null>(null)
/** o gesto de entrada: só arma se a peça ainda estiver abaixo da tela ao montar */
const armada = ref(false)
const viu = ref(false)
let io: IntersectionObserver | null = null
onMounted(() => {
  const el = raiz.value
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
  if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return
  armada.value = true
  io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { viu.value = true; io?.disconnect(); io = null }
  }, { threshold: 0.3 })
  io.observe(el)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div ref="raiz" class="bsl" :class="{ 'bsl--armada': armada && !viu, 'bsl--viu': viu, 'bsl--desligada': !ligada, [`bsl--foco-${foco}`]: foco }">
    <figure class="bsl__painel">
      <div class="bsl__peca">
        <!-- o cofre do banco: o dinheiro fica aqui -->
        <div class="bsl__cofre">
          <span class="bsl__rotulo">{{ SEGURANCA_LENTE.banco }}</span>
          <svg class="bsl__moedas" width="74" height="58" viewBox="0 0 74 58" fill="none" aria-hidden="true">
            <g stroke="currentColor" stroke-width="1.4">
              <ellipse cx="37" cy="44" rx="28" ry="8" /><path d="M9 44v-8M65 44v-8" />
              <ellipse cx="37" cy="36" rx="28" ry="8" /><path d="M9 36v-8M65 36v-8" />
              <ellipse cx="37" cy="28" rx="28" ry="8" /><path d="M9 28v-8M65 28v-8" />
              <ellipse cx="37" cy="20" rx="28" ry="8" />
            </g>
          </svg>
        </div>
        <!-- a parede de vidro do cofre -->
        <div class="bsl__parede" aria-hidden="true" />
        <!-- o feixe da leitura, e as três ações que batem na parede -->
        <div class="bsl__feixe" @mouseenter="foco = 'le'" @mouseleave="foco = ''">
          <span class="bsl__luz" aria-hidden="true" />
          <ul class="bsl__setas">
            <li v-for="(a, k) in SEGURANCA_LENTE.bloqueadas" :key="a" class="bsl__seta" :style="{ '--k': k }">
              <span class="bsl__batida" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 2l8 8M10 2l-8 8" /></svg></span>
              <span class="bsl__haste" aria-hidden="true" />
              <span class="bsl__acao">{{ a }}</span>
            </li>
          </ul>
        </div>
        <!-- a lente: a Redentia, hachurada, e a chave do cliente -->
        <div class="bsl__lente-lugar">
          <div class="bsl__lente" @mouseenter="foco = 'le'" @mouseleave="foco = ''">
            <span class="bsl__lente-nome">{{ SEGURANCA_LENTE.lente }}</span>
          </div>
          <div class="bsl__chave" @mouseenter="foco = 'giro'" @mouseleave="foco = ''">
            <button
              type="button" class="bsl__giro" :aria-pressed="!ligada"
              :aria-label="ligada ? 'Girar e desligar a lente' : 'Girar e ligar a lente de novo'"
              @click="ligada = !ligada"
            >
              <span class="bsl__entalhe" aria-hidden="true" />
            </button>
            <span class="bsl__data">até {{ SEGURANCA_CLIENTE.ate }}</span>
          </div>
        </div>
        <!-- a saída: só a leitura vai para a IA da casa, fora do cofre -->
        <div class="bsl__saida" aria-hidden="true"><span class="bsl__fio" /></div>
        <div class="bsl__ia" @mouseenter="foco = 'ia'" @mouseleave="foco = ''">{{ SEGURANCA_LENTE.ia }}</div>
      </div>
    </figure>
    <ul class="bsl__legenda">
      <li
        v-for="l in SEGURANCA_LENTE.legenda" :key="l.id" class="bsl__item" :class="{ 'bsl__item--on': foco === l.id }"
        @mouseenter="foco = l.id" @mouseleave="foco = ''"
      >
        <span class="bsl__marca" :class="`bsl__marca--${l.id}`" aria-hidden="true" />
        {{ l.t }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.bsl {
  --lav: var(--nu-biz-lavanda);
  --hach: repeating-linear-gradient(135deg, color-mix(in srgb, var(--lav) 55%, transparent) 0 1px, transparent 1px 7px);
  max-width: 1180px; margin: clamp(36px, 4.4vw, 56px) auto 0;
}

/* ——— o painel navy, com a grade de pontos do hero ——— */
.bsl__painel {
  position: relative; isolation: isolate; overflow: hidden; margin: 0; padding: clamp(28px, 4vw, 56px) clamp(20px, 3.6vw, 56px);
  border-radius: var(--nu-r-card-lg); background: var(--nu-navy); color: var(--nu-cream-text);
  box-shadow: 0 0 0 1px var(--nu-white-14) inset, 0 40px 80px -40px rgba(12, 21, 36, .55);
}
.bsl__painel::before {
  content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-image: radial-gradient(var(--nu-biz-ponto) 1.1px, transparent 1.4px); background-size: 22px 22px;
  -webkit-mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, #000 20%, transparent 80%); mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, #000 20%, transparent 80%);
}

/* ——— a peça: no celular, de cima para baixo; no desktop, da esquerda para a direita ——— */
.bsl__peca { display: flex; flex-direction: column; align-items: center; }
.bsl__rotulo, .bsl__acao, .bsl__data { font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }

/* o cofre */
.bsl__cofre {
  position: relative; width: 100%; max-width: 320px; height: 132px; border-radius: 22px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
  background: var(--nu-navy-2); box-shadow: inset 0 0 0 1px var(--nu-white-14), inset 0 1px 0 var(--nu-white-14);
  transition: box-shadow .3s ease;
}
.bsl__rotulo { color: var(--nu-cream-text-70); }
.bsl__moedas { color: var(--nu-cream-text-55); }
/* a parede de vidro: um filete claro com brilho */
.bsl__parede { width: min(100%, 320px); height: 6px; margin-top: 10px; border-radius: 3px; background: linear-gradient(90deg, var(--nu-cream-text-35), var(--nu-cream-text), var(--nu-cream-text-35)); box-shadow: 0 0 18px rgba(245, 241, 234, .25); }

/* o feixe da leitura (hachurado) e as setas que batem na parede */
.bsl__feixe { position: relative; width: 100%; max-width: 320px; height: 176px; display: flex; justify-content: center; }
.bsl__luz {
  position: absolute; inset: 0; background: var(--hach); opacity: .9;
  clip-path: polygon(0 0, 100% 0, 75% 100%, 25% 100%); transform-origin: top center;
  transition: opacity .45s ease;
}
.bsl__setas { position: relative; list-style: none; margin: 0; padding: 0; display: flex; gap: clamp(14px, 6vw, 34px); height: 100%; }
.bsl__seta { display: flex; flex-direction: column; align-items: center; width: 74px; }
.bsl__batida { display: grid; place-items: center; width: 22px; height: 22px; margin-top: 4px; border-radius: 50%; background: var(--nu-navy); color: var(--nu-red-soft); box-shadow: 0 0 0 1px color-mix(in srgb, var(--nu-red-soft) 50%, transparent); }
.bsl__haste { flex: 1; width: 1.5px; margin: 4px 0 6px; background: linear-gradient(180deg, var(--nu-red-soft), color-mix(in srgb, var(--nu-red-soft) 25%, transparent)); }
.bsl__acao { padding: 5px 9px; border-radius: var(--nu-r-pill); background: var(--nu-navy); color: var(--nu-red-soft); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--nu-red-soft) 40%, transparent); letter-spacing: .06em; text-decoration: line-through; text-decoration-thickness: 1.5px; }

/* a lente */
.bsl__lente-lugar { position: relative; }
.bsl__lente {
  position: relative; width: 168px; height: 168px; border-radius: 50%; display: grid; place-items: center;
  background: var(--hach), radial-gradient(circle at 35% 30%, rgba(195, 203, 255, .22), rgba(195, 203, 255, .04) 70%);
  box-shadow: inset 0 0 0 1.5px var(--lav), 0 0 0 8px rgba(195, 203, 255, .06), 0 20px 60px -20px rgba(195, 203, 255, .35);
  transition: opacity .45s ease, box-shadow .45s ease, filter .45s ease;
}
.bsl__lente-nome { padding: 4px 12px; border-radius: var(--nu-r-pill); background: var(--nu-navy); color: var(--nu-cream-text); font-family: var(--serifa); font-size: 26px; font-weight: 400; letter-spacing: -0.01em; }

/* a chave do cliente, com a data */
.bsl__chave { position: absolute; right: -96px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; }
.bsl__giro {
  position: relative; width: 52px; height: 52px; border: 0; border-radius: 50%; cursor: pointer; padding: 0;
  background: radial-gradient(circle at 40% 35%, var(--nu-navy-3), var(--nu-navy-2)); box-shadow: inset 0 0 0 1.5px var(--nu-cream-text-55), 0 10px 24px -10px rgba(0, 0, 0, .6);
  transition: box-shadow .2s ease;
}
.bsl__giro:hover { box-shadow: inset 0 0 0 1.5px var(--nu-cream-text), 0 10px 24px -10px rgba(0, 0, 0, .6); }
.bsl__giro:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.bsl__entalhe { position: absolute; left: 50%; top: 7px; width: 3px; height: 16px; margin-left: -1.5px; border-radius: 2px; background: var(--nu-green-soft); transform-origin: 50% 19px; transition: transform .5s cubic-bezier(.34, 1.4, .5, 1), background .3s ease; }
.bsl__data { color: var(--nu-cream-text-70); letter-spacing: .06em; font-variant-numeric: tabular-nums; white-space: nowrap; }

/* a saída para a IA da casa */
.bsl__saida { height: 56px; display: flex; justify-content: center; }
.bsl__fio { width: 0; border-left: 1.5px dashed var(--nu-cream-text-55); transition: opacity .45s ease; }
.bsl__ia {
  padding: 12px 20px; border-radius: 16px; color: var(--nu-navy); background: var(--nu-cream-text);
  font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -0.01em; box-shadow: 0 18px 40px -20px rgba(0, 0, 0, .6);
  transition: opacity .45s ease, transform .3s var(--curva);
}

/* ——— desligada: a chave girou ——— */
.bsl--desligada .bsl__entalhe { transform: rotate(-90deg); background: var(--nu-red-soft); }
.bsl--desligada .bsl__luz { opacity: 0; }
.bsl--desligada .bsl__lente { opacity: .35; filter: saturate(0); }
.bsl--desligada .bsl__fio, .bsl--desligada .bsl__ia { opacity: .3; }

/* ——— o realce: legenda ↔ peça ——— */
.bsl--foco-le .bsl__parede { box-shadow: 0 0 28px rgba(245, 241, 234, .5); }
.bsl--foco-le .bsl__lente { box-shadow: inset 0 0 0 2px var(--lav), 0 0 0 10px rgba(195, 203, 255, .1), 0 20px 70px -16px rgba(195, 203, 255, .5); }
.bsl--foco-giro .bsl__giro { box-shadow: inset 0 0 0 1.5px var(--nu-cream-text), 0 0 0 6px rgba(143, 240, 181, .12); }
.bsl--foco-ia .bsl__ia { transform: translateY(-2px); }

/* ——— a legenda ——— */
.bsl__legenda { list-style: none; margin: clamp(22px, 3vw, 32px) 0 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 0 clamp(20px, 3vw, 44px); }
.bsl__item {
  display: flex; align-items: baseline; gap: 12px; padding: 16px 0; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray-2); font-family: var(--serifa); font-size: clamp(19px, 1.7vw, 22px); line-height: 1.35; letter-spacing: -0.01em;
  transition: color .2s ease, border-color .2s ease;
}
.bsl__item:hover, .bsl__item--on { color: var(--nu-ink); border-top-color: var(--nu-navy); }
.bsl__marca { flex: none; width: 14px; height: 14px; border-radius: 50%; transform: translateY(1px); }
.bsl__marca--le { background: var(--hach), var(--nu-navy); --lav: #8E9BEA; box-shadow: inset 0 0 0 1px #8E9BEA; }
.bsl__marca--giro { background: var(--nu-navy-2); box-shadow: inset 0 0 0 1.5px var(--nu-navy); }
.bsl__marca--ia { border-radius: 4px; background: var(--nu-navy); }

@media (min-width: 900px) {
  .bsl__peca { flex-direction: row; justify-content: center; align-items: center; height: 300px; }
  .bsl__cofre { width: 210px; max-width: none; height: 250px; }
  .bsl__parede { width: 6px; height: 250px; margin: 0 0 0 10px; background: linear-gradient(180deg, var(--nu-cream-text-35), var(--nu-cream-text), var(--nu-cream-text-35)); }
  .bsl__feixe { width: 250px; max-width: none; height: 250px; }
  .bsl__luz { clip-path: polygon(0 0, 100% 20%, 100% 80%, 0 100%); transform-origin: left center; }
  .bsl__setas { flex-direction: column; justify-content: center; gap: 30px; width: 100%; height: auto; align-self: center; }
  .bsl__seta { flex-direction: row; width: auto; }
  .bsl__batida { margin: 0 0 0 4px; }
  .bsl__haste { flex: 1; width: auto; height: 1.5px; margin: 0 8px 0 4px; background: linear-gradient(90deg, var(--nu-red-soft), color-mix(in srgb, var(--nu-red-soft) 25%, transparent)); }
  .bsl__lente { width: 210px; height: 210px; }
  .bsl__chave { right: auto; left: 50%; top: auto; bottom: -78px; transform: translateX(-50%); flex-direction: row; gap: 10px; }
  .bsl__saida { width: 72px; height: auto; align-self: stretch; align-items: center; }
  .bsl__fio { width: 100%; height: 0; border-left: 0; border-top: 1.5px dashed var(--nu-cream-text-55); }
  .bsl__legenda { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 899px) {
  /* no celular a chave vem embaixo da lente, antes da saída para a IA */
  .bsl__lente-lugar { display: flex; flex-direction: column; align-items: center; margin-top: 10px; }
  .bsl__chave { position: static; transform: none; flex-direction: row; gap: 10px; margin-top: 14px; }
  .bsl__saida { height: 40px; margin-top: 6px; }
}
@media (max-width: 380px) {
  .bsl__lente { width: 148px; height: 148px; }
}

/* ——— o gesto de entrada (uma vez): o feixe acende e as setas batem na parede ——— */
@media (prefers-reduced-motion: no-preference) {
  .bsl--armada .bsl__luz { opacity: 0; transform: scaleY(.2); }
  .bsl--armada .bsl__seta { opacity: 0; transform: translateY(40px); }
  .bsl--armada .bsl__fio, .bsl--armada .bsl__ia { opacity: 0; }
  .bsl--viu .bsl__luz { animation: bsl-luz .9s var(--curva) backwards; }
  .bsl--viu .bsl__seta { animation: bsl-bate-v .8s var(--curva) backwards; animation-delay: calc(.45s + var(--k) * .1s); }
  .bsl--viu .bsl__batida { animation: bsl-pulso .5s ease-out backwards; animation-delay: calc(1.05s + var(--k) * .1s); }
  .bsl--viu .bsl__fio, .bsl--viu .bsl__ia { animation: bsl-surge .6s var(--curva) 1.2s backwards; }
}
@media (prefers-reduced-motion: no-preference) and (min-width: 900px) {
  .bsl--armada .bsl__luz { transform: scaleX(.2); }
  .bsl--armada .bsl__seta { transform: translateX(60px); }
  .bsl--viu .bsl__luz { animation-name: bsl-luz-h; }
  .bsl--viu .bsl__seta { animation-name: bsl-bate-h; }
}
@keyframes bsl-luz { from { opacity: 0; transform: scaleY(.2); } to { opacity: .9; transform: none; } }
@keyframes bsl-luz-h { from { opacity: 0; transform: scaleX(.2); } to { opacity: .9; transform: none; } }
@keyframes bsl-bate-v { 0% { opacity: 0; transform: translateY(40px); } 70% { opacity: 1; transform: translateY(-3px); } 100% { opacity: 1; transform: none; } }
@keyframes bsl-bate-h { 0% { opacity: 0; transform: translateX(60px); } 70% { opacity: 1; transform: translateX(-4px); } 100% { opacity: 1; transform: none; } }
@keyframes bsl-pulso { 0% { box-shadow: 0 0 0 0 rgba(255, 179, 184, .55); } 100% { box-shadow: 0 0 0 10px rgba(255, 179, 184, 0), 0 0 0 1px rgba(255, 179, 184, .5); } }
@keyframes bsl-surge { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .bsl__entalhe, .bsl__luz, .bsl__lente, .bsl__fio, .bsl__ia, .bsl__item { transition: none; }
}
</style>
