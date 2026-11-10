import { Badge } from "@/components/ui/badge";

// Dipakai daftar donatur (AKN009) dan detail donatur (AKN010).
export function DonorStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "secondary" : "destructive"}>
      {isActive ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}
