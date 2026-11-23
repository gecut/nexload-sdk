import type { LogEntry, Logger, LoggerOptions } from "./types";

import { createPinoLogger } from "./config";

export function createTestLogger(options: Partial<LoggerOptions> = {}): {
  logger: Logger;
  entries: LogEntry[];
  clear(): void;
} {
  const entries: LogEntry[] = [];
  const logger = createPinoLogger({
    ...options,
    destination: {
      write(line) {
        entries.push(JSON.parse(line) as LogEntry);
      },
    },
  });

  return {
    logger,
    entries,
    clear() {
      entries.length = 0;
    },
  };
}
