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
import { donorStatusOptions, type DonorFilterValues } from "../DonorList.types";

type DonorFiltersProps = {
  values: DonorFilterValues;
  onChange: (values: Partial<DonorFilterValues>) => void;
  onReset: () => void;
};

export default function DonorFilters({
  values,
  onChange,
  onReset,
}: DonorFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative w-full sm:w-72">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari nama, email, atau no. HP"
          aria-label="Cari nama, email, atau no. HP"
          className="pl-8"
          maxLength={100}
          value={values.search}
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </div>
      <Select
        items={donorStatusOptions}
        value={values.status}
        onValueChange={(value) => value && onChange({ status: value })}
      >
        <SelectTrigger aria-label="Filter status" className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {donorStatusOptions.map((option) => (
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
