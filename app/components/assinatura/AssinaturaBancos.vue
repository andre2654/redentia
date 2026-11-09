<script setup lang="ts">
// "Conecte todos os seus bancos." (31/10/2026, pedido do dono: a seção dos
// bancos do /mcp, com a mesma animação, no /assinar e no paywall). A janela
// "Conectar conta" é o McpInstDemo (o seletor do Open Finance escolhendo um
// banco), e embaixo a fila de logos reais de public/instituicoes.
// Em 01/11/2026 (revisão de produto: a página repetia o Open Finance em duas
// seções) a "Seu dinheiro não sai do lugar" entrou aqui: o título ganhou a
// segunda metade e os quatro pontos de segurança ficam embaixo dos logos.
const FILA = ['xp', 'nubank', 'itau', 'btg', 'bradesco', 'santander', 'bb', 'inter', 'rico', 'c6']
const SEGURANCA = [
  { t: 'Só leitura', d: 'A Redentia vê os seus investimentos. Não move um centavo, não compra, não vende.' },
  { t: 'Sem a sua senha', d: 'Você autoriza no app do seu banco. A senha fica com ele.' },
  { t: 'Regulado pelo Banco Central', d: 'A conexão é pelo Open Finance, o sistema oficial dos bancos.' },
  { t: 'Você desliga quando quiser', d: 'A autorização tem prazo e você cancela no app do banco.' },
]
</script>

<template>
  <section class="abc" aria-labelledby="abc-titulo">
    <div class="abc__cols">
      <div class="abc__texto">
        <h2 id="abc-titulo" class="abc__titulo">Conecte todos os seus bancos. <span>Seu dinheiro não sai do lugar.</span></h2>
        <p class="abc__dek">
          Pelo <strong>Open Finance</strong>, a conexão oficial regulada pelo Banco Central. XP, Nubank, Itaú,
          BTG, Bradesco, Santander, Banco do Brasil, Inter, Rico, C6 e mais de 100 bancos e corretoras.
        </p>
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
    <ul class="abc__seguranca">
      <li v-for="p in SEGURANCA" :key="p.t" class="abc__ponto">
        <span class="abc__escudo" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
        </span>
        <strong class="abc__ponto-t">{{ p.t }}</strong>
        <span class="abc__ponto-d">{{ p.d }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.abc { background: var(--nu-cream); padding: clamp(64px, 8.5vw, 112px) clamp(22px, 5.5vw, 80px); }
.abc__cols { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: clamp(32px, 5vw, 80px); align-items: center; }
.abc__titulo { margin: 0; max-width: 17ch; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.abc__titulo span { display: block; margin-top: 6px; color: var(--nu-green-text); }
.abc__dek { margin: 20px 0 0; max-width: 56ch; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55; }
.abc__dek strong { color: var(--nu-ink); font-weight: 700; }
.abc__acao { margin-top: clamp(26px, 3.2vw, 36px); }
.abc__lado { display: flex; justify-content: center; }

.abc__fila { display: flex; justify-content: center; align-items: center; margin-top: clamp(40px, 5vw, 64px); padding-left: 10px; }
.abc__ava {
  display: grid; place-items: center; width: 48px; height: 48px; margin-left: -10px; overflow: hidden; border-radius: 50%;
  background: var(--nu-white); border: 2.5px solid var(--nu-cream); box-shadow: var(--nu-shadow-card);
}
.abc__ava img { width: 28px; height: 28px; object-fit: contain; }
.abc__seguranca { list-style: none; margin: clamp(36px, 4.5vw, 56px) 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(230px, 100%), 1fr)); gap: clamp(12px, 1.6vw, 20px); }
.abc__ponto { display: flex; flex-direction: column; gap: 8px; padding: clamp(20px, 2.2vw, 26px); border-radius: var(--nu-r-card); background: var(--nu-white); }
.abc__escudo { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 12px; background: var(--nu-green-bg); color: var(--nu-green-2); }
.abc__ponto-t { margin-top: 6px; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; }
.abc__ponto-d { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.abc__ava--mais { background: var(--nu-blue); color: var(--nu-white); font-size: var(--nu-fs-dense); font-weight: 700; letter-spacing: -0.02em; }

@media (max-width: 900px) {
  .abc__cols { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 520px) {
  .abc__ava { width: 38px; height: 38px; margin-left: -11px; }
  .abc__ava img { width: 22px; height: 22px; }
}
</style>
