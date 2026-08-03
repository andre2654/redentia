<script setup lang="ts">
/**
 * "O plano" — a oferta comercial.
 *
 * SEM "PROVA DE CONCEITO" NA SUPERFÍCIE PÚBLICA (decisão do dono 2026-08-01:
 * "isso de POC era relevante apenas para as calls"). A página diz o que o
 * cliente paga e leva: R$ 2.500/mês por escritório, mensal, sem contrato
 * anual, até cinco chaves pro time sem custo por assento. O enquadramento de prova de
 * conceito continua existindo NA CONVERSA comercial, não aqui.
 *
 * ÚNICA BANDA NAVY DA PÁGINA. O plano dá três pisos e só (creme é a página,
 * navy é o outro lado, branco é artefato), e gasta o navy aqui: é o momento
 * em que a página para de explicar e faz uma proposta. O footer é o outro
 * navy, e a banda creme do contato separa os dois.
 *
 * PREÇO VISÍVEL (decisão do dono 2026-07-30): R$ 2.500/mês filtra quem não
 * tem orçamento antes da reunião.
 *
 * COPY REVISADA E APROVADA (2026-08-01, revisão de conversão): "POC" era a
 * única sigla não apresentada da página e virou "prova de conceito" (o
 * trocadilho até melhora); "poucas por vez" virou "cinco por trimestre",
 * amarrando com o trilho do topo e com o FAQ 27; e "O investimento" virou
 * "O preço", porque eufemismo de pitch-deck destoa de uma página que constrói
 * confiança falando seco. A anáfora de "número" (4x) é deliberada e FICA.
 *
 * CAPACIDADE SEM CONTADOR *NESTA SEÇÃO* (decisão do dono + PLANO §6.1): o deck
 * fecha com "3 de 5 vagas restantes"; aqui capacidade é fato de atendimento,
 * dito uma vez. O placar EXISTE na página, mas mora num lugar só — o trilho
 * RbCapacidade do topo, que o dono pediu de volta em 2026-08-01 e que carrega
 * a regra de atualização manual. Não duplique o número aqui: dois placares é
 * duas chances de mentir.
 *
 * O QUE A SEÇÃO NÃO PROMETE: o deck anuncia "10 dias úteis recuperados" como
 * retorno. Aqui os 10 dias são o que a implantação vai MEDIR, no fechamento do
 * próprio escritório. A diferença entre medir e prometer é a diferença entre
 * um piloto e uma devolução de dinheiro.
 */
const INCLUI = [
  {
    rotulo: 'Chaves',
    valor: 'Até cinco',
    nota: 'Cinco chaves nomeadas para a casa, geradas e revogadas no painel do escritório, sem custo por assento.',
  },
  {
    rotulo: 'Setup',
    valor: '1 hora',
    nota: 'Reunião técnica pra mapear as fontes de dado da casa e conectar os assistentes do time.',
  },
  {
    rotulo: 'Foco',
    valor: 'Uma tese',
    nota: 'Escolhemos junto a etapa mais cara do seu mês e atacamos ela primeiro. Quem tenta tudo de uma vez não fecha nada.',
  },
]
</script>

<template>
  <section id="prova" class="rbpv">
    <div class="rbpv__cols">
      <div class="rbpv__intro">
        <NuSectionHeading dark eyebrow="O plano">
          Mensal, sem<br>contrato anual.
          <template #dek>
            Um preço por escritório, com até cinco chaves dentro e
            <strong>um número no fim de cada mês</strong>. Se o número não
            aparecer, você cancela no mês seguinte, não em dois anos.
          </template>
        </NuSectionHeading>

        <p class="rbpv__cap">
          Ativamos cinco escritórios por trimestre, porque cada implantação tem
          gente da Redentia dentro do seu fechamento.
        </p>
      </div>

      <div class="rbpv__card">
        <span class="rbpv__label">O preço</span>
        <p class="rbpv__preco">
          <span class="rbpv__moeda">R$</span><span class="rbpv__valor">2.500</span><span class="rbpv__periodo">/mês</span>
        </p>

        <dl class="rbpv__lista">
          <div v-for="c in INCLUI" :key="c.rotulo" class="rbpv__linha">
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
          escolher por onde começar. Sai dela o cronograma, ou a conclusão de
          que ainda não é hora.
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
