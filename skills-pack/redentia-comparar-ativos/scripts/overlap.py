#!/usr/bin/env python3
"""Sobreposição de carteiras de ETF (Σ min) — determinístico.

Uso: python3 overlap.py a.json b.json
Cada arquivo é o retorno de get_etf_composition{detail:"completo"}
(o envelope inteiro ou só o objeto data — os dois formatos servem).

Por que script: somar min(peso) sobre 500 ativos dentro do contexto de
um modelo é erro provável e contexto queimado; aqui a conta sai exata.
Saída em linhas chave=valor pra citar direto na resposta.
"""
import json
import sys


def assets(path):
    with open(path) as f:
        d = json.load(f)
    d = d.get("data", d)
    out = {}
    for a in d["exposure"]["assets"]:
        k = a.get("ticker") or a.get("name")
        w = a.get("weight") or 0
        if k and w > 0:
            out[k] = out.get(k, 0.0) + w
    return out


def main():
    if len(sys.argv) != 3:
        print("uso: overlap.py a.json b.json", file=sys.stderr)
        sys.exit(2)
    a, b = assets(sys.argv[1]), assets(sys.argv[2])
    comum = set(a) & set(b)
    ov = sum(min(a[k], b[k]) for k in comum)
    cov_a = sum(a[k] for k in comum)
    cov_b = sum(b[k] for k in comum)
    print(f"sobreposicao_min_pct={ov * 100:.1f}")
    print(f"ativos_comuns={len(comum)} (A tem {len(a)}, B tem {len(b)})")
    print(f"cobertura_direcional_a_em_b_pct={cov_a * 100:.1f}")
    print(f"cobertura_direcional_b_em_a_pct={cov_b * 100:.1f}")
    for k in sorted(comum, key=lambda k: -min(a[k], b[k]))[:5]:
        print(f"top_comum: {k} min={min(a[k], b[k]) * 100:.2f}%")


if __name__ == "__main__":
    main()
