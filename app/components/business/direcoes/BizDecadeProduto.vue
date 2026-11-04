<script setup lang="ts">
/**
 * /business, direção 2 (?biz=2): A DECADE COM PRODUTO, refeita em 04/11/2026.
 *
 * O dono escolheu esta direção entre as três ("ficou melhor, mas ainda tá meio
 * merda"), e o diagnóstico do print foi:
 *  - o hero em metades creme e navy era duro, e o cartão do assistente
 *    parecia de celular, pequeno e cortado;
 *  - os passos com foto P&B granulada pareciam banco de imagem, com a
 *    interface minúscula num quadro enorme, em zigue-zague;
 *  - "Duas casas" e "Seu compliance" eram faixas grandes para pouco texto;
 *  - faltava a faixa de números da Brex;
 *  - o rodapé parecia vazio no print (ver o fim deste comentário).
 *
 * O que ficou:
 *  1. HERO, o momento dominante: um fundo escuro só. O título à esquerda e, à
 *     direita, ocupando mais da metade e vazando pela borda, a janela do
 *     assistente em tamanho de computador, com a pergunta "Consolida a
 *     carteira da Mariana." e a tela da carteira do Redentia MCP chegando
 *     consolidada; por trás, em profundidade, o leque dos 2.000 caminhos. Uma
 *     entrada só (useBizEntrada): a pergunta, a carteira consolidando, o leque
 *     se varrendo.
 *  2. OS QUATRO PASSOS, sem foto: telas grandes e nítidas, com borda de janela,
 *     sobre painéis de cor sólida. Cadência 2 + 1 + 1: o convite e o banco do
 *     cliente lado a lado no claro; o cenário em largura cheia no escuro; o
 *     relatório (capa e página dos cenários) em largura cheia num painel azul
 *     claro.
 *  3. CONFIANÇA: uma faixa só, no escuro, com quatro afirmações curtas, cada
 *     uma com um recorte de interface que a prova, e a regra do assessor
 *     vinculado numa linha.
 *  4. NÚMEROS, só fatos da página e do produto: 2.000 caminhos por cenário,
 *     36 bancos e corretoras na tela de conexão do cliente (content/
 *     instituicoes.ts, espelho do config do Backend), R$ 500 por pessoa da
 *     1ª à 10ª e a garantia de 30 dias.
 *  5. O preço (BizPlano), o FAQ e o formulário de hoje, no mesmo ritmo.
 *
 * O RODAPÉ: a linha do Ibovespa estava lá. O print de página inteira era tirado
 * logo depois de a página rolar até o fim, no meio da entrada da linha (2,6 s,
 * que o NuFooterLinha só toca quando a banda chega de fora da tela, e que sai
 * pronta do servidor). Os prints agora esperam a entrada terminar.
 *
 * Telas recortadas fiéis (components/business/telas), dado de exemplo com o
 * rótulo "Exemplo", pregão de 03/11/2026 e motor de 04/11/2026.
 */
import { EXEMPLO_CENARIO as X } from '~/content/business/exemplo-cenario'
import { INSTITUICOES } from '~/content/instituicoes'

const hero = useBizEntrada({ atraso: 400, limiar: 0.15 })
const p1 = useBizEntrada()
const p2 = useBizEntrada()
const p3 = useBizEntrada({ limiar: 0.3 })
const p4 = useBizEntrada({ limiar: 0.3 })

const NUMEROS = [
  { n: X.caminhos.toLocaleString('pt-BR'), r: 'caminhos por cenário' },
  { n: String(INSTITUICOES.length), r: 'bancos e corretoras para conectar' },
  { n: 'R$ 500', r: 'por pessoa, da 1ª à 10ª' },
  { n: '30 dias', r: 'de garantia' },
]
const ctx = (id: string, rotulo: string) => ({ id: `business:${id}`, tipo: 'bloco', rotulo })
</script>

