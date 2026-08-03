<script setup lang="ts">
/**
 * Header da Redentia for Business.
 *
 * MESMO CHROME do NuHeader (direção do dono: "header normal, só o nome muda"):
 * sticky top 0, quadrado azul rente à quina, encolhe 76→58 no scroll com os
 * DOIS limiares de histerese e publica --nuh-h no <html> pras âncoras da página
 * pararem abaixo dele. A área neutra do header é justamente o que o plano manda
 * herdar (PLANO-REDENTIA-FOR-BUSINESS §6.1).
 *
 * O que muda:
 *  1. LOCKUP DE MARCA — o Nu mostra só o quadrado; aqui o quadrado ganha o
 *     nome ao lado, porque "Redentia" e "Redentia For Business" são produtos
 *     diferentes e o quadrado sozinho não distingue os dois. E são DOIS links
 *     (direção do dono 2026-08-01): o quadrado azul volta pra Redentia normal
 *     (/), o nome ancora o topo do próprio business. Mesmo destino duplo do
 *     footer, onde a logo do rodapé também volta pro app.
 *  2. UM BOTÃO E SÓ (direção do dono 2026-07-30: "tá com muito botão no
 *     header, tire a maior parte"). Saíram o nav de âncora, o link de volta
 *     pro B2C e — por consequência — o hambúrguer e o menu full-screen
 *     inteiro: sem nav não há o que colapsar. A navegação da página é a
 *     rolagem; "Para investidores" vive no footer.
 *
 * ACESSO DA EMPRESA (2026-08-03): além do CTA comercial, o header leva a
 * porta de entrada da conta. Deslogado mostra "Entrar"; logado, "Minha conta",
 * que vai direto pro painel de chaves.
 *
 * A TROCA SÓ ACONTECE DEPOIS DO MOUNT, e isso não é detalhe: /business é
 * cacheada na borda por uma hora (`public, s-maxage=3600` no nuxt.config), e
 * o CDN não varia por cookie. Renderizar "Minha conta" no SSR faria o
 * primeiro visitante logado envenenar o cache pra todo prospect deslogado da
 * hora seguinte. O SSR sai idêntico pra todo mundo; o cliente ajusta depois.
 * É o mesmo gesto do CTA da /mcp.
 */
const { isAuthenticated } = useAuthState()
const montado = ref(false)
onMounted(() => { montado.value = true })
const logado = computed(() => montado.value && isAuthenticated.value)

/* ——— shrink on scroll ———
   Portado verbatim do NuHeader, histerese inclusa: limiar único oscilava na
   fronteira (encolher tira 18px, o conteúdo sobe, o scroll re-cruza o limiar
   → pumping). O vão de 56px é MAIOR que o delta de 18px, então nenhuma
   mudança de altura consegue cruzar os dois limiares ao mesmo tempo.
   Usa o motor de scroll único do app (rAF-throttled, passive, cleanup no
   unmount) — a regra da casa é 1 implementação por responsabilidade. */
const SHRINK_AT = 72
const GROW_AT = 16
const shrunk = ref(false)

useNuScrollFrame(() => {
  const y = window.scrollY
  if (!shrunk.value && y > SHRINK_AT) shrunk.value = true
  else if (shrunk.value && y < GROW_AT) shrunk.value = false
})

// As seções leem --nuh-h no scroll-margin-top pra âncora não parar embaixo do
// header. A var vive no <html> pra atravessar os escopos. Fallback SSR: 76px.
watch(shrunk, (s) => {
  document.documentElement.style.setProperty('--nuh-h', s ? '58px' : '76px')
})
</script>

<template>
  <div class="rbh-wrap" :class="{ 'rbh-wrap--shrunk': shrunk }">
    <div class="rbh">
      <div class="rbh__brand">
        <NuxtLink to="/" class="rbh__mark" aria-label="Voltar para a Redentia">
          <img src="/logo-branca.svg" alt="" class="rbh__logo">
        </NuxtLink>
        <NuxtLink to="/business" class="rbh__lockup" aria-label="Redentia For Business, início">
          <span class="rbh__name">Redentia</span>
          <span class="rbh__suffix">For Business</span>
        </NuxtLink>
      </div>

      <div class="rbh__acoes">
        <NuxtLink
          :to="logado ? '/business/chaves' : '/business/cadastro'"
          class="rbh__entrar"
        >{{ logado ? 'Minha conta' : 'Entrar' }}</NuxtLink>
        <a href="#contato" class="rbh__cta">Falar com a gente</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rbh-wrap { background: var(--nu-white); position: sticky; top: 0; z-index: 50; }
