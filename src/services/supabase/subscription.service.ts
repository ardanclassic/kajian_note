/**
 * Subscription Service
 * Handles subscription-related operations
 */

import { supabase } from "@/lib/supabase";
import * as db from "./database.service";
import { SUBSCRIPTION_LIMITS, type SubscriptionTier } from "@/config/subscriptionLimits";
import type {
  Subscription,
  UserSubscription,
  SubscriptionTierInfo,
  UpgradeSubscriptionData,
  CancelSubscriptionData,
  ManualGrantSubscriptionData,
  SubscriptionHistory,
  SubscriptionUsage,
  SubscriptionCheckResult,
} from "@/types/subscription.types";

/**
 * Get user subscription info
 */
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  try {
    const user = await db.getById("users", userId);
    if (!user) return null;

    const now = new Date();
    const endDate = user.subscription_end_date ? new Date(user.subscription_end_date) : null;
    const daysRemaining = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isExpired = endDate ? endDate < now : false;

    return {
      tier: user.subscription_tier as SubscriptionTier,
      status: user.subscription_status as any,
      startDate: user.subscription_start_date,
      endDate: user.subscription_end_date,
      daysRemaining,
      isExpired,
      canUpgrade: user.subscription_tier !== "advance",
    };
  } catch (error: any) {
    console.error("Error getting user subscription:", error);
    return null;
  }
};

/**
 * Get subscription tiers info
 */
export const getSubscriptionTiers = async (currentTier?: SubscriptionTier): Promise<SubscriptionTierInfo[]> => {
  const tiers: SubscriptionTierInfo[] = [
    {
      tier: "free",
      name: "Free",
      description: "Gratis selamanya",
      price: 0,
      priceFormatted: "Rp 0",
      duration: 0,
      features: ["Maksimal 10 catatan", "Maksimal 3 tags per catatan", "Catatan private saja", "Tidak ada export"],
      limits: SUBSCRIPTION_LIMITS.free,
      isCurrent: currentTier === "free",
      isRecommended: false,
    },
    {
      tier: "premium",
      name: "Premium",
      description: "Untuk pengguna aktif",
      price: 50000,
      priceFormatted: "Rp 50.000",
      duration: 30,
      features: ["Maksimal 100 catatan", "Maksimal 10 tags per catatan", "Bisa buat catatan public", "Export PDF"],
      limits: SUBSCRIPTION_LIMITS.premium,
      isCurrent: currentTier === "premium",
      isRecommended: true,
    },
    {
      tier: "advance",
      name: "Advance",
      description: "Tanpa batas untuk profesional",
      price: 100000,
      priceFormatted: "Rp 100.000",
      duration: 30,
      features: ["Catatan unlimited", "Tags unlimited", "Buat catatan public", "Export PDF & Word"],
      limits: SUBSCRIPTION_LIMITS.advance,
      isCurrent: currentTier === "advance",
      isRecommended: false,
    },
  ];

  return tiers;
};

/**
 * Upgrade subscription (initiate payment)
 */
