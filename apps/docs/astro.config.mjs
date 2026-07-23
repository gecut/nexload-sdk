import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightThemeFlexoki from "starlight-theme-flexoki";

const docsBase = "/nexload-sdk";
const packageSidebar = (label, directory) => ({
  label,
  collapsed: true,
  items: [{ autogenerate: { directory } }],
});

export default defineConfig({
  site: "https://gecut.github.io",
  base: docsBase,
  redirects: {
    "/getting-started/": `${docsBase}/start/choose-a-package/`,
    "/concepts/liveness-readiness-startup/": `${docsBase}/packages/healthcheck/core/concepts/`,
    "/concepts/checks-vs-collectors/": `${docsBase}/packages/healthcheck/core/concepts/`,
    "/concepts/status-model/": `${docsBase}/packages/healthcheck/core/concepts/`,
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
    "/reference/result-schema/": `${docsBase}/packages/healthcheck/core/concepts/`,
    "/reference/error-codes/": `${docsBase}/packages/healthcheck/core/api/`,
    "/reference/metric-names/": `${docsBase}/packages/healthcheck/prometheus/api/`,
    "/reference/security/": `${docsBase}/packages/healthcheck/core/troubleshooting/`,
    "/packages/healthcheck/": `${docsBase}/packages/healthcheck/core/`,
    "/packages/healthcheck/quick-start/": `${docsBase}/packages/healthcheck/core/quick-start/`,
    "/packages/healthcheck/concepts/scopes/": `${docsBase}/packages/healthcheck/core/concepts/`,
    "/packages/healthcheck/concepts/checks-and-collectors/": `${docsBase}/packages/healthcheck/core/concepts/`,
    "/packages/healthcheck/concepts/reports-and-status/": `${docsBase}/packages/healthcheck/core/concepts/`,
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
    "/payload-fields/migration/": `${docsBase}/packages/payload-fields/migration/`,
    "/payload-editor/": `${docsBase}/packages/payload-editor/`,
    "/payload-schema/": `${docsBase}/packages/payload-schema/`,
    "/packages/payload-fields/slug/": `${docsBase}/packages/payload-fields/guides/`,
    "/packages/payload-fields/jalali-dates/": `${docsBase}/packages/payload-fields/guides/`,
    "/packages/payload-fields/money/": `${docsBase}/packages/payload-fields/guides/`,
    "/packages/payload-fields/plugin-and-admin/": `${docsBase}/packages/payload-fields/concepts/`,
    "/packages/payload-fields/reference-api/": `${docsBase}/packages/payload-fields/api/`,
    "/packages/payload-editor/features/": `${docsBase}/packages/payload-editor/concepts/`,
    "/packages/payload-editor/presets/": `${docsBase}/packages/payload-editor/guides/`,
    "/packages/payload-editor/extensions/": `${docsBase}/packages/payload-editor/guides/`,
    "/packages/payload-editor/reference-api/": `${docsBase}/packages/payload-editor/api/`,
    "/packages/payload-schema/architecture/": `${docsBase}/packages/payload-schema/concepts/`,
    "/packages/payload-schema/errors/": `${docsBase}/packages/payload-schema/troubleshooting/`,
    "/packages/payload-schema/fields/": `${docsBase}/packages/payload-schema/guides/`,
    "/packages/payload-schema/native-fields/": `${docsBase}/packages/payload-schema/guides/`,
    "/packages/payload-schema/payload-integration/": `${docsBase}/packages/payload-schema/guides/`,
    "/packages/payload-schema/projections/": `${docsBase}/packages/payload-schema/examples/`,
    "/packages/payload-schema/reference-api/": `${docsBase}/packages/payload-schema/api/`,
    "/packages/payload-schema/schema-derivation/": `${docsBase}/packages/payload-schema/concepts/`,
    "/packages/payload-schema/testing-compatibility/": `${docsBase}/packages/payload-schema/compatibility/`,
    "/llm/overview/": `${docsBase}/agents/`,
    "/llm/agent-skills/": `${docsBase}/agents/install/`,
  },
  integrations: [
    starlight({
      title: "Nexload SDK",
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
          label: "Start",
          items: [
            { label: "Landing", slug: "" },
            { label: "Introduction", slug: "start/introduction" },
            { label: "Choose a package", slug: "start/choose-a-package" },
          ],
        },
        {
          label: "Packages",
          items: [
            {
              label: "Package catalog",
              slug: "packages",
            },
            packageSidebar("Healthcheck Core", "packages/healthcheck/core"),
            packageSidebar("Healthcheck Node", "packages/healthcheck/node"),
            packageSidebar("Healthcheck Bun", "packages/healthcheck/bun"),
            packageSidebar("Healthcheck Next.js", "packages/healthcheck/next"),
            packageSidebar("Healthcheck Prometheus", "packages/healthcheck/prometheus"),
            packageSidebar("Healthcheck OpenTelemetry", "packages/healthcheck/otel"),
            packageSidebar("Healthcheck Payload", "packages/healthcheck/payload"),
            packageSidebar("Payload Fields", "packages/payload-fields"),
            packageSidebar("Payload Editor", "packages/payload-editor"),
            packageSidebar("Payload Schema", "packages/payload-schema"),
          ],
        },
        {
          label: "Agents and community",
          items: [
            { label: "Agent skills", slug: "agents" },
            { label: "Install skills", slug: "agents/install" },
            { label: "Support", slug: "community/support" },
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
