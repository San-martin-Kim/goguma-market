import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '고구마마켓 - 우리 동네 중고거래',
  description: '동네 이웃과 함께하는 따뜻한 중고거래, 고구마마켓',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={geist.className}>
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
