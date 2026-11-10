import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  /** Keterangan singkat di bawah judul, contoh order ID atau nama donatur. */
  description?: ReactNode;
  /** Tombol di kanan judul; turun ke bawah judul di layar sempit. */
  actions?: ReactNode;
};

/** Judul halaman admin (h1) beserta aksi utamanya. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
