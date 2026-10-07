#!/usr/bin/env python3
"""Relatório de carteira da Redentia (modelo "Carta do private"), 4 páginas A4.

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
  "data_geracao": "2026-10-07"                                          opcional
}

Só depende de reportlab. Todas as contas (totais, pesos, faixas, quem sente
cada choque) saem dos dados; o texto livre é só o "resumo", e sem ele o script
escreve um resumo descritivo a partir dos números.
"""
import json
import sys
from datetime import date
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
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
TEXT, CARD = HexColor("#2A2723"), white
GREEN_BG, RED_BG = HexColor("#DDEBE3"), HexColor("#F6DCDD")
W, H = A4
M = 44

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
    s = "R$ " + num(v, dec)
    if v < 0:
        return "−" + s
    return ("+" + s) if sinal and v > 0 else s


def pct(v, dec=1, sinal=True):
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
    t = p["ticker"]
    if t.startswith("TD-"):
        return p.get("name") or t
    return t


def faixa(c):
    a, f = c["anchor_brl"], c["final"]
    return (f["p10"] / a - 1) * 100, (f["p50"] / a - 1) * 100, (f["p90"] / a - 1) * 100


# ─────────────── primitivas ───────────────
class Doc:
    def __init__(self, path, dados):
        self.c = canvas.Canvas(path, pagesize=A4)
        self.c.setTitle(f"Relatório de carteira · {dados['carteira']['client']['name']}")
        self.c.setAuthor("Redentia")
        self.d = dados
        self.cart = dados["carteira"]
        self.demo = bool(self.cart.get("demo"))
        self.pagina = 0

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

    def fundo(self):
        self.c.setFillColor(CREAM)
        self.c.rect(0, 0, W, H, stroke=0, fill=1)

    def logo(self, x, y, size=22):
        self.c.drawImage(str(ASSETS / "logo.png"), x, y, size, size, mask="auto")
        self.text(x + size + 7, y + size * 0.25, "Redentia", "J800", size * 0.72)

    def rodape(self):
        ref = data_br(self.cart.get("as_of"))
        self.text(M, 26, f"Redentia · dados de {ref} · página {self.pagina} de 4", "J500", 7.2, GRAY)
        aviso = "material informativo, não é recomendação de investimento"
        self.text(W - M, 26, ("Demonstração · " if self.demo else "") + aviso, "J500", 7.2, GRAY, "r")

    def cabecalho_interno(self, titulo, sub):
        self.fundo()
        self.logo(M, H - 62, 18)
        self.text(W - M, H - 50, "RELATÓRIO DE CARTEIRA", "J500", 8, GRAY, "r")
        self.text(W - M, H - 62, self.cart["client"]["name"], "J700", 9.5, INK, "r")
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(0.8)
        self.c.line(M, H - 76, W - M, H - 76)
        self.text(M, H - 118, titulo, "J800", 24, INK)
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
def resumo_automatico(cart, cen):
    tot = cart["totals"]
    por_classe = {a["key"]: a["weight"] for a in cart["allocation"]["by_class"]}
    frases = [f"A carteira soma <b>{brl(tot['value'])}</b> em {len(por_classe)} classes de ativo"]
    if "TREASURY" in por_classe:
        frases[0] += f", com <b>{pct(por_classe['TREASURY'] * 100, 0, False)} em Tesouro Direto</b>"
    frases[0] += "."
    top5 = cart["concentration"]["top5_weight"] * 100
    frases.append(f"As cinco maiores posições somam <b>{pct(top5, 0, False)} do patrimônio</b>.")
    prov = cart.get("upcoming_dividends") or []
    if prov:
        total = sum(p.get("estimated_total") or 0 for p in prov)
        frases.append(f"Há <b>{brl(total)} em proventos</b> a receber nos próximos dias.")
    if cen:
        ordenados = sorted(cen, key=lambda c: faixa(c)[1])
        pior, melhor = ordenados[0], ordenados[-1]
        frases.append(
            f"Nos cenários testados para 12 meses, a faixa central vai de <b>{pct(faixa(pior)[1])}</b> "
            f"({pior['scenario']['title'].lower()}) a <b>{pct(faixa(melhor)[1])}</b> ({melhor['scenario']['title'].lower()})."
        )
    return " ".join(frases)


