<script setup lang="ts">
// Footer Nu — navy: 2 cards de produto, a marca com redes e contato ao lado das
// colunas de links, e embaixo a cordilheira do Ibovespa (NuFooterCordilheira),
// com a frase grande no céu e o copyright na base da serra.
// Redesenho do dono em 20/10/2026 ("deixar meu footer mais foda", com rodapés
// ilustrados de referência). Antes: designs/Redentia Mercado Nu.dc.html (linhas 521-589).
// Desde 21/10/2026, entre os cards e o mapa, a assinatura de O mercado da
// semana, para "onde eu assino?" ter resposta em qualquer página. Fica fora
// das páginas que já têm o formulário delas: o /guias, que fecha com a faixa
// azul logo acima do rodapé, e a preço teto, que tem o bloco no resultado e o
// veto do dono (o rodapé dela segue como estava).
import { rodapeSemAssinatura } from '~/utils/newsletter-lugares'

const route = useRoute()
const { reabrir } = useConsent()
const newsletterLigada = useRuntimeConfig().public.newsletterLigada === true
const assinaturaNoRodape = computed(() => newsletterLigada && !rodapeSemAssinatura(route.path))
const CARDS = [
  { title: 'Redentia AI', desc: 'Seu assistente de investimentos, disponível 24h para qualquer pergunta.', to: '/busca' },
  { title: 'Redentia Calculadoras', desc: 'Preço teto, juros compostos e renda passiva: resultados em segundos.', to: '/calculadoras' },
]
// REDISTRIBUIÇÃO DE LINK INTERNO (03/08/2026). O footer é sitewide, então é o
// maior distribuidor de equity do site, e estava mal alocado:
//  - "Ações" apontava pro hardcoded /asset/PETR4, URL que nem aparece no
//    top-1000 do Search Console, enquanto /rankings (hub real) não tinha link.
//  - /calculadora/preco-teto e /calculadora/acoes fazem 73% dos cliques do site
//    (3.641 de 4.992 no trimestre) e não recebiam UM link direto: o footer
//    parava no hub /calculadoras, que sozinho faz 225 impressões.
//  - /busca recebia 6 links no site (4 no header, 2 aqui) e não é indexável.
//  - /setor, /glossario e /tesouro só eram descobertos pelo sitemap.
// ÂNCORAS DAS CALCULADORAS (23/09/2026): cada link diz o termo da página que
// recebe. "Dividendos" apontava pra dividend-yield, a página errada pro termo:
// a dona de "calculadora/simulador de dividendos" é a /calculadora/acoes
// (bloco DONO DO CLUSTER em pages/calculadora/acoes.vue).
const COLUMNS = [
  // fusão home+carteira (2026-07-13): /mercado e /carteira viraram '/' — o
  // link único "Mercado" cobre os dois (logado, '/' É a carteira).
  { title: 'Produto', links: [{ label: 'Mercado', to: '/' }, { label: 'Rankings', to: '/rankings' }, { label: 'Teses', to: '/teses' }, { label: 'Redentia MCP', to: '/mcp' }] },
  // Direto pras calculadoras, não só pro hub: são as URLs que sustentam o site.
  { title: 'Calculadoras', links: [{ label: 'Preço teto', to: '/calculadora/preco-teto' }, { label: 'Simulador de ações e dividendos', to: '/calculadora/acoes' }, { label: 'Dividend yield', to: '/calculadora/dividend-yield' }, { label: 'Juros compostos', to: '/calculadora/juros-compostos' }, { label: 'Imposto de renda', to: '/calculadora/imposto-renda' }] },
  { title: 'Recursos', links: [{ label: 'Notícias', to: '/noticias' }, { label: 'Guias', to: '/guias' }, { label: 'Glossário', to: '/glossario' }, { label: 'Setores da B3', to: '/setor' }, { label: 'Tesouro Direto', to: '/tesouro' }] },
  { title: 'Empresa', links: [{ label: 'Sobre', to: '/institucional/about' }, { label: 'Como funciona', to: '/institucional/how-works' }, { label: 'Metodologia', to: '/metodologia' }, { label: 'Contato', to: '/institucional/contact' }] },
  { title: 'Legal', links: [{ label: 'Privacidade', to: '/institucional/privacy' }, { label: 'Cookies', to: '/institucional/cookies' }, { label: 'Termos de Uso', to: '/institucional/terms' }] },
]
</script>

