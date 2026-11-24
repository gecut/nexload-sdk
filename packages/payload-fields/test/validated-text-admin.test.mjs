import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Stub only the UI module: its Node entry loads browser-only CSS.
const stub = 'data:text/javascript,' + encodeURIComponent('export function DefaultCell() {}');
const cellSource = readFileSync(new URL('../dist/admin/formatted-cell.js', import.meta.url), 'utf8')
  .replace('"@payloadcms/ui"', JSON.stringify(stub))
  .replace('"@nexload-sdk/persian/bank"', JSON.stringify(import.meta.resolve('@nexload-sdk/persian/bank')))
  .replace('"@nexload-sdk/persian/mobile"', JSON.stringify(import.meta.resolve('@nexload-sdk/persian/mobile')))
  .replace('"react/jsx-runtime"', JSON.stringify(import.meta.resolve('react/jsx-runtime')));
const { FormattedCell } = await import('data:text/javascript,' + encodeURIComponent(cellSource));

test('formatted cell forwards link and click props to DefaultCell', () => {
  const onClick = () => {};
  const props = { cellData: '09123456789', kind: 'mobile', link: true, linkURL: '/record', onClick, rowData: { id: 1 }, field: { name: 'phone', type: 'text' }, collectionSlug: 'users' };
  const element = FormattedCell(props);
  assert.equal(element.type.name, 'DefaultCell');
  assert.equal(element.props.link, true);
  assert.equal(element.props.linkURL, '/record');
  assert.equal(element.props.onClick, onClick);
  assert.equal(element.props.rowData, props.rowData);
  assert.notEqual(element.props.cellData, props.cellData);
  assert.equal(FormattedCell({ ...props, cellData: null }).props.cellData, '—');
});

test('label targets Payload input id for nested paths', () => {
  const source = readFileSync(new URL('../src/admin/validated-text-field.tsx', import.meta.url), 'utf8');
  assert.match(source, /htmlFor=\{`field-\$\{path\.replace\(\/\\\.\/g, "__"\)\}`\}/);
});