# ─────────────── página 1: capa ───────────────
def pagina_capa(doc):
    d, cart = doc.d, doc.cart
    tot = cart["totals"]
    doc.nova_pagina()
    doc.fundo()
    doc.logo(M, H - 66, 22)
    doc.text(W - M, H - 52, "RELATÓRIO DE CARTEIRA", "J500", 8.5, GRAY, "r")
    doc.text(W - M, H - 66, mes_ano(cart.get("as_of") or d.get("data_geracao") or date.today().isoformat()), "J700", 10, INK, "r")
    doc.c.setStrokeColor(LINE)
    doc.c.setLineWidth(0.8)
    doc.c.line(M, H - 82, W - M, H - 82)

    doc.text(M, H - 120, "Preparado para", "J500", 9, GRAY)
    doc.text(M, H - 152, cart["client"]["name"], "J800", 30, INK)
    partes = []
    if d.get("assessor") or d.get("escritorio"):
        partes.append("Assessor: " + " · ".join(x for x in (d.get("assessor"), d.get("escritorio")) if x))
    if cart.get("institution"):
        partes.append("Custódia: " + cart["institution"])
    if partes:
        doc.text(M, H - 170, "   |   ".join(partes), "J400", 9.5, GRAY)

    doc.text(M, H - 218, f"Patrimônio em {data_br(cart.get('as_of'))}", "J500", 9, GRAY)
    doc.text(M - 2, H - 270, brl(tot["value"]), "J800", 54, NAVY)
    if tot.get("pnl_brl") is not None:
        cor = GREEN if tot["pnl_brl"] >= 0 else RED
        doc.text(M, H - 292, f"{brl(tot['pnl_brl'], sinal=True)} ({pct(tot['pnl_pct'], 2)}) sobre o valor investido", "J700", 11, cor)
    doc.text(W - M, H - 292, f"{pct(tot.get('day_change_pct', 0), 2)} no dia", "J500", 10, GRAY, "r")

    cy = H - 322
    texto = d.get("resumo") or resumo_automatico(cart, d.get("cenarios") or [])
    st = ParagraphStyle("r", fontName="J400", fontSize=10.5, leading=16.5, textColor=TEXT)
    _, th = Paragraph(texto, st).wrap(W - 2 * M - 44, 2000)
    card = max(110, th + 66)
    doc.c.setFillColor(CARD)
    doc.c.roundRect(M, cy - card, W - 2 * M, card, 10, stroke=0, fill=1)
    doc.text(M + 22, cy - 30, "O mês em quatro frases", "J800", 12)
    doc.para(texto, M + 22, cy - 42, W - 2 * M - 44, size=10.5, leading=16.5)

    ay = cy - card - 40
    doc.text(M, ay, "Onde está o patrimônio", "J800", 12)
    classes = cart["allocation"]["by_class"]
    total = sum(a["value"] for a in classes) or 1
    x = M
    for a in classes:
        seg = (W - 2 * M) * a["value"] / total
        doc.c.setFillColor(CLASSES.get(a["key"], (a["key"], GRAY))[1])
        doc.c.rect(x, ay - 30, seg - 1.5, 14, stroke=0, fill=1)
        x += seg
    col = (W - 2 * M) / max(len(classes), 4)
    for i, a in enumerate(classes):
        nome, cor = CLASSES.get(a["key"], (a["key"], GRAY))
        lx = M + i * col
        doc.c.setFillColor(cor)
        doc.c.circle(lx + 4, ay - 49, 3.5, stroke=0, fill=1)
        doc.text(lx + 12, ay - 52, f"{nome} {pct(a['weight'] * 100, 0, False)}", "J700", 9.5)
        doc.text(lx + 12, ay - 64, brl(a["value"]), "J400", 8.5, GRAY)

    posicoes = cart["positions"]
    maior = max(posicoes, key=lambda p: p["weight"])
    melhor = max(posicoes, key=lambda p: p.get("pnl_pct") or -999)
    prov = sorted(cart.get("upcoming_dividends") or [], key=lambda p: p.get("payment_date") or "9999")
    destaques = [
        ("Maior posição", nome_ativo(maior), f"{pct(maior['weight'] * 100, 1, False)} da carteira"),
        ("Melhor resultado", nome_ativo(melhor), f"{pct(melhor['pnl_pct'])} sobre o custo"),
    ]
    if prov:
        p = prov[0]
        destaques.append(("Próximo provento", f"{p['ticker']} · {data_br(p['payment_date'])[:5]}", f"{brl(p.get('estimated_total') or 0)} estimados"))
    else:
        destaques.append(("Posições", str(cart.get("positions_total", len(posicoes))), "ativos na carteira"))
    dy = ay - 105
    bw = (W - 2 * M - 24) / 3
    for i, (rot, val, sub) in enumerate(destaques):
        bx = M + i * (bw + 12)
        doc.c.setStrokeColor(LINE)
        doc.c.setLineWidth(1)
        doc.c.line(bx, dy, bx + bw, dy)
        doc.text(bx, dy - 18, rot, "J500", 8.5, GRAY)
        doc.text(bx, dy - 38, val, "J800", 14)
        doc.text(bx, dy - 53, sub, "J400", 9, GRAY)

    sy = 120
    doc.text(M, sy, "NESTE RELATÓRIO", "J500", 8.5, GRAY)
    itens = [("2", "Composição e resultado"), ("3", "Cenários para 12 meses"), ("4", "Proventos e notas")]
    for i, (n, t) in enumerate(itens):
        x = M + i * ((W - 2 * M) / 3)
        doc.text(x, sy - 18, n, "J800", 9.5, BLUE)
        doc.text(x + 12, sy - 18, t, "J500", 9.5)


