/**
 * Allowlist de ativos que entram no SITEMAP (poda fase 1, 03/08/2026).
 *
 * O PROBLEMA QUE ISSO RESOLVE. `fetchAssetPages` publicava TODO ticker que o
 * backend devolvesse: 1.674 URLs de /asset, 86% do sitemap. Medição do Search
 * Console em 92 dias (rodar `node scripts/url-viva.mjs <Páginas.csv>`):
 *   - /asset rendia 0,06 clique por URL viva por mês, contra 149,87 de
 *     /calculadora. Razão de 2.500x entre a melhor e a pior seção do site.
 *   - 1.628 das 1.950 URLs publicadas não tiveram UMA impressão em 92 dias.
 *   - o Google reportava 1.708 URLs em "Rastreada, mas não indexada" e outras
 *     852 em "Detectada, mas não indexada" (fila de crawl estourada, nem buscou).
 * Publicar ativo ilíquido não gera tráfego: gera fila de rastreamento que atrasa
 * a descoberta das páginas que de fato trazem gente.
 *
 * COMO ESTA LISTA FOI MONTADA (união de três critérios, todos reproduzíveis):
 *   1. FEATURED_TICKERS, 48 blue chips e FIIs conhecidos (server/utils/site-pages.ts)
 *   2. os 41 tickers com editorial escrito (Backend/database/seeders/AssetEditorial*)
 *   3. todo ticker com pelo menos 1 impressão em 92 dias no Search Console (448)
 * Total: 463 tickers. O sitemap sai de ~1.950 para ~740 URLs.
 *
 * O QUE ISSO NÃO FAZ: nada de `noindex`. Sair do sitemap é reversível em dias,
 * `noindex` leva semanas para desfazer. E a exportação do Search Console corta
 * em 1.000 linhas, então uma URL com impressão abaixo do corte aparece como
 * morta aqui. As páginas continuam existindo, navegáveis e linkáveis.
 *
 * COMO ATUALIZAR: rode o url-viva a cada trimestre e SOME os tickers que
 * ganharam impressão. Nunca remova um ticker desta lista com menos de 60 dias
 * de leitura consistente, pelo motivo do corte acima.
 */
