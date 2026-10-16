<script setup lang="ts">
/**
 * "O plano" — a oferta comercial.
 *
 * DOIS CARDS, COMO O PREÇO DA DECADE (15/10/2026, à noite). O dono achou a
 * página com "MUITA informação". A seção tinha calculadora com régua e atalhos,
 * tabela de faixas, quatro itens com nota, quatro condições e dois rodapés.
 * Virou o desenho da Decade: um card claro com o preço e uma lista curta, e um
 * card escuro para o caso especial. Os dois perfis de comprador, que eram o
 * bloco RbRegras, moram aqui:
 *  - card claro: o plano de toda mesa, e a linha "Funciona sem dado de
 *    cliente" é a resposta da assessoria ligada a XP ou BTG (a RCVM 178, art.
 *    25, VII, veda ao assessor enviar extrato de posições);
 *  - card escuro: family office e gestora, com o cliente dentro. A frase de
 *    status é a que o CV-19 trava ("habilitada escritório a escritório, na
 *    implantação"): Clientes é ligado pela Redentia conta a conta.
 * Não escrever "sem comissão": a /metodologia declara links de afiliado no site
 * de investidores.
 *
 * SEM "PROVA DE CONCEITO" NA SUPERFÍCIE PÚBLICA (decisão do dono 2026-08-01:
 * "isso de POC era relevante apenas para as calls").
 *
 * PREÇO POR PESSOA (CHAVE), EM FAIXAS (14/10/2026). A tabela é a do contrato
 * de assinatura da Redentia For Business (versão de 13/10/2026, cláusula 4):
 * cada pessoa ativa paga o preço da faixa em que cai, e a conta é progressiva
 * como imposto de renda, não um preço único para o total. 10 pessoas =
 * R$ 5.000; 25 = R$ 9.500; 50 = R$ 14.500 (os exemplos do próprio contrato,
 * que a calculadora tem de reproduzir). O contrato tem prazo mínimo de 3
 * meses, garantia de 30 dias, reajuste anual pelo IPCA e vencimento no dia 10
 * (este último só no FAQ "Quanto custa?"). Mudou o contrato, muda FAIXAS aqui,
 * o FAQ e o card "Por pessoa da mesa" do RbHero.
 *
 * PREÇO VISÍVEL (decisão do dono 2026-07-30): filtra quem não tem orçamento
 * antes da reunião. A calculadora (pedido do dono, 14/10/2026) mostra o número
 * da casa e a conta por faixa, numa linha.
 *
 * A calculadora começa em 5 pessoas (R$ 2.500), que é o tamanho de mesa mais
 * comum nas calls. Nada de window no setup: o SSR rende o mesmo número que o
 * cliente vê antes de hidratar.
 */
const FAIXAS = [
  { de: 1, ate: 10, preco: 500, rotulo: '1ª a 10ª' },
  { de: 11, ate: 25, preco: 300, rotulo: '11ª a 25ª' },
  { de: 26, ate: 50, preco: 200, rotulo: '26ª a 50ª' },
  { de: 51, ate: Infinity, preco: 150, rotulo: '51ª ou mais' },
] as const

const MIN = 1
const MAX = 100

const INCLUI = [
  'Um acesso por pessoa da mesa',
  'Cenários para toda a mesa',
  'Sete rotinas prontas no Claude',
  'Funciona sem dado de cliente',
  'Garantia de 30 dias',
] as const

const pessoas = ref(5)

function normaliza(v: unknown): number {
  const n = Math.round(Number(v))
  if (!Number.isFinite(n)) return MIN
  return Math.min(MAX, Math.max(MIN, n))
}
function definir(v: unknown) { pessoas.value = normaliza(v) }
function passo(d: number) { definir(pessoas.value + d) }

/** Quantas pessoas caem em cada faixa e quanto cada faixa soma. */
const linhas = computed(() => FAIXAS.map((f) => {
  const qtd = Math.max(0, Math.min(pessoas.value, f.ate) - (f.de - 1))
  return { ...f, qtd, subtotal: qtd * f.preco }
}))
const total = computed(() => linhas.value.reduce((s, l) => s + l.subtotal, 0))

const brl = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
/** A conta por faixa numa linha: "10 × R$ 500 + 5 × R$ 300". */
const conta = computed(() => linhas.value
  .filter((l) => l.qtd > 0)
  .map((l) => `${l.qtd} × R$ ${brl(l.preco)}`)
  .join(' + '))
const rotuloPessoas = (n: number) => `${n} ${n === 1 ? 'pessoa' : 'pessoas'}`
</script>

