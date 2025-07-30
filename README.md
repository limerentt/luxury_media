# Luxury Account in One Click

> Production-ready platform for luxury account creation with AI-powered media generation

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 14 Landing] --> B[Dashboard/App]
        B --> C[Auth (next-auth)]
    end
    
    subgraph "Backend Layer"
        D[FastAPI Backend] --> E[ClickHouse DB]
        D --> F[RabbitMQ Queue]
        D --> G[MinIO Storage]
    end
    
    subgraph "Processing Layer"
        H[Python Worker] --> F
        H --> E
        H --> G
    end
    
    subgraph "External Services"
        I[Google OAuth]
        J[Stripe Payments]
        K[CDN]
    end
    
    A --> D
    B --> D
    C --> I
    B --> J
    G --> K
    
    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style D fill:#f3e5f5
    style H fill:#fff3e0
    style E fill:#e8f5e8
```

## 🚀 Tech Stack

### Frontend
- **Next.js 14** with App Router & TypeScript
- **Tailwind CSS v3** + shadcn/ui components
- **Framer Motion** for animations
- **next-intl** for i18n (en/ru)
- **next-auth** for authentication

### Backend
- **FastAPI** (Python 3.12) with async support
- **ClickHouse 24.6** for analytics & storage
- **RabbitMQ** for message queuing
- **MinIO** for S3-compatible object storage

### Infrastructure
- **Docker Compose** for development
- **Helm Charts** for Kubernetes deployment
- **GitHub Actions** for CI/CD
- **Playwright** for E2E testing

## 📋 Features

- ✅ **One-Click Registration** with Google OAuth
- ✅ **AI Media Generation** (stub implementation)
- ✅ **Stripe Payment Integration**
- ✅ **Real-time Dashboard**
- ✅ **Multi-language Support** (EN/RU)
- ✅ **Mobile-First Design** (Lighthouse ≥95)

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- Git

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd luxury-account

# Install dependencies
pnpm install

# Start development environment
docker compose up -d

# Run development server
pnpm dev
```

### Available Scripts

```bash
# Development
pnpm dev              # Start Next.js dev server
pnpm turbo dev        # Start all services in dev mode

# Building
pnpm build            # Build all packages
pnpm turbo build      # Build with Turbo

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run Playwright E2E tests
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript checking

# Database
pnpm db:migrate       # Run ClickHouse migrations
pnpm db:seed          # Seed development data
```

## 🗄️ Database Schema

### Tables
- **users** - User accounts and profiles
- **media_requests** - AI generation requests
- **media_assets** - Generated media files
- **payments** - Stripe payment records

### Partitioning
- Monthly partitioning by `created_at`
- Optimized for time-series analytics

## 🔧 Environment Variables

```bash
# Database
CLICKHOUSE_URL=http://localhost:8123
CLICKHOUSE_DATABASE=luxury_account

# Authentication
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Storage
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Queue
RABBITMQ_URL=amqp://localhost:5672
```

## 🚀 Deployment

### Development
```bash
docker compose up --build
```

### Production (Kubernetes)
```bash
helm install luxury-account ./helm/luxury-account
```

### CI/CD Pipeline
1. **Lint & Test** - ESLint, TypeScript, Jest
2. **Build** - Docker images for all services
3. **Deploy** - Helm upgrade to staging/production

## 📊 Performance

- **Lighthouse Score**: ≥95 (Mobile)
- **Core Web Vitals**: All green
- **Test Coverage**: ≥80%
- **Build Time**: <2 minutes

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

### E2E Tests
```bash
pnpm test:e2e
```

### Test Scenarios
- User registration flow
- Media generation request
- Payment processing
- Dashboard interactions

## 📝 API Documentation

API documentation is available at `/api/docs` when running the FastAPI backend.

### Key Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/media/generate` - Request media generation
- `GET /api/media/{id}` - Get media status
- `POST /api/payments/checkout` - Create payment session

## 🌍 Internationalization

Supported languages:
- **English** (default)
- **Russian**

Language files located in `messages/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@luxury-account.com or create an issue in this repository.

---

**Built with ❤️ by the Luxury Account Team**