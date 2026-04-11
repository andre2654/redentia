# Subdomínios na Vercel — guia operacional

Este documento explica como ligar os 3 subdomínios da Redentia
(`api.redentia.com.br`, `creative.redentia.com.br`,
`whitelabel.redentia.com.br`) numa única deployment Vercel sem
duplicar código nem manter projetos separados.

## Visão geral

A estratégia é **uma deployment, vários hosts**. Todos os
subdomínios apontam para o mesmo projeto Vercel da Redentia, e o
roteamento é feito por **middleware Nitro** dentro do Nuxt
(`server/middleware/*-subdomain.ts`). Quando uma request chega, o
middleware:

1. Olha para o cabeçalho `host`
2. Detecta se é `api.*`, `creative.*` ou `whitelabel.*`
3. Reescreve internamente a URL — `/` vira `/api-portal`,
   `/creative` vira `/creative`, `/whitelabel` vira `/whitelabel`
4. Re-fetch internamente via `$fetch` e retorna o HTML

A URL no navegador continua mostrando `api.redentia.com.br/`
(sem `/api-portal`), porque o Nitro nunca emite redirect — só
reescreve internamente.

## Pré-requisitos

- DNS controlado pelo Cloudflare (ou Vercel DNS)
- Projeto da Redentia já implantado em `redentia.com.br`
- Acesso de admin no projeto Vercel

## Passo a passo (Vercel + Cloudflare)

### 1. Adicionar o domínio na Vercel

Em `Project Settings → Domains` do projeto Redentia:

1. Clique em **Add Domain**
2. Cole `api.redentia.com.br` e clique **Add**
3. A Vercel vai mostrar uma das duas opções:
   - **Cloudflare proxied**: o DNS aponta CNAME para
     `cname.vercel-dns.com` e o Cloudflare faz proxy
   - **Sem proxy**: CNAME direto para `cname.vercel-dns.com`
4. Repita para `creative.redentia.com.br` e
   `whitelabel.redentia.com.br`

### 2. Configurar DNS no Cloudflare

Para cada subdomínio, crie um registro CNAME:

| Type  | Name        | Target                  | Proxy   |
|-------|-------------|-------------------------|---------|
| CNAME | api         | cname.vercel-dns.com    | DNS only|
| CNAME | creative    | cname.vercel-dns.com    | DNS only|
| CNAME | whitelabel  | cname.vercel-dns.com    | DNS only|

**Importante:** marque **DNS only** (nuvem cinza), NÃO **Proxied**
(nuvem laranja). O Vercel já faz CDN/HTTPS — proxy duplo causa
loops, redirects intermitentes e problemas com `host` header.

Se você precisa do Cloudflare em frente (por causa de WAF rules,
por exemplo), configure também `host` header forwarding e use
`Page Rules → Cache Level: Bypass` no path inteiro.

### 3. Aguardar TLS

A Vercel emite certificado Let's Encrypt automaticamente em ~30s
após o DNS propagar. O dashboard mostra "Valid Configuration ✓"
quando estiver pronto.

### 4. Verificar via curl

```bash
curl -I https://api.redentia.com.br
# Deve retornar 200 OK com content-type: text/html

curl https://api.redentia.com.br | grep -o '<title>[^<]*</title>'
# Deve mostrar o title da página /api-portal
```

Se vier 404 ou mostrar a página da home principal (`/`), é porque
o middleware ainda não reconheceu o host. Confirme:

- Que o middleware existe em `server/middleware/api-subdomain.ts`
- Que o array `API_HOSTS` inclui `api.redentia.com.br`
- Que a deploy mais recente foi promovida pra produção

## Por que essa abordagem (e não múltiplos projetos Vercel)?

| Aspecto | Múltiplos projetos | Uma deploy + middleware |
|---|---|---|
| Build time | 4× | 1× |
| Compartilhar componentes | duplicar | importar |
| Sessão / cookies | precisa configurar CORS | mesmo origin |
| Deploy preview | 4 URLs distintas | 1 URL |
| Variável de ambiente | replicar 4× | uma só |
| Tenant resolver | cada projeto faz sua API call | mesma `useBrand()` |

