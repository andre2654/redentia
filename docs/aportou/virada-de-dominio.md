# A virada de domínio: Aportou em aportou.com.br, Redentia (B2B) em redentia.com.br

Escrito em 13/11/2026 (com os acréscimos da sessão do B2B no mesmo dia), a pedido do dono: "ele ficar com o B2B e você ficar com o B2C, criarmos aqui tudo para não prejudicar tanto o SEO, então passar parte das antigas rotas do redentia.com.br para aportou.com.br e tudo mais que precisar para subir os dois e tudo continuar funcionando".

Este arquivo é o contrato entre as duas sessões que constroem os sites: a do B2C (worktree `Frontend-wt-chat-painel`) e a do B2B (`RedentiaBusiness/` e o backend do B2B). Quem mudar uma regra daqui escreve a mudança aqui, com data, antes de construir em cima dela.

## 1. O que está em jogo (Search Console, 90 dias até 10/11/2026)

5.424 cliques do Google, 181 mil impressões, quase tudo em www.redentia.com.br:

| Onde o clique cai | Cliques | Parte |
|---|---|---|
| `/calculadora/*` (91 URLs) | 4.312 | 79,5% |
| `/` (a home) | 343 | 6,3% |
| `/ranking/*` | 281 | 5,2% |
| `/dividendos/*` | 171 | 3,2% |
| `/tesouro/*` | 103 | 1,9% |
| `/asset/*`, `/mcp`, `/calculadoras`, `/guias/*`, o resto | 214 | 3,9% |

94% do tráfego está em páginas de dentro, que a Aportou serve no mesmo caminho. Com 301 de URL para URL (o mesmo caminho em aportou.com.br), o Google passa o sinal de cada uma. Leva algumas semanas e costuma ter uma queda passageira. A home é a exceção: quem busca "redentia" passa a achar a Redentia de escritório, que fica com o nome. São 343 cliques em 90 dias.

**Não usar a ferramenta "Mudança de endereço" do Search Console.** Ela é para quando o site inteiro muda, e o redentia.com.br continua com um site (o B2B). Os 301 por URL bastam.

## 2. Quem faz o quê

| Quem | O quê |
|---|---|
| Sessão do B2C (`Frontend-wt-chat-painel`, branch `feat/chat-painel`) | O front da Aportou em aportou.com.br; a rede de segurança no próprio front (seção 4); o lado B2C do backend (`_fable-worktrees/be-aportou`, `feat/aportou-marca`): CORS, Sanctum e os links dos e-mails da Aportou; a varredura dos 301 depois da troca |
| Sessão do B2B (`RedentiaBusiness/` e as branches do backend do B2B) | O app novo em redentia.com.br: repositório, projeto na Vercel, o "resto vai para a Aportou" (seção 3), as rotas do cliente final, a tabela dos endereços antigos do /business, a Privacidade e os Termos do B2B, os links dos e-mails do escritório no backend |
| O dono | DNS, domínios na Vercel, Search Console, consoles do Google, da Apple e da Stripe, o `.env` da VPS, aprovar e mesclar os PRs, e o clique da troca (seção 5) |

## 3. O mapa dos endereços (o contrato)

**Endereço canônico de cada marca:** `https://aportou.com.br` (sem www; www.aportou.com.br manda para lá) e `https://www.redentia.com.br` (como hoje; o redentia.com.br sem www manda para o www).

**O que fica com o B2B em redentia.com.br:**

