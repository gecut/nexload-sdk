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

      if (value == undefined) {
        if (variable?.default) {
          globalThis.envFirstLogging &&
            logger.warn(
              { package: "@nexload-sdk/env", key },
              `'${key}' not exists and default: ${variable.default}`
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
            `is '${typeof value}', but must 'number'`
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
    let variable = (process.env[key as string] ||
      variableOptions?.default) as EnvReturnType<TVariables[TKey]>;

    if (variableOptions?.type === "number")
      variable = Number(variable) as EnvReturnType<TVariables[TKey]>;

    if (variableOptions?.type === "boolean")
      variable = (variable === "true") as EnvReturnType<TVariables[TKey]>;

    if (variableOptions?.type === "string")
      variable = String(variable) as EnvReturnType<TVariables[TKey]>;

    this.env.set(String(key), variable);

    return variable;
  }
}

export * from "./merge";
