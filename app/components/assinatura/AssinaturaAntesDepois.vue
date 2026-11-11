<script setup lang="ts">
// "Sem a Aportou × com a Aportou" (31/10/2026, então Redentia, pedido do dono: seções que
// prendam quem chega no /assinar até conectar). Quatro dores do dia a dia de
// quem investe em mais de um banco, cada uma com o que a Aportou faz no
// lugar. Nada de número inventado: são as quatro coisas que o produto faz.
// Na Aportou (11/11/2026) a coluna "com" é o cartão carvão com a faixa da
// marca (NuFaixaMarca); a "sem" é um cartão creme quieto ao lado.
const LINHAS = [
  { sem: 'Quatro apps para saber quanto você tem.', com: 'Uma tela, com todos os bancos somados.' },
  { sem: 'A queda você descobre no jornal, dias depois.', com: 'Um aviso no dia, com o porquê.' },
  { sem: 'Uma planilha para saber se está indo bem.', com: 'Uma frase: tudo normal, ou o que mudou.' },
  { sem: 'Nenhuma ideia do que vem pela frente.', com: '2.000 cenários dos próximos 5 anos.' },
]
</script>

<template>
  <section class="aad" aria-labelledby="aad-titulo">
    <NuEyebrow>Antes e depois</NuEyebrow>
    <h2 id="aad-titulo" class="aad__titulo">Investir em vários bancos <br>não precisa dar trabalho.</h2>

    <div class="aad__quadro">
      <div class="aad__coluna aad__coluna--sem">
        <p class="aad__rotulo">Sem a Aportou</p>
        <ul class="aad__lista">
          <li v-for="l in LINHAS" :key="l.sem" class="aad__item">
            <span class="aad__marca aad__marca--sem" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M7 7l10 10M17 7 7 17" /></svg>
            </span>
            {{ l.sem }}
          </li>
        </ul>
      </div>
      <NuFaixaMarca class="aad__coluna aad__coluna--com" rotulo="Com a Aportou" como="p" :altura="52" :raio="32">
        <ul class="aad__lista">
          <li v-for="l in LINHAS" :key="l.com" class="aad__item">
            <span class="aad__marca aad__marca--com" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
            {{ l.com }}
          </li>
        </ul>
      </NuFaixaMarca>
    </div>

    <div class="aad__acao">
      <AssinaturaConectar origem="antes-depois" />
    </div>
  </section>
</template>

<style scoped>
.aad { background: var(--nu-page); padding: clamp(64px, 7vw, 100px) clamp(20px, 5.5vw, 80px); }
.aad__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; }
.aad__quadro { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(16px, 1.8vw, 24px); margin-top: clamp(36px, 4.5vw, 56px); }
.aad__coluna { border-radius: var(--nu-r-card-lg); }
.aad__coluna--sem { background: var(--nu-band); box-shadow: var(--nu-shadow-quente); }
/* o rótulo da coluna "sem" tem a altura da aba da faixa: as duas listas começam na mesma linha */
.aad__rotulo {
  display: flex; align-items: center; height: 52px; margin: 0; padding: 0 clamp(26px, 3vw, 40px);
  color: var(--nu-gray); font-size: 15px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
}
.aad__lista { list-style: none; margin: 0; padding: clamp(22px, 2.6vw, 30px) clamp(26px, 3vw, 40px) clamp(28px, 3vw, 40px); display: flex; flex-direction: column; gap: 18px; }
.aad__item { display: flex; align-items: flex-start; gap: 14px; font-size: var(--nu-fs-xl); font-weight: 700; letter-spacing: -0.015em; line-height: 1.3; }
.aad__coluna--sem .aad__item { color: var(--nu-gray); }
.aad__coluna--com .aad__item { color: var(--nu-white); }
.aad__marca { display: grid; place-items: center; width: 26px; height: 26px; flex-shrink: 0; margin-top: 1px; border-radius: 50%; }
.aad__marca--sem { background: var(--nu-white); color: var(--nu-red-text); }
.aad__marca--com { background: var(--nu-green-soft); color: var(--nu-ink); }
.aad__acao { display: flex; justify-content: center; margin-top: clamp(36px, 4.4vw, 56px); }

@media (max-width: 860px) {
  .aad__quadro { grid-template-columns: minmax(0, 1fr); }
  .aad__titulo br { display: none; }
}
@media (max-width: 420px) {
  .aad__rotulo { font-size: 13px; letter-spacing: 0.12em; padding: 0 20px; }
  .aad__lista { padding: 18px 20px 26px; }
}
</style>
