<script setup lang="ts">
// Footer Nu — navy, fiel ao design: 2 cards de produto, headline gigante,
// colunas de links, redes sociais e copyright.
// Contrato de UX: designs/Redentia Mercado Nu.dc.html (footer, linhas 521-589).
const CARDS = [
  { title: 'Redentia AI', desc: 'Seu assessor de investimentos, disponível 24h para qualquer pergunta.', to: '/busca' },
  { title: 'Redentia Calculadoras', desc: 'Preço teto, juros compostos e renda passiva — resultados em segundos.', to: '/calculadoras' },
]
const COLUMNS = [
  { title: 'Produto', links: [{ label: 'Ações', to: '/acao/PETR4' }, { label: 'Carteira', to: '/carteira' }, { label: 'Mercado', to: '/mercado' }, { label: 'Calculadoras', to: '/calculadoras' }] },
  { title: 'Recursos', links: [{ label: 'Notícias', to: '/noticias' }, { label: 'Busca', to: '/busca' }, { label: 'Guias', to: '/guias' }] },
  { title: 'Empresa', links: [{ label: 'Sobre', to: '/institucional/about' }, { label: 'Como funciona', to: '/institucional/how-works' }, { label: 'Metodologia', to: '/metodologia' }, { label: 'Contato', to: '/institucional/contact' }] },
  { title: 'Legal', links: [{ label: 'Privacidade', to: '/institucional/privacy' }, { label: 'Cookies', to: '/institucional/cookies' }, { label: 'Termos de Uso', to: '/institucional/terms' }] },
]
</script>

<template>
  <footer class="nuf">
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

    <h2 class="nuf__hero">Seja qual for a sua meta, a Redentia tem um caminho</h2>

    <div class="nuf__grid">
      <div v-for="col in COLUMNS" :key="col.title" class="nuf__col">
        <div class="nuf__col-title">{{ col.title }}</div>
        <div class="nuf__col-links">
          <NuxtLink v-for="l in col.links" :key="l.label" :to="l.to" class="nuf__link">{{ l.label }}</NuxtLink>
        </div>
      </div>
      <div class="nuf__col">
        <div class="nuf__col-title">Fale com a gente</div>
        <div class="nuf__col-links">
          <a href="mailto:suporte@redentia.com.br" class="nuf__mail">suporte@redentia.com.br</a>
          <span class="nuf__hours">Atendimento em dias úteis,<br>das 8h às 18h (Brasília)</span>
        </div>
      </div>
    </div>

    <div class="nuf__social">
      <div class="nuf__col-title">Redes Sociais</div>
      <div class="nuf__social-row">
        <a href="https://www.linkedin.com/company/redentia" target="_blank" rel="noopener noreferrer" class="nuf__soc" aria-label="LinkedIn"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 10v7M7 6.5v.01M11 17v-4a2 2 0 0 1 4 0v4" /></svg></a>
        <a href="https://www.youtube.com/@redentia" target="_blank" rel="noopener noreferrer" class="nuf__soc" aria-label="YouTube"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="4" /><path d="M11 9.2l4 2.8-4 2.8z" fill="currentColor" stroke="none" /></svg></a>
        <a href="https://www.instagram.com/redent.ia" target="_blank" rel="noopener noreferrer" class="nuf__soc" aria-label="Instagram"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg></a>
        <a href="https://x.com/redentia" target="_blank" rel="noopener noreferrer" class="nuf__soc" aria-label="X"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg></a>
      </div>
    </div>

    <div class="nuf__bottom">
      <img src="/logo-branca.svg" alt="Redentia" class="nuf__bottom-logo">
      <span class="nuf__copy">© 2026 Redentia Tecnologia S.A.</span>
    </div>
  </footer>
</template>

<style scoped>
.nuf { background: var(--nu-navy); padding: clamp(64px, 8vw, 110px) clamp(22px, 5.5vw, 80px) 0; overflow: hidden; }
.nuf__top { display: flex; gap: clamp(28px, 5vw, 70px); align-items: flex-start; flex-wrap: wrap; }
.nuf__title {
  margin: 0; flex: 1 1 240px; min-width: min(220px, 100%); color: var(--nu-cream-text);
  font-size: clamp(28px, 2.7vw, 40px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.14;
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
.nuf__card-title { color: var(--nu-cream-text); font-size: 20px; font-weight: 800; }
.nuf__card-desc { color: var(--nu-cream-text-70); font-size: 16px; font-weight: 500; line-height: 1.55; margin-top: 12px; max-width: 320px; }
.nuf__card-arrow {
  margin-top: auto; width: 46px; height: 46px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}
.nuf__hero {
  margin: clamp(72px, 10vw, 140px) 0 0; color: var(--nu-cream-text);
  font-size: clamp(42px, 7vw, 102px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.03;
}
.nuf__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(215px, 1fr));
  gap: clamp(40px, 4vw, 64px) clamp(28px, 4vw, 56px); margin-top: clamp(56px, 8vw, 100px);
}
.nuf__col { min-width: 130px; }
.nuf__col-title { color: var(--nu-blue-soft); font-size: 15px; font-weight: 800; margin-bottom: 18px; }
.nuf__col-links { display: flex; flex-direction: column; gap: 13px; }
.nuf__link { color: var(--nu-cream-text-78); font-size: 15px; font-weight: 600; transition: color .2s; }
.nuf__link:hover { color: var(--nu-white); }
.nuf__mail { color: var(--nu-cream-text); font-size: 15px; font-weight: 700; transition: color .2s; }
.nuf__mail:hover { color: var(--nu-white); }
.nuf__hours { color: var(--nu-cream-text-55); font-size: 14px; font-weight: 500; line-height: 1.55; }
.nuf__social { margin-top: clamp(56px, 7vw, 96px); }
.nuf__social .nuf__col-title { margin-bottom: 0; }
.nuf__social-row { display: flex; align-items: center; gap: 24px; margin-top: 20px; }
.nuf__soc { color: var(--nu-cream-text); transition: opacity .2s; }
.nuf__soc:hover { opacity: 0.6; color: var(--nu-cream-text); }
.nuf__bottom {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  margin-top: clamp(48px, 6vw, 84px); padding-bottom: 30px;
}
.nuf__bottom-logo { width: 27px; height: 27px; display: block; object-fit: contain; }
.nuf__copy { color: var(--nu-cream-text-60); font-size: 14px; font-weight: 500; }
</style>
