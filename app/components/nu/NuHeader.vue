<script setup lang="ts">
import type { NavItem } from '~/utils/topo'
// APORTOU (11/11/2026): no site de investidor o topo senta sobre o creme da
// página, sem fio (o fio só aparece depois de rolar), com o wordmark, a nav em
// carvão 600 e a chamada em pílula carvão ("Criar conta grátis"), como no
// quadro Home. A variante do produto de escritório saiu com o B2B em
// 12/11/2026: este é o topo do site.
//
// Header Nu, "editorial calmo" (02/11/2026, o dono escolheu a direção 3 entre
// três protótipos: "gostei do 3 e no mobile pode deixar ainda menor").
//
// - Branco, tipo assentado e um fio embaixo. A marca é o losango azul solto
//   com o nome (saiu o quadrado azul pesado). A nav é texto; a página ativa
//   ganha um traço azul embaixo. A busca é um campo à direita, que vira ícone
//   quando falta largura.
// - STICKY no topo e ENCOLHE ao rolar (72 → 60px; no celular 52 → 46px), com
//   a histerese do useTopo. A altura vai para --nuh-h, que a régua do mercado
//   (NuMarketTicker), o rail de seções e as âncoras leem.
// - Ferramentas e Informações abrem o painel de preview (lista + vinheta, a
//   referência do dono de 20/08) no hover, com timer de intenção, e no
//   clique/teclado; Teses e Carteira também têm preview.
// - Deslogado: Entrar e Conectar carteira (/assinar?quiz=1&de=topo). Logado: o
//   avatar com o menu da conta.
// - Até 960px de contêiner a nav vai para o menu; até 640px saem também os
//   botões da conta (ficam no menu). As larguras contam pelo contêiner, não
//   pela janela: com o chat aberto a página encolhe ao lado do painel.
// - Sem botão da IA (dono, 02/11/2026: "pode tirar esse botão pra sempre"): a
//   pergunta mora na barra do pé de toda página (ChatBarra).
// - Celular: barra fina, marca menor, ícones de 20px com área de toque de 44px
//   (o padding faz a área, não o desenho).
const topo = useTopo({ normal: 72, encolhido: 60, celular: { normal: 52, encolhido: 46 } })
const { itens, mercado } = useMercadoDoTopo()
const nav = computed(() => topo.nav.value)

// ROBUSTEZ (11/11/2026, docs/aportou/robustez.md): no site de investidor a nav
// vai a 15px/500 (a Legora), o item ativo ganha um traço cobalto de 2px a uma
// distância fixa da letra (encolhido ou não) e, sob o ponteiro, UMA pílula
// creme anda de item em item (translateX + largura medidos, --nu-dur-media
// --nu-ease-saida). Aparece no lugar, sem vir deslizando de onde parou; com o
// painel de um grupo aberto, fica no item dele enquanto o ponteiro está no
// painel. A chamada é a pílula com a seta (NuBotaoSeta carvão p) e o wordmark
// encolhe junto com a barra.
const navEl = ref<HTMLElement | null>(null)
const realce = ref({ x: 0, w: 0 })
const realceVisivel = ref(false)
const realceQuieto = ref(true)
let realceSobre: HTMLElement | null = null
function realceEm(el: HTMLElement | null) {
  const nav = navEl.value
  if (!nav || !el) { realceVisivel.value = false; return }
  const n = nav.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  const novo = { x: r.left - n.left, w: r.width }
  if (realceVisivel.value) { realce.value = novo; return }
  // estava escondida: aparece no lugar (sem transição de posição) e só depois passa a andar
  realceQuieto.value = true
  realce.value = novo
  realceVisivel.value = true
  requestAnimationFrame(() => requestAnimationFrame(() => { realceQuieto.value = false }))
}
function sincronizarRealce() {
  const p = topo.painel.value
  const aberto = p?.tipo === 'nav' ? p.item : null
  const doPainel = aberto ? navEl.value?.querySelector<HTMLElement>(`[data-nav="${CSS.escape(aberto)}"]`) ?? null : null
  realceEm(realceSobre ?? doPainel)
}
function itemEntra(item: NavItem, ev: MouseEvent) {
  realceSobre = ev.currentTarget as HTMLElement
  sincronizarRealce()
  if (item.panel || item.children) topo.navEntra(item, ev)
}
function itemSai(item: NavItem) {
  if (item.panel) topo.navSai()
}
function navSaiDaNav() {
  realceSobre = null
  sincronizarRealce()
}
watch(() => topo.painel.value, () => { if (import.meta.client) sincronizarRealce() })
const estiloRealce = computed(() => ({ width: `${realce.value.w}px`, transform: `translateX(${realce.value.x}px)` }))
</script>

