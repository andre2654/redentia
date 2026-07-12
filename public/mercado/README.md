# Imagens do /mercado

Solte os arquivos aqui com EXATAMENTE estes nomes. Enquanto não existirem, cada
seção mostra um placeholder on-brand (nada quebra); ao adicionar o arquivo, a
imagem aparece sozinha (é só dar deploy/refresh).

| Arquivo (nome exato) | Onde aparece | Formato ideal |
|---|---|---|
| `carteira-conectada.jpg` | Seção "Sua carteira, conectada." (banda azul) — coluna direita | **4:3**, ~1200×900+, foto/lifestyle. Fica full-bleed com `object-fit: cover`, então o assunto central some se recortar. |
| `cta-pessoas.jpg` | CTA final "Pronto para investir…" (banda azul) — foto de fundo | **paisagem larga**, ~1600×900+. Pessoa/assunto à DIREITA (o texto fica à esquerda, sobre um scrim escuro). |

## Trocar a extensão
Os componentes apontam para `.jpg`. Se preferir `.png` ou `.webp`, ajuste o
`src`/`url()` em:
- `app/components/mercado/MercadoCarteiraConectada.vue` (`mcc__media-photo`)
- `app/components/mercado/MercadoContent.vue` (`.mct__media`)

## Padrão
As capas de tese seguem o mesmo esquema em `public/teses/*.png` (referenciadas
como `/teses/<slug>.png`). Estas ficam em `public/mercado/` → `/mercado/<nome>`.
