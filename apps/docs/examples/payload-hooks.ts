import { auditPlugin } from "@nexload-sdk/payload-hooks";

export const audit = auditPlugin({ collections: ["orders"] });
