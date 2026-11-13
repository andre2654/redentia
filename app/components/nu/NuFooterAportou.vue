<script setup lang="ts">
// O rodapé da Aportou (quadro Home, 11/11/2026): carvão, a frase da marca em
// creme, o aviso legal curto, as colunas com título em caixa alta espaçada e,
// no pé, o wordmark gigante em carvão claro com o corte cobalto aceso.
//
// As colunas vêm do NuFooter (COLUMNS): são o maior distribuidor de link
// interno do site, e a alocação delas é decisão de SEO de 03/08 e 23/09/2026.
// Não troque destino nem âncora aqui por gosto de layout.
//
// Fica do rodapé antigo: a assinatura de "O mercado da semana" (quando ligada
// e fora das páginas que já têm o formulário), as redes, o e-mail, o
// "Acompanhe o André", as preferências de cookies e a porta para o produto de
// escritório, que agora diz o nome dele: Redentia. Desde 12/11/2026 ele mora
// no site dele (redentia.com.br), e a porta é um link externo comum, na mesma
// aba.
//
// ROBUSTEZ (11/11/2026): na coluna do site (--nu-coluna); as cinco colunas
// numa linha só no computador, com o título em caixa alta pequena e cinza (a
// Legora, a Rogo) e o link em 15px/500; sob o ponteiro o link clareia e o
// sublinhado aparece, sem empurrar nada. O wordmark gigante entra ao chegar
// (v-revelar). Tudo em token.
//
// O FECHO DA MARCA (13/11/2026; o dono: "deixe o footer mais bacana, talvez
// com uns carrosséis de ativos com a bandeirinha da aportou e a logo maior
// ocupando toda a largura"). Depois do mapa e da linha do CNPJ, o rodapé fecha
// de beira a beira da tela, fora da coluna:
//  - o wordmark gigante na largura inteira da tela (era na coluna, 1.240px),
//    em degradê que some no carvão. Onde o navegador liga animação à rolagem,
//    a bandeira do "t" sobe pelo mastro enquanto a pessoa chega ao fim da
//    página: "aportou";
//  - uma fila de ativos em cima dele e outra embaixo ("agora coloque 1 linha
//    em cima outra em baixo da logo da aportou"), cada ativo dentro da
//    bandeira da marca (NuRodapeEsteira). A perna do "p" passa por trás da
//    fila de baixo.
defineProps<{
  colunas: { title: string; links: { label: string; to: string }[] }[]
  assinatura: boolean
}>()
const { reabrir } = useConsent()
const ano = new Date().getFullYear()
/** o degradê do wordmark precisa de um id que não se repita na página */
const idDoDegrade = useId()
</script>

