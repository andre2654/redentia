# Aportou: o contrato da identidade nova

Em 11/11/2026 o dono decidiu: **a Redentia de investidor (B2C) vira Aportou**, e **Redentia passa a ser só o produto de escritório (B2B)**. Este documento é o contrato que toda tela segue. Quem constrói lê isto inteiro antes de abrir um arquivo.

## 0. A direção: o meio-termo (decisão do dono, 11/11/2026)

O dono viu o topo da Aportou sobre a home que já existia e disse: "gostei mais da Aportou assim" e "será que conseguimos um meio-termo: o que temos agora da Redentia, com o que queremos da personalidade da Aportou". É essa a regra de toda tela:

- **Fica o que a Redentia já tem:** a estrutura das páginas, as seções, o conteúdo, os fluxos, os dados reais, os gráficos, os aparelhos do herói, o palco escuro do herói do visitante, a carteira na linha "A frase", a barra de pergunta no pé. Nada de reconstruir tela do zero a partir do quadro.
- **Entra a personalidade da Aportou:** o nome e o wordmark, a Figtree em pesos fortes (800 nos títulos), o creme da página, o cobalto, o carvão no lugar do navy e do preto, a sálvia como cor de apoio, o corte azul do "t" como sinal (eyebrow, IA, decoração), o eyebrow em caixa alta espaçada, a pílula com a seta no círculo, a faixa da marca nos cartões escuros de destaque, o anel do input mágico, os selos de raio 8, os fios de 1,5px, o texto claro ("Em claro: …") e as microtransições.
- **Dos quadros se tiram peças, não telas.** Um bloco do quadro só entra se melhora a tela que existe sem trocar o conteúdo dela (por exemplo: o cartão "SEUS DADOS", o "O que a Aportou não é", a lista "em claro"). Na dúvida, não entra, e você reporta a ideia.
- **A exceção é o /login:** a porta de entrada segue o quadro `Login.dc.html` de perto (é simples e é a primeira tela da marca), mantendo o fluxo de hoje.

A referência viva do meio-termo é a home do visitante em `http://localhost:3471/`: topo creme com o wordmark, herói escuro com o produto, título em 800, barra "Pergunte à Aportou" com o corte.

Os quadros em `docs/aportou/quadros/` (cópia do canvas do dono) são a referência da PERSONALIDADE: cor, tipo, peças, voz.

| Quadro | De onde tirar o quê |
|---|---|
| `A6-Identidade.dc.html` | Paleta, tipografia, wordmark, ícone, iconografia, essência |
| `Home.dc.html` | Topo, botões, eyebrow, faixa da marca, cartões, selos, planos, FAQ, chamada final, rodapé |
| `Login.dc.html` | Entrar: formulário, campos, botões, painel azul da marca (seguir de perto) |
| `Carteira.dc.html` | Como a marca veste cartões de dado, barras, tabelas e gráficos de carteira |
| `Ativo-SEQL3-v3.dc.html` | Como a marca veste cotação, indicadores "em claro", notícias, perguntas |
| `Assistente-IA.dc.html` | O input mágico (3 estados) e o chat: balões, chips, cabeçalho com a faixa |

Para VER um quadro ou o site: `node /Users/saraiva/Documents/GitHub/Redentia/_design-aportou/tools/foto.mjs` (instruções no topo do arquivo). Exemplos:

```bash
cd /Users/saraiva/Documents/GitHub/Redentia/_design-aportou/tools
node foto.mjs / /caminho/quadro.png 1440 900 --quadro=Home.dc.html --y=900   # o quadro
node foto.mjs / /caminho/site.png 1440 900 --y=900                           # o site local, visitante
node foto.mjs /carteira /caminho/cart.png 1440 900 --logado                  # logado (conta de teste local)
node foto.mjs / /caminho/cel.png 390 844                                     # celular
```

Depois leia o PNG com a ferramenta Read. O site local roda em `http://localhost:3471` (um servidor só, compartilhado, com HMR: **não suba outro**, não rode `nuxi dev` nem `npm run dev`).

## 1. A marca em uma página

