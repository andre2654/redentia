<script setup lang="ts">
/**
 * VARIAÇÃO 1 DA SEGURANÇA (?seguranca=1, só no dev): "A PERGUNTA DO
 * COMPLIANCE" (05/11/2026). O título vira literal: as perguntas que o
 * compliance faz, em serifa, e ao lado (no celular, embaixo) a folha aberta do
 * dossiê com a resposta curta e a PROVA desenhada (o que a conexão deixa fazer,
 * o aceite com as datas, as posições que somem ao revogar, a IA da casa).
 *
 * "Onde o dado fica?" ficou de fora de propósito: a resposta curta que tem
 * lastro ("no banco da Redentia, separado por escritório") não cabe sem a
 * ressalva de que a região de hospedagem entra no contrato. Mora no FAQ.
 *
 * SSR: as quatro folhas estão no HTML. Sem JS, todas abertas, uma embaixo da
 * outra. Com JS (@media scripting), uma folha por vez: a do hover, do foco ou
 * do clique. A prova do "pode tirar" apaga as posições uma vez, quando a folha
 * abre. Nada em loop; o reduzir movimento troca sem animar.
 */
import { SEGURANCA_CLIENTE, SEGURANCA_IAS, SEGURANCA_PERGUNTAS, SEGURANCA_PERMISSOES } from '~/content/business/landing'

const ativa = ref(0)
/** hover só muda a folha onde existe hover de verdade (o toque vira clique) */
let temHover = false
onMounted(() => { temHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches })
const abrir = (i: number) => { ativa.value = i }
const passar = (i: number) => { if (temHover) ativa.value = i }

const bid = (id: string) => `bsp-q-${id}`
const fid = (id: string) => `bsp-f-${id}`
</script>

<template>
  <div class="bsp">
    <ol class="bsp__lista">
      <li v-for="(p, i) in SEGURANCA_PERGUNTAS" :key="p.id" class="bsp__item" :class="{ 'bsp__item--on': ativa === i }">
        <h3 class="bsp__q">
          <button
            :id="bid(p.id)" type="button" class="bsp__botao" :aria-expanded="ativa === i" :aria-controls="fid(p.id)"
            @click="abrir(i)" @mouseenter="passar(i)" @focus="abrir(i)"
          >
            <span class="bsp__q-t">{{ p.q }}</span>
            <svg class="bsp__seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </h3>
        <div :id="fid(p.id)" class="bsp__folha" role="region" :aria-labelledby="bid(p.id)">
          <p class="bsp__r">{{ p.r }}</p>
          <!-- a prova: o desenho do que a resposta afirma -->
          <div class="bsp__prova" :class="`bsp__prova--${p.id}`" aria-hidden="true">
            <div v-if="p.id === 'dinheiro'" class="bsp__perms">
              <span v-for="(x, k) in SEGURANCA_PERMISSOES" :key="x" class="bsp__perm" :class="{ 'bsp__perm--sim': k === 0 }">
                <svg v-if="k === 0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>{{ x }}
              </span>
            </div>
            <div v-else-if="p.id === 'autoriza'" class="bsp__aceite">
              <span class="bsp__selo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
              <span class="bsp__aceite-txt">
                <strong>{{ SEGURANCA_CLIENTE.nome }}</strong>
                <span class="bsp__datas">{{ SEGURANCA_CLIENTE.desde }}<svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M1 5h19M16 1l4 4-4 4" /></svg>{{ SEGURANCA_CLIENTE.ate }}</span>
              </span>
            </div>
            <div v-else-if="p.id === 'revoga'" class="bsp__revoga">
              <span class="bsp__linhas"><i /><i /><i /></span>
              <span class="bsp__revogar">Revogar</span>
            </div>
            <div v-else class="bsp__ias">
              <span class="bsp__leitura"><i /><i /></span>
              <svg class="bsp__fio" width="40" height="12" viewBox="0 0 40 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="2 4"><path d="M1 6h34" /><path d="M33 2l4 4-4 4" stroke-dasharray="none" /></svg>
              <span v-for="x in SEGURANCA_IAS" :key="x" class="bsp__ia">{{ x }}</span>
            </div>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.bsp { max-width: 1080px; margin: clamp(36px, 4.4vw, 56px) auto 0; }
.bsp__lista { list-style: none; margin: 0; padding: 0; counter-reset: q; }
.bsp__item { border-top: 1px solid var(--nu-cream-line); }
.bsp__item:last-child { border-bottom: 1px solid var(--nu-cream-line); }
.bsp__q { margin: 0; font: inherit; counter-increment: q; }

