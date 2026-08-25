<script setup lang="ts">
/**
 * /business/skills — o pack de skills do escritório (área logada).
 *
 * A entrega que fecha a lacuna entre "conectou a chave" e "extraiu valor":
 * quatro Agent Skills prontas pra subir no Claude, que ensinam o assistente a
 * usar o MCP direito — perguntar antes de gastar chamada, respeitar quota,
 * citar a data do dado e entregar texto pronto pro cliente na voz do assessor.
 *
 * Mesma anatomia do painel (/business/chaves): bandas full-bleed, a troca de
 * cor é o separador. Autenticada com a mesma guarda (nu:token → /login).
 * Os zips vivem em public/downloads/skills/ (estático; fonte e build em
 * Frontend/skills-pack/ — editou SKILL.md, rode npm run skills:build).
 */
definePageMeta({
  layout: 'business',
  middleware: [
    (to) => {
      const token = useCookie<string | null>('nu:token')
      if (!token.value) {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
      }
    },
  ],
})

usePageSeo({
  title: 'Skills · Redentia For Business',
  description: 'Skills prontas pro Claude do seu escritório extrair o máximo do MCP da Redentia.',
  path: '/business/skills',
  robots: 'noindex, follow',
})
useHead({ titleTemplate: null })

interface SkillCard {
  slug: string
  nome: string
  faz: string
  exemplo: string
  nota?: string
}

const SKILLS: SkillCard[] = [
  {
    slug: 'redentia-por-que-moveu',
    nome: 'Por que meu ativo subiu ou caiu',
    faz: 'Explica o movimento com notícia, tese e contexto de mercado, e entrega o texto pronto pro cliente em dois formatos: WhatsApp curto e parágrafo de e-mail, na voz do assessor.',
    exemplo: 'Cliente perguntou da VALE3. Me dá a explicação e o texto pro WhatsApp.',
  },
  {
    slug: 'redentia-carteira',
    nome: 'Análise da carteira',
    faz: 'Cole as posições do cliente e receba o relatório de mesa: valor, movimento do dia, concentração, notícias que tocam a carteira e cruzamento com as teses da casa.',
    exemplo: 'Cliente tem PETR4, HGLG11 e BOVA11. Analisa e me diz se alguma notícia de hoje toca as posições.',
    nota: 'A carteira vem da conversa, não da conta Redentia — funciona com qualquer chave e nada é salvo.',
  },
  {
    slug: 'redentia-comparar-ativos',
    nome: 'Comparar ativos',
    faz: 'Dois a quatro ativos lado a lado. Nos ETFs, entra o que ninguém compara de cabeça: custo efetivo com taxa sobre taxa, sobreposição de carteira e correlação medida.',
    exemplo: 'BOVA11 ou IVVB11? Quero custo, sobreposição e correlação.',
  },
  {
    slug: 'redentia-onboarding',
    nome: 'Primeiros passos',
    faz: 'O guia de bordo: o que cada uma das 9 ferramentas responde, teste de conexão em 3 chamadas, o que dá e o que não dá, e a tradução de cada mensagem de erro.',
    exemplo: 'Acabei de conectar a Redentia. O que dá pra fazer?',
  },
]
</script>

