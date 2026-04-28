# Migracao para a identidade quiet

> Estado atual da migracao para o DNA definido em [IDENTITY.md](./IDENTITY.md).

## Status global

- **Tokens semanticos**: aplicados (`plugins/brand.ts`, `assets/css/main.css`, `app.config.ts`)
- **Tipografia base**: aplicada (h1/h2/h3 weight 300, body color, helpers)
- **Componentes UI core**: defaults atualizados (button, input, textarea, inputNumber, card, badge)
- **Migracao em massa**: 1440 substituicoes em 88 arquivos via `scripts/migrate-brand-colors-to-css-vars.mjs` (`brand.colors.X` -> `var(--brand-X)` em templates)
- **Hero principal**: variant `quiet` ativada na Redentia ([HomeHeroQuiet.vue](../components/HomeHeroQuiet.vue))
- **Componente reusavel**: [`<AtomsSegmented>`](../components/atoms/segmented.vue) substitui 3+ inline implementations

## Fase 1 — Concluida

- [x] PeriodSelector usa AtomsSegmented
- [x] List/Map (pages/index.vue) usa AtomsSegmented
- [x] Todos/Altas/Baixas (pages/index.vue) usa AtomsSegmented
- [x] ColorModeToggle quiet pattern (rounded-md, amber active)
- [x] Header CTA Entrar quiet pattern
- [x] TrustedBy migrado para tokens semanticos
- [x] Hero variant quiet ativa para Redentia

## Fase 2 — Areas grandes ainda pendentes

Nenhum delas foi auditada visualmente; pode haver componentes ja OK por herdar
defaults globais. Auditar conforme prioridade.

### Alta prioridade (high traffic)

- [ ] **Authenticated layout** (`layouts/default.vue`) — sidebar, header, profile card
- [ ] **Wallet** (`pages/wallet.vue`, `components/molecules/wallet/*`) — segunda area mais usada
- [ ] **Asset detail page** (`pages/asset/[ticker].vue`) — graficos, tabs, calculadoras inline
- [ ] **Search** (`components/molecules/QuickSearch.vue`) — popover global
- [ ] **Auth flow** (`pages/auth/*`) — register, login, forgot-password forms

### Media prioridade (vistos mas menos frequente)

- [ ] **Calculadoras** (`components/calculator/*` — 8 arquivos) — Compound, MonthlyInvestment,
      Retirement, Planning, IncomeTax, DividendYield, FairPrice, Stock
- [ ] **Settings** (`pages/settings.vue`, `components/molecules/settings/*`) — profile,
      attachAdvisor, etc.
- [ ] **Chat v2** (`components/molecules/chat-v2/*` — Layout, Sidebar, Thread, Message,
      Input, InlineForm, EmptyState, Drawers)
- [ ] **Backoffice** (`pages/backoffice/*`, `components/backoffice/*`) — admin tenant CRUD
- [ ] **Advisor** (`pages/advisor/*`) — area do advisor
- [ ] **API portal** (`pages/api-portal/*`) — developer docs

### Baixa prioridade (raras)

- [ ] **Glossario** (`pages/glossario/*`) — paginas estaticas de termos
- [ ] **Guias** (`pages/guias/*`) — conteudo educacional
- [ ] **Step by step** (`pages/step-by-step.vue`) — onboarding wizard
- [ ] **Embed** (`pages/embed/*`) — widgets embutiveis (atencao a tema externo)
- [ ] **Error pages** (`error.vue`, 404)

## Fase 3 — Limpeza arquitetural

- [ ] Decidir destino do hero variant `terminal` (legacy v2):
      mantem como referencia ou remove?
- [ ] Auditar uso de `font-mono-tab` em UI nao-financeira (deve estar limitado a numeros)
- [ ] Eliminar `font-extrabold` / `font-black` em headings residuais
      (grep `font-extrabold|font-black` em `components/`)
- [ ] Substituir `text-gray-*` / `text-zinc-*` residuais por tokens semanticos
      (grep `text-(gray|zinc|slate|neutral)-` em `components/`)
- [ ] Verificar componentes que usam `rounded-full` em CTAs (deveria ser apenas
      avatar/status/notification)

## Como migrar um componente

1. Ler [IDENTITY.md](./IDENTITY.md) secao 6 (checklist).
2. Trocar cores hardcoded ou `text-gray-*` por `var(--text-*)` / `var(--bg-*)` / `var(--border-*)`.
3. Trocar `font-bold/extrabold` em headings por `font-light` (300).
4. Adicionar `tabular-nums` em qualquer numero.
5. Trocar `rounded-2xl`/`rounded-full` por `rounded-md`/`rounded-lg`.
6. Substituir segmented inline por `<AtomsSegmented>`.
7. Substituir card inline por `.quiet-card` ou `<UCard>`.
8. Verificar visual em light E dark.

## Comandos uteis

```sh
# Encontrar offenders
grep -rn "text-gray-\|text-zinc-\|text-slate-\|text-neutral-" Frontend/app/components/
grep -rn "font-extrabold\|font-black" Frontend/app/components/
grep -rn "#[Ff]{6}" Frontend/app/components/  # hex hardcoded

# Re-rodar migracao em massa (idempotente)
node scripts/migrate-brand-colors-to-css-vars.mjs Frontend/app/components
```
