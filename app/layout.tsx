import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SoRo Estética | Turnos online en Posadas",
    template: "%s | SoRo Estética",
  },
  description:
    "Reservá tu turno de manicura, pedicura, faciales y más en SoRo Estética, Posadas. Turnos online, seña con MercadoPago y confirmación por WhatsApp.",
  keywords: [
    "turnos online",
    "estética Posadas",
    "manicura",
    "pedicura",
    "SoRo",
  ],
  openGraph: {
    title: "SoRo Estética | Turnos online en Posadas",
    description:
      "Reservá tu turno de belleza online. Rápido, fácil y con confirmación por WhatsApp.",
    type: "website",
    locale: "es_AR",
    url: "https://tu-dominio.vercel.app",
    siteName: "SoRo Estética",
  },
  twitter: {
    card: "summary_large_image",
    title: "SoRo Estética",
    description: "Turnos online de belleza en Posadas",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
