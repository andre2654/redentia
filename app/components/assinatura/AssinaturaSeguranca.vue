<script setup lang="ts">
// "Seu dinheiro não sai do lugar." (31/10/2026): o medo número um de quem
// vai conectar o banco, respondido em quatro linhas. É o Open Finance como ele
// é: autorização no app do banco, só leitura, sem senha, e a pessoa cancela
// a autorização quando quiser.
const PONTOS = [
  { t: 'Só leitura', d: 'A Redentia vê os seus investimentos. Não move um centavo, não compra, não vende.' },
  { t: 'Sem a sua senha', d: 'Você autoriza no app do seu banco. A senha fica com ele, nunca passa pela Redentia.' },
  { t: 'Regulado pelo Banco Central', d: 'A conexão é pelo Open Finance, o sistema oficial dos bancos brasileiros.' },
  { t: 'Você desliga quando quiser', d: 'A autorização tem prazo e você cancela a qualquer momento, no app do banco.' },
]
</script>

<template>
  <section class="asg" aria-labelledby="asg-titulo">
    <div class="asg__cabeca">
      <span class="asg__escudo" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
      </span>
      <h2 id="asg-titulo" class="asg__titulo">Seu dinheiro <br>não sai do lugar.</h2>
    </div>
    <ul class="asg__grade">
      <li v-for="p in PONTOS" :key="p.t" class="asg__ponto">
        <strong class="asg__t">{{ p.t }}</strong>
        <span class="asg__d">{{ p.d }}</span>
      </li>
    </ul>
    <div class="asg__acao">
      <AssinaturaConectar origem="seguranca" tom="creme" />
    </div>
  </section>
</template>

<style scoped>
.asg { background: var(--nu-navy); padding: clamp(64px, 8.5vw, 112px) clamp(22px, 5.5vw, 80px); }
.asg__cabeca { display: flex; flex-direction: column; gap: 22px; }
.asg__escudo { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 20px; background: color-mix(in srgb, var(--nu-green-soft) 16%, transparent); color: var(--nu-green-soft); }
.asg__titulo { margin: 0; color: var(--nu-cream-text); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.asg__grade { list-style: none; margin: clamp(36px, 4.5vw, 56px) 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr)); gap: clamp(16px, 1.8vw, 24px); }
.asg__ponto { display: flex; flex-direction: column; gap: 10px; padding: clamp(22px, 2.4vw, 30px); border-radius: var(--nu-r-card); background: var(--nu-navy-2); }
.asg__t { color: var(--nu-cream-text); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.015em; }
.asg__d { color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.asg__acao { display: flex; justify-content: center; margin-top: clamp(36px, 4.4vw, 56px); }
@media (max-width: 760px) {
  .asg__titulo br { display: none; }
}
</style>
