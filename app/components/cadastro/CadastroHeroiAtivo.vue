<script setup lang="ts">
// Herói do "Seguir" (canvas "Cadastro sem muro", 21/10/2026): a linha real do
// último mês do ativo se desenha, o trecho de hoje sai na cor do movimento e o
// porquê (a manchete do dia) aparece ancorado no ponto de hoje. O pontilhado é
// o fechamento de ontem. Serve à folha de cadastro e ao painel do login.
// Parado (sem animação ou com movimento reduzido), mostra o quadro final.
import type { DadosAtivo } from '~/composables/useCadastroDados'

const props = withDefaults(defineProps<{
  dados: DadosAtivo | null
  /** depois do cadastro: "Seguindo" fixo em vez do laço */
  seguindo?: boolean
  /** no painel do login não há o botão de fechar no canto */
  painel?: boolean
}>(), { seguindo: false, painel: false })

const linha = computed(() => (props.dados ? linhaDoMes(props.dados.serie, 456, 96, 6) : null))
const variacao = computed(() => props.dados?.variacao ?? null)
const sobe = computed(() => (variacao.value ?? (linha.value?.subiu ? 1 : -1)) >= 0)
const preco = computed(() => (props.dados?.preco != null ? brlCentavos(props.dados.preco) : null))
const variacaoTexto = computed(() => (variacao.value != null ? `${pctTexto(variacao.value)} hoje` : ''))
const tamanhos = computed(() => ({
  '--cha-corpo': String(linha.value?.comprimentoCorpo ?? 0),
  '--cha-queda': String(linha.value?.comprimentoQueda ?? 0),
}))
const id = useId()
</script>

<template>
  <div class="cha" :class="{ 'cha--painel': painel, 'cha--seguindo': seguindo, 'cha--sobe': sobe }" :style="tamanhos" aria-hidden="true">
    <div class="cha__topo">
      <img v-if="dados?.logo" :src="dados.logo" alt="" class="cha__logo" width="30" height="30">
      <span v-else class="cha__logo cha__logo--letra">{{ (dados?.ticker ?? '').slice(0, 1) }}</span>
      <div class="cha__nome">
        <b>{{ dados?.ticker ?? '' }}</b>
        <span v-if="preco">{{ preco }}</span>
      </div>
      <span class="cha__seguindo"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>Seguindo</span>
    </div>

    <div v-if="variacao != null" class="cha__porque">
      <b>{{ variacaoTexto }}</b>
      <span v-if="dados?.motivo">{{ dados.motivo }}</span>
    </div>

    <svg v-if="linha" class="cha__grafico" viewBox="0 -12 456 108" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient :id="`${id}-area`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color: var(--nu-blue-soft); stop-opacity: 0.16" />
          <stop offset="1" style="stop-color: var(--nu-blue-soft); stop-opacity: 0" />
        </linearGradient>
      </defs>
      <path class="cha__area" :d="linha.area" :fill="`url(#${id}-area)`" />
      <line class="cha__area cha__ontem" x1="6" :y1="linha.ontemY" x2="450" :y2="linha.ontemY" stroke-width="1" stroke-dasharray="2 5" />
      <path class="cha__linha" :d="linha.corpo" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <path class="cha__hoje" :d="linha.queda" fill="none" stroke-width="2.5" stroke-linecap="round" />
      <line class="cha__guia" :x1="linha.fim[0]" y1="-12" :x2="linha.fim[0]" :y2="linha.fim[1] - 7" stroke-width="1.5" stroke-dasharray="3 4" />
      <g class="cha__ponto">
        <circle class="cha__onda" :cx="linha.fim[0]" :cy="linha.fim[1]" r="5" fill="none" stroke-width="1.5" />
        <circle :cx="linha.fim[0]" :cy="linha.fim[1]" r="5" />
      </g>
    </svg>
    <div v-else-if="!dados" class="cha__carregando">
      <span class="cha__esqueleto" />
      <span class="cha__esqueleto" style="width: 72%" />
    </div>
  </div>
</template>

