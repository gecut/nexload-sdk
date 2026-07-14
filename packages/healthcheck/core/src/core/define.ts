import type {
  HealthCheckDefinition,
  MetricCollectorDefinition
} from "./types";

export function defineHealthCheck<TName extends string> (definition: HealthCheckDefinition<TName>): HealthCheckDefinition<TName> {
  return { ...definition, kind: "check", };
}

export function defineMetricCollector<TName extends string> (definition: MetricCollectorDefinition<TName>): MetricCollectorDefinition<TName> {
  return { ...definition, kind: "collector", };
}
