import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightThemeFlexoki from "starlight-theme-flexoki";

const docsBase = "/nexload-sdk";
const packageSidebar = (label, directory) => ({
  label,
  collapsed: true,
  items: [{ autogenerate: { directory } }],
});

const retiredPackageRedirects = {};
const packagePaths = [
  "healthcheck/core",
  "healthcheck/node",
  "healthcheck/bun",
  "healthcheck/next",
  "healthcheck/prometheus",
  "healthcheck/otel",
  "healthcheck/payload",
  "payload-fields",
  "payload-editor",
  "payload-schema",
  "payload-operations",
];

for (const pkg of packagePaths) {
  retiredPackageRedirects[`/packages/${pkg}/installation/`] = `${docsBase}/packages/${pkg}/`;
  retiredPackageRedirects[`/packages/${pkg}/quick-start/`] = `${docsBase}/packages/${pkg}/`;
  retiredPackageRedirects[`/packages/${pkg}/concepts/`] = `${docsBase}/packages/${pkg}/guides/`;
  retiredPackageRedirects[`/packages/${pkg}/examples/`] = `${docsBase}/packages/${pkg}/guides/`;
  retiredPackageRedirects[`/packages/${pkg}/troubleshooting/`] = `${docsBase}/packages/${pkg}/guides/`;
  retiredPackageRedirects[`/packages/${pkg}/migration/`] = `${docsBase}/packages/${pkg}/guides/`;
  retiredPackageRedirects[`/packages/${pkg}/compatibility/`] = `${docsBase}/packages/${pkg}/api/`;
}

