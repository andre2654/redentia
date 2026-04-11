// ============================================================
// useApiDocs — Single source of truth for the Redentia API docs.
//
// All endpoint definitions live here so the intro page, the
// sidebar nav, the dynamic endpoint pages and the search index
// render from the same typed structure. Shapes mirror what
// `redentia-api.saraivada.com/api/*` returns in production —
// verified via curl during scaffolding.
//
// No hooks into the actual backend yet; the playground's "Send"
// button is a mock. Wiring it to a real `fetch(...)` call is a
// trivial follow-up once the v1 routes ship (Sprint 3 of the
// Redentia API plan).
// ============================================================

export interface ApiDocParam {
  name: string
  type: string                // "string" | "integer" | "number" | "boolean"
  required: boolean
  description: string
  default?: string
  example?: string
  enum?: string[]             // allowed values if it's an enum
}

export interface ApiDocResponse {
  status: number              // 200, 400, 401, ...
  description: string
  bodyJson?: string           // JSON string for successful responses
  errorJson?: string          // JSON string for errors
}

export interface ApiDocCodeSample {
  lang: 'curl' | 'javascript' | 'python' | 'go' | 'java' | 'csharp'
  label: string
  code: string
}

export interface ApiDocEndpoint {
  slug: string                // URL identifier: "tickers-show", "prices", ...
  category: string            // "acoes" | "fundamentos" | "dividendos" | ...
  method: 'GET' | 'POST'
  path: string                // Display path: "/v1/tickers/{ticker}"
  title: string
  description: string
  longDescription?: string    // Longer prose for the detail page
  authorization: 'required' | 'optional' | 'none'
  pathParams?: ApiDocParam[]
  queryParams?: ApiDocParam[]
  responses: ApiDocResponse[]
  codeSamples: ApiDocCodeSample[]
}

export interface ApiDocCategory {
  id: string
  label: string
  icon: string
  endpoints: ApiDocEndpoint[]
}

// Shared auth param reused in every endpoint.
const AUTH_HEADER_NOTE = 'Informe o token via header `Authorization: Bearer <token>`.'

// Canonical base URL used in all code samples.
const BASE = 'https://api.redentia.com.br'

// --------------------------------------------------
// Helpers to compose code samples for every endpoint
// in all 6 supported languages. Keeps the data file
// readable — otherwise each endpoint would have 200
// lines of hand-written code.
// --------------------------------------------------

function makeSamples(method: string, path: string, queryString = ''): ApiDocCodeSample[] {
  const url = `${BASE}${path}${queryString ? `?${queryString}` : ''}`
  const urlPy = url
  const curl = `curl -X ${method} "${url}" \\\n  -H "Authorization: Bearer SEU_TOKEN"`
  const js = `const res = await fetch("${url}", {
  method: "${method}",
  headers: {
    "Authorization": "Bearer " + process.env.REDENTIA_TOKEN
  }
})
const data = await res.json()
console.log(data)`
  const py = `import requests

res = requests.${method.toLowerCase()}(
  "${urlPy}",
  headers={"Authorization": f"Bearer {os.environ['REDENTIA_TOKEN']}"}
)
print(res.json())`
  const go = `package main

import (
  "fmt"
  "io"
  "net/http"
  "os"
)

func main() {
  req, _ := http.NewRequest("${method}", "${url}", nil)
  req.Header.Set("Authorization", "Bearer "+os.Getenv("REDENTIA_TOKEN"))
  resp, _ := http.DefaultClient.Do(req)
  defer resp.Body.Close()
  body, _ := io.ReadAll(resp.Body)
  fmt.Println(string(body))
}`
  const java = `import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();
HttpRequest req = HttpRequest.newBuilder()
  .uri(URI.create("${url}"))
  .header("Authorization", "Bearer " + System.getenv("REDENTIA_TOKEN"))
  .${method.toLowerCase()}()
  .build();
HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
System.out.println(res.body());`
  const csharp = `using var client = new HttpClient();
client.DefaultRequestHeaders.Add(
  "Authorization",
  $"Bearer {Environment.GetEnvironmentVariable("REDENTIA_TOKEN")}"
);
var response = await client.GetStringAsync("${url}");
Console.WriteLine(response);`

  return [
    { lang: 'curl', label: 'cURL', code: curl },
    { lang: 'javascript', label: 'JavaScript', code: js },
    { lang: 'python', label: 'Python', code: py },
    { lang: 'go', label: 'Go', code: go },
    { lang: 'java', label: 'Java', code: java },
    { lang: 'csharp', label: 'C#', code: csharp },
  ]
}

