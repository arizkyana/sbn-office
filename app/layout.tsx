import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

// Sama dengan sbn-donatur (backlog 009): Plus Jakarta Sans untuk teks, Geist Mono untuk kode/ID.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SBN Office",
  description: "Panel admin pengelolaan campaign dan donasi Sobat Baik Nusantara",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        plusJakartaSans.variable,
      )}
    >
      <body className="h-full bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
