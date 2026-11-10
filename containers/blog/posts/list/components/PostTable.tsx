import Image from "next/image";
import Link from "next/link";
import { ImageIcon, PencilIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/date";
import {
  getPostImage,
  postStatusLabel,
  postTypeLabel,
  type PostStatus,
  type PostType,
} from "@/lib/post";
import { cn } from "@/lib/utils";
import type { PostListItem } from "../hooks/usePosts";

const typeBadgeVariant = {
  ARTICLE: "secondary",
  VIDEO: "outline",
} as const satisfies Record<PostType, string>;

const statusBadgeVariant = {
  DRAFT: "secondary",
  PUBLISH: "default",
} as const satisfies Record<PostStatus, string>;

type PostTableProps = {
  rows: PostListItem[];
  /** Menandai data halaman sebelumnya yang masih tampil saat halaman baru dimuat. */
  isStale?: boolean;
};

export default function PostTable({ rows, isStale }: PostTableProps) {
  return (
    <div
      className={cn(
        "rounded-lg border transition-opacity",
        isStale && "opacity-60",
      )}
    >
      {/* Tabel bisa di-scroll horizontal di layar kecil (pembungkus bawaan Table). */}
      <Table className="min-w-200">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Post</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Terbit</TableHead>
            <TableHead className="pr-4 text-right">
              <span className="sr-only">Aksi</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((post) => {
            // Video tanpa cover memakai thumbnail YouTube (A3).
            const image = getPostImage(post);

            return (
              <TableRow key={post.uuid}>
                <TableCell className="pl-4">
                  <div className="flex min-w-64 items-center gap-3">
                    <div className="relative flex aspect-video w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {image ? (
                        <Image
                          src={image}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="line-clamp-2 font-medium whitespace-normal">
                      {post.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={typeBadgeVariant[post.type]}>
                    {postTypeLabel[post.type]}
                  </Badge>
                </TableCell>
                <TableCell>{post.categories.name}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant[post.status]}>
                    {postStatusLabel[post.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {post.published_at ? (
                    formatDate(post.published_at)
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/blog/posts/${post.uuid}`} />}
                  >
                    <PencilIcon data-icon="inline-start" />
                    Ubah
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
