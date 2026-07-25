import { assertSafeSegment, isRecord } from "./validation.js";
import { CMS_OPERATION_SYMBOL } from "../internal/symbols.js";

import type {
  CMSOperationContract,
  CMSOperationsTree
} from "./types.js";

export interface FlattenedCMSOperation {
  readonly definition: CMSOperationContract
  readonly name: string
  readonly path: string
  readonly segments: readonly string[]
}

export function isCMSOperation (value: unknown): value is CMSOperationContract {
  return (
    isRecord(value)
    && value[CMS_OPERATION_SYMBOL] === true
    && isRecord(value.input)
    && typeof value.input.safeParseAsync === "function"
    && isRecord(value.output)
    && typeof value.output.safeParseAsync === "function"
    && isRecord(value.errors)
  );
}

export function flattenCMSOperations (
  operations: CMSOperationsTree,
  basePath = "/operations"
): readonly FlattenedCMSOperation[] {
  const normalizedBasePath = normalizeBasePath(basePath);
  const flattened: FlattenedCMSOperation[] = [];
  const paths = new Set<string>();

  visitTree(
    operations, [], normalizedBasePath, flattened, paths
  );

  if (flattened.length === 0) {
    throw new TypeError("Operations tree must contain at least one operation.");
  }

  return Object.freeze(flattened);
}

export function normalizeBasePath (basePath: string): string {
  if (typeof basePath !== "string" || basePath.length === 0) {
    throw new TypeError("Operation base path must be a non-empty string.");
  }

  const normalized = `/${basePath.replace(
    /^\/+|\/+$/g, ""
  )}`;
  const segments = normalized.slice(1).split("/");

  for (const segment of segments) {
    assertSafeSegment(segment);
  }

  return normalized;
}

function visitTree (
  node: CMSOperationsTree,
  parentSegments: readonly string[],
  basePath: string,
  flattened: FlattenedCMSOperation[],
  paths: Set<string>
): void {
  if (!isRecord(node)) {
    throw new TypeError("Operations namespace must be an object.");
  }

  const entries = Object.entries(node);
  if (entries.length === 0) {
    throw new TypeError("Operations namespace must not be empty.");
  }

  for (const [
    segment,
    value
  ] of entries) {
    assertSafeSegment(segment);
    const segments = [
      ...parentSegments,
      segment
    ];

    if (isCMSOperation(value)) {
      const path = `${basePath}/${segments.join("/")}`;

      if (paths.has(path)) {
        throw new TypeError(`Duplicate operation path: ${path}`);
      }

      paths.add(path);
      flattened.push(Object.freeze({
        definition: value,
        name: segments.join("."),
        path,
        segments: Object.freeze(segments),
      }));
      continue;
    }

    if (!isRecord(value)) {
      throw new TypeError(`Invalid operation leaf: ${segments.join(".")}`);
    }

    visitTree(
      value as CMSOperationsTree, segments, basePath, flattened, paths
    );
  }
}