- **Nome:** Aportou. No texto corrido é feminino e leva artigo: "a Aportou", "na Aportou", "da Aportou".
- **Frase:** "Investir fica mais claro."
- **Posicionamento:** inteligência financeira para quem está começando a investir. Explica em português claro. Não é corretora, não é guru, não diz "compre" nem "venda".
- **Assinatura de endosso:** "Uma empresa Redentia" (rodapé, login, e-mails).
- **A IA** se chama "IA da Aportou" (rótulo: `IA DA APORTOU`). Não existe mais "Redentia AI", "Atlas" para o investidor.
- **Voz:** frase curta, verbo no presente, número com contexto. Sem jargão sem tradução do lado ("Em claro: a empresa deve mais do que tem."). Sem exclamação, sem emoji, sem travessão. Segunda pessoa ("você").
- O nome do produto no código vem de `MARCA` (`shared/utils/marca.ts`, auto-importado). Não escreva "Aportou" solto em título de página, meta ou JSON-LD: use `MARCA.nome`. Em texto corrido de componente pode escrever.

## 2. Tokens (app/assets/css/tokens.css)

O prefixo `--nu-*` ficou (é interno). **Componente nunca escreve cor em hex**: só `var(--nu-*)`. Se faltar um token, peça (ver seção 9), não invente hex.

| Papel | Token | Valor |
|---|---|---|
| Fundo da página | `--nu-page` | `#F9F3EC` |
| Cartão creme sobre a página | `--nu-card` / `--nu-cream` | `#F6EEE5` / `#F4ECE1` |
| Faixa de seção, painel quente | `--nu-band` | `#F1E8DB` |
| Chip, trilho, hover creme | `--nu-cream-2` | `#EFE4D5` |
| Branco (cartão dentro de painel, campo) | `--nu-white` | `#FFFFFF` |
| Carvão: texto, seção escura, cartão escuro | `--nu-ink` (= `--nu-navy`) | `#111827` |
| Texto de apoio | `--nu-gray-3` | `#1F2937` |
| Texto secundário, legenda | `--nu-gray` | `#4B5563` |
| Cobalto: botão, ícone, gráfico, destaque | `--nu-blue` | `#2563EB` |
| Cobalto como LETRA e link sobre claro | `--nu-blue-text` | `#1D4ED8` |
| Cobalto sobre carvão | `--nu-blue-on-dark` | `#5B8CFF` |
| Azul claro (2ª e 3ª paradas da família) | `--nu-blue-soft` / `--nu-blue-pale` | `#A9C4FF` / `#C9DAFF` |
| Selo azul ("Fato") | `--nu-blue-bg` + `--nu-blue-text` | `#E6ECFA` |
| Sálvia: faixa de seção, cartão | `--nu-sage` | `#9AAE9B` |
| Creme da paleta (claro sobre escuro, barras) | `--nu-creme` | `#F6F2E9` |
| Texto sobre carvão: forte / apoio / legenda | `--nu-white` / `--nu-on-dark` / `--nu-on-dark-2` | `#FFF` / `#D1D5DB` / `#B6BCC8` |
| Chip e fio sobre carvão | `--nu-dark-chip`, `--nu-dark-chip-line`, `--nu-dark-line` | |
| Alta: letra / selo / sobre carvão / preenchimento | `--nu-green-text` / `--nu-green-bg` / `--nu-green-soft` / `--nu-green` | `#18703A` / `#DDF2E3` / `#86EFAC` / `#2F8F55` |
| Queda: letra / selo / sobre carvão | `--nu-red-text` / `--nu-red-bg` / `--nu-red-soft` | `#B42318` / `#FBE4E0` / `#FCA5A5` |
| Atenção: selo / letra / preenchimento | `--nu-amber-bg` / `--nu-amber-text` / `--nu-amber` | `#F7E8C6` / `#6B4200` / `#D9973A` |
| Fio 1,5px sobre creme | `--nu-line` (forte) / `--nu-line-2` (leve) | `#D9CDB9` / `#E6D9C6` |
| Borda de campo | `--nu-borda-campo` | `#B9AD99` |
| Gradiente cobalto (painéis grandes) | `--nu-grad-cobalto` | 120deg, 4 paradas |
| Anel do input mágico | `--nu-anel` | cobalto, céu, sálvia, areia |
| Raios | `--nu-r-pill` 999 · `--nu-r-secao` 40 · `--nu-r-card-lg` 32 · `--nu-r-card` 28 · `--nu-r-panel` 22 · `--nu-r-tile`/`--nu-r-input` 16 · `--nu-r-chip` 12 · `--nu-r-tag` 8 | |
| Sombras | `--nu-shadow-quente` (cartão creme: fio + 2px) · `--nu-shadow-branco` (cartão branco em painel) · `--nu-shadow-card` (cartão flutuando) · `--nu-shadow-escuro` (cartão carvão) | |

