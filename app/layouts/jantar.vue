<script setup lang="ts">
/**
 * Landing do Wealth Intelligence Dinner.
 *
 * Nav e rodapé são os do site (NuHeader / NuFooter, com a política de
 * privacidade). A faixa "Mercado agora" fica de fora: cotação é linguagem
 * do app, e esta página abre com a faixa da mesa. O convite da newsletter
 * também fica de fora. O rodapé padrão permanece.
 *
 * O header ganha tratamento navy só aqui, via a classe no body. O componente
 * global continua branco nas outras rotas.
 */
</script>

<template>
  <div class="jt-shell">
    <NuHeader />
    <ConsentBanner />
    <main>
      <slot />
    </main>
    <NuFooter />
  </div>
</template>

<style scoped>
/* overflow-x: clip (não hidden) — hidden vira scroll container e mata o
   sticky do header. Mesma lição do layout default. */
.jt-shell {
  min-height: 100vh;
  background: #0c1524;
  overflow-x: clip;
  display: flex;
  flex-direction: column;
}
main { flex: 1; }
</style>

<style>
/* Só vale com a classe que a página /jantar põe no body. O menu mobile é
   teleportado para o body, por isso o seletor não pode ficar no shell. */
body.pagina-jantar { background: #0c1524; }
body.pagina-jantar .nuh-wrap {
  background: #0c1524;
  border-bottom: 1px solid rgba(245, 241, 234, 0.1);
}
body.pagina-jantar .nuh__brand,
body.pagina-jantar .num__brand { background: transparent; }
body.pagina-jantar .nuh__navitem {
  color: #f5f1ea;
}
body.pagina-jantar .nuh__navitem:hover,
body.pagina-jantar .nuh__navitem:focus-visible,
body.pagina-jantar .nuh__navitem--open {
  color: #f5f1ea;
  background: rgba(245, 241, 234, 0.08);
}
body.pagina-jantar .nuh__navitem--active,
body.pagina-jantar .nuh__navitem--active:hover {
  color: #f5f1ea;
  background: rgba(47, 106, 255, 0.28);
}
body.pagina-jantar .nuh__search:hover,
body.pagina-jantar .nuh__burger:hover,
body.pagina-jantar .num__icon:hover { background: rgba(245, 241, 234, 0.08); }
body.pagina-jantar .nuh__search svg,
body.pagina-jantar .nuh__burger svg,
body.pagina-jantar .num__icon svg { stroke: #f5f1ea; }
body.pagina-jantar .nuh__enter {
  color: #f5f1ea;
  border-color: rgba(245, 241, 234, 0.7);
  background: transparent;
}
body.pagina-jantar .nuh__enter:hover,
body.pagina-jantar .nuh__enter:focus-visible {
  color: #f5f1ea;
  background: rgba(245, 241, 234, 0.08);
}
body.pagina-jantar .nuh__navitem:focus-visible,
body.pagina-jantar .nuh__search:focus-visible,
body.pagina-jantar .nuh__burger:focus-visible,
body.pagina-jantar .nuh__cta:focus-visible {
  outline: 2px solid #f5f1ea;
  outline-offset: 3px;
}
body.pagina-jantar .num {
  background: #0c1524;
  color: #f5f1ea;
}
body.pagina-jantar .num__item { color: #f5f1ea; }
body.pagina-jantar .num__item:hover,
body.pagina-jantar .num__item:focus-visible { color: #fff; }
body.pagina-jantar .num__subitem { color: rgba(245, 241, 234, 0.78); }
body.pagina-jantar .num__subitem:hover,
body.pagina-jantar .num__subitem:focus-visible { color: #fff; }
body.pagina-jantar .num__item--active,
body.pagina-jantar .num__subitem--active { color: #9ec8ff; }
body.pagina-jantar .num__item svg,
body.pagina-jantar .num__group-chev { stroke: #f5f1ea; }
body.pagina-jantar .num__item--active svg,
body.pagina-jantar .num__subitem--active svg { stroke: #9ec8ff; }
body.pagina-jantar .num__ctas { border-top-color: rgba(245, 241, 234, 0.16); }
body.pagina-jantar .num__cta-outline {
  color: #f5f1ea;
  border-color: rgba(245, 241, 234, 0.7);
}
body.pagina-jantar .num__cta-outline:hover,
body.pagina-jantar .num__cta-outline:focus-visible { color: #f5f1ea; }
</style>
