<script setup lang="ts">
/**
 * Painel da direita das páginas do CLIENTE FINAL (/cliente/convite e
 * /cliente/acesso), no slot `panel` do NuAuthLayout.
 *
 * Por que não o NuAuthAsidePanel do /login: ele anima "Redentia lendo o
 * mercado" com frases de cotação ilustrativas. Na tela em que uma pessoa
 * decide se o escritório dela pode ver a carteira, número de mercado que não
 * é dado real seria ruído na melhor hipótese e dado falso com cara de real na
 * pior. Aqui só vai o que é verdade sobre o fluxo, em três linhas.
 * Some abaixo de 1020px, como o painel do login.
 */
</script>

<template>
  <aside class="cas" data-auth-side>
    <ol class="cas__lista">
      <li><span class="cas__n">1</span><span>Você lê o termo inteiro e decide. Sem o seu aceite, o link não dá acesso a nada.</span></li>
      <li><span class="cas__n">2</span><span>O escritório vê só posições de investimento. Nada de saldo, cartão ou movimentação.</span></li>
      <li><span class="cas__n">3</span><span>Você vê quem consultou e quando, e revoga com um clique, de graça.</span></li>
    </ol>
    <h2 class="cas__h2">Você decide quem acompanha<br>a sua carteira. E desliga quando quiser.</h2>
  </aside>
</template>

<style scoped>
/* sticky na altura da tela: o termo deixa a coluna do form mais alta que a
   viewport, e o painel esticado jogava a frase-âncora pra longe do olho. */
.cas {
  flex: 1 1 460px; min-width: 0; position: sticky; top: 0; height: 100vh; align-self: flex-start;
  background: radial-gradient(130% 130% at 72% 28%, var(--nu-orb-deep) 0%, var(--nu-orb-black) 72%);
  display: flex; flex-direction: column; justify-content: space-between;
  padding: clamp(40px, 5.5vh, 68px) clamp(28px, 3.5vw, 56px);
  gap: clamp(32px, 5vh, 64px);
}
.cas__lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 22px; max-width: 460px; }
.cas__lista li { display: flex; align-items: flex-start; gap: 14px; color: var(--nu-cream-text-70); font-size: 16px; font-weight: 600; line-height: 1.55; }
.cas__n {
  width: 28px; height: 28px; flex-shrink: 0; margin-top: -1px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  background: var(--nu-cream-text-12); color: var(--nu-cream-text);
  font-size: 13px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.cas__h2 {
  margin: 0; color: var(--nu-cream-text);
  font-size: clamp(28px, 2.6vw, 38px); font-weight: 800; letter-spacing: -.035em; line-height: 1.08;
}
@media (max-width: 1020px) { .cas { display: none; } }
</style>
