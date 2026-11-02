<script setup lang="ts">
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
</script>

<template>
  <div class="nuh-wrap" :class="{ 'nuh-wrap--shrunk': topo.shrunk.value }">
    <div class="nuh">
      <NuTopoMarca class="nuh__marca" />

      <nav class="nuh__nav" aria-label="Principal">
        <template v-for="item in topo.nav.value" :key="item.label">
          <NuxtLink
            v-if="item.to" :to="item.to" class="nuh__item"
            :class="{ 'nuh__item--ativo': topo.ativo(item.to), 'nuh__item--aberto': topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label }"
            :aria-current="topo.ativo(item.to) ? 'page' : undefined"
            @mouseenter="item.panel ? topo.navEntra(item, $event) : undefined"
            @mouseleave="item.panel ? topo.navSai() : undefined"
          >{{ item.label }}</NuxtLink>
          <button
            v-else type="button" class="nuh__item nuh__item--grupo"
            :class="{ 'nuh__item--ativo': topo.paiAtivo(item), 'nuh__item--aberto': topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label }"
            :aria-expanded="topo.painel.value?.tipo === 'nav' && topo.painel.value.item === item.label" aria-haspopup="menu"
            @mouseenter="topo.navEntra(item, $event)" @mouseleave="topo.navSai()" @click="topo.navClique(item, $event)"
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
          <NuxtLink to="/assinar?quiz=1&de=topo" class="nuh__cta">Conectar carteira</NuxtLink>
        </template>
        <button type="button" class="nuh__burger" aria-label="Abrir menu" :aria-expanded="topo.menuAberto.value" @click="topo.abrirMenu(true)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M4 9h16M4 15h16" /></svg>
        </button>
      </div>
    </div>
  </div>

  <NuTopoMega
    v-if="topo.itemAberto.value"
    :filhos="topo.filhosDe(topo.itemAberto.value)" :left="topo.pos.value.left" :top="topo.pos.value.top" :quente="topo.filhoQuente.value"
    @quente="topo.filhoQuente.value = $event" @entra="topo.painelEntra()" @sai="topo.navSai()" @fechar="topo.fecharPainel()" @tecla="topo.teclaNoPainel($event)"
  />
  <NuTopoConta
    v-if="topo.painel.value?.tipo === 'conta'" :right="topo.pos.value.right" :top="topo.pos.value.top"
    @fechar="topo.fecharPainel()" @sair="topo.sair()" @tecla="topo.teclaNoPainel($event)"
  />
  <NuTopoMenu :aberto="topo.menuAberto.value" :nav="topo.nav.value" :logado="topo.isAuthenticated.value" @fechar="topo.abrirMenu(false)" @sair="topo.sair()">
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
  --mov: .32s cubic-bezier(.2, .8, .2, 1);
  display: flex; align-items: center; height: 72px; padding: 0 clamp(16px, 3vw, 40px);
  transition: height var(--mov);
}
.nuh-wrap--shrunk .nuh { height: 60px; }
.nuh__marca { margin-right: clamp(20px, 2.6vw, 40px); }
.nuh__nav { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; height: 100%; }
.nuh__item {
  position: relative; display: inline-flex; align-items: center; gap: 5px; height: 100%; padding: 0 10px;
  border: 0; background: transparent; cursor: pointer; font-family: inherit;
  color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 700; letter-spacing: -0.01em; white-space: nowrap;
  transition: color .2s;
}
.nuh__item::after {
  content: ''; position: absolute; left: 10px; right: 10px; bottom: -1px; height: 2px; border-radius: 2px;
  background: var(--nu-blue); transform: scaleX(0); transition: transform .3s cubic-bezier(.2, .8, .2, 1);
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
  font-size: var(--nu-fs-sm); font-weight: 500; white-space: nowrap; transition: background .2s;
}
.nuh__busca:hover { background: var(--nu-cream-4); color: var(--nu-gray-2); }
.nuh__busca svg { flex-shrink: 0; color: var(--nu-gray-2); }
.nuh__entrar {
  display: inline-flex; align-items: center; height: 40px; padding: 0 12px 0 14px;
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; border-radius: var(--nu-r-pill);
}
.nuh__entrar:hover { color: var(--nu-blue-text); }
.nuh__cta {
  display: inline-flex; align-items: center; height: 40px; padding: 0 20px; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: 800; white-space: nowrap; transition: background .2s;
}
.nuh__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.nuh__cta:active, .nuh__busca:active, .nuh__burger:active, .nuh__avatar:active { transform: translateY(1px); }
.nuh__avatar {
  width: 38px; height: 38px; margin-left: 4px; padding: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-family: inherit;
}
.nuh__avatar span {
  width: 38px; height: 38px; border-radius: 50%; background: var(--nu-blue); color: var(--nu-white);
  display: flex; align-items: center; justify-content: center; font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s;
}
.nuh__avatar:hover span { background: var(--nu-blue-hover); }
.nuh__burger {
  display: none; width: 44px; height: 44px; border: 0; border-radius: 50%; background: transparent; color: var(--nu-ink);
  align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.nuh__burger:hover { background: var(--nu-cream); }
.nuh__busca:focus-visible, .nuh__entrar:focus-visible, .nuh__cta:focus-visible, .nuh__avatar:focus-visible, .nuh__burger:focus-visible {
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
  .nuh__marca :deep(.ntm__marca) { width: 22px; height: 22px; }
  .nuh__marca :deep(.ntm__nome) { font-size: var(--nu-fs-md); }
  .nuh__marca { gap: 8px; margin-right: 0; padding: 10px 6px 10px 2px; }
  .nuh__dir { gap: 0; }
  .nuh__entrar, .nuh__cta { display: none; }
  .nuh__busca { width: 44px; height: 44px; }
  .nuh__busca svg { width: 20px; height: 20px; }
  .nuh__avatar { width: 44px; height: 44px; margin-left: 0; }
  .nuh__avatar span { width: 30px; height: 30px; font-size: var(--nu-fs-xs); }
}
@media (prefers-reduced-motion: reduce) {
  .nuh, .nuh__item::after { transition: none; }
}
</style>
