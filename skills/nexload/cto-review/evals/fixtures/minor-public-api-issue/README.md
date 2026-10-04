# @nexload-sdk/header-signer

Deterministic header signer with private secret options.

## Usage
```ts
import { HeaderSigner } from "@nexload-sdk/header-signer";
const signer = new HeaderSigner({ secretKey: "secret" });
const signature = signer.sign("data");
```
