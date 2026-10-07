---
name: redentia-relatorio-cliente
description: Gera o relatório de carteira de um cliente do escritório em PDF de 4 páginas (modelo "Carta do private") a partir do MCP da Redentia, só com chave de escritório. Sempre pergunta primeiro para qual dos clientes conectados gerar (list_clients), depois junta a carteira completa (get_client_portfolio), os cenários de 12 meses da biblioteca (list_scenarios e simulate_client_scenario) e o mercado do dia (get_market_snapshot), escreve o resumo em quatro frases e roda o script que vem na skill para montar o PDF. Use quando o usuário pedir "gera o relatório em PDF da Marina", "quero o relatório do cliente pra mandar", "faz o PDF da carteira do João", "relatório mensal do cliente". NÃO usar pra relatório em texto na conversa (redentia-clientes), carteira colada na conversa (redentia-carteira), cenário avulso (redentia-cenarios), chave pessoal (não tem clientes) nem pra recomendar compra, venda ou peso.
---

# Relatório do cliente em PDF

Você gera o relatório de carteira de UM cliente do escritório: um PDF de 4 páginas, no modelo "Carta do private", pronto para o assessor revisar e enviar. Todo número do relatório sai das ferramentas da Redentia; o único texto que você escreve é o resumo de quatro frases da capa.

O que o PDF traz:

| Página | Conteúdo |
|---|---|
| 1 | Capa: nome do cliente, assessor, custódia, patrimônio, resultado sobre o custo, resumo em quatro frases, alocação por classe e três destaques |
| 2 | Composição e resultado: todas as posições agrupadas por classe, com quantidade, preço médio, preço atual, valor, peso e resultado; distribuição por setor |
| 3 | Cenários para os próximos 12 meses: faixa pessimista a otimista, caminho central e quem mais sente cada choque |
| 4 | Proventos a receber, retrato do mercado no dia, notas de método e assinatura do assessor |

## Quem pode usar

Só chave de escritório (`rdt_biz_`) numa conta com Clientes do escritório habilitado, porque é ela que tem `list_clients`, `get_client_portfolio` e `simulate_client_scenario`. Se essas ferramentas não estão nesta sessão, responda assim e pare:

> O relatório em PDF é feito a partir dos clientes conectados ao escritório, e isso só existe com chave de escritório (rdt_biz_) numa conta com o recurso habilitado. Pra habilitar: contato@redentia.com.

Você também precisa rodar Python com a biblioteca reportlab. No claude.ai e no Claude Desktop com execução de código ela já vem instalada. No Claude Code, se o import falhar, rode `pip install reportlab` (ou `python3 -m pip install --user reportlab`) e tente de novo.

## Passo 1 — Perguntar qual cliente (obrigatório)

Nunca escolha o cliente sozinho, nem quando o usuário já citou um nome e nem quando só existe um. Chame:

```
list_clients{ status: "active" }
```

e pergunte, mostrando a lista:

> Para qual cliente eu gero o relatório?
> 1. Marina Souza · Itaú · R$ 412.300 · conectada desde 02/10
> 2. João Lima · Nubank · R$ 188.950 · conectado desde 05/10
>
> Se quiser, me diga também como assino: seu nome e o nome do escritório.

Regras desta pergunta:
- Mostre nome, instituição (`institution`), valor (`total_value`) e data de conexão (`connected_at`) de cada cliente ativo.
- Se o usuário já disse um nome, ainda assim confirme: "É a Marina Souza (Itaú, R$ 412.300)? Posso gerar?".
- Se a lista vier vazia, não gere nada: explique que nenhum cliente está com acesso ativo e ofereça o convite pela skill redentia-clientes.
- Cliente com status `pending`, `revoked` ou `expired` não tem carteira legível. Diga o status e ofereça um convite novo.
- A assinatura é opcional. Sem ela, o PDF sai com "Seu assessor de investimentos".

Só siga para o Passo 2 depois da resposta do usuário.

## Passo 2 — Juntar os dados

Com o `client_id` escolhido, chame em sequência:

1. `get_client_portfolio{ client_id, detail: "completo" }` — todas as posições, alocação por classe e setor, concentração, proventos a receber e a instituição.
2. `list_scenarios{}` — para pegar os slugs da biblioteca.
3. `simulate_client_scenario{ client_id, scenario_slug, horizon_years: 1 }` para até 5 cenários da biblioteca, um de cada vez. Escolha por esta ordem, pulando o que não existir no catálogo:
   - os cenários de eleição ou fiscais vigentes (ex.: consolidação fiscal e expansão fiscal);
   - juros (ex.: Selic +3 p.p.);
   - câmbio (ex.: dólar a R$ 7);
   - um choque histórico (ex.: um choque como o de 2020).
4. `get_market_snapshot{}` — Ibovespa, IFIX, Selic, IPCA 12 meses e dólar do dia.

Use só cenários de biblioteca no relatório: eles têm premissas e fontes publicadas. Cenário montado na hora fica fora do PDF, a menos que o usuário peça um específico, e aí o PDF o rotula como "cenário montado na hora".

Se uma simulação falhar por limite, espere cerca de 60 segundos e repita só ela. Se continuar falhando, gere o relatório com os cenários que deram certo: o script aceita de 0 a 5.

<!-- @partial:limites-simulacao -->

## Passo 3 — Escrever o resumo da capa

Quatro frases, em português, sobre esta carteira e só com números que vieram das ferramentas. Um roteiro que funciona:

1. Como o patrimônio está distribuído (classes e o maior bloco).
2. Concentração: quanto somam as cinco maiores posições (`concentration.top5_weight`).
3. Proventos a receber nos próximos dias, com valor e datas, se houver.
4. A faixa central dos cenários: do pior ao melhor caminho central, com o nome de cada cenário.

