<script setup lang="ts">
// APORTOU (11/11/2026): no site de investidor o rodapé é o NuFooterAportou (o
// do quadro Home: carvão, a frase da marca, as colunas em caixa alta e o
// wordmark gigante). Este arquivo segue sendo o rodapé da variante business,
// com a marca Redentia; COLUMNS (as do investidor) é exportado para o novo.
//
// Footer Nu — navy: a marca com redes e contato ao lado das
// colunas de links, e embaixo a banda de assinatura (NuFooterLinha): a frase
// grande em peso leve e um traço de luz só, o Ibovespa mês a mês desde 1995,
// com o copyright no pé. Escolhida pelo dono em 02/11/2026 ("gostei do 2"),
// entre três direções; trocou a cordilheira do Ibovespa (20/10/2026, que já
// tinha trocado o rodapé de designs/Redentia Mercado Nu.dc.html, linhas 521-589).
// Desde 21/10/2026, entre os cards e o mapa, a assinatura de O mercado da
// semana, para "onde eu assino?" ter resposta em qualquer página. Fica fora
// das páginas que já têm o formulário delas: o /guias, que fecha com a faixa
// azul logo acima do rodapé, e a preço teto, que tem o bloco no resultado e o
// veto do dono (o rodapé dela segue como estava).
// Em 31/10/2026 o dono tirou os dois cards de produto ("Conheça outras
// maneiras de usar a Redentia", grandes demais) e o preço da frase da marca.
//
// VARIANTE "business" (04/11/2026, o dono: o rodapé novo na /business, "com
// pequenas alterações para ser mais voltado à identidade For Business"). O
// mesmo rodapé, com estas trocas: sem a newsletter de investidor; a marca diz
// "Redentia For Business" com a frase do Business; as colunas apontam para o
// B2B (o Business, o MCP, a metodologia, a segurança, o contato e o legal); a
// frase grande da banda é a do Business; e o botão do pé leva aos
// investidores, no lugar do "For Business". A linha do Ibovespa fica: é a
// assinatura visual do site, e o Business lê o mesmo mercado.
import { rodapeSemAssinatura } from '~/utils/newsletter-lugares'

const props = defineProps<{ variante?: 'business' }>()
const business = computed(() => props.variante === 'business')
const route = useRoute()
const { reabrir } = useConsent()
const newsletterLigada = useRuntimeConfig().public.newsletterLigada === true
const assinaturaNoRodape = computed(() => !business.value && newsletterLigada && !rodapeSemAssinatura(route.path))
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
  { title: 'Produto', links: [{ label: 'Mercado', to: '/' }, { label: 'Rankings', to: '/rankings' }, { label: 'Teses', to: '/teses' }, { label: 'Aportou MCP', to: '/mcp' }] },
  // Direto pras calculadoras, não só pro hub: são as URLs que sustentam o site.
  { title: 'Calculadoras', links: [{ label: 'Preço teto', to: '/calculadora/preco-teto' }, { label: 'Simulador de ações e dividendos', to: '/calculadora/acoes' }, { label: 'Dividend yield', to: '/calculadora/dividend-yield' }, { label: 'Juros compostos', to: '/calculadora/juros-compostos' }, { label: 'Imposto de renda', to: '/calculadora/imposto-renda' }] },
  { title: 'Recursos', links: [{ label: 'Notícias', to: '/noticias' }, { label: 'Guias', to: '/guias' }, { label: 'Glossário', to: '/glossario' }, { label: 'Setores da B3', to: '/setor' }, { label: 'Tesouro Direto', to: '/tesouro' }] },
  { title: 'Empresa', links: [{ label: 'Sobre', to: '/institucional/about' }, { label: 'Como funciona', to: '/institucional/how-works' }, { label: 'Metodologia', to: '/metodologia' }, { label: 'Contato', to: '/institucional/contact' }] },
  { title: 'Legal', links: [{ label: 'Privacidade', to: '/institucional/privacy' }, { label: 'Cookies', to: '/institucional/cookies' }, { label: 'Termos de Uso', to: '/institucional/terms' }] },
]
const COLUMNS_BUSINESS = [
  { title: 'Business', links: [{ label: 'Para escritórios', to: '/business' }, { label: 'Segurança', to: '/business#seguranca' }, { label: 'Plano', to: '/business#prova' }, { label: 'Perguntas', to: '/business#faq' }] },
  { title: 'Produto', links: [{ label: 'Redentia MCP', to: '/mcp' }, { label: 'Metodologia', to: '/metodologia' }, { label: 'Para investidores', to: '/' }] },
  { title: 'Empresa', links: [{ label: 'Sobre', to: '/institucional/about' }, { label: 'Contato', to: '/business#contato' }] },
  { title: 'Legal', links: [{ label: 'Privacidade', to: '/institucional/privacy' }, { label: 'Cookies', to: '/institucional/cookies' }, { label: 'Termos de Uso', to: '/institucional/terms' }] },
]
const colunas = computed(() => (business.value ? COLUMNS_BUSINESS : COLUMNS))
</script>

