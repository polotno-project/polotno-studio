import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    include: [
      "**/__tests__/**/*.?(c|m)[jt]s?(x)",
      "**/?(*.)+(spec|test).?(c|m)[jt]s?(x)",
    ],
  },
});
