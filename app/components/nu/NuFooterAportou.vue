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
// escritório, que agora diz o nome dele: Redentia.
defineProps<{
  colunas: { title: string; links: { label: string; to: string }[] }[]
  assinatura: boolean
}>()
const { reabrir } = useConsent()
const ano = new Date().getFullYear()
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
        <!-- a porta do produto de escritório: é outra marca, não outra página -->
        <NuxtLink to="/business" class="nfa__b2b">Para escritórios: {{ MARCA.b2b }}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="M13.5 6.5 19 12l-5.5 5.5" /></svg></NuxtLink>
      </div>

      <svg class="nfa__gigante" viewBox="-2 -40 681 142" role="img" aria-label="aportou">
        <g fill="none" stroke="currentColor" stroke-width="25"><circle cx="50" cy="50" r="37.5" /><circle cx="173" cy="50" r="37.5" /><circle cx="280.5" cy="50" r="37.5" /><circle cx="520.5" cy="50" r="37.5" /><path d="M593.5 2 V54 A35.25 35.25 0 0 0 664 54" /></g>
        <g fill="currentColor"><rect x="83" y="2" width="25" height="98" /><path d="M121 2 H146 V124 A12 12 0 0 1 134 136 H121 Z" /><path d="M340 100 V26 A26 26 0 0 1 366 0 H399 V23 H372 Q365 23 365 31 V100 Z" /><path d="M408 -25 Q408 -38 421 -38 H433 V62 Q433 77 448 77 H463 V101 H440 Q408 101 408 69 Z" /><rect x="651.5" y="2" width="25" height="98" /></g>
        <path class="nfa__gigante-corte" d="M408 44 V0 H444 C456 0 466 -2 472 -8 C474 8 466 23 448 23 H433 C419 23 410 31 408 44 Z" />
      </svg>
    </div>
    <!-- O aviso de cookies senta aqui quando o rodapé está na tela. -->
    <div id="ancora-cookies" />
  </footer>
</template>

<style scoped>
.nfa { container: rodape / inline-size; background: var(--nu-ink); color: var(--nu-on-dark); overflow: hidden; }
.nfa__in { max-width: 1304px; margin: 0 auto; padding: 64px 32px 0; display: flex; flex-direction: column; gap: 44px; }

.nfa__news {
  display: flex; flex-wrap: wrap; align-items: center; gap: 24px 56px;
  padding: clamp(24px, 3vw, 40px); border-radius: var(--nu-r-card); background: var(--nu-dark-chip);
}
.nfa__news-texto { flex: 1.3 1 360px; min-width: min(280px, 100%); display: flex; flex-direction: column; gap: 12px; }
.nfa__news-titulo { margin: 0; color: var(--nu-creme); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.025em; line-height: 1.05; }
.nfa__news-sub { margin: 0; max-width: 52ch; font-size: 17px; line-height: 1.45; }
.nfa__news-form { flex: 1 1 340px; min-width: min(280px, 100%); }

.nfa__mapa { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 36px 64px; }
.nfa__marca { flex: 1 1 320px; max-width: 480px; display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.nfa__frase { margin: 0; color: var(--nu-creme); font-size: clamp(34px, 4.4vw, 56px); font-weight: var(--nu-w-display); line-height: 1; letter-spacing: -0.03em; text-wrap: balance; }
.nfa__legal { margin: 0; font-size: 13.5px; line-height: 1.5; }
.nfa__contato { display: flex; flex-direction: column; gap: 2px; margin-top: 8px; }
.nfa__mail { min-height: 44px; display: inline-flex; align-items: center; color: var(--nu-creme); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); transition: color .2s; }
.nfa__mail:hover { color: var(--nu-white); }
.nfa__horas { font-size: 13.5px; color: var(--nu-on-dark-2); }
.nfa__redes { display: flex; gap: 6px; margin-left: -11px; }
.nfa__rede { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--nu-creme); transition: background .2s, transform .2s; }
.nfa__rede:hover { background: var(--nu-dark-chip); color: var(--nu-white); transform: translateY(-2px); }

.nfa__grid { flex: 1.6 1 520px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 28px 40px; align-content: start; }
.nfa__col { display: flex; flex-direction: column; gap: 0; align-items: flex-start; }
.nfa__col-titulo { padding-bottom: 6px; color: var(--nu-creme); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: 0.16em; text-transform: uppercase; }
.nfa__link {
  min-height: 40px; display: inline-flex; align-items: center; color: var(--nu-on-dark);
  font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.25; transition: color .2s, transform .2s;
}
.nfa__link:hover { color: var(--nu-white); transform: translateX(3px); }
.nfa__link--btn { padding: 0; border: 0; background: none; font-family: inherit; text-align: left; cursor: pointer; }

.nfa__pe { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px 24px; }
.nfa__copy { font-size: 13.5px; line-height: 1.5; }
.nfa__b2b {
  display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 18px;
  border-radius: var(--nu-r-pill); border: 1px solid var(--nu-dark-chip-line); background: var(--nu-dark-chip);
  color: var(--nu-white); font-size: 14.5px; font-weight: 600; white-space: nowrap; transition: background .2s, border-color .2s;
}
.nfa__b2b:hover { background: var(--nu-dark-line); border-color: var(--nu-on-dark-2); color: var(--nu-white); }
.nfa__b2b svg { transition: transform .2s; }
.nfa__b2b:hover svg { transform: translateX(3px); }

.nfa__gigante { display: block; width: 100%; color: var(--nu-dark-line); }
.nfa__gigante-corte { fill: var(--nu-blue); }
:is(.nfa__mail, .nfa__rede, .nfa__link, .nfa__b2b):focus-visible { outline: 3px solid var(--nu-blue-on-dark); outline-offset: 2px; }

@container rodape (max-width: 640px) {
  .nfa__in { padding: 48px 20px 0; gap: 36px; }
  .nfa__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 20px; }
}
@media (prefers-reduced-motion: reduce) { .nfa__link, .nfa__rede, .nfa__b2b svg { transition: none; } }
</style>
