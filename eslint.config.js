// eslint.config.js — flat config for ESLint 9 + typescript-eslint 8.
// Rules enforce the architecture: strict TS, ESM imports with .js extensions,
// and dependency-direction guards (platforms -> core -> game/ai/rendering -> db).
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "data/**", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // --- strictness we care about ---
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      "no-console": "warn",
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  {
    // Architecture guard: game / ai / rendering must never reach upward.
    files: ["src/game/**/*.ts", "src/ai/**/*.ts", "src/rendering/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/platforms/**", "../platforms/**", "../../platforms/**"],
              message:
                "game/ai/rendering MUST NOT import from platforms (dependency direction: platforms -> core -> game/ai/rendering -> db).",
            },
            {
              group: ["**/core/pipeline/**", "../core/pipeline/**", "../../core/pipeline/**"],
              message:
                "game/ai/rendering MUST NOT import from core/pipeline (dependency direction rule).",
            },
          ],
        },
      ],
    },
  },
  {
    // Adapters translate only: no command/game/AI logic inside platforms/.
    files: ["src/platforms/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/commands/**", "../../commands/**", "../../../commands/**"],
              message: "Adapters MUST NOT import command modules; dispatch through the router.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["tests/**/*.ts", "scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
);
