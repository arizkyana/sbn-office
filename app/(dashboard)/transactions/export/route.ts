import { exportTransactions } from "@/containers/transactions/export";

export async function GET(request: Request) {
  return exportTransactions(request);
}
