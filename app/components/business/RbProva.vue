<script setup lang="ts">
/**
 * "O plano" — a oferta comercial.
 *
 * SEM "PROVA DE CONCEITO" NA SUPERFÍCIE PÚBLICA (decisão do dono 2026-08-01:
 * "isso de POC era relevante apenas para as calls"). A página diz o que o
 * cliente paga e leva. O enquadramento de prova de conceito continua existindo
 * NA CONVERSA comercial, não aqui.
 *
 * PREÇO POR CHAVE, EM FAIXAS (14/10/2026). A tabela é a do contrato de
 * assinatura da Redentia For Business (versão de 13/10/2026, cláusula 4):
 * cada chave ativa paga o preço da faixa em que cai, e a conta é progressiva
 * como imposto de renda, não um preço único para o total. 10 chaves = R$ 5.000;
 * 25 = R$ 9.500; 50 = R$ 14.500 (os exemplos do próprio contrato, que a
 * calculadora tem de reproduzir). Saiu o preço anterior (R$ 2.500 por
 * escritório, até cinco chaves, mensal sem contrato anual): o contrato tem
 * prazo mínimo de 3 meses, garantia de 30 dias, reajuste anual pelo IPCA e
 * vencimento no dia 10. Mudou o contrato, muda FAIXAS e CONDICOES aqui, o FAQ
 * "Quanto custa?" e o card "O plano" do RbHero.
 *
 * PREÇO VISÍVEL (decisão do dono 2026-07-30): filtra quem não tem orçamento
 * antes da reunião. A calculadora vai além: a casa vê o número dela.
 *
 * ÚNICA BANDA NAVY DA PÁGINA. O plano dá três pisos e só (creme é a página,
 * navy é o outro lado, branco é artefato), e gasta o navy aqui: é o momento
 * em que a página para de explicar e faz uma proposta.
 *
 * A calculadora começa em 5 chaves (R$ 2.500), que é o tamanho de mesa mais
 * comum nas calls. Nada de window no setup: o SSR rende o mesmo número que o
 * cliente vê antes de hidratar.
 */
const FAIXAS = [
  { de: 1, ate: 10, preco: 500, rotulo: '1ª à 10ª' },
  { de: 11, ate: 25, preco: 300, rotulo: '11ª à 25ª' },
  { de: 26, ate: 50, preco: 200, rotulo: '26ª à 50ª' },
  { de: 51, ate: Infinity, preco: 150, rotulo: '51ª em diante' },
] as const

const MIN = 1
const MAX = 100
const ATALHOS = [1, 10, 25, 50] as const

const CONDICOES = [
  { rotulo: 'Prazo mínimo', valor: '3 meses, depois renova mês a mês' },
  { rotulo: 'Garantia', valor: 'Cancelou nos primeiros 30 dias, devolvemos tudo' },
  { rotulo: 'Pagamento', valor: 'Mensal, dia 10, boleto ou Pix, com nota fiscal' },
  { rotulo: 'Reajuste', valor: 'Uma vez por ano, pelo IPCA' },
] as const

const INCLUI = [
  {
    rotulo: 'Chaves',
    valor: 'Uma por pessoa',
    nota: 'Nomeadas, ativadas e desativadas no painel do escritório. A mensalidade conta as chaves ativas no início de cada mês.',
  },
  {
    rotulo: 'Cenários',
    valor: 'Em toda chave',
    nota: 'O motor de projeções: cenários estudados pela Redentia, com fontes, ou montados na conversa.',
  },
  {
    rotulo: 'Skills',
    valor: 'Sete',
    nota: 'Prontas para o Claude: primeiros passos, cenário, carteira, comparação de ativos, por que o ativo moveu, clientes e relatório em PDF.',
  },
  {
    rotulo: 'Clientes',
    valor: 'Na implantação',
    nota: 'Clientes conectados por Open Finance, cada um com o próprio consentimento, liberados escritório a escritório.',
  },
] as const

const chaves = ref(5)

function normaliza(v: unknown): number {
  const n = Math.round(Number(v))
  if (!Number.isFinite(n)) return MIN
  return Math.min(MAX, Math.max(MIN, n))
}
function definir(v: unknown) { chaves.value = normaliza(v) }
function passo(d: number) { definir(chaves.value + d) }

