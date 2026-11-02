<script setup lang="ts">
// PROTÓTIPO ?topo=1 (02/11/2026): "Vidro". Parado no topo, o header é uma
// linha limpa sobre o branco; ao rolar, ele se descola e vira uma pílula de
// vidro flutuando a 10px do topo, mais estreita, com o fundo desfocado atrás.
// O mercado é uma linha quieta e centrada logo abaixo, que rola com a página
// (o topo que gruda é só a pílula). A marca sem o quadrado azul.
const topo = useTopo({ normal: 76, encolhido: 66 })
const { itens, loading, mercado } = useMercadoDoTopo()
const railSections = useState<RailState | null>('nu:section-rail', () => null)
const route = useRoute()
// o /assinar troca a faixa pela de venda (NuMarketTicker), e o rail de seções
// ocupa o lugar dela nas páginas que o declaram: aqui a linha some nos dois
const comLinha = computed(() => route.path !== '/assinar' && !railSections.value && (loading.value || itens.value.length > 0))
</script>

<template>
  <div class="ntv nuh-wrap" :class="{ 'ntv--solto': topo.shrunk.value }">
    <div class="ntv__pilula">
      <div class="ntv__lado">
        <NuTopoMarca />
      </div>

      <nav class="ntv__nav" aria-label="Principal">
        <template v-for="item in topo.nav.value" :key="item.label">
          <NuxtLink
            v-if="item.to" :to="item.to" class="ntv__item"
            :class="{ 'ntv__item--ativo': topo.ativo(item.to), 'ntv__item--aberto': topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label }"
            :aria-current="topo.ativo(item.to) ? 'page' : undefined"
            @mouseenter="item.panel ? topo.navEntra(item, $event) : undefined"
            @mouseleave="item.panel ? topo.navSai() : undefined"
          >{{ item.label }}</NuxtLink>
          <button
            v-else type="button" class="ntv__item ntv__item--grupo"
            :class="{ 'ntv__item--ativo': topo.paiAtivo(item), 'ntv__item--aberto': topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label }"
            :aria-expanded="topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label" aria-haspopup="menu"
            @mouseenter="topo.navEntra(item, $event)" @mouseleave="topo.navSai()" @click="topo.navClique(item, $event)"
          >
            {{ item.label }}
            <svg class="ntv__chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </template>
      </nav>

      <div class="ntv__lado ntv__lado--dir">
        <NuxtLink to="/busca" class="ntv__icone" aria-label="Buscar">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
        </NuxtLink>
        <template v-if="topo.isAuthenticated.value">
          <button
            type="button" class="ntv__avatar" aria-label="Conta" aria-haspopup="menu" :aria-expanded="topo.painel.value?.tipo === 'conta'"
            @click="topo.alternar('conta', $event, 220)"
          >{{ topo.initial.value }}</button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="ntv__entrar">Entrar</NuxtLink>
          <NuxtLink to="/assinar?quiz=1&de=topo" class="ntv__cta">Conectar carteira</NuxtLink>
        </template>
        <button type="button" class="ntv__icone ntv__burger" aria-label="Abrir menu" :aria-expanded="topo.menuAberto.value" @click="topo.abrirMenu(true)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M4 9h16M4 15h16" /></svg>
        </button>
      </div>
    </div>
  </div>

  <!-- a linha quieta do mercado: rola com a página -->
  <div v-if="comLinha" class="ntv-linha">
    <div v-if="loading" class="ntv-linha__sk" aria-hidden="true">
      <NuSkeleton v-for="w in [96, 120, 110, 104, 118]" :key="w" variant="line" :width="`${w}px`" height="12px" radius="pill" />
    </div>
    <template v-else>
      <NuTopoEstado :mercado="mercado" curto class="ntv-linha__estado" />
      <NuTopoCotacoes :itens="itens" ajustar class="ntv-linha__cot" />
      <span class="ntv-linha__nota">
        <span v-if="mercado?.referencia" class="ntv-linha__ref">{{ mercado.referencia }} · </span>B3 · atraso de 15 min
      </span>
    </template>
  </div>

  <NuTopoMega
    v-if="topo.itemAberto.value" vidro
    :filhos="topo.filhosDe(topo.itemAberto.value)" :left="topo.pos.value.left" :top="topo.pos.value.top" :quente="topo.filhoQuente.value"
    @quente="topo.filhoQuente.value = $event" @entra="topo.painelEntra()" @sai="topo.navSai()" @fechar="topo.fecharPainel()"
  />
  <NuTopoConta
    v-if="topo.painel.value?.tipo === 'conta'" vidro :right="topo.pos.value.right" :top="topo.pos.value.top"
    @fechar="topo.fecharPainel()" @sair="topo.sair()"
  />
  <NuTopoMenu forma="cartao" :aberto="topo.menuAberto.value" :nav="topo.nav.value" :logado="topo.isAuthenticated.value" @fechar="topo.abrirMenu(false)" @sair="topo.sair()">
    <template v-if="itens.length" #mercado>
      <NuTopoMercadoLista :itens="itens.slice(0, 4)" :mercado="mercado" />
    </template>
  </NuTopoMenu>
</template>

