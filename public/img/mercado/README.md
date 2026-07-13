# Imagens do /mercado

Solte os arquivos aqui com EXATAMENTE estes nomes (formato **WebP**). Enquanto
não existirem, cada seção mostra um placeholder on-brand (nada quebra); ao
adicionar o arquivo, a imagem aparece sozinha (é só dar deploy/refresh).

| Arquivo (nome exato) | Onde aparece | Formato ideal |
|---|---|---|
| `carteira-conectada.webp` | Seção "Sua carteira, conectada." (banda azul) — coluna direita | **4:3**, ~1200×900+. Fica full-bleed com `object-fit: cover`, então deixe o assunto central. |
| `cta-pessoas.webp` | CTA final "Pronto para investir…" (banda azul) — foto de fundo | **paisagem larga**, ~1600×900+. Pessoa/assunto à DIREITA (o texto fica à esquerda, sobre um scrim escuro). |

## Extensão
Os componentes apontam para `.webp`. Se um dia mudar de formato, ajuste o
`src`/`url()` em:
- `app/components/mercado/MercadoCarteiraConectada.vue` (`mcc__media-photo`)
- `app/components/mercado/MercadoContent.vue` (`.mct__media`)

## Padrão
As capas de tese seguem o mesmo esquema em `public/teses/*.png` (referenciadas
como `/teses/<slug>.png`). Estas ficam em `public/mercado/` → `/mercado/<nome>`.