**Cor por classe de ativo** (uma família só, do carvão ao azul claro): renda fixa `--nu-alloc-fixed` (carvão), ações `--nu-alloc-stock` (cobalto), FIIs `--nu-alloc-fii` (azul claro), cripto `--nu-alloc-crypto` (âmbar), caixa/outros `--nu-alloc-cash` (sálvia).

**Tipografia:** Figtree (`--nu-font`). Pesos: 500 corpo, 600 apoio e nav, 700 destaque e botão, 800 título e número grande. Números tabulares (já no `body`).

| Papel | Tamanho | Estilo |
|---|---|---|
| H1 da home | `--nu-fs-hero-xl` clamp(54px, 7.2vw, 104px) | 800, lh 0.96, ls -0.04em |
| H1 de página | `--nu-fs-hero` clamp(44px, 6.4vw, 88px) | 800, lh 0.98, ls -0.035em |
| H2 de seção | `--nu-fs-h2` clamp(38px, 4.8vw, 62px) | 800, lh 1.02, ls -0.03em |
| H3 de cartão | `--nu-fs-h3` clamp(26px, 2.8vw, 38px) | 800, lh 1.05, ls -0.025em |
| Número-herói | clamp(46px, 5.2vw, 68px) e maiores | 800, lh 1, ls -0.035em |
| Lead | clamp(18px, 1.5vw, 21px) | 500, lh 1.45, `--nu-gray-3` |
| Corpo | 16 a 17px | 500, lh 1.5 |
| Eyebrow | `--nu-fs-marca` 13,5px | 700, caixa alta, ls 0.2em, com o corte |
| Rótulo de coluna/aba | 13,5 a 15px | 700, caixa alta, ls 0.16em |
| Legenda | 13,5 a 14,5px | 500/600, `--nu-gray` |

A escala de texto `--nu-fs-xs…2xl` continua valendo para o que não é título.

## 3. Peças prontas (use, não recrie)

| Peça | Arquivo | Para quê |
|---|---|---|
| `<MarcaAportou :altura="36" sobre="claro\|escuro\|azul" />` | `components/marca/` | O wordmark. Herda a cor do texto. |
| `<MarcaCorte :largura="22" cor="..." />` | `components/marca/` | O corte azul do "t": sinal da marca (eyebrow, avatar da IA, input mágico, decoração gigante com opacidade). |
| `<MarcaIcone :tamanho="44" />` | `components/marca/` | O ícone do app (o "a" branco no cobalto). |
| `<NuEyebrow sobre="claro\|escuro\|azul">TEXTO</NuEyebrow>` ou a classe `.nu-eyebrow` | `components/nu/` | Abre toda seção e toda tela. |
| `<NuSectionHeading eyebrow="...">Título<template #dek>…</template></NuSectionHeading>` | `components/nu/` | Eyebrow + H2 + dek. |
| `<NuBotaoSeta to="/x" variante="azul\|carvao\|creme\|contorno" tamanho="g\|m" [largo] [loading]>` | `components/nu/` | **A chamada principal**: pílula com a seta no círculo. Uma por dobra. |
| `<NuPillButton>` | `components/nu/` | Pílula cheia simples (envio de formulário sem seta). |
| `<NuFaixaMarca rotulo="PERGUNTE À IA" :altura="60">…</NuFaixaMarca>` | `components/nu/` | O cartão carvão com a aba cobalto (a "faixa da marca"). Slot `acoes` à direita da aba. |
| `NuSkeleton` | `components/nu/` | Loading é SEMPRE esqueleto. Nunca spinner, nunca "Carregando...". |
| Keyframes globais | `assets/css/base.css` | `nu-fade`, `nu-fade-lg`, `nu-subir` (modal/folha entrando), `nu-surgir` (fundo), `nu-anel`, `nu-ponto`, `nu-seta`, `nu-palavra`, `nu-shimmer`. |

## 4. Padrões dos quadros

Estes são os padrões da marca. Aplique-os às seções que já existem; não é uma lista de blocos a construir.

