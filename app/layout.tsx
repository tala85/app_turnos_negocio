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
    default: "TurnosPro | Turnos online para estudios de belleza",
    template: "%s | TurnosPro",
  },
  description:
    "Reservá tu turno de belleza online. Seña con MercadoPago, recordatorios automáticos y panel de gestión para estudios.",
  openGraph: {
    title: "TurnosPro",
    description: "Turnos online para estudios de belleza",
    type: "website",
    locale: "es_AR",
    siteName: "TurnosPro",
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
