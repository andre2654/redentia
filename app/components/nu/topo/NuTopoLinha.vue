<script setup lang="ts">
// PROTÓTIPO ?topo=2 (02/11/2026): "Uma linha só". O header e o mercado numa
// barra fina: o mercado vira uma pílula viva ao lado da busca, que troca de
// cotação com um giro vertical suave (IBOV → dólar → IFIX → CDI) no lugar do
// marquee sem fim. Clicar abre o painel com todas as cotações, de quando são
// e o aviso de atraso da B3; no celular o painel é uma folha que sobe do pé.
// O giro para no hover, no foco, com o painel aberto, com a aba escondida e
// com prefers-reduced-motion (aí fica no IBOV).
const topo = useTopo({ normal: 64, encolhido: 56 })
const { itens, loading, mercado } = useMercadoDoTopo()

const GIRO = ['IBOV', 'Dólar', 'IFIX', 'CDI']
const quadros = computed(() => itens.value.filter((c) => GIRO.includes(c.n)))
const atual = ref(0)
const anterior = ref(-1)
const pausa = ref(false)
let giro: ReturnType<typeof setInterval> | null = null
function girar() {
  if (pausa.value || topo.painel.value?.tipo === 'mercado' || document.hidden || quadros.value.length < 2) return
  anterior.value = atual.value
  atual.value = (atual.value + 1) % quadros.value.length
}
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  giro = setInterval(girar, 3800)
})
onBeforeUnmount(() => { if (giro) clearInterval(giro) })
function quadro(i: number) {
  if (i === atual.value) return 'ntl__q--atual'
  if (i === anterior.value) return 'ntl__q--saiu'
  return ''
}
const abertoMercado = computed(() => topo.painel.value?.tipo === 'mercado')
const rotuloDoBotao = computed(() => {
  const ibov = itens.value.find((c) => c.n === 'IBOV')
  const base = ibov ? `IBOV ${ibov.v}${ibov.pct ? `, ${ibov.pct}` : ''}` : 'Mercado'
  return `${base}. Ver todas as cotações`
})
</script>

