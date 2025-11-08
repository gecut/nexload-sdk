import { BaseLogger } from "../logger";
import { EnvSchema, EnvReturnType } from "./types";

export class EnvManager<TVariables extends EnvSchema> extends BaseLogger {
  protected env = new Map<string, string | number | boolean>();

  constructor (
    serviceName: string,
    protected readonly variables: TVariables
  ) {
    super(serviceName);

    this.validate();
    this.load();
  }

  protected validate () {
    const keys = Object.keys(this.variables);

    for (const key of keys) {
      const variable = this.variables[key];
      const value = process.env[key];

      if (value == undefined) {
        if (variable?.default) {
          this.log(
            "warn", `'${key}' not exists and default:`, variable.default
          );
        } else {
          this.log(
            "error", `'${key}' not exists and not have defaults`
          );
        }

        continue;
      }

      if (variable?.type === "number" && isNaN(Number(value))) {
        this.log(
          "warn", `is '${typeof value}', but must 'number'`
        );

        continue;
      }

      if (
        variable?.type === "boolean"
        && value !== "true"
        && value !== "false"
      ) {
        this.log(
          "warn", `'${key}' should be boolean ('true' or 'false')`
        );

        continue;
      }

      this.log(
        "success", `'${key}' successfully loaded`
      );
    }
  }

  public load () {
    const keys = Object.keys(this.variables);

    for (const key of keys) {
      this.$(
        key, false
      );
    }

    this.env.set(
      "SERVICE_NAME", this.serviceName
    );
  }

  public $<TKey extends keyof TVariables>(
    key: TKey,
    cache = true
  ): EnvReturnType<TVariables[TKey]> {
    if (cache && this.env.has(String(key))) {
      return this.env.get(String(key)) as EnvReturnType<TVariables[TKey]>;
    }

    const variableOptions = this.variables[key];
    let variable = (process.env[key as string]
      || variableOptions?.default) as EnvReturnType<TVariables[TKey]>;

    if (variableOptions?.type === "number")
      variable = Number(variable) as EnvReturnType<TVariables[TKey]>;

    if (variableOptions?.type === "boolean")
      variable = (variable === "true") as EnvReturnType<TVariables[TKey]>;

    if (variableOptions?.type === "string")
      variable = String(variable) as EnvReturnType<TVariables[TKey]>;

    this.env.set(
      String(key), variable
    );

    return variable;
  }
}

export * from "./merge";
