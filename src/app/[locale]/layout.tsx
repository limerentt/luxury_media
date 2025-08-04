import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import { getServerSession } from '@/lib/auth'
import AuthProvider from '@/components/providers/session-provider'
import type { Metadata } from 'next'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const messages = await getMessages({ locale })
  
  return {
    title: {
      template: '%s | Luxury Account',
      default: 'Luxury Account - AI-Powered Media Generation',
    },
    description: locale === 'ru' 
      ? 'Трансформируйте свой бизнес с помощью ИИ-генерации медиа'
      : 'Transform your business with AI-powered media generation',
  }
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound()

  // Get session and messages
  const session = await getServerSession()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <AuthProvider session={session}>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 