// Generic error bodies — reused by every endpoint in responses[].
const ERR_400 = JSON.stringify({ error: 'bad_request', message: 'Parâmetro inválido ou ausente.' }, null, 2)
const ERR_401 = JSON.stringify({ error: 'unauthorized', message: 'Token ausente ou inválido.' }, null, 2)
const ERR_403 = JSON.stringify({ error: 'plan_required', message: 'Seu plano atual não inclui este endpoint.' }, null, 2)
const ERR_404 = JSON.stringify({ error: 'not_found', message: 'Ticker ou recurso não encontrado.' }, null, 2)
const ERR_429 = JSON.stringify({ error: 'rate_limited', message: 'Você excedeu seu limite. Tente novamente em breve.' }, null, 2)
const ERR_500 = JSON.stringify({ error: 'internal_error', message: 'Erro inesperado. Nossa equipe já foi notificada.' }, null, 2)

function defaultErrors(): ApiDocResponse[] {
  return [
    { status: 400, description: 'Requisição malformada', errorJson: ERR_400 },
    { status: 401, description: 'Não autenticado', errorJson: ERR_401 },
    { status: 403, description: 'Plano insuficiente', errorJson: ERR_403 },
    { status: 404, description: 'Recurso não encontrado', errorJson: ERR_404 },
    { status: 429, description: 'Rate limit excedido', errorJson: ERR_429 },
    { status: 500, description: 'Erro interno', errorJson: ERR_500 },
  ]
}

// ------------------- ENDPOINT DEFINITIONS -------------------

