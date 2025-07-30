# 🌟 Luxury Account - AI-Powered Luxury Media Platform

A sophisticated, production-ready platform for luxury brands to create AI-powered media content with elegant design and premium user experience.

![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.12-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

### 🎨 Frontend (Next.js 15)
- **Luxury Design System** with gold gradients and premium aesthetics
- **Responsive Navigation** with smooth animations using Framer Motion
- **Hero Section** with interactive elements and scrolling indicators
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** with custom luxury theme configuration
- **Mobile-First Design** with responsive breakpoints

### 🚀 Backend (FastAPI)
- **High-Performance API** built with Python 3.12 and FastAPI
- **ClickHouse Integration** for analytics and data storage
- **RabbitMQ** for asynchronous message queuing
- **MinIO** for S3-compatible object storage
- **Comprehensive Testing** with pytest and coverage

### 🛠️ Infrastructure
- **Docker Containerization** for all services
- **Kubernetes Helm Charts** for cloud deployment
- **GitHub Actions CI/CD** pipeline with automated testing
- **Monorepo Structure** managed with Turborepo
- **Production-Ready** configuration for staging and production

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- Docker and Docker Compose

### 1. Clone & Setup
```bash
git clone git@github.com:limerentt/luxury_media.git
cd luxury_media
npm install
```

### 2. Start Frontend
```bash
cd apps/web
npm run dev
```
🌐 **Frontend:** http://localhost:3000

### 3. Start Backend (Optional)
```bash
cd apps/api
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
🔗 **API:** http://localhost:8000

### 4. Start Worker Service (Optional)
```bash
cd apps/worker  
pip install -r requirements.txt
python main.py
```

## 📁 Project Structure

```
luxury_media/
├── 🎨 apps/web/          # Next.js Frontend
│   ├── src/app/          # App Router pages
│   ├── src/components/   # Reusable UI components
│   ├── src/lib/          # Utilities and helpers
│   └── public/           # Static assets
├── 🔧 apps/api/          # FastAPI Backend
│   ├── app/              # Application code
│   ├── tests/            # API tests
│   └── requirements.txt  # Python dependencies
├── ⚡ apps/worker/       # Python Worker Service
│   ├── worker/           # Worker modules
│   └── tests/            # Worker tests
├── 🐳 docker-compose.yml # Development environment
├── ☸️  helm/             # Kubernetes deployment
├── 🔄 .github/workflows/ # CI/CD pipelines
└── 📋 turbo.json         # Monorepo configuration
```

## 🎯 Key Components

### Frontend Components
- **Navigation** - Responsive header with luxury branding
- **HeroSection** - Animated landing section with call-to-action
- **FeaturesSection** - Product capabilities showcase
- **PricingSection** - Subscription plans display

### Backend Services
- **Health API** - Service monitoring endpoints
- **Media Requests** - AI content generation API
- **User Management** - Authentication and profiles
- **Payment Processing** - Stripe integration (configured)

## 🔧 Development

### Frontend Development
```bash
cd apps/web
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd apps/api
python -m pytest    # Run tests
python -m uvicorn app.main:app --reload  # Start dev server
```

### Full Stack Development
```bash
# From project root
npm run dev          # Start all services via Turbo
```

## 🚀 Deployment

### Docker Compose (Local)
```bash
docker-compose up --build
```

### Kubernetes (Production)
```bash
helm install luxury-account ./helm/luxury-account \
  --namespace production \
  --values ./helm/luxury-account/values-production.yaml
```

## 🧪 Testing

### Frontend Tests
```bash
cd apps/web
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests with Playwright
```

### Backend Tests
```bash
cd apps/api
python -m pytest tests/ --cov=app
```

## 📝 Configuration

### Environment Variables
Create `.env.local` in `apps/web/`:
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Create `.env` in `apps/api/`:
```env
DATABASE_URL=clickhouse://localhost:9000/luxury
RABBITMQ_URL=amqp://localhost:5672
MINIO_ENDPOINT=localhost:9000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Tech Stack

| Frontend | Backend | Infrastructure |
|----------|---------|----------------|
| Next.js 15 | FastAPI | Docker |
| TypeScript | Python 3.12 | Kubernetes |
| Tailwind CSS | ClickHouse | GitHub Actions |
| Framer Motion | RabbitMQ | Helm Charts |
| shadcn/ui | MinIO | Turborepo |

## 📞 Support

For support and questions:
- 📧 Email: support@luxuryaccount.ai
- 🐛 Issues: [GitHub Issues](https://github.com/limerentt/luxury_media/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/limerentt/luxury_media/discussions)

---

**Built with ❤️ for luxury brands worldwide** ✨