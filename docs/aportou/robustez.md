# Robustez: o sistema dos detalhes (11/11/2026)

O pedido do dono: "algumas coisas estão pouco intuitivas", "passar tela por tela, componente por componente", "algo premium e extremamente robusto, inspirado em Legora e Rogo". E: "essa aplicação é simples, não tem tantas cores; a sensação de robustez está nos micro detalhes: no espaçamento, nas fontes, nas animações, nas micro animações, nos efeitos. Absolutamente tudo tem que transmitir essa sensação."

Vale junto com `contrato.md` (a identidade), `decisoes.md` (nomes) e `tese.md`. Onde este documento e o contrato divergirem sobre DETALHE (peso, fio, sombra, movimento, espaçamento), vale este. A identidade (nome, cores, wordmark, corte, faixa da marca) continua a do contrato.

## 1. O que medimos (11/11/2026, legora.com e rogo.com a 1440px)

**Legora.** Títulos em peso 400 (h1 56px, h2 41px com −0,01em); número grande em 300 (90px, −0,03em). Corpo 15px/400, linha 1,3; legenda 13px. Tinta #0D1016, cinza quente #68655E, fundos #FAFAF9 e #E6E6E6, uma cor de marca. Sem sombra nenhuma. Raios 48/24/16 e pílula. Botão principal: pílula de 30px, 14px/500, com a bolinha branca da seta. Uma curva para tudo que muda de lugar: `cubic-bezier(.625,.05,0,1)` em 500ms. Links "⮑ Read more". Rodapé claro com o wordmark gigante.

**Rogo.** Título de exibição em serifa a 360–400 com −0,07em; títulos em sans a 480 com −0,03em; corpo 20px/400 com −0,02em; a interface do produto em 12–16px/500. Tinta #151515, cinzas #737373 e #78716C, fundos de pedra (#EEEDEC, #FAFAF9, #F5F4F2). Sombra em camadas: anel branco interno de 1px, anel de 1px a 5% e 5–6 camadas que somem (de 0,03 a 0,01). Separador de linha como `inset 0 -1px 0 rgba(12,10,9,.1)`. Raio 4 na interface, 16 nos cartões. Fio de 1px em pedra translúcida. Cor em 200ms `(.4,0,.2,1)`; movimento em 500ms `(.16,1,.3,1)`; opacidade em 350ms. Seções que grudam ao rolar, com o item ativo a 100% e os outros a 30%. Números de impacto em 120px/480 com "+" sobrescrito. Depoimento em serifa, centrado.

**O que as duas têm em comum (e é o que faz parecer firme):** contenção. O tamanho e o espaço fazem a hierarquia, não o negrito nem a cor. Fios finos e nítidos. Sombra que quase não se vê. Uma curva de movimento por papel, usada sempre. Texto pequeno impecável. Muito espaço em volta de pouca coisa.

## 2. Já aplicado na base (commit eb31f7d5)

- **Pesos por token.** `--nu-w-display` 500 (título e número a partir de ~36px), `--nu-w-forte` 600 (era 800), `--nu-w-medio` 600 (era 700), `<strong>` em 600. Componente NUNCA escreve peso em número: usa o token.
- **Fios de 1px** em `--nu-line`, `--nu-line-2`, `--nu-cream-line`, `--nu-dark-line`, `--nu-sage-line`, `--nu-dark-chip-line`. Borda de campo (`--nu-borda-campo`) e contorno de botão (`--nu-ink`) ficam em 1,5px: são sinal de interação.
- **Sombras em camadas**: `--nu-shadow-quente` (cartão creme em repouso), `--nu-shadow-branco` (cartão branco), `--nu-shadow-card` (cartão erguido, hover), `--nu-shadow-float` (menu, modal, painel), `--nu-shadow-escuro` (cartão carvão).
- **Movimento por token**: `--nu-ease-saida` `(.16,1,.3,1)` para o que chega e o hover; `--nu-ease-troca` `(.625,.05,0,1)` para o que muda de lugar (aba, indicador, acordeão, painel); `--nu-ease-cor` para cor e fundo. Durações `--nu-dur-rapida` 160ms, `--nu-dur-media` 280ms, `--nu-dur-lenta` 520ms, `--nu-dur-entrada` 720ms. Nenhuma curva que quica.
- **Tracking por token**: `--nu-ls-display` −0,035em, `--nu-ls-titulo` −0,02em, `--nu-ls-texto` −0,005em, `--nu-ls-caixa` 0,16em.
- **`--nu-coluna`**: a margem da coluna de 1240 (`max(clamp(20px,5.5vw,80px), calc((100% - 1240px) / 2))`). Use em vez de copiar a expressão.
- **`--nu-veu`**: o véu de modal e folha.
- **NuBotaoSeta** em três tamanhos: `g` 56px (herói, formulário), `m` 48px (seção, cartão), `p` 40px (dentro de cartão, linha de tabela). A bola cresce 4% e a seta atravessa no hover; apertar afunda 2%.
- A Redentia (B2B) devolve pesos e curva antigos em `tema-redentia.css`.

## 3. Os princípios, para cada componente

