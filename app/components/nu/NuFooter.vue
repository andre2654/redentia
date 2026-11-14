<script setup lang="ts">
// O rodapé do site: o NuFooterAportou (o do quadro Home: carvão, a frase da
// marca, as colunas em caixa alta e o wordmark gigante, 11/11/2026). Este
// arquivo guarda as colunas (COLUMNS) e decide se a assinatura de "O mercado
// da semana" entra. O rodapé navy de antes, com a banda do Ibovespa
// (NuFooterLinha), ficou só na variante do produto de escritório desde a
// Aportou, e saiu com o B2B em 12/11/2026.
//
// A assinatura de O mercado da semana (desde 21/10/2026) responde "onde eu
// assino?" em qualquer página. Fica fora das páginas que já têm o formulário
// delas: o /guias, que fecha com a faixa azul logo acima do rodapé, e a preço
// teto, que tem o bloco no resultado e o veto do dono (o rodapé dela segue
// como estava).
import { rodapeSemAssinatura } from '~/utils/newsletter-lugares'

const route = useRoute()
const newsletterLigada = useRuntimeConfig().public.newsletterLigada === true
const assinaturaNoRodape = computed(() => newsletterLigada && !rodapeSemAssinatura(route.path))
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
</script>

<template>
  <NuFooterAportou :colunas="COLUMNS" :assinatura="assinaturaNoRodape" />
</template>
