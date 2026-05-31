import withNuxt from './.nuxt/eslint.config.mjs'
import vuejsA11y from 'eslint-plugin-vuejs-accessibility'

/**
 * Regras especificas pro design system Redentia.
 *
 * Bloqueamos dois antipatterns que causam o bug F5 (FOIT — flash of
 * incorrect theme): ler `brand.colors.X` em `:style` JS, ou cravar
 * hex literais em `:style`. Em ambos os casos, o valor é capturado
 * uma vez no render do Vue e nunca reage a mudanca de tema
 * (light/dark via @nuxtjs/color-mode com `prefers-color-scheme:
 * system`). Use sempre CSS vars semanticas (`var(--brand-primary)`,
 * `var(--text-heading)`, etc) que sao live-bindings.
 *
 * Documentacao: `app/design/IDENTITY.md`.
 *
 * Esses dois selectors usam vue-eslint-parser AST sobre templates.
 * `no-restricted-syntax` aplica a tudo (script+template) — o
 * objetivo aqui e travar especificamente em VAttribute bindings.
 */
const REDENTIA_BRAND_COLORS_IN_STYLE = {
  selector:
    "VAttribute[directive=true][key.name.name='bind'][key.argument.name='style'] MemberExpression[object.name='brand'][property.name='colors']",
  message:
    "Nao leia `brand.colors.X` em `:style` (captura valor no render, quebra com troca de tema). Use `var(--brand-X)` direto no CSS ou string `'var(--brand-X)'` no :style.",
}

const REDENTIA_HEX_LITERAL_IN_STYLE = {
  // Pega Literal string com #hex dentro de :style="..."
  selector:
    "VAttribute[directive=true][key.name.name='bind'][key.argument.name='style'] Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
  message:
    "Hex literal em `:style` quebra com troca de tema. Use CSS var semantica (`var(--brand-primary)`, `var(--text-heading)` etc).",
}

export default withNuxt(
  // -------- A11y gate (eslint-plugin-vuejs-accessibility) --------
  // Ratchet de acessibilidade: roda junto do job "Lint (changed)" do
  // CI, entao so trava nos arquivos .vue que MUDARAM no PR/push (o
  // backlog legado fica intacto e e queimado oportunamente). Sem
  // servidor, sem build — analise estatica do template, igual ao
  // ratchet de lint que ja existe.
  //
  // `flat/recommended` liga 20 regras como 'error'. Mantemos como
  // ERROR as de alto sinal / baixo falso-positivo (bug real de a11y:
  // img sem alt, aria quebrado, control sem label, heading/anchor
  // vazio) e rebaixamos pra 'warn' as estruturais/ruidosas
  // (click-events-have-key-events e cia) — assim o gate pega defeito
  // de verdade sem bloquear PR legitimo por padrao discutivel.
  ...vuejsA11y.configs['flat/recommended'],
  {
    rules: {
      'vuejs-accessibility/click-events-have-key-events': 'warn',
      'vuejs-accessibility/no-static-element-interactions': 'warn',
      'vuejs-accessibility/interactive-supports-focus': 'warn',
      'vuejs-accessibility/mouse-events-have-key-events': 'warn',
      'vuejs-accessibility/media-has-caption': 'warn',
      'vuejs-accessibility/no-autofocus': 'warn',
      'vuejs-accessibility/label-has-for': 'warn',
    },
  },

  // -------- Regras do design system Redentia --------
  {
    // Ignora playground/dev + landings decorativas — esses arquivos tem
    // padroes intencionalmente fora do design system canonico.
    ignores: [
      'app/pages/dev/**',
      'app/components/dev/**',
      'app/pages/creative/**',
      'app/pages/hero-examples.vue',
      'app/pages/builder.vue',
      'app/pages/assessorias-diferencie-problema.vue',
      'app/pages/assessorias-diferencie-solucao.vue',
    ],
    rules: {
      'no-console': 'warn',
      'vue/multi-word-component-names': 'off',
      'vue/prefer-true-attribute-shorthand': 1,
      'vue/html-self-closing': 'off',
      'vue/no-multiple-template-root': 'off',

      // Anti-FOIT — ver bloco de doc acima
      'vue/no-restricted-syntax': [
        'warn', // warn por enquanto, virar 'error' depois de cleanup completo
        REDENTIA_BRAND_COLORS_IN_STYLE,
        REDENTIA_HEX_LITERAL_IN_STYLE,
      ],
    },
  },
)
