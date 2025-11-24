import { LogRendererFunc, isBrowser, isNode } from "@/types";

export const nodePureJsonRenderer: LogRendererFunc = (line) => {
  if (isBrowser() || !isNode()) return;

  process.stdout.write(JSON.stringify(line) + "\n");
};
