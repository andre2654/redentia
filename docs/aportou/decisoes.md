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
| Redentia For Business | Redentia (em redentia.com.br) | o B2B saiu deste site em 12/11/2026; a porta no rodapé diz "Para escritórios: Redentia" |

## Não mudam (são contrato técnico ou externo)

- E-mails `@redentia.com.br`, o domínio `redentia.com.br`, Instagram `redentia.app`, LinkedIn `company/redentia`.
- Cookies e chaves (`nu:*`, `redentia_consent`, `redentia_chat_client_id`, `redentia:valores-visiveis`), headers `X-Redentia-*`, `tenantSlug: 'redentia'`, `plan_slug: 'redentia'`, `item_id: 'redentia-mensal'`, nomes de evento de analytics.
- `TEXTO_ACEITE_WHATSAPP` (`utils/assinatura.ts`): é o texto do aceite da LGPD, versionado junto com o backend. Desde 11/11 diz "Aportou" e casa com a versão `whatsapp-2026-11-11` da branch `feat/aportou-marca` do backend. **Front e backend sobem juntos**; não mude o texto sem subir a versão lá.
- Nomes de arquivo, de componente, de função e de variável (`appsRedentia.ts`, `marcaRedentia.ts`, `APPS_REDENTIA`…).
- Razão social e CNPJ (`EMPRESA`).

## Marca da página

Toda página assina `Aportou` (`MARCA.nome`): o título, o `og:site_name` e o JSON-LD. Título de página não leva a marca escrita à mão: o `titleTemplate` acrescenta. (Até 12/11/2026 o `marcaDaRota(path)` devolvia `Redentia` nas telas de escritório; ele saiu com elas.)

## Separação dos produtos (dono, 11/11/2026)

- O B2C (este site) vai para **aportou.com.br**. O **redentia.com.br fica com o B2B**.
- O Redentia For Business **saiu deste repositório** em 12/11/2026 (seção abaixo, "O B2B saiu do front").
- Consequência para quem escreve código agora: nada de URL absoluta com `redentia.com.br` escrita à mão em tela de investidor; use `useSiteOrigin()` / `runtimeConfig.public.siteUrl`. Onde já existe e-mail `@redentia.com.br`, deixe (a troca de endereço vem com o domínio).

## O B2B saiu do front (12/11/2026)

O dono: "remova o /business daqui e tudo relacionado (só do front por enquanto) e faça o /business levar para redentia.com.br (que vai ser o site para business)". O redentia.com.br passa a ser o app novo do B2B (outra pasta, `RedentiaBusiness`); este front fica só com a Aportou.

**O que saiu:** as páginas `/business/**` (landing, cadastro, chaves, clientes, skills, convite de chave), `/cliente/**` (convite e acesso do cliente final) e `/jantar`; os layouts `business` e `jantar`; `components/business/**`, `components/cliente/**` e `content/business/**`; os composables `useBusinessAccount`, `useBusinessClients`, `useClienteConexao`, `useDestinoCadastroBusiness`, `useMarcaRedentia` e `usePassosTravados`; os plugins `business-atribuicao` e `00.rotas-com-segredo`; `utils/business-lead.ts`, `utils/clientes.ts`, `utils/analytics-privacy.ts` (a guarda das rotas com token, que eram todas do B2B) e `utils/cpf.ts`; `types/clientes.ts`; o tema `tema-redentia.css` (`.marca-redentia`) e o `marcaDaRota`; as variantes business do topo, do menu, da marca e do rodapé; as regras de rota do B2B no `nuxt.config.ts` e o `__REDENTIA_BUSINESS_LEAD_DEMO__`; `/business` e `/jantar` do sitemap e do `llms.txt`; `public/business-hero` e `public/img/jantar`; os testes que só testavam isso.

**Ficou, porque o site de investidor usa:** o wizard de conexão do MCP da `/mcp` e da `/conta` (era o `RbConexaoModal`, agora `components/mcp/McpConexaoModal.vue`, só com o caminho do investidor), o `ClienteInstLogo` (agora em `components/carteira/`) e a lista `content/instituicoes.ts` (a carteira vazia e a assinatura mostram os bancos). A porta do rodapé, "Para escritórios: Redentia", aponta direto para `https://redentia.com.br`.

**Os redirecionamentos** moram num lugar só, `server/utils/destino-b2b.ts` (testes em `tests/destino-b2b.test.ts`), aplicado pelo middleware `server/middleware/b2b-para-redentia.ts`. A query vai junto.