<template>
  <div
    class="nuh-wrap nuh-wrap--ap"
    :class="{ 'nuh-wrap--shrunk': topo.shrunk.value }"
  >
    <div class="nuh">
      <NuTopoMarca class="nuh__marca" />

      <nav ref="navEl" class="nuh__nav" aria-label="Principal" @mouseleave="navSaiDaNav">
        <!-- a pílula do hover: uma só, que anda de item em item -->
        <span
          class="nuh__realce" :class="{ 'nuh__realce--on': realceVisivel, 'nuh__realce--quieto': realceQuieto }"
          :style="estiloRealce" aria-hidden="true"
        />
        <template v-for="item in nav" :key="item.label">
          <NuxtLink
            v-if="item.to" :to="item.to" class="nuh__item" :data-nav="item.label"
            :class="{ 'nuh__item--ativo': topo.ativo(item.to), 'nuh__item--aberto': topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label }"
            :aria-current="topo.ativo(item.to) ? 'page' : undefined"
            @mouseenter="itemEntra(item, $event)"
            @mouseleave="itemSai(item)"
          >{{ item.label }}</NuxtLink>
          <button
            v-else type="button" class="nuh__item nuh__item--grupo" :data-nav="item.label"
            :class="{ 'nuh__item--ativo': topo.paiAtivo(item), 'nuh__item--aberto': topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label }"
            :aria-expanded="topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label" aria-haspopup="menu"
            @mouseenter="itemEntra(item, $event)" @mouseleave="topo.navSai()" @click="topo.navClique(item, $event)"
          >
            {{ item.label }}
            <svg class="nuh__chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </template>
      </nav>

      <div class="nuh__dir">
        <NuxtLink to="/busca" class="nuh__busca" aria-label="Buscar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
          <span class="nuh__busca-texto">Buscar ativo ou tese</span>
        </NuxtLink>
        <template v-if="topo.isAuthenticated.value">
          <button
            type="button" class="nuh__avatar" aria-label="Conta" aria-haspopup="menu" :aria-expanded="topo.painel.value?.tipo === 'conta'"
            @click="topo.alternar('conta', $event, 220)"
          ><span>{{ topo.initial.value }}</span></button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="nuh__entrar">Entrar</NuxtLink>
          <NuBotaoSeta to="/assinar?quiz=1&de=topo" variante="carvao" tamanho="p" class="nuh__chamada">Criar conta grátis</NuBotaoSeta>
        </template>
        <button type="button" class="nuh__burger" aria-label="Abrir menu" :aria-expanded="topo.menuAberto.value" @click="topo.abrirMenu(true)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M4 9h16M4 15h16" /></svg>
        </button>
      </div>
    </div>
  </div>

  <NuTopoMega
    :item="topo.itemAberto.value?.label ?? null"
    :filhos="topo.itemAberto.value ? topo.filhosDe(topo.itemAberto.value) : []" :left="topo.pos.value.left" :top="topo.pos.value.top" :quente="topo.filhoQuente.value"
    @quente="topo.filhoQuente.value = $event" @entra="topo.painelEntra()" @sai="topo.navSai()" @fechar="topo.fecharPainel()" @tecla="topo.teclaNoPainel($event)"
  />
  <NuTopoConta
    :aberto="topo.painel.value?.tipo === 'conta'" :right="topo.pos.value.right" :top="topo.pos.value.top"
    @fechar="topo.fecharPainel()" @sair="topo.sair()" @tecla="topo.teclaNoPainel($event)"
  />
  <NuTopoMenu
    :aberto="topo.menuAberto.value" :nav="nav" :logado="topo.isAuthenticated.value"
    @fechar="topo.abrirMenu(false)" @sair="topo.sair()"
  >
    <template v-if="itens.length" #mercado>
      <NuTopoMercadoLista :itens="itens.slice(0, 4)" :mercado="mercado" />
    </template>
  </NuTopoMenu>
