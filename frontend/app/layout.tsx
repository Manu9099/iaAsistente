import type { Metadata } from "next";
import { Share_Tech_Mono, Exo_2 } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

const exo2 = Exo_2({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  variable: "--font-exo",
});

export const metadata: Metadata = {
  title: "Jarvis AI",
  description: "Tu asistente IA personal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${shareTechMono.variable} ${exo2.variable}`}>
        {children}
      </body>
    </html>
  );
}
