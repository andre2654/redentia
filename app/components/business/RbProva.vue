<script setup lang="ts">
/**
 * "Prova de conceito" — a oferta comercial.
 *
 * ÚNICA BANDA NAVY DA PÁGINA. O plano dá três pisos e só (creme é a página,
 * navy é o outro lado, branco é artefato), e gasta o navy aqui: é o momento
 * em que a página para de explicar e faz uma proposta. O footer é o outro
 * navy, e a banda creme do contato separa os dois.
 *
 * PREÇO VISÍVEL (decisão do dono 2026-07-30): R$ 2.500/mês filtra quem não
 * tem orçamento antes da reunião.
 *
 * CAPACIDADE SEM CONTADOR (decisão do dono + PLANO §6.1, que corta dispositivo
 * de escassez): o deck fecha com "3 de 5 vagas restantes". Isso é placar, fica
 * falso no dia seguinte sem alguém pra atualizar, e some daqui. Capacidade
 * vira fato de atendimento, dito uma vez.
 *
 * O QUE A SEÇÃO NÃO PROMETE: o deck anuncia "10 dias úteis recuperados" como
 * retorno. Aqui os 10 dias são o que a POC vai MEDIR, no fechamento do próprio
 * escritório. A diferença entre medir e prometer é a diferença entre um piloto
 * e uma devolução de dinheiro.
 */
const CONTRATO = [
  {
    rotulo: 'Ciclo',
    valor: '60 a 90 dias',
    nota: 'Tempo suficiente pra atravessar dois ou três fechamentos de verdade, que é onde o número aparece.',
  },
  {
    rotulo: 'Escopo',
    valor: 'Uma tese só',
    nota: 'Escolhemos junto a etapa mais cara do seu mês e atacamos ela. POC que tenta tudo não prova nada.',
  },
  {
    rotulo: 'Objetivo',
    valor: 'Um número',
    nota: 'Quantos dias o seu ciclo de fechamento encurtou, medido no seu próprio calendário, contra o mês que você tem hoje.',
  },
]
</script>

<template>
  <section id="prova" class="rbpv">
    <div class="rbpv__cols">
      <div class="rbpv__intro">
        <NuSectionHeading dark eyebrow="Prova de conceito">
          Antes de virar<br>fornecedor.
          <template #dek>
            Um ciclo curto, pago, com escopo de uma tese e
            <strong>um número no fim</strong>. Se o número não aparecer, você
            descobre em 90 dias e não em dois anos de contrato.
          </template>
        </NuSectionHeading>

        <p class="rbpv__cap">
          Rodamos poucas provas de conceito por vez, porque cada uma tem gente
          da Redentia dentro do seu fechamento.
        </p>
      </div>

      <div class="rbpv__card">
        <span class="rbpv__label">O investimento</span>
        <p class="rbpv__preco">
          <span class="rbpv__moeda">R$</span><span class="rbpv__valor">2.500</span><span class="rbpv__periodo">/mês</span>
        </p>

        <dl class="rbpv__lista">
          <div v-for="c in CONTRATO" :key="c.rotulo" class="rbpv__linha">
            <dt class="rbpv__linha-topo">
              <span class="rbpv__rotulo">{{ c.rotulo }}</span>
              <span class="rbpv__valor-linha">{{ c.valor }}</span>
            </dt>
            <dd class="rbpv__nota">{{ c.nota }}</dd>
          </div>
        </dl>

        <a href="#contato" class="rbpv__cta">Começar pelo setup de 1 hora</a>
        <p class="rbpv__rodape">
          O setup é uma reunião técnica pra mapear suas fontes de dado e
          escolher a tese. Sai dela o cronograma, ou a conclusão de que ainda
          não é hora.
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
.rbpv__intro { flex: 1 1 460px; min-width: min(300px, 100%); }
.rbpv__card { flex: 1 1 420px; min-width: min(300px, 100%); }

.rbpv__cap {
  margin: clamp(28px, 3vw, 40px) 0 0; max-width: 480px;
  color: var(--nu-cream-text-55); font-size: 14.5px; font-weight: 600; line-height: 1.6;
}

/* Card sobre navy = --nu-navy-2, a regra de superfície do sistema. Hairline
   de creme translúcido no lugar de sombra. */
.rbpv__card {
  background: var(--nu-navy-2); border: 1px solid var(--nu-cream-text-10);
  border-radius: 16px; padding: clamp(26px, 3.2vw, 38px);
}
.rbpv__label {
  display: block; color: var(--nu-cream-text-55); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.4px;
}
.rbpv__preco {
  margin: 14px 0 0; display: flex; align-items: baseline; gap: 4px;
  color: var(--nu-cream-text); font-variant-numeric: tabular-nums;
}
.rbpv__moeda { font-size: clamp(20px, 2vw, 26px); font-weight: 800; }
.rbpv__valor { font-size: clamp(46px, 5vw, 66px); font-weight: 800; letter-spacing: -0.04em; }
.rbpv__periodo {
  margin-left: 4px; color: var(--nu-cream-text-55);
  font-size: clamp(16px, 1.6vw, 19px); font-weight: 700;
}

.rbpv__lista { margin: clamp(24px, 3vw, 32px) 0 0; }
.rbpv__linha { padding: 18px 0; border-top: 1px solid var(--nu-cream-text-10); }
.rbpv__linha-topo { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; }
.rbpv__rotulo { color: var(--nu-cream-text-55); font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; }
.rbpv__valor-linha { color: var(--nu-cream-text); font-size: 16.5px; font-weight: 800; white-space: nowrap; }
.rbpv__nota {
  margin: 8px 0 0; color: var(--nu-cream-text-70);
  font-size: 14.5px; font-weight: 500; line-height: 1.6;
}

/* Segundo e último azul chapado da página (o primeiro é o do header). Aqui
   ele é o único ponto de saturação sobre a banda escura, então trabalha
   sozinho e não disputa com nada. */
.rbpv__cta {
  display: flex; align-items: center; justify-content: center; margin: clamp(26px, 3vw, 32px) 0 0;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 16px 26px;
  font-size: 16px; font-weight: 800; text-align: center; transition: background .2s;
}
.rbpv__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbpv__cta:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.rbpv__rodape {
  margin: 18px 0 0; color: var(--nu-cream-text-55);
  font-size: 13.5px; font-weight: 500; line-height: 1.6;
}
</style>
