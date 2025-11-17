import axios from 'axios'
import * as cheerio from 'cheerio'
import { promises as fs } from 'fs'
import path from 'path'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import UserAgent from 'user-agents'

puppeteer.use(StealthPlugin())
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

class StatusInvestScraping {
  BASE_URL = 'https://statusinvest.com.br'
  USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
  MAP_VALUES = {
    // Valuation
    'Valor atual do ativo': 'price',
    'Valor mínimo das últimas 52 semanas': 'minPrice52Weeks',
    'Valor máximo das últimas 52 semanas': 'maxPrice52Weeks',
    'Indicador utilizado para relacionar os proventos pagos por uma companhia e o preço atual de suas ações.':
      'dy',
    'Dá uma ideia do quanto o mercado está disposto a pagar pelos lucros da empresa.':
      'priceToEarnings',
    'O PEG Ratio é uma métrica de avaliação para determinar o trade-off relativo entre o preço de uma ação, o lucro gerado por ação e o crescimento esperado da empresa. Para o cálculo, assumimos o LPA Atual baseado nos últimos 4 trimestres, e o LPA Anterior os 4 trimestres anteriores a estes.':
      'pegRatio',
    'Facilita a análise e comparação da relação do preço de negociação de um ativo com seu VPA.':
      'priceToBook',
    'O EV (Enterprise Value ou Valor da Firma), indica quanto custaria para comprar todos os ativos da companhia, descontando o caixa. Este indicador mostra quanto tempo levaria para o valor calculado no EBITDA pagar o investimento feito para compra-la.':
      'evEbitda',
    'O EV (Enterprise Value ou Valor da Firma), indica quanto custaria para comprar todos os ativos da companhia, descontando o caixa. Este indicador mostra quanto tempo levaria para o valor calculado no EBIT pagar o investimento feito para compra-la.':
      'evEbit',
    'O EBITDA permite conhecer quanto a companhia está gerando de caixa com base exclusivamente em suas atividades operacionais, desconsiderando os impactos financeiros e dos impostos.':
      'priceToEbitda',
    'Indica qual é o preço da ação em relação ao seu resultado EBIT. O EBIT pode ser considerado uma aproximação do lucro operacional da companhia.':
      'priceToEbit',
    'Indica qual o valor patrimonial de uma ação.': 'bookValuePerShare',
    'Preço da ação dividido pelos Ativos totais por ação.': 'priceToAssets',
    'Indicar se a empresa é ou não lucrativa. Se este número estiver negativo, a empresa está com margens baixas, acumulando prejuízos.':
      'earningsPerShare',
    'Valor de mercado da empresa dividido pela receita operacional líquida ou preço da ação dividido pela receita líquida por ação':
      'priceToSales',
    'Preço da ação dividido pelo capital de giro por ação. Capital de Giro é o Ativo Circulante menos Passivo Circulante.':
      'priceToWorkingCapital',
    'É a diferença entre o ativo circulante e o passivo que constam do balanço patrimonial de uma empresa.':
      'priceToNetCurrentAssets',

    // Endividamento
    'Indica quanto de dívida uma empresa está usando para financiar os seus ativos em relação ao patrimônio dos acionistas.':
      'netDebtToEquity',
    'Indica quanto tempo seria necessário para pagar a dívida líquida da empresa considerando o EBITDA atual. Indica também o grau de endividamento da companhia.':
      'netDebtToEbitda',
    'Indica quanto tempo seria necessário para pagar a dívida líquida da empresa considerando o EBIT atual. Indica também o grau de endividamento da companhia.':
      'netDebtToEbit',
    'O Patrimônio de uma empresa é o resultado da subtração dos ativos com os passivos. Este indicador é para mostrar a relação dos ativos no patrimônio da empresa.':
      'equityToAssets',
    'Calculo para saber a relação entre os ativos (circulantes e não circulantes) e os passivos de uma empresa.':
      'liabilitiesToAssets',
    'Indica a capacidade de pagamento da empresa no curto prazo.':
      'currentRatio',

    // Eficiência
    'Mede, objetivamente, o quanto a empresa ganha com a venda de seus produtos.':
      'grossMargin',
    'É o percentual da divisão entre o EBITDA (Earnings before interest, taxes, depreciation and amortization) e a receita líquida de uma companhia. Muito útil para se comparar a lucratividade operacional da empresa.':
      'ebitdaMargin',
    'Útil para comparar a lucratividade operacional de empresas do mesmo segmento, além de contribuir para avaliar o crescimento da eficiência produtiva de um negócio ao longo do tempo.':
      'ebitMargin',
    'Revela a porcentagem de lucro em relação às receitas de uma empresa.':
      'netMargin',

    // Rentabilidade
    'Mede a capacidade de agregar valor de uma empresa a partir de seus próprios recursos e do dinheiro de investidores.':
      'returnOnEquity',
    'O retorno sobre os ativos ou Return on Assets, é um indicador de rentabilidade, que calcula a capacidade de uma empresa gerar lucro a partir dos seus ativos, além de indiretamente, indicar a eficiência dos seus gestores.':
      'returnOnAssets',
    'Mede a rentabilidade de dinheiro o que uma empresa é capaz de gerar em razão de todo o capital investido, incluindo os aportes por meio de dívidas.':
      'returnOnInvestedCapital',
    'Mede se como uma empresa está utilizando o seu ativo (bens, investimentos, estoque etc.) para produzir riqueza, através da venda de seus produtos e/ou serviços.':
      'assetTurnover',

    // Crescimento
    growthRevenueCagr: {
      key: 'revenueCagr5Y',
      selector: 'div.item:has(h3:contains("CAGR Receitas 5 anos")) .value',
      title:
        'O CAGR (Compound Annual Growth Rate), ou taxa de crescimento anual composta, é a taxa de retorno necessária para um investimento crescer de seu saldo inicial para o seu saldo final.',
    },
    growthEarningsCagr: {
      key: 'earningsCagr5Y',
      selector: 'div.item:has(h3:contains("CAGR Lucros 5 anos")) .value',
      title:
        'O CAGR (Compound Annual Growth Rate), ou taxa de crescimento anual composta, é a taxa de retorno necessária para um investimento crescer de seu saldo inicial para o seu saldo final.',
    },

    // Sobre a empresa
    companyName: {
      key: 'companyName',
      selector: '.company-description span.d-block.fw-600',
      type: 'text',
    },
    companyCnpj: {
      key: 'cnpj',
      selector: '.company-description small',
      type: 'text',
    },
    companyWebsite: {
      key: 'website',
      selector: 'span[title="Site da empresa"] a',
      attribute: 'href',
      type: 'text',
    },
    companyLogo: {
      key: 'logo',
      selector: '.company-brand',
      attribute: 'data-img',
      type: 'text',
      transform: (value) => {
        if (!value) return value
        const match = value.match(/url\((['"]?)(.+?)\1\)/)
        return match ? match[2] : value
      },
    },
    relatedCompanies: {
      key: 'relatedCompanies',
      selector: '.related a .code',
      type: 'array',
      transform: (values) => Array.from(new Set(values)),
    },
    netEquity: {
      key: 'netEquity',
      selector: '.top-info .info:has(h3:contains("Patrimônio líquido")) .value',
    },
    totalAssets: {
      key: 'totalAssets',
      selector: '.top-info .info:has(h3:contains("Ativos")) .value',
    },
    currentAssets: {
      key: 'currentAssets',
      selector: '.top-info .info:has(h3:contains("Ativo circulante")) .value',
    },
    grossDebt: {
      key: 'grossDebt',
      selector: '.top-info .info:has(h3:contains("Dívida bruta")) .value',
    },
    cashAndEquivalents: {
      key: 'cashAndEquivalents',
      selector: '.top-info .info:has(h3:contains("Disponibilidade")) .value',
    },
    netDebt: {
      key: 'netDebt',
      selector: '.top-info .info:has(h3:contains("Dívida líquida")) .value',
    },
    marketCap: {
      key: 'marketCap',
      selector: '.top-info .info:has(h3:contains("Valor de mercado")) .value',
    },
    enterpriseValue: {
      key: 'enterpriseValue',
      selector: '.top-info .info:has(h3:contains("Valor de firma")) .value',
    },
    sharesOutstanding: {
      key: 'sharesOutstanding',
      selector: '.top-info .info:has(h3:contains("Nº total de papéis")) .value',
    },
    listingSegment: {
      key: 'listingSegment',
      selector:
        '.top-info .info:has(h3:contains("Segmento de listagem")) .value',
      type: 'text',
    },
    freeFloat: {
      key: 'freeFloat',
      selector: '.top-info .info:has(h3:contains("Free Float")) .value',
    },
    sector: {
      key: 'sector',
      selector:
        '.card .info:has(.sub-value:contains("Setor de Atuação")) strong.value',
      type: 'text',
    },
    subsector: {
      key: 'subsector',
      selector:
        '.card .info:has(.sub-value:contains("Subsetor de Atuação")) strong.value',
      type: 'text',
    },
    segment: {
      key: 'segment',
      selector:
        '.card .info:has(.sub-value:contains("Segmento de Atuação")) strong.value',
      type: 'text',
    },
  }

  MAP_VALUES_FII = {
    'Valor atual do ativo': 'price',
    'Valor mínimo das últimas 52 semanas': 'minPrice52Weeks',
    'Valor máximo das últimas 52 semanas': 'maxPrice52Weeks',
    'Dividend Yield com base nos últimos 12 meses': 'dy',
    marketCap: {
      key: 'marketCap',
      selector: '.info div div:has(span:contains("Patrimônio")) .sub-value',
    },
    totalAssets: {
      key: 'totalAssets',
      selector:
        '.info div div:has(span:contains("Valor de mercado")) .sub-value',
    },
    numberOfShareholders: {
      key: 'numberOfShareholders',
      selector: '.top-info .info:has(h3:contains("Nº de Cotistas")) .value',
    },
  }

  extractValue(root, search) {
    const $ = typeof root === 'function' ? root : cheerio.load(root)
    const descriptor =
      typeof search === 'string' ? { title: search } : (search ?? {})
    const {
      selector,
      title,
      attribute,
      type = 'number',
      textSelector,
      targetSelector,
      elementIndex = 0,
      transform,
    } = descriptor

    let elements
    if (selector) {
      elements = $(selector)
    }

    // Fallback to elements selected by title if necessary
    if ((!elements || !elements.length) && title) {
      elements = $(`[title="${title}"]`)
    }

    if (!elements || !elements.length) return null

    if (type === 'array') {
      // Para arrays, ainda usamos a collection e aplicamos .value se couber
      const collection = targetSelector
        ? elements.find(targetSelector)
        : elements
      // garante que pegamos apenas elementos com .value
      const valueElems = collection.find('.value').length
        ? collection.find('.value')
        : collection
      const values = valueElems
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(Boolean)
      return typeof transform === 'function'
        ? transform(values, { $, descriptor })
        : values
    }

    // Sempre busca pelo .value no(s) elemento(s) resultante(s)
    let element = elements.eq(elementIndex)
    // Se .value existir dentro desse elemento, usa ele como valor de extração
    const valueElem = element.find('.value')
    if (valueElem.length) {
      element = valueElem.first()
    }
    if (!element || !element.length) return null

    let rawValue
    if (attribute) {
      rawValue = element.attr(attribute)
    } else if (textSelector) {
      rawValue = element.find(textSelector).first().text()
    } else {
      rawValue = element.text()
    }

    if (!rawValue) return null
    rawValue = rawValue.trim()
    if (!rawValue) return null

    let result
    if (type === 'text' || type === 'raw') {
      result = rawValue
    } else {
      const sanitized = rawValue.replace(/[^0-9,-]/g, '')
      if (!sanitized) return null
      const normalized = sanitized.replace(/\./g, '').replace(',', '.')
      const numericValue = parseFloat(normalized)
      if (Number.isNaN(numericValue)) return null
      result = numericValue
    }

    return typeof transform === 'function'
      ? transform(result, { rawValue, element, $, descriptor })
      : result
  }

  async getStock(ticker) {
    const response = await axios.get(
      `${this.BASE_URL}/acoes/${ticker.toLowerCase()}`,
      {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      }
    )

    const $ = cheerio.load(response.data)

    const result = Object.entries(this.MAP_VALUES).reduce(
      (acc, [lookupKey, mapValue]) => {
        if (typeof mapValue === 'string') {
          acc[mapValue] = this.extractValue($, { title: lookupKey })
          return acc
        }

        const { key, title, ...options } = mapValue
        const descriptor = { title: title ?? lookupKey, ...options }
        acc[key] = this.extractValue($, descriptor)
        return acc
      },
      {}
    )

    if (typeof result.logo === 'string') {
      const trimmed = result.logo.trim()
      if (trimmed.startsWith('/')) {
        result.logo = `${this.BASE_URL}${trimmed}`
      } else {
        result.logo = trimmed
      }
    }

    return result
  }

  async getSFII(ticker) {
    const response = await axios.get(
      `${this.BASE_URL}/fundos-imobiliarios/${ticker.toLowerCase()}`,
      {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      }
    )

    const $ = cheerio.load(response.data)

    const result = Object.entries(this.MAP_VALUES_FII).reduce(
      (acc, [lookupKey, mapValue]) => {
        if (typeof mapValue === 'string') {
          acc[mapValue] = this.extractValue($, { title: lookupKey })
          return acc
        }

        const { key, title, ...options } = mapValue
        const descriptor = { title: title ?? lookupKey, ...options }
        acc[key] = this.extractValue($, descriptor)
        return acc
      },
      {}
    )

    if (typeof result.logo === 'string') {
      const trimmed = result.logo.trim()
      if (trimmed.startsWith('/')) {
        result.logo = `${this.BASE_URL}${trimmed}`
      } else {
        result.logo = trimmed
      }
    }

    return result
  }

  async getBDR(ticker) {
    const response = await axios.get(
      `${this.BASE_URL}/bdrs/${ticker.toLowerCase()}`,
      {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      }
    )

    const $ = cheerio.load(response.data)

    const result = Object.entries(this.MAP_VALUES).reduce(
      (acc, [lookupKey, mapValue]) => {
        if (typeof mapValue === 'string') {
          acc[mapValue] = this.extractValue($, { title: lookupKey })
          return acc
        }

        const { key, title, ...options } = mapValue
        const descriptor = { title: title ?? lookupKey, ...options }
        acc[key] = this.extractValue($, descriptor)
        return acc
      },
      {}
    )

    if (typeof result.logo === 'string') {
      const trimmed = result.logo.trim()
      if (trimmed.startsWith('/')) {
        result.logo = `${this.BASE_URL}${trimmed}`
      } else {
        result.logo = trimmed
      }
    }

    return result
  }
}

class GoogleScraping {
  constructor(options = {}) {
    this.launchOptions = {
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
      ],
      ...options.launchOptions,
    }
    this.defaultTimeout = options.timeout ?? 45000
    this.browserPromise = null
  }

  async #getBrowser() {
    if (!this.browserPromise) {
      this.browserPromise = puppeteer.launch(this.launchOptions)
    }
    return this.browserPromise
  }

  async #withPage(task) {
    const browser = await this.#getBrowser()
    const page = await browser.newPage()

    const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString()
    await page.setUserAgent(userAgent)
    await page.setViewport({ width: 1280, height: 768, deviceScaleFactor: 1 })
    await page.setExtraHTTPHeaders({
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      referer: 'https://www.bing.com/',
    })

    try {
      return await task(page)
    } finally {
      await page.close().catch(() => {})
    }
  }

  async #gotoBing(page, query) {
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: this.defaultTimeout,
    })
    await page
      .waitForSelector('#b_results .b_algo', { timeout: this.defaultTimeout })
      .catch(() => null)
  }

  async #extractBingResults(page, { limit = 5 } = {}) {
    return page.$$eval(
      '#b_results .b_algo',
      (cards, max) =>
        cards.slice(0, max).map((card) => {
          const link = card.querySelector('a')
          const titleEl = card.querySelector('h2')
          const descriptionEl = card.querySelector('div.b_caption p')
          return {
            link: link?.href ?? null,
            title: titleEl?.textContent?.trim() ?? '',
            description: descriptionEl?.textContent?.trim() ?? '',
          }
        }),
      limit
    )
  }

  async getReclameAquiScore(query) {
    return this.#withPage(async (page) => {
      await this.#gotoBing(page, `${query} reclameaqui`)
      const [firstResult] = await this.#extractBingResults(page, { limit: 1 })

      if (!firstResult?.link) {
        return { reputation: null, lastReview: [] }
      }

      await page.goto(firstResult.link, {
        waitUntil: 'networkidle2',
        timeout: this.defaultTimeout,
      })

      await page.waitForSelector('#ra-new-reputation > span', {
        timeout: this.defaultTimeout,
      })

      const reputation = await page.evaluate(() => {
        const reputationScoreEl = document.querySelector(
          '#ra-new-reputation > span'
        )
        return {
          score: reputationScoreEl?.textContent?.trim() ?? null,
        }
      })

      const lastReview = await page.$$eval(
        '#site_bp_lista_ler_reclamacao',
        (cards) =>
          cards.slice(0, 3).map((card) => ({
            link: card?.href ?? null,
            text: card?.textContent?.trim() ?? '',
          }))
      )

      return {
        reputation,
        lastReview,
      }
    })
  }

  async getGlassdoorScore(query) {
    return this.#withPage(async (page) => {
      await this.#gotoBing(page, `${query} glassdoor`)
      const [firstResult] = await this.#extractBingResults(page, { limit: 1 })

      if (!firstResult?.link) {
        return {
          ratingHeadline: null,
          recommendToFriend: null,
          reviewCount: null,
          url: null,
        }
      }

      await page.goto(firstResult.link, {
        waitUntil: 'networkidle2',
        timeout: this.defaultTimeout,
      })

      await page.waitForSelector('[data-test="rating-headline"]', {
        timeout: this.defaultTimeout,
      })

      const summary = await page.evaluate(() => {
        const ratingHeadline =
          document
            .querySelector('[data-test="rating-headline"]')
            ?.textContent?.trim() ?? null
        const recommendToFriend =
          document
            .querySelector('[data-test="recommendToFriend"]')
            ?.textContent?.trim() ?? null
        const reviewCount =
          document
            .querySelector('[data-test="review-count"]')
            ?.textContent?.trim() ?? null

        return {
          ratingHeadline,
          recommendToFriend,
          reviewCount,
          url: typeof location !== 'undefined' ? location.href : null,
        }
      })

      return summary
    })
  }

  async close() {
    if (!this.browserPromise) return

    const browser = await this.browserPromise.catch(() => null)
    this.browserPromise = null

    if (browser) {
      await browser.close().catch(() => {})
    }
  }
}

