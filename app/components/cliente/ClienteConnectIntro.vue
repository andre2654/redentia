<script setup lang="ts">
/**
 * Passo 1 — boas-vindas, no molde da primeira tela do Pluggy Connect
 * ("{Empresa} usa a Pluggy para se conectar às suas contas" + dois blocos
 * curtos + "Ao selecionar Continuar, você concorda com os Termos").
 *
 * Aqui: o par de marcas (Redentia ⋯ escudo), o escritório quer acompanhar
 * os investimentos, uma frase, três linhas com ícone e UMA linha de rodapé
 * com o link do termo. NÃO existe tela de consentimento separada: o aceite
 * é continuar, como no Pluggy. O termo inteiro abre pelo link.
 */
defineProps<{
  escritorio: string | null
  assessor: string | null
  clienteNome: string | null
}>()

const emit = defineEmits<{ continuar: [], termo: [] }>()
</script>

<template>
  <section class="cci">
    <div class="cci__marcas" aria-hidden="true">
      <span class="cci__nu"><img src="/logo-branca.svg" alt="" width="22" height="22"></span>
      <span class="cci__pontos"><i /><i /><i /></span>
      <span class="cci__escudo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>
      </span>
    </div>

    <h1 data-cc-titulo tabindex="-1" class="cci__h1">
      <strong>{{ escritorio ?? 'Seu escritório' }}</strong> quer acompanhar seus investimentos
    </h1>
    <p class="cci__sub">
      <template v-if="assessor">Convite de {{ assessor }}</template><template v-else>Convite do escritório</template><template v-if="clienteNome"> para {{ clienteNome }}</template>.
    </p>

    <ul class="cci__lista">
      <li>
        <span class="cci__ico" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg></span>
        <span>Conexão por Open Finance, autorizada no seu banco</span>
      </li>
      <li>
        <span class="cci__ico" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9" /><path d="M12 3v9h9" /></svg></span>
        <span>Só posições de investimento, sem saldo nem movimentação</span>
      </li>
      <li>
        <span class="cci__ico" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg></span>
        <span>Você revoga quando quiser, de graça</span>
      </li>
    </ul>

    <footer class="cci__foot">
      <p class="cci__termos">
        Ao continuar, você concorda com os
        <button type="button" class="cci__link" @click="emit('termo')">Termos de compartilhamento</button>.
      </p>
      <ClienteConnectButton @click="emit('continuar')">Continuar</ClienteConnectButton>
    </footer>
  </section>
</template>

<style scoped>
.cci { flex: 1 1 auto; display: flex; flex-direction: column; }
.cci__marcas { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px; }
.cci__nu, .cci__escudo {
  width: 48px; height: 48px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center;
}
.cci__nu { background: var(--nu-blue); }
.cci__nu img { display: block; }
.cci__escudo { background: var(--nu-blue-tint); color: var(--nu-blue); }
.cci__pontos { display: inline-flex; gap: 4px; }
.cci__pontos i { width: 5px; height: 5px; border-radius: 50%; background: var(--nu-sand); }

.cci__h1 {
  margin: 22px 0 0; text-align: center; color: var(--nu-ink);
  font-size: 21px; font-weight: 700; letter-spacing: -.03em; line-height: 1.22; text-wrap: balance; outline: none;
}
.cci__h1 strong { font-weight: 800; }
.cci__sub { margin: 8px 0 0; text-align: center; color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.5; }

.cci__lista { list-style: none; margin: 26px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.cci__lista li { display: flex; align-items: center; gap: 12px; color: var(--nu-ink); font-size: 14px; font-weight: 600; line-height: 1.4; }
.cci__ico {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 9px; background: var(--nu-cream); color: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center;
}

.cci__foot { margin-top: auto; padding-top: 22px; }
.cci__termos { margin: 0 0 12px; text-align: center; color: var(--nu-gray); font-size: 12px; font-weight: 600; line-height: 1.5; }
.cci__link {
  padding: 0; border: none; background: none; color: var(--nu-blue); font: inherit; font-weight: 800; cursor: pointer;
  text-decoration: underline; text-decoration-color: var(--nu-blue-30); text-underline-offset: 2px;
}
.cci__link:hover { color: var(--nu-blue-hover); }
.cci__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 3px; }
</style>
