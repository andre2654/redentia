# Redentia

> A única plataforma de finanças realmente inteligente, com tudo para gerenciar seus investimentos de forma rápida e fácil.

Redentia é uma plataforma completa para investidores da B3, oferecendo análise de ativos, ferramentas de cálculo, acompanhamento de dividendos e assessoria com IA para ações, FIIs e ETFs.

## Tecnologias

- **Framework**: Nuxt 4 (Vue 3)
- **UI**: Nuxt UI + Tailwind CSS
- **Charts**: Chart.js + Vue-ChartJS
- **State**: Pinia
- **SEO**: @nuxtjs/sitemap + structured data
- **PWA**: @vite-pwa/nuxt
- **Backend**: Firebase (Auth + Notifications)
- **Runtime**: Bun (desenvolvimento e build)

## Features

- 📊 Análise detalhada de +500 ativos (ações, FIIs, ETFs)
- 💰 Calculadoras financeiras (juros compostos, planejamento, dividend yield, etc.)
- 📈 Gráficos interativos com histórico de preços
- 🤖 Assessoria com IA (OpenAI) para análise de investimentos
- 📱 PWA com notificações push
- 🌙 Dark mode only (por escolha de design)
- 🔍 Sistema de busca e filtros avançados
- 📚 Glossário completo de termos financeiros
- 📰 Guias educacionais sobre investimentos

## Estrutura do Projeto

```
app/
├── components/        # Componentes Vue organizados em atoms/molecules
├── pages/            # Rotas da aplicação
├── composables/      # Hooks reutilizáveis
├── services/         # Integração com APIs
├── stores/           # Estado global (Pinia)
├── types/            # TypeScript types
└── data/             # Dados estáticos (glossário, etc.)

server/
├── api/              # Endpoints da API
├── routes/           # Rotas SSR customizadas
└── utils/            # Utilitários server-side

docs/
├── adr/              # Architecture Decision Records
└── system-design.md  # Documentação de arquitetura
```

## Setup

Certifique-se de ter o Bun instalado. Instale as dependências:

```bash
bun install
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# OpenAI (Assessoria com IA)
NUXT_OPENAI_API_KEY=
NUXT_OPENAI_CHAT_MODEL=gpt-4
NUXT_OPENAI_ROUTER_MODEL=gpt-4
NUXT_OPENAI_ALERT_MODEL=gpt-4

# Firebase (Auth + Notifications)
NUXT_PUBLIC_FIREBASE_API_KEY=
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NUXT_PUBLIC_FIREBASE_PROJECT_ID=
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NUXT_PUBLIC_FIREBASE_APP_ID=
NUXT_PUBLIC_FIREBASE_VAPID_KEY=

# n8n (Automações)
NUXT_N8N_RENDER_KEY=

# Site
NUXT_PUBLIC_SITE_URL=https://www.redentia.com.br
```

## Development Server

Inicie o servidor de desenvolvimento em `http://localhost:3000`:

```bash
bun run dev
```

## Production

Build para produção:

```bash
bun run build
```

Preview local do build:

```bash
bun run preview
```

## Scripts Disponíveis

```bash
bun run dev        # Servidor de desenvolvimento
bun run build      # Build de produção
bun run generate   # Gera site estático
bun run preview    # Preview do build
bun run lint       # ESLint
bun run lint:fix   # ESLint com auto-fix
bun run pretty     # Prettier
```

## Deploy na Vercel com Bun

Para fazer o deploy na Vercel utilizando Bun:

1. **Gere o arquivo de lock do Bun**:
   Execute o comando abaixo para instalar as dependências e gerar o arquivo `bun.lockb`:
   ```bash
   bun install
   ```

2. **Remova lockfiles conflitantes** (Importante):
   A Vercel pode priorizar o `pnpm` ou `npm` se encontrar seus arquivos de lock. Para garantir que o Bun seja usado, remova-os:
   ```bash
   rm pnpm-lock.yaml package-lock.json yarn.lock
   ```

3. **Commit as alterações**:
   Certifique-se de commitar o `bun.lockb` e a remoção dos outros lockfiles.

4. **Configuração na Vercel**:
   A Vercel deve detectar automaticamente o Bun pela presença do `bun.lockb`.
   Caso precise configurar manualmente:
   - Vá em **Settings** > **Build & Development**.
   - **Install Command**: `bun install`
   - **Build Command**: `bun run build` (ou `nuxt build`)

## Documentação Adicional

- [Architecture Decision Records](docs/adr/) - Decisões de arquitetura do projeto
- [System Design](docs/system-design.md) - Visão geral da arquitetura
- [Guia de Componentes](docs/components/) - Documentação dos componentes principais

## API Externa

O projeto consome dados de mercado da API: `https://redentia-api.saraivada.com`

Endpoints principais:
- `/api/tickers-full` - Lista completa de ativos
- `/api/tickers/:ticker` - Detalhes de um ativo
- `/api/top-stocks` - Ações com maior movimentação
- `/api/dividends/:ticker` - Histórico de dividendos

## Contribuindo

1. Clone o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

© 2025 Redentia. Todos os direitos reservados.

---

Para mais informações, visite [www.redentia.com.br](https://www.redentia.com.br)
