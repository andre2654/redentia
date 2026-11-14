/**
 * Países e regiões do mundo (05/11/2026), para a seção "No mundo" da
 * /carteira: o código ISO 3166-1 alfa-2 (o da API de receita por geografia)
 * vira o numérico (o dos pontos e caminhos do mapa, utils/mundoPontos.ts), e
 * cada região fixa da API acende o conjunto dos seus países.
 *
 * ORIGEM: a lista de países, com alfa-2, numérico e a sub-região do
 * geoesquema M49 da ONU, saiu do pacote world-countries (mledoze/countries,
 * ODbL 1.0), gerada OFFLINE. As regiões são a nossa leitura do M49:
 *  - america_do_norte: América do Norte do M49 sem o México (EUA, Canadá…);
 *  - america_latina: México, América Central, Caribe e América do Sul (o
 *    Brasil está nela; quando o Brasil é fatia própria, ele pinta por cima);
 *  - oriente_medio: a Ásia Ocidental sem o Cáucaso (Armênia, Azerbaijão e
 *    Geórgia vão para a Ásia), mais o Irã;
 *  - asia: o resto da Ásia; europa, africa e oceania: as do M49;
 *  - outros: sem país (a empresa não disse onde), não acende nada.
 * Antártida fora.
 */

export type ChaveRegiao = 'america_do_norte' | 'america_latina' | 'europa' | 'asia' | 'oriente_medio' | 'africa' | 'oceania' | 'outros'

/** alfa-2 + numérico, colados ('AD020AE784…') */
const ISO = 'AD020AE784AF004AG028AI660AL008AM051AO024AQ010AR032AS016AT040AU036AW533AX248AZ031BA070BB052BD050BE056BF854BG100BH048BI108BJ204BL652BM060BN096BO068BQ535BR076BS044BT064BV074BW072BY112BZ084CA124CC166CD180CF140CG178CH756CI384CK184CL152CM120CN156CO170CR188CU192CV132CW531CX162CY196CZ203DE276DJ262DK208DM212DO214DZ012EC218EE233EG818EH732ER232ES724ET231FI246FJ242FK238FM583FO234FR250GA266GB826GD308GE268GF254GG831GH288GI292GL304GM270GN324GP312GQ226GR300GS239GT320GU316GW624GY328HK344HM334HN340HR191HT332HU348ID360IE372IL376IM833IN356IO086IQ368IR364IS352IT380JE832JM388JO400JP392KE404KG417KH116KI296KM174KN659KP408KR410KW414KY136KZ398LA418LB422LC662LI438LK144LR430LS426LT440LU442LV428LY434MA504MC492MD498ME499MF663MG450MH584MK807ML466MM104MN496MO446MP580MQ474MR478MS500MT470MU480MV462MW454MX484MY458MZ508NA516NC540NE562NF574NG566NI558NL528NO578NP524NR520NU570NZ554OM512PA591PE604PF258PG598PH608PK586PL616PM666PN612PR630PS275PT620PW585PY600QA634RE638RO642RS688RU643RW646SA682SB090SC690SD729SE752SG702SH654SI705SJ744SK703SL694SM674SN686SO706SR740SS728ST678SV222SX534SY760SZ748TC796TD148TF260TG768TH764TJ762TK772TL626TM795TN788TO776TR792TT780TV798TW158TZ834UA804UG800UM581US840UY858UZ860VA336VC670VE862VG092VI850VN704VU548WF876WS882YE887YT175ZA710ZM894ZW716'

const MEMBROS: Record<Exclude<ChaveRegiao, 'outros'>, string> = {
  america_latina: 'AG AI AR AW BB BL BO BQ BR BS BZ CL CO CR CU CW DM DO EC FK GD GF GP GT GY HN HT JM KN KY LC MF MQ MS MX NI PA PE PR PY SR SV SX TC TT UY VC VE VG VI',
  asia: 'AF AM AZ BD BN BT CN GE HK ID IN JP KG KH KP KR KZ LA LK MM MN MO MV MY NP PH PK SG TH TJ TL TM TW UZ VN',
  africa: 'AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW IO KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW',
  europa: 'AD AL AT AX BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM UA VA XK',
  oriente_medio: 'AE BH IL IQ IR JO KW LB OM PS QA SA SY TR YE',
  oceania: 'AS AU CC CK CX FJ FM GU KI MH MP NC NF NR NU NZ PF PG PN PW SB TK TO TV VU WF WS',
  america_do_norte: 'BM CA GL PM UM US',
}

let numerico: Map<string, string> | null = null

/** O ISO numérico ('076') de um alfa-2 ('BR'); null se não existe. */
export function numericoDe(iso2: string): string | null {
  if (!numerico) {
    numerico = new Map()
    for (let i = 0; i + 5 <= ISO.length; i += 5) numerico.set(ISO.slice(i, i + 2), ISO.slice(i + 2, i + 5))
  }
  return numerico.get(iso2.trim().toUpperCase()) ?? null
}

/** Os alfa-2 de uma região; [] para 'outros' ou chave desconhecida. */
export function paisesDaRegiao(chave: string): string[] {
  const m = (MEMBROS as Record<string, string>)[chave]
  return m ? m.split(' ') : []
}

/** Os ISO numéricos de uma região (o que o mapa acende). */
export function numericosDaRegiao(chave: string): string[] {
  return paisesDaRegiao(chave).map(numericoDe).filter((x): x is string => !!x)
}

export const REGIOES_FIXAS: readonly ChaveRegiao[] = ['america_do_norte', 'america_latina', 'europa', 'asia', 'oriente_medio', 'africa', 'oceania', 'outros']

let alfa2: Map<string, string> | null = null

/** O alfa-2 ('BR') de um ISO numérico ('076'); null se não existe. */
export function alfa2De(num: string): string | null {
  if (!alfa2) {
    alfa2 = new Map()
    for (let i = 0; i + 5 <= ISO.length; i += 5) alfa2.set(ISO.slice(i + 2, i + 5), ISO.slice(i, i + 2))
  }
  return alfa2.get(num) ?? null
}
