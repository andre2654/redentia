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

## O filme no herói do visitante (13/11/2026)

O dono, com o filme de lançamento na mão (`aportou-lancamento-v3`, 52 segundos, em 16:9 e em 9:16): "vamos trocar a hero para quando não tem usuário logado para mostrar o nosso vídeo em full".

**O que ficou** (`HomeHeroVisitante.vue`, `HomeFilme.vue`, `public/video/`): o filme abre a home do visitante na largura inteira da tela, logo abaixo da régua, e enche a primeira dobra. O título (o único H1), a linha de apoio e a chamada vêm embaixo, depois da dobra, ainda no escuro. Saíram do herói o wordmark em cima do título e o palco com o leque (o filme mostra o teste; o `HomeLeque` segue no "como funciona", na home de quem tem conta e no /assinar).

**Decisões que não aparecem na tela:**

- **O filme aparece inteiro, sem corte** (`object-fit: contain`). Ele traz letras miúdas próprias na beira de baixo ("Simulação com carteira de exemplo. Não é promessa de retorno.", a linha do cartão final), e cortar para encher a tela as esconderia.
- **As faixas dos lados continuam o filme.** Numa janela mais larga que o filme sobram faixas dos lados (143 px de cada lado num Mac de 14 polegadas, de 1512 × 860). Cada linha da faixa tem a cor em que o filme acaba naquela altura (a média dos 3% de fora do quadro de agora), então o fundo dele segue até a beira da janela e a emenda some. É uma tela de 4 por 17 atrás do filme, refeita seis vezes por segundo, só quando há faixa (0,2 ms cada vez). A primeira versão ampliava o quadro inteiro com desfoque, como uma luz na parede; como o filme é mais escuro nas beiras que no meio, as faixas ficavam mais claras que a borda e o filme parecia uma caixa.
- **O filme enche a dobra e a barra do chat sai da frente** (o dono, 13/11/2026: "o item 2 faz sentido"). Por cima do filme, a barra cobria a letra miúda da cena do número; encaixada embaixo dele, roubava a dobra (o filme ficava com 1.070 de 1.512 px). Agora, enquanto a barra ficaria em cima do filme, o `HomeFilme` marca o `<html>` (`data-chat-barra="fora"`) e a barra desce e some; rolou e o filme subiu acima dela, ela volta. Com o foco dentro (quem chega pelo teclado), ela aparece. O teto é a altura da janela menos o que há em cima do palco, com um piso de 35% da largura para janela baixa demais. O que há em cima é medido: quando a pessoa fecha o aviso de cookies, o palco sobe e o filme cresce junto.
- **A seta de rolar** fica no lugar da barra, no centro de baixo (o dono: "e mostrar um símbolo no canto inferior que a pessoa pode rolar para baixo"; vendo a primeira, no canto esquerdo: "queria que fosse centralizado esse ícone e mais bonito"). É uma cápsula de vidro, como os controles, com duas divisas que descem e voltam três vezes e param. O toque leva a página ao título e passa o foco a ele; some quando a barra volta. O centro de baixo é onde o filme às vezes escreve, então nesses trechos a seta sai de cena (`TEXTO_NO_PE` no `HomeFilme.vue`, por formato). Os trechos foram medidos recortando a área da seta quatro vezes por segundo (`ffmpeg -vf "fps=4,scale=1920:1080,crop=192:151:864:929"` no 16:9; `scale=1080:1920,crop=216:230:432:1690` no 9:16) e olhando os recortes. Filme novo: medir de novo.
- **No celular em pé entra o 9:16**; nos demais, o 16:9.
- **Toca sozinho, sem som, e repete.** É o que o navegador permite. A capa é uma imagem (o quadro "Sua carteira é boa?", a 1,5 s), que chega antes do vídeo; a primeira volta parte desse mesmo quadro, para a imagem parada virar filme sem voltar atrás.
- **Não toca sozinho com "movimento reduzido" nem com economia de dados**, e aí nenhum vídeo é baixado: fica a capa com o botão "Assistir ao filme", que toca com som.
- **O som é escolha de quem vê.** "Ativar som" recomeça do início; com som o filme toca uma vez e para no cartão final. O botão de pausa fica sempre à vista (WCAG 2.2.2). Os dois ficam no canto de cima à direita: embaixo estão as letras miúdas do filme e a barra do chat.
- **Para sozinho fora da tela** e com a aba escondida, e volta de onde parou.
- **É a segunda exceção à regra do custo** ("nada de animação infinita", `contrato.md`, seção 5), depois da esteira do rodapé: um filme que repete. Por isso ele para fora da tela e não toca para quem pediu menos movimento.

