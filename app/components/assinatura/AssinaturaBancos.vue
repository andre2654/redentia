<script setup lang="ts">
// "Conecte todos os seus bancos." (31/10/2026, pedido do dono: a seção dos
// bancos do /mcp, com a mesma animação, no /assinar e no paywall). A janela
// "Conectar conta" é o McpInstDemo (o seletor do Open Finance escolhendo um
// banco), e embaixo a fila de logos reais de public/instituicoes.
const FILA = ['xp', 'nubank', 'itau', 'btg', 'bradesco', 'santander', 'bb', 'inter', 'rico', 'c6']
</script>

<template>
  <section class="abc" aria-labelledby="abc-titulo">
    <div class="abc__cols">
      <div class="abc__texto">
        <h2 id="abc-titulo" class="abc__titulo">Conecte todos <br>os seus bancos.</h2>
        <p class="abc__dek">
          Pelo <strong>Open Finance</strong>, a conexão oficial regulada pelo Banco Central. XP, Nubank, Itaú,
          BTG, Bradesco, Santander, Banco do Brasil, Inter, Rico, C6 e mais de 100 bancos e corretoras.
        </p>
        <p class="abc__nota">Sempre só leitura: você escolhe o que compartilhar e desconecta quando quiser.</p>
        <div class="abc__acao">
          <AssinaturaConectar origem="bancos" />
        </div>
      </div>
      <div class="abc__lado">
        <McpInstDemo />
      </div>
    </div>
    <div class="abc__fila" aria-hidden="true">
      <span v-for="s in FILA" :key="s" class="abc__ava"><img :src="`/instituicoes/${s}.svg`" alt="" width="28" height="28" loading="lazy"></span>
      <span class="abc__ava abc__ava--mais">+100</span>
    </div>
  </section>
</template>

<style scoped>
.abc { background: var(--nu-cream); padding: clamp(64px, 8.5vw, 112px) clamp(22px, 5.5vw, 80px); }
.abc__cols { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: clamp(32px, 5vw, 80px); align-items: center; }
.abc__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.abc__dek { margin: 20px 0 0; max-width: 56ch; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55; }
.abc__dek strong { color: var(--nu-ink); font-weight: 700; }
.abc__nota { margin: 16px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.abc__acao { margin-top: clamp(26px, 3.2vw, 36px); }
.abc__lado { display: flex; justify-content: center; }

.abc__fila { display: flex; justify-content: center; align-items: center; margin-top: clamp(40px, 5vw, 64px); padding-left: 10px; }
.abc__ava {
  display: grid; place-items: center; width: 48px; height: 48px; margin-left: -10px; overflow: hidden; border-radius: 50%;
  background: var(--nu-white); border: 2.5px solid var(--nu-cream); box-shadow: var(--nu-shadow-card);
}
.abc__ava img { width: 28px; height: 28px; object-fit: contain; }
.abc__ava--mais { background: var(--nu-blue); color: var(--nu-white); font-size: var(--nu-fs-dense); font-weight: 700; letter-spacing: -0.02em; }

@media (max-width: 900px) {
  .abc__cols { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 520px) {
  .abc__ava { width: 38px; height: 38px; margin-left: -11px; }
  .abc__ava img { width: 22px; height: 22px; }
  .abc__titulo br { display: none; }
}
</style>