/** Quantas chaves caem em cada faixa e quanto cada faixa soma. */
const linhas = computed(() => FAIXAS.map((f) => {
  const qtd = Math.max(0, Math.min(chaves.value, f.ate) - (f.de - 1))
  return { ...f, qtd, subtotal: qtd * f.preco }
}))
const total = computed(() => linhas.value.reduce((s, l) => s + l.subtotal, 0))
const media = computed(() => Math.round(total.value / chaves.value))

const brl = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
</script>

<template>
  <section id="prova" class="rbpv">
    <div class="rbpv__cols">
      <div class="rbpv__intro">
        <NuSectionHeading dark eyebrow="O plano">
          Uma chave por<br>pessoa da mesa.
          <template #dek>
            A primeira custa R$ 500 por mês, e cada nova chave fica mais barata
            conforme a mesa cresce. <strong>Se a mesa não usar nos primeiros 30
            dias</strong>, devolvemos tudo o que foi pago.
          </template>
        </NuSectionHeading>

        <dl class="rbpv__lista">
          <div v-for="c in INCLUI" :key="c.rotulo" class="rbpv__linha">
            <dt class="rbpv__linha-topo">
              <span class="rbpv__rotulo">{{ c.rotulo }}</span>
              <span class="rbpv__valor-linha">{{ c.valor }}</span>
            </dt>
            <dd class="rbpv__nota">{{ c.nota }}</dd>
          </div>
        </dl>

        <p class="rbpv__cap">
          A implantação tem gente da Redentia junto: a conexão de cada chave, as
          skills instaladas e a primeira carteira da casa rodada num cenário.
        </p>
      </div>

      <div class="rbpv__card">
        <span id="rbpv-calc" class="rbpv__label">Quanto custa para a sua mesa</span>

        <p class="rbpv__preco" aria-live="polite" aria-atomic="true">
          <span class="rbpv__moeda">R$</span><span class="rbpv__valor">{{ brl(total) }}</span><span class="rbpv__periodo">/mês</span>
        </p>
        <p class="rbpv__media">
          {{ chaves }} {{ chaves === 1 ? 'chave' : 'chaves' }} · média de R$ {{ brl(media) }} por chave
        </p>

        <div class="rbpv__controle" role="group" aria-labelledby="rbpv-calc">
          <div class="rbpv__stepper">
            <button
              type="button" class="rbpv__passo" :disabled="chaves <= MIN"
              aria-label="Uma chave a menos" @click="passo(-1)"
            >
              −
            </button>
            <label class="rbpv__campo">
              <span class="rbpv__sr">Número de chaves</span>
              <input
                class="rbpv__input" type="number" inputmode="numeric"
                :min="MIN" :max="MAX" step="1" :value="chaves"
                @change="definir(($event.target as HTMLInputElement).value)"
                @input="(($event.target as HTMLInputElement).value !== '') && definir(($event.target as HTMLInputElement).value)"
              >
              <span class="rbpv__unidade" aria-hidden="true">{{ chaves === 1 ? 'chave' : 'chaves' }}</span>
            </label>
            <button
              type="button" class="rbpv__passo" :disabled="chaves >= MAX"
              aria-label="Uma chave a mais" @click="passo(1)"
            >
              +
            </button>
          </div>

          <input
            class="rbpv__range" type="range" :min="MIN" :max="MAX" step="1"
            :value="chaves" aria-label="Número de chaves"
            :aria-valuetext="`${chaves} ${chaves === 1 ? 'chave' : 'chaves'}, R$ ${brl(total)} por mês`"
            @input="definir(($event.target as HTMLInputElement).value)"
          >

          <div class="rbpv__atalhos">
            <button
              v-for="a in ATALHOS" :key="a" type="button" class="rbpv__atalho"
              :class="{ 'rbpv__atalho--on': chaves === a }" :aria-pressed="chaves === a"
              @click="definir(a)"
            >
              {{ a }} {{ a === 1 ? 'chave' : 'chaves' }}
            </button>
          </div>
        </div>

        <table class="rbpv__faixas">
          <caption class="rbpv__sr">Preço por chave, por faixa, e quanto cada faixa soma no total escolhido</caption>
          <thead>
            <tr>
              <th scope="col">Chaves</th>
              <th scope="col">Por chave</th>
              <th scope="col" class="rbpv__num">Na sua conta</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in linhas" :key="l.rotulo" :class="{ 'rbpv__faixa--on': l.qtd > 0 }">
              <th scope="row">{{ l.rotulo }}</th>
              <td>R$ {{ brl(l.preco) }}</td>
              <td class="rbpv__num">
                <template v-if="l.qtd > 0">
                  <span class="rbpv__conta">{{ l.qtd }} × {{ brl(l.preco) }} =</span> R$ {{ brl(l.subtotal) }}
                </template>
                <template v-else>
                  —
                </template>
              </td>
            </tr>
          </tbody>
        </table>

        <dl class="rbpv__condicoes">
          <div v-for="c in CONDICOES" :key="c.rotulo" class="rbpv__cond">
            <dt>{{ c.rotulo }}</dt>
            <dd>{{ c.valor }}</dd>
          </div>
        </dl>

        <a href="#contato" class="rbpv__cta">Começar pelo setup de 1 hora</a>
        <p class="rbpv__rodape">
          O escritório começa com uma chave e ativa as outras quando quiser.
          O setup é uma reunião técnica: conectamos o assistente da mesa e rodamos
          uma carteira de vocês num cenário.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbpv {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-navy);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.rbpv__cols {
  display: flex; gap: clamp(32px, 5vw, 76px);
  align-items: flex-start; flex-wrap: wrap;
}
.rbpv__intro { flex: 1 1 440px; min-width: min(300px, 100%); }
.rbpv__card { flex: 1 1 440px; min-width: min(300px, 100%); }

