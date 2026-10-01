/* eslint-disable @typescript-eslint/no-explicit-any */
export type EnvSchema = Record<string, EnvDefinition>;
export type EnvPreset = EnvSchema;

export type EnvDefinition = {
  default?: unknown
  type: "number" | "string" | "boolean"
};

export type EnvReturnType<T extends EnvDefinition> = T["type"] extends "boolean"
  ? boolean
  : T["type"] extends "number"
    ? number
    : string;

export type UnionToIntersection<U> = (
  U extends any ? (x: U) => any : never
) extends (x: infer R) => any
  ? R
  : never;
