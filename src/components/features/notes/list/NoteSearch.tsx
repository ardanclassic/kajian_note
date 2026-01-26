/**
 * NoteSearch Component - Dark Mode with Emerald Glow
 * Refactored: Following design-guidelines.md
 * ✅ Pure black background
 * ✅ Emerald glow accents
 * ✅ Smooth animations
 */

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedTags, isPublicFilter, isPinnedFilter, sortField, sortOrder, onSearch]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setIsPublicFilter(undefined);
    setIsPinnedFilter(undefined);
    setSortField("createdAt");
    setSortOrder("desc");
    if (onClear) onClear();
  };

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
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Cari judul atau konten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-12 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 focus:border-emerald-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative h-12 px-6 ${showFilters
              ? "bg-gray-900 text-white border-emerald-500/50"
              : "bg-transparent text-white border-gray-800 hover:border-emerald-500/30"
            } border transition-all duration-300`}
        >
          <Filter className="w-5 h-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Clear All */}
        {hasActiveFilters && (
          <Button
            onClick={handleClearAll}
            className="h-12 px-6 bg-transparent text-white border-gray-800 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="relative bg-black rounded-2xl p-8 border border-gray-800 overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.015]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)",
                backgroundSize: "80px 80px",
              }}
            />
          </div>

          <div className="relative z-10 space-y-6">
            {/* Sort */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Urutkan
              </Label>
              <div className="flex gap-3">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as NoteSortField)}
                  className="flex-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm font-medium text-white focus:border-emerald-500/50 transition-all"
                >
                  <option value="createdAt">Tanggal Dibuat</option>
                  <option value="updatedAt">Tanggal Diubah</option>
                  <option value="title">Judul</option>
                </select>

                <Button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="bg-gray-900 text-white border border-gray-800 hover:border-emerald-500/30 transition-all"
                >
                  {sortOrder === "asc" ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Pinned Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-white flex items-center gap-2">
                <Pin className="w-4 h-4 text-emerald-400" />
                Status Pin
              </Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => setIsPinnedFilter(undefined)}
                  className={`${isPinnedFilter === undefined
                      ? "bg-gray-900 text-white border-emerald-500/50"
                      : "bg-transparent text-gray-400 border-gray-800 hover:border-emerald-500/30 hover:text-white"
                    } border transition-all`}
                >
                  Semua
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsPinnedFilter(true)}
                  className={`${isPinnedFilter === true
                      ? "bg-gray-900 text-white border-emerald-500/50"
                      : "bg-transparent text-gray-400 border-gray-800 hover:border-emerald-500/30 hover:text-white"
                    } border transition-all`}
                >
                  <Pin className="w-4 h-4 mr-2" />
                  Pinned
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsPinnedFilter(false)}
                  className={`${isPinnedFilter === false
                      ? "bg-gray-900 text-white border-emerald-500/50"
                      : "bg-transparent text-gray-400 border-gray-800 hover:border-emerald-500/30 hover:text-white"
                    } border transition-all`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Regular
                </Button>
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-emerald-400">#</span>
                  Filter Tag
                  {selectedTags.length > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-full text-xs font-bold">
                      {selectedTags.length}
                    </span>
                  )}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTags.includes(tag)
                          ? "bg-gray-900 text-emerald-400 border border-emerald-500/50"
                          : "bg-transparent text-gray-400 border border-gray-800 hover:border-emerald-500/30 hover:text-white"
                        }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-emerald-500/50 text-emerald-400 rounded-lg text-sm">
              <Search className="w-3 h-3" />"{searchQuery}"
            </div>
          )}
          {isPublicFilter !== undefined && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-emerald-500/50 text-emerald-400 rounded-lg text-sm">
              {isPublicFilter ? (
                <>
                  <Globe className="w-3 h-3" />
                  Publik
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  Pribadi
                </>
              )}
            </div>
          )}
          {isPinnedFilter !== undefined && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-emerald-500/50 text-emerald-400 rounded-lg text-sm">
              {isPinnedFilter ? (
                <>
                  <Pin className="w-3 h-3" />
                  Pinned
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3" />
                  Regular
                </>
              )}
            </div>
          )}
          {selectedTags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-emerald-500/50 text-emerald-400 rounded-lg text-sm group"
            >
              #{tag}
              <button onClick={() => handleTagToggle(tag)} className="hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
