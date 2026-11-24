import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://expediente-hospital.vercel.app').replace(/\/+$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'NEXO - Medical Team Workflow | Sistema de Guardia Hospitalaria y Expediente Clínico',
    template: '%s | NEXO Medical Team Workflow',
  },
  description:
    'Plataforma clínica para médicos, residentes y equipos hospitalarios. Gestiona pases de guardia, hospitalización, nefrología y hemodiálisis, medicina interna, cirugía, ortopedia y consulta externa desde cualquier dispositivo.',
  keywords: [
    'Nexo',
    'Nexo Medical',
    'Nexo Medical Team',
    'NEXO Medical Team Workflow',
    'sistema de guardia hospitalaria',
    'pase de guardia médico',
    'expediente clínico electrónico',
    'seguimiento hospitalario',
    'residencia médica',
    'nefrología hemodiálisis software',
    'consulta externa médica',
    'medicina interna',
    'cirugía y ortopedia',
  ],
  authors: [{ name: 'NEXO Medical Team Workflow' }],
  creator: 'NEXO Medical Team Workflow',
  publisher: 'NEXO Medical Team Workflow',
  alternates: {
    canonical: '/',
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
  openGraph: {
    type: 'website',
    locale: 'es_DO',
    url: APP_URL,
    siteName: 'NEXO Medical Team Workflow',
    title: 'NEXO - Medical Team Workflow | Guardia Hospitalaria y Seguimiento Clínico',
    description:
      'Centraliza pases de guardia, pendientes clínicos, gráficas vitales, curas, antibióticos en hemodiálisis y consulta externa. 15 días de prueba gratis desde $4.99/mes.',
    images: [
      {
        url: '/Logo.png',
        width: 512,
        height: 512,
        alt: 'NEXO Medical Team Workflow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXO - Medical Team Workflow',
    description:
      'Plataforma para residencias médicas y médicos independientes: guardias, entregas de turno, auditoría y consulta externa.',
    images: ['/Logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
  icons: {
    icon: '/Logo.png',
    apple: '/Logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}