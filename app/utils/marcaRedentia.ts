/**
 * A geometria da marca da Redentia (public/logo-azul.svg, a do header em
 * NuTopoMarca), para o losango do dia da home (HomeLosango, 04/11/2026; o
 * dono: "gostei de usarmos mais a logo da Redentia"). O desenho usa as peças
 * do próprio logo, não "um losango qualquer".
 *
 * Como o logo é construído, medido no SVG (quadro de 206, centro em 103):
 *  - um quadrado em pé a 45°: as bordas são retas x ± y = constante, sem
 *    achatamento (a largura é igual à altura);
 *  - o losango de fora: meia diagonal de 106,4 se o canto fosse vivo; o canto
 *    é arredondado com raio ~8,2, e a ponta chega a 103 (o quadro todo);
 *  - o miolo (o vão do meio): outro losango concêntrico, de meia diagonal 52,7
 *    no canto vivo e canto de raio ~20, que leva a ponta a 44,5: 0,43 do raio;
 *  - a faixa entre os dois tem 38 de espessura (0,37 do raio);
 *  - quatro peças: as metades da esquerda e da direita (dois chevrons, com
 *    um fio de 0,1 entre elas no eixo vertical, que vão de y = 22,8 a 183,3,
 *    isto é ±80,25 em torno do centro, 0,78 do raio) e as abas de cima e de
 *    baixo, de 54,8 de largura (meia largura 27,4, 0,27 do raio), que descem da
 *    ponta e se abrem em "garras" até a borda do miolo, por cima das metades;
 *  - o degradê das metades é horizontal (claro na ponta, escuro no eixo); o das
 *    abas é vertical (claro nas pontas de cima e de baixo).
 *
 * Funções puras, sem Nuxt: o teste trava as proporções (tests/marca-redentia.test.ts).
 */

/** O quadro do logo e as medidas, nas unidades do SVG da marca. */
export const LOGO = {
  lado: 206,
  centro: 103,
  /** da ponta ao centro (canto arredondado) */
  raio: 103,
  /** a meia diagonal se o canto de fora fosse vivo */
  raioVivo: 106.4,
  cantoDeFora: 8.2,
  /** da ponta do miolo ao centro (canto arredondado) */
  miolo: 44.5,
  mioloVivo: 52.66,
  cantoDoMiolo: 20,
  /** a espessura da faixa entre o losango de fora e o miolo */
  faixa: 38,
  /** até onde as metades sobem e descem, a partir do centro */
  alcanceDasMetades: 80.25,
  /** a meia largura das abas de cima e de baixo */
  meiaAba: 27.4,
} as const

/** As quatro peças do logo, como estão no SVG da marca (quadro de 206). */
export const PECAS_DO_LOGO = {
  direita: 'M203.597 97.1954C206.802 100.401 206.802 105.598 203.597 108.803L134.492 177.907C131.038 181.361 126.354 183.302 121.469 183.302C111.297 183.302 103.051 175.056 103.051 164.884V163.719C103.051 158.525 105.114 153.544 108.787 149.872L141.517 117.141C149.328 109.331 149.328 96.6675 141.517 88.857L108.765 56.1042C105.106 52.4453 103.051 47.4828 103.051 42.3084V41.287C103.051 31.0758 111.329 22.7979 121.54 22.7979C126.444 22.7979 131.146 24.7459 134.614 28.2132L203.597 97.1954Z',
  esquerda: 'M2.40387 97.1954C-0.801339 100.401 -0.801239 105.598 2.40387 108.803L71.5084 177.907C74.9624 181.361 79.6471 183.302 84.5318 183.302C94.7038 183.302 102.95 175.056 102.95 164.884V163.719C102.95 158.525 100.887 153.544 97.2141 149.872L64.4834 117.141C56.6729 109.331 56.6729 96.6675 64.4832 88.857L97.2354 56.1042C100.894 52.4453 102.95 47.4828 102.95 42.3084V41.287C102.95 31.0758 94.6719 22.7979 84.4607 22.7979C79.5571 22.7979 74.8544 24.7459 71.387 28.2132L2.40387 97.1954Z',
  baixo: 'M136.957 121.702C142.901 115.757 151.303 120.19 146.991 127.408L136.325 145.265C132.632 151.448 130.682 158.516 130.682 165.717V179.198C130.682 180.913 129.89 182.509 128.677 183.722L108.804 203.596L108.498 203.887C105.38 206.704 100.621 206.704 97.5031 203.887L97.1964 203.596L78.3916 184.791C76.8886 183.289 75.8762 181.323 75.8761 179.198V165.606C75.876 158.473 73.9686 151.469 70.3507 145.321L59.6515 127.14C55.6644 120.365 63.5105 116.169 69.0694 121.728L89.2707 141.929C96.8532 149.512 109.147 149.512 116.73 141.929L136.957 121.702Z',
  cima: 'M97.1964 2.40394C100.402 -0.801314 105.599 -0.801314 108.804 2.40394L128.591 22.1899C129.854 23.4531 130.682 25.1146 130.682 26.901V40.3815C130.682 47.5832 132.632 54.6509 136.325 60.8336L146.991 78.6901C151.275 85.8611 142.932 90.2724 137.026 84.3658L116.694 64.034C109.131 56.4707 96.8689 56.4706 89.3057 64.0337L69.0001 84.3389C63.4794 89.8595 55.6917 85.6864 59.6515 78.9577L70.3507 60.777C73.9684 54.6294 75.8761 47.6258 75.8761 40.4928V26.901C75.8762 24.7015 76.9289 22.6705 78.4843 21.1152L97.1964 2.40394Z',
} as const

const r3 = (n: number) => Math.round(n * 1000) / 1000

/**
 * O transform que põe o logo de 206 com centro em (cx, cy) e `tamanho` de
 * lado no quadro do desenho. Dentro do grupo, as contas seguem nas unidades
 * do logo (o centro é 103).
 */
export function transformDoLogo(cx: number, cy: number, tamanho: number): string {
  const k = tamanho / LOGO.lado
  return `translate(${r3(cx - tamanho / 2)} ${r3(cy - tamanho / 2)}) scale(${r3(k)})`
}
