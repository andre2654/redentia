<script setup lang="ts">
// "Seus bancos. Uma carteira." (21/10/2026): a banda azul da home
// para quem ainda não tem conta, refeita no jeito das páginas de produto da
// Apple (dono: "pense o que um profissional sênior de produto e um designer
// sênior da Apple fariam aqui"). Uma ideia só, conectar a carteira, e o
// produto como objeto: a miniatura do /carteira se montando banco a banco
// (CarteiraMontagem), no lugar da foto de banco de imagem (1,6 MB, um terço do
// peso da home na auditoria de 15/10). O card do Redentia MCP saiu daqui:
// disputava a mesma banda com outra ideia, e o MCP tem a página dele.
// A linha de segurança responde a objeção de quem conecta o banco, com o que o
// próprio /carteira promete (leitura regulada pelo Banco Central, sem mexer no
// dinheiro). O botão abre a folha de cadastro (gesto 'carteira'); sem
// JavaScript, o link leva ao /login e volta ao /carteira.
const { isAuthenticated } = useAuthState()
const folha = useCadastroFolha()

function conectar() {
  if (isAuthenticated.value) return navigateTo('/carteira')
  folha.abrir({ gesto: 'carteira' }, () => true, '/carteira', () => navigateTo('/carteira'))
}
</script>

<template>
  <section class="mcc" aria-labelledby="mcc-titulo">
    <div class="mcc__luz" aria-hidden="true" />
    <div class="mcc__cols">
      <div class="mcc__texto">
        <h2 id="mcc-titulo" class="mcc__title">Seus bancos.<br>Uma carteira.</h2>
        <p class="mcc__dek">
          Sem planilha e sem digitar nada. Conecte pelo Open Finance e a Redentia junta ações, FIIs, renda fixa e ETFs de mais de 110 bancos e corretoras, com o que mexeu hoje.
        </p>
        <!-- <a> e não NuxtLink: o RouterLink navegaria mesmo com o .prevent, e a folha fecharia -->
        <a href="/login?redirect=%2Fcarteira" class="mcc__cta" @click.prevent="conectar">
          Conectar minha carteira
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
        <p class="mcc__seguro">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>
          Só leitura, pelo Open Finance regulado pelo Banco Central. A Redentia não movimenta o seu dinheiro.
        </p>
      </div>
      <div class="mcc__objeto">
        <CarteiraMontagem />
      </div>
    </div>
  </section>
</template>

<style scoped>
.mcc {
  position: relative; isolation: isolate; overflow: hidden;
  padding: clamp(64px, 8vw, 112px) clamp(22px, 5.5vw, 80px);
  background: var(--nu-blue); color: var(--nu-white);
}
/* uma luz só, atrás da carteira */
.mcc__luz {
  position: absolute; z-index: -1; right: -8%; top: 50%; width: min(820px, 90vw); aspect-ratio: 1; transform: translateY(-50%);
  border-radius: 50%; background: radial-gradient(closest-side, rgba(255, 255, 255, 0.32), rgba(158, 200, 255, 0.16) 55%, transparent);
  filter: blur(20px); pointer-events: none;
}
.mcc__cols {
  display: grid; grid-template-columns: 1fr; gap: clamp(40px, 5vw, 72px); align-items: center;
  max-width: 1180px; margin: 0 auto;
}
.mcc__texto { min-width: 0; max-width: 520px; }
.mcc__title {
  margin: 0; color: var(--nu-white); font-size: var(--nu-fs-h2); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.02;
}
.mcc__dek { margin: 22px 0 0; color: var(--nu-white-75); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.55; }
.mcc__cta {
  display: inline-flex; align-items: center; gap: 10px; height: 56px; margin-top: 32px; padding: 0 28px;
  border-radius: var(--nu-r-pill); background: var(--nu-white); color: var(--nu-blue);
  font-size: var(--nu-fs-md); font-weight: 700; box-shadow: 0 14px 40px -12px rgba(10, 16, 48, 0.45);
  transition: transform .2s ease, box-shadow .25s ease, color .2s ease;
}
.mcc__cta svg { transition: transform .2s ease; }
.mcc__cta:hover { color: var(--nu-blue-hover); transform: translateY(-1px); box-shadow: 0 18px 48px -12px rgba(10, 16, 48, 0.55); }
.mcc__cta:hover svg { transform: translateX(3px); }
.mcc__cta:focus-visible { outline: 3px solid var(--nu-white); outline-offset: 3px; }
.mcc__seguro {
  display: flex; align-items: flex-start; gap: 8px; max-width: 440px; margin: 18px 0 0;
  color: var(--nu-white-75); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5;
}
.mcc__seguro svg { flex: none; margin-top: 2px; }
.mcc__objeto { min-width: 0; width: 100%; max-width: 520px; justify-self: center; }

@media (min-width: 960px) {
  .mcc__cols { grid-template-columns: minmax(0, 1fr) minmax(0, 520px); }
  .mcc__objeto { justify-self: end; }
}
@media (max-width: 640px) {
  .mcc__luz { right: -40%; top: 72%; }
  .mcc__cta { width: 100%; justify-content: center; }
}
</style>
