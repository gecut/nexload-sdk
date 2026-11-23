import { getLogContext, newTraceId } from "./context.node";

export const TRACE_HEADER = "x-trace-id";
const VALID_TRACE_ID = /^[A-Za-z0-9-]{8,64}$/;

type HeaderRecord = Record<string, string | undefined>;

function isHeaders(headers: Headers | HeaderRecord): headers is Headers {
  return typeof headers.get === "function";
}

export function resolveTraceId(headers: Headers | HeaderRecord): string {
  const id = isHeaders(headers) ? headers.get(TRACE_HEADER) : headers[TRACE_HEADER];

  return id && VALID_TRACE_ID.test(id) ? id : newTraceId();
}

export function traceHeaders(): Record<string, string> {
  const { traceId } = getLogContext();

  return typeof traceId === "string" && traceId
    ? { [TRACE_HEADER]: traceId }
    : {};
}
