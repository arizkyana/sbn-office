"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { campaignStatusOptions } from "@/lib/campaign";
import type { CampaignStatusFilter } from "../hooks/useCampaigns";

const statusFilterOptions: { value: CampaignStatusFilter; label: string }[] = [
  { value: "ALL", label: "Semua status" },
  ...campaignStatusOptions,
];

type CampaignFiltersProps = {
  search: string;
  status: CampaignStatusFilter;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: CampaignStatusFilter) => void;
};

export default function CampaignFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: CampaignFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative sm:w-72">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari judul campaign"
          aria-label="Cari judul campaign"
          className="pl-8"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <Select
        items={statusFilterOptions}
        value={status}
        onValueChange={(value) => value && onStatusChange(value)}
      >
        <SelectTrigger aria-label="Filter status" className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
