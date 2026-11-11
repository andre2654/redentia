# Aportou: decisões de nome e de escopo (11/11/2026)

Lista curta do que já foi decidido, para todo construtor escrever igual. Complementa o `contrato.md`.

## Nomes

| Antes | Agora (no site de investidor) | Observação |
|---|---|---|
| Redentia (o produto) | Aportou | "a Aportou", "na Aportou", "da Aportou" |
| Redentia AI, IA da Redentia | IA da Aportou | botão: "Perguntar à IA"; campo: "Pergunte à Aportou" |
| Redentia Score | Aportou Score | **só o texto visível.** O slug `/ranking/redentia-score`, o campo `redentia_score` e a rota de API não mudam |
| Redentia MCP | Aportou MCP | no B2B segue "Redentia". O nome que a pessoa digita no Claude passa a ser `Aportou` |
| Guia Redentia (tag) | Guia Aportou | é valor de tipo (`types/guias.ts`), chave em `utils/guiasHub.ts` e dado de teste: muda tudo junto |
| Tese da Redentia, Teses Redentia | Tese da Aportou, Teses da Aportou | |
| Leitura da Redentia | Leitura da Aportou | |
| "o app da Redentia" (iPhone, Mac, Watch) | "o app" (sem nome) | o app ainda se chama Redentia na App Store; não afirme um nome que a loja não mostra |
| Redentia For Business | Redentia For Business | B2B não muda |

## Não mudam (são contrato técnico ou externo)

- E-mails `@redentia.com.br`, o domínio `redentia.com.br`, Instagram `redentia.app`, LinkedIn `company/redentia`.
- Cookies e chaves (`nu:*`, `redentia_consent`, `redentia_chat_client_id`, `redentia:valores-visiveis`), headers `X-Redentia-*`, `tenantSlug: 'redentia'`, `plan_slug: 'redentia'`, `item_id: 'redentia-mensal'`, nomes de evento de analytics.
- `TEXTO_ACEITE_WHATSAPP` (`utils/assinatura.ts`): é o texto do aceite da LGPD, versionado junto com o backend. Desde 11/11 diz "Aportou" e casa com a versão `whatsapp-2026-11-11` da branch `feat/aportou-marca` do backend. **Front e backend sobem juntos**; não mude o texto sem subir a versão lá.
- Nomes de arquivo, de componente, de função e de variável (`appsRedentia.ts`, `marcaRedentia.ts`, `APPS_REDENTIA`…).
- Razão social e CNPJ (`EMPRESA`).

## Marca por rota

`marcaDaRota(path)` (`shared/utils/marca.ts`) devolve `Redentia` em `/business`, `/cliente` e `/jantar`, e `Aportou` no resto. O título da página, o `og:site_name` e o JSON-LD já usam. Título de página não leva a marca escrita à mão: o `titleTemplate` acrescenta.

## Separação dos produtos (dono, 11/11/2026)

- O B2C (este site) vai para **aportou.com.br**. O **redentia.com.br fica com o B2B**.
- O Redentia For Business **sai deste repositório** numa etapa futura, que o dono conduz. Até lá `/business`, `/cliente` e `/jantar` ficam como estão: não invista neles, não os redesenhe, só não os quebre.
- Consequência para quem escreve código agora: nada de URL absoluta com `redentia.com.br` escrita à mão em tela de investidor; use `useSiteOrigin()` / `runtimeConfig.public.siteUrl`. Onde já existe e-mail `@redentia.com.br`, deixe (a troca de endereço vem com o domínio).

## Pendências que são do dono

- Registrar e apontar aportou.com.br (o site segue servindo em redentia.com.br até lá), com os 301 do domínio antigo.
- Nome do app nas lojas.
- Revisão jurídica dos Termos e da Privacidade (o termo definido "Redentia" passa a conviver com "Aportou").
- Contas de rede social e e-mail da Aportou.