<template>
  <footer class="nfa">
    <div class="nfa__in">
      <section v-if="assinatura" id="newsletter" class="nfa__news" aria-labelledby="nfa-news-titulo">
        <div class="nfa__news-texto">
          <NuEyebrow sobre="escuro">Toda sexta</NuEyebrow>
          <h2 id="nfa-news-titulo" class="nfa__news-titulo">O mercado da semana, num e-mail só.</h2>
          <p class="nfa__news-sub">O Ibovespa da semana, as notícias que mexeram nele e os proventos da semana que vem.</p>
        </div>
        <NuNewsletterForm class="nfa__news-form" origem="rodape" />
      </section>

      <div class="nfa__mapa">
        <div class="nfa__marca">
          <p class="nfa__frase">{{ MARCA.frase }}</p>
          <p class="nfa__legal">{{ MARCA.assinatura }}. A Aportou não é corretora nem consultoria de valores mobiliários. O conteúdo é educativo e não é recomendação de compra ou venda. Simulações não garantem resultado.</p>
          <div class="nfa__contato">
            <a href="mailto:relacionamento@redentia.com.br" class="nfa__mail">relacionamento@redentia.com.br</a>
            <span class="nfa__horas">Dias úteis, das 8h às 18h (Brasília)</span>
          </div>
          <div class="nfa__redes" aria-label="Redes sociais">
            <a href="https://www.instagram.com/redentia.app/" target="_blank" rel="noopener noreferrer" class="nfa__rede" aria-label="Instagram"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg></a>
            <a href="https://www.linkedin.com/company/redentia" target="_blank" rel="noopener noreferrer" class="nfa__rede" aria-label="LinkedIn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 10v7M7 6.5v.01M11 17v-4a2 2 0 0 1 4 0v4" /></svg></a>
          </div>
          <NuAcompanheAndre lugar="rodape" tom="escuro" />
        </div>

        <nav class="nfa__grid" aria-label="Mapa do site">
          <div v-for="col in colunas" :key="col.title" class="nfa__col">
            <strong class="nfa__col-titulo">{{ col.title }}</strong>
            <NuxtLink v-for="l in col.links" :key="l.label" :to="l.to" class="nfa__link">{{ l.label }}</NuxtLink>
            <button v-if="col.title === 'Legal'" type="button" class="nfa__link nfa__link--btn" @click="reabrir">Preferências de cookies</button>
          </div>
        </nav>
      </div>

      <div class="nfa__pe">
        <span class="nfa__copy">© {{ ano }} {{ MARCA.nome }} · {{ MARCA.assinatura }} · {{ EMPRESA.razaoSocial }} · CNPJ {{ EMPRESA.cnpj }}</span>
        <!-- a porta do produto de escritório: é outra marca, em outro site -->
        <a href="https://redentia.com.br" class="nfa__b2b">Para escritórios: {{ MARCA.b2b }}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="M13.5 6.5 19 12l-5.5 5.5" /></svg></a>
      </div>

    </div>

    <!-- o fecho da marca, de beira a beira: uma fila de ativos, o wordmark na largura da tela e a outra fila -->
    <NuRodapeEsteira class="nfa__esteira">
      <svg v-revelar="{ y: 24 }" class="nfa__gigante" viewBox="-2 -40 681 142" role="img" aria-label="aportou">
        <defs>
          <linearGradient :id="idDoDegrade" gradientUnits="userSpaceOnUse" x1="0" y1="-40" x2="0" y2="138">
            <stop offset="0" class="nfa__gigante-alto" /><stop offset="0.62" class="nfa__gigante-meio" /><stop offset="1" class="nfa__gigante-pe" />
          </linearGradient>
        </defs>
        <g fill="none" :stroke="`url(#${idDoDegrade})`" stroke-width="25"><circle cx="50" cy="50" r="37.5" /><circle cx="173" cy="50" r="37.5" /><circle cx="280.5" cy="50" r="37.5" /><circle cx="520.5" cy="50" r="37.5" /><path d="M593.5 2 V54 A35.25 35.25 0 0 0 664 54" /></g>
        <g :fill="`url(#${idDoDegrade})`"><rect x="83" y="2" width="25" height="98" /><path d="M121 2 H146 V124 A12 12 0 0 1 134 136 H121 Z" /><path d="M340 100 V26 A26 26 0 0 1 366 0 H399 V23 H372 Q365 23 365 31 V100 Z" /><path d="M408 -25 Q408 -38 421 -38 H433 V62 Q433 77 448 77 H463 V101 H440 Q408 101 408 69 Z" /><rect x="651.5" y="2" width="25" height="98" /></g>
        <path class="nfa__gigante-corte" d="M408 44 V0 H444 C456 0 466 -2 472 -8 C474 8 466 23 448 23 H433 C419 23 410 31 408 44 Z" />
      </svg>
    </NuRodapeEsteira>
    <!-- O aviso de cookies senta aqui quando o rodapé está na tela. -->
    <div id="ancora-cookies" />
  </footer>
</template>

<style scoped>
/* o recorte é `clip`, não `hidden`: com `hidden` o rodapé vira a caixa de rolagem do que está dentro dele, e a bandeira
   do wordmark (que sobe com a rolagem da PÁGINA) ficaria parada. Quem não conhece `clip` fica com `hidden` */
.nfa { container: rodape / inline-size; background: var(--nu-ink); color: var(--nu-on-dark); overflow: hidden; overflow: clip; }
.nfa__in { padding: clamp(64px, 7vw, 96px) var(--nu-coluna) 0; display: flex; flex-direction: column; gap: clamp(40px, 4.4vw, 56px); }

.nfa__news {
  display: flex; flex-wrap: wrap; align-items: center; gap: 24px 56px;
  padding: clamp(24px, 3vw, 40px); border-radius: var(--nu-r-card); background: var(--nu-dark-chip);
  box-shadow: inset 0 0 0 1px var(--nu-dark-line);
}
.nfa__news-texto { flex: 1.3 1 360px; min-width: min(280px, 100%); display: flex; flex-direction: column; gap: 12px; }
.nfa__news-titulo { margin: 0; color: var(--nu-creme); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-titulo); line-height: 1.05; }
.nfa__news-sub { margin: 0; max-width: 52ch; font-size: 17px; line-height: 1.45; }
.nfa__news-form { flex: 1 1 340px; min-width: min(280px, 100%); }

