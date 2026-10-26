/**
 * Allowlist histórica do SITEMAP (poda fase 1, 03/08/2026).
 *
 * Desde 26/10/2026 o sitemap NÃO usa mais esta lista: ele publica todo
 * /asset que a página responde 200 (ver tickerDePaginaAtivo). A lista segue
 * como filtro dos pares em app/utils/paresDoSetor.ts — o bloco "outras
 * empresas" não vira um despejo de toda classe do setor.
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
 *
 * ATUALIZAÇÃO DE 20/10/2026: +197 tickers. Search Console pela API (sem o
 * corte de 1.000 linhas do export), páginas /asset com pelo menos 1 impressão
 * de 19/07 a 18/10, que estão vivas no /tickers-full (ação, FII, BDR ou ETF,
 * com preço de outubro, sem `alias_of`). Total: 660 tickers.
 */
export const INDEXABLE_ASSETS: ReadonlySet<string> = new Set([
  'A1AP34', 'A1LB34', 'A1MT34', 'A1NE34', 'A1RE34', 'A1ZN34', 'AALL34', 'AAPL34',
  'ABCB4', 'ABCP11', 'ABEV3', 'AESB3', 'AFHF11', 'AFHI11', 'AFLT3', 'AGRX11',
  'AHEB3', 'ALLD3', 'ALOS3', 'ALUP4', 'ALZC11', 'AMBP3', 'AMZO34', 'APTI4',
  'APTO11', 'APXR11', 'ARML3', 'ARMT34', 'ARND3', 'AROA11', 'ARRI11', 'ARTE11',
  'ASAI3', 'ASML34', 'ATSA11', 'AUAU3', 'AUPO11', 'AURO11', 'AUVP11', 'AXIA3',
  'AXIA5', 'AXIA6', 'AXIA7', 'AXPB34', 'AZEV3', 'AZOI34', 'AZTE3', 'AZUL4',
  'AZUL53', 'AZZA3', 'B1AM34', 'B1IL34', 'B2HI34', 'B3BR11', 'B3SA3', 'BAHI3',
  'BALM3', 'BAUH4', 'BAZA3', 'BBAS3', 'BBDC4', 'BBGO11', 'BBML3', 'BBSE3',
  'BCFF11', 'BDLL3', 'BDLL4', 'BEEF3', 'BERK34', 'BGIP3', 'BGIP4', 'BGRB11',
  'BHIA3', 'BIDB11', 'BIDI11', 'BIDI4', 'BINC11', 'BINR11', 'BITI11', 'BKNG34',
  'BLMR11', 'BMEB3', 'BMEB4', 'BMGB10', 'BMIN3', 'BMIN4', 'BNBR3', 'BNDX11',
  'BOAS3', 'BPAC11', 'BPAC3', 'BPAR3', 'BPFF11', 'BRAP3', 'BRAP4', 'BRAZ11',
  'BRCO11', 'BRFS3', 'BRFT11', 'BRIP11', 'BRKM5', 'BRML3', 'BROF11', 'BRPR3',
  'BRSR3', 'BRSR5', 'BRSR6', 'BRST3', 'BSLI4', 'BSLT11', 'BTLG11', 'BTYU11',
  'BZLI11', 'C1BL34', 'C1CL34', 'C1DN34', 'CACR11', 'CALI3', 'CAMB4', 'CAML3',
  'CARE11', 'CASA11', 'CASN3', 'CASN4', 'CATA3', 'CCTY3', 'CCXC3', 'CEAB3',
  'CEBR3', 'CEBR5', 'CEBR6', 'CEDO3', 'CEDO4', 'CEEB3', 'CEEB5', 'CEEB6',
  'CEED4', 'CEPE3', 'CEPE5', 'CEPE6', 'CESP3', 'CESP5', 'CESP6', 'CFII11',
  'CGRA3', 'CGRA4', 'CHIP11', 'CIEL3', 'CLSC3', 'CLSC4', 'CMCS34', 'CMDB11',
  'CMIG4', 'CNSY3', 'COCE3', 'COCE5', 'COCE6', 'COGN3', 'COPH34', 'COPN11',
  'CORR3', 'COWC34', 'CPLE5', 'CPLE6', 'CPRE3', 'CPTS11', 'CREM3', 'CRFB3',
  'CRIV4', 'CRPG6', 'CRPT11', 'CSAN3', 'CSED3', 'CSNA3', 'CSRN3', 'CSUD3',
  'CTAX3', 'CTEM11', 'CTGP34', 'CTKA3', 'CTKA4', 'CTNM3', 'CTNM4', 'CURY3',
  'CVCB3', 'CXSE3', 'CYLD11', 'CYRE3', 'CYRE4', 'D1DG34', 'D1EL34', 'D2OC34',
  'DAMA11', 'DAMT11', 'DEBB11', 'DESK3', 'DEXP3', 'DISB34', 'DIVD11', 'DIVS11',
  'DMMO3', 'DTCY3', 'DVLT11', 'E1CO34', 'E2EF34', 'E2NP34', 'E2TS34', 'ECOR3',
  'ECPR4', 'EDGE11', 'EEEL3', 'EEEL4', 'EGIE3', 'EIRA11', 'EKTR4', 'ELET3',
  'ELMD3', 'ELPL3', 'EMBJ3', 'EMBR3', 'EMET11', 'ENGI11', 'ENMT4', 'EQIX34',
  'EQPA5', 'EQPA6', 'EQTL3', 'ESPA3', 'ETER3', 'ETHE11', 'EVEB31', 'EVTC31',
  'EXIF11', 'EZTC3', 'F1TN34', 'FAED11', 'FATN11', 'FCXO34', 'FDMO34', 'FESA3',
  'FESA4', 'FGAA11', 'FIGE3', 'FIIB11', 'FIQE3', 'FIXA11', 'FLRY3', 'FMOF11',
  'FOMO11', 'FPNG11', 'G2EV34', 'GAME11', 'GBIO33', 'GENB11', 'GEPA3', 'GETT11',
  'GETT3', 'GETT4', 'GGBR4', 'GGRC11', 'GLCR11', 'GNDI3', 'GOGL34', 'GOLD11',
  'GOLL54', 'GPAR3', 'GRND3', 'GRUL11', 'HABT11', 'HAPV3', 'HBTS5', 'HCST11',
  'HDEL11', 'HFOF11', 'HGBS11', 'HGCR11', 'HGLG11', 'HGRE11', 'HGRU11', 'HGTX3',
  'HIGH11', 'HODL11', 'HOND34', 'HPQB34', 'HRDF11', 'HRES11', 'HSML11', 'HTEK11',
  'IAGR11', 'IB5M11', 'IBCR11', 'ICRI11', 'IDKA11', 'IDVL3', 'IGBR3', 'IGTI11',
  'IGTI4', 'IMAB11', 'INDE11', 'INFB11', 'INLG11', 'INTU34', 'IRDM11', 'ISEN11',
  'ITEC3', 'ITIP11', 'ITLC34', 'ITRI11', 'ITSA4', 'ITUB4', 'IVVB11', 'IWMI11',
  'JBSS3', 'JBSS32', 'JCCJ11', 'JFLL11', 'JMBI11', 'JNJB34', 'JOPA3', 'JSCR11',
  'JSLG3', 'JSRE11', 'K1EY34', 'KLBN11', 'KLBN3', 'KLBN4', 'KNCR11', 'KNIP11',
  'KNPR11', 'KNRI11', 'KOPA11', 'KORE11', 'L1HX34', 'L1KQ34', 'L1MN34', 'L1YB34',
  'LAME4', 'LAVV3', 'LBRD34', 'LCAM3', 'LEVE3', 'LFTB11', 'LINX3', 'LIPR3',
  'LLFT11', 'LMAI11', 'LMTB34', 'LOGG3', 'LPSB3', 'LRDI11', 'LREN3', 'LUXM4',
  'LVBI11', 'LVOL11', 'M1DB34', 'M1KT34', 'M1RN34', 'M1TA34', 'M2PM34', 'M2ST34',
  'MANA11', 'MAPT3', 'MAPT4', 'MARG11', 'MBRF3', 'MCCI11', 'MCDC34', 'MCHF11',
  'MCLO11', 'MDIA3', 'MDNE3', 'MELI34', 'MELK3', 'MGEL3', 'MGFF11', 'MGLU3',
  'MILL11', 'MOAR3', 'MOSC34', 'MOTV3', 'MRCK34', 'MRFG3', 'MSCD34', 'MSFT34',
  'MSPA3', 'MSRO3', 'MTRE3', 'MTSA4', 'MULT3', 'MUTC34', 'MWET4', 'MXRF11',
  'MYPK3', 'N1DA34', 'N1EM34', 'N1GG34', 'N1OW34', 'N1RG34', 'N1TA34', 'N1VO34',
  'N1WG34', 'NAFG3', 'NAFG4', 'NASD11', 'NATU3', 'NAUI11', 'NDIV11', 'NEOE3',
  'NEXT34', 'NFLX34', 'NIKE34', 'NORD3', 'NTCO3', 'NUTR3', 'NVHO11', 'OBTC3',
  'ODPV3', 'OGIN11', 'OIBR3', 'OMGE3', 'ONCO3', 'ONDA11', 'ORCL34', 'ORLY34',
  'ORVR3', 'P1GR34', 'P1LD34', 'P2AT34', 'P2IN34', 'P2LT34', 'PACB11', 'PACC11',
  'PACG11', 'PAGS34', 'PARD3', 'PATI3', 'PATI4', 'PATL11', 'PCIP11', 'PEMA11',
  'PETR3', 'PETR4', 'PFIN11', 'PGMN3', 'PHIP11', 'PHMO34', 'PINE14', 'PINE4',
  'PLAG11', 'PLPL3', 'PMRL11', 'PNCR11', 'POMO3', 'POMO4', 'POSI3', 'PPAR3',
  'PPLA11', 'PRIF11', 'PRIO3', 'PRNR3', 'PSEC11', 'PSSA3', 'PTNT3', 'PTNT4',
  'PVBI11', 'PYPL34', 'QBTC11', 'QCOM34', 'QQQI11', 'QQQQ11', 'QSOL11', 'QUAL3',
  'R2BL34', 'RADL3', 'RAIL3', 'RAIZ4', 'RANI4', 'RBFM11', 'RBHG11', 'RBIF11',
  'RBRI11', 'RBRL11', 'RBRP11', 'RBRX11', 'RBRY11', 'RBTS11', 'RCFA11', 'RDLI11',
  'RDOR3', 'RECT11', 'RENT3', 'RENT4', 'RIAA3', 'RIGG34', 'RINV11', 'RJDA11',
  'RNEW3', 'RNEW4', 'RNGO11', 'RPAD3', 'RPAD5', 'RPAD6', 'RPRI11', 'RURA11',
  'RZAG11', 'RZAT11', 'RZTR11', 'RZZR11', 'S1BS34', 'S1HW34', 'S1NP34', 'S1PO34',
  'S1TX34', 'S1YK34', 'S2EA34', 'S2NA34', 'S2NW34', 'SANB11', 'SAPP34', 'SAPR4',
  'SAUD3', 'SBSP3', 'SBUB34', 'SCHW34', 'SEDU3', 'SEED11', 'SHPP11', 'SILK11',
  'SLBG34', 'SLCE3', 'SLED3', 'SLED4', 'SMFT3', 'SMLS3', 'SMTO3', 'SNEC34',
  'SNID11', 'SNLG11', 'SNME11', 'SNSY3', 'SNSY5', 'SOJA3', 'SOMA3', 'SOND5',
  'SOND6', 'SPMO11', 'SPTW11', 'SPXI11', 'SPXR11', 'SPXS11', 'SPYI11', 'SQIA3',
  'SSFO34', 'STOC34', 'SULA11', 'SUZB3', 'SYNE3', 'T1AM34', 'T1RI34', 'T1SO34',
  'TAEE11', 'TAEE3', 'TAKP34', 'TASA3', 'TCNO3', 'TCNO4', 'TEKA3', 'TELB4',
  'TESA3', 'TEXA34', 'TGAR11', 'TGMA3', 'TGTB34', 'TIET11', 'TIET3', 'TIET4',
  'TIMS3', 'TKNO4', 'TMOS34', 'TOPP11', 'TOTS3', 'TOYB3', 'TPIS3', 'TRIG11',
  'TRIS3', 'TRPL11', 'TRXY11', 'TSLA34', 'TSMC34', 'TXRX4', 'U1AI34', 'U1AL34',
  'U1BE34', 'U1LT34', 'UCAS3', 'UGPA3', 'ULEV34', 'UNIP3', 'UNIP5', 'UNIP6',
  'UPAC34', 'USAL11', 'USBC34', 'USIM3', 'USIM5', 'USIM6', 'USTK11', 'UTEC11',
  'V1MC34', 'VALE3', 'VAMO3', 'VBBR3', 'VERZ34', 'VGHF11', 'VGII11', 'VGRI11',
  'VIGT11', 'VILG11', 'VISA34', 'VISC11', 'VIUR11', 'VIVA3', 'VIVR3', 'VIVT3',
  'VIVT4', 'VLID3', 'VRTA11', 'VRTM11', 'VULC3', 'VVCO11', 'VVCR11', 'VVMR11',
  'W1BD34', 'W1EL34', 'W1MB34', 'W1MC34', 'W2ST34', 'WALM34', 'WDCN3', 'WEGE3',
  'WEST3', 'WFCO34', 'WHGR11', 'WHRL3', 'WIZC3', 'WLMM3', 'WLMM4', 'WPLZ11',
  'WRLD11', 'XBOV11', 'XLPR11', 'XPBR31', 'XPID11', 'XPLG11', 'XPML11', 'XPSF11',
  'XRPH11', 'XRXB34', 'Z2SC34', 'ZAGH11',
])
