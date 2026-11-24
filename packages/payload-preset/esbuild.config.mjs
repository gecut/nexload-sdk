import process from "node:process";

import { createBundler } from "@nexload-sdk/bundler";

createBundler(["src/index.ts"], "dist", process.cwd(), { platform: "neutral", target: "es2022" }, false)();
