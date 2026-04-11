# Audit de código não usado — abril 2026

Relatório de uma varredura por componentes, composables e utils
sem referências no frontend Nuxt. **Atenção:** auto-imports do Nuxt
usam PascalCase derivado do path (`atoms/installAppBanner.vue` →
`AtomsInstallAppBanner`), então alguns falsos positivos podem
acontecer — sempre confirme com `grep` antes de deletar.

## Componentes potencialmente não usados

| Path | Status | Ação |
|---|---|---|
| `atoms/chatMessage.vue` + filhos (Chart, Dividends, Price, Report, StructuredAnalysis, Tools) | provavelmente legado | Revisar com produto antes de deletar |
| `atoms/aiInsight.vue` | sem referências | Pode deletar |
| `atoms/DotsBackground.vue` | sem referências | Pode deletar |
| `atoms/sidebar/monthGoal.vue` | sem referências | Pode deletar |
| `atoms/form/inputPassword.vue` | sem referências | Pode deletar |
| `atoms/form/percentageInput.vue` | sem referências | Pode deletar |
| `atoms/form/currencyInput.vue` | sem referências | Pode deletar |
| `atoms/Graph/financialSummary.vue` | sem referências | Pode deletar |
| `molecules/FeaturesGrid.vue` | sem referências | Pode deletar |
| `molecules/searchAssets.vue` | sem referências | Pode deletar |
| `molecules/chatAdvisor.vue` | provavelmente legado | Revisar antes de deletar |
| `molecules/wallet/assetAccordion.vue` | sem referências | Provavelmente feature pausada — revisar |
| `molecules/settings/syncWallet.vue` | sem referências | Provavelmente feature pausada — revisar |

## Falsos positivos confirmados (NÃO deletar)

| Path | Razão |
|---|---|
| `atoms/installAppBanner.vue` | Usado via auto-import `<AtomsInstallAppBanner />` em pages — busque com `grep -r "AtomsInstallAppBanner"` |
| `atoms/devPortalFooter.vue` | Usado pelo layout `api-portal.vue` (criado nesta sessão) |
| `molecules/creativePreviewControls.vue` | Usado pelos creatives (`asset-spotlight`, `growth-race`, etc) |

## Composables

| Path | Status |
|---|---|
| `useAuthFetch.ts` | Sem imports diretos — pode estar sendo substituído por `$fetch` direto. Revisar antes de deletar |

## Utilities

Todos os 3 utils (`color.ts`, `parsePortfolioXlsx.ts`,
`redentiaCreativeColors.ts`) estão em uso. Nada a remover.

## Pages

Nenhuma página órfã encontrada. Todas têm links de entrada via
`NuxtLink` ou `router.push`.

## Plano de ação recomendado

### Fase 1 — deletes seguros (sem regressão)
```
rm app/components/atoms/aiInsight.vue
rm app/components/atoms/DotsBackground.vue
rm app/components/atoms/sidebar/monthGoal.vue
rm app/components/atoms/form/inputPassword.vue
rm app/components/atoms/form/percentageInput.vue
rm app/components/atoms/form/currencyInput.vue
rm app/components/atoms/Graph/financialSummary.vue
rm app/components/molecules/FeaturesGrid.vue
rm app/components/molecules/searchAssets.vue
```

### Fase 2 — confirmar antes de deletar
- `atoms/chatMessage.vue` + 6 filhos — confirmar se sistema de chat
  legado foi descontinuado em favor da `Assessoria IA` atual
- `molecules/chatAdvisor.vue` — mesmo motivo
- `molecules/wallet/assetAccordion.vue` — confirmar se a tela
  `/wallet` ainda planeja usar acordeão de ativos
- `molecules/settings/syncWallet.vue` — confirmar status do sync
  via Open Finance
- `composables/useAuthFetch.ts` — buscar usos via `useAuthFetch(`
  com case insensitive antes de deletar

## Como rodar a auditoria de novo

```bash
# Para um componente específico:
grep -r "AtomsInstallAppBanner\|atoms/installAppBanner" app/ --include='*.vue' --include='*.ts'

# Para todos os components:
for f in app/components/**/*.vue; do
  name=$(basename "$f" .vue)
  count=$(grep -r "$name" app/ --include='*.vue' --include='*.ts' | wc -l)
  echo "$count  $f"
done | sort -n
```

## Observações

- O backend (Laravel) não foi auditado nesta passagem.
- Esse audit foi feito após a refatoração de abril/2026 que
  introduziu o `MoleculesCreativePreviewControls`,
  `AtomsDevPortalFooter`, novo `whitelabel.vue` e novo
  `download.vue`.
