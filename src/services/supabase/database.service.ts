/**
 * Database Service - OPTIMIZED
 * General database utility functions with caching & deduplication
 */

import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

/**
 * Generic type for database tables
 */
type TableName = keyof Database["public"]["Tables"];

/**
 * Cache configuration
 */
const CACHE_TTL = 5000; // 5 seconds
const cache = new Map<string, { data: any; timestamp: number }>();
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Generate cache key
 */
const getCacheKey = (operation: string, params: any[]): string => {
  return `${operation}:${JSON.stringify(params)}`;
};

/**
 * Check if cache is valid
 */
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL;
};

/**
 * Get from cache or execute
 */
const cacheOrExecute = async <T>(key: string, executor: () => Promise<T>, skipCache: boolean = false): Promise<T> => {
  // Skip cache if requested
  if (skipCache) {
    return executor();
  }

  // Check cache
  const cached = cache.get(key);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }

  // Check pending requests (deduplication)
  const pending = pendingRequests.get(key);
  if (pending) {
    return pending;
  }

  // Execute and cache
  const promise = executor()
    .then((data) => {
      cache.set(key, { data, timestamp: Date.now() });
      pendingRequests.delete(key);
      return data;
    })
    .catch((error) => {
      pendingRequests.delete(key);
      throw error;
    });

  pendingRequests.set(key, promise);
  return promise;
};

/**
 * Clear cache by pattern
 */
export const clearCache = (pattern?: string): void => {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

/**
 * Get record by ID
 */
export const getById = async <T extends TableName>(
  table: T,
  id: string,
  skipCache: boolean = false
): Promise<Database["public"]["Tables"][T]["Row"] | null> => {
  const cacheKey = getCacheKey("getById", [table, id]);

  return cacheOrExecute(
    cacheKey,
    async () => {
      try {
        const { data, error } = await supabase.from(table).select("*").eq("id", id).single();

        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error(`Error getting ${table} by ID:`, error);
        return null;
      }
    },
    skipCache
  );
};

/**
 * Get all records from table
 */
export const getAll = async <T extends TableName>(
  table: T,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  },
  skipCache: boolean = false
): Promise<Database["public"]["Tables"][T]["Row"][]> => {
  const cacheKey = getCacheKey("getAll", [table, options]);

  return cacheOrExecute(
    cacheKey,
    async () => {
      try {
        let query = supabase.from(table).select("*");

        if (options?.orderBy) {
          query = query.order(options.orderBy, { ascending: options.ascending ?? true });
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error(`Error getting all ${table}:`, error);
        return [];
      }
    },
    skipCache
  );
};

/**
 * Create record
 */
export const create = async <T extends TableName>(
  table: T,
  data: Database["public"]["Tables"][T]["Insert"]
): Promise<Database["public"]["Tables"][T]["Row"] | null> => {
  try {
    const { data: record, error } = await supabase.from(table).insert(data).select().single();

    if (error) throw error;

    // Clear cache for this table
    clearCache(table);

    return record;
  } catch (error: any) {
    console.error(`Error creating ${table}:`, error);
    throw new Error(error.message || `Gagal membuat ${table}`);
  }
};

/**
 * Update record by ID
 */
export const update = async <T extends TableName>(
  table: T,
  id: string,
  data: Database["public"]["Tables"][T]["Update"]
): Promise<Database["public"]["Tables"][T]["Row"] | null> => {
  try {
    const { data: record, error } = await supabase.from(table).update(data).eq("id", id).select().single();

    if (error) throw error;

    // Clear cache for this table
    clearCache(table);

    return record;
  } catch (error: any) {
    console.error(`Error updating ${table}:`, error);
    throw new Error(error.message || `Gagal mengubah ${table}`);
  }
};

/**
 * Delete record by ID
 */
export const deleteById = async <T extends TableName>(table: T, id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) throw error;

    // Clear cache for this table
    clearCache(table);

    return true;
  } catch (error: any) {
    console.error(`Error deleting ${table}:`, error);
    throw new Error(error.message || `Gagal menghapus ${table}`);
  }
};

/**
 * Count records in table
 */
export const count = async <T extends TableName>(
  table: T,
  filters?: Record<string, any>,
  skipCache: boolean = false
): Promise<number> => {
  const cacheKey = getCacheKey("count", [table, filters]);

  return cacheOrExecute(
    cacheKey,
    async () => {
      try {
        let query = supabase.from(table).select("*", { count: "exact", head: true });

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        const { count, error } = await query;

        if (error) throw error;
        return count || 0;
      } catch (error: any) {
        console.error(`Error counting ${table}:`, error);
        return 0;
      }
    },
    skipCache
  );
};

/**
 * Check if record exists
 */
export const exists = async <T extends TableName>(
  table: T,
  filters: Record<string, any>,
  skipCache: boolean = false
): Promise<boolean> => {
  const cacheKey = getCacheKey("exists", [table, filters]);

  return cacheOrExecute(
    cacheKey,
    async () => {
      try {
        let query = supabase.from(table).select("id", { head: true });

        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { error } = await query.single();

        return !error;
      } catch (error: any) {
        return false;
      }
    },
    skipCache
  );
};

