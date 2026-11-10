import {
  postStatusOptions,
  postTypeOptions,
  type PostStatus,
  type PostType,
} from "@/lib/post";

export type PostFilterValues = {
  search: string;
  type: PostType | "ALL";
  status: PostStatus | "ALL";
  /** Id kategori sebagai string (value Select), atau `"ALL"`. */
  categoriesId: string;
};

export const emptyPostFilterValues: PostFilterValues = {
  search: "",
  type: "ALL",
  status: "ALL",
  categoriesId: "ALL",
};

// Untuk `items` pada Select Base UI, agar trigger menampilkan label, bukan value.
export const postTypeFilterOptions: {
  value: PostFilterValues["type"];
  label: string;
}[] = [{ value: "ALL", label: "Semua tipe" }, ...postTypeOptions];

export const postStatusFilterOptions: {
  value: PostFilterValues["status"];
  label: string;
}[] = [{ value: "ALL", label: "Semua status" }, ...postStatusOptions];