const ENDPOINTS: ApiDocEndpoint[] = [
  // ======================================================
  // AÇÕES — Tickers & Prices
  // ======================================================
  {
    slug: 'tickers-list',
    category: 'acoes',
    method: 'GET',
    path: '/v1/tickers',
    title: 'Listar Ativos',
    description: 'Lista completa de ativos negociados na B3 (ações, FIIs, ETFs, BDRs, índices), com nome, ticker, tipo e logo.',
    longDescription: 'Retorna uma lista paginada de todos os ativos disponíveis na plataforma. Útil para popular seletores, autocomplete e indexar tickers válidos no seu sistema antes de fazer chamadas mais específicas.',
    authorization: 'required',
    queryParams: [
      { name: 'type', type: 'string', required: false, description: 'Filtra por tipo do ativo.', enum: ['STOCK', 'REIT', 'ETF', 'BDR'] },
      { name: 'limit', type: 'integer', required: false, description: 'Número máximo de resultados.', default: '100' },
      { name: 'page', type: 'integer', required: false, description: 'Página para paginação.', default: '1' },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": [
    {
      "ticker": "PETR4",
      "name": "PETROBRAS PN",
      "type": "STOCK",
      "currency": "BRL",
      "logo": "https://icons.brapi.dev/icons/PETR4.svg"
    },
    {
      "ticker": "VALE3",
      "name": "VALE ON",
      "type": "STOCK",
      "currency": "BRL",
      "logo": "https://icons.brapi.dev/icons/VALE3.svg"
    }
  ],
  "meta": {
    "total": 1247,
    "page": 1,
    "per_page": 100
  }
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/tickers', 'type=STOCK&limit=50'),
  },

  {
    slug: 'tickers-show',
    category: 'acoes',
    method: 'GET',
    path: '/v1/tickers/{ticker}',
    title: 'Detalhes do Ativo',
    description: 'Retorna o perfil completo de um ativo específico: preço atual, variação, volume, market cap, dividend yield e setor.',
    longDescription: 'Endpoint principal para obter uma snapshot completa de um ativo. Combina dados de cotação, fundamentais básicos e informações da empresa em uma única resposta — economizando várias chamadas.',
    authorization: 'required',
    pathParams: [
      { name: 'ticker', type: 'string', required: true, description: 'Código B3 do ativo (ex: PETR4, VALE3, ITUB4).', example: 'PETR4' },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": {
    "symbol": "PETR4",
    "name": "PETROBRAS PN",
    "type": "STOCK",
    "currency": "BRL",
    "logo": "https://icons.brapi.dev/icons/PETR4.svg",
    "sector": "Energy",
    "industry": "Oil & Gas",
    "market_price": 49.03,
    "change_percent": 0.27,
    "volume": 56706200,
    "market_cap": 647000000000,
    "dividend_yield": 16.33,
    "pe_ratio": 6.18,
    "roe": 16.50,
    "price_at": "2026-04-11"
  }
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/tickers/PETR4'),
  },

  {
    slug: 'prices',
    category: 'acoes',
    method: 'GET',
    path: '/v1/tickers/{ticker}/prices',
    title: 'Preços Históricos (OHLCV)',
    description: 'Série completa de cotações do pregão B3: abertura, fechamento, máxima, mínima e volume. Perfeito para backtests e gráficos.',
    longDescription: 'Retorna a série histórica de preços de um ativo, respeitando o parâmetro `mode` para o período desejado. Dados desde 2009 no plano Pro — ideal para backtests e análise técnica.',
    authorization: 'required',
    pathParams: [
      { name: 'ticker', type: 'string', required: true, description: 'Código B3 do ativo.', example: 'PETR4' },
    ],
    queryParams: [
      { name: 'mode', type: 'string', required: false, description: 'Janela temporal da série.', default: '1mo', enum: ['1d', '5d', '1mo', '3mo', '6mo', '1y', '3y', '5y', 'max'] },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": [
    {
      "ticker": "PETR4",
      "market_price": 49.03,
      "change_percent": 0.27,
      "volume": 56706200,
      "open": 48.60,
      "high": 49.44,
      "low": 48.13,
      "price_at": "2026-04-11"
    },
    {
      "ticker": "PETR4",
      "market_price": 48.87,
      "change_percent": -0.33,
      "volume": 73234300,
      "open": 48.75,
      "high": 49.10,
      "low": 48.20,
      "price_at": "2026-04-10"
    }
  ]
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/tickers/PETR4/prices', 'mode=1mo'),
  },

  // ======================================================
  // FUNDAMENTAIS
  // ======================================================
  {
    slug: 'fundamentals-overview',
    category: 'fundamentos',
    method: 'GET',
    path: '/v1/fundamentals/{ticker}/overview',
    title: 'Overview Fundamentalista',
    description: 'Snapshot completa de indicadores fundamentalistas: P/L, P/VP, ROE, ROA, margem, dívida, FCL e múltiplos.',
    longDescription: 'Retorna todos os key statistics e financial data consolidados em um único objeto. É o endpoint ideal para screens rápidos e dashboards de análise fundamentalista.',
    authorization: 'required',
    pathParams: [
      { name: 'ticker', type: 'string', required: true, description: 'Código B3 do ativo.', example: 'PETR4' },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": {
    "ticker": "PETR4",
    "key_statistics": {
      "enterprise_value": 409990589127.41,
      "enterprise_to_ebitda": 1.97,
      "price_to_book": 1.02,
      "trailing_eps": 5.14,
      "forward_pe": 6.18,
      "dividend_yield": 16.33,
      "profit_margins": 0.1359,
      "shares_outstanding": 12888732761
    },
    "financial_data": {
      "currency": "BRL",
      "current_price": 49.03,
      "total_revenue": 487699000000,
      "gross_profits": 242094000000,
      "ebitda": 208078000000,
      "gross_margins": 0.4964,
      "operating_margins": 0.2750,
      "return_on_assets": 0.0564,
      "return_on_equity": 0.1650,
      "debt_to_equity": 92.44,
      "free_cashflow": 131886000000
    }
  }
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/fundamentals/PETR4/overview'),
  },

  {
    slug: 'fundamentals-income',
    category: 'fundamentos',
    method: 'GET',
    path: '/v1/fundamentals/{ticker}/income-statement',
    title: 'Demonstrativo de Resultados (DRE)',
    description: 'DRE completa anual e trimestral: receita, lucro bruto, EBIT, lucro líquido, despesas financeiras e impostos.',
    authorization: 'required',
    pathParams: [
      { name: 'ticker', type: 'string', required: true, description: 'Código B3 do ativo.', example: 'PETR4' },
    ],
    queryParams: [
      { name: 'period', type: 'string', required: false, description: 'Periodicidade desejada.', default: 'annual', enum: ['annual', 'quarterly'] },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": {
    "ticker": "PETR4",
    "annual": [
      {
        "period_end_date": "2024-12-31",
        "total_revenue": 490829000000,
        "gross_profit": 246462000000,
        "operating_income": -109261000000,
        "ebit": 137201000000,
        "net_income": 37009000000,
        "interest_expense": -92959000000,
        "income_tax_expense": -17721000000
      }
    ]
  }
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/fundamentals/PETR4/income-statement', 'period=annual'),
  },

  {
    slug: 'fundamentals-balance',
    category: 'fundamentos',
    method: 'GET',
    path: '/v1/fundamentals/{ticker}/balance-sheet',
    title: 'Balanço Patrimonial',
    description: 'Ativos, passivos e patrimônio líquido — anual ou trimestral, direto da CVM.',
    authorization: 'required',
    pathParams: [
      { name: 'ticker', type: 'string', required: true, description: 'Código B3 do ativo.', example: 'PETR4' },
    ],
    queryParams: [
      { name: 'period', type: 'string', required: false, description: 'Periodicidade.', default: 'annual', enum: ['annual', 'quarterly'] },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": {
    "ticker": "PETR4",
    "annual": [
      {
        "period_end_date": "2024-12-31",
        "total_assets": 1174890000000,
        "current_assets": 187543000000,
        "total_liabilities": 651247000000,
        "current_liabilities": 164218000000,
        "total_equity": 523643000000,
        "cash": 38177000000,
        "total_debt": 179180000000
      }
    ]
  }
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/fundamentals/PETR4/balance-sheet'),
  },

  {
    slug: 'fundamentals-cashflow',
    category: 'fundamentos',
    method: 'GET',
    path: '/v1/fundamentals/{ticker}/cash-flow',
    title: 'Fluxo de Caixa (DFC)',
    description: 'Fluxo de caixa operacional, de investimentos e de financiamento — com CAPEX e free cash flow.',
    authorization: 'required',
    pathParams: [
      { name: 'ticker', type: 'string', required: true, description: 'Código B3 do ativo.', example: 'PETR4' },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": {
    "ticker": "PETR4",
    "annual": [
      {
        "period_end_date": "2024-12-31",
        "operating_cashflow": 202148000000,
        "investing_cashflow": -70262000000,
        "financing_cashflow": -92318000000,
        "capital_expenditure": -70262000000,
        "free_cashflow": 131886000000,
        "dividends_paid": -78000000000
      }
    ]
  }
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/fundamentals/PETR4/cash-flow'),
  },

  // ======================================================
  // DIVIDENDOS
  // ======================================================
  {
    slug: 'dividends-history',
    category: 'dividendos',
    method: 'GET',
    path: '/v1/dividends/{ticker}',
    title: 'Histórico de Dividendos',
    description: 'Histórico completo de proventos por ticker. Inclui dividendos, JCP, bonificações e desdobramentos.',
    longDescription: 'Retorna todos os proventos pagos pelo ativo, ordenados do mais recente ao mais antigo. Cada registro traz data-com, data-pag, valor unitário e o tipo (Dividendo / JCP / Bonificação).',
    authorization: 'required',
    pathParams: [
      { name: 'ticker', type: 'string', required: true, description: 'Código B3 do ativo.', example: 'PETR4' },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": [
    {
      "ticker": "PETR4",
      "payment_date": "2026-03-18",
      "rate": 0.7500,
      "label": "Dividendo"
    },
    {
      "ticker": "PETR4",
      "payment_date": "2025-12-19",
      "rate": 1.0598,
      "label": "JCP"
    },
    {
      "ticker": "PETR4",
      "payment_date": "2025-09-25",
      "rate": 0.9184,
      "label": "Dividendo"
    }
  ]
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/dividends/PETR4'),
  },

  {
    slug: 'dividends-upcoming',
    category: 'dividendos',
    method: 'GET',
    path: '/v1/dividends/upcoming',
    title: 'Próximos Pagamentos',
    description: 'Calendário dos próximos 30 dias de pagamento de dividendos em toda a B3, ordenado por data.',
    authorization: 'required',
    queryParams: [
      { name: 'days', type: 'integer', required: false, description: 'Número de dias à frente.', default: '30' },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": [
    {
      "ticker": "BBAS3",
      "name": "BANCO DO BRASIL ON",
      "ex_date": "2026-04-15",
      "payment_date": "2026-04-28",
      "rate": 0.4210,
      "label": "Dividendo"
    },
    {
      "ticker": "ITUB4",
      "name": "ITAU UNIBANCO PN",
      "ex_date": "2026-04-18",
      "payment_date": "2026-05-02",
      "rate": 0.0150,
      "label": "JCP"
    }
  ]
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/dividends/upcoming', 'days=30'),
  },

  // ======================================================
  // RANKINGS
  // ======================================================
  {
    slug: 'rankings-top-stocks',
    category: 'rankings',
    method: 'GET',
    path: '/v1/top-stocks',
    title: 'Top Ações (Maiores Altas/Baixas)',
    description: 'Ranking das maiores altas ou baixas do pregão atual, filtrado por volume mínimo.',
    authorization: 'required',
    queryParams: [
      { name: 'side', type: 'string', required: false, description: 'Ordenação do ranking.', default: 'top', enum: ['top', 'bottom'] },
      { name: 'volume', type: 'integer', required: false, description: 'Volume mínimo (em BRL).', default: '500000' },
      { name: 'limit', type: 'integer', required: false, description: 'Número de ativos no ranking.', default: '20' },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": [
    {
      "ticker": "CALI3",
      "name": "CONST A LINDON",
      "logo": "https://icons.brapi.dev/icons/CALI.svg",
      "type": "STOCK",
      "market_price": 19.50,
      "change_percent": 19.63,
      "price_at": "10/04",
      "market_cap": 0
    },
    {
      "ticker": "BRBI11",
      "name": "BR PARTNERS",
      "market_price": 28.74,
      "change_percent": 12.41,
      "price_at": "10/04"
    }
  ]
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/top-stocks', 'side=top&limit=10'),
  },

  {
    slug: 'rankings-dy',
    category: 'rankings',
    method: 'GET',
    path: '/v1/rankings/top-dividend-yield',
    title: 'Top Dividend Yield',
    description: 'Ranking dos ativos com maior dividend yield acumulado nos últimos 12 meses.',
    authorization: 'required',
    queryParams: [
      { name: 'limit', type: 'integer', required: false, description: 'Número de ativos.', default: '20' },
      { name: 'type', type: 'string', required: false, description: 'Tipo do ativo.', enum: ['STOCK', 'REIT'] },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": [
    {
      "ticker": "BBAS3",
      "name": "BANCO DO BRASIL ON",
      "dividend_yield": 11.21,
      "market_price": 29.14,
      "sector": "Financial"
    },
    {
      "ticker": "PETR4",
      "name": "PETROBRAS PN",
      "dividend_yield": 16.33,
      "market_price": 49.03,
      "sector": "Energy"
    }
  ]
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/rankings/top-dividend-yield', 'limit=20'),
  },

  // ======================================================
  // SETORES
  // ======================================================
  {
    slug: 'sectors-list',
    category: 'setores',
    method: 'GET',
    path: '/v1/sectors',
    title: 'Listar Setores',
    description: 'Lista de todos os setores da B3 com médias setoriais de P/L, DY e ROE, e número de empresas.',
    authorization: 'required',
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": [
    {
      "slug": "energy",
      "name": "Energy",
      "companies": 14,
      "avg_pe": 7.82,
      "avg_dy": 9.34,
      "avg_roe": 12.18
    },
    {
      "slug": "financial",
      "name": "Financial Services",
      "companies": 38,
      "avg_pe": 8.14,
      "avg_dy": 6.92,
      "avg_roe": 15.42
    }
  ]
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/sectors'),
  },

  {
    slug: 'sectors-tickers',
    category: 'setores',
    method: 'GET',
    path: '/v1/sectors/{slug}/tickers',
    title: 'Ativos por Setor',
    description: 'Lista de ativos de um setor específico, com indicadores fundamentalistas principais.',
    authorization: 'required',
    pathParams: [
      { name: 'slug', type: 'string', required: true, description: 'Slug do setor (ex: energy, financial).', example: 'energy' },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": {
    "sector": "Energy",
    "tickers": [
      {
        "ticker": "PETR4",
        "name": "PETROBRAS PN",
        "market_price": 49.03,
        "pe_ratio": 6.18,
        "dividend_yield": 16.33,
        "roe": 16.50
      }
    ]
  }
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/sectors/energy/tickers'),
  },

  // ======================================================
  // MARKET COMMENTARIES (AI)
  // ======================================================
  {
    slug: 'commentaries-list',
    category: 'commentaries',
    method: 'GET',
    path: '/v1/market-commentaries',
    title: 'Listar Commentaries',
    description: 'Análises geradas por IA explicando os movimentos do mercado. Escopo: index, ticker ou sector.',
    longDescription: 'Commentaries são narrativas geradas diariamente via Claude Sonnet explicando por que índices, ativos ou setores se moveram. Cada registro traz um título, corpo (~150 palavras) e o número de fontes citadas.',
    authorization: 'required',
    queryParams: [
      { name: 'scope', type: 'string', required: false, description: 'Tipo do escopo.', enum: ['index', 'ticker', 'sector'] },
      { name: 'identifier', type: 'string', required: false, description: 'Identificador (ex: IBOV, PETR4, energy).' },
      { name: 'limit', type: 'integer', required: false, description: 'Número de commentaries.', default: '10' },
    ],
    responses: [
      {
        status: 200,
        description: 'Sucesso',
        bodyJson: `{
  "data": [
    {
      "id": 1,
      "scope": "index",
      "identifier": "IBOV",
      "date": "2026-04-10",
      "change_percent": 1.23,
      "title": "Ibovespa renova recorde aos 197 mil pontos pela primeira vez",
      "commentary": "O Ibovespa engata o terceiro dia de recordes consecutivos na expectativa de negociações para um acordo de paz definitivo no Oriente Médio...",
      "context_data": {
        "name": "IBOV",
        "current_price": 197534.11,
        "previous_price": 195129.25,
        "change_percent": 1.23
      },
      "sources_count": 4,
      "model": "claude-sonnet-4-5"
    }
  ]
}`,
      },
      ...defaultErrors(),
    ],
    codeSamples: makeSamples('GET', '/v1/market-commentaries', 'scope=index&identifier=IBOV&limit=10'),
  },
]

const CATEGORIES: ApiDocCategory[] = [
  { id: 'acoes', label: 'Ações', icon: 'i-lucide-trending-up', endpoints: [] },
  { id: 'fundamentos', label: 'Fundamentais', icon: 'i-lucide-calculator', endpoints: [] },
  { id: 'dividendos', label: 'Dividendos', icon: 'i-lucide-piggy-bank', endpoints: [] },
  { id: 'rankings', label: 'Rankings', icon: 'i-lucide-trophy', endpoints: [] },
  { id: 'setores', label: 'Setores', icon: 'i-lucide-layers', endpoints: [] },
  { id: 'commentaries', label: 'Commentaries (AI)', icon: 'i-lucide-sparkles', endpoints: [] },
]

// Attach endpoints to their category once so consumers get a
// tree structure directly without re-filtering on each render.
for (const cat of CATEGORIES) {
  cat.endpoints = ENDPOINTS.filter((e) => e.category === cat.id)
}

export function useApiDocs() {
  return {
    endpoints: ENDPOINTS,
    categories: CATEGORIES,
    findEndpoint: (slug: string) => ENDPOINTS.find((e) => e.slug === slug),
  }
}
