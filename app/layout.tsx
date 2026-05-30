import "./globals.css";

export const metadata = {
  title: "JARVIS AI",
  description: "AI assistant interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}