| Caminho | Por quê |
|---|---|
| `/` | A landing do B2B. Quem chega sem sessão vai para `/?entrar=1&volta=/app/...` (o modal de entrar da landing) |
| `/entrar` | Atalho do B2B: 302 para `/?entrar=1`. O `/login` continua indo para a Aportou (quem tem esse favorito é investidor) |
| `/app/**`, `/imprimir/**` | O app do escritório e o PDF |
| `/api/**` (o BFF), `/_nuxt/**`, `/__nuxt_error`, `/favicon.*` | O app novo |
| `/video/**`, `/media/**` | Os arquivos públicos do app novo (o herói da landing é um vídeo em `/video/`). A Aportou também tem `/video/` (o filme), mas só em aportou.com.br: o filme estreia lá e nunca esteve em redentia.com.br, então não há link antigo a preservar |
| `/jantar` e `/img/jantar/**` | O app novo porta a página da campanha. Se o dono disser que ela acabou, vira 301 para `/` |
| `/cliente/**`, `/business/convite/**` | Links pessoais que já foram mandados (convite da chave, convite e acesso do cliente final). O app novo serve os mesmos caminhos (`/cliente/convite/[token]`, `/cliente/acesso/[token]`, `/business/convite/[token]`) contra as rotas públicas do Laravel que já estão em produção (`business/client-invites/{token}` com `consent` e `connection`, `business/client-access/{token}` com `revoke`, `business/invites/{token}` com `redeem`), com `no-store`, `noindex` e `Referrer-Policy: no-referrer`. O widget da Pluggy do cliente final continua na origem redentia.com.br |
| `/business/**` (o resto), `/whitelabel`, `/pricing` | Os endereços antigos do B2B, com a mesma tabela de `server/utils/destino-b2b.ts` do front da Aportou (`/business` → `/`, `/business/clientes` → `/app/clientes`, `/business/chaves` e `/business/comecar` → `/app/escritorio`, `/business/skills` → `/app`, 301; links pessoais, 302) |
| Privacidade e Termos do B2B | Em caminhos novos (proposta: `/privacidade` e `/termos`), para não disputar o `/institucional/*` da Aportou |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt`, favicon | Os do B2B |
| `/email-logo.png`, `/email-logo-white.png`, `/email/**` | **Os mesmos arquivos**, copiados do `public/` da Aportou (em 13/11/2026: `email-logo.png`, `email-logo-white.png`, `email/aportou-logo.png`, `email/aportou-logo-branca.png`, `email/aportou-icone.png`, `email/brilho.jpg`). E-mails que já saíram apontam para essas imagens em www.redentia.com.br; servindo o arquivo, nenhum e-mail antigo fica sem logo (proxy de imagem nem sempre segue redirect). Quem mudar um desses arquivos na Aportou avisa a sessão do B2B |

**Todo o resto em redentia.com.br vai para a Aportou com 301, no mesmo caminho e com a mesma query** (no app novo, um middleware do Nitro com a lista fechada do que é do B2B; ele liga por configuração, para não atrapalhar o localhost, e **tem de estar ligado em produção antes da troca**): `https://aportou.com.br{caminho}{?query}`. Isso cobre as calculadoras, os rankings, os ativos, as teses, os guias, `/login`, `/carteira`, `/assinar`, `/mcp`, `/institucional/*`, os sitemaps antigos e o que vier de link velho. Sem lista fechada: o que não é do B2B é da Aportou.

**Na Aportou (aportou.com.br):** os caminhos de hoje, sem mudança. Os endereços do B2B (`/business`, `/cliente`, `/jantar`, `/whitelabel`, `/pricing`) já levam para redentia.com.br (`server/middleware/b2b-para-redentia.ts`).

## 4. A rede de segurança no front da Aportou

Enquanto o domínio redentia.com.br ainda estiver no projeto da Vercel da Aportou (antes e durante a troca), o próprio front da Aportou faz o 301 do "resto": pedido com host `redentia.com.br` ou `www.redentia.com.br` vai para `https://aportou.com.br` no mesmo caminho (`server/middleware/host-antigo.ts`, `destinoNaAportou` em `server/utils/destino-b2b.ts`). Os caminhos do B2B seguem com o middleware que já existe. Assim, o B2C pode subir em aportou.com.br alguns minutos antes da troca sem duplicar conteúdo nos dois domínios.

Duas ressalvas:
- O 301 sai com `private, no-store`. Se a borda da Vercel guardasse o redirect sem separar por domínio, quem chegasse em aportou.com.br receberia um 301 para o próprio endereço, em laço.
- Uma página que a borda já tem em cache pode ser servida pelo domínio antigo sem passar pelo middleware. Ela sai com o canônico em aportou.com.br (`siteUrl`), e o Google consolida do mesmo jeito. A janela é a dos minutos entre o passo 3 e o passo 4.

## 5. A ordem da subida

Cada passo só começa com o anterior conferido. O dono dá os cliques.

**0. Pré-requisitos (o dono)**
1. O aportou.com.br está registrado (11/11/2026) e ainda no DNS automático do Registro.br. Apontar para a Vercel: trocar os servidores DNS para `ns1.vercel-dns.com` e `ns2.vercel-dns.com`, como o redentia.com.br. Os e-mails continuam @redentia.com.br, então não há MX a mexer.
2. Search Console: propriedade de domínio `aportou.com.br` (registro TXT no DNS).
3. Login com Google: origem autorizada `https://aportou.com.br` no cliente OAuth. Login com Apple: domínio `aportou.com.br` e retorno `https://aportou.com.br/login` no Services ID.
4. App Store Connect: URL de privacidade para `https://aportou.com.br/institucional/privacy` (o 301 cobre, mas é melhor trocar).
5. Pluggy: conferir no painel se há lista de origens permitidas para o widget e incluir aportou.com.br.

**1. Backend que serve os dois (antes de tudo)**
- B2C (sessão do B2C; feito em 13/11/2026 na `feat/aportou-marca` do `be-aportou`, commit 7939ad7, suíte inteira verde): o endereço de cada site no `config/app.php`, `url_frontend` (env `APORTOU_URL`) e `url_b2b` (env `B2B_URL`), os dois com `https://www.redentia.com.br` por padrão. `Marca::site()` devolve o site da marca, e o e-mail de código e o de troca de senha levam para o site de quem pediu. Os e-mails só de investidor, que caíam num `https://redentia.com.br` fixo porque a chave não existia, passam a ler `url_frontend`. As imagens dos e-mails da Aportou e a política de privacidade seguem `APORTOU_URL`. CORS e Sanctum aceitam aportou.com.br.
- B2B (sessão do B2B, pela sessão do backend do B2B): os convites e os e-mails do escritório leem `config('app.url_b2b')`, com um padrão próprio, para não depender da ordem de merge com a `feat/aportou-marca`.
- **O andre2654/redentia-api#26 (a parte 1 do backend do B2B) tem de estar mesclado antes da troca.** Sem ele, o `magic-link/verify` cria uma conta de investidor para quem entra no app do escritório. Os PRs 2 a 5 (equipe, famílias, leituras, relatórios) podem vir depois; antes é melhor.
- Sobe com os valores de hoje (tudo em www.redentia.com.br), então nada muda no ar até o passo 4.

**2. O app do B2B no ar num endereço provisório** (sessão do B2B, com o dono): o dono cria o repositório (proposta: `andre2654/redentia-business`, privado) e o projeto na Vercel com `NUXT_BACKEND_BASE`, `NUXT_CHAT_BASE`, `NUXT_BACKEND_FRONT_KEY` (segredo dele) e `NUXT_LEADS_ENSAIO`. A sessão do B2B deixa pronto o `.gitignore`, a configuração e a lista do que colar. Depois: o mapa da seção 3, as rotas do cliente final, Privacidade e Termos (o texto passa pelo dono). Testado no endereço `*.vercel.app`, inclusive o "resto vai para a Aportou".

**3. A Aportou no ar em aportou.com.br** (o dono, com a lista da sessão do B2C): domínio `aportou.com.br` (e www) no projeto da Vercel de hoje; `NUXT_PUBLIC_SITE_URL=https://aportou.com.br` no ambiente de produção; merge da `feat/chat-painel` com o que vai junto (a lista de "subir tudo"). A partir daqui a Aportou responde em aportou.com.br, e o redentia.com.br manda o "resto" para lá pela rede da seção 4.

**4. A troca** (minutos; o dono):
1. Na Vercel, mover `www.redentia.com.br` e `redentia.com.br` do projeto da Aportou para o projeto do B2B. O DNS do redentia.com.br já está na Vercel, então é só trocar de projeto.
2. No `.env` da VPS:
   - `APORTOU_URL=https://aportou.com.br`. As imagens dos e-mails da Aportou e a política de privacidade vão junto, a menos que `EMAIL_LOGO_APORTOU_URL`, `EMAIL_LOGO_APORTOU_WHITE_URL`, `EMAIL_ICONE_APORTOU_URL` ou `PRIVACY_URL` estejam definidas: se estiverem, trocar também.
   - `B2B_URL=https://www.redentia.com.br`: é o padrão, não precisa escrever.
   - `BILLING_SUCCESS_URL`, `BILLING_CANCEL_URL` e `BILLING_PORTAL_RETURN_URL` em aportou.com.br.
   - Se `CORS_ALLOWED_ORIGIN_PATTERNS` ou `SANCTUM_STATEFUL_DOMAINS` estiverem definidas, elas vencem a lista do código: incluir aportou.com.br nelas.
   - Depois, `config:cache` (se o deploy usa) e reiniciar o php-fpm.

**5. Depois da troca** (sessão do B2C):
- Mandar o sitemap de aportou.com.br no Search Console.
- Conferir, uma por uma e sem rajada, as 500 URLs do Search Console (90 dias, guardadas em `docs/aportou/virada-urls.json`): cada uma responde 301 para o mesmo caminho em aportou.com.br, e lá responde 200; a raiz responde 200 com a landing do B2B. O roteiro é `node scripts/conferir-virada.mjs` (uns 8 minutos; com `--base <endereço provisório> --sem-destino`, confere o app do B2B antes da troca).
- Acompanhar 28 dias, não 7 (a régua de ruído do site).

**Voltar atrás:** devolver os dois domínios ao projeto da Aportou na Vercel e o `.env` aos valores de antes. A rede da seção 4 continua mandando o resto para aportou.com.br.

## 6. O que muda para quem usa

- **Quem estava com sessão aberta no site** entra de novo em aportou.com.br. O cookie é do domínio, e levar a sessão de um domínio para o outro pela URL seria pior. O app do iPhone não muda nada: fala direto com a API.
- **Os links pessoais** (convites, acesso do cliente) continuam valendo no B2B.
- **Os e-mails antigos** continuam com logo (seção 3) e com links que caem no lugar certo (301).

## 7. Decisões que ficam com o dono

- Uma linha na landing do B2B para quem procura a Redentia de investidor ("Investe por conta própria? A Redentia de investidor agora é a Aportou", com link). Ela segura parte dos 343 cliques de busca da marca. Recomendado.
- Por alguns meses, "antes Redentia" na descrição da home da Aportou, para quem ainda busca o nome antigo. Recomendado.
- Canônico com ou sem www na Aportou (proposta: sem www). Precisa estar decidido antes do passo 3; depois disso, mudar exige outro redirect.
