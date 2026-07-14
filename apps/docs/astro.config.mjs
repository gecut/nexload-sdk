import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightThemeFlexoki from "starlight-theme-flexoki";

const docsBase = "/nexload-sdk";

export default defineConfig({
  site: "https://gecut.github.io",
  base: docsBase,
  redirects: {
    "/getting-started/": `${docsBase}/start/choose-a-package/`,
    "/concepts/liveness-readiness-startup/": `${docsBase}/packages/healthcheck/concepts/scopes/`,
    "/concepts/checks-vs-collectors/": `${docsBase}/packages/healthcheck/concepts/checks-and-collectors/`,
    "/concepts/status-model/": `${docsBase}/packages/healthcheck/concepts/reports-and-status/`,
    "/guides/node-service/": `${docsBase}/packages/healthcheck/guides/node/`,
    "/guides/bun-service/": `${docsBase}/packages/healthcheck/guides/bun/`,
    "/guides/nextjs-route-handlers/": `${docsBase}/packages/healthcheck/guides/nextjs/`,
    "/guides/docker-kubernetes-dokploy/": `${docsBase}/packages/healthcheck/guides/operations/`,
    "/guides/payload-healthcheck/": `${docsBase}/packages/healthcheck/guides/payload/`,
    "/guides/prometheus-openmetrics/": `${docsBase}/packages/healthcheck/guides/exporters/`,
    "/guides/opentelemetry/": `${docsBase}/packages/healthcheck/guides/exporters/`,
    "/api/health-manager/": `${docsBase}/packages/healthcheck/reference/api/`,
    "/api/check-contract/": `${docsBase}/packages/healthcheck/guides/custom-checks/`,
    "/api/runtime-adapter/": `${docsBase}/packages/healthcheck/reference/api/`,
    "/api/exporters/": `${docsBase}/packages/healthcheck/guides/exporters/`,
    "/reference/result-schema/": `${docsBase}/packages/healthcheck/concepts/reports-and-status/`,
    "/reference/error-codes/": `${docsBase}/packages/healthcheck/reference/api/`,
    "/reference/metric-names/": `${docsBase}/packages/healthcheck/guides/exporters/`,
    "/reference/security/": `${docsBase}/packages/healthcheck/guides/operations/`,
    "/payload-fields/": `${docsBase}/packages/payload-fields/`,
    "/payload-fields/slug/": `${docsBase}/packages/payload-fields/slug/`,
    "/payload-fields/jalali-date/": `${docsBase}/packages/payload-fields/jalali-dates/`,
    "/payload-fields/money/": `${docsBase}/packages/payload-fields/money/`,
    "/payload-fields/migration/": `${docsBase}/packages/payload-fields/migration/`,
    "/llm/overview/": `${docsBase}/agents/`,
    "/llm/agent-skills/": `${docsBase}/agents/install/`,
  },
  integrations: [
    starlight({
      title: "Nexload SDK",
      description: "Production package documentation for Nexload SDK.",
      customCss: ["./src/styles/docs.css"],
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/gecut/nexload-sdk" }],
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
            {
              label: "Healthcheck",
              items: [{ autogenerate: { directory: "packages/healthcheck" } }],
            },
            {
              label: "Payload Fields",
              items: [{ autogenerate: { directory: "packages/payload-fields" } }],
            },
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
