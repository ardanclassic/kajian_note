/**
 * NoteSearch Component - IMPROVED UI/UX
 * Modern search and filter interface with smooth animations
 */

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, X, Filter, Globe, Lock, Pin, SortAsc, SortDesc, FileText, Sparkles } from "lucide-react";
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

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    selectedTags.length +
    (isPublicFilter !== undefined ? 1 : 0) +
    (isPinnedFilter !== undefined ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Cari judul atau konten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-11 border-2 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="relative shadow-sm hover:shadow-md transition-all"
          size="lg"
        >
          <Filter className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Clear All */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearAll}
            className="hover:bg-destructive/10 hover:text-destructive transition-all"
            size="lg"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-2 rounded-xl p-4 md:p-6 space-y-5 bg-gradient-to-br from-primary/5 to-background shadow-sm animate-in slide-in-from-top-4 fade-in duration-300">
          {/* Sort */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Urutkan
            </Label>
            <div className="flex gap-2">
              {/* Sort Field */}
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as NoteSortField)}
                className="flex-1 px-4 py-2.5 border-2 rounded-lg text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-background"
              >
                <option value="createdAt">Tanggal Dibuat</option>
                <option value="updatedAt">Tanggal Diubah</option>
                <option value="title">Judul</option>
              </select>

              {/* Sort Order */}
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="shadow-sm hover:shadow-md transition-all border-2"
                size="lg"
              >
                {sortOrder === "asc" ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Visibility Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Visibilitas
            </Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={isPublicFilter === undefined ? "default" : "outline"}
                onClick={() => setIsPublicFilter(undefined)}
                className="shadow-sm hover:shadow-md transition-all"
              >
                Semua
              </Button>
              <Button
                size="sm"
                variant={isPublicFilter === true ? "default" : "outline"}
                onClick={() => setIsPublicFilter(true)}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <Globe className="w-4 h-4 mr-2" />
                Publik
              </Button>
              <Button
                size="sm"
                variant={isPublicFilter === false ? "default" : "outline"}
                onClick={() => setIsPublicFilter(false)}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <Lock className="w-4 h-4 mr-2" />
                Pribadi
              </Button>
            </div>
          </div>

          {/* Pinned Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Pin className="w-4 h-4 text-primary" />
              Status Pin
            </Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={isPinnedFilter === undefined ? "default" : "outline"}
                onClick={() => setIsPinnedFilter(undefined)}
                className="shadow-sm hover:shadow-md transition-all"
              >
                Semua
              </Button>
              <Button
                size="sm"
                variant={isPinnedFilter === true ? "default" : "outline"}
                onClick={() => setIsPinnedFilter(true)}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <Pin className="w-4 h-4 mr-2" />
                Pinned
              </Button>
              <Button
                size="sm"
                variant={isPinnedFilter === false ? "default" : "outline"}
                onClick={() => setIsPinnedFilter(false)}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <FileText className="w-4 h-4 mr-2" />
                Regular
              </Button>
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <span className="text-primary">#</span>
                Filter Tag
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedTags.length} dipilih
                  </Badge>
                )}
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-sm transition-all hover:scale-105 shadow-sm hover:shadow-md"
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
        <div className="flex flex-wrap gap-2 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          {searchQuery && (
            <Badge variant="secondary" className="px-3 py-1.5 shadow-sm">
              <Search className="w-3 h-3 mr-1.5" />"{searchQuery}"
            </Badge>
          )}
          {isPublicFilter !== undefined && (
            <Badge variant="secondary" className="px-3 py-1.5 shadow-sm">
              {isPublicFilter ? (
                <>
                  <Globe className="w-3 h-3 mr-1.5" />
                  Publik
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1.5" />
                  Pribadi
                </>
              )}
            </Badge>
          )}
          {isPinnedFilter !== undefined && (
            <Badge variant="secondary" className="px-3 py-1.5 shadow-sm">
              {isPinnedFilter ? (
                <>
                  <Pin className="w-3 h-3 mr-1.5" />
                  Pinned
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3 mr-1.5" />
                  Regular
                </>
              )}
            </Badge>
          )}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="px-3 py-1.5 shadow-sm group">
              #{tag}
              <button onClick={() => handleTagToggle(tag)} className="ml-1.5 hover:text-destructive transition-colors">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
