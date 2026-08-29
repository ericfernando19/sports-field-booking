"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sportTypes = [
  { value: "FUTSAL", label: "Futsal" },
  { value: "BADMINTON", label: "Bulu Tangkis" },
  { value: "BASKETBALL", label: "Basket" },
  { value: "TENNIS", label: "Tenis" },
  { value: "VOLLEYBALL", label: "Voli" },
  { value: "MINI_SOCCER", label: "Mini Soccer" },
];

const sortOptions = [
  { value: "name", label: "Nama A-Z" },
  { value: "price_asc", label: "Harga Terendah" },
  { value: "price_desc", label: "Harga Tertinggi" },
  { value: "newest", label: "Terbaru" },
];

export function FieldFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchFromUrl = searchParams.get("search") || "";
  const sportType = searchParams.get("sportType") || "";
  const sortBy = searchParams.get("sortBy") || "name";

  const [searchValue, setSearchValue] = useState(searchFromUrl);

  useEffect(() => {
    setSearchValue(searchFromUrl);
  }, [searchFromUrl]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
    router.push(`/fields?${createQueryString("search", value)}`);
  };

  const handleSportType = (value: string | null) => {
    router.push(`/fields?${createQueryString("sportType", value || "")}`);
  };

  const handleSort = (value: string | null) => {
    router.push(`/fields?${createQueryString("sortBy", value || "name")}`);
  };

  const clearFilters = () => {
    router.push("/fields");
  };

  const hasFilters = searchFromUrl || sportType || sortBy !== "name";

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari lapangan..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-2">
        <Select value={sportType || "all"} onValueChange={handleSportType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Semua Olahraga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Olahraga</SelectItem>
            {sportTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={handleSort}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="outline" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
