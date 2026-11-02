<script setup lang="ts">
// PROTÓTIPO ?topo=3 (02/11/2026): "Editorial calmo". Header branco com tipo
// assentado e um fio embaixo; a nav é texto, e a página ativa ganha um traço
// azul. A busca é um campo de verdade à direita. O mercado é uma régua parada
// logo abaixo, que gruda junto: o estado da bolsa (o ponto respira só com o
// pregão aberto), as cotações em números tabulares separados por fios, que
// se ajustam à largura (o que não cabe some do fim da fila), e de quando são
// os números com o aviso de atraso da B3 no canto.
const topo = useTopo({ normal: 72, encolhido: 60, celular: { normal: 60, encolhido: 56 } })
const { itens, loading, mercado } = useMercadoDoTopo()
const railSections = useState<RailState | null>('nu:section-rail', () => null)
const route = useRoute()
const comRegua = computed(() => route.path !== '/assinar' && !railSections.value && (loading.value || itens.value.length > 0))
</script>

<template>
  <div class="ntd nuh-wrap" :class="{ 'ntd--encolhido': topo.shrunk.value }">
    <div class="ntd__barra">
      <NuTopoMarca class="ntd__marca" />

      <nav class="ntd__nav" aria-label="Principal">
        <template v-for="item in topo.nav.value" :key="item.label">
          <NuxtLink
            v-if="item.to" :to="item.to" class="ntd__item"
            :class="{ 'ntd__item--ativo': topo.ativo(item.to), 'ntd__item--aberto': topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label }"
            :aria-current="topo.ativo(item.to) ? 'page' : undefined"
            @mouseenter="item.panel ? topo.navEntra(item, $event) : undefined"
            @mouseleave="item.panel ? topo.navSai() : undefined"
          >{{ item.label }}</NuxtLink>
          <button
            v-else type="button" class="ntd__item ntd__item--grupo"
            :class="{ 'ntd__item--ativo': topo.paiAtivo(item), 'ntd__item--aberto': topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label }"
            :aria-expanded="topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label" aria-haspopup="menu"
            @mouseenter="topo.navEntra(item, $event)" @mouseleave="topo.navSai()" @click="topo.navClique(item, $event)"
          >
            {{ item.label }}
            <svg class="ntd__chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </template>
      </nav>

      <div class="ntd__dir">
        <NuxtLink to="/busca" class="ntd__busca" aria-label="Buscar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
          <span class="ntd__busca-texto">Buscar ativo ou tese</span>
        </NuxtLink>
        <template v-if="topo.isAuthenticated.value">
          <button
            type="button" class="ntd__avatar" aria-label="Conta" aria-haspopup="menu" :aria-expanded="topo.painel.value?.tipo === 'conta'"
            @click="topo.alternar('conta', $event, 220)"
          >{{ topo.initial.value }}</button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="ntd__entrar">Entrar</NuxtLink>
          <NuxtLink to="/assinar?quiz=1&de=topo" class="ntd__cta">Conectar carteira</NuxtLink>
        </template>
        <button type="button" class="ntd__burger" aria-label="Abrir menu" :aria-expanded="topo.menuAberto.value" @click="topo.abrirMenu(true)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M4 9h16M4 15h16" /></svg>
        </button>
      </div>
    </div>
  </div>

  <!-- a régua do mercado: gruda logo abaixo do header -->
  <div v-if="comRegua" class="ntd-regua nut-wrap">
    <div v-if="loading" class="ntd-regua__sk" aria-hidden="true">
      <NuSkeleton v-for="w in [88, 124, 112, 104, 120, 116]" :key="w" variant="line" :width="`${w}px`" height="12px" radius="pill" />
    </div>
    <template v-else>
      <NuTopoEstado :mercado="mercado" curto class="ntd-regua__estado" />
      <NuTopoCotacoes :itens="itens" separador class="ntd-regua__cot" />
      <span class="ntd-regua__nota">
        <span v-if="mercado?.referencia" class="ntd-regua__ref">{{ mercado.referencia }} · </span><span class="ntd-regua__b3">B3 · atraso de </span><svg class="ntd-regua__relogio" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>15 min
      </span>
    </template>
  </div>

  <NuTopoMega
    v-if="topo.itemAberto.value"
    :filhos="topo.filhosDe(topo.itemAberto.value)" :left="topo.pos.value.left" :top="topo.pos.value.top" :quente="topo.filhoQuente.value"
    @quente="topo.filhoQuente.value = $event" @entra="topo.painelEntra()" @sai="topo.navSai()" @fechar="topo.fecharPainel()"
  />
  <NuTopoConta
    v-if="topo.painel.value?.tipo === 'conta'" :right="topo.pos.value.right" :top="topo.pos.value.top"
    @fechar="topo.fecharPainel()" @sair="topo.sair()"
  />
  <NuTopoMenu forma="tela" :aberto="topo.menuAberto.value" :nav="topo.nav.value" :logado="topo.isAuthenticated.value" @fechar="topo.abrirMenu(false)" @sair="topo.sair()">
    <template v-if="itens.length" #mercado>
      <NuTopoMercadoLista :itens="itens.slice(0, 4)" :mercado="mercado" />
    </template>
  </NuTopoMenu>
</template>

