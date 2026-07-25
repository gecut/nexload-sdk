import { isRecord } from "../contract/validation.js";

export function getTreeValue (
  tree: unknown,
  segments: readonly string[]
): unknown {
  let current = tree;

  for (const segment of segments) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

export function assertTreeLeaves (
  tree: unknown,
  expectedNames: ReadonlySet<string>,
  label: string,
  allowMissing: boolean
): void {
  if (!isRecord(tree)) {
    throw new TypeError(`${label} tree must be an object.`);
  }

  const actualNames = new Set<string>();
  collectLeaves(
    tree, [], actualNames, label
  );

  for (const name of actualNames) {
    if (!expectedNames.has(name)) {
      throw new TypeError(`Unknown ${label} leaf: ${name}`);
    }
  }

  if (!allowMissing) {
    for (const name of expectedNames) {
      if (!actualNames.has(name)) {
        throw new TypeError(`Missing ${label} leaf: ${name}`);
      }
    }
  }
}

function collectLeaves (
  node: Record<PropertyKey, unknown>,
  parentSegments: readonly string[],
  names: Set<string>,
  label: string
): void {
  for (const [
    segment,
    value
  ] of Object.entries(node)) {
    const segments = [
      ...parentSegments,
      segment
    ];

    if (typeof value === "function") {
      names.add(segments.join("."));
      continue;
    }

    if (!isRecord(value)) {
      throw new TypeError(`Invalid ${label} leaf: ${segments.join(".")}`);
    }

    collectLeaves(
      value, segments, names, label
    );
  }
}