Pode usar `<b>` para destacar até um trecho por frase. Exemplo do tom certo:

> A carteira está distribuída em quatro classes, com <b>30% em Tesouro Direto</b>, metade disso protegido da inflação. As cinco maiores posições somam <b>53% do patrimônio</b>. Os FIIs HGLG11 e KNCR11 pagam <b>R$ 659 em rendimentos</b> entre 14 e 15 de outubro. Nos cenários testados para os próximos 12 meses, a faixa central vai de <b>−9,6%</b> (expansão fiscal) a <b>+22,4%</b> (consolidação fiscal).

Proibido no resumo:
- recomendar compra, venda, troca, aporte ou peso, nem de forma indireta ("seria bom reduzir…");
- "previsão", "prever", "vai subir/cair", "garantido", "calibrado";
- adjetivar o risco do cliente ("carteira arriscada", "perfil agressivo");
- número que não está nos dados.

Se não houver resumo, o script escreve um resumo descritivo sozinho, a partir dos números.

## Passo 4 — Montar o dados.json

Grave um arquivo `dados.json` na pasta de trabalho com este formato:

```json
{
  "carteira": { ...o "data" de get_client_portfolio, completo... },
  "cenarios": [ { ...o "data" de cada simulate_client_scenario... } ],
  "mercado": { ...o "data" de get_market_snapshot... },
  "assessor": "Nome do assessor (opcional)",
  "escritorio": "Nome do escritório (opcional)",
  "resumo": "As quatro frases do Passo 3"
}
```

Regras:
- Copie os objetos `data` das respostas inteiros, sem editar números, sem arredondar e sem traduzir campos. O script lê os nomes de campo do MCP.
- O script também aceita o envelope inteiro (`{ "data": ... }`) e desembrulha sozinho, mas prefira o `data`.
- Não invente campos que o MCP não devolveu. O que faltar sai do PDF sem quebrar o layout (ex.: sem proventos, a página 4 diz que não há proventos anunciados).

## Passo 5 — Gerar o PDF

Rode o script que vem nesta skill, na pasta `scripts/`:

```bash
python3 <pasta-desta-skill>/scripts/gerar_relatorio.py dados.json "relatorio-<cliente>-<aaaa-mm-dd>.pdf"
```

- O script usa as fontes e o logo de `scripts/assets/`: não mova a pasta.
- A saída esperada é `ok: <arquivo> (4 páginas)`. Qualquer outra coisa é erro: leia a mensagem, corrija o `dados.json` e rode de novo. Não tente desenhar o PDF por outro caminho.
- Nome do arquivo: sem acento e sem espaço (ex.: `relatorio-marina-souza-2026-10-07.pdf`).
- Assim que o PDF existir, apague o `dados.json`. Ele carrega a carteira do cliente e não deve ficar na pasta.

## Passo 6 — Entregar

Entregue o PDF (link ou arquivo, conforme o ambiente) e, na conversa, só isto:

1. Se a carteira for de demonstração (`demo: true`), a PRIMEIRA linha da resposta é o aviso de DEMONSTRAÇÃO que veio do MCP, sem mudar uma palavra.
2. Uma linha dizendo para quem é, a data das cotações e quantos cenários entraram.
3. Uma única vez por conversa: "Revise antes de enviar: o que chega ao cliente é responsabilidade do escritório."

Não repita o relatório inteiro em texto e não cole as posições na conversa.

## Regras duras

- **Um cliente por relatório.** Nunca misture carteiras. Para outro cliente, volte ao Passo 1.
- **O dado do cliente vive no PDF entregue e na conversa.** O `dados.json` é apagado no Passo 5. Não guarde carteira em memória, nota, projeto ou planilha, nem "para a próxima vez".
- **Nada sai para outro serviço.** Não envie a carteira para busca na web, e-mail ou outra ferramenta. Quem envia o PDF ao cliente é o assessor, pelo canal do escritório.
- **Sem recomendação.** O relatório descreve a carteira e mostra cenários. Decisão de compra, venda ou peso é conversa do assessor com o cliente, fora do PDF.
- **Cenário não é previsão.** Faixa estatística em poder de compra de hoje. Nunca chame de previsão nem de calibrado.
- **Demonstração é dita.** Com `demo: true`, o PDF já marca no rodapé e nas notas, e você repete o aviso na primeira linha da resposta.

## O que esta skill recusa

- Gerar sem perguntar qual cliente.
- Gerar para cliente sem acesso ativo, ou "simular" uma carteira a partir de print, extrato ou lista colada para parecer conectada.
- Acrescentar recomendação, preço-alvo, "oportunidade" ou "alerta de venda" ao PDF.
- Editar números do MCP para "arredondar a história".
- Gerar relatório consolidado de vários clientes.

Se o usuário pedir algo disso, diga em uma linha por que não, e ofereça o que é possível.

## Erros comuns e o que fazer

| Situação | O que fazer |
|---|---|
| "Cliente não encontrado" | Chame `list_clients{}` de novo e mostre o status: pode ter sido revogado ou vencido. |
| Limite de simulações | Espere cerca de 60 segundos e repita só a simulação que falhou. Se insistir, gere com menos cenários. |
| `ModuleNotFoundError: reportlab` | Instale (`pip install reportlab`) e rode de novo. |
| Script fala de chave obrigatória ausente | O `dados.json` está sem `carteira`. Refaça o Passo 4. |
| Carteira com mais de 60 posições | O PDF mostra todas na página 2 até onde couber. Avise o usuário se a lista for muito longa. |
| Posição em cripto | Entra na composição, mas fica fora dos cenários (o motor não simula cripto). O `excluded` da simulação diz isso: mencione na entrega. |