/* ——— a pergunta: serifa, a numeração do dossiê no CSS ——— */
.bsp__botao {
  width: 100%; min-height: 64px; display: flex; align-items: center; gap: 14px; padding: 16px 2px; border: 0; background: none; cursor: pointer; text-align: left;
  color: var(--nu-ink); font-family: var(--serifa); font-size: clamp(22px, 2.2vw, 28px); font-weight: 400; letter-spacing: -0.015em; line-height: 1.2;
  transition: color .25s ease;
}
.bsp__botao::before {
  content: '§ ' counter(q); flex: none; width: 3.2em; color: var(--nu-blue-text);
  font-family: var(--nu-font, inherit); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .12em; font-variant-numeric: tabular-nums;
}
.bsp__q-t { flex: 1; min-width: 0; }
.bsp__seta { flex: none; color: var(--nu-gray); opacity: 0; transform: translateX(-6px); transition: opacity .25s ease, transform .35s var(--curva), color .25s ease; }
.bsp__botao:hover .bsp__seta, .bsp__item--on .bsp__seta { opacity: 1; transform: none; }
.bsp__item--on .bsp__seta { color: var(--nu-blue-text); }
.bsp__botao:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 8px; }

/* ——— a folha do dossiê ——— */
.bsp__folha {
  position: relative; margin: 0 0 20px; padding: clamp(22px, 3vw, 36px); border-radius: var(--nu-r-card);
  background: var(--nu-cream);
  /* o papel: o filete duplo do timbre no topo e as pautas muito leves */
  background-image:
    linear-gradient(var(--nu-ink-14), var(--nu-ink-14)), linear-gradient(var(--nu-ink-14), var(--nu-ink-14)),
    repeating-linear-gradient(180deg, transparent 0 35px, rgba(12, 21, 36, .035) 35px 36px);
  background-size: calc(100% - 2 * clamp(22px, 3vw, 36px)) 1px, calc(100% - 2 * clamp(22px, 3vw, 36px)) 1px, 100% 100%;
  background-position: center 14px, center 18px, 0 0; background-repeat: no-repeat, no-repeat, repeat;
  box-shadow: 0 0 0 1px var(--nu-cream-line), 0 24px 60px -30px rgba(12, 21, 36, .18);
}
.bsp__r { margin: 8px 0 0; color: var(--nu-ink); font-family: var(--serifa); font-size: clamp(28px, 3.2vw, 42px); font-weight: 400; letter-spacing: -0.02em; line-height: 1.1; text-wrap: balance; }
/* a prova: o anexo da folha, um papel branco preso nela */
.bsp__prova {
  margin-top: clamp(20px, 2.6vw, 30px); padding: clamp(18px, 2.4vw, 28px); min-height: 96px; border-radius: var(--nu-r-tile);
  display: flex; align-items: center; justify-content: center; background: var(--nu-white);
  box-shadow: 0 0 0 1px var(--nu-cream-line), 0 14px 30px -22px rgba(12, 21, 36, .35);
}

/* 1 · o que a conexão deixa fazer */
.bsp__perms { display: grid; grid-template-columns: repeat(2, minmax(0, auto)); gap: 8px; }
@media (min-width: 560px) { .bsp__perms { display: flex; flex-wrap: nowrap; } }
.bsp__perm { justify-content: center; }
.bsp__perm {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: var(--nu-r-pill); background: var(--nu-cream);
  box-shadow: 0 0 0 1px var(--nu-cream-line); color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700;
  text-decoration: line-through; text-decoration-thickness: 1.5px;
}
.bsp__perm--sim { background: var(--nu-navy); box-shadow: none; color: var(--nu-cream-text); text-decoration: none; }

