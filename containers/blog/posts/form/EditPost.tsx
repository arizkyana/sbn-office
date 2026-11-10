import { notFound } from "next/navigation";
import { z } from "zod";
import { PostForm } from "./PostForm";
import { getPostByUuid } from "./queries";

export async function EditPost({ uuid }: { uuid: string }) {
  // uuid yang formatnya salah langsung 404, tanpa query ke database.
  if (!z.uuid().safeParse(uuid).success) notFound();

  const post = await getPostByUuid(uuid);
  if (!post) notFound();

  return (
    <PostForm
      uuid={post.uuid}
      defaultValues={{
        type: post.type,
        title: post.title,
        slug: post.slug,
        categories_id: String(post.categories_id),
        description: post.description ?? "",
        content: post.content ?? "",
        cover: post.cover ?? "",
        video_url: post.video_url ?? "",
        status: post.status,
      }}
    />
  );
}
