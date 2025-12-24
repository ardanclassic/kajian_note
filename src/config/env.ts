/**
 * Environment Variables Configuration
 * Validates and exports typed environment variables
 */

interface EnvConfig {
  // Supabase
  supabase: {
    url: string;
    anonKey: string;
  };

  // App
  app: {
    name: string;
    url: string;
    env: "development" | "production" | "test";
  };

  // Lynk.id Payment
  lynk: {
    apiKey: string;
    merchantId: string;
    webhookSecret: string;
    apiUrl: string;
  };

  // API
  api: {
    url: string;
  };

  // YouTube API
  youtube: {
    apiUrl: string;
    apiHeaderKey: string;
  };

  // OpenRouter (AI Summary)
  openRouter: {
    apiKey: string;
    defaultModel: string;
    geminiModel: string; // For Deep Note
  };

  // Telegram Bot
  telegram: {
    botToken: string;
  };

  // PDF Generator
  pdf: {
    api2pdfKey: string;
  };

  // ImageKit (Storage CDN)
  imagekit: {
    publicKey: string;
    privateKey: string;
    urlEndpoint: string;
  };
}

/**
 * Get environment variable with validation
 */
const getEnvVar = (key: string, required: boolean = true): string => {
  const value = import.meta.env[key];

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value || "";
};

/**
 * Validate all required environment variables
 */
const validateEnv = (): void => {
  const requiredVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "VITE_APP_NAME", "VITE_APP_URL"];

  const missing = requiredVars.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join("\n")}\n\n` +
        "Please check your .env file and ensure all required variables are set."
    );
  }
};

// Validate on import
validateEnv();

/**
 * Exported environment configuration
 */
export const env: EnvConfig = {
  supabase: {
    url: getEnvVar("VITE_SUPABASE_URL"),
    anonKey: getEnvVar("VITE_SUPABASE_ANON_KEY"),
  },

  app: {
    name: getEnvVar("VITE_APP_NAME"),
    url: getEnvVar("VITE_APP_URL"),
    env: (getEnvVar("VITE_ENV", false) || "development") as "development" | "production" | "test",
  },

  lynk: {
    apiKey: getEnvVar("VITE_LYNK_API_KEY", false),
    apiUrl: getEnvVar("VITE_LYNK_API_URL", false),
    merchantId: getEnvVar("VITE_LYNK_MERCHANT_ID", false),
    webhookSecret: getEnvVar("VITE_LYNK_WEBHOOK_SECRET", false),
  },

  api: {
    url: getEnvVar("VITE_API_URL", false) || "http://localhost:3000/api",
  },

  youtube: {
    apiUrl: "https://kajian-note-api.derrylab.com",
    apiHeaderKey: "Bearer kullubid'atindholaalah",
  },

  openRouter: {
    apiKey: getEnvVar("VITE_OPENROUTER_API_KEY", false) || "",
    defaultModel: getEnvVar("VITE_OPENROUTER_DEFAULT_MODEL", false) || "qwen/qwen3-8b",
    geminiModel: getEnvVar("VITE_OPENROUTER_GEMINI_MODEL", false) || "google/gemini-2.5-flash",
  },

  // NEW: Telegram Bot Configuration
  telegram: {
    botToken: getEnvVar("VITE_TELEGRAM_BOT_TOKEN", false) || "",
  },

  // NEW: PDF Generator Configuration
  pdf: {
    api2pdfKey: getEnvVar("VITE_API2PDF_API_KEY", false) || "",
  },

  // NEW: ImageKit Configuration
  imagekit: {
    publicKey: getEnvVar("VITE_IMAGEKIT_PUBLIC_KEY", false) || "",
    privateKey: getEnvVar("VITE_IMAGEKIT_PRIVATE_KEY", false) || "",
    urlEndpoint: getEnvVar("VITE_IMAGEKIT_URL_ENDPOINT", false) || "",
  },
};

/**
 * Check if running in development mode
 */
export const isDev = env.app.env === "development";

/**
 * Check if running in production mode
 */
export const isProd = env.app.env === "production";

/**
 * Check if running in test mode
 */
export const isTest = env.app.env === "test";

/**
 * Check if Telegram bot is configured
 */
export const isTelegramConfigured = (): boolean => {
  return env.telegram.botToken !== "";
};

/**
 * Check if PDF generation is configured
 */
export const isPDFGeneratorConfigured = (): boolean => {
  return env.pdf.api2pdfKey !== "";
};

/**
 * Check if ImageKit is configured
 */
export const isImageKitConfigured = (): boolean => {
  return env.imagekit.publicKey !== "" && env.imagekit.privateKey !== "" && env.imagekit.urlEndpoint !== "";
};

/**
 * Check if send to Telegram/WhatsApp features are available
 */
export const isSendPDFAvailable = (): boolean => {
  return isTelegramConfigured() && isPDFGeneratorConfigured() && isImageKitConfigured();
};
