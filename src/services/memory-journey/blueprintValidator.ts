/**
 * Blueprint Validator
 * Simplified validation with better error handling
 */

import type { ValidationResult, Blueprint } from "@/types/memory-journey.types";

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export const validateBlueprint = (data: unknown): ValidationResult => {
  try {
    if (!data || typeof data !== "object") {
      return {
        isValid: false,
        errors: [{ field: "root", message: "Invalid JSON structure" }],
      };
    }

    const blueprint = data as any;
    const errors: Array<{ field: string; message: string }> = [];
    const warnings: string[] = [];

    // Validate meta
    if (!blueprint.meta) {
      errors.push({ field: "meta", message: "Meta section is required" });
    }

    // Validate story
    if (!blueprint.story) {
      errors.push({ field: "story", message: "Story section is required" });
    } else {
      if (!blueprint.story.title) {
        errors.push({ field: "story.title", message: "Story title is required" });
      }
      if (!blueprint.story.description) {
        errors.push({ field: "story.description", message: "Story description is required" });
      }
      if (!blueprint.story.themes || !Array.isArray(blueprint.story.themes) || blueprint.story.themes.length === 0) {
        errors.push({ field: "story.themes", message: "At least one theme is required" });
      }
      if (!blueprint.story.difficulty) {
        errors.push({ field: "story.difficulty", message: "Difficulty is required" });
      }
      if (!blueprint.story.total_xp || blueprint.story.total_xp < 1) {
        errors.push({ field: "story.total_xp", message: "Total XP must be at least 1" });
      }
    }

    // Validate scenes
    if (!blueprint.scenes || !Array.isArray(blueprint.scenes) || blueprint.scenes.length === 0) {
      errors.push({ field: "scenes", message: "At least one scene is required" });
    } else {
      blueprint.scenes.forEach((scene: any, index: number) => {
        const prefix = `scenes[${index}]`;

        if (!scene.scene_number) {
          errors.push({ field: `${prefix}.scene_number`, message: "Scene number is required" });
        }
        if (!scene.title) {
          errors.push({ field: `${prefix}.title`, message: "Scene title is required" });
        }
        if (!scene.story_text || scene.story_text.length < 50) {
          errors.push({ field: `${prefix}.story_text`, message: "Story text must be at least 50 characters" });
        }
        if (!scene.learning_content) {
          errors.push({ field: `${prefix}.learning_content`, message: "Learning content is required" });
        }
        if (!scene.challenge) {
          errors.push({ field: `${prefix}.challenge`, message: "Challenge is required" });
        }
        if (!scene.xp_reward || scene.xp_reward < 1) {
          errors.push({ field: `${prefix}.xp_reward`, message: "XP reward must be at least 1" });
        }
      });

      // Check scene numbers are sequential
      const sceneNumbers = blueprint.scenes.map((s: any) => s.scene_number);
      const isSequential = sceneNumbers.every((num: number, idx: number) => num === idx + 1);
      if (!isSequential) {
        warnings.push("Scene numbers are not sequential");
      }

      // Check total XP
      if (blueprint.story && blueprint.story.total_xp) {
        const calculatedXP = blueprint.scenes.reduce((sum: number, scene: any) => sum + (scene.xp_reward || 0), 0);
        if (calculatedXP !== blueprint.story.total_xp) {
          warnings.push(`Total XP mismatch: declared ${blueprint.story.total_xp}, calculated ${calculatedXP}`);
        }
      }
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        {
          field: "unknown",
          message: error instanceof Error ? error.message : "Unknown validation error",
        },
      ],
    };
  }
};

export const validateJSONFile = async (file: File): Promise<ValidationResult> => {
  try {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        isValid: false,
        errors: [
          {
            field: "file",
            message: "File size exceeds 5MB limit",
          },
        ],
      };
    }

    // Check file type
    if (!file.name.endsWith(".json")) {
      return {
        isValid: false,
        errors: [
          {
            field: "file",
            message: "File must be a JSON file",
          },
        ],
      };
    }

    // Parse JSON
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate blueprint structure
    return validateBlueprint(data);
  } catch (error) {
    return {
      isValid: false,
      errors: [
        {
          field: "file",
          message: error instanceof Error ? error.message : "Failed to parse JSON file",
        },
      ],
    };
  }
};
