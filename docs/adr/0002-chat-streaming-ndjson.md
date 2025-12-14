## ADR 0002 — Streaming do chat via NDJSON

### Status
Aceito

### Contexto
O chat precisa entregar:
- feedback incremental (status)
- payload estruturado (cards/gráficos)
- texto incremental (resposta do agente)

SSE é uma alternativa, mas exige eventos e parsing específicos e tende a ser mais “opinionated”.

### Decisão
Usar **NDJSON** (JSON por linha) no endpoint `POST /api/chat`.

Eventos principais:
- `status`, `data`, `tool-used`, `suggestions`, `related-tickers`, `content`, `error`.

### Consequências
- Parsing simples no client (split por `\n`).
- Compatível com fetch streaming.
- Recomendação de hardening: headers (`application/x-ndjson`, `no-store`) e rate limit.


