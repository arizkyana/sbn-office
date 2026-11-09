import { notFound } from "next/navigation";
import { z } from "zod";
import { toJakartaDate } from "@/lib/date";
import { CampaignForm } from "./CampaignForm";
import { getCampaignByUuid } from "./queries";

export async function EditCampaign({ uuid }: { uuid: string }) {
  // uuid yang formatnya salah langsung 404, tanpa query ke database.
  if (!z.uuid().safeParse(uuid).success) notFound();

  const campaign = await getCampaignByUuid(uuid);
  if (!campaign) notFound();

  return (
    <CampaignForm
      uuid={campaign.uuid}
      defaultValues={{
        title: campaign.title,
        slug: campaign.slug,
        description: campaign.description ?? "",
        content: campaign.content ?? "",
        cover: campaign.cover ?? "",
        start_date: toJakartaDate(campaign.start_date),
        end_date: campaign.end_date ? toJakartaDate(campaign.end_date) : "",
        target_budget: campaign.target_budget,
        status: campaign.status,
      }}
    />
  );
}