/* a marca de um lado, as cinco colunas do outro (numa linha só no computador) */
.nfa__mapa { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 40px 48px; }
.nfa__marca { flex: 1 1 300px; max-width: 380px; display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.nfa__frase { margin: 0; color: var(--nu-creme); font-size: clamp(34px, 4.4vw, 56px); font-weight: var(--nu-w-display); line-height: 1; letter-spacing: var(--nu-ls-display); text-wrap: balance; }
.nfa__legal { margin: 0; font-size: 13.5px; line-height: 1.55; }
.nfa__contato { display: flex; flex-direction: column; gap: 2px; margin-top: 8px; }
.nfa__mail {
  min-height: 44px; display: inline-flex; align-items: center; color: var(--nu-creme); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio);
  text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; text-decoration-color: transparent;
  transition: color var(--nu-dur-media) var(--nu-ease-cor), text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.nfa__mail:hover { color: var(--nu-white); text-decoration-color: currentColor; }
.nfa__horas { font-size: 13.5px; color: var(--nu-on-dark-2); }
.nfa__redes { display: flex; gap: 6px; margin-left: -11px; }
.nfa__rede {
  width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--nu-creme);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida);
}
.nfa__rede:hover { background: var(--nu-dark-chip); color: var(--nu-white); transform: translateY(-2px); }
.nfa__rede:active { transform: scale(.94); transition-duration: var(--nu-dur-rapida); }

.nfa__grid { flex: 2 1 560px; display: grid; grid-template-columns: repeat(auto-fit, minmax(128px, 1fr)); gap: 32px 28px; align-content: start; }
.nfa__col { display: flex; flex-direction: column; gap: 0; align-items: flex-start; }
/* o título da coluna: caixa alta pequena e cinza (quem lê o link é o link) */
.nfa__col-titulo {
  padding-bottom: 10px; color: var(--nu-on-dark-2);
  font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase;
}
.nfa__link {
  min-height: 36px; padding-block: 6px; display: inline-flex; align-items: center; color: var(--nu-on-dark);
  font-size: 15px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.3;
  text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; text-decoration-color: transparent;
  transition: color var(--nu-dur-media) var(--nu-ease-cor), text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.nfa__link:hover { color: var(--nu-white); text-decoration-color: color-mix(in srgb, var(--nu-white) 45%, transparent); }
.nfa__link:active { opacity: .72; }
.nfa__link--btn { padding: 0; border: 0; background: none; font-family: inherit; text-align: left; cursor: pointer; }
/* no dedo, o alvo de 44px */
@media (pointer: coarse) { .nfa__link { min-height: 44px; } }

.nfa__pe {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px 24px;
  padding-top: 24px; border-top: 1px solid var(--nu-dark-line);
}
.nfa__copy { color: var(--nu-on-dark-2); font-size: var(--nu-fs-dense); line-height: 1.5; }
.nfa__b2b {
  display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 18px;
  border-radius: var(--nu-r-pill); border: 1px solid var(--nu-dark-chip-line); background: var(--nu-dark-chip);
  color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); white-space: nowrap;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), border-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.nfa__b2b:hover { background: var(--nu-dark-line); border-color: var(--nu-on-dark-2); color: var(--nu-white); }
.nfa__b2b:active { transform: scale(.98); }
.nfa__b2b svg { transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.nfa__b2b:hover svg { transform: translateX(3px); }

/* o fecho da marca: fora da coluna, de beira a beira. Uma fila de ativos, o wordmark e a outra fila */
.nfa__esteira { margin-top: clamp(40px, 4.4vw, 56px); }
/* o wordmark na largura da tela. A caixa vai até a linha de base; a perna do "p" desce além dela (overflow) e passa
   por trás da fila de baixo. Em cima, o "t" e a bandeira dele já ocupam o respiro: a fila de cima fica mais perto */
.nfa__gigante {
  display: block; width: 100%; overflow: visible; margin-top: clamp(10px, 1.4vw, 20px); margin-bottom: clamp(22px, 2.6vw, 36px);
  view-timeline: --nfa-marca block;
}
/* as letras em degradê: mais claras no alto, sumindo no carvão embaixo (a palavra nasce do chão da página) */
.nfa__gigante-alto { stop-color: var(--nu-dark-chip-line); }
.nfa__gigante-meio { stop-color: var(--nu-dark-line); }
.nfa__gigante-pe { stop-color: var(--nu-dark-chip); }
.nfa__gigante-corte { fill: var(--nu-blue); }
/* a bandeira sobe pelo mastro do "t" enquanto o wordmark entra na tela: quem chega ao fim da página, aportou. Só onde
   o navegador liga animação à rolagem (sem isso, e com movimento reduzido, ela já está no lugar) */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .nfa__gigante-corte { animation: nfa-hasteia linear both; animation-timeline: --nfa-marca; animation-range: entry 10% entry 100%; }
    @keyframes nfa-hasteia { from { transform: translateY(56px); } to { transform: none; } }
  }
}
:is(.nfa__mail, .nfa__rede, .nfa__link, .nfa__b2b):focus-visible { outline: 3px solid var(--nu-blue-on-dark); outline-offset: 2px; }

@container rodape (max-width: 640px) {
  .nfa__in { padding-top: 48px; gap: 36px; }
  .nfa__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 20px; }
}
@media (prefers-reduced-motion: reduce) { .nfa__link, .nfa__mail, .nfa__rede, .nfa__b2b, .nfa__b2b svg { transition: none; } }
</style>
