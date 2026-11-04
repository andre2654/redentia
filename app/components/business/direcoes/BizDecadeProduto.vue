<script setup lang="ts">
/**
 * /business, direção 2 (?biz=2, 04/11/2026): A DECADE COM PRODUTO.
 *
 * Da Decade (decade.com): o hero dividido com o lado claro calmo e o título em
 * peso leve, e o passo a passo em que cada passo é uma janela do app sobre uma
 * foto. A ruptura com a página de hoje: o lado direito do hero deixa de ser
 * foto com um cartão animado e passa a ser o produto inteiro, a conversa no
 * assistente da mesa com a tela da carteira chegando consolidada; o passo a
 * passo não trava a rolagem e mostra quatro telas diferentes do produto, na
 * ordem em que o escritório usa (o convite no painel, o banco do cliente, o
 * cenário no assistente, o relatório). O Venn vira duas colunas de regra, uma
 * por tipo de casa, no escuro.
 *
 * Fotos só sem rosto reconhecível (sala-vidro, lounge, anotando); mesa.webp
 * não entra. As telas são recortes fiéis (components/business/telas) com o
 * rótulo "Exemplo"; o movimento é o do produto, uma vez (useBizEntrada).
 */
const hero = useBizEntrada({ atraso: 500, limiar: 0.2 })
const p1 = useBizEntrada()
const p2 = useBizEntrada()
const p3 = useBizEntrada()
const p4 = useBizEntrada()

const PASSOS = [
  { n: '01', t: 'Convide o cliente.', d: 'Um link sai do painel, em nome de quem atende.', foto: 'sala-vidro', e: p1 },
  { n: '02', t: 'Ele autoriza no banco dele.', d: 'Pelo Open Finance. Ele revoga quando quiser.', foto: 'lounge', e: p2 },
  { n: '03', t: 'Rode um choque.', d: 'A carteira atravessa um cenário em 2.000 caminhos.', foto: 'anotando', e: p3 },
  { n: '04', t: 'Leve o relatório pronto.', d: 'Com a marca da casa, para revisar antes de enviar.', foto: 'sala-vidro', e: p4 },
] as const

const CASAS = [
  { quem: 'Assessor ligado a XP ou BTG', t: 'Sem dado de cliente.', d: 'A carteira entra colada, sem nome, e não fica salva na conta.' },
  { quem: 'Family office e gestora', t: 'Com o cliente dentro.', d: 'Pelo Open Finance, com o consentimento de cada cliente.' },
]
const SEGURANCA = [
  { t: 'Só lê.', d: 'Nada compra, vende ou transfere.' },
  { t: 'Cliente só entra com o sim dele.', d: 'Cada leitura fica registrada.' },
  { t: 'A IA é a da sua casa.', d: 'O Claude ou o ChatGPT do escritório.' },
]
const ctx = (id: string, rotulo: string) => ({ id: `business:${id}`, tipo: 'bloco', rotulo })
</script>