<template>
  <div class="ntl nuh-wrap" :class="{ 'ntl--encolhido': topo.shrunk.value }">
    <div class="ntl__barra">
      <NuTopoMarca class="ntl__marca" />

      <nav class="ntl__nav" aria-label="Principal">
        <template v-for="item in topo.nav.value" :key="item.label">
          <NuxtLink
            v-if="item.to" :to="item.to" class="ntl__item"
            :class="{ 'ntl__item--ativo': topo.ativo(item.to), 'ntl__item--aberto': topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label }"
            :aria-current="topo.ativo(item.to) ? 'page' : undefined"
            @mouseenter="item.panel ? topo.navEntra(item, $event) : undefined"
            @mouseleave="item.panel ? topo.navSai() : undefined"
          >{{ item.label }}</NuxtLink>
          <button
            v-else type="button" class="ntl__item ntl__item--grupo"
            :class="{ 'ntl__item--ativo': topo.paiAtivo(item), 'ntl__item--aberto': topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label }"
            :aria-expanded="topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label" aria-haspopup="menu"
            @mouseenter="topo.navEntra(item, $event)" @mouseleave="topo.navSai()" @click="topo.navClique(item, $event)"
          >
            {{ item.label }}
            <svg class="ntl__chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </template>
      </nav>

      <div class="ntl__dir">
        <!-- a pílula do mercado -->
        <div v-if="loading" class="ntl__mercado ntl__mercado--sk" aria-hidden="true">
          <NuSkeleton variant="line" width="112px" height="12px" radius="pill" />
        </div>
        <button
          v-else-if="quadros.length" type="button" class="ntl__mercado" :class="{ 'ntl__mercado--aberto': abertoMercado }"
          :aria-label="rotuloDoBotao" aria-haspopup="dialog" :aria-expanded="abertoMercado"
          @mouseenter="pausa = true" @mouseleave="pausa = false" @focus="pausa = true" @blur="pausa = false"
          @click="topo.alternar('mercado', $event, 320)"
        >
          <span class="ntl__ponto" :class="{ 'ntl__ponto--vivo': mercado?.estado === 'aberta' }" aria-hidden="true" />
          <span class="ntl__janela" aria-hidden="true">
            <span v-for="(c, i) in quadros" :key="c.n" class="ntl__q" :class="[quadro(i), { 'ntl__q--sem-pct': !c.pct }]">
              <span class="ntl__q-nome">{{ c.n }}</span>
              <span class="ntl__q-valor">{{ c.v }}</span>
              <span v-if="c.pct" class="ntl__q-pct" :class="`ntl__q-pct--${c.dir}`">{{ c.pct.replace('-', '−') }}</span>
            </span>
          </span>
          <span class="ntl__atraso" aria-hidden="true">15 min</span>
        </button>

        <NuxtLink to="/busca" class="ntl__icone" aria-label="Buscar">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
        </NuxtLink>
        <template v-if="topo.isAuthenticated.value">
          <button
            type="button" class="ntl__avatar" aria-label="Conta" aria-haspopup="menu" :aria-expanded="topo.painel.value?.tipo === 'conta'"
            @click="topo.alternar('conta', $event, 220)"
          >{{ topo.initial.value }}</button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="ntl__entrar">Entrar</NuxtLink>
          <NuxtLink to="/assinar?quiz=1&de=topo" class="ntl__cta">Conectar carteira</NuxtLink>
        </template>
        <button type="button" class="ntl__icone ntl__burger" aria-label="Abrir menu" :aria-expanded="topo.menuAberto.value" @click="topo.abrirMenu(true)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M4 9h16M4 15h16" /></svg>
        </button>
      </div>
    </div>
  </div>

  <!-- o painel do mercado: popover no computador, folha no celular -->
  <Teleport to="body">
    <Transition name="ntlp">
      <div v-if="abertoMercado" class="ntlp" data-topo-painel>
        <div class="ntlp__fundo" aria-hidden="true" @click="topo.fecharPainel()" />
        <div class="ntlp__caixa" role="dialog" aria-label="Cotações" :style="{ right: `${topo.pos.value.right}px`, top: `${topo.pos.value.top}px` }">
          <div class="ntlp__alca" aria-hidden="true" />
          <NuTopoMercadoLista :itens="itens" :mercado="mercado" />
        </div>
      </div>
    </Transition>
  </Teleport>

  <NuTopoMega
    v-if="topo.itemAberto.value"
    :filhos="topo.filhosDe(topo.itemAberto.value)" :left="topo.pos.value.left" :top="topo.pos.value.top" :quente="topo.filhoQuente.value"
    @quente="topo.filhoQuente.value = $event" @entra="topo.painelEntra()" @sai="topo.navSai()" @fechar="topo.fecharPainel()"
  />
  <NuTopoConta
    v-if="topo.painel.value?.tipo === 'conta'" :right="topo.pos.value.right" :top="topo.pos.value.top"
    @fechar="topo.fecharPainel()" @sair="topo.sair()"
  />
  <NuTopoMenu forma="folha" :aberto="topo.menuAberto.value" :nav="topo.nav.value" :logado="topo.isAuthenticated.value" @fechar="topo.abrirMenu(false)" @sair="topo.sair()">
    <template v-if="itens.length" #mercado>
      <NuTopoMercadoLista :itens="itens.slice(0, 4)" :mercado="mercado" />
    </template>
  </NuTopoMenu>
</template>

