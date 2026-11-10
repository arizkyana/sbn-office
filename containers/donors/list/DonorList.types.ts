export type DonorStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export type DonorFilterValues = {
  search: string;
  status: DonorStatusFilter;
};

export const emptyDonorFilterValues: DonorFilterValues = {
  search: "",
  status: "ALL",
};

// Untuk `items` pada Select Base UI, agar trigger menampilkan label, bukan value.
export const donorStatusOptions: { value: DonorStatusFilter; label: string }[] =
  [
    { value: "ALL", label: "Semua status" },
    { value: "ACTIVE", label: "Aktif" },
    { value: "INACTIVE", label: "Nonaktif" },
  ];
