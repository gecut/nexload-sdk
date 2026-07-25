import healthcheckBun from "../../../../packages/healthcheck/bun/package.json";
import healthcheckCore from "../../../../packages/healthcheck/core/package.json";
import healthcheckNext from "../../../../packages/healthcheck/next/package.json";
import healthcheckNode from "../../../../packages/healthcheck/node/package.json";
import healthcheckOtel from "../../../../packages/healthcheck/otel/package.json";
import healthcheckPayload from "../../../../packages/healthcheck/payload/package.json";
import healthcheckPrometheus from "../../../../packages/healthcheck/prometheus/package.json";
import payloadEditor from "../../../../packages/payload-editor/package.json";
import payloadFields from "../../../../packages/payload-fields/package.json";
import payloadOperations from "../../../../packages/payload-operations/package.json";
import payloadSchema from "../../../../packages/payload-schema/package.json";

export type PackageFamily = "healthcheck" | "payload";
export type PackageMaturity = "stable";
export type PackageReleaseStatus = "released";

export type PackageManifest = {
  name: string
  version: string
  description?: string
  peerDependencies?: Record<string, string>
  engines?: Record<string, string>
};

export interface PackageCatalogEntry {
  id: string
  label: string
  manifest: PackageManifest
  family: PackageFamily
  sourcePath: string
  docsPath: string
  maturity: PackageMaturity
  releaseStatus: PackageReleaseStatus
  runtimes: readonly string[]
  skills: readonly string[]
}

const stableRelease = {
  maturity: "stable",
  releaseStatus: "released",
} as const;

export const packageCatalog: readonly PackageCatalogEntry[] = [
  {
    id: "healthcheck",
    label: "Healthcheck Core",
    manifest: healthcheckCore,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/core",
    docsPath: "/packages/healthcheck/core/",
    runtimes: ["Node.js", "Bun", "edge-safe core"],
    skills: ["healthcheck-core", "healthcheck-custom-checks", "healthcheck-diagnostics-security"],
    ...stableRelease,
  },
  {
    id: "healthcheck-node",
    label: "Healthcheck Node",
    manifest: healthcheckNode,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/node",
    docsPath: "/packages/healthcheck/node/",
    runtimes: ["Node.js", "Linux containers"],
    skills: ["healthcheck-container-resources"],
    ...stableRelease,
  },
  {
    id: "healthcheck-bun",
    label: "Healthcheck Bun",
    manifest: healthcheckBun,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/bun",
    docsPath: "/packages/healthcheck/bun/",
    runtimes: ["Bun"],
    skills: [],
    ...stableRelease,
  },
  {
    id: "healthcheck-next",
    label: "Healthcheck Next.js",
    manifest: healthcheckNext,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/next",
    docsPath: "/packages/healthcheck/next/",
    runtimes: ["Next.js App Router", "Node.js"],
    skills: ["healthcheck-nextjs-routes", "healthcheck-diagnostics-security"],
    ...stableRelease,
  },
  {
    id: "healthcheck-prometheus",
    label: "Healthcheck Prometheus",
    manifest: healthcheckPrometheus,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/prometheus",
    docsPath: "/packages/healthcheck/prometheus/",
    runtimes: ["Node.js", "Bun"],
    skills: ["healthcheck-monitoring-exporters", "healthcheck-diagnostics-security"],
    ...stableRelease,
  },
  {
    id: "healthcheck-otel",
    label: "Healthcheck OpenTelemetry",
    manifest: healthcheckOtel,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/otel",
    docsPath: "/packages/healthcheck/otel/",
    runtimes: ["Node.js", "Bun"],
    skills: ["healthcheck-monitoring-exporters", "healthcheck-diagnostics-security"],
    ...stableRelease,
  },
  {
    id: "healthcheck-payload",
    label: "Healthcheck Payload",
    manifest: healthcheckPayload,
    family: "healthcheck",
    sourcePath: "packages/healthcheck/payload",
    docsPath: "/packages/healthcheck/payload/",
    runtimes: ["Payload CMS", "Node.js"],
    skills: ["healthcheck-payload"],
    ...stableRelease,
  },
  {
    id: "payload-fields",
    label: "Payload Fields",
    manifest: payloadFields,
    family: "payload",
    sourcePath: "packages/payload-fields",
    docsPath: "/packages/payload-fields/",
    runtimes: ["Payload CMS", "React 19", "Payload Admin"],
    skills: ["payload-fields-core", "payload-fields-slug", "payload-fields-jalali-date", "payload-fields-money"],
    ...stableRelease,
  },
  {
    id: "payload-editor",
    label: "Payload Editor",
    manifest: payloadEditor,
    family: "payload",
    sourcePath: "packages/payload-editor",
    docsPath: "/packages/payload-editor/",
    runtimes: ["Payload CMS", "Node.js", "ESM"],
    skills: ["payload-editor-core", "payload-editor-presets", "payload-editor-extensions"],
    ...stableRelease,
  },
  {
    id: "payload-schema",
    label: "Payload Schema",
    manifest: payloadSchema,
    family: "payload",
    sourcePath: "packages/payload-schema",
    docsPath: "/packages/payload-schema/",
    runtimes: ["Payload CMS", "Node.js", "ESM"],
    skills: ["payload-schema-use", "payload-schema-develop"],
    ...stableRelease,
  },
  {
    id: "payload-operations",
    label: "Payload Operations",
    manifest: payloadOperations,
    family: "payload",
    sourcePath: "packages/payload-operations",
    docsPath: "/packages/payload-operations/",
    runtimes: ["Payload CMS", "Node.js", "Browser", "ESM"],
    skills: ["payload-operations-core", "payload-operations-client", "payload-operations-server"],
    ...stableRelease,
  },
];

export function packageByName(name: string): PackageCatalogEntry {
  const entry = packageCatalog.find((candidate) => candidate.manifest.name === name);
  if (!entry) throw new Error(`Unknown documented package: ${name}`);
  return entry;
}

export function packageById(id: string): PackageCatalogEntry {
  const entry = packageCatalog.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Unknown documented package id: ${id}`);
  return entry;
}
