<script setup lang="ts">
/**
 * "Seu compliance pergunta. A gente mostra." — segurança em bloco curto.
 *
 * MUDOU DE PAPEL EM 15/10/2026. Esta seção era o scroll travado "O que dá pra
 * verificar", com cinco provas técnicas (chave, ferramentas, modelo, isolamento,
 * aceite). O dono achou a página técnica demais e pediu o modelo da Decade: o
 * scroll passou a vender o produto (RbJornada) e a segurança virou este bloco,
 * que tranquiliza em quatro frases; o detalhe técnico mora no FAQ (grupo
 * "Segurança, LGPD e responsabilidade"), onde o compliance do prospect procura.
 *
 * Cada frase continua conferida no código (Backend e mcp-service, 11/10/2026):
 *  - só lê: das ferramentas do servidor, só create_client_invite escreve, e o
 *    convite não dá acesso a nada sem o consentimento;
 *  - aceite: business_client_consents guarda granted_at, terms_version,
 *    terms_sha256 e user_agent; revogar apaga as posições. ⚠️ O IP NÃO ENTRA
 *    NA FRASE: só é gravado quando o Laravel prova a origem (FRONT_SHARED_KEY
 *    nos dois lados), e em 11/10 a prova deu negativo (CV-01);
 *  - registro: cada leitura de carteira e cada cenário rodado sobre ela grava
 *    portfolio_read/simulation_run com a chave e a hora, sem as posições;
 *  - modelo: nenhuma chamada de LLM no mcp-service nem no motor; quem responde é
 *    o assistente do escritório.
 * As frases que os testes de compliance travam ("a data, a versão do termo, o
 * hash do texto que o cliente leu e o navegador" e "habilitada escritório a
 * escritório, na implantação") ficam aqui de propósito.
 */
const FATOS = [
  {
    t: 'Nada compra, vende ou transfere.',
    d: 'A Redentia só lê. A única ação possível é o convite de conexão, que não abre nada sem o aceite do cliente.',
  },
  {
    t: 'O cliente entra com o sim dele.',
    d: 'O consentimento guarda a data, a versão do termo, o hash do texto que o cliente leu e o navegador usado. Ele revoga quando quiser, e as posições são apagadas. A conexão com a instituição é habilitada escritório a escritório, na implantação.',
  },
  {
    t: 'Cada leitura fica registrada.',
    d: 'Quem consultou qual carteira, com o nome de quem usou e a hora, sem guardar as posições no registro.',
  },
  {
    t: 'A IA é a da sua casa.',
    d: 'Quem responde é o Claude ou o ChatGPT do escritório, sob o contrato que vocês já têm. A Redentia não treina modelo com o seu dado.',
  },
]
</script>

<template>
  <section id="seguranca" class="rbsg">
    <div class="rbsg__cols">
      <div class="rbsg__intro">
        <NuSectionHeading eyebrow="Segurança">
          Seu compliance pergunta.<br>A gente mostra.
        </NuSectionHeading>
        <a href="#faq" class="rbsg__faq">As respostas completas para o compliance estão nas perguntas frequentes</a>
      </div>
      <ul class="rbsg__fatos">
        <li v-for="f in FATOS" :key="f.t" class="rbsg__fato">
          <h3 class="rbsg__t">{{ f.t }}</h3>
          <p class="rbsg__d">{{ f.d }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.rbsg {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-white);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
}
.rbsg__cols {
  max-width: 1180px; margin-inline: auto;
  display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(28px, 4vw, 64px);
  align-items: start;
}
.rbsg__faq {
  display: inline-block; margin-top: 24px; max-width: 34ch;
  color: var(--nu-blue-deep); font-size: var(--nu-fs-md); font-weight: 700; line-height: 1.5;
  text-decoration: underline; text-underline-offset: 4px;
}
.rbsg__faq:hover { color: var(--nu-blue-hover); }
.rbsg__faq:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

.rbsg__fatos { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 3vw, 40px); }
.rbsg__fato { padding-top: 18px; border-top: 1px solid var(--nu-ink); }
.rbsg__t { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; line-height: 1.3; }
.rbsg__d { margin: 10px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; }

@media (max-width: 900px) {
  .rbsg__cols { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .rbsg__fatos { grid-template-columns: 1fr; }
}
</style>
