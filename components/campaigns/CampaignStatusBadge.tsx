import { Badge } from "@/components/ui/badge";
import { campaignStatusLabel, type CampaignStatus } from "@/lib/campaign";

const badgeVariant = {
  // Draft emas: belum tayang di website donatur (backlog 009).
  DRAFT: "warning",
  PUBLISH: "default",
  ARCHIVED: "outline",
} as const satisfies Record<CampaignStatus, string>;

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <Badge variant={badgeVariant[status]}>{campaignStatusLabel[status]}</Badge>
  );
}
