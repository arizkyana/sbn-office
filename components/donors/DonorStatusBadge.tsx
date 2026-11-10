import { Badge } from "@/components/ui/badge";

// Dipakai daftar donatur (AKN009) dan detail donatur (AKN010).
export function DonorStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "default" : "destructive"}>
      {isActive ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}