<style scoped>
/* o invólucro gruda e reserva a altura; a pílula é quem muda de forma */
.ntv {
  position: sticky; top: 0; z-index: 50; height: 76px;
  container-type: inline-size; container-name: topo;
  background: var(--nu-white); transition: background-color .3s ease;
}
.ntv--solto { background: transparent; height: 66px; }
.ntv__pilula {
  --mov: .42s cubic-bezier(.2, .8, .2, 1);
  position: relative; margin: 0 auto; height: 76px; width: 100%; max-width: 100%;
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px;
  padding: 0 clamp(16px, 3vw, 40px);
  border: 1px solid transparent; border-radius: 0;
  transition: max-width var(--mov), height var(--mov), margin var(--mov), border-radius var(--mov), padding var(--mov),
    background-color .3s ease, box-shadow .3s ease, border-color .3s ease;
}
.ntv--solto .ntv__pilula {
  margin-top: 10px; height: 56px; max-width: min(1120px, calc(100% - 24px)); border-radius: var(--nu-r-pill);
  padding: 0 10px 0 18px;
  background: var(--nu-white-88); border-color: var(--nu-navy-06);
  backdrop-filter: blur(22px) saturate(1.8); -webkit-backdrop-filter: blur(22px) saturate(1.8);
  box-shadow: 0 14px 38px -18px rgba(12, 21, 36, 0.28), 0 1px 2px rgba(12, 21, 36, 0.04);
}
.ntv__lado { display: flex; align-items: center; gap: 6px; min-width: 0; }
.ntv__lado--dir { justify-content: flex-end; }
.ntv__nav { display: flex; align-items: center; gap: 2px; }
.ntv__item {
  display: inline-flex; align-items: center; gap: 5px; height: 36px; padding: 0 13px;
  border: 0; border-radius: var(--nu-r-pill); background: transparent; cursor: pointer; font-family: inherit;
  color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap;
  transition: background .2s, color .2s;
}
.ntv__item:hover, .ntv__item--aberto { background: var(--nu-ink-04); color: var(--nu-ink); }
.ntv__item--ativo { color: var(--nu-ink); background: var(--nu-ink-04); }
.ntv__chev { opacity: .55; transition: transform .2s ease; }
.ntv__item--aberto .ntv__chev { transform: rotate(180deg); }
.ntv__icone {
  width: 38px; height: 38px; flex-shrink: 0; border: 0; border-radius: 50%; background: transparent; color: var(--nu-ink);
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.ntv__icone:hover { background: var(--nu-ink-04); }
.ntv__burger { display: none; }
.ntv__entrar {
  display: inline-flex; align-items: center; height: 38px; padding: 0 14px; border-radius: var(--nu-r-pill);
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; transition: background .2s;
}
.ntv__entrar:hover { background: var(--nu-ink-04); }
.ntv__cta {
  display: inline-flex; align-items: center; height: 38px; padding: 0 18px; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: 800; white-space: nowrap;
  transition: background .2s, transform .2s;
}
.ntv__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.ntv__cta:active, .ntv__item:active, .ntv__icone:active { transform: translateY(1px); }
.ntv__avatar {
  width: 36px; height: 36px; border: 0; border-radius: 50%; background: var(--nu-blue); color: var(--nu-white);
  font-family: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; margin-left: 4px;
}
.ntv__avatar:hover { background: var(--nu-blue-hover); }
.ntv__item:focus-visible, .ntv__icone:focus-visible, .ntv__entrar:focus-visible, .ntv__cta:focus-visible, .ntv__avatar:focus-visible {
  outline: 2px solid var(--nu-blue); outline-offset: 2px;
}

/* a nav inteira pede ~1000px; abaixo disso ela vai para o menu (o contêiner
   conta, não a janela: com o chat aberto a página encolhe ao lado dele) */
@container topo (max-width: 1000px) {
  .ntv__nav { display: none; }
  .ntv__pilula { grid-template-columns: auto 1fr; }
  .ntv__burger { display: flex; }
}
@container topo (max-width: 640px) {
  .ntv__entrar, .ntv__cta { display: none; }
}

/* ——— a linha quieta do mercado ——— */
.ntv-linha {
  height: 34px; display: flex; align-items: center; justify-content: center; gap: 18px;
  padding: 0 clamp(16px, 3vw, 40px); font-size: var(--nu-fs-dense);
  animation: nu-fade .5s ease both;
}
.ntv-linha__sk { display: flex; align-items: center; justify-content: center; gap: 22px; }
.ntv-linha__estado { flex-shrink: 0; }
.ntv-linha__cot { flex: 0 1 auto; --ntc-gap: 18px; justify-content: center; }
.ntv-linha__nota { flex-shrink: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; white-space: nowrap; }
@media (max-width: 1100px) { .ntv-linha__ref { display: none; } }
@media (max-width: 760px) {
  .ntv-linha { justify-content: flex-start; gap: 14px; }
  .ntv-linha__cot { justify-content: flex-start; flex: 1 1 0; --ntc-gap: 14px; }
  .ntv-linha__ref { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ntv__pilula { transition: background-color .2s, box-shadow .2s; }
}
</style>