<style scoped>
.cha {
  --cha-hoje: var(--nu-red-soft);
  position: relative; display: flex; flex-direction: column;
  padding: 22px 28px 14px; color: var(--nu-cream-text);
}
.cha--sobe { --cha-hoje: var(--nu-green-soft); }
.cha--painel { padding: 0; }
.cha__topo { display: flex; align-items: center; gap: 10px; padding-right: 44px; }
.cha--painel .cha__topo { padding-right: 0; }
.cha__logo { width: 30px; height: 30px; border-radius: 9px; flex: none; object-fit: cover; }
.cha__logo--letra { display: grid; place-items: center; background: var(--nu-navy-3); font-size: var(--nu-fs-sm); font-weight: 800; }
.cha__nome { display: flex; flex-direction: column; line-height: 1.15; }
.cha__nome b { font-size: var(--nu-fs-md); font-weight: 800; }
.cha__nome span { color: var(--nu-cream-text-60); font-size: var(--nu-fs-xs); font-weight: 500; }
.cha__seguindo {
  display: inline-flex; align-items: center; gap: 5px; margin-left: 6px;
  color: var(--nu-green-soft); font-size: var(--nu-fs-dense); font-weight: 700;
}
.cha__porque {
  align-self: flex-end; max-width: min(300px, 70%); margin-top: 2px; text-align: right;
  display: flex; flex-direction: column; gap: 2px;
}
.cha__porque b { color: var(--cha-hoje); font-size: var(--nu-fs-md); font-weight: 800; }
.cha__porque span {
  color: var(--nu-cream-text-78); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.cha__grafico { display: block; width: 100%; height: auto; margin-top: 6px; overflow: visible; }
.cha__linha { stroke: var(--nu-blue-soft); filter: drop-shadow(0 0 6px rgba(158, 200, 255, 0.55)); }
.cha__ontem, .cha__guia { stroke: var(--nu-cream-text-35); }
.cha__hoje { stroke: var(--cha-hoje); filter: drop-shadow(0 0 6px var(--cha-hoje)); }
.cha__ponto circle { fill: var(--cha-hoje); }
.cha__ponto .cha__onda { fill: none; stroke: var(--cha-hoje); transform-box: fill-box; transform-origin: center; animation: cha-onda 1.6s ease-out infinite; }
.cha__carregando { display: flex; flex-direction: column; gap: 10px; margin-top: 40px; }
.cha__esqueleto {
  height: 10px; border-radius: var(--nu-r-pill);
  background: linear-gradient(90deg, var(--nu-cream-text-14) 0%, var(--nu-cream-text-30) 50%, var(--nu-cream-text-14) 100%);
  background-size: 200% 100%; animation: cha-brilha 1.8s linear infinite;
}

/* o laço (9 s): a linha se desenha, hoje cai ou sobe, o porquê aparece e o
   "Seguindo" entra. Cada keyframe parte do escondido; parado, fica o final. */
.cha { animation: cha-volta 9s ease infinite; }
.cha__linha { stroke-dasharray: var(--cha-corpo); stroke-dashoffset: 0; animation: cha-linha 9s cubic-bezier(.5, 0, .2, 1) infinite; }
.cha__hoje { stroke-dasharray: var(--cha-queda); stroke-dashoffset: 0; animation: cha-hoje 9s ease-in infinite; }
.cha__area { animation: cha-surge 9s ease infinite; }
.cha__ponto { animation: cha-ponto 9s ease infinite; }
.cha__guia { animation: cha-guia 9s ease infinite; }
.cha__porque { animation: cha-porque 9s cubic-bezier(.2, .8, .2, 1) infinite; }
.cha__seguindo { animation: cha-seguindo 9s ease infinite; }
/* depois do cadastro o herói para no quadro final, com o "Seguindo" fixo */
.cha--seguindo, .cha--seguindo .cha__linha, .cha--seguindo .cha__hoje, .cha--seguindo .cha__area,
.cha--seguindo .cha__ponto, .cha--seguindo .cha__guia, .cha--seguindo .cha__porque, .cha--seguindo .cha__seguindo { animation: none; }

@keyframes cha-volta { 0% { opacity: 0; } 3%, 93% { opacity: 1; } 100% { opacity: 0; } }
@keyframes cha-linha { 0% { stroke-dashoffset: var(--cha-corpo); } 26%, 100% { stroke-dashoffset: 0; } }
@keyframes cha-hoje { 0%, 26% { stroke-dashoffset: var(--cha-queda); } 31%, 100% { stroke-dashoffset: 0; } }
@keyframes cha-surge { 0%, 24% { opacity: 0; } 34%, 100% { opacity: 1; } }
@keyframes cha-ponto { 0%, 30% { opacity: 0; } 33%, 100% { opacity: 1; } }
@keyframes cha-guia { 0%, 33% { opacity: 0; } 37%, 100% { opacity: 1; } }
@keyframes cha-porque { 0%, 35% { opacity: 0; transform: translateY(8px); } 42%, 100% { opacity: 1; transform: none; } }
@keyframes cha-seguindo { 0%, 47% { opacity: 0; transform: translateX(-4px); } 52%, 100% { opacity: 1; transform: none; } }
@keyframes cha-onda { from { transform: scale(1); opacity: .7; } to { transform: scale(3.4); opacity: 0; } }
@keyframes cha-brilha { from { background-position: 200% 0; } to { background-position: -200% 0; } }

@media (prefers-reduced-motion: reduce) {
  .cha, .cha__linha, .cha__hoje, .cha__area, .cha__ponto, .cha__guia, .cha__porque, .cha__seguindo, .cha__ponto .cha__onda, .cha__esqueleto { animation: none; }
}
</style>
