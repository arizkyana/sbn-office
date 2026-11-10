import { TransactionDetail } from "@/containers/transactions/detail";

export default async function TransactionDetailPage({
  params,
}: PageProps<"/transactions/[uuid]">) {
  const { uuid } = await params;
  return <TransactionDetail uuid={uuid} />;
}
