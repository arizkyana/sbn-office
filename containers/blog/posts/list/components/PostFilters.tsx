"use client";

import { RotateCcwIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  postStatusFilterOptions,
  postTypeFilterOptions,
  type PostFilterValues,
} from "../PostList.types";

type PostFiltersProps = {
  values: PostFilterValues;
  categoryOptions: { value: string; label: string }[];
  onChange: (values: Partial<PostFilterValues>) => void;
  onReset: () => void;
};

export default function PostFilters({
  values,
  categoryOptions,
  onChange,
  onReset,
}: PostFiltersProps) {
  const categoryFilterOptions = [
    { value: "ALL", label: "Semua kategori" },
    ...categoryOptions,
  ];

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative w-full sm:w-72">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari judul post"
          aria-label="Cari judul post"
          className="pl-8"
          maxLength={100}
          value={values.search}
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </div>
      <Select
        items={postTypeFilterOptions}
        value={values.type}
        onValueChange={(value) => value && onChange({ type: value })}
      >
        <SelectTrigger aria-label="Filter tipe" className="w-full sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {postTypeFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        items={postStatusFilterOptions}
        value={values.status}
        onValueChange={(value) => value && onChange({ status: value })}
      >
        <SelectTrigger aria-label="Filter status" className="w-full sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {postStatusFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        items={categoryFilterOptions}
        value={values.categoriesId}
        onValueChange={(value) => value && onChange({ categoriesId: value })}
      >
        <SelectTrigger aria-label="Filter kategori" className="w-full sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categoryFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onReset}>
        <RotateCcwIcon data-icon="inline-start" />
        Reset
      </Button>
    </div>
  );
}
