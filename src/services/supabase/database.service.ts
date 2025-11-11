/**
 * Database Service - FIXED Error Handling
 * General database utility functions with proper error propagation
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
 * Request timeout (10 seconds)
 */
const REQUEST_TIMEOUT = 10000;

/**
 * Custom error class for auth errors
 */
class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

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
 * Check if error is auth-related (401/403)
 */
const isAuthError = (error: any): boolean => {
  return (
    error?.code === "PGRST301" || // JWT expired
    error?.code === "PGRST302" || // JWT invalid
    error?.message?.includes("JWT") ||
    error?.message?.includes("expired") ||
    error?.message?.includes("unauthorized") ||
    error?.status === 401 ||
    error?.status === 403
  );
};

/**
 * Wrap async function with timeout
 */
const withTimeout = <T>(promise: Promise<T>, ms: number = REQUEST_TIMEOUT): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), ms)),
  ]);
};

/**
 * Handle database errors properly
 */
const handleDatabaseError = (error: any, operation: string, table: string): never => {
  console.error(`Database error [${operation}] on ${table}:`, error);

  // Check if auth error
  if (isAuthError(error)) {
    throw new AuthError("Sesi Anda telah berakhir. Silakan login kembali.", 401);
  }

  // Check for common errors
  if (error?.code === "PGRST116") {
    throw new Error("Data tidak ditemukan");
  }

  if (error?.code === "23505") {
    throw new Error("Data sudah ada");
  }

  if (error?.code === "23503") {
    throw new Error("Data terkait tidak ditemukan");
  }

  // Generic error
  throw new Error(error?.message || `Gagal ${operation} ${table}`);
};

/**
 * Get from cache or execute
 */
const cacheOrExecute = async <T>(key: string, executor: () => Promise<T>, skipCache: boolean = false): Promise<T> => {
  // Skip cache if requested
  if (skipCache) {
    return withTimeout(executor());
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
  const promise = withTimeout(executor())
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
      const { data, error } = await supabase.from(table).select("*").eq("id", id).single();

      if (error) {
        // Allow PGRST116 (not found) to return null
        if (error.code === "PGRST116") {
          return null;
        }
        handleDatabaseError(error, "get", table);
      }

      return data;
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
      let query = supabase.from(table).select("*");

      if (options?.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.ascending ?? true,
        });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        handleDatabaseError(error, "getAll", table);
      }

      return data || [];
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
): Promise<Database["public"]["Tables"][T]["Row"]> => {
  // const { data: record, error } = await withTimeout(supabase.from(table).insert(data).select().single());
  const { data: record, error } = await supabase.from(table).insert(data).select().single();

  if (error) {
    handleDatabaseError(error, "create", table);
  }

  if (!record) {
    throw new Error(`Gagal membuat ${table}`);
  }

  // Clear cache for this table
  clearCache(table);

  return record;
};

/**
 * Update record by ID
 */
export const update = async <T extends TableName>(
  table: T,
  id: string,
  data: Database["public"]["Tables"][T]["Update"]
): Promise<Database["public"]["Tables"][T]["Row"]> => {
  // const { data: record, error } = await withTimeout(supabase.from(table).update(data).eq("id", id).select().single());
  const { data: record, error } = await supabase.from(table).update(data).eq("id", id).select().single();

  if (error) {
    handleDatabaseError(error, "update", table);
  }

  if (!record) {
    throw new Error(`Gagal mengubah ${table}`);
  }

  // Clear cache for this table
  clearCache(table);

  return record;
};

/**
 * Delete record by ID
 */
export const deleteById = async <T extends TableName>(table: T, id: string): Promise<boolean> => {
  // const { error } = await withTimeout(supabase.from(table).delete().eq("id", id));
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    handleDatabaseError(error, "delete", table);
  }

  // Clear cache for this table
  clearCache(table);

  return true;
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
      let query = supabase.from(table).select("*", { count: "exact", head: true });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { count, error } = await query;

      if (error) {
        handleDatabaseError(error, "count", table);
      }

      return count || 0;
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
      let query = supabase.from(table).select("id", { head: true });

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { error } = await query.single();

      // PGRST116 = not found, so return false
      if (error?.code === "PGRST116") {
        return false;
      }

      if (error) {
        handleDatabaseError(error, "exists", table);
      }

      return true;
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
  // const { data, error } = await withTimeout(supabase.from(table).insert(dataArray).select());
  const { data, error } = await supabase.from(table).insert(dataArray).select();

  if (error) {
    handleDatabaseError(error, "batchCreate", table);
  }

  // Clear cache for this table
  clearCache(table);

  return data || [];
};

/**
 * Batch update records
 */
export const batchUpdate = async <T extends TableName>(
  table: T,
  updates: Array<{ id: string; data: Database["public"]["Tables"][T]["Update"] }>
): Promise<boolean> => {
  const promises = updates.map(({ id, data }) => update(table, id, data));

  await Promise.all(promises);

  // Clear cache for this table
  clearCache(table);

  return true;
};

/**
 * Batch delete records
 */
export const batchDelete = async <T extends TableName>(table: T, ids: string[]): Promise<boolean> => {
  // const { error } = await withTimeout(supabase.from(table).delete().in("id", ids));
  const { error } = await supabase.from(table).delete().in("id", ids);

  if (error) {
    handleDatabaseError(error, "batchDelete", table);
  }

  // Clear cache for this table
  clearCache(table);

  return true;
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

      if (error) {
        handleDatabaseError(error, "paginate", table);
      }

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
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
      let searchQuery = supabase.from(table).select("*").ilike(field, `%${query}%`);

      if (options?.orderBy) {
        searchQuery = searchQuery.order(options.orderBy, {
          ascending: options.ascending ?? true,
        });
      }

      if (options?.limit) {
        searchQuery = searchQuery.limit(options.limit);
      }

      const { data, error } = await searchQuery;

      if (error) {
        handleDatabaseError(error, "search", table);
      }

      return data || [];
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
      let query = supabase.from(table).select("*");

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.ascending ?? true,
        });
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        handleDatabaseError(error, "getWhere", table);
      }

      return data || [];
    },
    skipCache
  );
};

/**
 * Soft delete (set is_active = false)
 */
export const softDelete = async (table: "users", id: string): Promise<boolean> => {
  // const { error } = await withTimeout(supabase.from(table).update({ is_active: false }).eq("id", id));
  const { error } = await supabase.from(table).update({ is_active: false }).eq("id", id);

  if (error) {
    handleDatabaseError(error, "softDelete", table);
  }

  // Clear cache for this table
  clearCache(table);

  return true;
};

/**
 * Restore soft deleted record
 */
export const restore = async (table: "users", id: string): Promise<boolean> => {
  // const { error } = await withTimeout(supabase.from(table).update({ is_active: true }).eq("id", id));
  const { error } = await supabase.from(table).update({ is_active: true }).eq("id", id);

  if (error) {
    handleDatabaseError(error, "restore", table);
  }

  // Clear cache for this table
  clearCache(table);

  return true;
};

/**
 * Export AuthError for catching in stores
 */
export { AuthError };