.rbpv__cap {
  margin: clamp(24px, 3vw, 32px) 0 0; max-width: 480px;
  color: var(--nu-cream-text-55); font-size: 14.5px; font-weight: 600; line-height: 1.6;
}

/* O que vem em toda chave: lista na coluna de texto, para o card ficar só
   com a conta. */
.rbpv__lista { margin: clamp(26px, 3vw, 36px) 0 0; max-width: 520px; }
.rbpv__linha { padding: 16px 0; border-top: 1px solid var(--nu-cream-text-10); }
.rbpv__linha-topo { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; }
.rbpv__rotulo { color: var(--nu-cream-text-55); font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; }
.rbpv__valor-linha { color: var(--nu-cream-text); font-size: 16px; font-weight: 800; white-space: nowrap; }
.rbpv__nota {
  margin: 6px 0 0; color: var(--nu-cream-text-70);
  font-size: 14.5px; font-weight: 500; line-height: 1.6;
}

/* Card sobre navy = --nu-navy-2, a regra de superfície do sistema. Hairline
   de creme translúcido no lugar de sombra. */
.rbpv__card {
  background: var(--nu-navy-2); border: 1px solid var(--nu-cream-text-10);
  border-radius: 16px; padding: clamp(24px, 3.2vw, 38px);
}
.rbpv__label {
  display: block; color: var(--nu-cream-text-55); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.4px;
}
.rbpv__preco {
  margin: 14px 0 0; display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap;
  color: var(--nu-cream-text); font-variant-numeric: tabular-nums;
}
.rbpv__moeda { font-size: clamp(20px, 2vw, 26px); font-weight: 800; }
.rbpv__valor { font-size: clamp(44px, 5vw, 64px); font-weight: 800; letter-spacing: -0.04em; }
.rbpv__periodo {
  margin-left: 4px; color: var(--nu-cream-text-55);
  font-size: clamp(16px, 1.6vw, 19px); font-weight: 700;
}
.rbpv__media {
  margin: 6px 0 0; color: var(--nu-cream-text-70);
  font-size: 14.5px; font-weight: 600; font-variant-numeric: tabular-nums;
}