<template>
  <NuFooterAportou v-if="!business" :colunas="COLUMNS" :assinatura="assinaturaNoRodape" />
  <footer v-else class="nuf">
    <div class="nuf__in">
      <section v-if="assinaturaNoRodape" id="newsletter" class="nuf__news" aria-labelledby="nuf-news-titulo">
        <div class="nuf__news-texto">
          <h2 id="nuf-news-titulo" class="nuf__news-titulo">O mercado da semana, toda sexta.</h2>
          <p class="nuf__news-sub">O Ibovespa da semana, as notícias que mexeram nele e os proventos da semana que vem, num e-mail só.</p>
        </div>
        <NuNewsletterForm class="nuf__news-form" origem="rodape" />
      </section>

      <div class="nuf__mapa">
        <div class="nuf__marca">
          <div class="nuf__marca-nome"><img src="/logo-branca.svg" alt="" class="nuf__marca-logo">Redentia<span v-if="business" class="nuf__marca-biz">For Business</span></div>
          <p v-if="business" class="nuf__marca-frase">O mercado, os cenários e a carteira do cliente no assistente que a sua mesa já usa.</p>
          <p v-else class="nuf__marca-frase">Mercado em tempo real, teses e calculadoras grátis para quem investe no Brasil.</p>
          <div class="nuf__social-row" aria-label="Redes sociais">
            <a href="https://www.linkedin.com/company/redentia" target="_blank" rel="noopener noreferrer" class="nuf__soc" aria-label="LinkedIn"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 10v7M7 6.5v.01M11 17v-4a2 2 0 0 1 4 0v4" /></svg></a>
            <a href="https://www.instagram.com/redentia.app/" target="_blank" rel="noopener noreferrer" class="nuf__soc" aria-label="Instagram"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg></a>
          </div>
          <a href="mailto:relacionamento@redentia.com.br" class="nuf__mail">relacionamento@redentia.com.br</a>
          <span class="nuf__hours">Atendimento em dias úteis, das 8h às 18h (Brasília)</span>
          <template v-if="!business"><NuAcompanheAndre lugar="rodape" tom="escuro" /></template>
        </div>
        <nav class="nuf__grid" aria-label="Mapa do site">
          <div v-for="col in colunas" :key="col.title" class="nuf__col">
            <div class="nuf__col-title">{{ col.title }}</div>
            <div class="nuf__col-links">
              <NuxtLink v-for="l in col.links" :key="l.label" :to="l.to" class="nuf__link">{{ l.label }}</NuxtLink>
              <button v-if="col.title === 'Legal'" type="button" class="nuf__pref" @click="reabrir">Preferências de cookies</button>
            </div>
          </div>
        </nav>
      </div>
    </div>

    <NuFooterLinha class="nuf__serra">
      <template v-if="business" #titulo>Sua próxima reunião<br> já começa preparada.</template>
      <template #base>
        <div class="nuf__bottom">
          <img src="/logo-branca.svg" alt="Redentia" class="nuf__bottom-logo">
          <span class="nuf__copy">© 2026 Redentia · {{ EMPRESA.razaoSocial }} · CNPJ {{ EMPRESA.cnpj }}</span>
          <!-- a entrada do B2B no app (direção do dono 2026-08-01): botão discreto
               no rodapé, não item de coluna — é outro produto, não outra página -->
          <NuxtLink v-if="business" to="/" class="nuf__biz">Para investidores</NuxtLink>
          <NuxtLink v-else to="/business" class="nuf__biz">For Business</NuxtLink>
        </div>
      </template>
    </NuFooterLinha>
    <!-- O aviso de cookies senta aqui quando o rodapé está na tela. -->
    <div id="ancora-cookies" />
  </footer>
</template>

