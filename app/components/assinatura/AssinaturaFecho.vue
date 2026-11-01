<script setup lang="ts">
// O fecho do /assinar e do paywall (31/10/2026): a promessa do topo em uma
// linha, e o último "Conectar carteira" antes do rodapé.
// Segunda versão, no mesmo dia (o dono achou a faixa azul feia): no creme,
// para não emendar no rodapé navy, com o desenho da frase em cima — os
// logos dos bancos encostados, uma linha que junta todos e a marca da
// Redentia na ponta.
import { INSTITUICOES } from '~/content/instituicoes'

const VITRINE = ['nubank', 'itau', 'bradesco', 'bb', 'santander', 'inter', 'xp', 'btg']
const bancos = VITRINE.map((s) => INSTITUICOES.find((i) => i.slug === s)).filter((i): i is (typeof INSTITUICOES)[number] => !!i && i.logo)
</script>

<template>
  <section class="afc" aria-labelledby="afc-titulo">
    <div class="afc__desenho" aria-hidden="true">
      <ul class="afc__bancos">
        <li v-for="(b, i) in bancos" :key="b.slug" class="afc__banco" :style="{ '--i': i }">
          <ClienteInstLogo :inst="b" :size="30" />
        </li>
      </ul>
      <span class="afc__linha" />
      <span class="afc__marca">
        <svg width="28" height="28" viewBox="0 0 24 24"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="currentColor" /><path d="M12 8.2 15.8 12 12 15.8 8.2 12Z" fill="var(--nu-blue)" /></svg>
      </span>
    </div>

    <h2 id="afc-titulo" class="afc__titulo">Todos os seus investimentos. <span>Numa tela só.</span></h2>
    <p class="afc__dek">Conecte em um minuto e veja hoje a sua carteira inteira, de todos os bancos.</p>
    <div class="afc__acao">
      <AssinaturaConectar origem="fecho" />
    </div>
  </section>
</template>

<style scoped>
.afc {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  background: var(--nu-white); padding: clamp(72px, 9vw, 128px) clamp(22px, 5.5vw, 80px);
}

/* o desenho: os bancos encostados → a linha → a marca */
.afc__desenho { display: flex; align-items: center; gap: 0; }
.afc__bancos { list-style: none; margin: 0; padding: 0 0 0 10px; display: flex; }
.afc__banco {
  display: grid; place-items: center; width: 50px; height: 50px; margin-left: -10px; border-radius: 50%;
  background: var(--nu-white); box-shadow: 0 0 0 3px var(--nu-white), 0 0 0 4px var(--nu-cream-line), var(--nu-shadow-pos-nav);
  animation: afc-entra .5s cubic-bezier(.22, 1, .36, 1) calc(var(--i) * 50ms) backwards;
}
.afc__banco :deep(.cil) { border: 0; border-radius: 8px; }
.afc__linha {
  width: clamp(40px, 7vw, 96px); height: 2px; margin: 0 10px 0 14px; border-radius: 2px;
  background: linear-gradient(90deg, var(--nu-cream-line), var(--nu-blue));
}
.afc__marca {
  display: grid; place-items: center; width: 64px; height: 64px; flex-shrink: 0; border-radius: 20px;
  background: var(--nu-blue); color: var(--nu-white); box-shadow: 0 18px 36px -18px var(--nu-blue-30);
}
@keyframes afc-entra { from { opacity: 0; transform: translateX(-12px); } }

.afc__titulo {
  margin: clamp(32px, 4vw, 48px) 0 0; max-width: 22ch; color: var(--nu-ink);
  font-size: clamp(36px, 5.2vw, 72px); font-weight: 800; letter-spacing: -0.045em; line-height: 1.02; text-wrap: balance;
}
.afc__titulo span { display: block; color: var(--nu-blue); }
.afc__dek { margin: 20px 0 0; max-width: 44ch; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; text-wrap: balance; }
.afc__acao { margin-top: clamp(28px, 3.6vw, 40px); }

@media (max-width: 520px) {
  .afc__banco { width: 40px; height: 40px; margin-left: -11px; }
  .afc__banco :deep(.cil) { width: 24px !important; height: 24px !important; }
  .afc__marca { width: 52px; height: 52px; border-radius: 16px; }
  .afc__linha { margin: 0 8px 0 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .afc__banco { animation: none; }
}
</style>
