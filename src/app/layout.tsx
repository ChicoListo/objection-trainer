// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Una fuente limpia y moderna
import "./globals.css";
import Header from "@/components/Header"; // Crearemos este componente

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Objection Trainer",
  description: "Mejora tus habilidades de venta con un entrenador de IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}