<style scoped>
.nuf { --pad: clamp(22px, 5.5vw, 80px); container: rodape / inline-size; position: relative; background: var(--nu-navy); padding-top: clamp(64px, 8vw, 110px); overflow: hidden; }
.nuf__in { padding: 0 var(--pad); }
/* a assinatura da newsletter: o painel navy-2 dos cards, de ponta a ponta */
.nuf__news {
  display: flex; gap: clamp(24px, 4vw, 64px); align-items: center; flex-wrap: wrap;
  margin-top: 18px; padding: clamp(28px, 3.4vw, 44px);
  background: var(--nu-navy-2); border-radius: var(--nu-r-panel);
}
.nuf__news-texto { flex: 1.3 1 360px; min-width: min(280px, 100%); }
.nuf__news-titulo { margin: 0; color: var(--nu-cream-text); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.14; }
.nuf__news-sub { margin: 12px 0 0; max-width: 52ch; color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.nuf__news-form { flex: 1 1 340px; min-width: min(280px, 100%); }
/* o que abre o rodapé não leva margem por cima (os cards de produto saíram em 31/10/2026) */
.nuf__in > :first-child { margin-top: 0; }

/* a marca à esquerda, as colunas à direita */
.nuf__mapa {
  display: grid; grid-template-columns: minmax(240px, 1fr) minmax(0, 2.6fr); gap: clamp(40px, 6vw, 96px);
  margin-top: clamp(72px, 9vw, 128px);
}
.nuf__marca { display: flex; flex-direction: column; align-items: flex-start; }
.nuf__marca-nome { display: flex; align-items: center; gap: 12px; color: var(--nu-cream-text); font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: -0.02em; }
.nuf__marca-biz { margin-left: -4px; color: var(--nu-blue-soft); }
.nuf__marca-logo { width: 30px; height: 30px; display: block; object-fit: contain; }
.nuf__marca-frase { margin: 16px 0 0; max-width: 34ch; color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.nuf__social-row { display: flex; align-items: center; gap: 20px; margin-top: 24px; }
.nuf__soc { color: var(--nu-cream-text); transition: opacity .2s, transform .2s; }
.nuf__soc:hover { opacity: 0.6; color: var(--nu-cream-text); transform: translateY(-2px); }
.nuf__mail { margin-top: 28px; color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); transition: color .2s; }
.nuf__mail:hover { color: var(--nu-white); }
.nuf__hours { margin-top: 6px; color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.nuf__grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: clamp(36px, 4vw, 56px) clamp(20px, 2.4vw, 36px); }
.nuf__col-title { color: var(--nu-blue-soft); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); margin-bottom: 18px; }
.nuf__col-links { display: flex; flex-direction: column; gap: 13px; }
.nuf__link { color: var(--nu-cream-text-78); font-size: var(--nu-fs-md); font-weight: 500; transition: color .2s; }
.nuf__link:hover { color: var(--nu-white); }
.nuf__pref {
  margin: 0; padding: 0; border: 0; background: none; text-align: left; cursor: pointer; font: inherit;
  color: var(--nu-cream-text-78); font-size: var(--nu-fs-md); font-weight: 500; transition: color .2s;
}
.nuf__pref:hover { color: var(--nu-white); }
.nuf__pref:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }

/* a banda de assinatura: de ponta a ponta, a frase, o traço e o copyright no pé */
.nuf__serra { margin-top: clamp(56px, 7vw, 100px); }
.nuf__bottom { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 0 var(--pad) 26px; }
.nuf__bottom-logo { width: 27px; height: 27px; display: block; object-fit: contain; }
.nuf__copy { color: var(--nu-cream-text-78); font-size: var(--nu-fs-sm); font-weight: 500; }
/* no pé da banda: o mesmo navy do rodapé, com borda fina */
.nuf__biz {
  margin-left: auto; display: inline-flex; align-items: center;
  background: var(--nu-navy); color: var(--nu-cream-text); border: 1px solid var(--nu-cream-text-22);
  border-radius: var(--nu-r-pill); padding: 10px 20px;
  font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); white-space: nowrap; transition: background .2s, border-color .2s;
}
.nuf__biz:hover { background: var(--nu-navy-2); border-color: var(--nu-cream-text-45); color: var(--nu-white); }
.nuf__biz:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }

/* pela largura do rodapé, não da janela: com o painel do chat aberto a página
   encolhe ao lado dele, e as cinco colunas não cabem mais */
@container rodape (max-width: 1180px) {
  .nuf__grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
}
@container rodape (max-width: 900px) {
  .nuf__mapa { grid-template-columns: 1fr; }
}
/* no celular: a marca e o copyright numa linha, o For Business embaixo, alinhado com eles */
@media (max-width: 760px) {
  .nuf__bottom { align-items: flex-start; row-gap: 20px; }
  .nuf__copy { flex: 1 1 calc(100% - 43px); min-width: 0; line-height: 1.5; padding-top: 2px; }
  .nuf__biz { margin-left: 0; }
}
</style>
