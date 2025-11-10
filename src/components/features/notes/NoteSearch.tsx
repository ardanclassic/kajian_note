/**
 * NoteSearch Component
 * Search and filter notes
 */

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, X, Filter, Globe, Lock, Pin, SortAsc, SortDesc, Calendar, FileText } from "lucide-react";
import type { NoteFilterOptions, NoteSortOptions, NoteSortField } from "@/types/notes.types";

interface NoteSearchProps {
  availableTags?: string[];
  onSearch?: (filters: NoteFilterOptions, sort: NoteSortOptions) => void;
  onClear?: () => void;
}

export function NoteSearch({ availableTags = [], onSearch, onClear }: NoteSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublicFilter, setIsPublicFilter] = useState<boolean | undefined>(undefined);
  const [isPinnedFilter, setIsPinnedFilter] = useState<boolean | undefined>(undefined);
  const [sortField, setSortField] = useState<NoteSortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        const filters: NoteFilterOptions = {
          search: searchQuery || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          isPublic: isPublicFilter,
          isPinned: isPinnedFilter,
        };

        const sort: NoteSortOptions = {
          field: sortField,
          order: sortOrder,
        };

        onSearch(filters, sort);
      }
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [searchQuery, selectedTags, isPublicFilter, isPinnedFilter, sortField, sortOrder, onSearch]);

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  // Handle clear all
  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setIsPublicFilter(undefined);
    setIsPinnedFilter(undefined);
    setSortField("createdAt");
    setSortOrder("desc");
    if (onClear) onClear();
  };

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery || selectedTags.length > 0 || isPublicFilter !== undefined || isPinnedFilter !== undefined;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul atau konten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4" />
        </Button>

        {/* Clear All */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={handleClearAll}>
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border rounded-lg p-4 space-y-4">
          {/* Sort */}
          <div className="space-y-2">
            <Label>Urutkan</Label>
            <div className="flex gap-2">
              {/* Sort Field */}
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as NoteSortField)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              >
                <option value="createdAt">Tanggal Dibuat</option>
                <option value="updatedAt">Tanggal Diubah</option>
                <option value="title">Judul</option>
              </select>

              {/* Sort Order */}
              <Button variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Visibility Filter */}
          <div className="space-y-2">
            <Label>Visibilitas</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isPublicFilter === undefined ? "default" : "outline"}
                onClick={() => setIsPublicFilter(undefined)}
              >
                Semua
              </Button>
              <Button
                size="sm"
                variant={isPublicFilter === true ? "default" : "outline"}
                onClick={() => setIsPublicFilter(true)}
              >
                <Globe className="w-4 h-4 mr-2" />
                Publik
              </Button>
              <Button
                size="sm"
                variant={isPublicFilter === false ? "default" : "outline"}
                onClick={() => setIsPublicFilter(false)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Pribadi
              </Button>
            </div>
          </div>

          {/* Pinned Filter */}
          <div className="space-y-2">
            <Label>Status Pin</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isPinnedFilter === undefined ? "default" : "outline"}
                onClick={() => setIsPinnedFilter(undefined)}
              >
                Semua
              </Button>
              <Button
                size="sm"
                variant={isPinnedFilter === true ? "default" : "outline"}
                onClick={() => setIsPinnedFilter(true)}
              >
                <Pin className="w-4 h-4 mr-2" />
                Pinned
              </Button>
              <Button
                size="sm"
                variant={isPinnedFilter === false ? "default" : "outline"}
                onClick={() => setIsPinnedFilter(false)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Regular
              </Button>
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <Label>
                Filter Tag
                {selectedTags.length > 0 && (
                  <span className="text-muted-foreground ml-2">({selectedTags.length} dipilih)</span>
                )}
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2 text-sm">
          {searchQuery && (
            <Badge variant="secondary">
              <Search className="w-3 h-3 mr-1" />"{searchQuery}"
            </Badge>
          )}
          {isPublicFilter !== undefined && (
            <Badge variant="secondary">
              {isPublicFilter ? (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  Publik
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Pribadi
                </>
              )}
            </Badge>
          )}
          {isPinnedFilter !== undefined && (
            <Badge variant="secondary">
              {isPinnedFilter ? (
                <>
                  <Pin className="w-3 h-3 mr-1" />
                  Pinned
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3 mr-1" />
                  Regular
                </>
              )}
            </Badge>
          )}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
              <button onClick={() => handleTagToggle(tag)} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
