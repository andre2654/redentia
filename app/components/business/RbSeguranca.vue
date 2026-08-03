<script setup lang="ts">
/**
 * "Segurança" — quatro fatos verificáveis, sem adjetivo e sem selo.
 *
 * ⚠️ TRAVA DE PUBLICAÇÃO: esta seção descreve a arquitetura decidida no
 * PLANO-REDENTIA-FOR-BUSINESS, e parte dela ainda NÃO EXISTE. O `pg-biz` é o
 * PR5. A revisão de 2026-08-01 reescreveu "Banco separado" como PRÉ-REQUISITO
 * da POC (tempo honesto, alinhado com o FAQ 15 desta página), o que reduz a
 * exposição — mas tirar o noindex antes do PR5 continua decisão do dono, não
 * desta copy.
 *
 * COPY REVISADA E APROVADA (2026-08-01, revisão de conversão): a seção
 * contradizia o FAQ da própria página em três pontos, e o dek promete
 * exatamente "sobreviver a due diligence". (1) "vivem em banco próprio" no
 * presente vs FAQ 15 no futuro → virou pré-requisito declarado. (2) "revogar
 * é imediato" vs FAQ 18 ("até um minuto, não no ato" — o resolve fica 60s em
 * cache, verificado no mcp-service) → o diferencial honesto é o isolamento,
 * não a velocidade. (3) "não manda para modelo nenhum" vs o card do Claude
 * duas seções abaixo → agora explica a demo em vez de contradizê-la.
 *
 * O QUE O DECK DIZ E ESTA SEÇÃO NÃO REPETE — as três estão na lista de
 * afirmações falsas do parecer de compliance:
 *  - "Criptografia de ponta a ponta": TLS e disco cifrado não são E2E, e
 *    chamar de E2E é falso perante um comprador que sabe a diferença.
 *  - "Arquitetura isolada, os dados nunca cruzam com terceiros": hoje são 8
 *    de 72 tabelas com tenant num banco único.
 *  - "Tratando patrimônio como dados médicos": dado financeiro NÃO é dado
 *    sensível na LGPD (art. 5º, II). A analogia soa forte e está errada, e
 *    erra pra cima justamente na frente de quem lê contrato.
 *
 * Também não entram: "CIO as a Service", contador de vagas, e a cláusula de
 * divergência (decisão do dono 2026-07-30: isso é conversa de contrato).
 *
 * Forma (PLANO §6.1): o que era item com check virou o rótulo mais a frase
 * que ele promete, separada por FIO. Sem ícone decorativo, sem check.
 */
const FATOS = [
  {
    rotulo: 'Banco separado',
    texto: 'Os dados do seu escritório entram em banco separado do produto de pessoa física, com o isolamento entre organizações aplicado no próprio banco. É pré-requisito para dado real de escritório entrar, não um upgrade vendido depois.',
  },
  {
    rotulo: 'Chave por assento, com prazo',
    texto: 'Cada pessoa do time acessa com a própria chave, ligada e desligada por quem é dona dela. Quando alguém sai do escritório, desligar a chave dessa pessoa não derruba o resto do time. Validade com prazo obrigatório entra junto com o modelo de organização.',
  },
  {
    rotulo: 'Somente leitura',
    texto: 'A integração lê a sua base e gera relatório. Ela não escreve, não corrige lançamento e não apaga nada. O que entra na sua base continua entrando por você.',
  },
  {
    rotulo: 'Zero IA no caminho do dado',
    texto: 'A Redentia não coloca modelo de IA nenhum no caminho do seu dado, e não treina nada com ele. Quando o seu time pergunta pelo assistente, o modelo é o seu, rodando sob o seu contrato, com o seu registro de uso.',
  },
]
</script>

<template>
  <section id="seguranca" class="rbsg">
    <div class="rbsg__head">
      <NuSectionHeading eyebrow="Segurança">
        O que dá<br>pra verificar.
        <template #dek>
          Quatro afirmações que sobrevivem a uma <strong>due diligence</strong>,
          porque cada uma se checa olhando a arquitetura. Nenhuma delas é selo
          ou adjetivo.
        </template>
      </NuSectionHeading>
    </div>

    <div class="rbsg__grid">
      <div v-for="f in FATOS" :key="f.rotulo" class="rbsg__item">
        <h3 class="rbsg__rotulo">{{ f.rotulo }}</h3>
        <p class="rbsg__texto">{{ f.texto }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbsg {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
/* Cabeçalho em cima e largura de leitura: rompe o ritmo de duas colunas da
   seção anterior de propósito, pra a página não virar uma esteira de
   "narrativa à esquerda, artefato à direita". */
.rbsg__head { max-width: 820px; }

/* Fio, não card: aqui a separação é hairline. O border-top em todos os itens
   dá a régua de documento que o B2B pede, e no mobile (coluna única) ela vira
   uma lista contínua sem nenhum ajuste. */
/* max-width + minmax(420) trava a grade em 2 colunas: com 4 fatos, 3 colunas
   deixam um órfão sozinho na segunda linha. A conta é n×420 + (n-1)×72 ≤ 1180,
   que só fecha até n=2 em qualquer viewport. No mobile o min(420, 100%)
   colapsa pra coluna única e os fios viram uma lista contínua. */
.rbsg__grid {
  margin-top: clamp(44px, 5vw, 64px); max-width: 1180px;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr));
  column-gap: clamp(32px, 5vw, 72px);
}
.rbsg__item { padding: clamp(26px, 3vw, 34px) 0; border-top: 1px solid var(--nu-cream-line); }
.rbsg__rotulo {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(19px, 1.9vw, 23px); font-weight: 800; letter-spacing: -0.02em;
}
.rbsg__texto {
  margin: 12px 0 0; max-width: 46ch; color: var(--nu-gray-2);
  font-size: 16px; font-weight: 500; line-height: 1.65;
}
</style>
