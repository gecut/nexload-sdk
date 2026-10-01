import logger from "@nexload-sdk/logger";
import { EnvSchema, EnvReturnType } from "./types";

declare global {
  var envFirstLogging: boolean;
}

if (globalThis.envFirstLogging == null) {
  globalThis.envFirstLogging = false;
}

export class EnvManager<TVariables extends EnvSchema> {
  protected env = new Map<string, string | number | boolean>();

  constructor(protected readonly variables: TVariables) {
    this.validate();
    this.load();
  }

  protected validate() {
    const keys = Object.keys(this.variables);

    for (const key of keys) {
      const variable = this.variables[key];
      const value = process.env[key];
      const hasDefault = this.hasDefault(variable);

      if (value == undefined) {
        if (hasDefault) {
          globalThis.envFirstLogging &&
            logger.warn(
              { package: "@nexload-sdk/env", key },
              `'${key}' not exists and default: ${String(variable.default)}`
            );
        } else {
          globalThis.envFirstLogging &&
            logger.error(
              { package: "@nexload-sdk/env", key },
              `'${key}' not exists and not have defaults`
            );
        }

        continue;
      }

      if (variable?.type === "number" && isNaN(Number(value))) {
        globalThis.envFirstLogging &&
          logger.warn(
            {
              package: "@nexload-sdk/env",
              key,
              value,
              valueType: typeof value,
            },
            `is '${typeof value}', but must 'number'`
          );

        continue;
      }

      if (
        variable?.type === "boolean" &&
        value !== "true" &&
        value !== "false"
      ) {
        globalThis.envFirstLogging &&
          logger.warn(
            {
              package: "@nexload-sdk/env",
              key,
              value,
              valueType: typeof value,
            },
            `is '${typeof value}', but must 'boolean'`
          );

        continue;
      }

      globalThis.envFirstLogging &&
        logger.success(
          { package: "@nexload-sdk/env", key, value, valueType: typeof value },
          "env successfully loaded"
        );
    }
  }

  public load() {
    const keys = Object.keys(this.variables);

    for (const key of keys) {
      this.$(key, false);
    }
  }

  public $<TKey extends keyof TVariables>(
    key: TKey,
    cache = true
  ): EnvReturnType<TVariables[TKey]> {
    if (cache && this.env.has(String(key))) {
      return this.env.get(String(key)) as EnvReturnType<TVariables[TKey]>;
    }

    const variableOptions = this.variables[key];
    const envValue = process.env[key as string];
    const hasDefault = this.hasDefault(variableOptions);
    let rawValue = (envValue ?? (hasDefault ? variableOptions.default : undefined)) as
      | string
      | number
      | boolean
      | undefined;

    if (envValue !== undefined) {
      if (
        variableOptions?.type === "number" &&
        Number.isNaN(Number(envValue)) &&
        hasDefault
      ) {
        rawValue = variableOptions.default as string | number | boolean;
      }

      if (
        variableOptions?.type === "boolean" &&
        envValue !== "true" &&
        envValue !== "false" &&
        hasDefault
      ) {
        rawValue = variableOptions.default as string | number | boolean;
      }
    }

    let variable = rawValue as EnvReturnType<TVariables[TKey]>;

    if (variableOptions?.type === "number")
      variable = Number(variable) as EnvReturnType<TVariables[TKey]>;

    if (variableOptions?.type === "boolean")
      variable = (variable === "true") as EnvReturnType<TVariables[TKey]>;

    if (variableOptions?.type === "string")
      variable = String(variable) as EnvReturnType<TVariables[TKey]>;

    this.env.set(String(key), variable);

    return variable;
  }

  protected hasDefault(
    variable?: { default?: unknown } | null
  ): variable is { default: unknown } {
    if (variable == null) return false;
    return Object.prototype.hasOwnProperty.call(variable, "default");
  }
}

export * from "./merge";
