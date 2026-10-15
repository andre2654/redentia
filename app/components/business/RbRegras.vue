<script setup lang="ts">
/**
 * "Funciona com a regra da sua casa" — os dois compradores, em bloco curto.
 *
 * Até 15/10/2026 os dois perfis eram o Venn do "Para quem é". O dono pediu o
 * Venn da Decade (assessor x Redentia) e mandou os perfis para um bloco curto
 * mais abaixo (decisão de 15/10). O conteúdo continua o conferido no código em
 * 11/10 (ver o cabeçalho antigo do RbDivisao no git):
 *  - assessoria vinculada: sem dado de cliente; a carteira colada vai sem nome
 *    e não fica salva na conta; nada de extrato de posição ao cliente, que a
 *    RCVM 178, art. 25, VII, veda ao assessor;
 *  - family office e gestora: cliente conectado com o consentimento dele, que
 *    é ligado pela Redentia conta a conta ("na implantação").
 * Nunca "carteira real": omitir a marca de demonstração não autoriza afirmar o
 * contrário dela (CV-19).
 */
const PERFIS = [
  {
    t: 'Assessoria ligada a XP ou BTG',
    d: 'Sem dado de cliente. A lista do escritório, a notícia e o cenário sobre uma carteira colada em pesos, sem nome e sem ficar salva na conta. Nada que vire extrato de posição para o cliente.',
    tag: '',
  },
  {
    t: 'Family office e gestora',
    d: 'Com o cliente dentro. A carteira conectada por Open Finance, com o consentimento dele, o cenário sobre ela e o relatório com a marca da casa.',
    tag: 'na implantação',
  },
]
</script>

<template>
  <section id="regras" class="rbrg">
    <div class="rbrg__cols">
      <h2 class="rbrg__titulo">Funciona com<br>a regra da sua casa.</h2>
      <div class="rbrg__perfis">
        <div v-for="p in PERFIS" :key="p.t" class="rbrg__perfil">
          <h3 class="rbrg__t">{{ p.t }}</h3>
          <p class="rbrg__d">
            {{ p.d }}
            <span v-if="p.tag" class="rbrg__tag">{{ p.tag }}</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbrg {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-cream);
  padding: clamp(56px, 7vw, 88px) clamp(22px, 5.5vw, 80px);
}
.rbrg__cols {
  max-width: 1180px; margin-inline: auto;
  display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(28px, 4vw, 64px);
  align-items: start;
}
.rbrg__titulo {
  margin: 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.035em; line-height: 1.05;
}
.rbrg__perfis { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(20px, 3vw, 40px); }
.rbrg__perfil { padding-top: 18px; border-top: 1px solid var(--nu-ink); }
.rbrg__t { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; }
.rbrg__d { margin: 10px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; }
.rbrg__tag {
  display: inline-block; margin-left: 6px; vertical-align: 2px;
  padding: 3px 8px; border-radius: 5px; background: var(--nu-white);
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700;
  text-transform: uppercase; letter-spacing: .6px; white-space: nowrap;
}

@media (max-width: 900px) {
  .rbrg__cols { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .rbrg__perfis { grid-template-columns: 1fr; }
}
</style>