<template>
  <footer class="nuf">
    <div class="nuf__in">
      <div class="nuf__top">
        <h2 class="nuf__title">Conheça outras maneiras de usar a Redentia</h2>
        <div class="nuf__cards">
          <NuxtLink v-for="c in CARDS" :key="c.title" :to="c.to" class="nuf__card">
            <span class="nuf__card-title">{{ c.title }}</span>
            <span class="nuf__card-desc">{{ c.desc }}</span>
            <span class="nuf__card-arrow">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </span>
          </NuxtLink>
        </div>
      </div>

      <section v-if="assinaturaNoRodape" class="nuf__news" aria-labelledby="nuf-news-titulo">
        <div class="nuf__news-texto">
          <h2 id="nuf-news-titulo" class="nuf__news-titulo">O mercado da semana, toda sexta.</h2>
          <p class="nuf__news-sub">O Ibovespa da semana, as notícias que mexeram nele e os proventos da semana que vem, num e-mail só.</p>
        </div>
        <NuNewsletterForm class="nuf__news-form" origem="rodape" />
      </section>

      <div class="nuf__mapa">
        <div class="nuf__marca">
          <div class="nuf__marca-nome"><img src="/logo-branca.svg" alt="" class="nuf__marca-logo">Redentia</div>
          <p class="nuf__marca-frase">Mercado em tempo real, teses e calculadoras para quem investe no Brasil. Grátis, sem conta.</p>
          <div class="nuf__social-row" aria-label="Redes sociais">
            <a href="https://www.linkedin.com/company/redentia" target="_blank" rel="noopener noreferrer" class="nuf__soc" aria-label="LinkedIn"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 10v7M7 6.5v.01M11 17v-4a2 2 0 0 1 4 0v4" /></svg></a>
            <a href="https://www.instagram.com/redentia.app/" target="_blank" rel="noopener noreferrer" class="nuf__soc" aria-label="Instagram"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg></a>
          </div>
          <a href="mailto:relacionamento@redentia.com.br" class="nuf__mail">relacionamento@redentia.com.br</a>
          <span class="nuf__hours">Atendimento em dias úteis, das 8h às 18h (Brasília)</span>
        </div>
        <nav class="nuf__grid" aria-label="Mapa do site">
          <div v-for="col in COLUMNS" :key="col.title" class="nuf__col">
            <div class="nuf__col-title">{{ col.title }}</div>
            <div class="nuf__col-links">
              <NuxtLink v-for="l in col.links" :key="l.label" :to="l.to" class="nuf__link">{{ l.label }}</NuxtLink>
              <button v-if="col.title === 'Legal'" type="button" class="nuf__pref" @click="reabrir">Preferências de cookies</button>
            </div>
          </div>
        </nav>
      </div>
    </div>

    <NuFooterCordilheira class="nuf__serra">
      <template #ceu>
        <h2 class="nuf__hero">Seja qual for a sua meta, a Redentia tem um caminho</h2>
      </template>
      <template #base>
        <div class="nuf__bottom">
        <img src="/logo-branca.svg" alt="Redentia" class="nuf__bottom-logo">
        <span class="nuf__copy">© 2026 Redentia · {{ EMPRESA.razaoSocial }} · CNPJ {{ EMPRESA.cnpj }}</span>
        <!-- a entrada do B2B no app (direção do dono 2026-08-01): botão discreto
             no rodapé, não item de coluna — é outro produto, não outra página -->
        <NuxtLink to="/business" class="nuf__biz">For Business</NuxtLink>
        </div>
      </template>
    </NuFooterCordilheira>
    <!-- O aviso de cookies senta aqui quando o rodapé está na tela. -->
    <div id="ancora-cookies" />
  </footer>
</template>

<style scoped>
.nuf { --pad: clamp(22px, 5.5vw, 80px); position: relative; background: var(--nu-navy); padding-top: clamp(64px, 8vw, 110px); overflow: hidden; }
.nuf__in { padding: 0 var(--pad); }
.nuf__top { display: flex; gap: clamp(28px, 5vw, 70px); align-items: flex-start; flex-wrap: wrap; }
.nuf__title {
  margin: 0; flex: 1 1 240px; min-width: min(220px, 100%); color: var(--nu-cream-text);
  font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.14;
}
.nuf__cards {
  flex: 2.4 1 480px; min-width: min(320px, 100%);
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;
}
.nuf__card {
  background: var(--nu-navy-2); border-radius: var(--nu-r-panel); padding: 30px;
  display: flex; flex-direction: column; min-height: 290px;
  transition: background .2s, transform .18s;
}
.nuf__card:hover { background: var(--nu-navy-3); transform: translateY(-3px); }
.nuf__card-title { color: var(--nu-cream-text); font-size: var(--nu-fs-xl); font-weight: 800; }
.nuf__card-desc { color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; margin-top: 12px; max-width: 320px; }
.nuf__card-arrow {
  margin-top: auto; width: 46px; height: 46px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}