**Os arquivos** (`public/video/aportou-lancamento-*`, 22 MB): para cada formato, HEVC primeiro (iPhone, Mac e Chrome tocam; pesa pouco mais da metade) e H.264 de reserva, com o som em AAC, o índice no começo do arquivo e um quadro-chave em 1,5 s. O filme é caro de comprimir: céu com grão e milhares de linhas finas. O que o faz caber é tirar o grão (`hqdn3d=2:2:8:8`): no tamanho do site ele não faz falta, e as letras miúdas, as linhas e o texto das telas seguem nítidos (conferido lado a lado com o original).

Recomprimido em 13/11/2026 (o dono: "tente comprimir mais"): de 36 para 22 MB. Quem vê no Mac ou no PC baixa 4,8 MB, eram 9,1; no celular, 3,1 MB, eram 5,4. A nota de qualidade (VMAF contra o original, de 0 a 100) caiu de 86,6 para 83,9 no 16:9. A diferença que se nota começa em uns 6 pontos, e quase tudo o que caiu é o grão que saiu. O AV1 foi testado e não compensou: no mesmo tamanho do HEVC, tinha trechos piores (nota mínima de 41 contra 52).

| Arquivo | Tamanho | Receita (ffmpeg) |
|---|---|---|
| `…-16x9.hevc.mp4` (1920×1080) | 4,8 MB | `-vf hqdn3d=2:2:8:8 -c:v libx265 -preset slow -crf 33 -tag:v hvc1 -x265-params aq-mode=3:psy-rd=0.8` |
| `…-16x9.mp4` (1920×1080) | 8,3 MB | `-vf hqdn3d=2:2:8:8 -c:v libx264 -preset slow -b:v 1200k -maxrate 2000k -bufsize 4000k` em duas passadas, `-profile:v high -level 4.1` |
| `…-9x16.hevc.mp4` (864×1536) | 3,1 MB | como o primeiro, com `scale=864:1536:flags=lanczos` antes do `hqdn3d` |
| `…-9x16.mp4` (720×1280) | 5,7 MB | como o segundo, com `scale=720:1280:flags=lanczos`, `-b:v 800k -maxrate 1400k -bufsize 2800k -level 4.0` |
| `…-16x9.webp`, `…-9x16.webp` | 44 e 32 KB | o quadro 45 (1,5 s) do original, WebP em qualidade 80 |

Todos com `-pix_fmt yuv420p -movflags +faststart -g 60 -force_key_frames 1.5 -c:a aac_at -b:a 96k -ac 2` (o AAC da Apple; fora do Mac, `-c:a aac -b:a 112k`). Os originais (53 e 62 MB) ficam com o dono, fora do repositório. Filme novo: mesma receita, mesmos nomes; se o quadro de abertura mudar, mude `COMECA_EM` no `HomeFilme.vue` e o quadro-chave, e meça de novo os trechos em que o filme escreve no centro de baixo (`TEXTO_NO_PE`).

**Em aberto com o dono:**

- **Os quatro vídeos somam 22 MB dentro do repositório**, num commit só deles (dá para tirar sem mexer no resto). Hospedar fora (um CDN de vídeo) é a alternativa; aí só muda `BASE` no `HomeFilme.vue`.
- **Não foi testado no Safari** (aqui só há o Chrome). O código já trata o caso conhecido dele (o tempo marcado antes dos metadados), mas falta ver num iPhone e num Mac de verdade.
- **Legenda.** Se o som do filme tem narração, o vídeo precisa de legenda (`<track>`) para quem não ouve.

## Pendências que são do dono

- Registrar e apontar aportou.com.br (o site segue servindo em redentia.com.br até lá), com os 301 do domínio antigo.
- Nome do app nas lojas.
- Revisão jurídica dos Termos e da Privacidade (o termo definido "Redentia" passa a conviver com "Aportou").
- Contas de rede social e e-mail da Aportou.