/* 2 · o aceite, com as datas */
.bsp__aceite { display: flex; align-items: center; gap: 14px; }
.bsp__selo {
  flex: none; width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; color: var(--nu-green-text);
  box-shadow: inset 0 0 0 1.5px currentColor, inset 0 0 0 5px var(--nu-cream), inset 0 0 0 6px color-mix(in srgb, currentColor 45%, transparent);
  transform: rotate(-8deg);
}
.bsp__aceite-txt { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.bsp__aceite-txt strong { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.bsp__datas { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.bsp__datas svg { color: var(--nu-gray); }

/* 3 · revogar apaga as posições */
.bsp__revoga { display: flex; align-items: center; gap: 18px; width: 100%; max-width: 360px; }
.bsp__linhas { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.bsp__linhas i { display: block; height: 9px; border-radius: 5px; background: var(--nu-ink-14); transform-origin: left center; }
.bsp__linhas i:nth-child(2) { width: 78%; }
.bsp__linhas i:nth-child(3) { width: 56%; }
.bsp__revogar { flex: none; padding: 7px 13px; border-radius: var(--nu-r-pill); background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-ink-14); color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 700; }

/* 4 · a leitura vai para a IA da casa */
.bsp__ias { display: flex; align-items: center; gap: 10px; }
.bsp__leitura { display: flex; flex-direction: column; gap: 5px; width: 44px; }
.bsp__leitura i { display: block; height: 6px; border-radius: 3px; background: var(--nu-ink-14); }
.bsp__leitura i + i { width: 70%; }
.bsp__fio { color: var(--nu-gray); }
.bsp__ia { padding: 9px 16px; border-radius: 14px; background: var(--nu-cream); box-shadow: 0 0 0 1px var(--nu-cream-line); color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -0.01em; }

/* ——— com JS: uma folha por vez ———
   Sem JS (e no HTML do Google), as quatro ficam abertas, uma embaixo da outra. */
@media (scripting: enabled) {
  .bsp__item:not(.bsp__item--on) .bsp__folha { display: none; }
  .bsp__item:not(.bsp__item--on) .bsp__botao { color: color-mix(in srgb, var(--nu-ink) 55%, transparent); }
  .bsp__item:not(.bsp__item--on) .bsp__botao:hover { color: var(--nu-ink); }
}
/* no desktop, a folha aberta fica ao lado das perguntas, no mesmo lugar */
@media (scripting: enabled) and (min-width: 900px) {
  .bsp__lista { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: clamp(32px, 5vw, 72px); align-items: start; border-bottom: 0; }
  .bsp__item { display: contents; }
  .bsp__q { grid-column: 1; border-top: 1px solid var(--nu-cream-line); }
  .bsp__item:last-child .bsp__q { border-bottom: 1px solid var(--nu-cream-line); }
  .bsp__folha { grid-column: 2; grid-row: 1 / span 4; margin: 0; align-self: stretch; display: flex; flex-direction: column; }
  .bsp__prova { flex: 1; }
  .bsp__perm { padding: 9px 16px; font-size: var(--nu-fs-md); }
  .bsp__botao { min-height: 84px; }
}
@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {
  .bsp__item--on .bsp__folha { animation: bsp-abre .42s var(--curva) both; }
  .bsp__item--on .bsp__r { animation: bsp-palavra .52s cubic-bezier(.22, 1, .36, 1) .04s both; }
  .bsp__item--on .bsp__prova { animation: bsp-palavra .52s cubic-bezier(.22, 1, .36, 1) .14s both; }
  /* a prova do "pode tirar": as posições somem, uma vez, quando a folha abre */
  .bsp__item--on .bsp__linhas i { animation: bsp-apaga .5s var(--curva) both; }
  .bsp__item--on .bsp__linhas i:nth-child(1) { animation-delay: .7s; }
  .bsp__item--on .bsp__linhas i:nth-child(2) { animation-delay: .8s; }
  .bsp__item--on .bsp__linhas i:nth-child(3) { animation-delay: .9s; }
  .bsp__item--on .bsp__revogar { animation: bsp-toque .5s var(--curva) .45s both; }
}
@media (max-width: 420px) {
  .bsp__ia { padding: 8px 12px; font-size: var(--nu-fs-sm); }
  .bsp__fio { width: 26px; }
  .bsp__leitura { width: 32px; }
}
@keyframes bsp-abre { from { opacity: .4; } to { opacity: 1; } }
@keyframes bsp-palavra { from { opacity: 0; transform: translateY(6px); filter: blur(8px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes bsp-apaga { to { transform: scaleX(.35); opacity: .18; } }
@keyframes bsp-toque { 40% { transform: scale(.94); background: var(--nu-red-tint); } to { transform: none; } }
/* com reduzir movimento, a prova já mostra as posições apagadas */
@media (scripting: enabled) and (prefers-reduced-motion: reduce) {
  .bsp__item--on .bsp__linhas i { opacity: .18; transform: scaleX(.35); }
  .bsp__seta { transition: none; }
}
</style>