/* Controles: stepper com campo, régua e atalhos com os exemplos do contrato. */
.rbpv__controle { margin: clamp(20px, 2.6vw, 26px) 0 0; display: grid; gap: 16px; }
.rbpv__stepper { display: flex; align-items: center; gap: 10px; }
.rbpv__passo {
  flex: none; width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid var(--nu-cream-text-22); background: transparent;
  color: var(--nu-cream-text); font-size: 22px; font-weight: 700; line-height: 1;
  cursor: pointer; transition: background .2s, border-color .2s;
}
.rbpv__passo:hover:not(:disabled) { background: var(--nu-cream-text-08); border-color: var(--nu-cream-text-40); }
.rbpv__passo:disabled { opacity: .35; cursor: not-allowed; }
.rbpv__passo:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.rbpv__campo {
  flex: 1 1 auto; display: flex; align-items: baseline; justify-content: center; gap: 8px;
  height: 44px; padding: 0 14px; border-radius: 12px;
  border: 1px solid var(--nu-cream-text-22); background: var(--nu-cream-text-08);
}
.rbpv__campo:focus-within { border-color: var(--nu-blue-soft); }
.rbpv__input {
  width: 4ch; min-width: 0; border: 0; background: transparent; text-align: right;
  color: var(--nu-cream-text); font: inherit; font-size: 20px; font-weight: 800;
  font-variant-numeric: tabular-nums; line-height: 42px; outline: none;
  -moz-appearance: textfield; appearance: textfield;
}
.rbpv__input::-webkit-outer-spin-button,
.rbpv__input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.rbpv__unidade { color: var(--nu-cream-text-55); font-size: 15px; font-weight: 700; }

.rbpv__range { width: 100%; accent-color: var(--nu-blue); cursor: pointer; margin: 0; }
.rbpv__range:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 4px; }

.rbpv__atalhos { display: flex; flex-wrap: wrap; gap: 8px; }
.rbpv__atalho {
  border: 1px solid var(--nu-cream-text-22); background: transparent; color: var(--nu-cream-text-80);
  border-radius: var(--nu-r-pill); padding: 8px 14px; min-height: 36px;
  font-size: 13.5px; font-weight: 700; cursor: pointer; transition: background .2s, color .2s, border-color .2s;
}
.rbpv__atalho:hover { background: var(--nu-cream-text-08); color: var(--nu-cream-text); }
.rbpv__atalho--on { background: var(--nu-blue); border-color: var(--nu-blue); color: var(--nu-white); }
.rbpv__atalho--on:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbpv__atalho:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }

/* Tabela das faixas: a faixa que entra na conta acende; a que não entra fica
   apagada, para a progressão ficar visível sem legenda. */
.rbpv__faixas {
  width: 100%; margin: clamp(22px, 2.8vw, 28px) 0 0; border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}
.rbpv__faixas th, .rbpv__faixas td {
  padding: 11px 0; text-align: left; border-top: 1px solid var(--nu-cream-text-10);
  font-size: 14.5px; color: var(--nu-cream-text-40); font-weight: 600;
}
.rbpv__faixas thead th {
  border-top: 0; padding-top: 0; color: var(--nu-cream-text-55);
  font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px;
}
.rbpv__faixas tbody th { font-weight: 700; }
.rbpv__faixa--on th, .rbpv__faixa--on td { color: var(--nu-cream-text); }
.rbpv__faixa--on td.rbpv__num { font-weight: 800; }
.rbpv__num { text-align: right !important; white-space: nowrap; }
.rbpv__conta { color: var(--nu-cream-text-55); font-weight: 600; }

.rbpv__condicoes {
  margin: clamp(20px, 2.6vw, 26px) 0 0; display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px 22px;
}
.rbpv__cond dt {
  color: var(--nu-cream-text-55); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.2px;
}
.rbpv__cond dd { margin: 4px 0 0; color: var(--nu-cream-text-80); font-size: 14px; font-weight: 600; line-height: 1.5; }

/* Segundo e último azul chapado da página (o primeiro é o do header). */
.rbpv__cta {
  display: flex; align-items: center; justify-content: center; margin: clamp(24px, 3vw, 30px) 0 0;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 16px 26px;
  font-size: 16px; font-weight: 800; text-align: center; transition: background .2s;
}
.rbpv__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbpv__cta:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.rbpv__rodape {
  margin: 16px 0 0; color: var(--nu-cream-text-55);
  font-size: 13.5px; font-weight: 500; line-height: 1.6;
}

.rbpv__sr {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

@media (max-width: 420px) {
  .rbpv__conta { display: none; }
}
</style>