- **Página:** fundo creme `--nu-page`, contêiner `max-width: 1240px; padding: 0 32px` (20px no celular). Seções alternam o fundo: página, `--nu-band`, carvão, sálvia. **Não existe faixa branca de ponta a ponta.** Branco é só cartão e campo.
- **Seção:** `padding: clamp(64px, 7vw, 100px) 0`. Abre com eyebrow + H2 (gap 18px), conteúdo a 36–40px.
- **Cartão creme:** `background: var(--nu-card)` ou `--nu-band`; `border-radius: var(--nu-r-card)`; `box-shadow: var(--nu-shadow-quente)`; padding `clamp(24px, 3vw, 40px)`.
- **Cartão branco dentro de painel:** raio 22, `--nu-shadow-branco`.
- **Cartão carvão:** `NuFaixaMarca`, ou carvão liso com raio 28–32 (plano Pro, fatos).
- **Painel azul:** `background: var(--nu-grad-cobalto)`, raio 32–40, texto branco, apoio `--nu-blue-on-blue`, com o corte gigante branco a 8% de opacidade no canto.
- **Selo/etiqueta:** raio 8, 13,5–14px, 700. Ticker: carvão com letra branca 800 e ls 0.04em. Variação: `--nu-green-bg`/`--nu-green-text` (ou vermelho). "Atenção": âmbar. "Fato": azul.
- **Pílula-pergunta:** carvão, letra branca 700 15px, raio 999, padding 7px 15px (as aspas fazem parte: “Isso é bom ou ruim?”).
- **Chip de sugestão:** sobre claro `--nu-cream-2` (ou branco com sombra), sobre carvão `--nu-dark-chip` com borda `--nu-dark-chip-line`; altura mínima 44px, 14–14,5px 600.
- **Campo:** altura 56px, borda 1,5px `--nu-borda-campo`, raio 16, fundo branco, 17px; rótulo 15px 700 acima; foco: `outline: 3px solid var(--nu-blue); outline-offset: 1px; border-color: var(--nu-blue)`.
- **Botões:** principal = `NuBotaoSeta` azul. Segunda chamada = `NuBotaoSeta` carvão ou link em negrito sublinhado. "Continuar com Google" = pílula branca com borda 1,5px carvão, 58px. Botão de ícone = círculo 44px.
- **Lista "em claro":** linha creme (`--nu-page`) com raio 16: o dado numa etiqueta de contorno carvão → seta → "**Em claro:** tradução" → selo.
- **Barras empilhadas:** altura 26–30px, gap 4px, pontas arredondadas só nos extremos (15px fora, 5–6px dentro). Legenda com bolinha de 11–12px.
- **Passos numerados:** número gigante cobalto (clamp 64–88px, 800) sobre um fio carvão de 3px.
- **FAQ:** `<details>` com fios `--nu-line` de 1,5px, pergunta 19–22px 700, o "+" num círculo carvão de 36px que gira 45° ao abrir.
- **Lista de checagem:** check verde (`--nu-green-text`, traço 2,6) + texto 15,5px 600.
- **Aviso legal:** sempre curto e junto do número ("Simulação não garante resultado.", "Não é promessa de retorno."), em 13,5px.
- **Toque:** todo alvo clicável tem pelo menos 44px.
- **Responsivo:** os quadros usam `flex-wrap` com bases (`flex: 1 1 380px`), `clamp()` e container queries. Confira em 390px e 1440px. Sem rolagem horizontal.

## 5. Microtransições (o dono pediu)

Movimento curto, com propósito, e que respeita `prefers-reduced-motion` (já há um corte global em base.css).

- **Entrada de seção:** `nu-fade` (opacity + 10px) em 0,5s; itens de lista em cascata de 60ms. Use `useReveal` com `soEmbeleza` quando existir: nada fica invisível esperando o observer.
- **Botão:** hover escurece o fundo em 0,2s; a seta do `NuBotaoSeta` sai e volta; `:active` afunda 2%.
- **Cartão clicável:** sobe 2px e ganha `--nu-shadow-card` em 0,25s `cubic-bezier(.2,.8,.2,1)`; a seta do "Abrir →" anda 3px.
- **Link de rodapé/lista:** desliza 3px para a direita.
- **Modal e folha:** fundo com `nu-surgir` 0,2s; conteúdo com `nu-subir` 0,32s `cubic-bezier(.2,.8,.2,1)`. Fechar: o inverso em 0,18s.
- **FAQ/acordeão:** o "+" gira 45°; a resposta abre com altura animada (grid-rows 0fr→1fr) e fade.
- **Número que muda:** troca com fade de 0,2s, ou conta até o valor em até 0,8s na primeira vez que aparece.
- **Barra/medidor:** cresce da esquerda em 0,6s na entrada.
- **Input mágico:** o anel gira (7s em repouso, 4s digitando, 3s respondendo); ao focar cresce de 58 para 62px; respondendo vira a pílula carvão com os três pontos (`nu-ponto`).
- **Esqueleto → conteúdo:** fade de 0,25s, sem pulo de layout (o esqueleto tem a altura do conteúdo).
- **Foco:** anel cobalto de 3px (global).
- **Custo:** nada de animação infinita fora do anel do input e do esqueleto. Anime só `transform` e `opacity`.

