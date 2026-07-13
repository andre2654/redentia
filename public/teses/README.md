# Imagens de /teses

Os `.png` desta pasta são as capas de tese servidas pelo backend como
`/teses/<slug>.png` (usadas no /mercado, /tese/[slug], busca etc).

## Pendente (página /teses)

Solte o arquivo aqui com EXATAMENTE este nome. Enquanto não existir, a seção
mostra o fundo azul do design (nada quebra); ao adicionar, a imagem aparece
sozinha.

| Arquivo (nome exato) | Onde aparece | Formato ideal |
|---|---|---|
| `promo-ai.webp` | Banner azul "A Redentia AI explica cada tese pra você" (página /teses) — coluna esquerda | **paisagem ~7:6**, ~1200×1030+. Full-bleed com `object-fit: cover` num container de até 420×360. |

Se mudar de formato, ajuste o `src` em
`app/components/teses/TesesAiBanner.vue` (`tab__img`).
