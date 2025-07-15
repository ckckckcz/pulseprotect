import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import ClientLayout from "./clientLayout";
import LocaleLayout from "./localeLayout";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart City",
  description: "Smart City Management System",
  other: {
    "Content-Security-Policy": 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' " +
      "https://app.sandbox.midtrans.com " +
      "https://api.sandbox.midtrans.com " +
      "https://d2f3dnusg0rbp7.cloudfront.net " +
      "https://pay.google.com " +
      "https://js-agent.newrelic.com " +
      "https://bam.nr-data.net " +
      "https://*.midtrans.com; " +
      "connect-src 'self' " +
      "https://app.sandbox.midtrans.com " +
      "https://api.sandbox.midtrans.com " +
      "https://js-agent.newrelic.com " +
      "https://bam.nr-data.net " +
      "https://*.midtrans.com; " +
      "frame-src 'self' " +
      "https://app.sandbox.midtrans.com " +
      "https://*.midtrans.com; " +
      "img-src 'self' data: https: blob:; " +
      "style-src 'self' 'unsafe-inline'; " +
      "font-src 'self' data:;",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "cross-origin"
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="bg-white">
      <head>
        {/* Script for Midtrans can be preloaded here */}
        <link 
          rel="icon" 
          type="image/png" 
          href="/favicon.png"
        />
        <link 
          rel="preconnect" 
          href="https://app.sandbox.midtrans.com" 
          crossOrigin="anonymous" 
        />
        <link 
          rel="preconnect" 
          href="https://js-agent.newrelic.com" 
          crossOrigin="anonymous" 
        />
        <link 
          rel="preconnect" 
          href="https://bam.nr-data.net" 
          crossOrigin="anonymous" 
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <LocaleLayout>
            <ClientLayout>
              {children}
            </ClientLayout>
          </LocaleLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