export default defineConfig({
  site: "https://gecut.github.io",
  base: docsBase,
  redirects: {
    "/getting-started/": `${docsBase}/start/choose-a-package/`,
    "/concepts/liveness-readiness-startup/": `${docsBase}/packages/healthcheck/core/guides/`,
    "/concepts/checks-vs-collectors/": `${docsBase}/packages/healthcheck/core/guides/`,
    "/concepts/status-model/": `${docsBase}/packages/healthcheck/core/guides/`,
    "/guides/node-service/": `${docsBase}/packages/healthcheck/node/guides/`,
    "/guides/bun-service/": `${docsBase}/packages/healthcheck/bun/guides/`,
    "/guides/nextjs-route-handlers/": `${docsBase}/packages/healthcheck/next/guides/`,
    "/guides/docker-kubernetes-dokploy/": `${docsBase}/packages/healthcheck/node/guides/`,
    "/guides/payload-healthcheck/": `${docsBase}/packages/healthcheck/payload/guides/`,
    "/guides/prometheus-openmetrics/": `${docsBase}/packages/healthcheck/prometheus/guides/`,
    "/guides/opentelemetry/": `${docsBase}/packages/healthcheck/otel/guides/`,
    "/api/health-manager/": `${docsBase}/packages/healthcheck/core/api/`,
    "/api/check-contract/": `${docsBase}/packages/healthcheck/core/api/`,
    "/api/runtime-adapter/": `${docsBase}/packages/healthcheck/core/api/`,
    "/api/exporters/": `${docsBase}/packages/healthcheck/prometheus/api/`,
    "/reference/result-schema/": `${docsBase}/packages/healthcheck/core/guides/`,
    "/reference/error-codes/": `${docsBase}/packages/healthcheck/core/api/`,
    "/reference/metric-names/": `${docsBase}/packages/healthcheck/prometheus/api/`,
    "/reference/security/": `${docsBase}/packages/healthcheck/core/guides/`,
    "/packages/healthcheck/": `${docsBase}/packages/healthcheck/core/`,
    "/packages/healthcheck/quick-start/": `${docsBase}/packages/healthcheck/core/`,
    "/packages/healthcheck/concepts/scopes/": `${docsBase}/packages/healthcheck/core/guides/`,
    "/packages/healthcheck/concepts/checks-and-collectors/": `${docsBase}/packages/healthcheck/core/guides/`,
    "/packages/healthcheck/concepts/reports-and-status/": `${docsBase}/packages/healthcheck/core/guides/`,
    "/packages/healthcheck/guides/node/": `${docsBase}/packages/healthcheck/node/`,
    "/packages/healthcheck/guides/bun/": `${docsBase}/packages/healthcheck/bun/`,
    "/packages/healthcheck/guides/nextjs/": `${docsBase}/packages/healthcheck/next/`,
    "/packages/healthcheck/guides/payload/": `${docsBase}/packages/healthcheck/payload/`,
    "/packages/healthcheck/guides/exporters/": `${docsBase}/packages/healthcheck/prometheus/`,
    "/packages/healthcheck/guides/custom-checks/": `${docsBase}/packages/healthcheck/core/guides/`,
    "/packages/healthcheck/guides/operations/": `${docsBase}/packages/healthcheck/node/guides/`,
    "/packages/healthcheck/reference/api/": `${docsBase}/packages/healthcheck/core/api/`,
    "/payload-fields/": `${docsBase}/packages/payload-fields/`,
    "/payload-fields/slug/": `${docsBase}/packages/payload-fields/guides/`,
    "/payload-fields/jalali-date/": `${docsBase}/packages/payload-fields/guides/`,
    "/payload-fields/money/": `${docsBase}/packages/payload-fields/guides/`,
    "/payload-fields/migration/": `${docsBase}/packages/payload-fields/guides/`,
    "/payload-editor/": `${docsBase}/packages/payload-editor/`,
    "/payload-operations/": `${docsBase}/packages/payload-operations/`,
    "/payload-schema/": `${docsBase}/packages/payload-schema/`,
    "/packages/payload-fields/slug/": `${docsBase}/packages/payload-fields/guides/`,
    "/packages/payload-fields/jalali-dates/": `${docsBase}/packages/payload-fields/guides/`,
    "/packages/payload-fields/money/": `${docsBase}/packages/payload-fields/guides/`,
    "/packages/payload-fields/plugin-and-admin/": `${docsBase}/packages/payload-fields/guides/`,
    "/packages/payload-fields/reference-api/": `${docsBase}/packages/payload-fields/api/`,
    "/packages/payload-editor/features/": `${docsBase}/packages/payload-editor/guides/`,
    "/packages/payload-editor/presets/": `${docsBase}/packages/payload-editor/guides/`,
    "/packages/payload-editor/extensions/": `${docsBase}/packages/payload-editor/guides/`,
    "/packages/payload-editor/reference-api/": `${docsBase}/packages/payload-editor/api/`,
    "/packages/payload-schema/architecture/": `${docsBase}/packages/payload-schema/guides/`,
    "/packages/payload-schema/errors/": `${docsBase}/packages/payload-schema/guides/`,
    "/packages/payload-schema/fields/": `${docsBase}/packages/payload-schema/guides/`,
    "/packages/payload-schema/native-fields/": `${docsBase}/packages/payload-schema/guides/`,
    "/packages/payload-schema/payload-integration/": `${docsBase}/packages/payload-schema/guides/`,
    "/packages/payload-schema/projections/": `${docsBase}/packages/payload-schema/guides/`,
    "/packages/payload-schema/reference-api/": `${docsBase}/packages/payload-schema/api/`,
    "/packages/payload-schema/schema-derivation/": `${docsBase}/packages/payload-schema/guides/`,
    "/packages/payload-schema/testing-compatibility/": `${docsBase}/packages/payload-schema/api/`,
    "/llm/overview/": `${docsBase}/agents/`,
    "/llm/agent-skills/": `${docsBase}/agents/install/`,
    ...retiredPackageRedirects,
  },
  integrations: [
    starlight({
      title: "Nexload SDK",
      components: {
        TableOfContents: "./src/components/starlight/TableOfContents.astro",
      },
      head: [
        {
          tag: "meta",
          attrs: {
            name: "google-site-verification",
            content: "bgRRnzHHrHc-WkOZg4BdqT96LMtHFqYlNXmLPZ9oqKo",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: `${docsBase}/social-card.svg`,
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image",
            content: `${docsBase}/social-card.svg`,
          },
        },
      ],
      description: "Production package documentation for Nexload SDK.",
      disable404Route: true,
      lastUpdated: true,
      customCss: ["./src/styles/docs.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/gecut/nexload-sdk",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/gecut/nexload-sdk/edit/main/apps/docs/",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "start/introduction" },
            { label: "Choose a Package", slug: "start/choose-a-package" },
            { label: "Architecture Glossary", slug: "start/glossary" },
            { label: "Payload Suite Overview", slug: "start/payload-packages" },
            { label: "Package Catalog", slug: "packages" },
          ],
        },
        {
          label: "Healthcheck & Observability",
          items: [
            packageSidebar("Healthcheck Core", "packages/healthcheck/core"),
            packageSidebar("Node Probes", "packages/healthcheck/node"),
            packageSidebar("Bun Probes", "packages/healthcheck/bun"),
            packageSidebar("Next.js Integration", "packages/healthcheck/next"),
            packageSidebar(
              "Prometheus / OpenMetrics",
              "packages/healthcheck/prometheus",
            ),
            packageSidebar(
              "OpenTelemetry Exporter",
              "packages/healthcheck/otel",
            ),
            packageSidebar(
              "Payload CMS Healthcheck",
              "packages/healthcheck/payload",
            ),
          ],
        },
        {
          label: "Payload CMS Extensions",
          items: [
            packageSidebar("Payload Fields", "packages/payload-fields"),
            packageSidebar("Payload Editor", "packages/payload-editor"),
            packageSidebar("Payload Schema", "packages/payload-schema"),
            packageSidebar("Payload Operations", "packages/payload-operations"),
          ],
        },
        {
          label: "Tooling & Standards",
          items: [
            packageSidebar("TypeScript Config", "packages/typescript-config"),
            packageSidebar("ESLint Config", "packages/eslint-config"),
            { label: "File & Directory Structure", slug: "standards/file-structure" },
            { label: "Agent Config Setup Prompt", slug: "standards/agent-setup-prompt" },
          ],
        },
        {
          label: "AI Coding Skills",
          items: [
            { label: "Overview", slug: "agents" },
            { label: "Quickstart & Setup", slug: "agents/install" },
            { label: "Cognitive Graph (Tier 1)", slug: "agents/reasoning" },
            { label: "Engineering Standards (Tier 2)", slug: "agents/engineering" },
            { label: "Domain Specialists (Tier 3)", slug: "agents/domain-skills" },
            { label: "Governance & Protocols", slug: "agents/protocols" },
          ],
        },
        {
          label: "Community",
          collapsed: true,
          items: [
            { label: "Support & Discussions", slug: "community/support" },
          ],
        },
      ],
      plugins: [
        starlightThemeFlexoki({
          accentColor: "magenta",
        }),
      ],
    }),
  ],
});
