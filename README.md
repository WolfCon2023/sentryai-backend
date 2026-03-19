# SentryAI Backend

Node.js API + Python Agent Service powering the SentryAI investment memo platform.

## Architecture

```
┌──────────────────┐         ┌──────────────────────┐
│  Node.js API     │  HTTP   │  Python Agent Service │
│  (Fastify)       │────────▶│  (FastAPI + LangGraph)│
│                  │         │                       │
│  • JWT Auth      │◀────────│  • 5 AI Agents        │
│  • Deal CRUD     │ Webhooks│  • Claude API         │
│  • File Upload   │         │  • Pinecone RAG       │
│  • Socket.IO     │         │                       │
│  • Export        │         │                       │
└──────┬───────────┘         └──────────┬────────────┘
       │                                │
       ▼                                ▼
   MongoDB (shared)              Pinecone + Claude
   Cloudflare R2
```

## Quick Start

### Prerequisites

- Node.js 22+
- Python 3.12 or 3.13
- MongoDB running locally
- API keys: Anthropic, Pinecone, Cloudflare R2

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Seed database
npm run seed:admin    # Creates admin@sentryai.com / admin1234
npm run seed          # Populates portfolio companies

# Start Node.js API
npm run dev           # → http://localhost:3001
```

### Python Agent Service

```bash
./agents/start.sh     # → http://localhost:8000
```

Or manually:

```bash
cd agents
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build |
| `npm run typecheck` | Type check without emitting |
| `npm run test` | Run all tests (32 tests) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run seed:admin` | Create initial admin account |
| `npm run seed` | Seed portfolio company data |

## Project Structure

```
src/
├── index.ts                 # Fastify server entry
├── config/                  # Env validation, DB connection
├── middleware/               # JWT auth, admin guard
├── models/                  # Mongoose models (User, Deal, DealFile, Run, etc.)
├── routes/                  # API endpoints
│   ├── auth.ts              # Login, refresh, /me
│   ├── admin.ts             # User management (admin only)
│   ├── deals.ts             # Deal CRUD + delete
│   ├── files.ts             # File upload/delete (multipart → R2 → parse → Pinecone)
│   ├── runs.ts              # Start run, get status, get output, export
│   ├── internal.ts          # Python → Node.js progress webhooks
│   ├── portfolio.ts         # Portfolio company endpoints
│   └── health.ts            # Health check
├── services/
│   ├── r2Service.ts         # Cloudflare R2 operations
│   ├── parsingService.ts    # Parse → chunk → embed orchestration
│   ├── chunkingService.ts   # Text chunking (1000 chars, 200 overlap)
│   ├── pineconeService.ts   # Pinecone upsert/delete
│   ├── exportService.ts     # PDF/Word/Markdown generation
│   └── parsers/             # PDF, XLSX, CSV, DOCX, PPTX parsers
├── plugins/                 # Fastify plugins (CORS, JWT, Socket.IO)
├── utils/                   # Logger, errors, transforms
└── scripts/                 # Seed scripts

agents/
├── main.py                  # FastAPI entry (POST /run, GET /health)
├── graph/
│   ├── state.py             # LangGraph state definition
│   └── builder.py           # Graph: Hunter → [Digger, Quant] → Skeptic → Partner
├── nodes/                   # Agent implementations (5 agents)
├── prompts/                 # Agent prompt templates
├── services/
│   ├── claude_client.py     # Anthropic SDK wrapper
│   ├── pinecone_client.py   # Pinecone RAG queries
│   └── progress_reporter.py # HTTP callbacks to Node.js
└── schemas/                 # Pydantic input/output models

tests/
├── setup.ts                 # In-memory MongoDB setup
├── helpers.ts               # Test app builder, auth helpers
├── routes/                  # Route integration tests
├── services/                # Service unit tests
└── middleware/               # Auth middleware tests
```

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Current user |

### Deals
| Method | Path | Description |
|---|---|---|
| GET | `/api/deals` | List deals |
| POST | `/api/deals` | Create deal |
| GET | `/api/deals/:id` | Get deal |
| DELETE | `/api/deals/:id` | Delete deal + all data (admin) |

### Files
| Method | Path | Description |
|---|---|---|
| GET | `/api/deals/:id/files` | List files |
| POST | `/api/deals/:id/files` | Upload file (multipart) |
| DELETE | `/api/deals/:id/files/:fileId` | Delete file (admin) |

### Runs
| Method | Path | Description |
|---|---|---|
| GET | `/api/deals/:id/runs` | List runs |
| POST | `/api/deals/:id/run` | Start analysis run |
| GET | `/api/runs/:id` | Get run status |
| GET | `/api/runs/:id/output` | Get memo/snapshot |
| POST | `/api/runs/:id/export` | Export as PDF/Word/Markdown |

### Portfolio
| Method | Path | Description |
|---|---|---|
| GET | `/api/portfolio/companies` | List companies |
| GET | `/api/portfolio/companies/:id` | Company details |
| GET | `/api/portfolio/companies/:id/about` | About tab |
| GET | `/api/portfolio/companies/:id/investment-memo` | Memo tab |
| GET | `/api/portfolio/companies/:id/market-opportunity` | Market tab |
| GET | `/api/portfolio/companies/:id/customers-pricing` | Customers tab |
| GET | `/api/portfolio/companies/:id/product-details` | Product tab |

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `PINECONE_API_KEY` | Pinecone API key |
| `AGENT_SERVICE_URL` | Python service URL (default: http://localhost:8000) |
| `INTERNAL_API_KEY` | Shared secret for Python → Node.js callbacks |

## Testing

```bash
npm run test          # 32 tests across 7 suites
npm run typecheck     # TypeScript strict mode, 0 errors
```

Tests use `mongodb-memory-server` — no external DB needed.
