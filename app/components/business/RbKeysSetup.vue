<script setup lang="ts">
/**
 * A casca dos dois estados que antecedem o painel: cadastro do escritório e
 * conta criada esperando liberação.
 *
 * Uma banda só, duas colunas, artefato branco com ELEVAÇÃO à direita. A versão
 * anterior já usava NuSectionHeading aqui, e o resultado é que quem se cadastra
 * via a Redentia e quem virou cliente via um admin — a régua tipográfica mudava
 * no meio do funil. Agora as duas pontas usam a mesma.
 */
defineProps<{ mode: 'cadastro' | 'bloqueada', companyName?: string | null, busy: boolean, erro: string | null }>()
defineEmits<{ (e: 'cadastrar'): void }>()

const nome = defineModel<string>('nome', { required: true })
</script>

<template>
  <section class="rbkst">
    <div class="rbkst__cols">
      <div class="rbkst__intro">
        <NuBadge v-if="mode === 'bloqueada'" variant="neutral" size="card" class="rbkst__badge">
          Aguardando liberação
        </NuBadge>

        <NuSectionHeading :eyebrow="mode === 'cadastro' ? 'Cadastro' : 'Conta criada'">
          <template v-if="mode === 'cadastro'">A conta é do<br>escritório.</template>
          <template v-else>{{ companyName }}</template>
          <template #dek>
            <template v-if="mode === 'cadastro'">
              Uma conta para a casa inteira, com até cinco chaves nomeadas e o uso
              de todas no mesmo painel. Comece pelo nome do escritório.
            </template>
            <template v-else>
              A conta está registrada e <strong>ainda não foi liberada</strong>. A
              liberação acontece quando o contrato fecha, e é aí que as chaves passam
              a existir. Nada aqui cobra nada sozinho.
            </template>
          </template>
        </NuSectionHeading>
      </div>

      <div class="rbkst__aside">
        <form v-if="mode === 'cadastro'" class="rbkst__card" @submit.prevent="$emit('cadastrar')">
          <label for="rbkst-empresa" class="rbkst__label">Nome do escritório</label>
          <input
            id="rbkst-empresa"
            v-model="nome"
            type="text"
            name="company"
            maxlength="120"
            placeholder="Escritório Exemplo Investimentos"
            class="rbkst__input"
          >
          <button type="submit" class="rbkst__cta" :disabled="busy || nome.trim().length < 2">
            {{ busy ? 'Criando…' : 'Criar a conta' }}
          </button>
          <p v-if="erro" class="rbkst__erro" role="alert">{{ erro }}</p>
          <p class="rbkst__nota">
            Uma conta por escritório: se alguém da casa já criou, peça pra essa
            pessoa gerar a sua chave em vez de abrir outra. A conta é liberada
            quando o contrato fecha, no
            <NuxtLink to="/business#contato" class="rbkst__link">setup de 1 hora</NuxtLink>.
          </p>
        </form>

        <div v-else class="rbkst__card">
          <span class="rbkst__label">Próximo passo</span>
          <p class="rbkst__texto">
            Agende o setup de 1 hora e a gente libera a conta na hora. Se você já
            falou com a gente, escreva pra
            <a href="mailto:contato@redentia.com" class="rbkst__link">contato@redentia.com</a>
            que liberamos hoje.
          </p>
          <NuxtLink to="/business#contato" class="rbkst__cta">Agendar o setup</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbkst {
  background: var(--nu-cream);
  padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 88px);
  animation: nu-fade .5s ease both;
}
.rbkst__cols { display: flex; gap: clamp(28px, 5vw, 72px); align-items: center; flex-wrap: wrap; max-width: 1120px; }
.rbkst__intro { flex: 1.2 1 460px; min-width: min(320px, 100%); }
.rbkst__aside { flex: 1 1 420px; min-width: min(320px, 100%); max-width: 540px; }
.rbkst__badge { margin-bottom: 18px; }

.rbkst__card { background: var(--nu-white); border-radius: var(--nu-r-card); padding: clamp(24px, 3vw, 32px); box-shadow: var(--nu-shadow-card); }
.rbkst__label { display: block; color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.4px; margin-bottom: 16px; }

.rbkst__input {
  display: block; width: 100%; margin-bottom: 16px;
  background: var(--nu-cream); border: none; border-radius: var(--nu-r-input);
  padding: 15px 18px; color: var(--nu-ink); font-size: 16px; font-weight: 700; font-family: inherit;
}
.rbkst__input::placeholder { color: var(--nu-gray); font-weight: 500; }
.rbkst__input:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 1px; }

.rbkst__cta {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; border: none; cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 14px 26px; font-size: 16px; font-weight: 800; font-family: inherit;
  transition: background .2s, opacity .2s;
}
.rbkst__cta:hover:not(:disabled) { background: var(--nu-blue-hover); color: var(--nu-white); }
.rbkst__cta:disabled { opacity: .5; cursor: default; }
.rbkst__cta:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }

.rbkst__texto { margin: 0 0 20px; color: var(--nu-gray-2); font-size: 15.5px; font-weight: 600; line-height: 1.6; }
.rbkst__erro { margin: 16px 0 0; color: var(--nu-ink); font-size: 14px; font-weight: 700; line-height: 1.55; }
.rbkst__nota {
  margin: 20px 0 0; padding-top: 18px; border-top: 1px solid var(--nu-cream-2);
  color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.6;
}
.rbkst__link { color: var(--nu-blue); font-weight: 700; }
.rbkst__link:hover { color: var(--nu-blue-hover); }
</style>
