import { EditCampaign } from "@/containers/campaigns/form";

export default async function EditCampaignPage({
  params,
}: PageProps<"/campaigns/[uuid]">) {
  const { uuid } = await params;
  return <EditCampaign uuid={uuid} />;
}