<style scoped>
.ntl {
  position: sticky; top: 0; z-index: 50; container-type: inline-size; container-name: topo;
  background: var(--nu-white); border-bottom: 1px solid var(--nu-cream-line);
}
.ntl__barra {
  --mov: .32s cubic-bezier(.2, .8, .2, 1);
  display: flex; align-items: center; gap: 8px; height: 64px; padding: 0 clamp(16px, 3vw, 40px);
  transition: height var(--mov);
}
.ntl--encolhido .ntl__barra { height: 56px; }
.ntl__marca { margin-right: 18px; }
.ntl__nav { display: flex; align-items: center; gap: 2px; flex: 1; min-width: 0; }
.ntl__item {
  display: inline-flex; align-items: center; gap: 5px; height: 36px; padding: 0 12px;
  border: 0; border-radius: var(--nu-r-pill); background: transparent; cursor: pointer; font-family: inherit;
  color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; transition: background .2s, color .2s;
}
.ntl__item:hover, .ntl__item--aberto { background: var(--nu-cream); color: var(--nu-ink); }
.ntl__item--ativo { color: var(--nu-blue-text); }
.ntl__item--ativo:hover { color: var(--nu-blue-text); }
.ntl__chev { opacity: .55; transition: transform .2s ease; }
.ntl__item--aberto .ntl__chev { transform: rotate(180deg); }
.ntl__dir { display: flex; align-items: center; gap: 6px; flex-shrink: 0; margin-left: auto; }

/* ——— a pílula do mercado ——— */
.ntl__mercado {
  display: inline-flex; align-items: center; gap: 9px; height: 36px; padding: 0 12px 0 13px; margin-right: 6px;
  border: 1px solid var(--nu-cream-line); border-radius: var(--nu-r-pill); background: var(--nu-white);
  font-family: inherit; font-size: var(--nu-fs-dense); cursor: pointer; transition: background .2s, border-color .2s;
}
.ntl__mercado:hover, .ntl__mercado--aberto { background: var(--nu-cream); border-color: var(--nu-cream); }
.ntl__mercado--sk { cursor: default; width: 168px; }
.ntl__ponto { width: 6px; height: 6px; border-radius: 50%; background: var(--nu-sand); flex-shrink: 0; position: relative; }
.ntl__ponto--vivo { background: var(--nu-green); }
.ntl__ponto--vivo::after {
  content: ''; position: absolute; inset: -4px; border-radius: 50%; background: var(--nu-green);
  opacity: 0; animation: ntl-respira 2.8s ease-out infinite;
}
@keyframes ntl-respira { 0% { transform: scale(.5); opacity: .35; } 70%, 100% { transform: scale(1.5); opacity: 0; } }
/* os quadros empilhados na mesma célula: a janela tem a largura do maior e
   não pula de tamanho a cada giro */
.ntl__janela { display: grid; overflow: hidden; height: 20px; }
.ntl__q {
  grid-area: 1 / 1; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; line-height: 20px;
  opacity: 0; transform: translateY(100%);
  transition: transform .55s cubic-bezier(.2, .8, .2, 1), opacity .4s ease;
}
.ntl__q--atual { opacity: 1; transform: none; }
.ntl__q--saiu { opacity: 0; transform: translateY(-100%); }
.ntl__q-nome { color: var(--nu-gray); font-weight: 700; }
.ntl__q-valor { color: var(--nu-ink); font-weight: 700; font-variant-numeric: tabular-nums; }
.ntl__q-pct { font-weight: 700; font-variant-numeric: tabular-nums; }
.ntl__q-pct--up { color: var(--nu-green-text); }
.ntl__q-pct--down { color: var(--nu-red-text); }
.ntl__atraso {
  padding-left: 9px; border-left: 1px solid var(--nu-cream-line);
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; white-space: nowrap;
}