| Endereço antigo | Vai para | Status |
|---|---|---|
| `/business`, `/business/cadastro` e qualquer outro `/business/**` | `https://redentia.com.br` | 301 |
| `/business/clientes` | `https://redentia.com.br/app/clientes` | 301 |
| `/business/chaves`, `/business/comecar` | `https://redentia.com.br/app/escritorio` | 301 |
| `/business/skills` | `https://redentia.com.br/app` | 301 |
| `/whitelabel`, `/pricing` | `https://redentia.com.br` (direto, sem passar pela `/business`) | 301 |
| `/business/convite/<token>` | `https://redentia.com.br/business/convite/<token>` | 302 (link pessoal) |
| `/cliente` e `/cliente/**` (convite e acesso do cliente final) | o mesmo caminho em `https://redentia.com.br` | 302 |
| `/jantar` | `https://redentia.com.br/jantar` | 302 (campanha) |

**Trava contra laço:** se o host do destino (sem "www.") é o host do pedido (sem "www.") e o caminho com a query do destino é o mesmo do pedido, não redireciona: o pedido segue e dá 404. Enquanto este front ainda responder em www.redentia.com.br (o apex manda para o www), `/cliente/convite/<token>`, `/business/convite/<token>` e `/jantar` dão 404 em vez de ir e voltar para sempre; a `/business` e o painel antigo seguem redirecionando (o destino é outro caminho).

**Quando pode subir:** só DEPOIS que o app novo estiver no ar em redentia.com.br e a Aportou em aportou.com.br. E o app novo precisa servir `/business/convite/<token>`, `/cliente/convite/<token>`, `/cliente/acesso/<token>` e `/jantar` antes disso, senão os links que clientes e escritórios já receberam quebram. Subir antes deixa esses links em 404 neste front, e a página de 404 carrega o analytics como qualquer outra (a guarda das rotas com token saiu junto com elas).

## O fecho do rodapé (13/11/2026)

O dono: "deixe o footer mais bacana, talvez com uns carrosséis de ativos com a bandeirinha da aportou e a logo maior ocupando toda a largura". Vendo as versões no navegador, ele fechou três coisas: o ativo fica **dentro** da bandeira ("queria que ficasse DENTRO da bandeira"; a primeira versão tinha a bandeirinha espetada em cima do ícone), uma fila fica em cima e a outra embaixo do wordmark ("coloque 1 linha em cima outra em baixo da logo da aportou"), e a faixa de título "O que a Aportou acompanha", com o botão de pausa, sai ("pode remover isso").

**O que ficou** (`NuFooterAportou.vue`, `components/nu/rodape/NuRodapeEsteira.vue`, `content/rodape-ativos.ts`): depois do mapa do site e da linha do CNPJ, de beira a beira da tela e fora da coluna, uma fila de 16 ações, o wordmark gigante na largura inteira da tela (era na coluna, 1.240px) e uma fila de 16 fundos imobiliários, ETFs e BDRs. As filas andam devagar em sentidos opostos. O wordmark tem as letras em degradê e, onde o navegador liga animação à rolagem, a bandeira do "t" sobe pelo mastro enquanto a pessoa chega ao fim da página.

**Decisões que não aparecem na tela:**

- **A esteira é ornamento, não cotação.** Sem preço, sem variação, sem nome de empresa. Só o ticker, que é o que menos envelhece. A lista é escolhida à mão e foi conferida na base em 12/11/2026 (todos listados, todos com ícone); ticker que sair da B3 ou trocar de código sai da lista.
- **Os ativos não são link.** O rodapé é o maior distribuidor de link interno do site, e a alocação dele é decisão de SEO (03/08 e 23/09/2026, em `NuFooter.vue`): 32 links novos em toda página mudariam essa conta. Se for para virarem link, a decisão é do dono.
- **A bandeira se pinta sozinha.** O ícone de cada ativo entra como `border-image` com `fill`: o miolo fica junto do mastro e a beirada estica até cobrir o pano, na cor em que o ícone acaba. Não há cor de empresa escrita no código. Se o serviço de ícones cair, a bandeira fica no cobalto da marca com a primeira letra do ticker.
- **Os ícones vêm de fora** (icons.brapi.dev, o mesmo serviço das listas de ativos do site) e só são pedidos quando o rodapé chega a umas duas telas de distância.
- **O movimento é a exceção combinada** à regra do custo (`contrato.md`, seção 5). Só anima `transform`, para quando a esteira sai da tela e não existe com movimento reduzido. O botão de pausa saiu da tela, mas segue existindo para quem navega pelo teclado: aparece com o foco (o que se mexe sozinho por mais de 5 segundos precisa de um jeito de parar, WCAG 2.2.2).
- **O recorte do rodapé virou `overflow: clip`.** Com `hidden` o rodapé vira a caixa de rolagem do que está dentro, e a animação ligada à rolagem da página fica parada.

## Pendências que são do dono

- Registrar e apontar aportou.com.br (o site segue servindo em redentia.com.br até lá), com os 301 do domínio antigo.
- Nome do app nas lojas.
- Revisão jurídica dos Termos e da Privacidade (o termo definido "Redentia" passa a conviver com "Aportou").
- Contas de rede social e e-mail da Aportou.
