import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { UrlqWrapper } from "./UrqlWrapper"
const inter = Inter({ subsets:['latin'] })

export const metadata: Metadata = {
  title: 'Reddited: Reddit Clone',
  description: 'Reddit clone app generated by create next app',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className='dark container mx-auto h-full box-border' lang="en">
      <body className={`${inter.className} p-8 h-full`}>
        <UrlqWrapper>{children}</UrlqWrapper>
      </body>
    </html>
  )
}
