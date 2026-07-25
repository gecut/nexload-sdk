# Client construction

Create a client from the same contract used by the server:

```ts
const cms = createCMSClient<Config, typeof operations>({
  operations,
  payload: {
    baseURL: "https://cms.example.com",
  },
});
```

When the live declarations expose a client `basePath`, set it to the same normalized value used by `createPayloadEndpoints`. Do not append a query or hash to `baseURL`.

`cms.payload` remains the exact public `PayloadSDK<Config>` instance. `cms.operations` is a real immutable tree mirroring the contract, not a dynamic proxy. TypeScript cannot partially infer generic arguments, so supplying `Config` requires the operation type argument as well.

Operation call options omit `method` and `body`; the package owns both.
