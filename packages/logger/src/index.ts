import { createGlobalLogger } from "./utils/create-global";

const logger = createGlobalLogger();

new Promise(async () => {
  (await import("./log-test")).test(logger);
});

export * from "./logger";
export * from "./types";
export default logger;
