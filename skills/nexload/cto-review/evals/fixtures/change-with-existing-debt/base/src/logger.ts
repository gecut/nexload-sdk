// Legacy file in base revision from 2024
export class Logger {
  // Legacy technical debt: loose `any` types and mutable global singleton
  private static globalInstance: any;
  public metadata: any = {};

  log(msg: any): void {
    console.log(msg, this.metadata);
  }
}