/**
 * Batch create records
 */
export const batchCreate = async <T extends TableName>(
  table: T,
  dataArray: Database["public"]["Tables"][T]["Insert"][]
): Promise<Database["public"]["Tables"][T]["Row"][]> => {
  try {
    const { data, error } = await supabase.from(table).insert(dataArray).select();

    if (error) throw error;

    // Clear cache for this table
    clearCache(table);

    return data || [];
  } catch (error: any) {
    console.error(`Error batch creating ${table}:`, error);
    throw new Error(error.message || `Gagal membuat ${table}`);
  }
};

/**
 * Batch update records
 */
export const batchUpdate = async <T extends TableName>(
  table: T,
  updates: Array<{ id: string; data: Database["public"]["Tables"][T]["Update"] }>
): Promise<boolean> => {
  try {
    const promises = updates.map(({ id, data }) => update(table, id, data));

    await Promise.all(promises);

    // Clear cache for this table
    clearCache(table);

    return true;
  } catch (error: any) {
    console.error(`Error batch updating ${table}:`, error);
    throw new Error(error.message || `Gagal mengubah ${table}`);
  }
};

/**
 * Batch delete records
 */
export const batchDelete = async <T extends TableName>(table: T, ids: string[]): Promise<boolean> => {
  try {
    const { error } = await supabase.from(table).delete().in("id", ids);

    if (error) throw error;

    // Clear cache for this table
    clearCache(table);

    return true;
  } catch (error: any) {
    console.error(`Error batch deleting ${table}:`, error);
    throw new Error(error.message || `Gagal menghapus ${table}`);
  }
};

/**
 * Paginate records
 */
export const paginate = async <T extends TableName>(
  table: T,
  options: {
    page: number;
    pageSize: number;
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, any>;
  },
  skipCache: boolean = false
): Promise<{
  data: Database["public"]["Tables"][T]["Row"][];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  const cacheKey = getCacheKey("paginate", [table, options]);

  return cacheOrExecute(
    cacheKey,
    async () => {
      try {
        const { page, pageSize, orderBy, ascending, filters } = options;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Build query
        let query = supabase.from(table).select("*", { count: "exact" });

        // Apply filters
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value);
            }
          });
        }

        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy, { ascending: ascending ?? true });
        }

        // Apply pagination
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
          data: data || [],
          total: count || 0,
          page,
          pageSize,
          totalPages: Math.ceil((count || 0) / pageSize),
        };
      } catch (error: any) {
        console.error(`Error paginating ${table}:`, error);
        return {
          data: [],
          total: 0,
          page: options.page,
          pageSize: options.pageSize,
          totalPages: 0,
        };
      }
    },
    skipCache
  );
};

/**
 * Search records by text field
 */
export const search = async <T extends TableName>(
  table: T,
  field: string,
  query: string,
  options?: {
    limit?: number;
    orderBy?: string;
    ascending?: boolean;
  },
  skipCache: boolean = false
): Promise<Database["public"]["Tables"][T]["Row"][]> => {
  const cacheKey = getCacheKey("search", [table, field, query, options]);

  return cacheOrExecute(
    cacheKey,
    async () => {
      try {
        let searchQuery = supabase.from(table).select("*").ilike(field, `%${query}%`);

        if (options?.orderBy) {
          searchQuery = searchQuery.order(options.orderBy, { ascending: options.ascending ?? true });
        }

        if (options?.limit) {
          searchQuery = searchQuery.limit(options.limit);
        }

        const { data, error } = await searchQuery;

        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error(`Error searching ${table}:`, error);
        return [];
      }
    },
    skipCache
  );
};

/**
 * Get records with filters
 */
export const getWhere = async <T extends TableName>(
  table: T,
  filters: Record<string, any>,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  },
  skipCache: boolean = false
): Promise<Database["public"]["Tables"][T]["Row"][]> => {
  const cacheKey = getCacheKey("getWhere", [table, filters, options]);

  return cacheOrExecute(
    cacheKey,
    async () => {
      try {
        let query = supabase.from(table).select("*");

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });

        // Apply ordering
        if (options?.orderBy) {
          query = query.order(options.orderBy, { ascending: options.ascending ?? true });
        }

        // Apply limit
        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error(`Error getting ${table} where:`, error);
        return [];
      }
    },
    skipCache
  );
};

/**
 * Soft delete (set is_active = false)
 */
export const softDelete = async (table: "users", id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from(table).update({ is_active: false }).eq("id", id);

    if (error) throw error;

    // Clear cache for this table
    clearCache(table);

    return true;
  } catch (error: any) {
    console.error(`Error soft deleting ${table}:`, error);
    throw new Error(error.message || `Gagal menghapus ${table}`);
  }
};

/**
 * Restore soft deleted record
 */
export const restore = async (table: "users", id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from(table).update({ is_active: true }).eq("id", id);

    if (error) throw error;

    // Clear cache for this table
    clearCache(table);

    return true;
  } catch (error: any) {
    console.error(`Error restoring ${table}:`, error);
    throw new Error(error.message || `Gagal mengembalikan ${table}`);
  }
};
