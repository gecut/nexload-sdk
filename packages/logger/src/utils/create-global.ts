import { NexloadLogger } from "@/logger";
import { browserPrettyRenderer } from "@/renderers/browser-pretty";
import { browserPureRenderer } from "@/renderers/browser-pure";
import { nodePrettyRenderer } from "@/renderers/node-pretty";
import { nodePureJsonRenderer } from "@/renderers/node-pure-json";
import { isBrowser, LogLevel, LogRenderer } from "@/types";

const getServiceName = (): string =>
  (isBrowser()
    ? localStorage.getItem("$SERVICE_NAME")
    : process.env.SERVICE_NAME) || "unknown";

const getLogLevel = (): LogLevel =>
  ((isBrowser() ? localStorage.getItem("$LOG_LEVEL") : process.env.LOG_LEVEL) ||
    "WARN") as LogLevel;

const getProduction = () => {
  if (isBrowser()) {
    return localStorage.getItem("$DEBUG") !== "1";
  }

  if (process.env.DEBUG === "true") {
    return false;
  }

  return process.env.NODE_ENV === "production";
};

const getRenderer = (): LogRenderer => {
  const isProduction = getProduction();

  if (isProduction) {
    return {
      browser: browserPureRenderer.bind(null),
      node: nodePureJsonRenderer.bind(null),
    };
  }

  return {
    browser: browserPrettyRenderer.bind(null),
    node: nodePrettyRenderer.bind(null),
  };
};

export const createGlobalLogger = () =>
  new NexloadLogger(getServiceName(), getLogLevel(), getRenderer());