</template>

<style scoped>
/* .nuh-wrap: o ChatSeletor conta com esta classe (o contorno não passa por baixo do header) */
.nuh-wrap {
  position: sticky; top: 0; z-index: 50; container-type: inline-size; container-name: topo;
  background: var(--nu-white); border-bottom: 1px solid var(--nu-cream-line);
}
.nuh {
  --mov: var(--nu-dur-topo) var(--nu-ease-saida);
  display: flex; align-items: center; height: 72px; padding: 0 clamp(16px, 3vw, 40px);
  transition: height var(--mov);
}
.nuh-wrap--shrunk .nuh { height: 60px; }
.nuh__marca { margin-right: clamp(20px, 2.6vw, 40px); }
.nuh__nav { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; height: 100%; }
.nuh__item {
  position: relative; display: inline-flex; align-items: center; gap: 5px; height: 100%; padding: 0 10px;
  border: 0; background: transparent; cursor: pointer; font-family: inherit;
  color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); letter-spacing: -0.01em; white-space: nowrap;
  transition: color .2s;
}
.nuh__item::after {
  content: ''; position: absolute; left: 10px; right: 10px; bottom: -1px; height: 2px; border-radius: 2px;
  background: var(--nu-blue); transform: scaleX(0); transition: transform .3s var(--nu-ease-saida);
}
.nuh__item--grupo::after { right: 27px; }
.nuh__item:hover, .nuh__item--aberto { color: var(--nu-ink); }
.nuh__item--ativo { color: var(--nu-ink); }
.nuh__item--ativo::after { transform: scaleX(1); }
.nuh__chev { opacity: .5; transition: transform .2s ease; }
.nuh__item--aberto .nuh__chev { transform: rotate(180deg); }
.nuh__item:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: -6px; border-radius: 10px; }