/* hairline no lugar da sombra: quem separa no B2B é fio, não elevação.
   Só aparece depois que a página rolou — no repouso o header é uma coisa só
   com a primeira banda. */
.rbh-wrap::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
  background: var(--nu-cream-line); opacity: 0; transition: opacity .28s ease;
}
.rbh-wrap--shrunk::after { opacity: 1; }

.rbh {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  height: 76px; padding-right: 20px; transition: height .28s ease;
}
.rbh-wrap--shrunk .rbh { height: 58px; }

/* ——— lockup: quadrado rente à quina + nome ——— */
/* flex-shrink:0 (e nada de min-width:0): com `nowrap` no nome, deixar a caixa
   encolher não encolhe o texto — ele transborda por cima do botão e a medição
   por getBoundingClientRect ainda diz que "coube". Melhor não caber e aparecer. */
.rbh__brand { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
.rbh__mark {
  width: 76px; height: 76px; flex-shrink: 0; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
  transition: width .28s ease, height .28s ease, background .2s;
  /* sem radius de propósito: o bloco é flush no canto da viewport */
}
/* o quadrado é link (volta pro app): o hover diz isso sem mudar o desenho */
.rbh__mark:hover { background: var(--nu-blue-hover); }
.rbh-wrap--shrunk .rbh__mark { width: 58px; height: 58px; }
.rbh__logo { width: 34px; height: 34px; display: block; object-fit: contain; transition: width .28s ease, height .28s ease; }
.rbh-wrap--shrunk .rbh__logo { width: 27px; height: 27px; }
.rbh__lockup { display: flex; align-items: baseline; gap: 7px; }
.rbh__name,
.rbh__suffix {
  font-size: 20px; font-weight: 800; letter-spacing: -0.03em; white-space: nowrap;
  transition: font-size .28s ease;
}
.rbh__name { color: var(--nu-ink); }
.rbh__suffix { color: var(--nu-blue); }
.rbh-wrap--shrunk .rbh__name,
.rbh-wrap--shrunk .rbh__suffix { font-size: 17.5px; }

/* ——— o único botão da página acima da dobra ——— */
.rbh__acoes { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
/* o acesso é link de texto, não segundo botão: a página já gasta o azul
   chapado no CTA comercial, e duas pílulas lado a lado brigam entre si */
.rbh__entrar {
  display: inline-flex; align-items: center; padding: 12px 14px;
  color: var(--nu-gray-2); font-size: 15px; font-weight: 700; white-space: nowrap;
  border-radius: var(--nu-r-pill); transition: color .2s, background .2s;
}
.rbh__entrar:hover { color: var(--nu-ink); background: var(--nu-cream); }
.rbh__entrar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.rbh__cta {
  display: inline-flex; align-items: center; flex-shrink: 0;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 12px 22px;
  font-size: 15.5px; font-weight: 700; white-space: nowrap;
  transition: background .2s, padding .28s ease, font-size .28s ease;
}
.rbh-wrap--shrunk .rbh__cta { padding: 9px 18px; font-size: 14.5px; }
.rbh__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }

/* foco visível: o app não tem regra global (dívida conhecida), então o
   componente novo já nasce com ela em vez de herdar o buraco */
.rbh__mark:focus-visible,
.rbh__lockup:focus-visible,
.rbh__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* Mobile: o lockup EMPILHA em duas linhas. Medido, não estimado — em uma linha
   a soma dá 434px numa tela de 375 e o botão cobre "For Business". Empilhado
   dá ~340px e ainda sobra folga. O quadrado tem 76px de altura, então duas
   linhas de 15px cabem dentro dele sem esticar o header. */
@media (max-width: 760px) {
  .rbh { gap: 10px; padding-right: 14px; }
  /* fica visível no estreito: escondê-lo deixava o celular SEM nenhum
     caminho pro painel. O que encolhe é o padding, não o link. */
  .rbh__entrar { padding: 12px 8px; font-size: 14px; }
  .rbh__brand { gap: 11px; }
  .rbh__lockup { flex-direction: column; align-items: flex-start; gap: 0; line-height: 1.12; }
  .rbh__name, .rbh__suffix { font-size: 15px; }
  .rbh-wrap--shrunk .rbh__name, .rbh-wrap--shrunk .rbh__suffix { font-size: 13.5px; }
  .rbh__cta { padding: 10px 16px; font-size: 14px; }
  .rbh-wrap--shrunk .rbh__cta { padding: 8px 14px; font-size: 13.5px; }
}
</style>
