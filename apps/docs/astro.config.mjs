import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://gecut.github.io",
  base: "/nexload-sdk",
  integrations: [
    starlight({
      title: "Nexload SDK",
      description: "Production healthcheck and monitoring SDK documentation.",
      sidebar: [
        {
          label: "Start",
          items: [
            { label: "Landing", slug: "" },
            { label: "Getting started", slug: "getting-started" }
          ]
        },
        {
          label: "Concepts",
          items: [
            { label: "Scopes", slug: "concepts/liveness-readiness-startup" },
            { label: "Checks vs collectors", slug: "concepts/checks-vs-collectors" },
            { label: "Status model", slug: "concepts/status-model" }
          ]
        },
        {
          label: "Guides",
          items: [
            { label: "Node service", slug: "guides/node-service" },
            { label: "Bun service", slug: "guides/bun-service" },
            { label: "Next.js route handlers", slug: "guides/nextjs-route-handlers" },
            { label: "Payload", slug: "guides/payload-healthcheck" },
            { label: "Docker and Kubernetes", slug: "guides/docker-kubernetes-dokploy" },
            { label: "Prometheus/OpenMetrics", slug: "guides/prometheus-openmetrics" },
            { label: "OpenTelemetry", slug: "guides/opentelemetry" }
          ]
        },
        {
          label: "API",
          items: [
            { label: "Health manager", slug: "api/health-manager" },
            { label: "Check contract", slug: "api/check-contract" },
            { label: "Runtime adapter", slug: "api/runtime-adapter" },
            { label: "Exporters", slug: "api/exporters" }
          ]
        },
        {
          label: "Reference",
          items: [
            { label: "Result schema", slug: "reference/result-schema" },
            { label: "Error codes", slug: "reference/error-codes" },
            { label: "Metric names", slug: "reference/metric-names" },
            { label: "Security", slug: "reference/security" }
          ]
        },
        {
          label: "LLM",
          items: [
            { label: "Overview", slug: "llm/overview" },
            { label: "Agent skills", slug: "llm/agent-skills" }
          ]
        }
      ]
    })
  ]
});
