import { EnvDefinition, UnionToIntersection } from "./types";

export function merge<
  const T extends readonly Record<string, EnvDefinition>[]
> (...args: T): UnionToIntersection<T[number]> {
  return args.reduce(
    (
      p, c
    ) => ({ ...p, ...c, }), {} as T
  ) as UnionToIntersection<T[number]>;
}