const ASSETS_PATH = path.resolve(process.cwd(), 'public', 'assets.json')
const RESULT_PATH = path.resolve(process.cwd(), 'scripts', 'result.json')

async function readJson(filePath, fallback) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

function getHeadlessMode() {
  const value = process.env.PUPPETEER_HEADLESS
  if (value === 'false') return false
  if (value === 'true') return 'new'
  return 'new'
}

async function processStocks() {
  const assets = await readJson(ASSETS_PATH, {})
  const existingResult = await readJson(RESULT_PATH, {})

  const VALID_TYPES = new Set(['stock', 'bdr', 'fund'])

  const stocks = Array.isArray(assets.stocks)
    ? assets.stocks.filter((item) =>
        VALID_TYPES.has((item.type ?? '').toLowerCase())
      )
    : []

  if (!stocks.length) {
    console.warn('Nenhuma ação encontrada em assets.json')
    return
  }

  const statusInvestScraping = new StatusInvestScraping()
  const googleScraping = new GoogleScraping({ headless: getHeadlessMode() })

  const result = { ...existingResult }

  try {
    for (const asset of stocks) {
      const ticker = asset?.stock?.trim()
      if (!ticker) continue

      // if finish if "F", remove the ticker from the result
      if (ticker.endsWith('F')) {
        console.log(`Skipping ${ticker} because it ends with F`)
        delete result[ticker]
        await writeJson(RESULT_PATH, result)
        continue
      }

      const alreadyProcessed = result[ticker]
      console.log(`Processando ${ticker}...`)

      try {
        const stockData =
          asset.type === 'stock'
            ? await statusInvestScraping.getStock(ticker)
            : asset.type === 'fund'
              ? await statusInvestScraping.getSFII(ticker)
              : await statusInvestScraping.getBDR(ticker)
        const companyName =
          stockData?.companyName?.trim() || asset?.name?.trim() || ticker

        result[ticker] = {
          ...(alreadyProcessed ?? {}),
          statusInvest: stockData,
        }
        await writeJson(RESULT_PATH, result)
        console.log(`✓ StatusInvest: ${ticker}`)

        const assetType = (asset.type ?? '').toLowerCase()
        const shouldEnrich = assetType === 'stock'

        if (true) {
          console.log('Enriching disabled')
          continue
        }
        if (shouldEnrich) {
          const reclameAqui =
            await googleScraping.getReclameAquiScore(companyName)
          result[ticker] = {
            ...(result[ticker] ?? {}),
            reclameAqui,
          }
          await writeJson(RESULT_PATH, result)
          console.log(`✓ ReclameAqui: ${companyName}`)

          const glassdoor = await googleScraping.getGlassdoorScore(companyName)
          result[ticker] = {
            ...(result[ticker] ?? {}),
            glassdoor,
          }
          await writeJson(RESULT_PATH, result)
          console.log(`✓ Glassdoor: ${companyName}`)
        } else {
          console.log(
            `↷ ${ticker}: tipo ${assetType} não requer Glassdoor/ReclameAqui`
          )
        }
      } catch (error) {
        console.error(`✗ Erro ao processar ${ticker}`, error)
        result[ticker] = {
          ...(result[ticker] ?? {}),
          error: error instanceof Error ? error.message : String(error),
        }
        await writeJson(RESULT_PATH, result)
      }
    }
  } finally {
    await googleScraping.close()
  }
}

await processStocks()
