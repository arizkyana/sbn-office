import { EditPost } from "@/containers/blog/posts/form";

export default async function EditPostPage({
  params,
}: PageProps<"/blog/posts/[uuid]">) {
  const { uuid } = await params;
  return <EditPost uuid={uuid} />;
}