.nuh__dir { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: auto; }
.nuh__busca {
  display: inline-flex; align-items: center; gap: 9px; height: 40px; width: clamp(180px, 18vw, 260px); padding: 0 16px;
  border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-gray);
  font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); white-space: nowrap; transition: background .2s;
}
.nuh__busca:hover { background: var(--nu-cream-4); color: var(--nu-gray-2); }
.nuh__busca svg { flex-shrink: 0; color: var(--nu-gray-2); }
.nuh__entrar {
  display: inline-flex; align-items: center; height: 40px; padding: 0 12px 0 14px;
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); white-space: nowrap; border-radius: var(--nu-r-pill);
}
.nuh__entrar:hover { color: var(--nu-blue-text); }
.nuh__busca:active, .nuh__burger:active, .nuh__avatar:active { transform: translateY(1px); }
.nuh__avatar {
  width: 38px; height: 38px; margin-left: 4px; padding: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-family: inherit;
}
.nuh__avatar span {
  width: 38px; height: 38px; border-radius: 50%; background: var(--nu-blue); color: var(--nu-white);
  display: flex; align-items: center; justify-content: center; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); transition: background .2s;
}
.nuh__avatar:hover span { background: var(--nu-blue-hover); }
.nuh__burger {
  display: none; width: 44px; height: 44px; border: 0; border-radius: 50%; background: transparent; color: var(--nu-ink);
  align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.nuh__burger:hover { background: var(--nu-cream); }
.nuh__busca:focus-visible, .nuh__entrar:focus-visible, .nuh__avatar:focus-visible, .nuh__burger:focus-visible {
  outline: 2px solid var(--nu-blue); outline-offset: 2px;
}

@container topo (max-width: 1160px) {
  .nuh__busca { width: 40px; padding: 0; justify-content: center; background: transparent; border-radius: 50%; }
  .nuh__busca:hover { background: var(--nu-cream); }
  .nuh__busca-texto { display: none; }
  .nuh__busca svg { width: 19px; height: 19px; color: var(--nu-ink); }
}
@container topo (max-width: 960px) {
  .nuh__nav { display: none; }
  .nuh__burger { display: flex; }
}
/* ——— celular: mais fino, área de toque de 44px pelo padding ——— */
@container topo (max-width: 640px) {
  .nuh { height: 52px; padding: 0 6px 0 16px; }
  .nuh-wrap--shrunk .nuh { height: 46px; }
  .nuh__marca { gap: 8px; margin-right: 0; padding: 10px 6px 10px 2px; }
  .nuh__dir { gap: 0; }
  .nuh__entrar { display: none; }
  .nuh__busca { width: 44px; height: 44px; }
  .nuh__busca svg { width: 20px; height: 20px; }
  .nuh__avatar { width: 44px; height: 44px; margin-left: 0; }
  .nuh__avatar span { width: 30px; height: 30px; font-size: var(--nu-fs-xs); }
}
@media (prefers-reduced-motion: reduce) {
  .nuh, .nuh__item::after { transition: none; }
}

/* ——— Aportou: o topo do site de investidor ———
   Robustez (11/11/2026): tudo em token; o encolher fica no tempo de sempre
   (--mov, .32s): a régua, a faixa de seções e as barras que grudam (guias,
   teses, glossário, ativo) andam juntas com ele, sem vão. */
.nuh-wrap--ap {
  background: var(--nu-page); border-bottom-color: transparent;
  transition: border-color var(--nu-dur-media) var(--nu-ease-cor);
}
.nuh-wrap--ap.nuh-wrap--shrunk { border-bottom-color: var(--nu-line-2); }
/* a coluna do conteúdo em toda largura (--nu-coluna): o wordmark alinha com o título da página */
.nuh-wrap--ap .nuh { padding-inline: var(--nu-coluna); }
/* o wordmark encolhe junto com a barra */
.nuh-wrap--ap .nuh__marca :deep(svg) { transform-origin: 0 50%; transition: transform var(--mov); }
.nuh-wrap--ap.nuh-wrap--shrunk .nuh__marca :deep(svg) { transform: scale(.9); }

/* a nav: 15px/500 em carvão de apoio; sob o ponteiro, aberta ou ativa, carvão */
.nuh-wrap--ap .nuh__nav { position: relative; gap: 2px; }
.nuh-wrap--ap .nuh__item {
  z-index: 1; padding: 0 13px; color: var(--nu-gray-3);
  font-size: 15px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto);
  transition: color var(--nu-dur-media) var(--nu-ease-cor);
}
.nuh-wrap--ap .nuh__item:hover, .nuh-wrap--ap .nuh__item--aberto, .nuh-wrap--ap .nuh__item--ativo { color: var(--nu-ink); }
/* o ativo: um traço cobalto de 2px a uma distância fixa do centro da letra (encolhido ou não) */
.nuh-wrap--ap .nuh__item::after {
  left: 13px; right: 13px; top: calc(50% + 22px); bottom: auto; height: 2px;
  transition: transform var(--nu-dur-lenta) var(--nu-ease-troca);
}
.nuh-wrap--ap .nuh__item--grupo::after { right: 30px; }
.nuh-wrap--ap .nuh__chev { opacity: .5; transition: transform var(--nu-dur-media) var(--nu-ease-saida), opacity var(--nu-dur-media) var(--nu-ease-cor); }
.nuh-wrap--ap .nuh__item:hover .nuh__chev, .nuh-wrap--ap .nuh__item--aberto .nuh__chev { opacity: 1; }
/* o foco do teclado tem a forma da pílula */
.nuh-wrap--ap .nuh__item:focus-visible { outline: none; }
.nuh-wrap--ap .nuh__item:focus-visible::before {
  content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 36px; margin-top: -18px;
  border-radius: var(--nu-r-pill); outline: 3px solid var(--nu-blue); outline-offset: 0; pointer-events: none;
}
/* a pílula do hover: aparece no lugar e anda de item em item */
.nuh__realce {
  position: absolute; left: 0; top: 50%; height: 36px; margin-top: -18px; border-radius: var(--nu-r-pill);
  background: var(--nu-band); opacity: 0; pointer-events: none;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), width var(--nu-dur-media) var(--nu-ease-saida), opacity var(--nu-dur-media) var(--nu-ease-cor);
}
.nuh__realce--quieto { transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }
.nuh__realce--on { opacity: 1; }

