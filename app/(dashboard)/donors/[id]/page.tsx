import { DonorDetail } from "@/containers/donors/detail";

export default async function DonorDetailPage({
  params,
}: PageProps<"/donors/[id]">) {
  const { id } = await params;
  return <DonorDetail id={id} />;
}
