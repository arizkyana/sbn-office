import { PropsWithChildren } from "react";

export default function LoginLayout({ children }: PropsWithChildren) {
  return (
    // Latar gradien lembut hijau–emas, sama dengan halaman auth donatur (backlog 009).
    <div className="flex min-h-full items-center justify-center bg-linear-to-br from-primary/10 via-background to-brand-gold/10 px-4 py-10">
      {children}
    </div>
  );
}