<template>
  <div class="bxd">
    <section id="gargalo" v-contexto-chat="ctx('hero', 'A carteira do cliente consolidada')" class="bxd-hero">
      <div class="bxd-hero__texto">
        <p class="bxd-hero__produto">Redentia For Business</p>
        <h1 class="bxd-hero__titulo">Consolide a carteira do seu cliente com 1 clique.</h1>
        <p class="bxd-hero__dek">O cliente autoriza pelo Open Finance. A carteira chega inteira no assistente da sua mesa.</p>
        <div class="bxd-hero__acao">
          <a href="#contato" class="bxd__cta">Agendar 1 hora com a gente</a>
          <span class="bxd-hero__status">Conexão habilitada escritório a escritório, na implantação.</span>
        </div>
      </div>
      <div :ref="(el) => (hero.el.value = el as HTMLElement)" class="bxd-hero__produto-vivo">
        <BizJanela class="bxd-hero__janela" tipo="assistente" composer>
          <BizConversa pergunta="Consolida a carteira da Mariana." :tocar="hero.tocar.value">
            <BizTelaCarteira :linhas="3" :tocar="hero.tocar.value" />
          </BizConversa>
        </BizJanela>
      </div>
    </section>

    <section id="produto" class="bxd-passos">
      <header class="bxd-passos__cab">
        <h2 class="bxd__h2">Do convite à reunião.</h2>
        <p class="bxd__dek">Clientes do escritório é habilitado escritório a escritório, na implantação.</p>
      </header>
      <ol class="bxd-passos__lista">
        <li v-for="p in PASSOS" :key="p.n" v-contexto-chat="ctx(`passo-${p.n}`, p.t)" class="bxd-passo">
          <div :ref="(el) => (p.e.el.value = el as HTMLElement)" class="bxd-passo__cena">
            <img :src="`/business-hero/${p.foto}.webp`" alt="" width="620" height="620" loading="lazy" decoding="async" class="bxd-passo__foto">
            <span class="bxd-passo__scrim" aria-hidden="true" />
            <div class="bxd-passo__tela">
              <BizJanela v-if="p.n === '01'" endereco="redentia.com.br/business/clientes">
                <BizTelaClientes etapa="convite" :tocar="p.e.tocar.value" />
              </BizJanela>
              <BizJanela v-else-if="p.n === '02'" endereco="redentia.com.br/cliente/convite">
                <BizTelaConsentimento :tocar="p.e.tocar.value" />
              </BizJanela>
              <BizJanela v-else-if="p.n === '03'" tipo="assistente">
                <BizTelaCenario :pesos="0" :botao="false" :tocar="p.e.tocar.value" />
              </BizJanela>
              <BizTelaRelatorio v-else :tocar="p.e.tocar.value" />
            </div>
          </div>
          <div class="bxd-passo__texto">
            <span class="bxd-passo__n">{{ p.n }}</span>
            <h3 class="bxd-passo__t">{{ p.t }}</h3>
            <p class="bxd-passo__d">{{ p.d }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section v-contexto-chat="ctx('casas', 'Duas casas, duas regras')" class="bxd-casas">
      <h2 class="bxd__h2 bxd__h2--claro">Duas casas, duas regras.</h2>
      <div class="bxd-casas__grade">
        <div v-for="c in CASAS" :key="c.quem" class="bxd-casas__col">
          <p class="bxd-casas__quem">{{ c.quem }}</p>
          <h3 class="bxd-casas__t">{{ c.t }}</h3>
          <p class="bxd-casas__d">{{ c.d }}</p>
        </div>
      </div>
    </section>

    <section id="seguranca" v-contexto-chat="ctx('seguranca', 'Segurança do Redentia For Business')" class="bxd-seg">
      <h2 class="bxd__h2">Seu compliance pergunta.<br>A gente mostra.</h2>
      <ul class="bxd-seg__lista">
        <li v-for="(s, i) in SEGURANCA" :key="s.t"><span>{{ String(i + 1).padStart(2, '0') }}</span><b>{{ s.t }}</b><em>{{ s.d }}</em></li>
      </ul>
    </section>

    <BizPlano />
    <BizFaq />
    <RbContato />
  </div>
</template>

<style scoped>
.bxd { --g: clamp(22px, 5.5vw, 80px); background: var(--nu-white); }
.bxd__cta {
  display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 26px;
  border-radius: var(--nu-r-pill); background: var(--nu-ink); color: var(--nu-white);
  font-size: var(--nu-fs-md); font-weight: 700; transition: background .2s;
}
.bxd__cta:hover { background: var(--nu-ink-hover); color: var(--nu-white); }
.bxd__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.bxd__h2 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 500; letter-spacing: -0.05em; line-height: 1.02; }
.bxd__h2--claro { color: var(--nu-cream-text); }
.bxd__dek { margin: 14px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }

/* ——— hero dividido: texto calmo | o produto vivo ——— */
.bxd-hero { display: grid; grid-template-columns: 1fr 1fr; min-height: min(calc(100svh - var(--nuh-h, 72px)), 880px); background: var(--nu-cream); }
.bxd-hero__texto { display: flex; flex-direction: column; justify-content: center; padding: clamp(48px, 6vw, 96px) clamp(24px, 4vw, 64px) clamp(48px, 6vw, 96px) var(--g); }
.bxd-hero__produto { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 700; }
.bxd-hero__titulo { margin: 16px 0 0; max-width: 14ch; color: var(--nu-ink); font-size: clamp(40px, 4.8vw, 70px); font-weight: 500; letter-spacing: -0.055em; line-height: 1.02; }
.bxd-hero__dek { margin: 22px 0 0; max-width: 40ch; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.bxd-hero__acao { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 20px; margin-top: 30px; }
.bxd-hero__status { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.bxd-hero__produto-vivo {
  position: relative; overflow: hidden; display: flex; justify-content: center; align-items: flex-start;
  padding: clamp(40px, 5vw, 72px) clamp(24px, 4vw, 64px) 0;
  background: var(--nu-navy);
}
.bxd-hero__produto-vivo::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(60% 50% at 50% 30%, color-mix(in srgb, var(--nu-blue) 32%, transparent), transparent 75%);
}
.bxd-hero__janela { position: relative; width: min(440px, 100%); margin-bottom: -60px; }

/* ——— passo a passo: a janela do app sobre a foto ——— */
.bxd-passos { scroll-margin-top: calc(var(--nuh-h, 72px) + 24px); padding: clamp(80px, 10vw, 140px) var(--g) clamp(64px, 8vw, 112px); }
.bxd-passos__cab { max-width: 720px; margin-bottom: clamp(40px, 5vw, 72px); }
.bxd-passos__lista { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: clamp(48px, 6vw, 96px); }
.bxd-passo { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: clamp(28px, 5vw, 88px); align-items: center; }
.bxd-passo:nth-child(even) .bxd-passo__cena { order: 2; }
.bxd-passo__cena { position: relative; isolation: isolate; overflow: hidden; display: grid; place-items: center; min-height: clamp(420px, 42vw, 580px); padding: clamp(28px, 4vw, 56px); border-radius: var(--nu-r-card-lg); background: var(--nu-navy); }
.bxd-passo__foto { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; filter: grayscale(1); }
.bxd-passo__scrim { position: absolute; inset: 0; z-index: -1; background: rgba(12, 21, 36, .28); }
.bxd-passo__tela { width: min(520px, 100%); }
.bxd-passo__n { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.bxd-passo__t { margin: 10px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.045em; line-height: 1.05; }
.bxd-passo__d { margin: 16px 0 0; max-width: 34ch; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.55; }

/* ——— duas casas, no escuro ——— */
.bxd-casas { padding: clamp(72px, 9vw, 128px) var(--g); background: var(--nu-agora-bg); }
.bxd-casas__grade { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; margin-top: clamp(40px, 5vw, 64px); border-radius: var(--nu-r-card); overflow: hidden; background: var(--nu-agora-linha); }
.bxd-casas__col { padding: clamp(28px, 4vw, 56px); background: var(--nu-agora-cartao); }
.bxd-casas__quem { margin: 0; color: var(--nu-blue-soft); font-size: var(--nu-fs-sm); font-weight: 700; }
.bxd-casas__t { margin: 12px 0 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.04em; line-height: 1.1; }
.bxd-casas__d { margin: 12px 0 0; max-width: 36ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }

/* ——— segurança ——— */
.bxd-seg { scroll-margin-top: calc(var(--nuh-h, 72px) + 24px); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); gap: clamp(28px, 5vw, 80px); padding: clamp(72px, 9vw, 128px) var(--g); background: var(--nu-cream); }
.bxd-seg__lista { margin: 0; padding: 0; list-style: none; }
.bxd-seg__lista li { display: grid; grid-template-columns: 40px minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: baseline; padding: 20px 0; border-top: 1px solid var(--nu-cream-line); }
.bxd-seg__lista span { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.bxd-seg__lista b { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 700; letter-spacing: -0.02em; }
.bxd-seg__lista em { color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-style: normal; font-weight: 500; }

:deep(.bzp__titulo), :deep(.rbct__titulo) { font-weight: 500; letter-spacing: -0.05em; }

@media (max-width: 960px) {
  .bxd-hero { grid-template-columns: 1fr; }
  .bxd-hero__produto-vivo { max-height: 620px; }
  .bxd-passo { grid-template-columns: 1fr; }
  .bxd-passo:nth-child(even) .bxd-passo__cena { order: 0; }
  .bxd-casas__grade, .bxd-seg { grid-template-columns: 1fr; }
  .bxd-seg__lista li { grid-template-columns: 32px minmax(0, 1fr); }
  .bxd-seg__lista em { grid-column: 2; }
}
@media (max-width: 560px) {
  .bxd-hero__acao, .bxd__cta { align-self: stretch; }
  .bxd-hero__acao { flex-direction: column; align-items: stretch; }
  .bxd-passo__cena { min-height: 0; padding: 20px 14px; border-radius: var(--nu-r-card); }
}
</style>