<template>
  <section id="prova" class="rbpv">
    <div class="rbpv__head">
      <NuSectionHeading eyebrow="O plano">
        Sem produto pra empurrar.
        <template #dek>
          O preço é por pessoa da mesa e não muda com o que o seu cliente compra.
        </template>
      </NuSectionHeading>
    </div>

    <div class="rbpv__cards">
      <!-- ——— o plano, com a calculadora ——— -->
      <div class="rbpv__card">
        <span id="rbpv-calc" class="rbpv__nome">Redentia For Business</span>

        <p class="rbpv__preco" aria-live="polite" aria-atomic="true">
          <span class="rbpv__moeda">R$</span><span class="rbpv__valor">{{ brl(total) }}</span><span class="rbpv__periodo">/mês</span>
        </p>
        <p class="rbpv__conta">
          {{ rotuloPessoas(pessoas) }} · {{ conta }}
        </p>

        <div class="rbpv__controle" role="group" aria-labelledby="rbpv-calc">
          <div class="rbpv__stepper">
            <button
              type="button" class="rbpv__passo" :disabled="pessoas <= MIN"
              aria-label="Uma pessoa a menos" @click="passo(-1)"
            >
              −
            </button>
            <label class="rbpv__campo">
              <span class="rbpv__sr">Pessoas na mesa</span>
              <input
                class="rbpv__input" type="number" inputmode="numeric"
                :min="MIN" :max="MAX" step="1" :value="pessoas"
                @change="definir(($event.target as HTMLInputElement).value)"
                @input="(($event.target as HTMLInputElement).value !== '') && definir(($event.target as HTMLInputElement).value)"
              >
              <span class="rbpv__unidade" aria-hidden="true">{{ pessoas === 1 ? 'pessoa' : 'pessoas' }}</span>
            </label>
            <button
              type="button" class="rbpv__passo" :disabled="pessoas >= MAX"
              aria-label="Uma pessoa a mais" @click="passo(1)"
            >
              +
            </button>
          </div>

          <input
            class="rbpv__range" type="range" :min="MIN" :max="MAX" step="1"
            :value="pessoas" aria-label="Pessoas na mesa"
            :aria-valuetext="`${rotuloPessoas(pessoas)}, R$ ${brl(total)} por mês`"
            @input="definir(($event.target as HTMLInputElement).value)"
          >
        </div>

        <!-- As faixas do contrato, em quatro casas: a que entra na conta acende. -->
        <ul class="rbpv__faixas" aria-label="Preço por pessoa, por faixa">
          <li v-for="l in linhas" :key="l.rotulo" class="rbpv__faixa" :class="{ 'rbpv__faixa--on': l.qtd > 0 }">
            <span class="rbpv__faixa-de">{{ l.rotulo }}</span>
            <span class="rbpv__faixa-preco">R$ {{ brl(l.preco) }}</span>
          </li>
        </ul>

        <ul class="rbpv__inclui">
          <li v-for="item in INCLUI" :key="item" class="rbpv__item">
            <svg class="rbpv__check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            {{ item }}
          </li>
        </ul>

        <a href="#contato" class="rbpv__cta">Agendar 1 hora com a gente</a>
        <p class="rbpv__fino">Prazo mínimo de 3 meses, depois mês a mês. Reajuste anual pelo IPCA.</p>
      </div>

      <!-- ——— o caso especial, no card escuro (o "Decade Wealth" de lá) ——— -->
      <div class="rbpv__card rbpv__card--navy">
        <span class="rbpv__nome">Family office e gestora</span>
        <p class="rbpv__titulo">Com o cliente dentro.</p>
        <p class="rbpv__status">
          <span class="rbpv__ponto" aria-hidden="true" />
          Habilitada escritório a escritório, na implantação.
        </p>
        <p class="rbpv__texto">
          A carteira de cada cliente conectada por Open Finance, com o
          consentimento dele. O cenário roda sobre ela, e o relatório sai com a
          marca da casa.
        </p>
        <a href="#contato" class="rbpv__cta rbpv__cta--contorno">Falar com a gente</a>
        <!-- O fio vertical que esmaece é o fundo do card escuro da Decade, e
             rima com a hachura do Venn. Ocupa a sobra do card ao lado do plano. -->
        <span class="rbpv__textura" aria-hidden="true" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbpv {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-cream);
  padding: clamp(72px, 9vw, 128px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
/* Cabeçalho centrado e curto, como o "Pricing that's 100% aligned with you". */
.rbpv__head { max-width: 760px; margin-inline: auto; text-align: center; }
.rbpv__head :deep(.nsh__dek) { margin-inline: auto; }

.rbpv__cards {
  margin: clamp(40px, 5vw, 60px) auto 0; max-width: 960px;
  display: grid; grid-template-columns: 1fr 1fr; gap: clamp(16px, 2vw, 24px);
  align-items: stretch;
}
.rbpv__card {
  display: flex; flex-direction: column;
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
  border-radius: 16px; padding: clamp(24px, 3vw, 36px);
}
.rbpv__nome { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; }

.rbpv__preco {
  margin: 14px 0 0; display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap;
  color: var(--nu-ink); font-variant-numeric: tabular-nums;
}
.rbpv__moeda { font-size: var(--nu-fs-2xl); font-weight: 800; }
.rbpv__valor { font-size: clamp(40px, 4.4vw, 56px); font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
.rbpv__periodo { margin-left: 4px; color: var(--nu-gray); font-size: var(--nu-fs-lg); font-weight: 700; }
.rbpv__conta {
  margin: 8px 0 0; color: var(--nu-gray);
  font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums;
}

/* Controles: stepper com campo e régua. */
.rbpv__controle { margin: 20px 0 0; display: grid; gap: 14px; }
.rbpv__stepper { display: flex; align-items: center; gap: 10px; }
.rbpv__passo {
  flex: none; width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid var(--nu-ink-14); background: transparent;
  color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 700; line-height: 1;
  cursor: pointer; transition: background .2s, border-color .2s;
}
.rbpv__passo:hover:not(:disabled) { background: var(--nu-cream); border-color: var(--nu-ink-30); }
.rbpv__passo:active:not(:disabled) { transform: translateY(1px); }
.rbpv__passo:disabled { opacity: .4; cursor: not-allowed; }
.rbpv__passo:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.rbpv__campo {
  flex: 1 1 auto; display: flex; align-items: baseline; justify-content: center; gap: 8px;
  height: 44px; padding: 0 14px; border-radius: 12px;
  border: 1px solid var(--nu-ink-14); background: var(--nu-cream);
}
.rbpv__campo:focus-within { border-color: var(--nu-blue); }
.rbpv__input {
  width: 4ch; min-width: 0; border: 0; background: transparent; text-align: right;
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-xl); font-weight: 800;
  font-variant-numeric: tabular-nums; line-height: 42px; outline: none;
  -moz-appearance: textfield; appearance: textfield;
}
.rbpv__input::-webkit-outer-spin-button,
.rbpv__input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.rbpv__unidade { color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 700; }

.rbpv__range { width: 100%; accent-color: var(--nu-blue); cursor: pointer; margin: 0; }
.rbpv__range:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 4px; }

