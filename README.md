# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
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

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
