/**
 * Stylelint — Redentia design tokens enforcement.
 *
 * Objetivo MÍNIMO E FOCADO: forçar uso de CSS variables semânticas
 * (`var(--text-*)`, `var(--bg-*)`, `var(--brand-*)`) em vez de hex
 * literals (`#0F0F0E`) ou named colors (`white`, `black`).
 *
 * NÃO checamos formatação (espaçamento, ordem de propriedades, etc.) —
 * só cor. Pra eliminar fricção em PRs.
 *
 * Tokens vivem em:
 *   - `app/plugins/brand.ts`   (injeta as CSS vars)
 *   - `app/config/brand.ts`    (define os valores por tenant)
 *   - `app/design/IDENTITY.md` (constituição visual)
 *
 * Pra parsear `<style>` em arquivos `.vue`, usamos `postcss-html`.
 *
 * Comandos:
 *   - `npm run lint:css`         — checa
 *   - `npm run lint:css:fix`     — corrige onde possível (raro pra cor)
 */
module.exports = {
  // Não estende config padrão pra evitar regras de formatação.
  customSyntax: 'postcss-html',
  rules: {
    // Bloqueia hex literals
    'color-no-hex': true,

    // Bloqueia named colors (white, black, red, etc) — força token
    'color-named': 'never',
  },
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
  ],
  ignoreFiles: [
    // Tokens são DEFINIDOS aqui — hexes válidos
    'app/config/brand.ts',
    'app/plugins/brand.ts',
    'app/design/**',

    // Dev playground / mobile-layouts experimentais
    'app/pages/dev/**',

    // Build artifacts
    '.nuxt/**',
    '.output/**',
    'dist/**',
    'node_modules/**',
    'public/**',
    '**/*.d.ts',
  ],
}
