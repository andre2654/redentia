#!/usr/bin/env python3
"""Relatório de carteira em PDF (modelo "Carta do private"), A4.

Uso:
    python3 gerar_relatorio.py dados.json relatorio.pdf

dados.json (montado pela skill a partir das ferramentas do MCP):
{
  "carteira":  <data de get_client_portfolio com detail "completo">,   obrigatório
  "cenarios":  [<data de simulate_client_scenario>, ...],              0 a 5 itens
  "mercado":   <data de get_market_snapshot>,                           opcional
  "assessor":  "Nome do assessor",                                      opcional
  "escritorio":"Nome do escritório",                                    opcional
  "resumo":    "Quatro frases (aceita <b>negrito</b>).",               opcional
  "titulo":    "Relatório de carteira",                                 opcional
  "saudacao":  "Uma linha pessoal na capa.",                            opcional
  "marca": {                                                            opcional
    "nome": "Nome do escritório",         cabeçalho, capa e rodapé
    "cor": "#1F4E79",                     acentos e números de destaque
    "logo": "caminho/logo.png",           PNG ou JPG; encaixe proporcional
    "mostrar_redentia": true              "dados e cenários Redentia" no rodapé
  },
  "secoes": { "cenarios": true, "proventos": true, "mercado": true },  opcional
  "data_geracao": "2026-10-07"                                          opcional
}

Sem "marca", o PDF sai no visual da Redentia. Com "marca", o cabeçalho, a capa
e o rodapé passam a ser do escritório. A paginação se ajusta às seções ligadas
e ao tamanho da carteira (1 ou 60 posições).

Só depende de reportlab. Todas as contas (totais, pesos, faixas, quem sente
cada choque) saem dos dados; o texto livre é só o "resumo" e a "saudacao", e
sem resumo o script escreve um descritivo a partir dos números.
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ASSETS = Path(__file__).resolve().parent / "assets"
for _w in (400, 500, 700, 800):
    pdfmetrics.registerFont(TTFont(f"J{_w}", str(ASSETS / f"jakarta-{_w}.ttf")))
# <b> dentro de Paragraph precisa da família registrada, senão sai sem negrito
pdfmetrics.registerFontFamily("J400", normal="J400", bold="J800", italic="J400", boldItalic="J800")

NAVY, BLUE, CREAM, INK = HexColor("#0C1524"), HexColor("#2F6BFF"), HexColor("#F5F1EA"), HexColor("#0A0A0C")
GRAY, GREEN, RED, LINE = HexColor("#6E675B"), HexColor("#148F4E"), HexColor("#D6323B"), HexColor("#E3DDD1")
TEXT, CARD, TRACK = HexColor("#2A2723"), white, HexColor("#E8E2D6")
GREEN_BG, RED_BG = HexColor("#DDEBE3"), HexColor("#F6DCDD")
W, H = A4
M = 44
FUNDO_MIN = 70  # nada de conteúdo corrido abaixo disto (o rodapé fica em 26)
MAX_CENARIOS = 5

CLASSES = {
    "TREASURY": ("Tesouro Direto", HexColor("#0E9E63")),
    "STOCK": ("Ações", HexColor("#2F6BFF")),
    "REIT": ("FIIs", HexColor("#7C5FD6")),
    "ETF": ("ETFs", HexColor("#F2994A")),
    "BDR": ("BDRs", HexColor("#14A3B8")),
    "CRYPTO": ("Cripto", HexColor("#B9AE9C")),
}
SETORES = {
    "tesouro_direto": "Tesouro Direto", "real-estate": "Imobiliário (FIIs)", "utilities": "Energia e saneamento",
    "etf": "ETFs", "energy": "Petróleo e combustíveis", "healthcare": "Saúde", "financial-services": "Financeiro",
    "basic-materials": "Materiais básicos", "industrials": "Indústria", "consumer-cyclical": "Consumo cíclico",
    "consumer-defensive": "Consumo não cíclico", "technology": "Tecnologia", "communication-services": "Telecom e mídia",
    "nao_classificado": "Outros",
}
MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]


# ─────────────── formatação ───────────────
def num(v, dec=0):
    return f"{abs(v):,.{dec}f}".replace(",", "X").replace(".", ",").replace("X", ".")


def brl(v, dec=0, sinal=False):
    if v is None:
        return "—"
    s = "R$ " + num(v, dec)
    if v < 0:
        return "−" + s
    return ("+" + s) if sinal and v > 0 else s


def pct(v, dec=1, sinal=True):
    if v is None:
        return "—"
    s = num(v, dec) + "%"
    if v < 0:
        return "−" + s
    return ("+" + s) if sinal and v > 0 else s


def data_br(iso):
    if not iso:
        return "—"
    y, m, d = iso[:10].split("-")
    return f"{d}/{m}/{y}"


def mes_ano(iso):
    y, m, _ = iso[:10].split("-")
    return f"{MESES[int(m) - 1].capitalize()} de {y}"


def nome_ativo(p):
    t = p.get("ticker") or p.get("name") or "—"
    if t.startswith("TD-"):
        return p.get("name") or t
    return t


def faixa(c):
    a, f = c.get("anchor_brl") or 0, c["final"]
    if not a:
        return 0.0, 0.0, 0.0
    return (f["p10"] / a - 1) * 100, (f["p50"] / a - 1) * 100, (f["p90"] / a - 1) * 100


def efeito_posicao(p):
    """Choque que a posição sente no cenário. Na renda fixa pré/IPCA+ o motor
    deixa shock_pct em 0 e põe a marcação a mercado em rf_mark_pct: é ela que
    conta."""
    if p.get("klass") == "RF" and p.get("rf_mark_pct") is not None:
        return p["rf_mark_pct"]
    return p.get("shock_pct") or 0


def largura(s, font, size):
    return pdfmetrics.stringWidth(s, font, size)


def encaixar(s, font, size, maxw):
    """Trunca com reticências pra caber em maxw."""
    if largura(s, font, size) <= maxw:
        return s
    while len(s) > 1 and largura(s + "…", font, size) > maxw:
        s = s[:-1]
    return s.rstrip() + "…"


def tamanho_que_cabe(s, font, size, maxw, minimo):
    """Reduz o corpo da fonte até caber (ou até o mínimo)."""
    while size > minimo and largura(s, font, size) > maxw:
        size -= 0.5
    return size


def cor_hex(v):
    if not isinstance(v, str):
        return None
    s = v.strip().lstrip("#")
    if re.fullmatch(r"[0-9a-fA-F]{3}", s):
        s = "".join(ch * 2 for ch in s)
    if not re.fullmatch(r"[0-9a-fA-F]{6}", s):
        return None
    return "#" + s.upper()


def luminancia(hexstr):
    r, g, b = (int(hexstr[i:i + 2], 16) / 255 for i in (1, 3, 5))

    def lin(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def contraste(hex_a, hex_b):
    la, lb = luminancia(hex_a), luminancia(hex_b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


# ─────────────── documento ───────────────
class Doc:
    def __init__(self, path, dados, base_dir):
        self.c = canvas.Canvas(path, pagesize=A4)
        self.d = dados
        self.cart = dados["carteira"]
        self.cliente = (self.cart.get("client") or {}).get("name") or "Cliente"
        self.titulo = (dados.get("titulo") or "Relatório de carteira").strip()
        self.pagina = 0
        self.total = 0

        marca = dados.get("marca") if isinstance(dados.get("marca"), dict) else {}
        self.marca_nome = (marca.get("nome") or "").strip() or None
        self.mostrar_redentia = marca.get("mostrar_redentia", True) is not False
        self.marca_logo = None
        if marca.get("logo"):
            caminho = Path(marca["logo"])
            for cand in (caminho, base_dir / caminho, Path.cwd() / caminho):
                if cand.is_file():
                    try:
                        self.marca_logo = ImageReader(str(cand))
                        self.marca_logo.getSize()
                    except Exception as e:  # noqa: BLE001
                        print(f"aviso: não consegui ler o logo {cand}: {e}", file=sys.stderr)
                        self.marca_logo = None
                    break
            else:
                print(f"aviso: logo não encontrado: {marca['logo']} — o PDF sai sem logo", file=sys.stderr)
        # a marca "existe" quando tem nome ou logo; cor sozinha só muda os acentos
        self.com_marca = bool(self.marca_nome or self.marca_logo)

        cor = cor_hex(marca.get("cor"))
        if marca.get("cor") and not cor:
            print(f"aviso: cor inválida {marca.get('cor')!r} (use #RRGGBB) — mantive o padrão", file=sys.stderr)
        self.cor_fill = HexColor(cor) if cor else BLUE
        # Texto e números grandes só na cor do escritório se ela contrasta com o
        # fundo creme; cor clara fica nos detalhes (barras, marcadores, filetes).
        self.cor_text = HexColor(cor) if cor and contraste(cor, "#F5F1EA") >= 3.0 else NAVY
        self.cor_rule = HexColor(cor) if cor else LINE

        sec = dados.get("secoes") if isinstance(dados.get("secoes"), dict) else {}
        pm = sec.get("proventos_mercado")
        self.sec_cenarios = sec.get("cenarios", True) is not False
        self.sec_proventos = sec.get("proventos", pm if pm is not None else True) is not False
        self.sec_mercado = sec.get("mercado", pm if pm is not None else True) is not False

        self.cenarios = (dados.get("cenarios") or [])[:MAX_CENARIOS] if self.sec_cenarios else []
        self.proventos = sorted(self.cart.get("upcoming_dividends") or [], key=lambda p: p.get("payment_date") or "9999") if self.sec_proventos else []
        self.mercado = (dados.get("mercado") or {}) if self.sec_mercado else {}

        self.c.setTitle(f"{self.titulo} · {self.cliente}")
        self.c.setAuthor(self.marca_nome or "Redentia")
        self.c.setSubject(self.titulo)

    # ── primitivas ──
    def text(self, x, y, s, font="J400", size=10, color=INK, align="l"):
        c = self.c
        c.setFont(font, size)
        c.setFillColor(color)
        {"l": c.drawString, "r": c.drawRightString, "c": c.drawCentredString}[align](x, y, s)

    def para(self, html, x, y, w, size=10, font="J400", color=TEXT, leading=None):
        st = ParagraphStyle("p", fontName=font, fontSize=size, leading=leading or size * 1.5, textColor=color)
        p = Paragraph(html, st)
        _, h = p.wrap(w, 2000)
        p.drawOn(self.c, x, y - h)
        return h

    @staticmethod
    def altura_para(html, w, size=10, font="J400", leading=None):
        st = ParagraphStyle("p", fontName=font, fontSize=size, leading=leading or size * 1.5)
        _, h = Paragraph(html, st).wrap(w, 2000)
        return h

    def fundo(self):
        self.c.setFillColor(CREAM)
        self.c.rect(0, 0, W, H, stroke=0, fill=1)

    def marca_topo(self, x, y, h):
        """Logo e nome no canto superior esquerdo. Sem marca: Redentia."""
        if not self.com_marca:
            self.c.drawImage(str(ASSETS / "logo.png"), x, y, h, h, mask="auto")
            self.text(x + h + 7, y + h * 0.25, "Redentia", "J800", h * 0.72)
            return
        if self.marca_logo:
            iw, ih = self.marca_logo.getSize()
            escala = min(h / ih, (h * 5) / iw)  # cabe na altura e em no máximo 5x a altura de largura
            lw, lh = iw * escala, ih * escala
            self.c.drawImage(self.marca_logo, x, y + (h - lh) / 2, lw, lh, mask="auto")
            x += lw + 8
        if self.marca_nome:
            size = h * 0.72
            nome = encaixar(self.marca_nome, "J800", size, 290)
            self.text(x, y + h * 0.25, nome, "J800", size)

    def rodape(self):
        ref = data_br(self.cart.get("as_of"))
        direita = "material informativo, não é recomendação de investimento"
        if self.com_marca and self.mostrar_redentia:
            direita = "dados e cenários Redentia · " + direita
        quem = self.marca_nome or "Redentia"
        resto = f" · dados de {ref} · página {self.pagina} de {self.total}"
        disponivel = (W - 2 * M) - largura(direita, "J500", 7.2) - 16
        quem = encaixar(quem, "J500", 7.2, max(60, disponivel - largura(resto, "J500", 7.2)))
        self.text(M, 26, quem + resto, "J500", 7.2, GRAY)
        self.text(W - M, 26, direita, "J500", 7.2, GRAY, "r")

    def cabecalho_interno(self, titulo, sub):
        self.fundo()
        self.marca_topo(M, H - 62, 18)
        self.text(W - M, H - 50, encaixar(self.titulo.upper(), "J500", 8, 240), "J500", 8, GRAY, "r")
        self.text(W - M, H - 62, encaixar(self.cliente, "J700", 9.5, 240), "J700", 9.5, INK, "r")
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(0.8)
        self.c.line(M, H - 76, W - M, H - 76)
        size = tamanho_que_cabe(titulo, "J800", 24, W - 2 * M, 16)
        self.text(M, H - 118, titulo, "J800", size, INK)
        return self.para(sub, M, H - 132, W - 2 * M, size=9.5, color=GRAY) + 132

    def nova_pagina(self):
        if self.pagina:
            self.rodape()
            self.c.showPage()
        self.pagina += 1

    def salvar(self):
        self.rodape()
        self.c.showPage()
        self.c.save()


# ─────────────── dados derivados ───────────────
def resumo_automatico(doc):
    cart, cen = doc.cart, doc.cenarios
    tot = cart.get("totals") or {}
    classes = (cart.get("allocation") or {}).get("by_class") or []
    por_classe = {a["key"]: a.get("weight") or 0 for a in classes}
    frases = [f"A carteira soma <b>{brl(tot.get('value'))}</b> em {len(por_classe)} {'classe' if len(por_classe) == 1 else 'classes'} de ativo"]
    if "TREASURY" in por_classe:
        frases[0] += f", com <b>{pct(por_classe['TREASURY'] * 100, 0, False)} em Tesouro Direto</b>"
    frases[0] += "."
    conc = cart.get("concentration") or {}
    if conc.get("top5_weight") is not None and len(cart.get("positions") or []) > 1:
        frases.append(f"As cinco maiores posições somam <b>{pct(conc['top5_weight'] * 100, 0, False)} do patrimônio</b>.")
    if doc.proventos:
        total = sum(p.get("estimated_total") or 0 for p in doc.proventos)
        frases.append(f"Há <b>{brl(total)} em proventos</b> a receber nos próximos dias.")
    if cen:
        ordenados = sorted(cen, key=lambda c: faixa(c)[1])
        pior, melhor = ordenados[0], ordenados[-1]
        anos = cen[0].get("horizon_years") or 1
        horizonte = "12 meses" if anos == 1 else f"{anos} anos"
        frases.append(
            f"Nos cenários simulados para os próximos {horizonte}, o caminho central vai de <b>{pct(faixa(pior)[1])}</b> "
            f"({pior['scenario']['title'].lower()}) a <b>{pct(faixa(melhor)[1])}</b> ({melhor['scenario']['title'].lower()})."
        )
    return " ".join(frases)


# ─────────────── plano de páginas ───────────────
LINHA_GRUPO, LINHA_POS, GAP_GRUPO, LINHA_TOTAL = 18, 17, 6, 40
SUB_COMPOSICAO = "{n} {pos}{onde}, com preços de {data}. Resultado sobre o preço médio, antes de impostos."


def sub_composicao(cart):
    n = cart.get("positions_total", len(cart.get("positions") or []))
    onde = f" em {cart['institution']}" if cart.get("institution") else ""
    return SUB_COMPOSICAO.format(n=n, pos="posição" if n == 1 else "posições", onde=onde, data=data_br(cart.get("as_of")))


def altura_setores(cart):
    setores = (cart.get("allocation") or {}).get("by_sector") or []
    return 0 if not setores else 24 + min(len(setores), 7) * 18 + 16


def paginar_composicao(doc):
    """Divide a tabela de posições em páginas. Cada página é uma lista de
    itens: ("grupo", key) · ("pos", p) · ("gap",) · ("total",) · ("setores",).
    Um grupo nunca fica órfão no pé da página; a seção por setor entra na
    última página se couber, senão ganha a própria."""
    cart = doc.cart
    topo = Doc.altura_para(sub_composicao(cart), W - 2 * M, 9.5) + 132
    y_ini = H - topo - 44
    grupos = {}
    for p in cart.get("positions") or []:
        grupos.setdefault(p.get("asset_class") or "OUTROS", []).append(p)
    ordem = [a["key"] for a in (cart.get("allocation") or {}).get("by_class") or []]
    ordem += [k for k in grupos if k not in ordem]

    seq = []
    for k in ordem:
        ps = grupos.get(k, [])
        if not ps:
            continue
        seq.append(("grupo", k))
        seq += [("pos", p) for p in ps]
        seq.append(("gap",))
    seq.append(("total",))
    h_set = altura_setores(cart)
    if h_set:
        seq.append(("setores",))

    paginas, atual, y = [], [], y_ini
    i = 0
    while i < len(seq):
        item = seq[i]
        if item[0] == "grupo":
            precisa = LINHA_GRUPO + LINHA_POS  # cabeçalho + pelo menos 1 linha
        elif item[0] == "pos":
            precisa = LINHA_POS
        elif item[0] == "gap":
            precisa = 0
        elif item[0] == "total":
            precisa = LINHA_TOTAL
        else:
            precisa = h_set + 30
        if y - precisa < FUNDO_MIN and atual:
            paginas.append(atual)
            atual, y = [], y_ini
            continue
        atual.append(item)
        y -= {"grupo": LINHA_GRUPO, "pos": LINHA_POS, "gap": GAP_GRUPO, "total": LINHA_TOTAL, "setores": h_set}[item[0]]
        i += 1
    if atual:
        paginas.append(atual)
    return paginas


def planejar(doc):
    plano = [("capa", None)]
    for chunk in paginar_composicao(doc):
        plano.append(("composicao", chunk))
    if doc.cenarios:
        plano.append(("cenarios", None))
    plano.append(("notas", None))
    return plano


# ─────────────── página 1: capa ───────────────
def pagina_capa(doc, plano):
    d, cart = doc.d, doc.cart
    tot = cart.get("totals") or {}
    doc.nova_pagina()
    doc.fundo()
    doc.marca_topo(M, H - 66, 22)
    doc.text(W - M, H - 52, encaixar(doc.titulo.upper(), "J500", 8.5, 250), "J500", 8.5, GRAY, "r")
    doc.text(W - M, H - 66, mes_ano(cart.get("as_of") or d.get("data_geracao") or date.today().isoformat()), "J700", 10, INK, "r")
    doc.c.setStrokeColor(doc.cor_rule)
    doc.c.setLineWidth(0.8 if doc.cor_rule is LINE else 1.2)
    doc.c.line(M, H - 82, W - M, H - 82)

    y = H - 120
    doc.text(M, y, "Preparado para", "J500", 9, GRAY)
    y -= 32
    size = tamanho_que_cabe(doc.cliente, "J800", 30, W - 2 * M, 18)
    doc.text(M, y, encaixar(doc.cliente, "J800", size, W - 2 * M), "J800", size, INK)
    y -= 18
    if d.get("saudacao"):
        topo_saud = y + 10
        h = doc.para(str(d["saudacao"]).strip(), M, topo_saud, W - 2 * M, size=10.5, color=TEXT, leading=15)
        y = topo_saud - h - 14
    partes = []
    if d.get("assessor") or d.get("escritorio"):
        partes.append("Assessor: " + " · ".join(x for x in (d.get("assessor"), d.get("escritorio")) if x))
    if cart.get("institution"):
        partes.append("Custódia: " + cart["institution"])
    if partes:
        linha = "   |   ".join(partes)
        if largura(linha, "J400", 9.5) <= W - 2 * M:
            doc.text(M, y, linha, "J400", 9.5, GRAY)
        else:  # longo demais numa linha: uma informação por linha
            for i, parte in enumerate(partes):
                doc.text(M, y - i * 13, encaixar(parte, "J400", 9.5, W - 2 * M), "J400", 9.5, GRAY)
            y -= 13 * (len(partes) - 1)

    y -= 48
    doc.text(M, y, f"Patrimônio em {data_br(cart.get('as_of'))}", "J500", 9, GRAY)
    y -= 52
    valor = brl(tot.get("value"))
    size = tamanho_que_cabe(valor, "J800", 54, W - 2 * M, 34)
    doc.text(M - 2, y, valor, "J800", size, doc.cor_text)
    y -= 22
    if tot.get("pnl_brl") is not None:
        cor = GREEN if tot["pnl_brl"] >= 0 else RED
        doc.text(M, y, f"{brl(tot['pnl_brl'], sinal=True)} ({pct(tot.get('pnl_pct'), 2)}) sobre o valor investido", "J700", 11, cor)
    if tot.get("day_change_pct") is not None:
        doc.text(W - M, y, f"{pct(tot['day_change_pct'], 2)} no dia", "J500", 10, GRAY, "r")

    # resumo: encolhe a fonte se o texto for longo demais pra capa
    texto = d.get("resumo") or resumo_automatico(doc)
    cy = y - 30
    for tam in (10.5, 9.8, 9.2, 8.6):
        lead = tam * 1.57
        th = Doc.altura_para(texto, W - 2 * M - 44, tam, leading=lead)
        card = max(110, th + 66)
        ay = cy - card - 40
        dy = ay - 105
        if dy - 53 >= 150:
            break
    doc.c.setFillColor(CARD)
    doc.c.roundRect(M, cy - card, W - 2 * M, card, 10, stroke=0, fill=1)
    doc.text(M + 22, cy - 30, "A carteira em quatro frases", "J800", 12)
    doc.para(texto, M + 22, cy - 42, W - 2 * M - 44, size=tam, leading=lead)

    doc.text(M, ay, "Onde está o patrimônio", "J800", 12)
    classes = (cart.get("allocation") or {}).get("by_class") or []
    total = sum(a.get("value") or 0 for a in classes) or 1
    x = M
    for a in classes:
        seg = (W - 2 * M) * (a.get("value") or 0) / total
        doc.c.setFillColor(CLASSES.get(a["key"], (a["key"], GRAY))[1])
        doc.c.rect(x, ay - 30, max(seg - 1.5, 0), 14, stroke=0, fill=1)
        x += seg
    col = (W - 2 * M) / 4  # 4 por linha; da quinta classe em diante, segunda linha
    for i, a in enumerate(classes[:8]):
        nome, cor = CLASSES.get(a["key"], (a["key"], GRAY))
        lx = M + (i % 4) * col
        ly = ay - (0 if i < 4 else 30)
        doc.c.setFillColor(cor)
        doc.c.circle(lx + 4, ly - 49, 3.5, stroke=0, fill=1)
        rot = f"{nome} {pct((a.get('weight') or 0) * 100, 0, False)}"
        fs = tamanho_que_cabe(rot, "J700", 9.5, col - 16, 8)
        doc.text(lx + 12, ly - 52, encaixar(rot, "J700", fs, col - 16), "J700", fs)
        doc.text(lx + 12, ly - 64, brl(a.get("value")), "J400", 8.5, GRAY)
    if len(classes) > 4:
        dy -= 30

    posicoes = cart.get("positions") or []
    destaques = []
    if posicoes:
        maior = max(posicoes, key=lambda p: p.get("weight") or 0)
        destaques.append(("Maior posição", nome_ativo(maior), f"{pct((maior.get('weight') or 0) * 100, 1, False)} da carteira"))
        com_pnl = [p for p in posicoes if p.get("pnl_pct") is not None]
        if com_pnl:
            melhor = max(com_pnl, key=lambda p: p["pnl_pct"])
            destaques.append(("Melhor resultado", nome_ativo(melhor), f"{pct(melhor['pnl_pct'])} sobre o custo"))
    if doc.proventos:
        p = doc.proventos[0]
        destaques.append(("Próximo provento", f"{p.get('ticker', '—')} · {data_br(p.get('payment_date'))[:5]}", f"{brl(p.get('estimated_total') or 0)} estimados"))
    if len(destaques) < 3:
        destaques.append(("Posições", str(cart.get("positions_total", len(posicoes))), "ativos na carteira" if len(posicoes) != 1 else "ativo na carteira"))
    if len(destaques) < 3 and (cart.get("concentration") or {}).get("hhi") is not None:
        destaques.append(("Concentração (HHI)", num(cart["concentration"]["hhi"], 3), "índice de Herfindahl"))
    bw = (W - 2 * M - 24) / 3
    for i, (rot, val, sub) in enumerate(destaques[:3]):
        bx = M + i * (bw + 12)
        doc.c.setStrokeColor(LINE)
        doc.c.setLineWidth(1)
        doc.c.line(bx, dy, bx + bw, dy)
        doc.text(bx, dy - 18, rot, "J500", 8.5, GRAY)
        vs = tamanho_que_cabe(val, "J800", 14, bw, 10)
        doc.text(bx, dy - 38, encaixar(val, "J800", vs, bw), "J800", vs)
        doc.text(bx, dy - 53, encaixar(sub, "J400", 9, bw), "J400", 9, GRAY)

    # sumário: segue o plano real de páginas
    itens = []
    vistos = set()
    for n, (tipo, _) in enumerate(plano, start=1):
        if tipo in vistos or tipo == "capa":
            continue
        vistos.add(tipo)
        rot = {"composicao": "Composição e resultado", "cenarios": "Cenários para 12 meses" if (doc.cenarios and (doc.cenarios[0].get("horizon_years") or 1) == 1) else "Cenários", "notas": "Proventos e notas" if (doc.proventos or doc.mercado) else "Notas"}[tipo]
        itens.append((str(n), rot))
    sy = min(120, dy - 53 - 30)
    doc.text(M, sy, "NESTE RELATÓRIO", "J500", 8.5, GRAY)
    for i, (n, t) in enumerate(itens):
        x = M + i * ((W - 2 * M) / 3)
        doc.text(x, sy - 18, n, "J800", 9.5, doc.cor_fill)
        doc.text(x + 12, sy - 18, t, "J500", 9.5)


# ─────────────── página 2..k: composição ───────────────
COLS = [("ATIVO", M, "l"), ("QTD.", M + 196, "r"), ("PREÇO MÉDIO", M + 270, "r"), ("ATUAL", M + 340, "r"),
        ("VALOR", M + 418, "r"), ("PESO", M + 460, "r"), ("RESULTADO", W - M, "r")]


def pagina_composicao(doc, chunk, continuacao):
    cart = doc.cart
    tot = cart.get("totals") or {}
    by_class = (cart.get("allocation") or {}).get("by_class") or []
    doc.nova_pagina()
    titulo = "Composição e resultado" + (" (continuação)" if continuacao else "")
    topo = doc.cabecalho_interno(titulo, sub_composicao(cart))
    y = H - topo - 22
    tem_pos = any(it[0] == "pos" for it in chunk)
    if tem_pos:
        for t, x, a in COLS:
            doc.text(x, y, t, "J700", 7.2, GRAY, a)
        doc.c.setStrokeColor(INK)
        doc.c.setLineWidth(0.8)
        doc.c.line(M, y - 6, W - M, y - 6)
    y -= 22

    # página que começa no meio de um grupo repete o nome dele
    if chunk and chunk[0][0] == "pos":
        k = chunk[0][1].get("asset_class") or "OUTROS"
        nome, cor = CLASSES.get(k, (k, GRAY))
        doc.c.setFillColor(cor)
        doc.c.circle(M + 4, y + 3, 3.5, stroke=0, fill=1)
        doc.text(M + 13, y, f"{nome} (continuação)", "J800", 9.5)
        y -= LINHA_GRUPO

    for item in chunk:
        if item[0] == "grupo":
            k = item[1]
            nome, cor = CLASSES.get(k, (k, GRAY))
            sub = next((a for a in by_class if a["key"] == k), None)
            doc.c.setFillColor(cor)
            doc.c.circle(M + 4, y + 3, 3.5, stroke=0, fill=1)
            doc.text(M + 13, y, nome, "J800", 9.5)
            if sub:
                doc.text(M + 418, y, brl(sub.get("value")), "J800", 9, INK, "r")
                doc.text(M + 460, y, pct((sub.get("weight") or 0) * 100, 1, False), "J800", 9, INK, "r")
            y -= LINHA_GRUPO
        elif item[0] == "pos":
            p = item[1]
            doc.text(M + 13, y, encaixar(nome_ativo(p), "J700", 8.8, 150), "J700", 8.8)
            q = p.get("quantity")
            doc.text(M + 196, y, "—" if q is None else num(q, 2 if q != int(q) else 0), "J400", 8.6, TEXT, "r")
            doc.text(M + 270, y, brl(p.get("average_price"), 2), "J400", 8.6, TEXT, "r")
            doc.text(M + 340, y, brl(p.get("current_price"), 2), "J400", 8.6, TEXT, "r")
            doc.text(M + 418, y, brl(p.get("current_value")), "J400", 8.6, TEXT, "r")
            doc.text(M + 460, y, pct((p.get("weight") or 0) * 100, 1, False), "J400", 8.6, TEXT, "r")
            pnl = p.get("pnl_pct")
            doc.text(W - M, y, pct(pnl), "J700", 8.6, GRAY if pnl is None else GREEN if pnl >= 0 else RED, "r")
            doc.c.setStrokeColor(LINE)
            doc.c.setLineWidth(0.5)
            doc.c.line(M + 13, y - 6, W - M, y - 6)
            y -= LINHA_POS
        elif item[0] == "gap":
            y -= GAP_GRUPO
        elif item[0] == "total":
            doc.c.setStrokeColor(INK)
            doc.c.setLineWidth(0.8)
            doc.c.line(M, y + 8, W - M, y + 8)
            doc.text(M, y - 6, "Total", "J800", 10)
            doc.text(M + 418, y - 6, brl(tot.get("value")), "J800", 10, INK, "r")
            doc.text(M + 460, y - 6, "100%", "J800", 9, INK, "r")
            if tot.get("pnl_brl") is not None:
                cor = GREEN if tot["pnl_brl"] >= 0 else RED
                doc.text(W - M, y - 6, pct(tot.get("pnl_pct"), 2), "J800", 9.5, cor, "r")
                doc.text(M, y - 21, f"Investido {brl(tot.get('invested'))} · resultado {brl(tot['pnl_brl'], sinal=True)}", "J400", 8.5, GRAY)
            y -= LINHA_TOTAL
        elif item[0] == "setores":
            y -= 22
            doc.text(M, y, "Por setor", "J800", 12)
            setores = sorted((cart.get("allocation") or {}).get("by_sector") or [], key=lambda s: -(s.get("weight") or 0))[:7]
            larg = W - 2 * M - 210
            for i, s in enumerate(setores):
                yy = y - 24 - i * 18
                rot = SETORES.get(s["key"], s["key"].replace("-", " ").replace("_", " ").capitalize())
                doc.text(M, yy, encaixar(rot, "J500", 9, 140), "J500", 9)
                doc.c.setFillColor(TRACK)
                doc.c.roundRect(M + 150, yy - 2, larg, 8, 4, stroke=0, fill=1)
                doc.c.setFillColor(doc.cor_fill)
                doc.c.roundRect(M + 150, yy - 2, max(larg * (s.get("weight") or 0), 4), 8, 4, stroke=0, fill=1)
                doc.text(W - M, yy, pct((s.get("weight") or 0) * 100, 1, False), "J700", 9, INK, "r")
            y -= altura_setores(cart)


# ─────────────── cenários ───────────────
def rotulo_procedencia(doc, c):
    prov = (c.get("scenario") or {}).get("provenance")
    if prov == "library":
        return "estudado pela Redentia, com fontes" if doc.mostrar_redentia else "cenário estudado, com fontes"
    if prov == "custom":
        return "montado na hora, sem precedente"
    return "cenário base, sem choque"


def pagina_cenarios(doc):
    cen = sorted(doc.cenarios, key=lambda c: -faixa(c)[1])
    doc.nova_pagina()
    caminhos = (cen[0].get("assumptions") or {}).get("paths") or 2000
    anos = cen[0].get("horizon_years") or 1
    horizonte = "12 meses" if anos == 1 else f"{anos} anos"
    topo = doc.cabecalho_interno(
        f"Cenários para os próximos {horizonte}",
        f"Cada cenário roda {num(caminhos)} caminhos sobre esta carteira. A barra vai do resultado pessimista (p10) "
        f"ao otimista (p90); o ponto é o caminho central (p50). Valores em poder de compra de hoje.",
    )
    lo = min(-25, min(faixa(c)[0] for c in cen) - 3)
    hi = max(40, max(faixa(c)[2] for c in cen) + 3)
    x0, x1 = M + 178, W - M - 8

    def X(v):
        return x0 + (v - lo) / (hi - lo) * (x1 - x0)

    y = H - topo - 30
    bloco = min(88, (y - 170) / len(cen))
    for c in cen:
        a, m, b = faixa(c)
        cor = GREEN if m >= 0 else RED
        titulo = (c.get("scenario") or {}).get("title") or "Cenário"
        ts = tamanho_que_cabe(titulo, "J800", 11.5, 166, 9.5)
        doc.text(M, y, encaixar(titulo, "J800", ts, 166), "J800", ts)
        doc.text(M, y - 13, encaixar(rotulo_procedencia(doc, c), "J400", 8, 166), "J400", 8, GRAY)
        doc.text(M, y - 32, pct(m), "J800", 16, cor)
        doc.text(M, y - 44, "caminho central", "J400", 7.8, GRAY)
        # régua
        doc.c.setStrokeColor(LINE)
        doc.c.setLineWidth(0.5)
        doc.c.line(x0, y - 6, x1, y - 6)
        doc.c.setStrokeColor(INK)
        doc.c.line(X(0), y - 14, X(0), y + 2)
        doc.c.setFillColor(GREEN_BG if m >= 0 else RED_BG)
        doc.c.roundRect(X(a), y - 12, max(X(b) - X(a), 2), 12, 6, stroke=0, fill=1)
        doc.c.setFillColor(cor)
        doc.c.circle(X(m), y - 6, 5.5, stroke=0, fill=1)
        doc.c.setFillColor(white)
        doc.c.circle(X(m), y - 6, 2.2, stroke=0, fill=1)
        f = c["final"]
        doc.text(x0, y - 27, "Pessimista", "J500", 7.8, GRAY)
        doc.text(x0 + 44, y - 27, f"{pct(a)} · {brl(f['p10'])}", "J700", 7.8, TEXT)
        meio = x0 + (x1 - x0) / 2
        doc.text(meio, y - 27, "Otimista", "J500", 7.8, GRAY)
        doc.text(meio + 36, y - 27, f"{pct(b)} · {brl(f['p90'])}", "J700", 7.8, TEXT)
        pos = sorted(c.get("positions") or [], key=efeito_posicao)
        if m >= 0:
            quem = [p for p in reversed(pos) if efeito_posicao(p) > 0][:3]
            txt = "Quem mais ganha: " if quem else ""
        else:
            quem = [p for p in pos if efeito_posicao(p) < 0][:3]
            txt = "Quem mais sente: " if quem else ""
        if quem:
            txt += ", ".join(f"{nome_ativo(p)} {pct(efeito_posicao(p), 0)}" for p in quem)
            doc.text(x0, y - 42, encaixar(txt, "J500", 8.4, x1 - x0), "J500", 8.4, TEXT)
        doc.c.setStrokeColor(LINE)
        doc.c.setLineWidth(0.6)
        doc.c.line(M, y - bloco + 22, W - M, y - bloco + 22)
        y -= bloco

    # como ler: segue o conteúdo, sem ficar preso no pé da página
    by = max(150, y - 8)
    doc.c.setFillColor(CARD)
    doc.c.roundRect(M, by - 100, W - 2 * M, 112, 10, stroke=0, fill=1)
    doc.text(M + 18, by - 12, "Como ler esta página", "J800", 10.5)
    doc.para(
        "As faixas são estatísticas e não previsão nem promessa de retorno: mostram onde a carteira tende a terminar se o "
        "cenário acontecer, com base no comportamento histórico dos ativos desde 2007 e nas exposições de cada um a juros, "
        f"dólar, petróleo e bolsa. {'O cenário estudado pela Redentia' if doc.mostrar_redentia else 'O cenário estudado'} tem premissas e fontes publicadas; "
        "o montado na hora não tem precedente histórico que o ancore. O impacto por ativo é o efeito direto estimado do "
        "choque no período; na renda fixa, é a marcação a mercado.",
        M + 18, by - 22, W - 2 * M - 36, size=8.8, leading=13.2, color=TEXT,
    )


# ─────────────── última página: proventos, mercado e notas ───────────────
def pagina_notas(doc):
    d, cart = doc.d, doc.cart
    doc.nova_pagina()
    tem_prov_sec, tem_mercado = doc.sec_proventos, bool(doc.mercado)
    if tem_prov_sec or tem_mercado:
        titulo, sub = "Proventos, mercado e notas", "O que entra nos próximos dias, o retrato do mercado na data do relatório e como ler os números."
        if not tem_mercado:
            titulo, sub = "Proventos e notas", "O que entra nos próximos dias e como ler os números."
        elif not tem_prov_sec:
            titulo, sub = "Mercado e notas", "O retrato do mercado na data do relatório e como ler os números."
    else:
        titulo, sub = "Notas", "Como ler os números deste relatório."
    topo = doc.cabecalho_interno(titulo, sub)
    y = H - topo - 26

    # blocos de baixo pra cima: assinatura (fixa) e notas (altura conhecida)
    notas = [
        f"<b>Datas.</b> Preços de {data_br(cart.get('as_of'))}"
        + (f"; variação do dia contra {data_br(cart['price_dates']['previous'])}" if (cart.get("price_dates") or {}).get("previous") else "")
        + ". Ativos sem negociação no dia usam o último preço conhecido.",
        "<b>Resultado.</b> Calculado sobre o preço médio de compra informado pela instituição, antes de impostos e custos.",
    ]
    if doc.proventos:
        nota_prov = (cart.get("upcoming_dividends_window") or {}).get("note") or "Total estimado com a quantidade de hoje; quem vende antes da data-com não recebe."
        notas.append(f"<b>Proventos.</b> {nota_prov}")
    if doc.cenarios:
        motor = "Motor de cenários da Redentia: s" if doc.mostrar_redentia else "S"
        notas.append(f"<b>Cenários.</b> {motor}imulação estatística com premissas abertas. Não é previsão, promessa de retorno nem recomendação.")
    h_notas = 30 + sum(Doc.altura_para(n, W - 2 * M, 8.8, leading=13) + 6 for n in notas)
    h_mercado = 0
    linhas = []
    if tem_mercado:
        ind, mac = doc.mercado.get("indices") or {}, doc.mercado.get("macro") or {}
        for k, rot in (("IBOV", "Ibovespa"), ("IFIX", "IFIX")):
            if isinstance(ind.get(k), dict) and ind[k].get("value") is not None:
                linhas.append((rot, num(ind[k]["value"], 0), ind[k].get("change_pct")))
        if isinstance(mac.get("selic_meta"), dict):
            linhas.append(("Selic", pct(mac["selic_meta"].get("value"), 2, False), None))
        if isinstance(mac.get("ipca_12m"), dict):
            linhas.append(("IPCA 12 meses", pct(mac["ipca_12m"].get("value"), 2, False), None))
        if isinstance(mac.get("usd_brl"), dict):
            linhas.append(("Dólar", brl(mac["usd_brl"].get("value"), 2), mac["usd_brl"].get("delta_pct")))
        if linhas:
            h_mercado = 96
    reservado = 146 + 14 + h_notas + h_mercado  # assinatura + notas + mercado

    if tem_prov_sec:
        doc.text(M, y, "Proventos a receber", "J800", 12)
        y -= 22
        prov = doc.proventos
        if prov:
            cols = [("ATIVO", M, "l"), ("TIPO", M + 90, "l"), ("DATA COM", M + 220, "r"), ("PAGAMENTO", M + 300, "r"), ("POR COTA", M + 390, "r"), ("ESTIMADO", W - M, "r")]
            for t, x, a in cols:
                doc.text(x, y, t, "J700", 7.2, GRAY, a)
            doc.c.setStrokeColor(INK)
            doc.c.setLineWidth(0.8)
            doc.c.line(M, y - 6, W - M, y - 6)
            y -= 21
            cabem = max(1, int((y - reservado - 40) / 20))
            mostrar = prov if len(prov) <= cabem else prov[:max(1, cabem - 1)]
            for p in mostrar:
                doc.text(M, y, encaixar(p.get("ticker") or "—", "J700", 9, 80), "J700", 9)
                doc.text(M + 90, y, encaixar(p.get("type") or "Provento", "J400", 9, 110), "J400", 9, TEXT)
                doc.text(M + 220, y, data_br(p.get("ex_date")), "J400", 9, TEXT, "r")
                doc.text(M + 300, y, data_br(p.get("payment_date")), "J400", 9, TEXT, "r")
                doc.text(M + 390, y, brl(p.get("amount_per_share") or 0, 2), "J400", 9, TEXT, "r")
                doc.text(W - M, y, brl(p.get("estimated_total") or 0, 2), "J700", 9, GREEN, "r")
                doc.c.setStrokeColor(LINE)
                doc.c.setLineWidth(0.5)
                doc.c.line(M, y - 7, W - M, y - 7)
                y -= 20
            resto = prov[len(mostrar):]
            if resto:
                soma = sum(p.get("estimated_total") or 0 for p in resto)
                doc.text(M, y, f"e mais {len(resto)} {'provento' if len(resto) == 1 else 'proventos'}, {brl(soma, 2)} estimados", "J400", 8.8, GRAY)
                y -= 20
            total = sum(p.get("estimated_total") or 0 for p in prov)
            doc.text(M, y - 2, "Total estimado", "J800", 9.5)
            doc.text(W - M, y - 2, brl(total, 2), "J800", 9.5, GREEN, "r")
            y -= 20
        else:
            doc.text(M, y, "Nenhum provento com data de pagamento anunciada para esta carteira.", "J400", 9.5, GRAY)
            y -= 16

    if linhas:
        y -= 26
        doc.text(M, y, f"Mercado em {data_br(cart.get('as_of'))}", "J800", 12)
        y -= 10
        cw = (W - 2 * M) / len(linhas)
        for i, (rot, val, var) in enumerate(linhas):
            x = M + i * cw
            doc.c.setFillColor(CARD)
            doc.c.roundRect(x + (0 if i == 0 else 4), y - 54, cw - 4, 50, 8, stroke=0, fill=1)
            doc.text(x + 14, y - 20, rot, "J500", 8.2, GRAY)
            doc.text(x + 14, y - 38, val, "J800", 12)
            if var is not None:
                doc.text(x + cw - 10, y - 20, pct(var, 2), "J700", 7.8, GREEN if var >= 0 else RED, "r")
        y -= 70

    y -= 14
    doc.text(M, y, "Notas", "J800", 12)
    y -= 8
    for n in notas:
        y -= doc.para(n, M, y, W - 2 * M, size=8.8, leading=13) + 6

    # assinatura
    sy = 120
    doc.c.setStrokeColor(LINE)
    doc.c.setLineWidth(0.8)
    doc.c.line(M, sy + 26, W - M, sy + 26)
    quem = " · ".join(x for x in (d.get("assessor"), d.get("escritorio") or doc.marca_nome) if x)
    doc.text(M, sy, "Preparado por", "J500", 8.5, GRAY)
    doc.text(M, sy - 18, encaixar(quem or "Seu assessor de investimentos", "J800", 13, W - 2 * M), "J800", 13)
    if doc.mostrar_redentia:
        base = "com dados, carteira e motor de cenários da Redentia" if doc.cenarios else "com dados e carteira da Redentia"
        doc.text(M, sy - 33, base, "J400", 8.8, GRAY)
    doc.para(
        "Material informativo, elaborado com dados públicos e da instituição custodiante. Não constitui recomendação de "
        "investimento, oferta ou análise de valores mobiliários nos termos da regulação da CVM. Rentabilidade passada não "
        "garante rentabilidade futura.",
        M, sy - 46, W - 2 * M, size=7.6, leading=11, color=GRAY,
    )


def main():
    if len(sys.argv) != 3:
        print("uso: python3 gerar_relatorio.py dados.json relatorio.pdf", file=sys.stderr)
        sys.exit(2)
    origem = Path(sys.argv[1])
    dados = json.loads(origem.read_text(encoding="utf-8"))
    if "carteira" not in dados:
        sys.exit("dados.json sem a chave obrigatória 'carteira'")
    for k in ("carteira", "mercado"):
        if isinstance(dados.get(k), dict) and "data" in dados[k] and "client" not in dados[k] and "indices" not in dados[k]:
            dados[k] = dados[k]["data"]
    dados["cenarios"] = [c.get("data", c) if "final" not in c else c for c in (dados.get("cenarios") or []) if isinstance(c, dict)]
    dados["cenarios"] = [c for c in dados["cenarios"] if isinstance(c.get("final"), dict)]
    cart = dados["carteira"]
    if not isinstance(cart, dict) or not cart.get("positions"):
        sys.exit("carteira sem posições: confira o 'data' de get_client_portfolio com detail 'completo'")

    doc = Doc(sys.argv[2], dados, origem.resolve().parent)
    plano = planejar(doc)
    doc.total = len(plano)
    continuacao = False
    for tipo, chunk in plano:
        if tipo == "capa":
            pagina_capa(doc, plano)
        elif tipo == "composicao":
            pagina_composicao(doc, chunk, continuacao)
            continuacao = True
        elif tipo == "cenarios":
            pagina_cenarios(doc)
        else:
            pagina_notas(doc)
    doc.salvar()
    print(f"ok: {sys.argv[2]} ({doc.total} páginas)")


if __name__ == "__main__":
    main()
