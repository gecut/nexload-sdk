import env from "../../../../packages/env/package.json";
import healthcheckBun from "../../../../packages/healthcheck/bun/package.json";
import healthcheckCore from "../../../../packages/healthcheck/core/package.json";
import healthcheckNext from "../../../../packages/healthcheck/next/package.json";
import healthcheckNode from "../../../../packages/healthcheck/node/package.json";
import healthcheckOtel from "../../../../packages/healthcheck/otel/package.json";
import healthcheckPayload from "../../../../packages/healthcheck/payload/package.json";
import healthcheckPrometheus from "../../../../packages/healthcheck/prometheus/package.json";
import iconcraft from "../../../../packages/iconcraft/package.json";
import jwt from "../../../../packages/jwt/package.json";
import logger from "../../../../packages/logger/package.json";
import orpcClient from "../../../../packages/orpc-client/package.json";
import payloadFields from "../../../../packages/payload-fields/package.json";
import payloadHooks from "../../../../packages/payload-hooks/package.json";
import eslintConfig from "../../../../tools/eslint-config/package.json";
import typescriptConfig from "../../../../tools/typescript-config/package.json";

export type DocsStatus = "documented" | "planned";
export type PackageFamily = "healthcheck" | "payload" | "utilities" | "tooling";

type PackageManifest = {
  name: string
  version: string
  description?: string
  peerDependencies?: Record<string, string>
};

export interface PackageCatalogEntry {
  manifest: PackageManifest
  family: PackageFamily
  sourcePath: string
  docsPath?: string
  status: DocsStatus
  runtimes: readonly string[]
  skills: readonly string[]
}

const documented = "documented" as const;
const planned = "planned" as const;

export const packageCatalog: readonly PackageCatalogEntry[] = [
  {
    manifest: healthcheckCore,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/core",
    docsPath: "/packages/healthcheck/",
    status: documented,
    runtimes: ["Node.js", "Bun", "edge-safe core"],
    skills: ["healthcheck-core", "healthcheck-custom-checks", "healthcheck-diagnostics-security"],
  },
  {
    manifest: healthcheckNode,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/node",
    docsPath: "/packages/healthcheck/guides/node/",
    status: documented,
    runtimes: ["Node.js", "Linux containers"],
    skills: ["healthcheck-container-resources"],
  },
  {
    manifest: healthcheckBun,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/bun",
    docsPath: "/packages/healthcheck/guides/bun/",
    status: documented,
    runtimes: ["Bun"],
    skills: [],
  },
  {
    manifest: healthcheckNext,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/next",
    docsPath: "/packages/healthcheck/guides/nextjs/",
    status: documented,
    runtimes: ["Next.js App Router", "Node.js"],
    skills: ["healthcheck-nextjs-routes", "healthcheck-diagnostics-security"],
  },
  {
    manifest: healthcheckPrometheus,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/prometheus",
    docsPath: "/packages/healthcheck/guides/exporters/",
    status: documented,
    runtimes: ["Node.js", "Bun"],
    skills: ["healthcheck-monitoring-exporters", "healthcheck-diagnostics-security"],
  },
  {
    manifest: healthcheckOtel,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/otel",
    docsPath: "/packages/healthcheck/guides/exporters/",
    status: documented,
    runtimes: ["Node.js", "Bun"],
    skills: ["healthcheck-monitoring-exporters", "healthcheck-diagnostics-security"],
  },
  {
    manifest: healthcheckPayload,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/payload",
    docsPath: "/packages/healthcheck/guides/payload/",
    status: documented,
    runtimes: ["Payload CMS", "Node.js"],
    skills: ["healthcheck-payload"],
  },
  {
    manifest: payloadFields,
    family: "payload",
    sourcePath: "packages/payload-fields",
    docsPath: "/packages/payload-fields/",
    status: documented,
    runtimes: ["Payload CMS", "React"],
    skills: [
      "payload-fields-core",
      "payload-fields-slug",
      "payload-fields-jalali-date",
      "payload-fields-money",
    ],
  },
  { manifest: env, family: "utilities", sourcePath: "packages/env", status: planned, runtimes: ["Node.js"], skills: [] },
  { manifest: logger, family: "utilities", sourcePath: "packages/logger", status: planned, runtimes: ["Node.js", "browser"], skills: [] },
  { manifest: jwt, family: "utilities", sourcePath: "packages/jwt", status: planned, runtimes: ["Node.js", "Bun"], skills: [] },
  { manifest: iconcraft, family: "utilities", sourcePath: "packages/iconcraft", status: planned, runtimes: ["CLI", "React"], skills: [] },
  { manifest: orpcClient, family: "utilities", sourcePath: "packages/orpc-client", status: planned, runtimes: ["Node.js"], skills: [] },
  { manifest: payloadHooks, family: "payload", sourcePath: "packages/payload-hooks", status: planned, runtimes: ["Payload CMS"], skills: [] },
  { manifest: eslintConfig, family: "tooling", sourcePath: "tools/eslint-config", status: planned, runtimes: ["ESLint"], skills: [] },
  { manifest: typescriptConfig, family: "tooling", sourcePath: "tools/typescript-config", status: planned, runtimes: ["TypeScript"], skills: [] },
];

export const documentedPackages = packageCatalog.filter((entry) => entry.status === documented);

export function packageByName(name: string): PackageCatalogEntry {
  const entry = packageCatalog.find((candidate) => candidate.manifest.name === name);
  if (!entry) throw new Error(`Unknown package catalog entry: ${name}`);
  return entry;
}
