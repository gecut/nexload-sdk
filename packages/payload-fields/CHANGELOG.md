# @nexload-sdk/payload-fields

## 3.0.0

### Major Changes

- 19ae881: Rebuild Payload field factories around managed Unicode slugs, Jalali dates, integer minor-unit money values, and server-side slug generation. Month-only Jalali selections now persist the first Jalali day of the selected month at canonical local noon. Slug generation rejects malformed or inherited registry keys, and locked slugs retain their prior value when a source is cleared with null. Documented `./slug`, `./date`, and `./money` server subpaths now ship executable ESM and CommonJS outputs.

## 2.0.1

### Patch Changes

- 3dd0f8c: Rebuild HealthCheck Package

## 2.0.0

### Major Changes

- 8e2ccd3: rebuild all with ai

## 1.0.6

### Patch Changes

- 375efd2: update deps and rebuild

## 1.0.5

### Patch Changes

- 45f667b: rebuild bundler

## 1.0.4

### Patch Changes

- 4cd35f4: update deps

## 1.0.3

### Patch Changes

- b48c35b: update deps

## 1.0.2

### Patch Changes

- 3367298: fix export paths

## 1.0.1

### Patch Changes

- 453828a: fix export path

## 1.0.0

### Major Changes

- a3a7a72: update
