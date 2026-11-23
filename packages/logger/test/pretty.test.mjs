import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

function run(code, env = {}) {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `import { configureLogger } from './dist/index.mjs'; ${code}`], { cwd: new URL('..', import.meta.url), env: { ...process.env, ...env }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);

  return result.stdout;
}

test('formats level, service and message without ANSI on a non-TTY', () => {
  const output = run(`configureLogger({ service: 'shop', pretty: true }).info({ orderId: 42 }, 'Order placed')`);
  assert.match(output, /^\d\d:\d\d:\d\d INFO shop Order placed .*orderId=42/m);
  assert.equal(output.includes(String.fromCharCode(27)), false);
});

test('prints error type, message and stack', () => {
  const output = run(`configureLogger({ service: 'shop', pretty: true }).error({ err: new TypeError('broken') }, 'Failed')`);
  assert.match(output, /TypeError: broken/);
  assert.match(output, /\n\s+at /);
});

test('production defaults to JSON', () => {
  const output = run(`configureLogger({ service: 'shop' }).info('ready')`, { NODE_ENV: 'production' });
  assert.equal(JSON.parse(output).msg, 'ready');
});
