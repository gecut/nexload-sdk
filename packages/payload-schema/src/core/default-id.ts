import { z } from "zod";

export const defaultIdSchema = z.union([
  z.string().min(1),
  z.number().int()
    .safe()
]);
export type DefaultIdSchema = typeof defaultIdSchema;