# ─────────────── página 2: composição ───────────────
def pagina_composicao(doc):
    cart = doc.cart
    tot = cart["totals"]
    doc.nova_pagina()
    n = cart.get("positions_total", len(cart["positions"]))
    onde = f" em {cart['institution']}" if cart.get("institution") else ""
    topo = doc.cabecalho_interno(
        "Composição e resultado",
        f"{n} posições{onde}, com preços de {data_br(cart.get('as_of'))}. Resultado sobre o preço médio, antes de impostos.",
    )
    cols = [("ATIVO", M, "l"), ("QTD.", M + 196, "r"), ("PREÇO MÉDIO", M + 270, "r"), ("ATUAL", M + 340, "r"),
            ("VALOR", M + 418, "r"), ("PESO", M + 460, "r"), ("RESULTADO", W - M, "r")]
    y = H - topo - 22
    for t, x, a in cols:
        doc.text(x, y, t, "J700", 7.2, GRAY, a)
    doc.c.setStrokeColor(INK)
    doc.c.setLineWidth(0.8)
    doc.c.line(M, y - 6, W - M, y - 6)
    y -= 22
    grupos = {}
    for p in cart["positions"]:
        grupos.setdefault(p["asset_class"], []).append(p)
    ordem = [a["key"] for a in cart["allocation"]["by_class"]]
    for k in ordem:
        ps = grupos.get(k, [])
        if not ps:
            continue
        nome, cor = CLASSES.get(k, (k, GRAY))
        sub = next(a for a in cart["allocation"]["by_class"] if a["key"] == k)
        doc.c.setFillColor(cor)
        doc.c.circle(M + 4, y + 3, 3.5, stroke=0, fill=1)
        doc.text(M + 13, y, nome, "J800", 9.5)
        doc.text(M + 418, y, brl(sub["value"]), "J800", 9, INK, "r")
        doc.text(M + 460, y, pct(sub["weight"] * 100, 1, False), "J800", 9, INK, "r")
        y -= 18
        for p in ps:
            doc.text(M + 13, y, nome_ativo(p), "J700", 8.8)
            q = p["quantity"]
            doc.text(M + 196, y, num(q, 2 if q != int(q) else 0), "J400", 8.6, TEXT, "r")
            doc.text(M + 270, y, brl(p["average_price"], 2), "J400", 8.6, TEXT, "r")
            doc.text(M + 340, y, brl(p["current_price"], 2), "J400", 8.6, TEXT, "r")
            doc.text(M + 418, y, brl(p["current_value"]), "J400", 8.6, TEXT, "r")
            doc.text(M + 460, y, pct(p["weight"] * 100, 1, False), "J400", 8.6, TEXT, "r")
            pnl = p.get("pnl_pct") or 0
            doc.text(W - M, y, pct(pnl), "J700", 8.6, GREEN if pnl >= 0 else RED, "r")
            doc.c.setStrokeColor(LINE)
            doc.c.setLineWidth(0.5)
            doc.c.line(M + 13, y - 6, W - M, y - 6)
            y -= 17
        y -= 6
    doc.c.setStrokeColor(INK)
    doc.c.setLineWidth(0.8)
    doc.c.line(M, y + 8, W - M, y + 8)
    doc.text(M, y - 6, "Total", "J800", 10)
    doc.text(M + 418, y - 6, brl(tot["value"]), "J800", 10, INK, "r")
    doc.text(M + 460, y - 6, "100%", "J800", 9, INK, "r")
    if tot.get("pnl_brl") is not None:
        cor = GREEN if tot["pnl_brl"] >= 0 else RED
        doc.text(W - M, y - 6, pct(tot["pnl_pct"], 2), "J800", 9.5, cor, "r")
        doc.text(M, y - 21, f"Investido {brl(tot.get('invested', 0))} · resultado {brl(tot['pnl_brl'], sinal=True)}", "J400", 8.5, GRAY)

    # setores
    sy = max(y - 62, 190)
    doc.text(M, sy, "Por setor", "J800", 12)
    setores = sorted(cart["allocation"].get("by_sector", []), key=lambda s: -s["weight"])[:7]
    larg = W - 2 * M - 210
    for i, s in enumerate(setores):
        yy = sy - 24 - i * 18
        doc.text(M, yy, SETORES.get(s["key"], s["key"].replace("-", " ").capitalize()), "J500", 9)
        doc.c.setFillColor(HexColor("#E8E2D6"))
        doc.c.roundRect(M + 150, yy - 2, larg, 8, 4, stroke=0, fill=1)
        doc.c.setFillColor(BLUE)
        doc.c.roundRect(M + 150, yy - 2, max(larg * s["weight"], 4), 8, 4, stroke=0, fill=1)
        doc.text(W - M, yy, pct(s["weight"] * 100, 1, False), "J700", 9, INK, "r")


