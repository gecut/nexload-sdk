# @nexload-sdk/config-loader

Production-grade asynchronous configuration parser.

## Architecture Guarantees
- Completely non-blocking, asynchronous disk and network I/O.
- Validates all input schemas at runtime using robust error boundaries.
- Never throws unhandled exceptions during configuration loading.
