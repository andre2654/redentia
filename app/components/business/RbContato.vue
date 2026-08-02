<script setup lang="ts">
/**
 * "Contato" — o destino de todos os CTAs da página.
 *
 * SEM FORMULÁRIO, e a razão é técnica: o `ContactForm` do app não tem backend.
 * Ele monta um `mailto:` e mostra "Mensagem enviada com sucesso!" logo depois,
 * tenha o cliente de e-mail aberto ou não. Num lead de MFO isso perde a venda
 * em silêncio, e um formulário que mente é pior que nenhum formulário. Quando
 * existir endpoint de verdade, esta seção ganha o form; até lá, o e-mail é
 * honesto e funciona.
 *
 * A lista do "o que ajuda mandar junto" não é enfeite: são três das sete
 * verificações bloqueantes do plano (V5 forma do portfólio, V7 o relatório
 * cabe num template, e o alvo da POC). Perguntar isso no primeiro e-mail
 * antecipa a qualificação em uma reunião inteira.
 *
 * COPY REVISADA (2026-08-01): só o item 2 ("anonimizado se quiser"). O "a
 * gente" do dek FICA de propósito: é a voz desta página (Fale com a gente),
 * diferente da landing prototipada, que conjugava 1ª do plural.
 */
const EMAIL = 'contato@redentia.com'

const ANTECEDE = [
  'Quantas famílias você atende e por quantos custodiantes o patrimônio delas está espalhado.',
  'Um extrato de exemplo, anonimizado se quiser. É o que diz se a captura funciona no seu caso.',
  'Qual etapa do fechamento dói mais hoje. É ela que vira a tese da prova de conceito.',
]
</script>

<template>
  <section id="contato" class="rbct">
    <div class="rbct__cols">
      <div class="rbct__intro">
        <NuSectionHeading eyebrow="Contato">
          Uma hora<br>pra saber se dá.
          <template #dek>
            O setup é uma reunião técnica, não uma apresentação comercial. A gente
            olha de onde vem o seu dado hoje, escolhe a tese e monta o cronograma.
            <strong>Se não fizer sentido, a reunião termina com isso.</strong>
          </template>
        </NuSectionHeading>

        <a :href="`mailto:${EMAIL}?subject=${encodeURIComponent('Redentia For Business, setup')}`" class="rbct__mail">
          {{ EMAIL }}
        </a>
      </div>

      <div class="rbct__aside">
        <span class="rbct__label">O que ajuda mandar junto</span>
        <ol class="rbct__lista">
          <li v-for="(item, i) in ANTECEDE" :key="i" class="rbct__item">
            <span class="rbct__num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="rbct__texto">{{ item }}</span>
          </li>
        </ol>
        <p class="rbct__nota">
          Nada disso é obrigatório. É só o que faz a primeira conversa valer por duas.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbct {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.rbct__cols {
  display: flex; gap: clamp(32px, 5vw, 76px);
  align-items: flex-start; flex-wrap: wrap;
}
.rbct__intro { flex: 1.15 1 460px; min-width: min(300px, 100%); }
.rbct__aside { flex: 1 1 380px; min-width: min(300px, 100%); }

/* O e-mail É o botão desta seção. A página já gastou as duas manchas de azul
   chapado (header e card da POC), então aqui o azul vem como TEXTO grande com
   sublinhado que engrossa no hover: mesma cor, sem terceira mancha. */
.rbct__mail {
  display: inline-block; margin-top: clamp(28px, 3.5vw, 40px);
  color: var(--nu-blue); font-size: clamp(22px, 3vw, 38px); font-weight: 800;
  letter-spacing: -0.03em; word-break: break-word;
  text-decoration: underline; text-underline-offset: 6px;
  text-decoration-thickness: 2px; transition: text-decoration-thickness .2s, color .2s;
}
.rbct__mail:hover { color: var(--nu-blue-hover); text-decoration-thickness: 4px; }
.rbct__mail:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 4px; }

.rbct__label {
  display: block; color: var(--nu-gray); font-size: 11.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.4px;
}
.rbct__lista { margin: 22px 0 0; padding: 0; list-style: none; }
.rbct__item {
  display: flex; gap: 18px; align-items: flex-start;
  padding: 18px 0; border-top: 1px solid var(--nu-cream-line);
}
.rbct__num {
  color: var(--nu-blue); font-size: 14px; font-weight: 800;
  font-variant-numeric: tabular-nums; flex-shrink: 0; padding-top: 2px;
}
.rbct__texto { color: var(--nu-gray-2); font-size: 15.5px; font-weight: 500; line-height: 1.62; }
.rbct__nota {
  margin: 20px 0 0; color: var(--nu-gray);
  font-size: 13.5px; font-weight: 600; line-height: 1.55;
}
</style>