/* a assinatura da newsletter: o painel navy-2 dos cards, de ponta a ponta */
.nuf__news {
  display: flex; gap: clamp(24px, 4vw, 64px); align-items: center; flex-wrap: wrap;
  margin-top: 18px; padding: clamp(28px, 3.4vw, 44px);
  background: var(--nu-navy-2); border-radius: var(--nu-r-panel);
}
.nuf__news-texto { flex: 1.3 1 360px; min-width: min(280px, 100%); }
.nuf__news-titulo { margin: 0; color: var(--nu-cream-text); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.14; }
.nuf__news-sub { margin: 12px 0 0; max-width: 52ch; color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.nuf__news-form { flex: 1 1 340px; min-width: min(280px, 100%); }

/* a marca à esquerda, as colunas à direita */
.nuf__mapa {
  display: grid; grid-template-columns: minmax(240px, 1fr) minmax(0, 2.6fr); gap: clamp(40px, 6vw, 96px);
  margin-top: clamp(72px, 9vw, 128px);
}
.nuf__marca { display: flex; flex-direction: column; align-items: flex-start; }
.nuf__marca-nome { display: flex; align-items: center; gap: 12px; color: var(--nu-cream-text); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; }
.nuf__marca-logo { width: 30px; height: 30px; display: block; object-fit: contain; }
.nuf__marca-frase { margin: 16px 0 0; max-width: 34ch; color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.nuf__social-row { display: flex; align-items: center; gap: 20px; margin-top: 24px; }
.nuf__soc { color: var(--nu-cream-text); transition: opacity .2s, transform .2s; }
.nuf__soc:hover { opacity: 0.6; color: var(--nu-cream-text); transform: translateY(-2px); }
.nuf__mail { margin-top: 28px; color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 700; transition: color .2s; }
.nuf__mail:hover { color: var(--nu-white); }
.nuf__hours { margin-top: 6px; color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.nuf__grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: clamp(36px, 4vw, 56px) clamp(20px, 2.4vw, 36px); }
.nuf__col-title { color: var(--nu-blue-soft); font-size: var(--nu-fs-md); font-weight: 800; margin-bottom: 18px; }
.nuf__col-links { display: flex; flex-direction: column; gap: 13px; }
.nuf__link { color: var(--nu-cream-text-78); font-size: var(--nu-fs-md); font-weight: 500; transition: color .2s; }
.nuf__link:hover { color: var(--nu-white); }
.nuf__pref {
  margin: 0; padding: 0; border: 0; background: none; text-align: left; cursor: pointer; font: inherit;
  color: var(--nu-cream-text-78); font-size: var(--nu-fs-md); font-weight: 500; transition: color .2s;
}
.nuf__pref:hover { color: var(--nu-white); }
.nuf__pref:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }

/* a cordilheira: de ponta a ponta, a frase no céu e o copyright na base */
.nuf__serra { --nfc-pad: var(--pad); margin-top: clamp(56px, 7vw, 100px); }
.nuf__hero {
  margin: 0; padding: 0 var(--pad); color: var(--nu-cream-text);
  font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.045em; line-height: 1.03;
}
.nuf__bottom { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 0 var(--pad) 26px; }
.nuf__bottom-logo { width: 27px; height: 27px; display: block; object-fit: contain; }
.nuf__copy { color: var(--nu-cream-text-78); font-size: var(--nu-fs-sm); font-weight: 500; }
/* sobre a base da serra: o mesmo navy do rodapé, com borda fina */
.nuf__biz {
  margin-left: auto; display: inline-flex; align-items: center;
  background: var(--nu-navy); color: var(--nu-cream-text); border: 1px solid var(--nu-cream-text-22);
  border-radius: var(--nu-r-pill); padding: 10px 20px;
  font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; transition: background .2s, border-color .2s;
}
.nuf__biz:hover { background: var(--nu-navy-2); border-color: var(--nu-cream-text-45); color: var(--nu-white); }
.nuf__biz:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }

@media (max-width: 1180px) {
  .nuf__grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
}
@media (max-width: 900px) {
  .nuf__mapa { grid-template-columns: 1fr; }
  .nuf__hero { margin-bottom: 28px; }
  .nuf__bottom { padding-top: 22px; }
}
</style>
