import { nexloadConfig } from "./factory.js";

export { default as base, baseConfig } from "./base.js";
export { baseConfig as config } from "./base.js";
export { nexloadConfig, type NexloadConfigOptions } from "./factory.js";
export { default as nextjs, nextJsConfig } from "./nextjs.js";
export { default as node, nodeConfig } from "./node.js";
export { default as payload, payloadConfig } from "./payload.js";
export { default as react, reactConfig } from "./react.js";

export default nexloadConfig;