<template>
  <div class="bxd">
    <!-- ——— o hero: o produto trabalhando ——— -->
    <section id="gargalo" v-contexto-chat="ctx('hero', 'A carteira do cliente consolidada no assistente')" class="bxd-hero">
      <div class="bxd-hero__luz" aria-hidden="true" />
      <div class="bxd-hero__texto">
        <p class="bxd-hero__produto">Redentia For Business</p>
        <h1 class="bxd-hero__titulo">Consolide a carteira do seu cliente com 1 clique.</h1>
        <p class="bxd-hero__dek">A carteira, o cenário e o relatório no assistente da sua mesa.</p>
        <div class="bxd-hero__acao">
          <a href="#contato" class="bxd__cta">Agendar 1 hora com a gente</a>
          <span class="bxd-hero__status">Conexão habilitada escritório a escritório, na implantação.</span>
        </div>
      </div>
      <div :ref="(el) => (hero.el.value = el as HTMLElement)" class="bxd-hero__palco">
        <div class="bxd-hero__leque" aria-hidden="true"><BizLeque :tocar="hero.tocar.value" :rotulos="false" /></div>
        <BizJanela class="bxd-hero__janela" tipo="assistente" escuro>
          <div class="bxd-hero__conversa">
            <BizConversa pergunta="Consolida a carteira da Mariana." :tocar="hero.tocar.value">
              <BizTelaCarteira :linhas="3" :tocar="hero.tocar.value" />
            </BizConversa>
          </div>
        </BizJanela>
      </div>
    </section>

    <!-- ——— os passos: telas grandes, sem foto ——— -->
    <section id="produto" class="bxd-passos">
      <header class="bxd-passos__cab">
        <h2 class="bxd__h2">Do convite à reunião.</h2>
        <p class="bxd__dek">Clientes do escritório: habilitado escritório a escritório, na implantação.</p>
      </header>
      <div class="bxd-par">
        <article :ref="(el) => (p1.el.value = el as HTMLElement)" v-contexto-chat="ctx('passo-01', 'Convide o cliente')" class="bxd-painel">
          <div class="bxd-painel__texto">
            <span class="bxd__n">01</span>
            <h3 class="bxd__h3">Convide o cliente.</h3>
            <p class="bxd__p">Um link sai do painel, em nome de quem atende.</p>
          </div>
          <BizJanela class="bxd-painel__janela" endereco="redentia.com.br/business/clientes">
            <BizTelaClientes etapa="convite" :tocar="p1.tocar.value" />
          </BizJanela>
        </article>
        <article :ref="(el) => (p2.el.value = el as HTMLElement)" v-contexto-chat="ctx('passo-02', 'O cliente autoriza no banco dele')" class="bxd-painel">
          <div class="bxd-painel__texto">
            <span class="bxd__n">02</span>
            <h3 class="bxd__h3">Ele autoriza no banco dele.</h3>
            <p class="bxd__p">Pelo Open Finance. Ele revoga quando quiser.</p>
          </div>
          <BizJanela class="bxd-painel__janela" endereco="redentia.com.br/cliente/convite">
            <BizTelaConsentimento :tocar="p2.tocar.value" />
          </BizJanela>
        </article>
      </div>
    </section>

    <section :ref="(el) => (p3.el.value = el as HTMLElement)" v-contexto-chat="ctx('passo-03', `Carteira de exemplo no cenário ${X.cenario}`)" class="bxd-cheio bxd-cheio--escuro">
      <div class="bxd-cheio__texto">
        <span class="bxd__n bxd__n--claro">03</span>
        <h3 class="bxd__h3 bxd__h3--claro">Rode um choque.</h3>
        <p class="bxd__p bxd__p--claro">2.000 caminhos, e quem pesa mais.</p>
      </div>
      <BizJanela class="bxd-cheio__janela" tipo="assistente" escuro>
        <div class="bxd-cheio__conversa">
          <BizConversa pergunta="E se o fiscal piorar depois da eleição?" :tocar="p3.tocar.value">
            <BizTelaCenario :pesos="2" :tocar="p3.tocar.value" />
          </BizConversa>
        </div>
      </BizJanela>
    </section>

    <section :ref="(el) => (p4.el.value = el as HTMLElement)" v-contexto-chat="ctx('passo-04', 'O relatório com a marca do escritório')" class="bxd-rel">
      <div class="bxd-rel__painel">
        <div class="bxd-rel__texto">
          <span class="bxd__n">04</span>
          <h3 class="bxd__h3">Leve o relatório pronto.</h3>
          <p class="bxd__p">Com a marca da casa, para revisar antes de enviar.</p>
        </div>
        <div class="bxd-rel__folhas">
          <span class="bxd-rel__tras" aria-hidden="true" />
          <BizTelaRelatorio class="bxd-rel__folha" :tocar="p4.tocar.value" />
        </div>
      </div>
    </section>

    <!-- ——— confiança: quatro afirmações, cada uma com a prova ——— -->
    <section id="seguranca" v-contexto-chat="ctx('seguranca', 'Segurança do Redentia For Business')" class="bxd-conf">
      <h2 class="bxd__h2 bxd__h2--claro">Seu compliance pergunta.<br>A gente mostra.</h2>
      <p class="bxd__dek bxd__dek--claro">Assessor ligado a XP ou BTG usa sem dado de cliente.</p>
      <ul class="bxd-conf__grade">
        <li class="bxd-conf__item">
          <div class="bxd-conf__prova" aria-hidden="true">
            <span class="bxd-conf__acao bxd-conf__acao--sim">Ler</span><span class="bxd-conf__acao">Comprar</span><span class="bxd-conf__acao">Vender</span><span class="bxd-conf__acao">Transferir</span>
          </div>
          <h3 class="bxd-conf__t">Só lê.</h3>
          <p class="bxd-conf__d">Nada compra, vende ou transfere.</p>
        </li>
        <li class="bxd-conf__item">
          <div class="bxd-conf__prova" aria-hidden="true">
            <div class="bxd-conf__linha"><span class="bxd-conf__ok" /><span><b>Autorizado pelo cliente</b><small>até 07/10/2027</small></span><em>Revogar</em></div>
          </div>
          <h3 class="bxd-conf__t">Com o sim do cliente.</h3>
          <p class="bxd-conf__d">Revoga quando quiser.</p>
        </li>
        <li class="bxd-conf__item">
          <div class="bxd-conf__prova bxd-conf__prova--log" aria-hidden="true">
            <div><b>Carteira consultada</b><small>04/11, 09:12</small></div>
          </div>
          <h3 class="bxd-conf__t">Cada leitura registrada.</h3>
          <p class="bxd-conf__d">Quem leu, o quê e quando.</p>
        </li>
        <li class="bxd-conf__item">
          <div class="bxd-conf__prova" aria-hidden="true"><span class="bxd-conf__ia">Claude</span><span class="bxd-conf__ia">ChatGPT</span></div>
          <h3 class="bxd-conf__t">A IA é a da sua casa.</h3>
          <p class="bxd-conf__d">No contrato do escritório.</p>
        </li>
      </ul>
    </section>

    <!-- ——— os números: só fatos ——— -->
    <section class="bxd-num" aria-label="Em números">
      <div v-for="n in NUMEROS" :key="n.r" class="bxd-num__item">
        <span class="bxd-num__n">{{ n.n }}</span>
        <span class="bxd-num__r">{{ n.r }}</span>
      </div>
    </section>

    <BizPlano />
    <BizFaq />
    <RbContato />
  </div>
