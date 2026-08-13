<script setup lang="ts">
/**
 * Footer da Redentia for Business.
 *
 * PADRÃO DO APP (direção do dono 2026-07-30: "no footer, use o padrão"):
 * a anatomia e as medidas são as do NuFooter, banda navy com 2 cards de
 * produto no topo, statement gigante, colunas de link, redes e rodapé com
 * logo e copyright. Nada de layout novo.
 *
 * O que muda é o CONTEÚDO e o NOME. O NuFooter aponta pro B2C inteiro (Ações,
 * Mercado, Teses, Calculadoras): pôr isso aqui manda o comprador de MFO pra
 * dentro de um app de investidor pessoa física. Os dois cards viraram as duas
 * saídas honestas desta página, e é aqui que "Para investidores" mora depois
 * de sair do header.
 *
 * E-MAIL CONFIRMADO PELO DONO (2026-08-01): contato@redentia.com existe e
 * recebe. É o endereço do deck MFO_Operational_Standard; o app usa
 * suporte@redentia.com.br, e a diferença de domínio é intencional.
 */
const CARDS = [
  {
    title: 'Redentia para investidores',
    desc: 'A plataforma de análise para pessoa física: ações, FIIs, carteira e teses.',
    to: '/',
  },
  {
    title: 'Redentia MCP',
    desc: 'A conexão que leva a sua carteira para dentro do assistente de IA que você já usa.',
    to: '/mcp',
  },
]