/* As quatro faixas: a que entra na conta fica em tinta, a que não entra fica
   apagada, e a progressão aparece sem legenda. */
.rbpv__faixas {
  margin: 18px 0 0; padding: 0; list-style: none;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
  font-variant-numeric: tabular-nums;
}
.rbpv__faixa {
  display: flex; flex-direction: column; gap: 2px;
  padding: 10px 10px 9px; border-radius: 10px; border: 1px solid var(--nu-cream-line);
}
.rbpv__faixa-de { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.rbpv__faixa-preco { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; }
.rbpv__faixa--on { border-color: var(--nu-ink-30); background: var(--nu-cream); }
.rbpv__faixa--on .rbpv__faixa-preco { color: var(--nu-ink); font-weight: 800; }

.rbpv__inclui { margin: 22px 0 0; padding: 0; list-style: none; display: grid; gap: 10px; }
.rbpv__item {
  display: flex; align-items: center; gap: 10px;
  color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.4;
}
.rbpv__check { flex: none; color: var(--nu-blue-deep); }

/* O estilo do CTA principal da página inteira: azul, pílula, 16px/800. */
.rbpv__cta {
  display: flex; align-items: center; justify-content: center; margin: 26px 0 0;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 16px 26px; min-height: 44px;
  font-size: var(--nu-fs-md); font-weight: 800; text-align: center; transition: background .2s;
}
.rbpv__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbpv__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.rbpv__fino {
  margin: 12px 0 0; text-align: center; color: var(--nu-gray);
  font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5;
}

/* ——— o card escuro ——— */
.rbpv__card--navy { background: var(--nu-navy); border-color: var(--nu-navy); overflow: clip; }
.rbpv__card--navy .rbpv__nome { color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 700; }
.rbpv__titulo {
  margin: 12px 0 0; color: var(--nu-cream-text);
  font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;
}
.rbpv__status {
  margin: 14px 0 0; display: flex; align-items: flex-start; gap: 8px;
  color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5;
}
/* alinhado à primeira linha, não ao meio do bloco: no celular a frase quebra */
.rbpv__ponto { flex: none; width: 7px; height: 7px; margin-top: 7px; border-radius: 50%; background: var(--nu-blue-soft); }
.rbpv__texto {
  margin: 20px 0 0; color: var(--nu-cream-text-80);
  font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6;
}
/* O CTA do card escuro é de contorno: o botão chapado da seção é o do plano. */
.rbpv__cta--contorno {
  background: transparent; color: var(--nu-cream-text);
  border: 1px solid var(--nu-cream-text-40);
}
.rbpv__textura {
  flex: 1 1 auto; min-height: 0;
  margin: 32px calc(-1 * clamp(24px, 3vw, 36px)) calc(-1 * clamp(24px, 3vw, 36px));
  background: repeating-linear-gradient(90deg, var(--nu-cream-text-12) 0 1px, transparent 1px 7px);
  -webkit-mask-image: linear-gradient(to top, #000 0%, transparent 100%);
  mask-image: linear-gradient(to top, #000 0%, transparent 100%);
}
.rbpv__cta--contorno:hover { background: var(--nu-cream-text-08); color: var(--nu-white); }
.rbpv__cta--contorno:focus-visible { outline-color: var(--nu-blue-soft); }

.rbpv__sr {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

@media (max-width: 820px) {
  .rbpv__cards { grid-template-columns: 1fr; max-width: 520px; }
}
@media (max-width: 420px) {
  .rbpv__faixas { grid-template-columns: 1fr 1fr; }
}
</style>
