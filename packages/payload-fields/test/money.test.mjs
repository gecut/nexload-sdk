import assert from 'node:assert/strict';
import test from 'node:test';
import { moneyField } from '../dist/money/index.js';
import { messages } from '../dist/i18n/messages.js';

test('string input is normalized server-side', async () => {
  const f = moneyField({ name: 'price', currency: 'IRT' });
  assert.equal(await f.hooks.beforeValidate.at(-1)({ value: '۱۲۳٬۴۵۶' }), 123456);
});
test('displayCurrency rules', () => {
  assert.throws(() => moneyField({ name: 'p', currency: 'IRT', displayCurrency: 'IRT' }));
  const f = moneyField({ name: 'p', currency: 'IRR', displayCurrency: 'IRT' });
  assert.equal(f.admin.components.Field.clientProps.displayCurrency, 'IRT');
  assert.equal(f.admin.components.Cell.path, '@nexload-sdk/payload-fields/admin/money-cell#MoneyCell');
});
test('English messages', () => {
  assert.equal(moneyField({ name: 'p', currency: 'IRT' }).validate(-1, { req: { i18n: { language: 'en' } } }), messages.en['money.negative']);
});

test('display currency uses resolved currency code', () => {
  assert.doesNotThrow(() => moneyField({ name: 'p', currency: { code: 'IRR', label: 'rial', fractionDigits: 0 }, displayCurrency: 'IRT' }));
  assert.throws(() => moneyField({ name: 'p', currency: { code: 'USD', label: 'dollar', fractionDigits: 2 }, displayCurrency: 'IRT' }), /Invalid money display currency\./);
  assert.throws(() => moneyField({ name: 'p', currency: { code: 'IRR', label: 'rial', fractionDigits: 0 }, displayCurrency: 'IRR' }), /Invalid money display currency\./);
});

test('cleared API input becomes null', async () => {
  const hook = moneyField({ name: 'p', currency: 'IRR' }).hooks.beforeValidate.at(-1);
  assert.equal(await hook({ value: '' }), null);
  assert.equal(await hook({ value: '  \t ' }), null);
});

const { readFileSync } = await import('node:fs');
const mockUI = 'data:text/javascript,' + encodeURIComponent(`
  export const FieldDescription = () => null, FieldError = () => null, FieldLabel = () => null, DefaultCell = () => null;
  export const useField = () => ({ value: globalThis.moneyTest.value, setValue: v => { globalThis.moneyTest.value = v; } });
`);
const mockReact = 'data:text/javascript,' + encodeURIComponent(`
  export const useState = initial => [globalThis.moneyTest.input ?? initial, v => { globalThis.moneyTest.input = v; }];
  export const useRef = initial => globalThis.moneyTest.ref ??= { current: initial };
  export const useEffect = fn => fn();
`);
function loadAdmin(name) {
  let source = readFileSync(new URL(`../dist/admin/${name}.js`, import.meta.url), 'utf8')
    .replaceAll('"@payloadcms/ui"', JSON.stringify(mockUI))
    .replaceAll('"react"', JSON.stringify(mockReact));
  source = source.replace(/from "([^".][^"]*)"/g, (match, specifier) => `from ${JSON.stringify(import.meta.resolve(specifier))}`);
  return import('data:text/javascript,' + encodeURIComponent(source));
}

test('admin preserves typed text, accepts exact tenths, formats on blur, and syncs external changes', async () => {
  globalThis.moneyTest = { value: 100 };
  const { MoneyFieldComponent } = await loadAdmin('money-field');
  const props = { path: 'price', field: {}, currency: { code: 'IRR', label: 'rial', fractionDigits: 0 }, displayCurrency: 'IRT', display: { digits: 'latin', grouping: true } };
  const render = () => MoneyFieldComponent(props).props.children[2];
  render();
  let input = render();
  input.props.onChange({ target: { value: '10.5' } });
  assert.equal(globalThis.moneyTest.value, 105);
  input = render();
  assert.equal(input.props.value, '10.5');
  input.props.onChange({ target: { value: '10.55' } });
  assert.equal(globalThis.moneyTest.value, '10.55');
  input = render();
  assert.equal(input.props.value, '10.55');
  input.props.onChange({ target: { value: '1000.5' } });
  input = render();
  input.props.onBlur();
  assert.equal(render().props.value, '1,000.5');
  globalThis.moneyTest.value = 200;
  render();
  assert.equal(render().props.value, '20');
});

test('money cell safely handles invalid and overflowing values', async () => {
  const { MoneyCell } = await loadAdmin('money-cell');
  const props = { currency: { code: 'IRT', label: 'toman', fractionDigits: 0 }, displayCurrency: 'IRR', display: {} };
  for (const cellData of [1.5, Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER, NaN, Infinity]) {
    assert.equal(MoneyCell({ ...props, cellData }).props.cellData, '—');
  }
});