<template>
  <div>
    <section class="rbsk rbsk--cream">
      <div class="rbsk__wrap">
        <div class="rbsk__eyebrow">Redentia For Business</div>
        <h1 class="rbsk__title">Skills prontas<br>pra sua mesa.</h1>
        <p class="rbsk__sub">
          Quatro skills que ensinam o Claude a usar o MCP do jeito certo: perguntar antes de gastar
          chamada, respeitar os limites da chave, citar a data de cada dado e entregar texto pronto
          pro cliente na voz de quem assina — o escritório.
        </p>
        <div class="rbsk__meta">
          <span class="rbsk__pill">4 skills</span>
          <span class="rbsk__pill rbsk__pill--soft">instala em 2 minutos</span>
          <a href="/downloads/skills/redentia-skills-pack.zip" download class="rbsk__bundle">
            Baixar o pack completo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M6.5 10.5L12 16l5.5-5.5M4.5 20h15" /></svg>
          </a>
        </div>
      </div>
    </section>

    <section class="rbsk rbsk--white">
      <div class="rbsk__wrap">
        <div class="rbsk__grid">
          <article v-for="s in SKILLS" :key="s.slug" class="rbsk__card">
            <h2 class="rbsk__card-title">{{ s.nome }}</h2>
            <p class="rbsk__card-faz">{{ s.faz }}</p>
            <blockquote class="rbsk__card-ex">"{{ s.exemplo }}"</blockquote>
            <p v-if="s.nota" class="rbsk__card-nota">{{ s.nota }}</p>
            <a :href="`/downloads/skills/${s.slug}.zip`" download class="rbsk__dl">
              Baixar {{ s.slug }}.zip
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M6.5 10.5L12 16l5.5-5.5M4.5 20h15" /></svg>
            </a>
          </article>
        </div>
      </div>
    </section>

    <section class="rbsk rbsk--navy">
      <div class="rbsk__wrap">
        <h2 class="rbsk__title rbsk__title--navy">Como instalar.</h2>
        <div class="rbsk__cols">
          <div class="rbsk__col">
            <div class="rbsk__col-tag">No claude.ai</div>
            <ol class="rbsk__steps">
              <li>Baixe o pack completo — dentro vêm os quatro zips, um por skill — ou só o zip da skill que a mesa vai usar.</li>
              <li>No Claude, abra Configurações e procure por Skills (em geral dentro de Capacidades; o caminho pode variar com a versão).</li>
              <li>Envie o zip. A skill aparece pelo nome e ativa sozinha quando a pergunta combina com ela.</li>
              <li>Repita pra cada skill que a mesa for usar.</li>
            </ol>
          </div>
          <div class="rbsk__col">
            <div class="rbsk__col-tag">No Claude Code / Cursor</div>
            <ol class="rbsk__steps">
              <li>Baixe o pack completo (redentia-skills-pack.zip) e descompacte.</li>
              <li>Dentro de <code>.claude/skills/</code> do projeto — ou <code>~/.claude/skills/</code> pra valer em tudo — descompacte cada zip numa pasta com o nome da skill. O LEIA-ME dentro do pack repete o passo a passo.</li>
              <li>Invoque pelo nome ou deixe o contexto ativar.</li>
            </ol>
          </div>
        </div>
        <p class="rbsk__navy-note">
          As skills usam a conexão MCP que você já configurou — nenhuma chave nova, nenhum acesso
          além do que a sua chave já alcança.
        </p>
      </div>
    </section>

    <section class="rbsk rbsk--cream">
      <div class="rbsk__wrap rbsk__foot">
        <div>
          <h2 class="rbsk__foot-title">Ainda não conectou o MCP?</h2>
          <p class="rbsk__foot-sub">Gere a chave no painel e o passo a passo abre na hora — leva uns dois minutos.</p>
        </div>
        <div class="rbsk__foot-links">
          <!-- ?conectar=1 abre o modal de conexão do painel; sobrevive ao
               redirect de login porque a guarda usa o fullPath -->
          <NuxtLink to="/business/chaves?conectar=1" class="rbsk__btn">Como conectar</NuxtLink>
          <NuxtLink to="/business/chaves" class="rbsk__btn rbsk__btn--ghost">Minhas chaves</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.rbsk { padding: clamp(56px, 7vw, 96px) clamp(22px, 5.5vw, 80px); }
.rbsk--cream { background: var(--nu-cream); }
.rbsk--white { background: var(--nu-white); }
.rbsk--navy { background: var(--nu-navy); }
.rbsk__wrap { max-width: 1180px; margin: 0 auto; }

