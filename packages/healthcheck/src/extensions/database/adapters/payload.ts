import { DatabaseClientAdapter } from "../adapters/base";

import type { Payload, FindArgs } from "payload";

export class PayloadAdapter implements DatabaseClientAdapter {
  constructor (
    private readonly payload: Payload,
    private readonly query: FindArgs
  ) {}

  async ping (): Promise<number> {
    const start = performance.now();
    await this.payload.find(this.query);
    return performance.now() - start;
  }
}