export const INDEXABLE_ASSETS: ReadonlySet<string> = new Set([
  'A1AP34', 'A1LB34', 'A1MT34', 'A1RE34', 'A1ZN34', 'AAPL34', 'ABCB4', 'ABCP11',
  'ABEV3', 'AESB3', 'AFHF11', 'AFHI11', 'ALLD3', 'ALOS3', 'AMZO34', 'APTI4',
  'ARML3', 'ARMT34', 'ARRI11', 'ARTE11', 'ASAI3', 'ASML34', 'AUAU3', 'AUPO11',
  'AURO11', 'AUVP11', 'AXIA3', 'AXIA5', 'AXIA6', 'AXIA7', 'AZEV3', 'AZOI34',
  'AZUL4', 'AZUL53', 'B2HI34', 'B3BR11', 'B3SA3', 'BAHI3', 'BALM3', 'BAUH4',
  'BAZA3', 'BBAS3', 'BBDC4', 'BBML3', 'BCFF11', 'BDLL3', 'BDLL4', 'BEEF3',
  'BERK34', 'BGIP3', 'BGIP4', 'BHIA3', 'BIDB11', 'BIDI11', 'BIDI4', 'BINR11',
  'BITI11', 'BKNG34', 'BLMR11', 'BMEB4', 'BMGB10', 'BNBR3', 'BNDX11', 'BOAS3',
  'BPAC11', 'BPAC3', 'BPAR3', 'BPFF11', 'BRAZ11', 'BRCO11', 'BRFS3', 'BRFT11',
  'BRIP11', 'BRKM5', 'BRML3', 'BROF11', 'BRPR3', 'BRSR3', 'BRSR6', 'BRST3',
  'BSLT11', 'BTLG11', 'BTYU11', 'BZLI11', 'C1CL34', 'CACR11', 'CALI3', 'CAMB4',
  'CAML3', 'CARE11', 'CASA11', 'CASN3', 'CASN4', 'CATA3', 'CCTY3', 'CCXC3',
  'CEAB3', 'CEBR5', 'CEEB6', 'CEED4', 'CEPE3', 'CEPE5', 'CEPE6', 'CESP3',
  'CESP5', 'CESP6', 'CFII11', 'CHIP11', 'CIEL3', 'CLSC3', 'CLSC4', 'CMCS34',
  'CMDB11', 'CMIG4', 'CNSY3', 'COCE3', 'COCE5', 'COCE6', 'COGN3', 'COPN11',
  'CORR3', 'CPLE5', 'CPLE6', 'CPRE3', 'CREM3', 'CRFB3', 'CRIV4', 'CRPT11',
  'CSAN3', 'CSNA3', 'CSRN3', 'CSUD3', 'CTAX3', 'CTNM3', 'CTNM4', 'CXSE3',
  'CYLD11', 'D1DG34', 'DEBB11', 'DEXP3', 'DISB34', 'DIVD11', 'DIVS11', 'DMMO3',
  'DTCY3', 'DVLT11', 'E1CO34', 'E2EF34', 'E2TS34', 'ECOR3', 'ECPR4', 'EEEL3',
  'EEEL4', 'EGIE3', 'EKTR4', 'ELET3', 'ELMD3', 'ELPL3', 'EMBJ3', 'EMBR3',
  'EMET11', 'ENGI11', 'EQPA5', 'EQPA6', 'EQTL3', 'ESPA3', 'ETHE11', 'EVEB31',
  'FATN11', 'FDMO34', 'FESA3', 'FESA4', 'FGAA11', 'FIQE3', 'FIXA11', 'FLRY3',
  'FOMO11', 'G2EV34', 'GBIO33', 'GETT11', 'GETT3', 'GETT4', 'GGBR4', 'GGRC11',
  'GNDI3', 'GOGL34', 'GOLD11', 'GOLL54', 'GRND3', 'HABT11', 'HAPV3', 'HBTS5',
  'HCST11', 'HDEL11', 'HFOF11', 'HGBS11', 'HGCR11', 'HGLG11', 'HGRE11', 'HGRU11',
  'HGTX3', 'HIGH11', 'HODL11', 'HOND34', 'HRES11', 'HSML11', 'IAGR11', 'ICRI11',
  'IDKA11', 'IDVL3', 'IGBR3', 'IGTI4', 'IMAB11', 'INLG11', 'IRDM11', 'ISEN11',
  'ITEC3', 'ITIP11', 'ITLC34', 'ITSA4', 'ITUB4', 'IWMI11', 'JBSS3', 'JBSS32',
  'JFLL11', 'JNJB34', 'JOPA3', 'JSLG3', 'KLBN11', 'KLBN3', 'KLBN4', 'KNCR11',
  'KNIP11', 'KNPR11', 'KNRI11', 'KOPA11', 'KORE11', 'L1MN34', 'LAME4', 'LAVV3',
  'LBRD34', 'LCAM3', 'LEVE3', 'LFTB11', 'LINX3', 'LIPR3', 'LLFT11', 'LMTB34',
  'LOGG3', 'LREN3', 'LUXM4', 'M1RN34', 'M1TA34', 'M2PM34', 'M2ST34', 'MANA11',
  'MARG11', 'MBRF3', 'MCDC34', 'MCHF11', 'MCLO11', 'MDIA3', 'MDNE3', 'MELI34',
  'MELK3', 'MGEL3', 'MGFF11', 'MGLU3', 'MILL11', 'MOAR3', 'MRFG3', 'MSFT34',
  'MSPA3', 'MSRO3', 'MTRE3', 'MTSA4', 'MULT3', 'MUTC34', 'MWET4', 'MXRF11',
  'MYPK3', 'N1DA34', 'N1GG34', 'N1OW34', 'N1WG34', 'NAFG3', 'NAFG4', 'NASD11',
  'NATU3', 'NEOE3', 'NFLX34', 'NIKE34', 'NORD3', 'NTCO3', 'OBTC3', 'ODPV3',
  'OIBR3', 'OMGE3', 'ONDA11', 'ORCL34', 'ORVR3', 'P2AT34', 'P2LT34', 'PACB11',
  'PACC11', 'PAGS34', 'PARD3', 'PATL11', 'PCIP11', 'PEMA11', 'PETR3', 'PETR4',
  'PGMN3', 'PHIP11', 'PINE14', 'PINE4', 'PLPL3', 'PNCR11', 'POMO3', 'POMO4',
  'POSI3', 'PPAR3', 'PPLA11', 'PRIF11', 'PRIO3', 'PRNR3', 'PSSA3', 'PTNT3',
  'PTNT4', 'PVBI11', 'PYPL34', 'QCOM34', 'QQQQ11', 'QSOL11', 'R2BL34', 'RADL3',
  'RAIL3', 'RAIZ4', 'RANI4', 'RBRL11', 'RBRX11', 'RBRY11', 'RDOR3', 'RECT11',
  'RENT3', 'RIAA3', 'RIGG34', 'RNEW3', 'RPAD3', 'RURA11', 'RZAG11', 'RZAT11',
  'RZTR11', 'RZZR11', 'S1PO34', 'S1TX34', 'S2EA34', 'S2NA34', 'SANB11', 'SAUD3',
  'SBSP3', 'SEDU3', 'SILK11', 'SLCE3', 'SLED3', 'SLED4', 'SMLS3', 'SNEC34',
  'SNID11', 'SNLG11', 'SNME11', 'SNSY3', 'SNSY5', 'SOJA3', 'SOMA3', 'SPTW11',
  'SPXI11', 'SPXR11', 'SPYI11', 'SQIA3', 'STOC34', 'SULA11', 'SUZB3', 'SYNE3',
  'T1AM34', 'TAEE11', 'TAEE3', 'TASA3', 'TCNO3', 'TCNO4', 'TEKA3', 'TESA3',
  'TGMA3', 'TGTB34', 'TIET11', 'TIET3', 'TIET4', 'TIMS3', 'TKNO4', 'TMOS34',
  'TOPP11', 'TOTS3', 'TOYB3', 'TPIS3', 'TRIG11', 'TRIS3', 'TRPL11', 'TRXY11',
  'TSLA34', 'TSMC34', 'U1AI34', 'U1AL34', 'U1BE34', 'UCAS3', 'UGPA3', 'UNIP5',
  'UNIP6', 'USAL11', 'USBC34', 'USIM3', 'USIM5', 'USTK11', 'UTEC11', 'VALE3',
  'VAMO3', 'VBBR3', 'VERZ34', 'VGHF11', 'VGRI11', 'VIGT11', 'VISC11', 'VIUR11',
  'VIVA3', 'VIVR3', 'VIVT3', 'VIVT4', 'VRTA11', 'VRTM11', 'VULC3', 'VVCO11',
  'VVMR11', 'W1BD34', 'W1EL34', 'W1MB34', 'W2ST34', 'WALM34', 'WDCN3', 'WEGE3',
  'WEST3', 'WHGR11', 'WHRL3', 'WIZC3', 'WLMM3', 'WLMM4', 'WRLD11', 'XLPR11',
  'XPBR31', 'XPLG11', 'XPML11', 'XRPH11', 'XRXB34', 'Z2SC34', 'ZAGH11',
])
