import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./browser",
  use: { baseURL: "http://127.0.0.1:4328", viewport: { width: 360, height: 740 } },
  webServer: {
    command: "pnpm exec astro preview --host 127.0.0.1 --port 4328",
    url: "http://127.0.0.1:4328/nexload-sdk/",
    reuseExistingServer: false,
  },
});
