import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LogoProvider } from "@/components/layout/SiteLogo";
import { getLogoSrc } from "@/lib/settings";
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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "SBN Office",
    description:
      "Panel admin pengelolaan campaign dan donasi Sobat Baik Nusantara",
    robots: { index: false, follow: false },
    // Favicon mengikuti logo di pengaturan.
    icons: { icon: await getLogoSrc() },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Di-cache (lib/settings.ts), jadi tidak menunda kerangka statis halaman.
  const logoSrc = await getLogoSrc();

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
        <Providers>
          <LogoProvider src={logoSrc}>{children}</LogoProvider>
        </Providers>
      </body>
    </html>
  );
}