export const upgradeSubscription = async (
  userId: string,
  data: UpgradeSubscriptionData
): Promise<{ paymentUrl: string; subscriptionId: string }> => {
  try {
    // Get tier info
    const tiers = await getSubscriptionTiers();
    const tierInfo = tiers.find((t) => t.tier === data.tier);
    if (!tierInfo) throw new Error("Tier tidak valid");

    // Calculate subscription period
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + tierInfo.duration);

    // Create pending subscription record
    const subscription = await db.create("subscriptions", {
      user_id: userId,
      tier: data.tier,
      status: "pending",
      payment_method: data.paymentMethod,
      payment_id: null,
      payment_status: "pending",
      amount: tierInfo.price,
      currency: "IDR",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });

    if (!subscription) throw new Error("Gagal membuat subscription");

    // TODO: Create payment via Lynk.id
    // This will be implemented in lynk.service.ts
    // For now, return mock payment URL
    const paymentUrl = `https://payment.lynk.id/mock/${subscription.id}`;

    return {
      paymentUrl,
      subscriptionId: subscription.id,
    };
  } catch (error: any) {
    console.error("Error upgrading subscription:", error);
    throw new Error(error.message || "Gagal upgrade subscription");
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (userId: string, data?: CancelSubscriptionData): Promise<boolean> => {
  try {
    // Update user subscription status
    await db.update("users", userId, {
      subscription_status: "cancelled",
    });

    // Update latest active subscription
    const subscriptions = await db.getWhere(
      "subscriptions",
      { user_id: userId, status: "active" },
      { orderBy: "created_at", ascending: false, limit: 1 }
    );

    if (subscriptions.length > 0) {
      await db.update("subscriptions", subscriptions[0].id, {
        status: "cancelled",
      });
    }

    return true;
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    throw new Error(error.message || "Gagal cancel subscription");
  }
};

/**
 * Manual grant subscription (by admin)
 */
export const manualGrantSubscription = async (
  data: ManualGrantSubscriptionData,
  grantedBy: string
): Promise<Subscription> => {
  try {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + data.duration);

    // Update user subscription
    await db.update("users", data.userId, {
      subscription_tier: data.tier,
      subscription_status: "active",
      subscription_start_date: startDate.toISOString(),
      subscription_end_date: endDate.toISOString(),
    });

    // Create subscription record
    const subscription = await db.create("subscriptions", {
      user_id: data.userId,
      tier: data.tier,
      status: "active",
      payment_method: "manual",
      payment_id: `MANUAL-${Date.now()}`,
      payment_status: "success",
      amount: 0,
      currency: "IDR",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });

    if (!subscription) throw new Error("Gagal membuat subscription");

    // Log change
    await db.create("profile_changes", {
      user_id: data.userId,
      field_changed: "subscription",
      old_value: null,
      new_value: `${data.tier} - ${data.duration} days - ${data.reason}`,
      changed_by: grantedBy,
      changed_by_role: null,
      ip_address: null,
      user_agent: null,
    });

    return mapDbSubscriptionToSubscription(subscription);
  } catch (error: any) {
    console.error("Error granting subscription:", error);
    throw new Error(error.message || "Gagal grant subscription");
  }
};

/**
 * Get subscription history
 */
export const getSubscriptionHistory = async (userId: string): Promise<SubscriptionHistory> => {
  try {
    const subscriptions = await db.getWhere(
      "subscriptions",
      { user_id: userId },
      { orderBy: "created_at", ascending: false }
    );

    return {
      subscriptions: subscriptions.map(mapDbSubscriptionToSubscription),
      total: subscriptions.length,
    };
  } catch (error: any) {
    console.error("Error getting subscription history:", error);
    return {
      subscriptions: [],
      total: 0,
    };
  }
};

/**
 * Get all subscriptions (admin only)
 */
