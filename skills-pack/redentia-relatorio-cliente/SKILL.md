---
name: redentia-relatorio-cliente
description: Gera o relatório de carteira de um cliente do escritório em PDF (modelo "Carta do private") a partir do MCP da Redentia, só com chave de escritório. Pergunta primeiro para qual cliente conectado gerar (list_clients) e, na mesma mensagem, se o relatório sai com a marca do escritório (nome, logo e cor); junta a carteira completa (get_client_portfolio), até cinco cenários de 12 meses da biblioteca (list_scenarios e simulate_client_scenario) e o mercado do dia (get_market_snapshot), escreve o resumo em quatro frases e roda o script da skill. Personalização mais funda (seções, capa, tom) se faz numa cópia do script. Use quando o usuário pedir "gera o relatório em PDF da Marina", "faz o PDF da carteira do João", "relatório mensal do cliente", "deixa o relatório com a cara do escritório". NÃO usar pra relatório em texto na conversa (redentia-clientes), carteira colada (redentia-carteira), cenário avulso (redentia-cenarios), chave pessoal nem pra recomendar compra, venda ou peso.
---

# Relatório do cliente em PDF

Você gera o relatório de carteira de UM cliente do escritório: um PDF no modelo "Carta do private", pronto para o assessor revisar e enviar. Todo número sai das ferramentas da Redentia; o texto que você escreve é o resumo de quatro frases da capa e, se o assessor quiser, uma saudação. O visual é da Redentia por padrão e passa a ser do escritório quando ele informa a marca.

O que o PDF traz (4 páginas na carteira típica; a composição ganha páginas de continuação quando a carteira é grande):

| Página | Conteúdo |
|---|---|
| 1 | Capa: marca, cliente, assessor, custódia, patrimônio, resultado sobre o custo, resumo em quatro frases, alocação por classe, três destaques e o sumário |
| 2 | Composição e resultado: todas as posições agrupadas por classe, com quantidade, preço médio, preço atual, valor, peso e resultado; distribuição por setor |
| 3 | Cenários para os próximos 12 meses: faixa pessimista a otimista, caminho central e quem mais sente cada choque (sai do PDF quando não há cenário) |
| 4 | Proventos a receber, retrato do mercado no dia, notas de método e assinatura |

## Quem pode usar

Só chave de escritório (`rdt_biz_`) numa conta com Clientes do escritório habilitado: é ela que tem `list_clients`, `get_client_portfolio` e `simulate_client_scenario`. Se essas ferramentas não estão nesta sessão, responda assim e pare:

> O relatório em PDF é feito a partir dos clientes conectados ao escritório, e isso só existe com chave de escritório (rdt_biz_) numa conta com o recurso habilitado. Pra habilitar: contato@redentia.com.

Você também precisa rodar Python com a biblioteca reportlab. No claude.ai e no Claude Desktop com execução de código ela já vem instalada. No Claude Code, se o import falhar, rode `pip install reportlab` (ou `python3 -m pip install --user reportlab`) e tente de novo.

## Passo 1 — Perguntar qual cliente e, de uma vez, a marca (obrigatório)

Nunca escolha o cliente sozinho: nem quando o usuário já citou um nome, nem quando só existe um. Chame:

```
list_clients{ status: "active" }
```

e pergunte numa única mensagem, mostrando a lista:

> Para qual cliente eu gero o relatório?
> 1. Marina Souza · Itaú · R$ 412.300 · conectada desde 02/10
> 2. João Lima · Nubank · R$ 188.950 · conectado desde 05/10
>
> Se quiser o relatório com a cara do escritório, me diga também o nome do escritório e a cor principal (em hex, como #1F4E79), e anexe o logo em PNG ou JPG. E como assino: seu nome.

Regras desta pergunta:
- Mostre nome, instituição (`institution`), valor (`total_value`) e data de conexão (`connected_at`) de cada cliente ativo.
- Se o usuário já disse um nome, ainda assim confirme: "É a Marina Souza (Itaú, R$ 412.300)? Posso gerar?".
- Lista vazia: não gere nada. Explique que nenhum cliente está com acesso ativo e ofereça o convite pela skill redentia-clientes.
- Cliente `pending`, `revoked` ou `expired` não tem carteira legível. Diga o status e ofereça um convite novo.
- Marca e assinatura são opcionais. Sem marca, o PDF sai no visual da Redentia; sem assinatura, com "Seu assessor de investimentos". O usuário pode responder só o número do cliente.
- Marca informada em outra conversa não vale aqui: nada fica guardado, então pergunte de novo.

Só siga para o Passo 2 depois da resposta.

## Passo 2 — Juntar os dados

Com o `client_id` escolhido, chame em sequência:

1. `get_client_portfolio{ client_id, detail: "completo" }`: todas as posições, alocação por classe e setor, concentração, proventos a receber e a instituição.
2. `list_scenarios{}`: os slugs da biblioteca (`scenarios[].slug`, `title`, `kind`).
3. `simulate_client_scenario{ client_id, scenario_slug, horizon_years: 1 }` para até 5 cenários da biblioteca, um por chamada. Escolha nesta ordem, pulando o que não existir no catálogo:
   - os dois cenários fiscais vigentes (consolidação e expansão);
   - juros (Selic +3 pontos);
   - câmbio (dólar a R$ 7);
   - um choque histórico (um choque como o de 2020).
4. `get_market_snapshot{}`: Ibovespa, IFIX, Selic meta, IPCA 12 meses e dólar.

Só cenário de biblioteca entra no relatório: ele tem premissas e fontes publicadas. Cenário montado na hora só se o usuário pedir um específico, e o PDF o rotula como "montado na hora, sem precedente".

Se uma simulação voltar com recusa de limite, espere cerca de 60 segundos e repita só ela. Se insistir, gere com os cenários que deram certo: o script aceita de 0 a 5. Uma rodada completa gasta 8 a 9 chamadas, 5 delas de simulação: cabe no limite de simulações da chave de escritório.

<!-- @partial:limites-simulacao -->

## Passo 3 — Escrever o resumo da capa

Quatro frases sobre esta carteira, só com números que vieram das ferramentas:

1. Como o patrimônio está distribuído (`allocation.by_class`; pesos vêm em fração de 0 a 1, multiplique por 100).
2. Concentração: quanto somam as cinco maiores posições (`concentration.top5_weight`).
3. Proventos a receber, com valor e datas (`upcoming_dividends[]`), se houver.
4. A faixa dos caminhos centrais dos cenários: do pior ao melhor p50, com o nome de cada cenário. Sem cenário, uma frase sobre o resultado acumulado (`totals.pnl_pct`), se vier.

Pode usar `<b>` para destacar até um trecho por frase. O tom certo:

> A carteira está distribuída em quatro classes, com <b>30% em Tesouro Direto</b>, metade disso protegida da inflação. As cinco maiores posições somam <b>53% do patrimônio</b>. Os FIIs HGLG11 e KNCR11 pagam <b>R$ 659 em rendimentos</b> entre 14 e 15 de outubro. Nos cenários simulados para os próximos 12 meses, o caminho central vai de <b>−9,6%</b> (expansão fiscal) a <b>+22,4%</b> (consolidação fiscal).

Proibido no resumo:
- recomendar compra, venda, troca, aporte ou peso, nem de forma indireta ("seria bom reduzir…");
- "previsão", "prever", "vai subir", "vai cair", "garantido", "calibrado";
- adjetivar o risco ("carteira arriscada", "perfil agressivo");
- número que não está nos dados.

Sem resumo, o script escreve um descritivo a partir dos números.

A saudação, quando o assessor pedir, é uma linha pessoal na capa ("Marina, este é o retrato da sua carteira em outubro."). Sem recomendação e sem número que não veio das ferramentas.

## Passo 4 — Montar o dados.json

Grave `dados.json` na pasta de trabalho:

```json
{
  "carteira": { "...": "o data de get_client_portfolio, completo" },
  "cenarios": [ { "...": "o data de cada simulate_client_scenario" } ],
  "mercado": { "...": "o data de get_market_snapshot" },
  "assessor": "Nome do assessor",
  "escritorio": "Nome do escritório",
  "resumo": "As quatro frases do Passo 3",
  "titulo": "Relatório de carteira",
  "saudacao": "Uma linha pessoal na capa",
  "marca": { "nome": "Alvorada Capital", "cor": "#1F4E79", "logo": "logo.png", "mostrar_redentia": true },
  "secoes": { "cenarios": true, "proventos": true, "mercado": true }
}
```

| Campo | Regra |
|---|---|
| `carteira`, `cenarios`, `mercado` | os objetos `data` inteiros, sem editar número, sem arredondar, sem traduzir campo. O script lê os nomes do MCP e aceita também o envelope inteiro |
| `assessor`, `escritorio`, `resumo` | opcionais |
| `titulo` | opcional; padrão "Relatório de carteira". Aparece na capa e no cabeçalho |
| `saudacao` | opcional; só se o assessor pediu |
| `marca.nome` | o nome do escritório no cabeçalho, na capa, no rodapé e na assinatura |
| `marca.cor` | hex `#RRGGBB`; vai para os acentos e para o patrimônio em destaque. Cor clara demais fica só nos detalhes (barras e marcadores): o script decide pelo contraste |
| `marca.logo` | caminho do PNG ou JPG que o usuário anexou (salve o anexo na pasta de trabalho). Qualquer proporção: o encaixe é proporcional |
| `marca.mostrar_redentia` | padrão `true`: mantém "dados e cenários Redentia" discreto no rodapé. `false` tira toda menção à Redentia do PDF |
| `secoes` | desliga cenários, proventos ou mercado. A paginação se ajusta sozinha |

Não invente campo que o MCP não devolveu. O que faltar sai do PDF sem quebrar o layout: sem proventos, a última página diz que não há provento anunciado; sem cenário, a página de cenários não existe.

## Passo 5 — Gerar o PDF

```bash
python3 <pasta-desta-skill>/scripts/gerar_relatorio.py dados.json "relatorio-<cliente>-<aaaa-mm-dd>.pdf"
```

- O script usa as fontes e o logo de `scripts/assets/`: não mova a pasta.
- A saída esperada é `ok: <arquivo> (N páginas)`. Qualquer outra coisa é erro: leia a mensagem, corrija o `dados.json` e rode de novo. Avisos sobre logo ou cor não impedem a geração: o PDF sai sem aquele item, e você diz isso na entrega.
- Nome do arquivo sem acento e sem espaço (`relatorio-marina-souza-2026-10-07.pdf`).
- Confira antes de entregar: converta a capa em imagem (ou abra o PDF) e veja se o logo e a cor entraram.
- Assim que o PDF existir, apague o `dados.json` e o logo copiado. Eles carregam a carteira do cliente e não ficam na pasta.

## Passo 6 — Entregar

Entregue o PDF (no claude.ai, salve em `/mnt/user-data/outputs/` para aparecer como download; no Claude Code, informe o caminho) e, na conversa, só isto:

1. Uma linha dizendo para quem é, a data das cotações e quantos cenários entraram.
2. Uma única vez por conversa: "Revise antes de enviar: o que chega ao cliente é responsabilidade do escritório."
3. Uma única vez por conversa, depois da primeira entrega, o convite para o relatório ser do escritório:

> Esse é o modelo da Redentia. Como ele roda aqui no Claude, dá para deixar com a cara do escritório: logo, cores, seções, tom. É só pedir.

Se o relatório já saiu com marca, o convite vira: "Dá para ir além: reordenar seções, mudar a capa, tirar ou acrescentar blocos. É só pedir."

Não repita o relatório em texto e não cole as posições na conversa.

## Passo 7 — Personalização além do dados.json

Logo, cor, nome, título, saudação e seções se resolvem pelo `dados.json`. Pedidos mais fundos (reordenar seções, mudar a capa, acrescentar um bloco, trocar a tipografia do título, outro idioma) se resolvem editando o script:

1. Copie `scripts/gerar_relatorio.py` para a pasta de trabalho (ex.: `relatorio_escritorio.py`). O original nunca muda: ele é o modelo da Redentia.
2. Edite a cópia. Há uma função por página (`pagina_capa`, `pagina_composicao`, `pagina_cenarios`, `pagina_notas`) e `planejar` define a ordem. Na cópia, aponte `ASSETS` para o caminho absoluto de `scripts/assets/` da skill.
3. Gere com a cópia, confira o resultado em imagem e entregue. Diga ao usuário que a cópia vive na pasta de trabalho desta conversa.

Três regras valem em qualquer versão do script, e você as mantém mesmo que o pedido vá contra elas:
- todo número vem do MCP: nada de valor digitado, estimado ou "ajustado";
- sem recomendação, preço-alvo, "oportunidade" ou "alerta";
- sem "previsão" nem "calibrado": cenário é faixa estatística sob premissas declaradas, e o aviso de método fica.

## Regras duras

- **Um cliente por relatório.** Para outro cliente, volte ao Passo 1.
- **O dado do cliente vive no PDF entregue e na conversa.** O `dados.json` é apagado no Passo 5. Nada de carteira em memória, nota, projeto ou planilha, nem "para a próxima vez".
- **Nada sai para outro serviço.** Não envie a carteira para busca na web, e-mail ou outra ferramenta. Quem envia o PDF ao cliente é o assessor, pelo canal do escritório.
- **Sem recomendação.** O relatório descreve a carteira e mostra cenários. Decisão de compra, venda ou peso é conversa do assessor com o cliente, fora do PDF.
- **Cenário não é previsão.** Faixa estatística em poder de compra de hoje. Nunca "previsão", nunca "calibrado".

## O que esta skill recusa

- Gerar sem perguntar qual cliente.
- Gerar para cliente sem acesso ativo, ou montar uma carteira a partir de print, extrato ou lista colada para parecer conectada.
- Acrescentar recomendação, preço-alvo, "oportunidade" ou "alerta de venda" ao PDF, em qualquer versão do script.
- Editar números do MCP para "arredondar a história".
- Relatório consolidado de vários clientes.

Se o usuário pedir algo disso, diga em uma linha por que não e ofereça o que é possível.

## Erros comuns e o que fazer

| Situação | O que fazer |
|---|---|
| "Cliente não encontrado" | Chame `list_clients{}` de novo e mostre o status: pode ter sido revogado ou vencido. |
| Limite de simulações | Espere cerca de 60 segundos e repita só a simulação que falhou. Se insistir, gere com menos cenários. |
| `ModuleNotFoundError: reportlab` | Instale (`pip install reportlab`) e rode de novo. |
| "dados.json sem a chave obrigatória 'carteira'" ou "carteira sem posições" | O `dados.json` está sem o `data` completo de `get_client_portfolio`. Refaça o Passo 4. |
| "aviso: logo não encontrado" ou "cor inválida" | O PDF saiu sem o logo ou com a cor padrão. Confira o caminho do arquivo ou o formato `#RRGGBB` e gere de novo. |
| Carteira com muitas posições | A composição continua nas páginas seguintes, com o grupo repetido; o sumário da capa segue a numeração real. |
| Posição em cripto | Entra na composição, mas fica fora dos cenários. O `excluded[]` da simulação diz isso: mencione na entrega. |
| Nome de ativo cru ("PETROBRAS   PN      N2") | O PDF mostra o ticker; na conversa, limpe o nome. |