A única desvantagem é que um deploy quebrado afeta todos os
subdomínios — o que é aceitável porque eles compartilham a mesma
codebase de qualquer forma.

## Adicionar um novo subdomínio (ex: `docs.redentia.com.br`)

### 1. Criar o middleware

`Frontend/server/middleware/docs-subdomain.ts`:

```ts
const DOCS_HOSTS = ['docs.redentia.com.br', 'docs.localhost']

function isDocsHost(host: string): boolean {
  return DOCS_HOSTS.includes(host.split(':')[0].toLowerCase())
}

export default defineEventHandler(async (event) => {
  const host = getRequestHeader(event, 'host') || ''
  if (!isDocsHost(host)) return

  const url = getRequestURL(event)
  if (
    url.pathname.startsWith('/_') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/docs')
  ) return

  const newPath = url.pathname === '/' ? '/docs' : `/docs${url.pathname}`
  const filteredHeaders = Object.fromEntries(
    Object.entries(event.node.req.headers).filter(
      ([k]) => !['host', 'connection', 'content-length'].includes(k.toLowerCase())
    ) as [string, string][]
  )

  try {
    const body = await $fetch(newPath + url.search, {
      method: event.node.req.method as any,
      headers: filteredHeaders,
      responseType: 'text',
    })
    setHeader(event, 'content-type', 'text/html; charset=utf-8')
    return body
  } catch {}
})
```

### 2. Criar as páginas alvo

`Frontend/app/pages/docs/index.vue`, etc.

### 3. Adicionar o domínio na Vercel + DNS no Cloudflare

(passos 1 e 2 da seção principal)

### 4. Pronto

O deploy seguinte já vai responder em `docs.redentia.com.br`.

## Tabela de subdomínios atuais

| Subdomínio | Middleware | Páginas alvo | Layout |
|---|---|---|---|
| `api.redentia.com.br` | `api-subdomain.ts` | `pages/api-portal/*` | `api-portal` |
| `creative.redentia.com.br` | `creative-subdomain.ts` | `pages/creative/*` | `api-portal` |
| `whitelabel.redentia.com.br` | `whitelabel-subdomain.ts` | `pages/whitelabel.vue` | `api-portal` |

## Troubleshooting

### "Invalid Configuration" no dashboard Vercel

- O DNS ainda não propagou. Espere 5-10 minutos.
- O Cloudflare está com proxy ligado (nuvem laranja). Mude para
  DNS only (nuvem cinza).
- O TLS travou. Remova o domínio e adicione de novo.

### Subdomínio carrega a página da home principal

- O middleware não está rodando. Verifique se o arquivo está em
  `server/middleware/` (não `app/middleware/` — esse é client-side).
- O array de hosts não inclui o domínio em produção.
- A deploy mais recente não foi promovida.

### Loop infinito de redirects

- Cloudflare está fazendo proxy E o Vercel também. Desligue um
  dos dois.
- O middleware está reescrevendo um path que ele mesmo já
  reescreveu. Confirme as guard clauses (`if (pathname.startsWith('/api-portal')) return`).

### Cookies / sessão somem ao trocar de subdomínio

- Os cookies estão setados como `domain=www.redentia.com.br`. Use
  `domain=.redentia.com.br` (com ponto na frente) para que sejam
  válidos em todos os subdomínios.
- Edite `nuxt.config.ts → app.head` ou o handler de auth para
  setar `Set-Cookie: ...; Domain=.redentia.com.br`.

## Local development

Para testar subdomínios localmente, edite `/etc/hosts`:

```
127.0.0.1   api.localhost
127.0.0.1   creative.localhost
127.0.0.1   whitelabel.localhost
```

Depois acesse `http://api.localhost:3000`, etc. Os middlewares
já reconhecem esses hosts (vide os arrays `*_HOSTS` em cada
arquivo).