</template>

<style scoped>
.bxd { --g: clamp(22px, 5.5vw, 80px); --raio: 28px; background: var(--nu-white); }
.bxd__cta {
  display: inline-flex; align-items: center; justify-content: center; min-height: 50px; padding: 0 28px;
  border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white);
  font-size: var(--nu-fs-md); font-weight: 700; box-shadow: var(--nu-home-sombra-botao); transition: background .2s;
}
.bxd__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.bxd__cta:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 3px; }
.bxd__h2 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.05em; line-height: 1.02; }
.bxd__h2--claro { color: var(--nu-agora-texto); }
.bxd__dek { margin: 14px 0 0; max-width: 52ch; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.bxd__dek--claro { color: var(--nu-agora-sub); }
.bxd__n { color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.bxd__n--claro { color: var(--nu-blue-soft); }
.bxd__h3 { margin: 8px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.04em; line-height: 1.08; }
.bxd__h3--claro { color: var(--nu-agora-texto); font-size: var(--nu-fs-h2-sm); }
.bxd__p { margin: 10px 0 0; max-width: 40ch; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.bxd__p--claro { color: var(--nu-agora-sub); font-size: var(--nu-fs-lg); }

/* ——— hero ——— */
.bxd-hero {
  position: relative; isolation: isolate; overflow: hidden;
  display: grid; grid-template-columns: minmax(360px, 0.72fr) minmax(0, 1fr); align-items: center; gap: clamp(24px, 3vw, 48px);
  min-height: min(calc(100svh - var(--nuh-h, 72px)), 860px);
  padding-left: var(--g);
  background: var(--nu-agora-bg); color: var(--nu-agora-texto);
}
.bxd-hero__luz {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(48% 60% at 74% 42%, color-mix(in srgb, var(--nu-blue) 34%, transparent), transparent 72%),
    linear-gradient(165deg, var(--nu-navy) 0%, var(--nu-agora-bg) 62%);
}
.bxd-hero__texto { padding: clamp(56px, 7vw, 104px) 0; }
.bxd-hero__produto { margin: 0; color: var(--nu-blue-soft); font-size: var(--nu-fs-md); font-weight: 700; }
.bxd-hero__titulo { margin: 16px 0 0; max-width: 11ch; color: var(--nu-agora-texto); font-size: clamp(42px, 5vw, 76px); font-weight: 800; letter-spacing: -0.055em; line-height: .98; }
.bxd-hero__dek { margin: 22px 0 0; max-width: 30ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.45; }
.bxd-hero__acao { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; margin-top: 32px; }
.bxd-hero__status { color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 500; }
.bxd-hero__palco { position: relative; align-self: stretch; min-height: 760px; }
/* o leque por trás, em profundidade: menor, mais acima, um pouco apagado */
.bxd-hero__leque {
  position: absolute; left: 30%; top: 40px; width: 660px; padding: 24px 22px 18px;
  border-radius: var(--nu-r-card); background: var(--nu-agora-cartao); box-shadow: 0 0 0 1px var(--nu-agora-linha);
  opacity: .78; transform: scale(.94); transform-origin: top left;
}
.bxd-hero__janela { position: absolute; left: 0; top: 232px; width: 860px; height: 700px; }
.bxd-hero__conversa { height: 100%; overflow: hidden; }
.bxd-hero__conversa :deep(.bcv), .bxd-cheio__conversa :deep(.bcv) { max-width: 640px; margin: 0 auto; padding: 24px 28px 0; }

/* ——— passos 01 e 02, lado a lado ——— */
.bxd-passos { scroll-margin-top: calc(var(--nuh-h, 72px) + 24px); padding: clamp(80px, 10vw, 136px) var(--g) clamp(56px, 7vw, 96px); }
.bxd-passos__cab { max-width: 760px; margin-bottom: clamp(36px, 4.5vw, 60px); }
.bxd-par { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(16px, 2vw, 24px); }
.bxd-painel {
  display: flex; flex-direction: column; overflow: hidden;
  padding: clamp(28px, 3.4vw, 48px) clamp(24px, 3.4vw, 48px) 0; border-radius: var(--raio); background: var(--nu-cream);
}
.bxd-painel__janela { flex: 1; margin-top: clamp(28px, 3vw, 40px); margin-bottom: -2px; border-bottom-left-radius: 0; border-bottom-right-radius: 0; }

/* ——— passo 03, cheio, no escuro ——— */
.bxd-cheio {
  display: grid; grid-template-columns: minmax(0, 0.62fr) minmax(0, 1.38fr); gap: clamp(28px, 4vw, 72px); align-items: center;
  padding: clamp(72px, 8vw, 120px) 0 0 var(--g); overflow: hidden;
}
.bxd-cheio--escuro { background: var(--nu-agora-bg); }
.bxd-cheio__texto { padding-bottom: clamp(72px, 8vw, 120px); }
.bxd-cheio__janela { border-bottom-left-radius: 0; border-bottom-right-radius: 0; margin-bottom: -2px; }
.bxd-cheio__conversa { height: 720px; overflow: hidden; }

/* ——— passo 04, cheio, no azul claro ——— */
.bxd-rel { padding: clamp(56px, 7vw, 96px) var(--g); }
.bxd-rel__painel {
  display: grid; grid-template-columns: minmax(0, 0.62fr) minmax(0, 1.38fr); gap: clamp(28px, 4vw, 72px); align-items: center;
  padding: clamp(36px, 5vw, 72px); border-radius: var(--raio); background: var(--nu-blue-bg); overflow: hidden;
}
.bxd-rel__folhas { position: relative; width: min(620px, 100%); justify-self: center; padding: 0 0 18px 18px; }
/* as outras páginas do documento, por trás: só papel, sem texto */
.bxd-rel__tras { position: absolute; inset: 18px 0 0 18px; border-radius: 6px; background: var(--nu-white); box-shadow: 0 0 0 1px rgba(12, 21, 36, .08), 0 30px 60px -30px rgba(12, 21, 36, .4); transform: rotate(3deg); }
.bxd-rel__folha { position: relative; }

/* ——— confiança ——— */
.bxd-conf { scroll-margin-top: calc(var(--nuh-h, 72px) + 24px); padding: clamp(80px, 10vw, 136px) var(--g); background: var(--nu-agora-bg); }
.bxd-conf__grade { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: clamp(16px, 2vw, 24px); margin: clamp(40px, 5vw, 64px) 0 0; padding: 0; list-style: none; }
.bxd-conf__item { display: flex; flex-direction: column; }
.bxd-conf__prova {
  height: 168px; display: flex; flex-wrap: wrap; align-content: center; justify-content: center; gap: 8px; padding: 0 18px;
  border-radius: var(--nu-r-panel); background: var(--nu-agora-cartao); box-shadow: 0 0 0 1px var(--nu-agora-linha);
}
.bxd-conf__t { margin: 22px 0 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.035em; line-height: 1.12; }
.bxd-conf__d { margin: 8px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.bxd-conf__acao { padding: 7px 13px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-white-18); color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 700; text-decoration: line-through; }
.bxd-conf__acao--sim { background: var(--nu-blue); box-shadow: none; color: var(--nu-white); text-decoration: none; }
.bxd-conf__linha { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: var(--nu-r-tile); background: var(--nu-white); }
.bxd-conf__ok { flex: none; width: 26px; height: 26px; border-radius: 50%; background: var(--nu-green-bg); box-shadow: inset 0 0 0 6px var(--nu-green-bg), inset 0 0 0 13px var(--nu-green); }
.bxd-conf__linha span:nth-child(2) { display: flex; flex-direction: column; min-width: 0; }
.bxd-conf__linha b { color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 700; }
.bxd-conf__linha small { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.bxd-conf__linha em { margin-left: auto; padding: 4px 10px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-ink-14); color: var(--nu-red-text); font-size: var(--nu-fs-xs); font-style: normal; font-weight: 700; }
.bxd-conf__prova--log { flex-direction: column; flex-wrap: nowrap; align-items: stretch; gap: 0; padding: 0 22px; }
.bxd-conf__prova--log div { display: flex; flex-direction: column; gap: 2px; padding: 12px 0; border-top: 1px solid var(--nu-agora-linha); }
.bxd-conf__prova--log div:first-child { border-top: 0; }
.bxd-conf__prova--log b { color: var(--nu-agora-texto); font-size: var(--nu-fs-dense); font-weight: 700; }
.bxd-conf__prova--log small { color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; }
.bxd-conf__ia { padding: 12px 20px; border-radius: var(--nu-r-tile); background: var(--nu-white); color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; }

/* ——— números ——— */
.bxd-num { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(16px, 3vw, 40px); padding: clamp(56px, 7vw, 96px) var(--g); background: var(--nu-cream); }
.bxd-num__item { display: flex; flex-direction: column; gap: 10px; }
.bxd-num__n { color: var(--nu-ink); font-size: clamp(44px, 5vw, 76px); font-weight: 800; letter-spacing: -0.055em; line-height: 1; font-variant-numeric: tabular-nums; white-space: nowrap; }
.bxd-num__r { max-width: 22ch; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.4; }

:deep(.bzp__titulo), :deep(.rbct__titulo) { font-weight: 800; letter-spacing: -0.05em; }

@media (max-width: 1180px) {
  .bxd-conf__grade { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bxd-rel__painel, .bxd-cheio { grid-template-columns: 1fr; }
  .bxd-cheio { padding-right: var(--g); }
  .bxd-cheio__texto { padding-bottom: 0; }
}
@media (max-width: 1023px) {
  .bxd-hero { grid-template-columns: 1fr; padding-right: var(--g); }
  .bxd-hero__texto { padding-bottom: 8px; }
  .bxd-hero__palco { min-height: 0; }
  .bxd-hero__leque { display: none; }
  .bxd-hero__janela { position: relative; top: auto; width: 100%; height: 560px; margin-bottom: -2px; border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
  .bxd-par { grid-template-columns: 1fr; }
  .bxd-painel { min-height: 0; }
  .bxd-num { grid-template-columns: 1fr 1fr; row-gap: 36px; }
}
@media (max-width: 640px) {
  .bxd-hero__acao, .bxd__cta { align-self: stretch; }
  .bxd-hero__janela { height: 520px; }
  .bxd-hero__conversa :deep(.bcv), .bxd-cheio__conversa :deep(.bcv) { padding: 16px 12px 0; }
  .bxd-cheio__conversa { height: 640px; }
  .bxd-rel__painel { padding: 28px 18px; }
  .bxd-conf__grade { grid-template-columns: 1fr; }
  .bxd-conf__prova { height: 128px; }
  .bxd-num__n { font-size: 40px; }
}
</style>
