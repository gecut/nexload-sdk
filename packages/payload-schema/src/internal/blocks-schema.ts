import { z } from "zod";

import type { AnyCanonicalSchema } from "../core/types.js";
import type { BlockSeed } from "./field-definition.js";

export type BuildBlocksSchemaOptions = {
  minRows?: number
  maxRows?: number
  nullable?: boolean
};

export function buildBlocksSchema (
  blocks: ReadonlyArray<BlockSeed>,
  options: BuildBlocksSchemaOptions = {}
): AnyCanonicalSchema {
  const blockSchemas = blocks.map((block) => {
    const shape = Object.fromEntries(
      block.children.map(([
        name,
        child
      ]) => [
        name,
        child.schema as AnyCanonicalSchema
      ])
    ) as Record<string, AnyCanonicalSchema>;

    return z.strictObject({
      blockType: z.literal(block.slug),
      ...shape,
      id: z.string().optional(),
      blockName: z.string().nullable().optional(),
    });
  });

  const union = z.discriminatedUnion(
    "blockType",
    blockSchemas as unknown as [
      z.ZodObject<Record<string, AnyCanonicalSchema>>,
      ...z.ZodObject<Record<string, AnyCanonicalSchema>>[]
    ]
  );
  let arraySchema = z.array(union);

  if (options.minRows !== undefined) arraySchema = arraySchema.min(options.minRows);
  if (options.maxRows !== undefined) arraySchema = arraySchema.max(options.maxRows);

  return options.nullable ? arraySchema.nullable() : arraySchema;
}