const COLUMNS = [
  {
    title: 'A página',
    links: [
      { label: 'O gargalo', to: '/business#gargalo' },
      { label: 'A divisão do trabalho', to: '/business#divisao' },
      { label: 'Segurança', to: '/business#seguranca' },
      { label: 'O plano', to: '/business#prova' },
      { label: 'Ativar acesso', to: '/business/cadastro' },
      { label: 'Conectar', to: '/business/comecar' },
    ],
  },
  {
    title: 'Redentia',
    links: [
      { label: 'Para investidores', to: '/' },
      { label: 'Redentia MCP', to: '/mcp' },
      { label: 'Guias', to: '/guias' },
      { label: 'Metodologia', to: '/metodologia' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre', to: '/institucional/about' },
      { label: 'Como funciona', to: '/institucional/how-works' },
      { label: 'Contato', to: '/institucional/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidade', to: '/institucional/privacy' },
      { label: 'Cookies', to: '/institucional/cookies' },
      { label: 'Termos de Uso', to: '/institucional/terms' },
    ],
  },
]
</script>

<template>
  <footer class="rbf">
    <div class="rbf__top">
      <h2 class="rbf__title">A Redentia também existe fora do escritório</h2>
      <div class="rbf__cards">
        <NuxtLink v-for="c in CARDS" :key="c.title" :to="c.to" class="rbf__card">
          <span class="rbf__card-title">{{ c.title }}</span>
          <span class="rbf__card-desc">{{ c.desc }}</span>
          <span class="rbf__card-arrow">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </span>
        </NuxtLink>
      </div>
    </div>

    <h2 class="rbf__hero">O dado no lugar, antes da reunião</h2>

    <div class="rbf__grid">
      <div v-for="col in COLUMNS" :key="col.title" class="rbf__col">
        <div class="rbf__col-title">{{ col.title }}</div>
        <div class="rbf__col-links">
          <NuxtLink v-for="l in col.links" :key="l.label" :to="l.to" class="rbf__link">{{ l.label }}</NuxtLink>
        </div>
      </div>
      <div class="rbf__col">
        <div class="rbf__col-title">Fale com a gente</div>
        <div class="rbf__col-links">
          <a href="mailto:contato@redentia.com" class="rbf__mail">contato@redentia.com</a>
          <span class="rbf__hours">Atendimento em dias úteis,<br>das 8h às 18h (Brasília)</span>
        </div>
      </div>
    </div>

    <div class="rbf__social">
      <div class="rbf__col-title">Redes Sociais</div>
      <div class="rbf__social-row">
        <a href="https://www.linkedin.com/company/redentia" target="_blank" rel="noopener noreferrer" class="rbf__soc" aria-label="LinkedIn"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 10v7M7 6.5v.01M11 17v-4a2 2 0 0 1 4 0v4" /></svg></a>
        <a href="https://www.instagram.com/redentia.app/" target="_blank" rel="noopener noreferrer" class="rbf__soc" aria-label="Instagram"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg></a>
      </div>
    </div>

    <div class="rbf__bottom">
      <!-- a logo volta pro app, como a do header (direção do dono 2026-08-01) -->
      <NuxtLink to="/" class="rbf__bottom-link" aria-label="Voltar para a Redentia">
        <img src="/logo-branca.svg" alt="" class="rbf__bottom-logo">
      </NuxtLink>
      <span class="rbf__bottom-name">Redentia <span class="rbf__bottom-suffix">For Business</span></span>
      <span class="rbf__copy">© 2026 Redentia Tecnologia S.A.</span>
    </div>
  </footer>
</template>

<style scoped>
/* Medidas espelhadas do NuFooter (padrão do app). Só o bloco do nome no
   rodapé é novo, porque o footer do app mostra só o losango. */
.rbf { background: var(--nu-navy); padding: clamp(64px, 8vw, 110px) clamp(22px, 5.5vw, 80px) 0; overflow: hidden; }
.rbf__top { display: flex; gap: clamp(28px, 5vw, 70px); align-items: flex-start; flex-wrap: wrap; }
.rbf__title {
  margin: 0; flex: 1 1 240px; min-width: min(220px, 100%); color: var(--nu-cream-text);
  font-size: clamp(28px, 2.7vw, 40px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.14;
}
.rbf__cards {
  flex: 2.4 1 480px; min-width: min(320px, 100%);
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;
}
.rbf__card {
  background: var(--nu-navy-2); border-radius: var(--nu-r-panel); padding: 30px;
  display: flex; flex-direction: column; min-height: 290px;
  transition: background .2s, transform .18s;
}
.rbf__card:hover { background: var(--nu-navy-3); transform: translateY(-3px); }
.rbf__card:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.rbf__card-title { color: var(--nu-cream-text); font-size: 20px; font-weight: 800; }
.rbf__card-desc { color: var(--nu-cream-text-70); font-size: 16px; font-weight: 500; line-height: 1.55; margin-top: 12px; max-width: 320px; }
.rbf__card-arrow {
  margin-top: auto; width: 46px; height: 46px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}
.rbf__hero {
  margin: clamp(72px, 10vw, 140px) 0 0; color: var(--nu-cream-text);
  font-size: clamp(42px, 7vw, 102px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.03;
}
.rbf__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(215px, 1fr));
  gap: clamp(40px, 4vw, 64px) clamp(28px, 4vw, 56px); margin-top: clamp(56px, 8vw, 100px);
}
.rbf__col { min-width: 130px; }
.rbf__col-title { color: var(--nu-blue-soft); font-size: 15px; font-weight: 800; margin-bottom: 18px; }
.rbf__col-links { display: flex; flex-direction: column; gap: 13px; }
.rbf__link { color: var(--nu-cream-text-78); font-size: 15px; font-weight: 600; transition: color .2s; }
.rbf__link:hover { color: var(--nu-white); }
.rbf__mail { color: var(--nu-cream-text); font-size: 15px; font-weight: 700; transition: color .2s; }
.rbf__mail:hover { color: var(--nu-white); }
.rbf__hours { color: var(--nu-cream-text-55); font-size: 14px; font-weight: 500; line-height: 1.55; }
.rbf__link:focus-visible,
.rbf__mail:focus-visible,
.rbf__soc:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.rbf__social { margin-top: clamp(56px, 7vw, 96px); }
.rbf__social .rbf__col-title { margin-bottom: 0; }
.rbf__social-row { display: flex; align-items: center; gap: 24px; margin-top: 20px; }
.rbf__soc { color: var(--nu-cream-text); transition: opacity .2s; }
.rbf__soc:hover { opacity: 0.6; color: var(--nu-cream-text); }
.rbf__bottom {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  margin-top: clamp(48px, 6vw, 84px); padding-bottom: 30px;
}
.rbf__bottom-link { display: block; transition: opacity .2s; }
.rbf__bottom-link:hover { opacity: 0.6; }
.rbf__bottom-link:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.rbf__bottom-logo { width: 27px; height: 27px; display: block; object-fit: contain; }
/* o nome por extenso: é a diferença que o dono pediu entre os dois footers */
.rbf__bottom-name { color: var(--nu-cream-text); font-size: 15px; font-weight: 800; letter-spacing: -0.02em; }
.rbf__bottom-suffix { color: var(--nu-blue-soft); }
.rbf__copy { color: var(--nu-cream-text-60); font-size: 14px; font-weight: 500; }
</style>
