import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Edexia · 11 Methods — closed-loop demo",
  description: "Demo of live, closed-loop maths feedback for QCE Mathematical Methods: student iPad and teacher view.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