# ─────────────── página 3: cenários ───────────────
def pagina_cenarios(doc):
    cen = sorted(doc.d.get("cenarios") or [], key=lambda c: -faixa(c)[1])
    doc.nova_pagina()
    if not cen:
        doc.cabecalho_interno("Cenários para os próximos 12 meses", "Nenhum cenário foi simulado para este relatório.")
        return
    caminhos = cen[0].get("assumptions", {}).get("paths", 2000)
    anos = cen[0].get("horizon_years", 1)
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
        doc.text(M, y, c["scenario"]["title"], "J800", 11.5)
        prov = c["scenario"].get("provenance")
        rot = "cenário estudado pela Redentia" if prov == "library" else "cenário montado na hora" if prov == "custom" else "cenário base"
        doc.text(M, y - 13, rot, "J400", 8, GRAY)
        doc.text(M, y - 32, pct(m), "J800", 16, cor)
        doc.text(M, y - 44, "caminho central", "J400", 7.8, GRAY)
        # régua
        doc.c.setStrokeColor(LINE)
        doc.c.setLineWidth(0.5)
        doc.c.line(x0, y - 6, x1, y - 6)
        doc.c.setStrokeColor(INK)
        doc.c.line(X(0), y - 14, X(0), y + 2)
        doc.c.setFillColor(GREEN_BG if m >= 0 else RED_BG)
        doc.c.roundRect(X(a), y - 12, X(b) - X(a), 12, 6, stroke=0, fill=1)
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
        pos = sorted(c.get("positions") or [], key=lambda p: p["shock_pct"])
        if m >= 0:
            quem = [p for p in reversed(pos) if p["shock_pct"] > 0][:3]
            txt = "Quem mais ganha: " if quem else ""
        else:
            quem = [p for p in pos if p["shock_pct"] < 0][:3]
            txt = "Quem mais sente: " if quem else ""
        if quem:
            txt += ", ".join(f"{nome_ativo(p)} {pct(p['shock_pct'], 0)}" for p in quem)
            doc.text(x0, y - 42, txt, "J500", 8.4, TEXT)
        doc.c.setStrokeColor(LINE)
        doc.c.setLineWidth(0.6)
        doc.c.line(M, y - bloco + 22, W - M, y - bloco + 22)
        y -= bloco

    # como ler
    by = 150
    doc.c.setFillColor(CARD)
    doc.c.roundRect(M, by - 100, W - 2 * M, 112, 10, stroke=0, fill=1)
    doc.text(M + 18, by - 12, "Como ler esta página", "J800", 10.5)
    doc.para(
        "As faixas são estatísticas e não previsão nem promessa de retorno: mostram onde a carteira tende a terminar se o "
        "cenário acontecer, com base no comportamento histórico dos ativos desde 2007 e nas exposições de cada um a juros, "
        "dólar, petróleo e bolsa. O cenário estudado pela Redentia tem premissas e fontes publicadas; o montado na hora não "
        "tem precedente histórico que o ancore. O impacto por ativo é o efeito direto estimado do choque no período.",
        M + 18, by - 22, W - 2 * M - 36, size=8.8, leading=13.2, color=TEXT,
    )


