import fs from "node:fs";

export interface AppConfig {
  port: number;
  host: string;
}

// Factual source truth contradicts README claims:
// 1. It is synchronous and blocking (fs.readFileSync)
// 2. It does not validate schema at runtime (unsafe cast as AppConfig)
// 3. It crashes unhandled if file is missing or contains invalid JSON
export function loadConfig(path: string): AppConfig {
  const content = fs.readFileSync(path, "utf8");
  return JSON.parse(content) as AppConfig;
}
