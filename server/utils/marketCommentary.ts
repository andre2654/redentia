import Anthropic from '@anthropic-ai/sdk'

// ============================================================
// Market Commentary generation with Claude + web_search tool
//
// Generates short, fact-based commentary explaining why a given
// market movement (index/sector/ticker) happened on a specific date.
// Uses Claude's native web_search tool to fetch real Brazilian
// market news instead of hallucinating reasons.
// ============================================================

export interface CommentaryCandidate {
  scope: 'index' | 'sector' | 'ticker'
  identifier: string
  date: string
  change_percent: number
  context_data: Record<string, any>
}

export interface CommentaryOutput {
  title: string
  commentary: string
  sources: Array<{ url: string; title: string }>
}

/**
 * Build a scope-specific user prompt with the data and ask Claude
 * to use web_search to find real news before writing.
 */
function buildUserPrompt(input: CommentaryCandidate): string {
  const formattedDate = formatDatePtBr(input.date)
  const direction = input.change_percent >= 0 ? 'alta' : 'queda'
  const absMove = Math.abs(input.change_percent).toFixed(2)

  const lines = [
    `Busque noticias REAIS do mercado brasileiro em ${formattedDate} (${input.date}) para explicar o seguinte movimento:`,
    '',
  ]

  if (input.scope === 'index') {
    lines.push(
      `Indice: ${input.identifier}`,
      `Variacao: ${direction} de ${absMove}%`,
    )
    const ctx = input.context_data
    if (ctx.current_price) {
      lines.push(`Cotacao atual: ${ctx.current_price}`)
    }
    if (ctx.previous_price) {
      lines.push(`Cotacao anterior: ${ctx.previous_price}`)
    }
    lines.push(
      '',
      'Use web_search para buscar noticias sobre o IBOVESPA/mercado brasileiro no dia especifico.',
      'Termos sugeridos: "IBOV ' + formattedDate + '", "mercado brasileiro hoje", "bolsa de valores ' + input.date + '".',
    )
  } else if (input.scope === 'sector') {
    lines.push(
      `Setor: ${input.identifier}`,
      `Variacao media: ${direction} de ${absMove}%`,
      `Numero de ativos: ${input.context_data.ticker_count || 'N/A'}`,
      '',
      `Use web_search para buscar noticias sobre o setor ${input.identifier} no Brasil no dia especifico.`,
      `Termos sugeridos: "setor ${input.identifier} ${formattedDate}", "acoes ${input.identifier} hoje".`,
    )
  } else if (input.scope === 'ticker') {
    const ctx = input.context_data
    lines.push(
      `Ticker: ${input.identifier}`,
      `Empresa: ${ctx.name || input.identifier}`,
      `Setor: ${ctx.sector || 'N/A'}`,
      `Variacao: ${direction} de ${absMove}%`,
      `Abertura: R$ ${ctx.open?.toFixed(2)} / Fechamento: R$ ${ctx.close?.toFixed(2)}`,
      `Maxima: R$ ${ctx.high?.toFixed(2)} / Minima: R$ ${ctx.low?.toFixed(2)}`,
      `Volume: ${ctx.volume?.toLocaleString('pt-BR')}`,
      '',
      `Use web_search para buscar noticias sobre ${input.identifier} (${ctx.name}) em ${formattedDate}.`,
      `Termos sugeridos: "${input.identifier} ${formattedDate}", "${ctx.name} noticia", "${input.identifier} fato relevante".`,
    )
  }

  lines.push(
    '',
    'IMPORTANTE: Apos buscar, escreva um comentario de 100-150 palavras explicando o motivo do movimento com base APENAS nas noticias encontradas. Se nao encontrar noticias especificas, cite o contexto macro/setorial mais provavel.',
    '',
    'Retorne SOMENTE um objeto JSON valido com o seguinte formato:',
    '{"title": "headline de 8 a 12 palavras", "commentary": "texto de 100-150 palavras em pt-BR"}',
    '',
    'Nao inclua markdown, backticks ou texto extra — apenas o JSON puro.',
  )

  return lines.join('\n')
}