# ─────────────── página 4: proventos e notas ───────────────
def pagina_notas(doc):
    d, cart = doc.d, doc.cart
    doc.nova_pagina()
    topo = doc.cabecalho_interno("Proventos, mercado e notas", "O que entra nos próximos dias, o retrato do mercado na data do relatório e como ler os números.")
    y = H - topo - 26
    doc.text(M, y, "Proventos a receber", "J800", 12)
    prov = sorted(cart.get("upcoming_dividends") or [], key=lambda p: p.get("payment_date") or "9999")
    y -= 22
    if prov:
        cols = [("ATIVO", M, "l"), ("TIPO", M + 90, "l"), ("DATA COM", M + 220, "r"), ("PAGAMENTO", M + 300, "r"), ("POR COTA", M + 390, "r"), ("ESTIMADO", W - M, "r")]
        for t, x, a in cols:
            doc.text(x, y, t, "J700", 7.2, GRAY, a)
        doc.c.setStrokeColor(INK)
        doc.c.setLineWidth(0.8)
        doc.c.line(M, y - 6, W - M, y - 6)
        y -= 21
        for p in prov:
            doc.text(M, y, p["ticker"], "J700", 9)
            doc.text(M + 90, y, p.get("type") or "Provento", "J400", 9, TEXT)
            doc.text(M + 220, y, data_br(p.get("ex_date")), "J400", 9, TEXT, "r")
            doc.text(M + 300, y, data_br(p.get("payment_date")), "J400", 9, TEXT, "r")
            doc.text(M + 390, y, brl(p.get("amount_per_share") or 0, 2), "J400", 9, TEXT, "r")
            doc.text(W - M, y, brl(p.get("estimated_total") or 0, 2), "J700", 9, GREEN, "r")
            doc.c.setStrokeColor(LINE)
            doc.c.setLineWidth(0.5)
            doc.c.line(M, y - 7, W - M, y - 7)
            y -= 20
        total = sum(p.get("estimated_total") or 0 for p in prov)
        doc.text(M, y - 2, "Total estimado", "J800", 9.5)
        doc.text(W - M, y - 2, brl(total, 2), "J800", 9.5, GREEN, "r")
        y -= 20
    else:
        doc.text(M, y, "Nenhum provento com data de pagamento anunciada para esta carteira.", "J400", 9.5, GRAY)
        y -= 16

    mk = d.get("mercado") or {}
    ind, mac = mk.get("indices", {}), mk.get("macro", {})
    linhas = []
    for k, rot in (("IBOV", "Ibovespa"), ("IFIX", "IFIX")):
        if k in ind:
            linhas.append((rot, num(ind[k]["value"], 0), ind[k].get("change_pct")))
    if "selic_meta" in mac:
        linhas.append(("Selic", pct(mac["selic_meta"]["value"], 2, False), None))
    if "ipca_12m" in mac:
        linhas.append(("IPCA 12 meses", pct(mac["ipca_12m"]["value"], 2, False), None))
    if "usd_brl" in mac:
        linhas.append(("Dólar", brl(mac["usd_brl"]["value"], 2), mac["usd_brl"].get("delta_pct")))
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
    notas = [
        f"<b>Datas.</b> Preços de {data_br(cart.get('as_of'))}; variação do dia contra {data_br((cart.get('price_dates') or {}).get('previous'))}. Ativos sem negociação no dia usam o último preço conhecido.",
        "<b>Resultado.</b> Calculado sobre o preço médio de compra informado pela instituição, antes de impostos e custos.",
        "<b>Cenários.</b> Motor de cenários da Redentia: simulação estatística com premissas abertas. Não é previsão, promessa de retorno nem recomendação.",
    ]
    if doc.demo:
        notas.append("<b>Demonstração.</b> Relatório gerado a partir de uma carteira de demonstração para apresentar o produto.")
    y -= 8
    for n in notas:
        y -= doc.para(n, M, y, W - 2 * M, size=8.8, leading=13) + 6

    # assinatura
    sy = 120
    doc.c.setStrokeColor(LINE)
    doc.c.setLineWidth(0.8)
    doc.c.line(M, sy + 26, W - M, sy + 26)
    quem = " · ".join(x for x in (d.get("assessor"), d.get("escritorio")) if x)
    doc.text(M, sy, "Preparado por", "J500", 8.5, GRAY)
    doc.text(M, sy - 18, quem or "Seu assessor de investimentos", "J800", 13)
    doc.text(M, sy - 33, "com dados, carteira e motor de cenários da Redentia", "J400", 8.8, GRAY)
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
    dados = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    for k in ("carteira",):
        if k not in dados:
            sys.exit(f"dados.json sem a chave obrigatória '{k}'")
    for k in ("carteira", "mercado"):
        if isinstance(dados.get(k), dict) and "data" in dados[k] and "client" not in dados[k] and "indices" not in dados[k]:
            dados[k] = dados[k]["data"]
    dados["cenarios"] = [c.get("data", c) if "final" not in c else c for c in (dados.get("cenarios") or [])][:5]
    doc = Doc(sys.argv[2], dados)
    pagina_capa(doc)
    pagina_composicao(doc)
    pagina_cenarios(doc)
    pagina_notas(doc)
    doc.salvar()
    print(f"ok: {sys.argv[2]} (4 páginas)")


if __name__ == "__main__":
    main()
