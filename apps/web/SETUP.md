# Luxury Account - Web Application Setup

Этот документ описывает, как запустить веб-приложение Luxury Account.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- pnpm 8+ (рекомендуется) или npm
- Git

### Установка и запуск

1. **Перейдите в директорию веб-приложения:**
   ```bash
   cd apps/web
   ```

2. **Установите зависимости:**
   ```bash
   pnpm install
   # или
   npm install
   ```

3. **Создайте файл окружения:**
   ```bash
   cp .env.example .env.local
   ```

4. **Настройте переменные окружения в `.env.local`:**
   ```env
   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Stripe (опционально)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   ```

5. **Запустите приложение в режиме разработки:**
   ```bash
   pnpm dev
   # или
   npm run dev
   ```

6. **Откройте браузер и перейдите по адресу:**
   ```
   http://localhost:3000
   ```

## 🎨 Что включено

### ✅ Готовые компоненты

- **Navigation** - Полнофункциональная навигация с языковым переключателем
- **Hero Section** - Красивая главная секция с анимациями
- **Features Section** - Секция возможностей с интерактивными карточками
- **Pricing Section** - Секция с планами подписки и Stripe интеграцией
- **Auth Components** - Компоненты авторизации через Google OAuth

### 🌍 Интернационализация

- Поддержка английского и русского языков
- Автоматическое определение локали
- Переключатель языков в навигации

### 🎭 Дизайн системы

- Luxury тематика с золотыми градиентами
- Темная и светлая темы
- Адаптивный дизайн для всех устройств
- Анимации с Framer Motion

### 🔧 Технические особенности

- Next.js 15 с App Router
- TypeScript
- Tailwind CSS v4
- next-intl для локализации
- next-auth для аутентификации
- Framer Motion для анимаций

## 📁 Структура проекта

```
apps/web/
├── src/
│   ├── app/                    # App Router pages
│   │   └── [locale]/          # Localized routes
│   ├── components/            # React components
│   │   ├── auth/             # Auth components
│   │   ├── payments/         # Payment components
│   │   ├── providers/        # Context providers
│   │   └── ui/               # Base UI components
│   ├── i18n/                 # Internationalization
│   ├── lib/                  # Utilities
│   └── messages/             # Translation files
├── public/                   # Static assets
└── ...config files
```

## 🛠️ Доступные команды

```bash
# Разработка
pnpm dev         # Запуск в режиме разработки
pnpm build       # Сборка для продакшена
pnpm start       # Запуск продакшен сервера
pnpm lint        # Проверка кода ESLint

# Тестирование (когда будет настроено)
pnpm test        # Запуск тестов
pnpm test:e2e    # E2E тесты с Playwright
```

## 🔐 Настройка аутентификации

### Google OAuth Setup

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Создайте OAuth 2.0 credentials
5. Добавьте authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

### Stripe Setup (опционально)

1. Создайте аккаунт на [Stripe](https://stripe.com/)
2. Получите API ключи из Dashboard
3. Настройте webhooks для обработки событий
4. Добавьте соответствующие переменные в `.env.local`

## 🚀 Деплой

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой происходит автоматически

### Другие платформы

Приложение можно развернуть на любой платформе, поддерживающей Next.js:
- Netlify
- Railway
- Docker

## 🐛 Решение проблем

### Ошибки сборки

- Убедитесь, что используете Node.js 18+
- Проверьте, что все зависимости установлены
- Очистите кэш: `pnpm clean` или `rm -rf .next`

### Проблемы с локализацией

- Проверьте, что файлы переводов существуют в `src/messages/`
- Убедитесь, что middleware правильно настроен

### Проблемы с аутентификацией

- Проверьте настройки Google OAuth
- Убедитесь, что NEXTAUTH_URL соответствует текущему домену
- Проверьте, что NEXTAUTH_SECRET установлен

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте логи в консоли браузера и терминале
2. Убедитесь, что все переменные окружения настроены
3. Проверьте документацию используемых библиотек

## 🎉 Готово!

Теперь у вас есть полностью функциональное веб-приложение Luxury Account с:

- ✅ Красивым и профессиональным интерфейсом
- ✅ Поддержкой двух языков (EN/RU)
- ✅ Системой аутентификации
- ✅ Интеграцией с платежами
- ✅ Адаптивным дизайном
- ✅ Современным tech stack

Приложение готово к продакшену и может быть легко расширено дополнительными функциями. 