export const getAllSubscriptions = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{
  subscriptions: Subscription[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  try {
    const result = await db.paginate("subscriptions", {
      page,
      pageSize,
      orderBy: "created_at",
      ascending: false,
    });

    return {
      subscriptions: result.data.map(mapDbSubscriptionToSubscription),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  } catch (error: any) {
    console.error("Error getting all subscriptions:", error);
    return {
      subscriptions: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
};

/**
 * Get subscription usage
 */
export const getSubscriptionUsage = async (userId: string): Promise<SubscriptionUsage> => {
  try {
    const user = await db.getById("users", userId);
    if (!user) throw new Error("User tidak ditemukan");

    const tier = user.subscription_tier as SubscriptionTier;
    const limits = SUBSCRIPTION_LIMITS[tier];

    // Count notes
    const notesUsed = await db.count("notes", { user_id: userId });

    // Count tags
    const notes = await db.getWhere("notes", { user_id: userId });
    const allTags = notes.flatMap((note) => note.tags || []);
    const uniqueTags = [...new Set(allTags)];
    const tagsUsed = uniqueTags.length;

    return {
      tier,
      notesCount: notesUsed,
      notesUsed,
      notesLimit: limits.maxNotes,
      notesRemaining: limits.maxNotes === Infinity ? Infinity : Math.max(0, limits.maxNotes - notesUsed),
      tagsCount: tagsUsed,
      tagsUsed,
      tagsLimit: limits.maxTags,
      tagsRemaining: limits.maxTags === Infinity ? Infinity : Math.max(0, limits.maxTags - tagsUsed),
      publicNotesAllowed: limits.canPublicNotes,
      pdfExportAllowed: limits.canExportPDF,
      wordExportAllowed: limits.canExportWord,
    };
  } catch (error: any) {
    console.error("Error getting subscription usage:", error);
    throw new Error(error.message || "Gagal mendapatkan usage");
  }
};

/**
 * Check if user can create note
 */
export const canCreateNote = async (userId: string): Promise<SubscriptionCheckResult> => {
  try {
    const usage = await getSubscriptionUsage(userId);

    if (usage.notesUsed >= usage.notesLimit) {
      return {
        allowed: false,
        message: "Batas catatan tercapai. Upgrade untuk membuat lebih banyak catatan.",
        upgradeRequired: true,
        recommendedTier: usage.notesLimit === 10 ? "premium" : "advance",
      };
    }

    return {
      allowed: true,
    };
  } catch (error: any) {
    console.error("Error checking can create note:", error);
    return {
      allowed: false,
      message: "Gagal memeriksa batas",
    };
  }
};

/**
 * Check if user can add tag
 */
export const canAddTag = async (userId: string): Promise<SubscriptionCheckResult> => {
  try {
    const usage = await getSubscriptionUsage(userId);

    if (usage.tagsUsed >= usage.tagsLimit) {
      return {
        allowed: false,
        message: "Batas tag tercapai. Upgrade untuk menambah lebih banyak tag.",
        upgradeRequired: true,
        recommendedTier: usage.tagsLimit === 3 ? "premium" : "advance",
      };
    }

    return {
      allowed: true,
    };
  } catch (error: any) {
    console.error("Error checking can add tag:", error);
    return {
      allowed: false,
      message: "Gagal memeriksa batas",
    };
  }
};

/**
 * Check if user can create public note
 */
export const canCreatePublicNote = async (userId: string): Promise<SubscriptionCheckResult> => {
  try {
    const usage = await getSubscriptionUsage(userId);

    if (!usage.publicNotesAllowed) {
      return {
        allowed: false,
        message: "Catatan public hanya untuk Premium & Advance.",
        upgradeRequired: true,
        recommendedTier: "premium",
      };
    }

    return {
      allowed: true,
    };
  } catch (error: any) {
    console.error("Error checking can create public note:", error);
    return {
      allowed: false,
      message: "Gagal memeriksa batas",
    };
  }
};

/**
 * Check if user can export PDF
 */
export const canExportPDF = async (userId: string): Promise<SubscriptionCheckResult> => {
  try {
    const usage = await getSubscriptionUsage(userId);

    if (!usage.pdfExportAllowed) {
      return {
        allowed: false,
        message: "Export PDF hanya untuk Premium & Advance.",
        upgradeRequired: true,
        recommendedTier: "premium",
      };
    }

    return {
      allowed: true,
    };
  } catch (error: any) {
    console.error("Error checking can export PDF:", error);
    return {
      allowed: false,
      message: "Gagal memeriksa batas",
    };
  }
};

/**
 * Check if user can export Word
 */
export const canExportWord = async (userId: string): Promise<SubscriptionCheckResult> => {
  try {
    const usage = await getSubscriptionUsage(userId);

    if (!usage.wordExportAllowed) {
      return {
        allowed: false,
        message: "Export Word hanya untuk Advance.",
        upgradeRequired: true,
        recommendedTier: "advance",
      };
    }

    return {
      allowed: true,
    };
  } catch (error: any) {
    console.error("Error checking can export Word:", error);
    return {
      allowed: false,
      message: "Gagal memeriksa batas",
    };
  }
};

/**
 * Check and expire subscriptions
 * This should be called periodically (cron job)
 */
export const checkExpiredSubscriptions = async (): Promise<number> => {
  try {
    const now = new Date().toISOString();

    // Get expired subscriptions
    const { data: expiredUsers } = await supabase
      .from("users")
      .select("id")
      .eq("subscription_status", "active")
      .neq("subscription_tier", "free")
      .lt("subscription_end_date", now);

    if (!expiredUsers || expiredUsers.length === 0) return 0;

    // Update to free tier
    for (const user of expiredUsers) {
      await db.update("users", user.id, {
        subscription_tier: "free",
        subscription_status: "expired",
      });

      // Update subscription records
      const subscriptions = await db.getWhere(
        "subscriptions",
        { user_id: user.id, status: "active" },
        { orderBy: "created_at", ascending: false, limit: 1 }
      );

      if (subscriptions.length > 0) {
        await db.update("subscriptions", subscriptions[0].id, {
          status: "expired",
        });
      }
    }

    return expiredUsers.length;
  } catch (error: any) {
    console.error("Error checking expired subscriptions:", error);
    return 0;
  }
};

/**
 * Map database subscription to Subscription type
 */
const mapDbSubscriptionToSubscription = (dbSub: any): Subscription => {
  return {
    id: dbSub.id,
    userId: dbSub.user_id,
    tier: dbSub.tier,
    status: dbSub.status,
    paymentMethod: dbSub.payment_method,
    paymentId: dbSub.payment_id,
    paymentStatus: dbSub.payment_status,
    amount: dbSub.amount,
    currency: dbSub.currency,
    startDate: dbSub.start_date,
    endDate: dbSub.end_date,
    createdAt: dbSub.created_at,
    updatedAt: dbSub.updated_at,
  };
};
