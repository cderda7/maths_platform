import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import Nav from "@/components/Nav";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Edexia · Maths — QCE Mathematical Methods",
  description: "Design mockup: step-aware maths feedback for QCE Year 11 Mathematical Methods.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line mt-16">
          <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-ink-muted flex items-center justify-between">
            <span>Edexia · Maths — design mockup. All grading, chat and OCR are simulated.</span>
            <span>Calibrated to QCE Mathematical Methods · Unit 1</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
