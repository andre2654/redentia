# Ebook 01 — O Império por Trás do Feed

Coloque os seguintes arquivos aqui:

## Arquivos esperados

| Arquivo        | Uso                                                   | Exigido |
| -------------- | ----------------------------------------------------- | :-----: |
| `ebook.pdf`    | O PDF completo, linkado do botão "Baixar" da landing. |  ✅     |
| `cover.png`    | Imagem da capa — mockup 3D ou flat, ratio 1:1.35.     |  ✅     |
| `og.png`       | Open Graph (1200×630) pra preview em redes sociais.   |  opcional |

## Onde cada arquivo aparece

- **`ebook.pdf`** → botão de download na landing (`/estudo/imperio-por-tras-do-feed`) depois do lead capture.
  - URL pública final: `https://estudo.redentia.com.br/ebooks/imperio-por-tras-do-feed/ebook.pdf`
  - E também: `https://redentia.com.br/ebooks/imperio-por-tras-do-feed/ebook.pdf` (mesma origem, ambos funcionam)
- **`cover.png`** → renderizada no hero da landing e no card do hub `/estudo`.
  - URL pública final: `https://estudo.redentia.com.br/ebooks/imperio-por-tras-do-feed/cover.png`
- **`og.png`** → compartilhamento social (Twitter/X, LinkedIn, WhatsApp previews).

## Como trocar os paths depois

Os caminhos estão centralizados em [app/utils/ebooks.ts](../../../app/utils/ebooks.ts) no objeto do ebook:

```ts
downloadHref: '/ebooks/imperio-por-tras-do-feed/ebook.pdf',
// cover:     '/ebooks/imperio-por-tras-do-feed/cover.png',  // ← adicionar quando subir a imagem
// ogImage:   '/ebooks/imperio-por-tras-do-feed/og.png',
```

Se você quiser nomear o PDF diferente (ex: `imperio-feed-v2.pdf`), é só editar essa linha.