<style scoped>
.ntd {
  position: sticky; top: 0; z-index: 50; container-type: inline-size; container-name: topo;
  background: var(--nu-white); border-bottom: 1px solid var(--nu-cream-line);
}
.ntd__barra {
  --mov: .32s cubic-bezier(.2, .8, .2, 1);
  display: flex; align-items: center; height: 72px; padding: 0 clamp(16px, 3vw, 40px);
  transition: height var(--mov);
}
.ntd--encolhido .ntd__barra { height: 60px; }
.ntd__marca { margin-right: clamp(20px, 2.6vw, 40px); }
.ntd__nav { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; height: 100%; }
.ntd__item {
  position: relative; display: inline-flex; align-items: center; gap: 5px; height: 100%; padding: 0 10px;
  border: 0; background: transparent; cursor: pointer; font-family: inherit;
  color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 700; letter-spacing: -0.01em; white-space: nowrap;
  transition: color .2s;
}
.ntd__item::after {
  content: ''; position: absolute; left: 10px; right: 10px; bottom: -1px; height: 2px; border-radius: 2px;
  background: var(--nu-blue); transform: scaleX(0); transition: transform .3s cubic-bezier(.2, .8, .2, 1);
}
.ntd__item--grupo::after { right: 27px; }
.ntd__item:hover, .ntd__item--aberto { color: var(--nu-ink); }
.ntd__item--ativo { color: var(--nu-ink); }
.ntd__item--ativo::after { transform: scaleX(1); }
.ntd__chev { opacity: .5; transition: transform .2s ease; }
.ntd__item--aberto .ntd__chev { transform: rotate(180deg); }
.ntd__item:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: -6px; border-radius: 10px; }

.ntd__dir { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: auto; }
.ntd__busca {
  display: inline-flex; align-items: center; gap: 9px; height: 40px; width: clamp(180px, 18vw, 260px); padding: 0 16px;
  border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-gray);
  font-size: var(--nu-fs-sm); font-weight: 500; white-space: nowrap; transition: background .2s, box-shadow .2s;
}
.ntd__busca:hover { background: var(--nu-cream-4); color: var(--nu-gray-2); }
.ntd__busca svg { flex-shrink: 0; color: var(--nu-gray-2); }
.ntd__entrar {
  display: inline-flex; align-items: center; height: 40px; padding: 0 12px 0 14px;
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; border-radius: var(--nu-r-pill);
}
.ntd__entrar:hover { color: var(--nu-blue-text); }
.ntd__cta {
  display: inline-flex; align-items: center; height: 40px; padding: 0 20px; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: 800; white-space: nowrap; transition: background .2s;
}
.ntd__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.ntd__cta:active, .ntd__busca:active, .ntd__burger:active { transform: translateY(1px); }
.ntd__avatar {
  width: 38px; height: 38px; border: 0; border-radius: 50%; background: var(--nu-blue); color: var(--nu-white);
  font-family: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; margin-left: 4px;
}
.ntd__avatar:hover { background: var(--nu-blue-hover); }
.ntd__burger {
  display: none; width: 40px; height: 40px; border: 0; border-radius: 50%; background: transparent; color: var(--nu-ink);
  align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.ntd__burger:hover { background: var(--nu-cream); }
.ntd__busca:focus-visible, .ntd__entrar:focus-visible, .ntd__cta:focus-visible, .ntd__avatar:focus-visible, .ntd__burger:focus-visible {
  outline: 2px solid var(--nu-blue); outline-offset: 2px;
}

@container topo (max-width: 1160px) {
  .ntd__busca { width: 40px; padding: 0; justify-content: center; background: transparent; }
  .ntd__busca:hover { background: var(--nu-cream); }
  .ntd__busca-texto { display: none; }
  .ntd__busca svg { width: 19px; height: 19px; color: var(--nu-ink); }
}
@container topo (max-width: 960px) {
  .ntd__nav { display: none; }
  .ntd__burger { display: flex; }
}
@container topo (max-width: 640px) {
  .ntd__entrar, .ntd__cta { display: none; }
  .ntd__barra { height: 60px; }
  .ntd--encolhido .ntd__barra { height: 56px; }
}

/* ——— a régua do mercado ——— */
.ntd-regua {
  position: sticky; top: var(--nuh-h, 72px); z-index: 40; transition: top .32s cubic-bezier(.2, .8, .2, 1);
  display: flex; align-items: center; gap: 22px; height: 40px; padding: 0 clamp(16px, 3vw, 40px);
  background: var(--nu-white); border-bottom: 1px solid var(--nu-cream-line);
  font-size: var(--nu-fs-dense);
}
.ntd-regua__sk { display: flex; align-items: center; gap: 28px; }
.ntd-regua__estado { flex-shrink: 0; padding-right: 22px; border-right: 1px solid var(--nu-cream-line); height: 16px; }
.ntd-regua__cot { flex: 1 1 0; --ntc-gap: 28px; }
.ntd-regua__relogio { display: none; margin-right: 4px; vertical-align: -1px; }
.ntd-regua__nota { flex-shrink: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; white-space: nowrap; }
@media (max-width: 1100px) { .ntd-regua__ref { display: none; } }
@media (max-width: 760px) {
  .ntd-regua { height: 36px; gap: 14px; top: var(--nuh-h, 60px); }
  .ntd-regua__estado { padding-right: 14px; }
  .ntd-regua__cot { --ntc-gap: 18px; }
  .ntd-regua__b3 { display: none; }
  .ntd-regua__relogio { display: inline-block; }
}
@media (prefers-reduced-motion: reduce) { .ntd__item::after { transition: none; } }
</style>