/* à direita: busca, Entrar e a chamada na mesma altura (40px) */
.nuh-wrap--ap .nuh__dir { gap: 6px; }
.nuh-wrap--ap .nuh__busca {
  height: 40px; background: var(--nu-band); color: var(--nu-gray); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.nuh-wrap--ap .nuh__busca svg { transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.nuh-wrap--ap .nuh__busca:hover { background: var(--nu-cream-2); color: var(--nu-ink); }
.nuh-wrap--ap .nuh__busca:hover svg { color: var(--nu-ink); }
.nuh-wrap--ap .nuh__entrar {
  height: 40px; padding: 0 14px; color: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.nuh-wrap--ap .nuh__entrar:hover { background: var(--nu-band); color: var(--nu-ink); }
.nuh-wrap--ap .nuh__chamada { margin-left: 2px; }
.nuh-wrap--ap .nuh__avatar { width: 40px; height: 40px; margin-left: 2px; }
.nuh-wrap--ap .nuh__avatar span {
  width: 36px; height: 36px; background: var(--nu-ink); font-weight: var(--nu-w-medio);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), box-shadow var(--nu-dur-media) var(--nu-ease-cor);
}
.nuh-wrap--ap .nuh__avatar:hover span { background: var(--nu-ink-hover); }
/* o menu da conta aberto: o avatar ganha o anel (o estado à vista) */
.nuh-wrap--ap .nuh__avatar[aria-expanded="true"] span { box-shadow: 0 0 0 3px var(--nu-page), 0 0 0 4.5px var(--nu-line); }
.nuh-wrap--ap .nuh__burger { transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida); }
.nuh-wrap--ap .nuh__burger:hover { background: var(--nu-band); }
/* apertado: afunda 2 a 3%, como a pílula da seta */
.nuh-wrap--ap :is(.nuh__busca, .nuh__entrar, .nuh__burger, .nuh__avatar):active { transform: scale(.97); }
.nuh-wrap--ap :is(.nuh__busca, .nuh__entrar, .nuh__avatar, .nuh__burger):focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }

@container topo (max-width: 1160px) {
  .nuh-wrap--ap .nuh__busca { background: transparent; }
  .nuh-wrap--ap .nuh__busca:hover { background: var(--nu-band); }
}
/* com o hambúrguer na ponta, o desenho do ícone (não a área de toque) fecha a coluna */
@container topo (max-width: 960px) {
  .nuh-wrap--ap .nuh { padding-right: max(8px, calc(var(--nu-coluna) - 12px)); }
}
@container topo (max-width: 640px) {
  .nuh-wrap--ap .nuh__marca { padding: 4px 6px 4px 2px; }
  .nuh-wrap--ap .nuh__marca :deep(svg) { height: 24px; width: auto; }
  .nuh-wrap--ap .nuh__dir { gap: 0; }
  .nuh-wrap--ap .nuh__chamada { display: none; }
  .nuh-wrap--ap .nuh__busca { width: 44px; height: 44px; }
  .nuh-wrap--ap .nuh__avatar { width: 44px; height: 44px; margin-left: 0; }
  .nuh-wrap--ap .nuh__avatar span { width: 30px; height: 30px; }
}
@media (prefers-reduced-motion: reduce) {
  .nuh__realce, .nuh-wrap--ap .nuh__marca :deep(svg) { transition: none; }
}
</style>
