<script setup lang="ts">
/**
 * "Contato" — o fechamento da página e o destino de todos os CTAs (#contato).
 *
 * NO MODELO DO FECHO DA DECADE (15/10/2026, à noite): foto de fundo, uma
 * frase, um botão e mais nada ("Choose your best future."). A lista "o que
 * ajuda mandar junto" saiu da tela e foi para DENTRO do e-mail: o botão abre o
 * cliente de e-mail com as três perguntas já escritas, então a qualificação
 * antecipada continua existindo sem ocupar a página.
 *
 * SEM FORMULÁRIO, e a razão é técnica: o `ContactForm` do app não tem backend.
 * Ele monta um `mailto:` e avisa que o app de e-mail foi aberto, tenha o
 * cliente aberto ou não. Num lead isso perde a venda em silêncio. O endereço
 * fica escrito ao lado do botão para quem não usa cliente de e-mail.
 *
 * A FOTO É FUNDO, NÃO ASSUNTO (alt=""), e é a `sala-vidro`, uma das três sem
 * rosto reconhecível. O arquivo tem 620px (o original tem 765), então em tela
 * larga ela amplia: o scrim navy denso e a granulação da própria foto fazem
 * disso textura. Se chegar foto em alta, troque aqui.
 */
const EMAIL = 'relacionamento@redentia.com.br'

const ASSUNTO = 'Redentia For Business: 1 hora com a mesa'
const CORPO = [
  'Olá! Queremos marcar 1 hora com a Redentia.',
  '',
  'O que ajuda mandar junto (nada é obrigatório):',
  '1. Os ativos que a mesa acompanha:',
  '2. Uma carteira-modelo em pesos, sem nome de cliente:',
  '3. A casa é assessoria ligada a XP ou BTG, family office ou gestora?',
].join('\n')
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent(ASSUNTO)}&body=${encodeURIComponent(CORPO)}`
</script>

<template>
  <section id="contato" class="rbct">
    <img
      src="/business-hero/sala-vidro.webp" alt="" class="rbct__foto"
      width="620" height="620" loading="lazy" decoding="async" fetchpriority="low"
    >
    <span class="rbct__scrim" aria-hidden="true" />

    <div class="rbct__conteudo">
      <h2 class="rbct__titulo">Uma hora pra saber se dá.</h2>
      <p class="rbct__dek">
        A gente conecta o assistente da mesa e roda uma carteira de vocês num
        cenário. Se não fizer sentido, termina aí.
      </p>
      <div class="rbct__acao">
        <a :href="MAILTO" class="rbct__cta">Agendar 1 hora com a gente</a>
        <a :href="`mailto:${EMAIL}`" class="rbct__mail">{{ EMAIL }}</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbct {
  scroll-margin-top: var(--nuh-h, 76px);
  position: relative; isolation: isolate; overflow: clip;
  min-height: min(84vh, 720px);
  display: flex; align-items: center;
  padding: clamp(80px, 10vw, 140px) clamp(22px, 5.5vw, 80px);
  background: var(--nu-navy);
}
.rbct__foto {
  position: absolute; inset: 0; z-index: -2;
  width: 100%; height: 100%; object-fit: cover; object-position: center;
}
/* Mais denso à esquerda, onde mora o texto: o creme sobre a foto precisa do
   piso de contraste em qualquer ponto do título. */
.rbct__scrim {
  position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(90deg, rgba(12, 21, 36, .88) 0%, rgba(12, 21, 36, .72) 50%, rgba(12, 21, 36, .5) 100%);
}

.rbct__conteudo { max-width: 620px; }
.rbct__titulo {
  margin: 0; color: var(--nu-cream-text);
  font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.rbct__dek {
  margin: 22px 0 0; max-width: 46ch; color: var(--nu-cream-text-80);
  font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55;
}

.rbct__acao { display: flex; align-items: center; flex-wrap: wrap; gap: 14px 22px; margin-top: 34px; }
/* O CTA principal da página: azul, pílula, 16px/800 (o mesmo do hero e do plano). */
.rbct__cta {
  display: inline-flex; align-items: center; justify-content: center; min-height: 44px;
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 16px 26px;
  font-size: var(--nu-fs-md); font-weight: 800; transition: background .2s;
}
.rbct__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbct__cta:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.rbct__mail {
  color: var(--nu-cream-text-80); font-size: var(--nu-fs-md); font-weight: 700;
  text-decoration: underline; text-underline-offset: 4px; text-decoration-color: var(--nu-cream-text-35);
  transition: color .2s, text-decoration-color .2s;
}
.rbct__mail:hover { color: var(--nu-white); text-decoration-color: var(--nu-white); }
.rbct__mail:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }

@media (max-width: 760px) {
  .rbct { min-height: 0; }
  .rbct__acao { flex-direction: column; align-items: stretch; }
  .rbct__mail { text-align: center; }
}
</style>
