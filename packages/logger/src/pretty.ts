const COLORS: Record<string, number> = {
  trace: 90, debug: 36, info: 34, success: 32, warn: 33, error: 31, fatal: 35,
};

export function createPrettyStream(write: (text: string) => void): { write(line: string): void } {
  return {
    write(line) {
      const record = JSON.parse(line) as Record<string, unknown>;
      const { time, level, service, msg, err, ...fields } = record;
      const date = new Date(String(time));
      const clock = Number.isNaN(date.getTime()) ? '--:--:--' : date.toTimeString().slice(0, 8);
      const label = String(level ?? '').toUpperCase();
      const color = COLORS[String(level)];
      const formattedLevel = process.stdout.isTTY && color ? `\u001b[${color}m${label}\u001b[0m` : label;
      const values = Object.entries(fields).map(([key, value]) => `${key}=${typeof value === 'string' ? value : JSON.stringify(value)}`);
      let output = [clock, formattedLevel, service, msg, ...values].filter((part) => part !== undefined && part !== '').join(' ');

      if (err && typeof err === 'object') {
        const error = err as { type?: unknown; message?: unknown; stack?: unknown };
        output += ` ${String(error.type ?? 'Error')}: ${String(error.message ?? '')}`;
        if (typeof error.stack === 'string') {
          const lines = error.stack.split('\n');
          output += `\n${lines.slice(1).join('\n')}`;
        }
      }
      write(`${output}\n`);
    },
  };
}