.rbsk__eyebrow { color: var(--nu-gray); font-size: 12.5px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; }
.rbsk__title {
  margin: 14px 0 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 60px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.rbsk__title--navy { color: var(--nu-cream-text); margin: 0 0 30px; font-size: clamp(30px, 3.4vw, 42px); }
.rbsk__sub { color: var(--nu-gray-2); font-size: 17px; font-weight: 600; line-height: 1.6; margin: 20px 0 0; max-width: 640px; }
.rbsk__meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 26px; }
.rbsk__pill { background: var(--nu-ink); color: var(--nu-white); font-size: 12.5px; font-weight: 800; padding: 7px 14px; border-radius: var(--nu-r-pill); }
.rbsk__pill--soft { background: var(--nu-sand-2); color: var(--nu-gray-tag); }
.rbsk__bundle {
  display: inline-flex; align-items: center; gap: 9px; background: var(--nu-blue); color: var(--nu-white);
  font-size: 14px; font-weight: 800; padding: 12px 22px; border-radius: var(--nu-r-pill);
  text-decoration: none; transition: background .16s;
}
.rbsk__bundle:hover { background: var(--nu-blue-hover); }

.rbsk__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr)); gap: 18px; }
.rbsk__card {
  background: var(--nu-cream); border-radius: var(--nu-r-card); padding: clamp(24px, 2.6vw, 34px);
  display: flex; flex-direction: column; gap: 14px; transition: transform .15s;
}
.rbsk__card:hover { transform: translateY(-2px); }
.rbsk__card-title { margin: 0; color: var(--nu-ink); font-size: clamp(20px, 2vw, 24px); font-weight: 800; letter-spacing: -0.02em; }
.rbsk__card-faz { margin: 0; color: var(--nu-gray-2); font-size: 15px; font-weight: 600; line-height: 1.6; }
.rbsk__card-ex {
  margin: 0; background: var(--nu-white); border-radius: 16px; padding: 14px 18px;
  color: var(--nu-ink); font-size: 14.5px; font-weight: 700; line-height: 1.5;
}
.rbsk__card-nota { margin: 0; color: var(--nu-gray); font-size: 13px; font-weight: 600; line-height: 1.55; }
.rbsk__dl {
  margin-top: auto; align-self: flex-start; display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-ink); color: var(--nu-white); font-size: 13.5px; font-weight: 800;
  padding: 11px 20px; border-radius: var(--nu-r-pill); text-decoration: none; transition: background .16s;
}
.rbsk__dl:hover { background: var(--nu-ink-hover); }

.rbsk__cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(400px, 100%), 1fr)); gap: 18px; }
.rbsk__col { background: var(--nu-navy-2); border-radius: var(--nu-r-card); padding: clamp(24px, 2.6vw, 32px); }
.rbsk__col-tag { color: var(--nu-cream-text-55); font-size: 12.5px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
.rbsk__steps { margin: 16px 0 0; padding: 0 0 0 20px; display: flex; flex-direction: column; gap: 10px; }
.rbsk__steps li { color: var(--nu-cream-text-78); font-size: 15px; font-weight: 600; line-height: 1.55; }
.rbsk__steps code { background: rgba(245, 241, 234, 0.12); border-radius: 6px; padding: 2px 7px; font-size: 13.5px; color: var(--nu-cream-text); }
.rbsk__navy-note { color: var(--nu-cream-text-55); font-size: 13.5px; font-weight: 600; margin: 22px 0 0; }

.rbsk__foot { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.rbsk__foot-title { margin: 0; color: var(--nu-ink); font-size: clamp(22px, 2.4vw, 28px); font-weight: 800; letter-spacing: -0.02em; }
.rbsk__foot-sub { margin: 8px 0 0; color: var(--nu-gray); font-size: 15px; font-weight: 600; }
.rbsk__foot-links { display: flex; gap: 10px; flex-wrap: wrap; }
.rbsk__btn {
  display: inline-flex; align-items: center; background: var(--nu-ink); color: var(--nu-white);
  font-size: 14px; font-weight: 800; padding: 13px 24px; border-radius: var(--nu-r-pill);
  text-decoration: none; transition: background .16s;
}
.rbsk__btn:hover { background: var(--nu-ink-hover); }
.rbsk__btn--ghost { background: var(--nu-sand-2); color: var(--nu-gray-2); }
.rbsk__btn--ghost:hover { background: var(--nu-sand-hover); }
</style>