1. **Contenção.** Uma ação principal por dobra. O resto é link com seta (`NuLinkSeta`) ou fica recolhido. Nada de dois botões cheios lado a lado.
2. **Hierarquia pelo tamanho.** Título grande em `--nu-w-display`; cartão e rótulo em 600; corpo em 500. Se algo precisa de negrito para ser lido, está pequeno demais ou no lugar errado.
3. **Texto pequeno impecável.** Rótulo de interface em 13–14px/600 com `--nu-ls-texto`; legenda em 12,5–13px/500 em `--nu-gray`; caixa alta só no eyebrow e no cabeçalho de tabela, com `--nu-ls-caixa`. Números sempre tabulares, alinhados pela direita em coluna, com unidade e data ("em 12 meses", "fechamento de 06/11").
4. **Ritmo de 8px.** Espaços em 4/8/12/16/24/32/40/56/72/96/128. Seção: `clamp(72px, 8vw, 128px)` em cima e embaixo. Título → linha de apoio: 16–20px. Linha de apoio → conteúdo: 40–56px. Padding de cartão: 24 (pequeno), 28 (médio), 32–40 (grande). Raio concêntrico: o de dentro = o de fora − o padding.
5. **Fio, não caixa.** Separe com fio de 1px antes de pôr caixa. Cartão dentro de cartão só quando o de dentro é de outra natureza (um gráfico, um formulário).
6. **Sombra quase invisível.** Repouso em `--nu-shadow-quente`/`--nu-shadow-branco`; hover sobe 2px e passa a `--nu-shadow-card`. Nunca sombra escura e larga em cartão claro.
7. **Movimento com propósito.** O que chega (seção ao rolar, modal, menu): 720ms/520ms em `--nu-ease-saida`, de `translateY(12–16px)` e opacidade, em cascata de 60ms. O que muda de lugar (indicador de aba, acordeão, painel): 520ms em `--nu-ease-troca`. Hover: 280ms. Apertar: 160ms. Cor: 200ms em `--nu-ease-cor`. Só `transform` e `opacity` (e `filter` leve na entrada). Nada infinito além do anel do input e do esqueleto. `prefers-reduced-motion` desliga tudo.
8. **Estados completos.** Todo elemento interativo tem repouso, hover, foco (anel de 3px), apertado e desabilitado. Toda área de dado tem carregando (esqueleto do tamanho final, sem pulo), vazio (frase + próximo passo), erro (frase + "tentar de novo") e pronto. A troca entre estados anima (fade de 250ms), não pula.
9. **Intuitivo.** O que é clicável parece clicável (cursor, hover, seta). O rótulo diz o que acontece ("Abrir a carteira", não "Ver"). O estado atual está à vista (aba com indicador, filtro aplicado com contagem). Resposta em menos de 100ms ao clique (feedback antes do dado). Nenhum beco sem saída: toda tela vazia ou de erro tem o próximo passo. A mesma ação mora no mesmo lugar em toda tela.
10. **Coerência.** A mesma peça para a mesma função (seção 4). Peça local que faz o que uma peça da base já faz: troque pela da base.

## 4. As peças da base (components/nu)

| Peça | Para quê | Regras |
|---|---|---|
| `NuBotaoSeta` | a ação principal | `g`/`m`/`p`; uma por dobra |
| `NuLinkSeta` | a ação secundária, "Ver todos →", "Ler tudo" | seta que anda 3px; sublinhado que aparece no hover; alvo de 44px |
| `NuTrilho` | escolher uma entre poucas (período, aba, tipo, filtro) | trilho creme, a escolhida em pílula carvão que DESLIZA até a nova (520ms, `--nu-ease-troca`); setas do teclado; `claro`/`escuro`; 44px (`m`) ou 36px (`p`) |
| `NuSelo` | estado, variação, contagem, categoria | tons neutro/azul/verde/vermelho/ambar/carvao/contorno; `p`/`m`; ponto opcional; 600 tabular |
| `NuAcordeao` + `NuMais` | o que é longo e secundário | o "+" no círculo carvão que gira 45°; a altura anima (520ms, `--nu-ease-troca`); o conteúdo fica no HTML do servidor |
| `v-revelar` | a entrada ao rolar | ver seção 5 |
| `.nu-cartao` / `.nu-cartao--vivo` | superfície creme (vivo: clicável, sobe no hover) | raio do contrato, `--nu-shadow-quente` |
| `NuSkeleton` | carregando | sempre do tamanho final |
| `NuEyebrow`, `NuSectionHeading`, `NuFaixaMarca`, `MarcaCorte`, `MarcaAportou`, `MarcaIcone` | a identidade | como no contrato |

## 5. `v-revelar`: a entrada ao rolar sem esconder nada

`<section v-revelar>` ou `<ul v-revelar="{ alvo: 'filhos', passo: 60 }">`. Nunca esconde conteúdo no HTML (o texto sai pronto do servidor, o print e o Google veem tudo). Só no cliente, só se o elemento nasceu abaixo da dobra: quando ele chega a 20% da borda de baixo da tela, roda uma vez uma Web Animation de `opacity 0 → 1`, `translateY(14px) → 0` e `blur(6px) → 0`, em 720ms `--nu-ease-saida`, com `fill: 'backwards'` (e, em `alvo: 'filhos'`, cada filho com `passo` ms a mais). Movimento reduzido: nada.

## 6. Como passar numa tela

1. Fotografe ANTES, 1440 e 390, dobra a dobra (`foto.mjs`). Compare com a home, a /carteira e a /asset/PETR4 depois desta leva.
2. Liste, para cada bloco: o que fere os princípios da seção 3 (peso, fio, sombra, movimento, espaço, estado, intuição, coerência). Escreva a lista no relatório: é a auditoria.
3. Corrija com as peças da seção 4 e os tokens da seção 2. Troque peça local por peça da base.
4. Fotografe DEPOIS. Abra os estados (hover com `--clique` quando der, vazio, carregando, erro).
5. Nada de dado, regra, texto de conteúdo, URL, H1/title/description, JSON-LD, ordem de seção de página indexada. Nada de "compre/venda". B2B intocado.