.ntl__icone {
  width: 38px; height: 38px; flex-shrink: 0; border: 0; border-radius: 50%; background: transparent; color: var(--nu-ink);
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.ntl__icone:hover { background: var(--nu-cream); }
.ntl__burger { display: none; }
.ntl__entrar {
  display: inline-flex; align-items: center; height: 38px; padding: 0 14px; border-radius: var(--nu-r-pill);
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; transition: background .2s;
}
.ntl__entrar:hover { background: var(--nu-cream); }
.ntl__cta {
  display: inline-flex; align-items: center; height: 38px; padding: 0 18px; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: 800; white-space: nowrap; transition: background .2s;
}
.ntl__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.ntl__cta:active, .ntl__item:active, .ntl__icone:active, .ntl__mercado:active { transform: translateY(1px); }
.ntl__avatar {
  width: 36px; height: 36px; border: 0; border-radius: 50%; background: var(--nu-blue); color: var(--nu-white);
  font-family: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; margin-left: 4px;
}
.ntl__avatar:hover { background: var(--nu-blue-hover); }
.ntl__item:focus-visible, .ntl__icone:focus-visible, .ntl__entrar:focus-visible, .ntl__cta:focus-visible,
.ntl__avatar:focus-visible, .ntl__mercado:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* o contêiner conta, não a janela (com o chat aberto a página encolhe) */
@container topo (max-width: 1240px) {
  .ntl__q-valor { display: none; }
  .ntl__q--sem-pct .ntl__q-valor { display: inline; }
}
@container topo (max-width: 1060px) {
  .ntl__nav { display: none; }
  .ntl__burger { display: flex; }
  .ntl__q-valor { display: inline; }
}
@container topo (max-width: 640px) {
  .ntl__entrar, .ntl__cta, .ntl__atraso { display: none; }
  .ntl__q-valor { display: none; }
  .ntl__q--sem-pct .ntl__q-valor { display: inline; }
  .ntl__marca :deep(.ntm__nome) { display: none; }
  .ntl__marca { margin-right: 0; }
  .ntl__dir { flex: 1; justify-content: flex-end; }
  .ntl__mercado { margin-right: auto; margin-left: 6px; }
}

/* ——— o painel do mercado ——— */
.ntlp { position: fixed; inset: 0; z-index: 60; pointer-events: none; }
.ntlp__fundo { display: none; }
.ntlp__caixa {
  position: fixed; width: 320px; padding: 14px 14px 12px; pointer-events: auto;
  background: var(--nu-white); border: 1px solid var(--nu-navy-06); border-radius: var(--nu-r-panel);
  box-shadow: 0 24px 54px -22px rgba(12, 21, 36, 0.32), 0 2px 8px rgba(12, 21, 36, 0.06);
  transform-origin: top right;
}
.ntlp__alca { display: none; }
.ntlp-enter-active, .ntlp-leave-active { transition: opacity .2s ease; }
.ntlp-enter-active .ntlp__caixa, .ntlp-leave-active .ntlp__caixa { transition: transform .26s cubic-bezier(.2, .8, .2, 1); }
.ntlp-enter-from, .ntlp-leave-to { opacity: 0; }
.ntlp-enter-from .ntlp__caixa, .ntlp-leave-to .ntlp__caixa { transform: translateY(-4px) scale(.98); }
@media (max-width: 760px) {
  .ntlp { pointer-events: auto; }
  .ntlp__fundo { display: block; position: absolute; inset: 0; background: var(--nu-veil); }
  .ntlp__caixa {
    left: 0 !important; right: 0 !important; top: auto !important; bottom: 0; width: auto;
    padding: 8px 20px calc(18px + env(safe-area-inset-bottom, 0px)); border-radius: 28px 28px 0 0; border: 0;
  }
  .ntlp__alca { display: block; width: 38px; height: 5px; margin: 0 auto 12px; border-radius: 3px; background: var(--nu-ink-14); }
  .ntlp-enter-from .ntlp__caixa, .ntlp-leave-to .ntlp__caixa { transform: translateY(100%); }
  .ntlp-enter-active .ntlp__caixa, .ntlp-leave-active .ntlp__caixa { transition: transform .36s cubic-bezier(.2, .8, .2, 1); }
}
@media (prefers-reduced-motion: reduce) {
  .ntl__q { transition: none; }
  .ntl__ponto--vivo::after { animation: none; }
}
</style>
