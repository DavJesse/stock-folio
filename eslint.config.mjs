// ESLint configuration for Stock Portfolio Tracker (Next.js + TypeScript)
// Uses FlatConfig and extends Next.js recommended rules for best practices and performance.

import { dirname } from "path"; // Node.js utility for directory paths
import { fileURLToPath } from "url"; // Node.js utility for file URLs
import { FlatCompat } from "@eslint/eslintrc"; // Compatibility layer for legacy ESLint config

// Resolve __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create FlatCompat instance for extending legacy configs
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Main ESLint configuration array
const eslintConfig = [
  // Extend Next.js core web vitals and TypeScript rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Ignore build output, dependencies, logs, and other non-source files
  {
    ignores: [
      "**/node_modules/**", // Node dependencies
      ".next/**",           // Next.js build output
      "out/**",             // Static export output
      "coverage/**",        // Test coverage output
      "**/*.log",           // Log files
      ".vercel/**",         // Vercel deployment output
      ".turbo/**",          // Turbo build cache
      "*.tsbuildinfo",      // TypeScript build info
    ],
  },
];

export default eslintConfig;
