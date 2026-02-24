import { NexloadLogger } from "@/logger";
import { browserPrettyRenderer } from "@/renderers/browser-pretty";
import { browserPureRenderer } from "@/renderers/browser-pure";
import { nodePrettyRenderer } from "@/renderers/node-pretty";
import { nodePureJsonRenderer } from "@/renderers/node-pure-json";
import { isBrowser, levelPriorities, LogLevel, LogRenderer } from "@/types";

const safeLocalStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const getServiceName = (): string =>
  (isBrowser()
    ? safeLocalStorageGet("$SERVICE_NAME")
    : process.env.SERVICE_NAME) || "unknown";

const getLogLevel = (): LogLevel => {
  const raw = (
    isBrowser() ? safeLocalStorageGet("$LOG_LEVEL") : process.env.LOG_LEVEL
  ) ?? "WARN";

  const normalized = raw.toUpperCase() as LogLevel;

  return normalized in levelPriorities ? normalized : "WARN";
};

const getProduction = () => {
  if (isBrowser()) {
    return safeLocalStorageGet("$DEBUG") !== "1";
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
