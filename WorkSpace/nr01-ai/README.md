# NR-01 — Sistema de Gestão de Riscos Psicossociais

MVP focado no diagnóstico, avaliação e plano de ação de riscos psicossociais conforme NR-01.

## Stack

- **Frontend/Backend:** Next.js 14 (App Router) + TypeScript
- **Banco de dados:** PostgreSQL (Supabase)
- **ORM:** Prisma 7
- **UI:** TailwindCSS + shadcn/ui
- **Auth:** JWT (cookie httpOnly)

## Pré-requisitos

- Node.js 18+
- npm 10+
- Conta no [Supabase](https://supabase.com) (gratuita para MVP)

## Setup Local

### 1. Clone e instale dependências

```bash
git clone <repo-url>
cd nr01-ai/packages/web
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
NEXTAUTH_SECRET=gere-uma-string-aleatoria-32-chars
NEXTAUTH_URL=http://localhost:3000
```

### 3. Configure o banco de dados

```bash
# Gerar o Prisma Client
npm run db:generate

# Criar as tabelas (requer DATABASE_URL configurado)
npm run db:migrate

# Popular com dados iniciais (perguntas + admin)
npm run db:seed
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

**Login padrão:**
- Email: `admin@nr01.com`
- Senha: `admin123`

> Altere o email/senha via variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD` antes do seed.

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificar lint |
| `npm run typecheck` | Verificar tipos TypeScript |
| `npm run db:generate` | Gerar Prisma Client |
| `npm run db:migrate` | Aplicar migrations |
| `npm run db:seed` | Popular banco com dados iniciais |
| `npm run db:studio` | Abrir Prisma Studio |

## Fluxo do Sistema

```
Login → Dashboard → Diagnóstico (empresa + questionário + evidências)
      → Avaliação (matriz de risco)
      → Plano de Ação (5W2H)
      → Relatório Final (PDF)
```

## Estrutura do Projeto

```
nr01-ai/
├── packages/web/          # Aplicação Next.js
│   ├── app/               # App Router (páginas e API Routes)
│   ├── components/        # Componentes React
│   ├── lib/               # Helpers (Prisma, Supabase, auth)
│   └── prisma/            # Schema e migrations
├── docs/
│   └── stories/           # User stories do MVP
└── README.md
```

## Produção

Deploy recomendado: **Vercel** (frontend) + **Supabase** (banco/storage).

> Para Puppeteer em Vercel: substituir `puppeteer` por `@sparticuz/chromium` + `puppeteer-core`.
