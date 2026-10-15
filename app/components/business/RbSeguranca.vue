<script setup lang="ts">
/**
 * "Seu compliance pergunta. A gente mostra." — segurança em três cards.
 *
 * ENXUGADO EM 15/10/2026, à noite. O dono achou a página com "MUITA
 * informação" e mandou olhar a home da Decade. Três blocos seguidos (filosofia,
 * regras da casa e segurança em quatro frases) viraram este, no formato da
 * seção de filosofia da Decade: título de uma linha e três cards, cada um com
 * um desenho pequeno de interface no alto e duas frases embaixo. O detalhe
 * técnico continua no FAQ (grupo "Segurança, LGPD e responsabilidade"), que é
 * onde o compliance do prospect procura. Os dois perfis de comprador (RbRegras)
 * foram para os dois cards do plano (RbProva).
 *
 * Cada frase continua conferida no código (Backend e mcp-service, 11/10/2026):
 *  - só lê: das ferramentas do servidor, só create_client_invite escreve, e o
 *    convite não dá acesso a nada sem o consentimento;
 *  - aceite e leitura: business_client_consents guarda granted_at,
 *    terms_version, terms_sha256 e user_agent; cada leitura de carteira e cada
 *    cenário sobre ela grava portfolio_read/simulation_run com a chave e a hora,
 *    sem as posições; revogar apaga as posições. ⚠️ O IP NÃO ENTRA NA FRASE:
 *    só é gravado quando o Laravel prova a origem (FRONT_SHARED_KEY nos dois
 *    lados), e em 11/10 a prova deu negativo (CV-01). A prova do aceite por
 *    extenso está no FAQ, que o CV-01 trava;
 *  - modelo: nenhuma chamada de LLM no mcp-service nem no motor; quem responde é
 *    o assistente do escritório.
 * "Cliente só entra com o sim dele" vale com Clientes ligado ou não, e por
 * isso não precisa da etiqueta "na implantação", que acompanha a conexão no
 * scroll (passo 05) e no card do plano.
 */
const CARDS = [
  {
    id: 'le',
    t: 'Só lê.',
    d: 'Nada compra, vende ou transfere. A única ação é o convite ao cliente, que não abre nada sem o aceite dele.',
  },
  {
    id: 'sim',
    t: 'Cliente só entra com o sim dele.',
    d: 'O aceite e cada leitura da carteira ficam registrados. Ele revoga quando quiser, e as posições são apagadas.',
  },
  {
    id: 'ia',
    t: 'A IA é a da sua casa.',
    d: 'Quem responde é o Claude ou o ChatGPT do escritório, no contrato que vocês já têm. A Redentia não treina modelo com o seu dado.',
  },
] as const
</script>

<template>
  <section id="seguranca" class="rbsg">
    <div class="rbsg__head">
      <NuSectionHeading eyebrow="Segurança">
        Seu compliance pergunta.<br>A gente mostra.
      </NuSectionHeading>
    </div>

    <ol class="rbsg__cards">
      <li v-for="(c, i) in CARDS" :key="c.id" class="rbsg__card">
        <!-- O desenho é decorativo e repete o que as duas frases dizem: é o
             "TAX INEFFICIENCY" dos cards da Decade, um pedaço de interface no
             lugar de um parágrafo. -->
        <div class="rbsg__visual" aria-hidden="true">
          <div v-if="c.id === 'le'" class="rbsg__acoes">
            <span class="rbsg__acao rbsg__acao--sim">Ler</span>
            <span class="rbsg__acao">Comprar</span>
            <span class="rbsg__acao">Vender</span>
            <span class="rbsg__acao">Transferir</span>
          </div>

          <div v-else-if="c.id === 'sim'" class="rbsg__aceite">
            <span class="rbsg__ok">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
            <span class="rbsg__aceite-txt">
              <strong>Autorizado pelo cliente</strong>
              <span>até 07/10/2027</span>
            </span>
            <span class="rbsg__revogar">Revogar</span>
          </div>

          <div v-else class="rbsg__ias">
            <span class="rbsg__ia">Claude</span>
            <span class="rbsg__ia">ChatGPT</span>
          </div>
        </div>

        <div class="rbsg__corpo">
          <span class="rbsg__n">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="rbsg__t">{{ c.t }}</h3>
          <p class="rbsg__d">{{ c.d }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.rbsg {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-white);
  padding: clamp(72px, 9vw, 128px) clamp(22px, 5.5vw, 80px);
}
/* Cabeçalho centrado, como o "We invest in decades, not quarters" da Decade. */
.rbsg__head { max-width: 760px; margin-inline: auto; text-align: center; }

.rbsg__cards {
  margin: clamp(44px, 5vw, 64px) auto 0; padding: 0; list-style: none; max-width: 1180px;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(16px, 2vw, 24px);
}
.rbsg__card {
  display: flex; flex-direction: column;
  border: 1px solid var(--nu-cream-line); border-radius: 16px; overflow: clip;
}
/* O alto do card é o palco do desenho: creme, altura fixa, para os três
   desenhos (de alturas diferentes) não desalinharem os títulos. */
.rbsg__visual {
  height: 148px; padding: 0 20px; background: var(--nu-cream);
  display: grid; place-items: center;
}
.rbsg__corpo { padding: clamp(22px, 2.6vw, 30px); }
.rbsg__n {
  color: var(--nu-blue-deep); font-size: var(--nu-fs-sm); font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.rbsg__t {
  margin: 8px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.015em; line-height: 1.25;
}
.rbsg__d { margin: 10px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; }

/* ——— os desenhos ——— */
/* 01: as quatro ações possíveis numa conta, e só a primeira acesa. */
.rbsg__acoes { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.rbsg__acao {
  padding: 6px 12px; border-radius: var(--nu-r-pill);
  border: 1px solid var(--nu-ink-14); background: var(--nu-white);
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700;
  text-decoration: line-through; text-decoration-thickness: 1.5px;
}
.rbsg__acao--sim {
  border-color: var(--nu-blue-deep); background: var(--nu-blue-deep); color: var(--nu-white);
  text-decoration: none;
}

/* 02: a linha do consentimento, como aparece na tela de Clientes. */
.rbsg__aceite {
  width: 100%; max-width: 340px; padding: 14px 16px; border-radius: 12px;
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
  display: flex; align-items: center; gap: 12px;
}
.rbsg__ok {
  flex: none; width: 26px; height: 26px; border-radius: 50%;
  display: grid; place-items: center; background: var(--nu-green-bg); color: var(--nu-green);
}
.rbsg__aceite-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rbsg__aceite-txt strong { color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 700; }
.rbsg__aceite-txt span { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.rbsg__revogar {
  margin-left: auto; flex: none; padding: 5px 10px; border-radius: var(--nu-r-pill);
  border: 1px solid var(--nu-ink-14); color: var(--nu-red); font-size: var(--nu-fs-xs); font-weight: 700;
}

/* 03: os dois assistentes que a casa já contratou. */
.rbsg__ias { display: flex; gap: 10px; }
.rbsg__ia {
  padding: 10px 18px; border-radius: 12px;
  background: var(--nu-white); border: 1px solid var(--nu-cream-line);
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -0.01em;
}

@media (max-width: 900px) {
  .rbsg__cards { grid-template-columns: 1fr; max-width: 560px; }
  .rbsg__visual { height: 120px; }
}
</style>