## 6. O que NÃO muda

- **Dados e regras de negócio.** Esta leva é de identidade: cara, nome e texto. Não mexa em chamadas de API, composables de dados, cálculos, rotas, redirects, cache, sessão.
- **Números de verdade.** Os quadros trazem números de exemplo (R$ 115.019, 400+, R$ 24,99, SEQL3). No site só entra número que vem do dado real ou de uma constante que já existe no código (preço do plano, contagem de empresas). **Não invente e não copie número do quadro.** Se o quadro mostra um dado que o site não tem, deixe o bloco de fora e reporte.
- **CVM:** nada de "compre", "venda", "recomendamos". Ideia de troca só aparece para quem já aparece hoje.
- **SEO:** não troque URL, H1 de página indexada, texto de âncora de link interno nem a ordem das seções de conteúdo de páginas de busca (calculadoras, guias, ativo) sem necessidade do layout. Título de página e meta description ficam como estão, só o nome da marca muda.
- **B2B continua Redentia:** `/business/**`, `/cliente/**`, `/jantar`, `components/business/**`, `content/business/**`. Não toque. Essas telas rodam com `.marca-redentia` no body (`useMarcaRedentia()`), que devolve os tokens antigos.
- **Identificadores técnicos:** cookies (`nu:token`), chaves de storage, nomes de evento de analytics, nomes de arquivo e de componente, classes CSS, rotas de API, `redentia.com.br`, e-mails `@redentia.com.br`. Não renomeie.
- **Testes:** `npm test` (node:test) tem 603 testes verdes. Vários leem o texto dos componentes. Se um teste quebrar porque o texto ou a estrutura mudou de propósito, atualize o teste para o novo contrato; nunca apague o que ele protege.
- **Os apps (iOS, Mac, Watch)** não entram.

## 7. Texto: de Redentia para Aportou

- Em tela de investidor, "Redentia" como nome do produto vira "Aportou" ("a Redentia leu" → "a Aportou leu"). Releia a frase: se ficou torta, reescreva na voz da seção 1.
- "Redentia AI", "IA da Redentia", "Pergunte à Redentia" → "IA da Aportou", "Pergunte à IA".
- "Redentia Score" e outros nomes de produto derivados: **não troque sozinho**, reporte (é campo de API e URL).
- Razão social, CNPJ, e-mails e domínio: ficam.
- Comentário de código antigo não precisa ser reescrito; comentário novo fala em Aportou.

## 8. Como trabalhar (construtores em paralelo)

Várias pessoas editam esta mesma pasta ao mesmo tempo, cada uma na sua fatia.

- **Fique na sua fatia** (os caminhos que o seu briefing lista). Não edite arquivo de outra fatia.
- **Não edite a base:** `app/assets/css/**`, `components/marca/**`, `components/nu/**` (exceto se o briefing disser), `layouts/**`, `app.vue`, `nuxt.config.ts`, `shared/utils/marca.ts`. Precisa de algo na base? Veja a seção 9.
- **Não faça commit, não faça `git add`, não troque de branch, não use stash.** Só edite arquivos. O commit é de quem coordena.
- **Não suba servidor.** O site local já está em `http://localhost:3471`.
- **Não toque em produção**, não chame API externa, não instale dependência.
- **Veja o que fez** com o `foto.mjs`, em 1440 e em 390, antes e depois. Uma tela só está pronta quando você olhou a foto. Fotografe o quadro quando quiser conferir uma peça.
- **Confira antes de devolver:** `npx vue-tsc -b --noEmit 2>&1 | grep -c "error TS"` (a linha de base é 118; não pode subir por causa dos seus arquivos) e `npm test` (603 verdes; rode no fim, uma vez).
- **Devolva um relatório curto:** o que mudou (arquivos), o que ficou de fora e por quê, o que você viu nas fotos, pedidos para a base, e qualquer número ou texto do quadro que o site não tem.

## 9. Pedidos para a base

Faltou token, peça ou variante? Não improvise com hex nem com cópia de componente. Resolva localmente com o que existe (por exemplo `color-mix(in srgb, var(--nu-ink) 9%, var(--nu-page))`) e escreva no relatório final: "Pedido para a base: …". Quem coordena decide e ajusta.