function formatDatePtBr(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Extract sources (URLs) from Claude's response content blocks.
 * Web search tool results come back as content blocks with citations.
 */
function extractSources(
  content: Anthropic.Messages.ContentBlock[]
): Array<{ url: string; title: string }> {
  const sources: Array<{ url: string; title: string }> = []
  const seen = new Set<string>()

  for (const block of content) {
    // web_search_tool_result contains search results
    if ((block as any).type === 'web_search_tool_result') {
      const result = (block as any).content
      if (Array.isArray(result)) {
        for (const item of result) {
          if (item.type === 'web_search_result' && item.url && !seen.has(item.url)) {
            seen.add(item.url)
            sources.push({
              url: item.url,
              title: item.title || item.url,
            })
          }
        }
      }
    }

    // Text blocks may contain citations
    if (block.type === 'text' && (block as any).citations) {
      const citations = (block as any).citations
      if (Array.isArray(citations)) {
        for (const c of citations) {
          if (c.url && !seen.has(c.url)) {
            seen.add(c.url)
            sources.push({
              url: c.url,
              title: c.title || c.url,
            })
          }
        }
      }
    }
  }

  return sources
}

/**
 * Extract and parse the final text block (expecting JSON).
 */
function extractFinalText(
  content: Anthropic.Messages.ContentBlock[]
): string {
  // Find the LAST text block (after any tool_use/tool_result blocks)
  let lastText = ''
  for (const block of content) {
    if (block.type === 'text') {
      lastText = (block as Anthropic.Messages.TextBlock).text
    }
  }
  return lastText
}

/**
 * Strip Claude's inline citation tags like <cite index="1-4">text</cite>.
 * These are added automatically when web_search is used.
 */
function stripCitationTags(text: string): string {
  return text
    .replace(/<cite\s+index="[^"]*">/gi, '')
    .replace(/<\/cite>/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function tryParseJson(text: string): { title: string; commentary: string } | null {
  // Strip markdown code fences if present
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned)
    if (typeof parsed.title === 'string' && typeof parsed.commentary === 'string') {
      return { title: parsed.title, commentary: parsed.commentary }
    }
  } catch {
    // Try to find JSON object in text
    const match = cleaned.match(/\{[\s\S]*"title"[\s\S]*"commentary"[\s\S]*\}/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0])
        if (typeof parsed.title === 'string' && typeof parsed.commentary === 'string') {
          return { title: parsed.title, commentary: parsed.commentary }
        }
      } catch {
        // Ignore
      }
    }
  }

  return null
}

/**
 * Main generation function.
 */
export async function generateCommentary(
  input: CommentaryCandidate
): Promise<CommentaryOutput | null> {
  const config = useRuntimeConfig()

  if (!config.anthropicApiKey) {
    console.error('[marketCommentary] Anthropic API key missing')
    return null
  }

  const client = new Anthropic({
    apiKey: config.anthropicApiKey,
    timeout: 90_000,
  })

  const model =
    (config as any).anthropicCommentaryModel ||
    (config as any).anthropicChatModel ||
    'claude-sonnet-4-5'

  const systemPrompt = `Voce e um analista experiente do mercado financeiro brasileiro.

Sua tarefa: explicar de forma objetiva e baseada em FATOS o motivo de um movimento especifico do mercado em uma data especifica. Voce recebera dados brutos do movimento (indice/setor/ticker + variacao) e precisa buscar noticias reais do dia para fundamentar sua analise.

REGRAS CRITICAS:
1. USE web_search UMA UNICA VEZ com a query mais especifica possivel (ticker + data).
2. Priorize fontes confiaveis: infomoney, valor, bloomberg, reuters, money times, brazil journal, investing.com.
3. NAO invente motivos. Se nao encontrar noticias especificas, cite o contexto macro (juros, dolar, Fed, Ibovespa) ou setorial.
4. Seja objetivo, profissional, sem especulacoes exageradas.
5. Escreva 100-150 palavras, em portugues do Brasil.
6. Retorne APENAS um JSON valido: {"title": "...", "commentary": "..."}.
`.trim()

  const userPrompt = buildUserPrompt(input)

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          // Enable prompt caching on the system prompt since it's reused
          // across every generation. Anthropic caches for ~5min, and cached
          // reads cost 10% of normal input tokens.
          cache_control: { type: 'ephemeral' },
        },
      ] as any,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 1,
        } as any,
      ],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textOutput = extractFinalText(response.content)
    const parsed = tryParseJson(textOutput)

    if (!parsed) {
      console.error(
        `[marketCommentary] Failed to parse JSON for ${input.scope}:${input.identifier}:${input.date}`,
        { textOutput: textOutput.slice(0, 500) }
      )
      return null
    }

    const sources = extractSources(response.content)

    return {
      title: stripCitationTags(parsed.title).slice(0, 250),
      commentary: stripCitationTags(parsed.commentary),
      sources,
    }
  } catch (error) {
    console.error(
      `[marketCommentary] Error generating for ${input.scope}:${input.identifier}:${input.date}:`,
      error
    )
    return null
  }
}
